import { Module } from '@nestjs/common';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';
import { StorageModule } from '../storage/storage.module';
import { OrdersModule } from '../orders/orders.module';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [StorageModule, OrdersModule, AssetsModule],
  controllers: [DownloadsController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
