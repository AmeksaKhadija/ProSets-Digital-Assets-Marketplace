'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice, formatDate } from '@/lib/utils';
import { Check, X, Eye, Loader2 } from 'lucide-react';

interface Asset {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: string;
  category: string;
  thumbnailUrl: string;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    email: string;
    storeName: string;
  };
}

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  DRAFT: 'secondary',
  PENDING_REVIEW: 'warning',
  ACTIVE: 'success',
  INACTIVE: 'destructive',
  REJECTED: 'destructive',
};

const statuses = [
  { value: '', label: 'All' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'DRAFT', label: 'Draft' },
];

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const { toast } = useToast();

  const fetchAssets = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/backend/admin/assets?${params}`);
      const data = await res.json();

      if (res.ok) {
        setAssets(data.data?.data || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load assets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [statusFilter]);

  const updateStatus = async (assetId: string, newStatus: string) => {
    setUpdating(assetId);
    try {
      const res = await fetch(`/api/backend/admin/assets/${assetId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: `Asset status updated to ${newStatus}`,
        });
        fetchAssets();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update asset status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Asset Moderation</h1>
        <p className="text-muted-foreground">
          Review and manage marketplace assets
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((status) => (
          <Badge
            key={status.value}
            variant={statusFilter === status.value ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setStatusFilter(status.value)}
          >
            {status.label}
          </Badge>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          ) : assets.length > 0 ? (
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
                          by {asset.seller?.storeName || asset.seller?.name || asset.seller?.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {formatDate(asset.createdAt)}
                        </p>
                      </div>
                      <Badge variant={statusColors[asset.status] || 'secondary'}>
                        {asset.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">{formatPrice(Number(asset.price))}</span>
                    </div>
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/catalog/${asset.slug}`} target="_blank">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </Button>
                      {asset.status === 'PENDING_REVIEW' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(asset.id, 'ACTIVE')}
                            disabled={updating === asset.id}
                          >
                            {updating === asset.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(asset.id, 'REJECTED')}
                            disabled={updating === asset.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {asset.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(asset.id, 'INACTIVE')}
                          disabled={updating === asset.id}
                        >
                          Deactivate
                        </Button>
                      )}
                      {asset.status === 'INACTIVE' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(asset.id, 'ACTIVE')}
                          disabled={updating === asset.id}
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No assets found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
