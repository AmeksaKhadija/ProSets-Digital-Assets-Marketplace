import { getAccessToken } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Analytics {
  overview: {
    totalUsers: number;
    totalAssets: number;
    totalOrders: number;
    totalRevenue: number;
  };
  breakdown: {
    usersByRole: Record<string, number>;
    assetsByStatus: Record<string, number>;
    ordersByStatus: Record<string, number>;
  };
  recent: {
    orders: Array<{
      id: string;
      orderNumber: string;
      total: number;
      paidAt: string;
      buyer: { name: string; email: string };
    }>;
    topAssets: Array<{
      id: string;
      title: string;
      salesCount: number;
      seller: { storeName: string };
    }>;
  };
}

async function getAnalytics(token: string): Promise<Analytics | null> {
  try {
    const res = await fetch(`${API_URL}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

export default async function AdminDashboardPage() {
  let analytics: Analytics | null = null;

  try {
    const { accessToken } = await getAccessToken();
    if (accessToken) {
      analytics = await getAnalytics(accessToken);
    }
  } catch (error) {
    // Handle silently
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and management
          </p>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Unable to load analytics. You may not have admin permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {analytics.breakdown.usersByRole.SELLER || 0} sellers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalAssets}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {analytics.breakdown.assetsByStatus.ACTIVE || 0} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalOrders}</div>
            <div className="text-xs text-muted-foreground mt-1">
              completed orders
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(analytics.overview.totalRevenue / 100)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              platform total
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Assets pending review</span>
                <Badge variant="warning">
                  {analytics.breakdown.assetsByStatus.PENDING_REVIEW || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Draft assets</span>
                <Badge variant="secondary">
                  {analytics.breakdown.assetsByStatus.DRAFT || 0}
                </Badge>
              </div>
            </div>
            <Link
              href="/dashboard/admin/assets?status=PENDING_REVIEW"
              className="text-sm text-primary hover:underline mt-4 block"
            >
              Review pending assets →
            </Link>
          </CardContent>
        </Card>

        {/* Top Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Selling Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recent.topAssets.length > 0 ? (
              <div className="space-y-3">
                {analytics.recent.topAssets.slice(0, 5).map((asset, index) => (
                  <div key={asset.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-5">{index + 1}.</span>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{asset.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {asset.seller?.storeName || 'Unknown seller'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{asset.salesCount} sales</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No sales yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recent.orders.length > 0 ? (
            <div className="space-y-3">
              {analytics.recent.orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-mono text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.buyer?.name || order.buyer?.email} • {formatDate(order.paidAt)}
                    </p>
                  </div>
                  <span className="font-semibold">{formatPrice(order.total / 100)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent orders</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
