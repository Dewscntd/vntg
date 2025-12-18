'use client';

import Link from 'next/link';
import { User, Heart, Search } from 'lucide-react';

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

export interface HeaderProps {
  className?: string;
  /** Use minimal variant for shop pages (hides main nav and category nav) */
  variant?: 'default' | 'minimal';
}

export function Header({ className, variant = 'default' }: HeaderProps) {
  const { user } = useAuth();

  const isMinimal = variant === 'minimal';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      {/* Top Bar */}
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {!isMinimal && <MobileNav />}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">P</span>
              </div>
              <span className="hidden text-xl font-bold sm:block">Peakees</span>
            </Link>
          </div>

          {/* Desktop Navigation - Only show in default variant */}
          {!isMinimal && (
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/shop"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Shop
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Contact
              </Link>
            </nav>
          )}

          {/* Search Bar - Desktop */}
          <div className={cn('hidden max-w-md flex-1 lg:flex', isMinimal ? 'mx-4' : 'mx-8')}>
            <ProductSearch className="w-full" />
          </div>

          {/* Actions - User, Favorites, Cart */}
          <div className="flex items-center gap-1">
            {/* Search - Mobile/Tablet */}
            <MobileSearch className="lg:hidden" />

            {/* User Account */}
            {user ? (
              <UserNav />
            ) : (
              <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
                <Link href="/login">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Link>
              </Button>
            )}

            {/* Favorites/Wishlist */}
            <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
              <Link href="/favorites">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Favorites</span>
              </Link>
            </Button>

            {/* Cart Button with Preview */}
            <CartPreview trigger={<CartButton />} side="bottom" align="end" showOnHover={true} />
          </div>
        </div>
      </div>

      {/* Category Navigation - Only show in default variant */}
      {!isMinimal && (
        <div className="hidden border-t md:block">
          <div className="container mx-auto px-4">
            <CategoryNavigation orientation="horizontal" maxItems={6} className="py-3" />
          </div>
        </div>
      )}
    </header>
  );
}
