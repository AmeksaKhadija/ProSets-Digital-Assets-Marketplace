import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

export interface CheckoutItem {
  assetId: string;
  assetTitle: string;
  price: number; // in cents
  sellerId: string;
}

export interface CreateCheckoutSessionParams {
  orderId: string;
  orderNumber: string;
  items: CheckoutItem[];
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private webhookSecret: string;
  private platformFeePercent: number;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
      { apiVersion: '2023-10-16' },
    );
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    this.platformFeePercent = this.configService.get<number>('STRIPE_PLATFORM_FEE_PERCENT') || 15;
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
    const { orderId, orderNumber, items, customerEmail, successUrl, cancelUrl } = params;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.assetTitle,
          metadata: {
            assetId: item.assetId,
            sellerId: item.sellerId,
          },
        },
        unit_amount: item.price, // already in cents
      },
      quantity: 1,
    }));

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: customerEmail,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        orderId,
        orderNumber,
      },
    });

    // Update order with Stripe session ID
    await this.prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    });

    return session;
  }

  async constructEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    // Check for duplicate event (idempotency)
    const existingEvent = await this.prisma.stripeEvent.findUnique({
      where: { stripeEventId: event.id },
    });

    if (existingEvent) {
      this.logger.log(`Event ${event.id} already processed`);
      return;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    // Record processed event
    await this.prisma.stripeEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
      },
    });
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      this.logger.error('No orderId in session metadata');
      return;
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      this.logger.error(`Order ${orderId} not found`);
      return;
    }

    // Update order status to PAID
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
        paidAt: new Date(),
        stripePaymentIntentId: session.payment_intent as string,
      },
    });

    // Increment sales count for each asset
    await Promise.all(
      order.items.map((item) =>
        this.prisma.asset.update({
          where: { id: item.assetId },
          data: { salesCount: { increment: 1 } },
        }),
      ),
    );

    this.logger.log(`Order ${order.orderNumber} marked as paid`);
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const order = await this.prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!order) {
      this.logger.warn(`Order not found for payment intent ${paymentIntent.id}`);
      return;
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.FAILED },
    });

    this.logger.log(`Order ${order.orderNumber} marked as failed`);
  }

  calculatePlatformFee(amount: number): number {
    return Math.round(amount * (this.platformFeePercent / 100));
  }

  calculateSellerAmount(amount: number): number {
    return amount - this.calculatePlatformFee(amount);
  }
}
