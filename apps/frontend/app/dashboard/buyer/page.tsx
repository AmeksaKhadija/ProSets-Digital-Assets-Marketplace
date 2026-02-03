import { getSession, getAccessToken } from '@auth0/nextjs-auth0';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Download, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getBuyerStats(token: string) {
  try {
    const [ordersRes, downloadsRes] = await Promise.all([
      fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/api/downloads/stats/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const orders = ordersRes.ok ? (await ordersRes.json()).data : [];
    const downloadStats = downloadsRes.ok ? (await downloadsRes.json()).data : { totalDownloads: 0 };

    const paidOrders = Array.isArray(orders) ? orders.filter((o: { status: string }) => o.status === 'PAID') : [];
    const totalSpent = paidOrders.reduce((sum: number, o: { total: number }) => sum + o.total, 0) / 100;

    return {
      totalOrders: paidOrders.length,
      totalSpent,
      totalDownloads: downloadStats.totalDownloads || 0,
    };
  } catch (error) {
    return { totalOrders: 0, totalSpent: 0, totalDownloads: 0 };
  }
}

export default async function BuyerDashboardPage() {
  const session = await getSession();
  let stats = { totalOrders: 0, totalSpent: 0, totalDownloads: 0 };

  try {
    const { accessToken } = await getAccessToken();
    if (accessToken) {
      stats = await getBuyerStats(accessToken);
    }
  } catch (error) {
    // Handle error silently
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {session?.user?.name || 'User'}!</h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your account activity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">assets purchased</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpent.toFixed(2)} EUR</div>
            <p className="text-xs text-muted-foreground">lifetime spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">total downloads</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <Link href="/catalog">Browse Catalog</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/buyer/purchases">View Purchases</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
