export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  platformFee: number;
  total: number;
  currency: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  buyerId: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
}

export interface OrderItem {
  id: string;
  assetTitle: string;
  assetPrice: number;
  orderId: string;
  assetId: string;
  sellerId: string;
  sellerAmount: number;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    asset: {
      id: string;
      title: string;
      slug: string;
      thumbnailUrl: string;
    } | null;
  })[];
}

export interface CreateOrderDto {
  assetIds: string[];
}

export interface Download {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  downloadedAt: Date;
  expiresAt: Date;
  userId: string;
  assetId: string;
}

export interface DownloadWithAsset extends Download {
  asset: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string;
    sourceFileName: string;
    sourceFileSize: number;
  };
}

export interface DownloadUrlResponse {
  url: string;
  expiresAt: Date;
  fileName: string;
}
