import { Controller, Get, Patch, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser, CurrentUserData } from '../../common/decorators';
import { UpdateUserDto } from './dto/update-user.dto';
import { BecomeSellerDto } from './dto/become-seller.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: CurrentUserData) {
    return this.usersService.findById(user.id);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, dto);
  }

  @Post('become-seller')
  async becomeSeller(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: BecomeSellerDto,
  ) {
    return this.usersService.becomeSeller(user.id, dto);
  }

  @Get('seller/stats')
  async getSellerStats(@CurrentUser() user: CurrentUserData) {
    return this.usersService.getSellerStats(user.id);
  }
}
