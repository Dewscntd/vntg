'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Collection {
  id: string;
  key: string;
  href: string;
}

const collections: Collection[] = [
  {
    id: 'new-arrivals',
    key: 'newArrivals',
    href: '/products?new=true',
  },
  {
    id: 'sale',
    key: 'sale',
    href: '/products?sale=true',
  },
  {
    id: 'vintage-picks',
    key: 'vintagePicks',
    href: '/products?collection=vintage',
  },
  {
    id: 'best-sellers',
    key: 'bestSellers',
    href: '/products?bestseller=true',
  },
];

export function ShopCollections() {
  const t = useTranslations('shopPage.collections');

  return (
    <section className="border-y border-border bg-secondary py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Section header */}
        <h2 className="mb-12 text-3xl font-light tracking-tight text-foreground md:text-4xl">
          {t('title')}
        </h2>

        {/* Simple grid - no cards, no icons */}
        <div className="grid gap-12 md:grid-cols-4 md:gap-8">
          {collections.map((collection) => (
            <Link key={collection.id} href={collection.href} className="group">
              <div className="space-y-3">
                <h3 className="text-xl font-normal tracking-tight text-foreground">
                  {t(`items.${collection.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`items.${collection.key}.count`)}
                </p>

                {/* Underline on hover */}
                <span className="inline-block pt-2 text-sm uppercase tracking-widest text-foreground">
                  <span className="border-b border-transparent transition-colors group-hover:border-foreground">
                    {t('browse')}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
