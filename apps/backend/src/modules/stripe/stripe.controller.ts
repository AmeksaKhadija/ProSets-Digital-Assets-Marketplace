import { Controller, Post, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { Public } from '../../common/decorators';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('webhook')
  @Public()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;

    if (!rawBody) {
      throw new Error('Raw body is required for webhook verification');
    }

    const event = await this.stripeService.constructEvent(rawBody, signature);
    await this.stripeService.handleWebhookEvent(event);

    return { received: true };
  }
}
