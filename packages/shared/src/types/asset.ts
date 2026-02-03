export enum AssetStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
}

export enum AssetCategory {
  TEMPLATES = 'TEMPLATES',
  GRAPHICS = 'GRAPHICS',
  UI_KITS = 'UI_KITS',
  ICONS = 'ICONS',
  FONTS = 'FONTS',
  CODE_SNIPPETS = 'CODE_SNIPPETS',
  THEMES = 'THEMES',
  PLUGINS = 'PLUGINS',
  OTHER = 'OTHER',
}

export interface Asset {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string | null;
  price: number;
  category: AssetCategory;
  tags: string[];
  status: AssetStatus;
  sourceFileKey: string;
  sourceFileName: string;
  sourceFileSize: number;
  sourceFileType: string;
  thumbnailUrl: string;
  previewImages: string[];
  version: string;
  compatibility: string[];
  downloadCount: number;
  salesCount: number;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface AssetWithSeller extends Asset {
  seller: {
    id: string;
    name: string | null;
    storeName: string | null;
    avatar: string | null;
  };
}

export interface CreateAssetDto {
  title: string;
  description: string;
  longDescription?: string;
  price: number;
  category: AssetCategory;
  tags?: string[];
  version?: string;
  compatibility?: string[];
}

export interface UpdateAssetDto {
  title?: string;
  description?: string;
  longDescription?: string;
  price?: number;
  category?: AssetCategory;
  tags?: string[];
  status?: AssetStatus;
  version?: string;
  compatibility?: string[];
}

export interface QueryAssetsDto {
  search?: string;
  category?: AssetCategory;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  status?: AssetStatus;
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
}

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  [AssetCategory.TEMPLATES]: 'Templates',
  [AssetCategory.GRAPHICS]: 'Graphics',
  [AssetCategory.UI_KITS]: 'UI Kits',
  [AssetCategory.ICONS]: 'Icons',
  [AssetCategory.FONTS]: 'Fonts',
  [AssetCategory.CODE_SNIPPETS]: 'Code Snippets',
  [AssetCategory.THEMES]: 'Themes',
  [AssetCategory.PLUGINS]: 'Plugins',
  [AssetCategory.OTHER]: 'Other',
};
