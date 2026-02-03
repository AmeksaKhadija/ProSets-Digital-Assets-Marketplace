import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssetsService } from '../assets/assets.service';
import { StripeService } from '../stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, AssetStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private assetsService: AssetsService,
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  async createOrder(buyerId: string, buyerEmail: string, dto: CreateOrderDto) {
    // Validate all assets exist and are active
    const assets = await Promise.all(
      dto.assetIds.map((id) => this.assetsService.findById(id)),
    );

    for (const asset of assets) {
      if (asset.status !== AssetStatus.ACTIVE) {
        throw new BadRequestException(`Asset "${asset.title}" is not available for purchase`);
      }

      if (asset.sellerId === buyerId) {
        throw new BadRequestException(`You cannot purchase your own asset "${asset.title}"`);
      }
    }

    // Check if user already purchased any of these assets
    const existingPurchases = await this.prisma.orderItem.findMany({
      where: {
        assetId: { in: dto.assetIds },
        order: {
          buyerId,
          status: OrderStatus.PAID,
        },
      },
    });

    if (existingPurchases.length > 0) {
      const purchasedAssetIds = existingPurchases.map((p) => p.assetId);
      const alreadyPurchased = assets.filter((a) => purchasedAssetIds.includes(a.id));
      throw new BadRequestException(
        `You already purchased: ${alreadyPurchased.map((a) => a.title).join(', ')}`,
      );
    }

    // Calculate totals (convert price from Decimal to cents)
    const subtotal = assets.reduce(
      (sum, asset) => sum + Math.round(Number(asset.price) * 100),
      0,
    );
    const platformFee = this.stripeService.calculatePlatformFee(subtotal);
    const total = subtotal;

    // Generate order number
    const orderNumber = `PRO-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        buyerId,
        subtotal,
        platformFee,
        total,
        status: OrderStatus.PENDING,
        items: {
          create: assets.map((asset) => {
            const priceInCents = Math.round(Number(asset.price) * 100);
            return {
              assetId: asset.id,
              assetTitle: asset.title,
              assetPrice: priceInCents,
              sellerId: asset.sellerId,
              sellerAmount: this.stripeService.calculateSellerAmount(priceInCents),
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            asset: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnailUrl: true,
              },
            },
          },
        },
      },
    });

    // Create Stripe checkout session
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const session = await this.stripeService.createCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: assets.map((asset) => ({
        assetId: asset.id,
        assetTitle: asset.title,
        price: Math.round(Number(asset.price) * 100),
        sellerId: asset.sellerId,
      })),
      customerEmail: buyerEmail,
      successUrl: `${frontendUrl}/dashboard/buyer/purchases?success=true`,
      cancelUrl: `${frontendUrl}/checkout?canceled=true`,
    });

    return {
      order,
      checkoutUrl: session.url,
    };
  }

  async findByBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            asset: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnailUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            asset: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnailUrl: true,
                sourceFileName: true,
                sourceFileSize: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  async getPurchasedAssets(buyerId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        buyerId,
        status: OrderStatus.PAID,
      },
      include: {
        items: {
          include: {
            asset: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnailUrl: true,
                sourceFileName: true,
                sourceFileSize: true,
                sourceFileType: true,
              },
            },
          },
        },
      },
    });

    // Flatten to unique assets
    const assetsMap = new Map();
    for (const order of orders) {
      for (const item of order.items) {
        if (item.asset && !assetsMap.has(item.asset.id)) {
          assetsMap.set(item.asset.id, {
            ...item.asset,
            purchasedAt: order.paidAt,
          });
        }
      }
    }

    return Array.from(assetsMap.values());
  }

  async hasPurchased(buyerId: string, assetId: string): Promise<boolean> {
    const purchase = await this.prisma.orderItem.findFirst({
      where: {
        assetId,
        order: {
          buyerId,
          status: OrderStatus.PAID,
        },
      },
    });

    return !!purchase;
  }

  async getSellerOrders(sellerId: string) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { sellerId },
      orderBy: { order: { createdAt: 'desc' } },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            createdAt: true,
            paidAt: true,
            buyer: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        asset: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    return orderItems;
  }
}
