import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AssetsModule } from '../assets/assets.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [AssetsModule, StripeModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
