import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import {
  Package,
  ShoppingBag,
  Download,
  Store,
  BarChart3,
  Plus,
  Settings,
  Shield,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const buyerLinks = [
  { href: '/dashboard/buyer', label: 'Overview', icon: Package },
  { href: '/dashboard/buyer/purchases', label: 'Purchases', icon: ShoppingBag },
  { href: '/dashboard/buyer/downloads', label: 'Downloads', icon: Download },
];

const sellerLinks = [
  { href: '/dashboard/seller', label: 'Overview', icon: Store },
  { href: '/dashboard/seller/assets', label: 'My Assets', icon: Package },
  { href: '/dashboard/seller/assets/new', label: 'New Asset', icon: Plus },
  { href: '/dashboard/seller/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/seller/analytics', label: 'Analytics', icon: BarChart3 },
];

const adminLinks = [
  { href: '/dashboard/admin', label: 'Overview', icon: Shield },
  { href: '/dashboard/admin/assets', label: 'Assets', icon: Package },
  { href: '/dashboard/admin/users', label: 'Users', icon: Settings },
  { href: '/dashboard/admin/orders', label: 'Orders', icon: ShoppingBag },
];

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-6">
            {/* Buyer Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-3">
                Buyer
              </h3>
              <nav className="space-y-1">
                {buyerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Seller Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-3">
                Seller
              </h3>
              <nav className="space-y-1">
                {sellerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Admin Section (conditionally shown) */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-3">
                Admin
              </h3>
              <nav className="space-y-1">
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
