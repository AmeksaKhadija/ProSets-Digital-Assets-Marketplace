import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { Public, CurrentUser, CurrentUserData, Roles, UserRole } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { QueryAssetsDto } from './dto/query-assets.dto';

@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Get()
  @Public()
  async findAll(@Query() query: QueryAssetsDto) {
    return this.assetsService.findAll(query);
  }

  @Get('seller/mine')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async findMyAssets(@CurrentUser() user: CurrentUserData) {
    return this.assetsService.findBySeller(user.id, true);
  }

  @Get(':slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    return this.assetsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'sourceFile', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'previews', maxCount: 10 },
    ]),
  )
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateAssetDto,
    @UploadedFiles()
    files: {
      sourceFile?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      previews?: Express.Multer.File[];
    },
  ) {
    if (!files.sourceFile?.[0]) {
      throw new Error('Source file is required');
    }
    if (!files.thumbnail?.[0]) {
      throw new Error('Thumbnail is required');
    }

    return this.assetsService.create(
      user.id,
      dto,
      files.sourceFile[0],
      files.thumbnail[0],
      files.previews,
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'previews', maxCount: 10 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateAssetDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      previews?: Express.Multer.File[];
    },
  ) {
    return this.assetsService.update(
      id,
      user.id,
      dto,
      files?.thumbnail?.[0],
      files?.previews,
    );
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async publish(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.assetsService.publish(id, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  async delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    await this.assetsService.delete(id, user.id);
    return { message: 'Asset deleted successfully' };
  }
}
