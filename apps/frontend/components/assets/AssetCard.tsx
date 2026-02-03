'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface AssetCardProps {
  asset: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    thumbnailUrl: string;
    seller?: {
      id: string;
      name: string | null;
      storeName: string | null;
    };
  };
  showSeller?: boolean;
}

const categoryLabels: Record<string, string> = {
  TEMPLATES: 'Templates',
  GRAPHICS: 'Graphics',
  UI_KITS: 'UI Kits',
  ICONS: 'Icons',
  FONTS: 'Fonts',
  CODE_SNIPPETS: 'Code',
  THEMES: 'Themes',
  PLUGINS: 'Plugins',
  OTHER: 'Other',
};

export function AssetCard({ asset, showSeller = true }: AssetCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          src={asset.thumbnailUrl || '/placeholder.png'}
          alt={asset.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <Badge className="absolute top-3 right-3" variant="secondary">
          {categoryLabels[asset.category] || asset.category}
        </Badge>
      </div>
      <CardContent className="p-4">
        <Link href={`/catalog/${asset.slug}`} className="hover:underline">
          <h3 className="font-semibold line-clamp-1">{asset.title}</h3>
        </Link>
        {showSeller && asset.seller && (
          <p className="text-sm text-muted-foreground mt-1">
            by {asset.seller.storeName || asset.seller.name || 'Unknown'}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {asset.description}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold">{formatPrice(asset.price)}</span>
          <Button size="sm" asChild>
            <Link href={`/catalog/${asset.slug}`}>View</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
