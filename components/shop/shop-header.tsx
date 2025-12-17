'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

export function ShopHeader() {
  const t = useTranslations('shopPage.header');

  return (
    <section className="border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl font-light tracking-tight text-foreground md:text-6xl">
            {t('title')}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t('subtitle')}
          </p>

          {/* Search */}
          <div className="mt-12 flex w-full max-w-md">
            <div className="relative flex-1">
              <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                className="h-12 border-border bg-background ps-11 text-base focus:border-foreground focus:ring-0"
              />
            </div>
            <Button
              asChild
              className="h-12 border border-foreground bg-foreground px-6 text-sm uppercase tracking-widest text-background hover:bg-foreground/90"
            >
              <Link href="/search">{t('search')}</Link>
            </Button>
          </div>

          {/* Quick filters - text links */}
          <nav className="mt-10 flex gap-8 text-sm uppercase tracking-widest">
            <Link
              href="/products"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('allProducts')}
            </Link>
            <Link
              href="/products?new=true"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('newIn')}
            </Link>
            <Link
              href="/products?sale=true"
              className="text-accent transition-colors hover:text-foreground"
            >
              {t('onSale')}
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}
