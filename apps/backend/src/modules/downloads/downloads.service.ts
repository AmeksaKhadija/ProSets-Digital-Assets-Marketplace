import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { OrdersService } from '../orders/orders.service';
import { AssetsService } from '../assets/assets.service';

const PRESIGNED_URL_EXPIRY_SECONDS = 300; // 5 minutes

@Injectable()
export class DownloadsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private ordersService: OrdersService,
    private assetsService: AssetsService,
  ) {}

  async generateDownloadUrl(
    userId: string,
    assetId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Verify user has purchased this asset
    const hasPurchased = await this.ordersService.hasPurchased(userId, assetId);

    if (!hasPurchased) {
      throw new ForbiddenException('You have not purchased this asset');
    }

    // Get asset details
    const asset = await this.assetsService.findById(assetId);

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Generate presigned URL
    const { url, expiresAt } = await this.storageService.generatePresignedDownloadUrl(
      asset.sourceFileKey,
      PRESIGNED_URL_EXPIRY_SECONDS,
    );

    // Log the download
    await this.prisma.download.create({
      data: {
        userId,
        assetId,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    // Increment download count
    await this.assetsService.incrementDownloadCount(assetId);

    return {
      url,
      expiresAt,
      fileName: asset.sourceFileName,
      fileSize: asset.sourceFileSize,
      fileType: asset.sourceFileType,
    };
  }

  async getDownloadHistory(userId: string) {
    return this.prisma.download.findMany({
      where: { userId },
      orderBy: { downloadedAt: 'desc' },
      take: 50,
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
    });
  }

  async getDownloadStats(userId: string) {
    const [totalDownloads, uniqueAssets] = await Promise.all([
      this.prisma.download.count({
        where: { userId },
      }),
      this.prisma.download.groupBy({
        by: ['assetId'],
        where: { userId },
        _count: true,
      }),
    ]);

    return {
      totalDownloads,
      uniqueAssetsDownloaded: uniqueAssets.length,
    };
  }

  async canDownload(userId: string, assetId: string): Promise<boolean> {
    return this.ordersService.hasPurchased(userId, assetId);
  }
}
