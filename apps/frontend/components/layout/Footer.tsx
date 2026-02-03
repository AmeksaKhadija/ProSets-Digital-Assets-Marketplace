import Link from 'next/link';
import { Package } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <span className="text-xl font-bold">ProSets</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The marketplace for premium digital assets. Buy and sell templates,
              graphics, code snippets, and more.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/catalog?category=TEMPLATES" className="hover:text-foreground">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=GRAPHICS" className="hover:text-foreground">
                  Graphics
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=UI_KITS" className="hover:text-foreground">
                  UI Kits
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=CODE_SNIPPETS" className="hover:text-foreground">
                  Code Snippets
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Sellers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard/seller" className="hover:text-foreground">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/seller/assets/new" className="hover:text-foreground">
                  Upload Asset
                </Link>
              </li>
              <li>
                <Link href="/dashboard/seller/analytics" className="hover:text-foreground">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ProSets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
