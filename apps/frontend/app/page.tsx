import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Shield,
  Zap,
  CreditCard,
  Package,
  Palette,
  Code,
  FileText,
} from 'lucide-react';

const categories = [
  { name: 'Templates', icon: FileText, href: '/catalog?category=TEMPLATES', count: '500+' },
  { name: 'Graphics', icon: Palette, href: '/catalog?category=GRAPHICS', count: '1,200+' },
  { name: 'UI Kits', icon: Package, href: '/catalog?category=UI_KITS', count: '300+' },
  { name: 'Code Snippets', icon: Code, href: '/catalog?category=CODE_SNIPPETS', count: '800+' },
];

const features = [
  {
    icon: Shield,
    title: 'Secure Downloads',
    description: 'Files are stored securely and delivered via encrypted, time-limited links.',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Get immediate access to your purchases. No waiting, no hassle.',
  },
  {
    icon: CreditCard,
    title: 'Safe Payments',
    description: 'All transactions are processed securely through Stripe.',
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/20 py-24">
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4" variant="secondary">
                Digital Assets Marketplace
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Premium Digital Assets for{' '}
                <span className="text-primary">Creative Professionals</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Discover thousands of high-quality templates, graphics, UI kits, and code
                snippets. Secure delivery, instant downloads.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/catalog">
                    Browse Catalog
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/api/auth/login?screen_hint=signup">
                    Start Selling
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Browse by Category</h2>
              <p className="mt-2 text-muted-foreground">
                Find the perfect assets for your next project
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50"
                >
                  <category.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.count} assets
                  </p>
                  <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Why ProSets?</h2>
              <p className="mt-2 text-muted-foreground">
                The secure and reliable way to buy and sell digital assets
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="text-center p-6 rounded-xl bg-background border"
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="rounded-2xl bg-primary p-12 text-center text-primary-foreground">
              <h2 className="text-3xl font-bold">Ready to Start Selling?</h2>
              <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
                Join thousands of creators who are earning money by selling their digital
                assets on ProSets. Easy upload, secure delivery, and fast payouts.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-8"
                asChild
              >
                <Link href="/api/auth/login?screen_hint=signup">
                  Become a Seller
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
