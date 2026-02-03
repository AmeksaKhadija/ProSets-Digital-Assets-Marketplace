// Platform configuration
export const PLATFORM_FEE_PERCENT = 15;
export const DEFAULT_CURRENCY = 'EUR';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// S3 configuration
export const PRESIGNED_URL_EXPIRY_SECONDS = 300; // 5 minutes
export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
export const ALLOWED_SOURCE_FILE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
export const MAX_PREVIEW_IMAGES = 10;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// Validation
export const MIN_ASSET_PRICE = 0;
export const MAX_ASSET_PRICE = 10000;
export const MIN_TITLE_LENGTH = 3;
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_LONG_DESCRIPTION_LENGTH = 10000;
export const MAX_TAGS = 10;

// API routes
export const API_ROUTES = {
  AUTH: {
    SYNC: '/auth/sync',
    ME: '/auth/me',
  },
  USERS: {
    PROFILE: '/users/profile',
    BECOME_SELLER: '/users/become-seller',
  },
  ASSETS: {
    BASE: '/assets',
    BY_SLUG: (slug: string) => `/assets/${slug}`,
    SELLER_ASSETS: '/assets/seller/mine',
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
  },
  DOWNLOADS: {
    BY_ASSET: (assetId: string) => `/downloads/${assetId}`,
    HISTORY: '/downloads/history',
  },
  ADMIN: {
    ASSETS: '/admin/assets',
    USERS: '/admin/users',
    ORDERS: '/admin/orders',
    ANALYTICS: '/admin/analytics',
  },
} as const;
