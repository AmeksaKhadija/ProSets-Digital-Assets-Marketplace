import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AssetCard } from '@/components/assets/AssetCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const categories = [
  { value: '', label: 'All' },
  { value: 'TEMPLATES', label: 'Templates' },
  { value: 'GRAPHICS', label: 'Graphics' },
  { value: 'UI_KITS', label: 'UI Kits' },
  { value: 'ICONS', label: 'Icons' },
  { value: 'CODE_SNIPPETS', label: 'Code' },
  { value: 'THEMES', label: 'Themes' },
];

async function getAssets(searchParams: Record<string, string>) {
  const params = new URLSearchParams();
  if (searchParams.search) params.set('search', searchParams.search);
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy);
  if (searchParams.page) params.set('page', searchParams.page);

  try {
    const res = await fetch(`${API_URL}/api/assets?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { data: [], meta: { total: 0, page: 1, totalPages: 0 } };
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Failed to fetch assets:', error);
    return { data: [], meta: { total: 0, page: 1, totalPages: 0 } };
  }
}

interface CatalogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : '';
  const category = typeof params.category === 'string' ? params.category : '';
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : 'newest';
  const page = typeof params.page === 'string' ? params.page : '1';

  const result = await getAssets({ search, category, sortBy, page });
  const assets = result.data || [];
  const meta = result.meta || { total: 0, page: 1, totalPages: 0 };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Digital Assets Catalog</h1>
            <p className="text-muted-foreground mt-2">
              Browse our collection of premium digital assets
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <form className="flex-1" action="/catalog" method="GET">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search assets..."
                  defaultValue={search}
                  className="pl-10"
                />
                {category && <input type="hidden" name="category" value={category} />}
              </div>
            </form>

            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <a
                  key={cat.value}
                  href={`/catalog${cat.value ? `?category=${cat.value}` : ''}${search ? `&search=${search}` : ''}`}
                >
                  <Badge
                    variant={category === cat.value ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/10"
                  >
                    {cat.label}
                  </Badge>
                </a>
              ))}
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {meta.total} assets found
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                defaultValue={sortBy}
                className="text-sm border rounded px-2 py-1"
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('sortBy', e.target.value);
                  window.location.href = url.toString();
                }}
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Asset Grid */}
          <Suspense fallback={<div>Loading...</div>}>
            {assets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {assets.map((asset: {
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
                }) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No assets found</p>
                <Button className="mt-4" asChild>
                  <a href="/catalog">Clear filters</a>
                </Button>
              </div>
            )}
          </Suspense>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/catalog?page=${p}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
                >
                  <Button
                    variant={Number(page) === p ? 'default' : 'outline'}
                    size="sm"
                  >
                    {p}
                  </Button>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
