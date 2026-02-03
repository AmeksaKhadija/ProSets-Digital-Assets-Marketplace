import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CurrentUser, CurrentUserData, Roles, UserRole } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(user.id, user.email, dto);
  }

  @Get()
  async getMyOrders(@CurrentUser() user: CurrentUserData) {
    return this.ordersService.findByBuyer(user.id);
  }

  @Get('purchased-assets')
  async getPurchasedAssets(@CurrentUser() user: CurrentUserData) {
    return this.ordersService.getPurchasedAssets(user.id);
  }

  @Get('seller')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async getSellerOrders(@CurrentUser() user: CurrentUserData) {
    return this.ordersService.getSellerOrders(user.id);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.ordersService.findById(id, user.id);
  }
}
