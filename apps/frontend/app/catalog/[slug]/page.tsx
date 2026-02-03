import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatPrice, formatFileSize } from '@/lib/utils';
import { ShoppingCart, Download, FileArchive, User, Tag } from 'lucide-react';
import { PurchaseButton } from './PurchaseButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAsset(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/assets/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

const categoryLabels: Record<string, string> = {
  TEMPLATES: 'Templates',
  GRAPHICS: 'Graphics',
  UI_KITS: 'UI Kits',
  ICONS: 'Icons',
  FONTS: 'Fonts',
  CODE_SNIPPETS: 'Code Snippets',
  THEMES: 'Themes',
  PLUGINS: 'Plugins',
  OTHER: 'Other',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AssetDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const asset = await getAsset(slug);

  if (!asset) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/catalog" className="hover:text-foreground">
              Catalog
            </Link>
            {' / '}
            <Link
              href={`/catalog?category=${asset.category}`}
              className="hover:text-foreground"
            >
              {categoryLabels[asset.category]}
            </Link>
            {' / '}
            <span className="text-foreground">{asset.title}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-2 space-y-4">
              {/* Main Image */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={asset.thumbnailUrl || '/placeholder.png'}
                  alt={asset.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Preview Images */}
              {asset.previewImages && asset.previewImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {asset.previewImages.map((url: string, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-md overflow-hidden bg-muted cursor-pointer hover:ring-2 ring-primary"
                    >
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>{asset.description}</p>
                  {asset.longDescription && (
                    <div
                      className="mt-4"
                      dangerouslySetInnerHTML={{ __html: asset.longDescription }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Purchase Info */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-2xl font-bold">{asset.title}</h1>
                      <Badge className="mt-2">
                        {categoryLabels[asset.category]}
                      </Badge>
                    </div>

                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(Number(asset.price))}
                    </div>

                    <PurchaseButton assetId={asset.id} assetTitle={asset.title} />

                    <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <FileArchive className="h-4 w-4" />
                        <span>
                          {asset.sourceFileName} ({formatFileSize(asset.sourceFileSize)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>{asset.downloadCount} downloads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        <span>{asset.salesCount} sales</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Card */}
              {asset.seller && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Sold by
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={asset.seller.avatar} />
                        <AvatarFallback>
                          {(asset.seller.storeName || asset.seller.name || 'S')
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {asset.seller.storeName || asset.seller.name}
                        </p>
                        {asset.seller.storeDescription && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {asset.seller.storeDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags & Compatibility */}
              {(asset.tags?.length > 0 || asset.compatibility?.length > 0) && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {asset.tags?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Tag className="h-4 w-4" /> Tags
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {asset.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {asset.compatibility?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Compatible with</p>
                        <div className="flex flex-wrap gap-1">
                          {asset.compatibility.map((item: string) => (
                            <Badge key={item} variant="secondary" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
