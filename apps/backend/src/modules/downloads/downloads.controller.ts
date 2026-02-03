import { Controller, Get, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { DownloadsService } from './downloads.service';
import { CurrentUser, CurrentUserData } from '../../common/decorators';

@Controller('downloads')
export class DownloadsController {
  constructor(private downloadsService: DownloadsService) {}

  @Get(':assetId')
  async getDownloadUrl(
    @Param('assetId') assetId: string,
    @CurrentUser() user: CurrentUserData,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.downloadsService.generateDownloadUrl(
      user.id,
      assetId,
      ipAddress,
      userAgent,
    );
  }

  @Get()
  async getHistory(@CurrentUser() user: CurrentUserData) {
    return this.downloadsService.getDownloadHistory(user.id);
  }

  @Get('stats/me')
  async getMyStats(@CurrentUser() user: CurrentUserData) {
    return this.downloadsService.getDownloadStats(user.id);
  }

  @Get('check/:assetId')
  async canDownload(
    @Param('assetId') assetId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const canDownload = await this.downloadsService.canDownload(user.id, assetId);
    return { canDownload };
  }
}
