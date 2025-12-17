/**
 * Shop Product Grid Component
 *
 * Enhanced product grid with:
 * - Dynamic layout (2/4 columns grid OR list view)
 * - Responsive design
 * - Loading states
 * - Empty states
 * - Infinite scroll support
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/products/product-card';
import { ProductListItem } from '@/components/products/product-list-item';
import { ShopProduct, GridLayout } from '@/types/shop';

interface ShopProductGridProps {
  products: ShopProduct[];
  gridLayout: GridLayout;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function ShopProductGrid({
  products,
  gridLayout,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className,
}: ShopProductGridProps) {
  const t = useTranslations('shop');
  const [mounted, setMounted] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!observerTarget.current || !onLoadMore || !hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  // Loading skeleton
  if (isLoading && products.length === 0) {
    return (
      <div className={cn('pb-16', className)}>
        <div className={cn('grid gap-4', getGridClasses(gridLayout))}>
          {Array.from({ length: gridLayout === 'list' ? 6 : 12 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'animate-pulse bg-muted',
                gridLayout === 'list' ? 'h-48' : 'aspect-[3/4]'
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className={cn('flex min-h-[400px] items-center justify-center pb-16', className)}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t('noProducts')}</p>
        </div>
      </div>
    );
  }

  const isListView = gridLayout === 'list';

  return (
    <div
      className={cn('pb-16', className)}
      style={{
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      {/* Product Grid or List */}
      {isListView ? (
        // List View - single column with horizontal cards
        <div className="flex flex-col gap-4">
          {products.map((product, index) => (
            <ProductListItem
              key={product.id}
              product={product}
              priority={index < 3}
            />
          ))}
        </div>
      ) : (
        // Grid View
        <div className={cn('grid gap-4', getGridClasses(gridLayout))}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
              enableImageZoom={false}
            />
          ))}
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="text-sm text-muted-foreground">
            {isLoading ? t('loading') : t('loadMore')}
          </div>
        </div>
      )}

      {/* Loading indicator at the end */}
      {isLoading && products.length > 0 && (
        <div className={cn('mt-4 grid gap-4', getGridClasses(gridLayout))}>
          {Array.from({ length: isListView ? 2 : 4 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'animate-pulse bg-muted',
                isListView ? 'h-48' : 'aspect-[3/4]'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Get Tailwind grid classes based on layout
 */
function getGridClasses(layout: GridLayout): string {
  switch (layout) {
    case 'list':
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-2';
    case 4:
      return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    default:
      return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  }
}
