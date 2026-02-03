import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser, CurrentUserData } from '../../common/decorators';
import { SyncUserDto } from './dto/sync-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sync')
  async syncUser(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: SyncUserDto,
  ) {
    return this.authService.syncUser(
      user.auth0Id,
      user.email,
      dto.name,
      dto.avatar,
    );
  }

  @Get('me')
  async getProfile(@CurrentUser() user: CurrentUserData) {
    return this.authService.getProfile(user.id);
  }
}
