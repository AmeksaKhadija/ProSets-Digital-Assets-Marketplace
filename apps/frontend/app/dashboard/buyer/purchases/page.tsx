import { getAccessToken } from '@auth0/nextjs-auth0';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';
import { Download, ExternalLink } from 'lucide-react';
import { DownloadButton } from './DownloadButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Asset {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  sourceFileName: string;
  sourceFileSize: number;
}

interface OrderItem {
  id: string;
  assetTitle: string;
  assetPrice: number;
  asset: Asset | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  paidAt: string | null;
  items: OrderItem[];
}

async function getPurchasedAssets(token: string): Promise<Asset[]> {
  try {
    const res = await fetch(`${API_URL}/api/orders/purchased-assets`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

async function getOrders(token: string): Promise<Order[]> {
  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

export default async function PurchasesPage() {
  let purchasedAssets: Asset[] = [];
  let orders: Order[] = [];

  try {
    const { accessToken } = await getAccessToken();
    if (accessToken) {
      [purchasedAssets, orders] = await Promise.all([
        getPurchasedAssets(accessToken),
        getOrders(accessToken),
      ]);
    }
  } catch (error) {
    // Handle silently
  }

  const paidOrders = orders.filter((o) => o.status === 'PAID');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Purchases</h1>
        <p className="text-muted-foreground">
          Access and download your purchased assets
        </p>
      </div>

      {/* Purchased Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assets ({purchasedAssets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {purchasedAssets.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {purchasedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="relative aspect-video bg-muted">
                    <Image
                      src={asset.thumbnailUrl || '/placeholder.png'}
                      alt={asset.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold line-clamp-1">{asset.title}</h3>
                    <div className="flex gap-2">
                      <DownloadButton assetId={asset.id} fileName={asset.sourceFileName} />
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/catalog/${asset.slug}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t purchased any assets yet.
              </p>
              <Button asChild>
                <Link href="/catalog">Browse Catalog</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {paidOrders.length > 0 ? (
            <div className="space-y-4">
              {paidOrders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-mono text-sm">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.paidAt && formatDate(order.paidAt)}
                    </p>
                    <p className="text-sm mt-1">
                      {order.items.length} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="success">Paid</Badge>
                    <span className="font-semibold">
                      {formatPrice(order.total / 100)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No orders yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
