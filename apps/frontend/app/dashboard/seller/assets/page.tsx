import { getAccessToken } from '@auth0/nextjs-auth0';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Asset {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: string;
  category: string;
  thumbnailUrl: string;
  salesCount: number;
  downloadCount: number;
  createdAt: string;
}

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  DRAFT: 'secondary',
  PENDING_REVIEW: 'warning',
  ACTIVE: 'success',
  INACTIVE: 'destructive',
  REJECTED: 'destructive',
};

async function getMyAssets(token: string): Promise<Asset[]> {
  try {
    const res = await fetch(`${API_URL}/api/assets/seller/mine`, {
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

export default async function SellerAssetsPage() {
  let assets: Asset[] = [];

  try {
    const { accessToken } = await getAccessToken();
    if (accessToken) {
      assets = await getMyAssets(accessToken);
    }
  } catch (error) {
    // Handle silently
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Assets</h1>
          <p className="text-muted-foreground">
            Manage your digital assets
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/seller/assets/new">
            <Plus className="h-4 w-4 mr-2" />
            New Asset
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {assets.length > 0 ? (
            <div className="space-y-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="border rounded-lg p-4 flex flex-col md:flex-row gap-4"
                >
                  <div className="relative w-full md:w-40 aspect-video rounded-md overflow-hidden bg-muted shrink-0">
                    <Image
                      src={asset.thumbnailUrl || '/placeholder.png'}
                      alt={asset.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{asset.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(asset.createdAt)}
                        </p>
                      </div>
                      <Badge variant={statusColors[asset.status] || 'secondary'}>
                        {asset.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatPrice(Number(asset.price))}</span>
                      <span>{asset.salesCount} sales</span>
                      <span>{asset.downloadCount} downloads</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/catalog/${asset.slug}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/seller/assets/${asset.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t created any assets yet.
              </p>
              <Button asChild>
                <Link href="/dashboard/seller/assets/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Asset
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
