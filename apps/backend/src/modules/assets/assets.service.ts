import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AssetStatus, Prisma } from '@prisma/client';
import slugify from 'slugify';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { QueryAssetsDto } from './dto/query-assets.dto';

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async create(
    sellerId: string,
    dto: CreateAssetDto,
    sourceFile: Express.Multer.File,
    thumbnailFile: Express.Multer.File,
    previewFiles?: Express.Multer.File[],
  ) {
    // Generate unique slug
    let slug = slugify(dto.title, { lower: true, strict: true });
    const existingSlug = await this.prisma.asset.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Upload source file to private bucket
    const sourceResult = await this.storageService.uploadPrivateFile(
      sourceFile.buffer,
      sourceFile.originalname,
      sourceFile.mimetype,
      'assets',
    );

    // Upload thumbnail to public bucket
    const thumbnailResult = await this.storageService.uploadPublicFile(
      thumbnailFile.buffer,
      thumbnailFile.originalname,
      thumbnailFile.mimetype,
      'thumbnails',
    );

    // Upload preview images to public bucket
    let previewUrls: string[] = [];
    if (previewFiles && previewFiles.length > 0) {
      const previewResults = await Promise.all(
        previewFiles.map((file) =>
          this.storageService.uploadPublicFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            'previews',
          ),
        ),
      );
      previewUrls = previewResults.map((r) => r.url);
    }

    return this.prisma.asset.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        longDescription: dto.longDescription,
        price: dto.price,
        category: dto.category,
        tags: dto.tags || [],
        version: dto.version || '1.0.0',
        compatibility: dto.compatibility || [],
        sourceFileKey: sourceResult.key,
        sourceFileName: sourceFile.originalname,
        sourceFileSize: sourceFile.size,
        sourceFileType: sourceFile.mimetype,
        thumbnailUrl: thumbnailResult.url,
        previewImages: previewUrls,
        sellerId,
        status: AssetStatus.DRAFT,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            storeName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findAll(query: QueryAssetsDto) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sellerId,
      status,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = query;

    const where: Prisma.AssetWhereInput = {
      // By default, only show active assets for public queries
      status: status || AssetStatus.ACTIVE,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    // Determine sort order
    let orderBy: Prisma.AssetOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { salesCount: 'desc' };
        break;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              storeName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.asset.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findBySlug(slug: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { slug },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            storeName: true,
            storeDescription: true,
            avatar: true,
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async findById(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            storeName: true,
            avatar: true,
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async findBySeller(sellerId: string, includeAll: boolean = false) {
    return this.prisma.asset.findMany({
      where: {
        sellerId,
        ...(includeAll ? {} : { status: AssetStatus.ACTIVE }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            storeName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateAssetDto,
    thumbnailFile?: Express.Multer.File,
    previewFiles?: Express.Multer.File[],
  ) {
    const asset = await this.findById(id);

    if (asset.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own assets');
    }

    const updateData: Prisma.AssetUpdateInput = {};

    if (dto.title) {
      updateData.title = dto.title;
      // Update slug if title changes
      let newSlug = slugify(dto.title, { lower: true, strict: true });
      const existingSlug = await this.prisma.asset.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      if (existingSlug) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      updateData.slug = newSlug;
    }

    if (dto.description) updateData.description = dto.description;
    if (dto.longDescription !== undefined) updateData.longDescription = dto.longDescription;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.category) updateData.category = dto.category;
    if (dto.tags) updateData.tags = dto.tags;
    if (dto.version) updateData.version = dto.version;
    if (dto.compatibility) updateData.compatibility = dto.compatibility;

    // Handle thumbnail update
    if (thumbnailFile) {
      // Delete old thumbnail (extract key from URL)
      const oldKey = asset.thumbnailUrl.split('/').slice(-2).join('/');
      await this.storageService.deleteFile('public', oldKey);

      const thumbnailResult = await this.storageService.uploadPublicFile(
        thumbnailFile.buffer,
        thumbnailFile.originalname,
        thumbnailFile.mimetype,
        'thumbnails',
      );
      updateData.thumbnailUrl = thumbnailResult.url;
    }

    // Handle preview images update
    if (previewFiles && previewFiles.length > 0) {
      // Delete old previews
      for (const url of asset.previewImages) {
        const key = url.split('/').slice(-2).join('/');
        await this.storageService.deleteFile('public', key);
      }

      const previewResults = await Promise.all(
        previewFiles.map((file) =>
          this.storageService.uploadPublicFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            'previews',
          ),
        ),
      );
      updateData.previewImages = previewResults.map((r) => r.url);
    }

    return this.prisma.asset.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            storeName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: AssetStatus) {
    await this.findById(id);

    const updateData: Prisma.AssetUpdateInput = { status };

    if (status === AssetStatus.ACTIVE) {
      updateData.publishedAt = new Date();
    }

    return this.prisma.asset.update({
      where: { id },
      data: updateData,
    });
  }

  async publish(id: string, userId: string) {
    const asset = await this.findById(id);

    if (asset.sellerId !== userId) {
      throw new ForbiddenException('You can only publish your own assets');
    }

    if (asset.status !== AssetStatus.DRAFT) {
      throw new BadRequestException('Only draft assets can be published');
    }

    return this.updateStatus(id, AssetStatus.PENDING_REVIEW);
  }

  async delete(id: string, userId: string) {
    const asset = await this.findById(id);

    if (asset.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own assets');
    }

    // Delete files from S3
    await this.storageService.deleteFile('private', asset.sourceFileKey);

    const thumbnailKey = asset.thumbnailUrl.split('/').slice(-2).join('/');
    await this.storageService.deleteFile('public', thumbnailKey);

    for (const url of asset.previewImages) {
      const key = url.split('/').slice(-2).join('/');
      await this.storageService.deleteFile('public', key);
    }

    await this.prisma.asset.delete({ where: { id } });
  }

  async incrementDownloadCount(id: string) {
    return this.prisma.asset.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  }

  async incrementSalesCount(id: string) {
    return this.prisma.asset.update({
      where: { id },
      data: { salesCount: { increment: 1 } },
    });
  }
}
