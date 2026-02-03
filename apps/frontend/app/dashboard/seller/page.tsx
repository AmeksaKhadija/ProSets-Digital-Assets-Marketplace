import { getAccessToken } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, ShoppingBag, TrendingUp, Plus } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SellerStats {
  assetCount: number;
  totalSales: number;
  totalRevenue: number;
}

async function getSellerStats(token: string): Promise<SellerStats> {
  try {
    const res = await fetch(`${API_URL}/api/users/seller/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { assetCount: 0, totalSales: 0, totalRevenue: 0 };
    const json = await res.json();
    return json.data || { assetCount: 0, totalSales: 0, totalRevenue: 0 };
  } catch (error) {
    return { assetCount: 0, totalSales: 0, totalRevenue: 0 };
  }
}

export default async function SellerDashboardPage() {
  let stats: SellerStats = { assetCount: 0, totalSales: 0, totalRevenue: 0 };

  try {
    const { accessToken } = await getAccessToken();
    if (accessToken) {
      stats = await getSellerStats(accessToken);
    }
  } catch (error) {
    // Handle silently
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your assets and track your sales
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/seller/assets/new">
            <Plus className="h-4 w-4 mr-2" />
            New Asset
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assetCount}</div>
            <p className="text-xs text-muted-foreground">published assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">units sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalRevenue / 100).toFixed(2)} EUR
            </div>
            <p className="text-xs text-muted-foreground">after fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Per Sale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalSales > 0
                ? ((stats.totalRevenue / 100) / stats.totalSales).toFixed(2)
                : '0.00'}{' '}
              EUR
            </div>
            <p className="text-xs text-muted-foreground">per transaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/seller/assets/new">
                <Plus className="h-4 w-4 mr-2" />
                Upload New Asset
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/seller/assets">
                <Package className="h-4 w-4 mr-2" />
                Manage Assets
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/seller/orders">
                <ShoppingBag className="h-4 w-4 mr-2" />
                View Orders
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Welcome to your seller dashboard! Here you can manage your digital assets,
              track sales, and monitor your earnings.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Upload high-quality preview images</li>
              <li>Write detailed descriptions</li>
              <li>Set competitive prices</li>
              <li>Respond to customer questions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
