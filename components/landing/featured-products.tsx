'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/lazy-image';
import { ScrollReveal } from '@/components/layout/scroll-reveal';
import { ResponsiveH2 } from '@/components/ui/responsive-typography';
import { useTranslations } from 'next-intl';
import { mockProducts, mockCategories } from '@/lib/stubs/mock-data';

interface ProductCardMinimalProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    category_id: string | null;
    is_featured?: boolean;
  };
  index: number;
}

function ProductCardMinimal({ product, index }: ProductCardMinimalProps) {
  const category = mockCategories.find((c) => c.id === product.category_id);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex-shrink-0 snap-start"
    >
      <div className="relative aspect-[3/4] w-[280px] overflow-hidden rounded-xl bg-muted md:w-full">
        {/* Product Image */}
        <LazyImage
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 280px, (max-width: 1200px) 25vw, 20vw"
          priority={index < 4}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          placeholder="skeleton"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* New Badge */}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
            <Sparkles className="h-3 w-3" />
            New
          </span>
        </div>

        {/* Quick View on Hover */}
        <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-white">
            View Details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-1">
        {category && (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {category.name}
          </p>
        )}
        <h3 className="line-clamp-1 text-base font-medium transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <p className="text-lg font-semibold">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

export function FeaturedProducts() {
  const t = useTranslations('landing.featured');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get featured products (or first 8)
  const featuredProducts = mockProducts
    .filter((p) => p.is_featured)
    .concat(mockProducts.filter((p) => !p.is_featured))
    .slice(0, 8);

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <ScrollReveal animation="fadeIn">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-primary">
                <Sparkles className="h-4 w-4" />
                {t('badge')}
              </div>
              <ResponsiveH2 size="md" className="text-foreground">
                {t('title')}
              </ResponsiveH2>
              <p className="max-w-md text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            <Button variant="outline" className="group" asChild>
              <Link href="/shop">
                {t('viewAll')}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>

        {/* Products - Horizontal Scroll on Mobile, Grid on Desktop */}
        <ScrollReveal animation="fadeIn" delay={200}>
          {/* Mobile: Horizontal Scroll */}
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:hidden"
          >
            {featuredProducts.map((product, index) => (
              <ProductCardMinimal
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden gap-6 md:grid md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <ProductCardMinimal
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        </ScrollReveal>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="group" asChild>
            <Link href="/shop">
              {t('viewAll')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
