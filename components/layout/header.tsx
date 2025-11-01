'use client';

import Link from 'next/link';
import { User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CartButton } from '@/components/cart/cart-button';
import { CartPreview } from '@/components/cart/cart-preview';
import { ProductSearch } from '@/components/products/browse/product-search';
import { CategoryNavigation } from '@/components/navigation/category-navigation';
import { MobileNav } from '@/components/navigation/mobile-nav';
import { MobileSearch } from '@/components/navigation/mobile-search';
import { UserNav } from '@/components/auth/user-nav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import { useMagneticButton } from '@/lib/hooks/use-enhanced-interactions';

export interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user } = useAuth();
  const logoRef = useMagneticButton<HTMLAnchorElement>(0.2);
  const cartButtonRef = useMagneticButton<HTMLDivElement>(0.15);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      {/* Top Bar */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-3">
            <MobileNav />
            <Link href="/" className="flex items-center gap-2" ref={logoRef}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">P</span>
              </div>
              <span className="hidden text-xl font-bold sm:block">Peakees</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/shop" className="text-sm font-medium transition-colors hover:text-primary">
              חנות
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              מוצרים
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              קטגוריות
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              עלינו
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              יצירת קשר
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="mx-8 hidden max-w-md flex-1 lg:flex">
            <ProductSearch className="w-full" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search */}
            <MobileSearch className="lg:hidden" />

            {/* User Account */}
            {user ? (
              <UserNav />
            ) : (
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <User className="h-5 w-5" />
                <span className="sr-only">חשבון</span>
              </Button>
            )}

            {/* Cart Button with Preview */}
            <div ref={cartButtonRef}>
              <CartPreview trigger={<CartButton />} side="bottom" align="end" showOnHover={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation - Desktop */}
      <div className="hidden border-t md:block">
        <div className="container mx-auto px-4">
          <CategoryNavigation orientation="horizontal" maxItems={6} className="py-3" />
        </div>
      </div>

      {/* Mobile Search Bar - Tablet only */}
      <div className="hidden border-t px-4 py-3 md:block lg:hidden">
        <ProductSearch className="w-full" />
      </div>
    </header>
  );
}
