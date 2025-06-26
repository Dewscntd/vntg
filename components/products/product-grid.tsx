'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ProductCard, ProductCardProps } from '@/components/products/product-card';
import { ProductGridSkeleton } from './skeletons/product-card-skeleton';
import { QuickViewModal, useQuickView } from './quick-view-modal';
import { useProductGridAnimation, useScrollTriggeredGrid } from '@/lib/hooks/use-gsap';
import { ResponsiveGrid } from '@/components/layout/responsive-container';

export interface ProductGridProps {
  products: ProductCardProps['product'][];
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loadingCount?: number;
  enableQuickView?: boolean;
  animateEntrance?: boolean;
  scrollTriggered?: boolean;
}

export function ProductGrid({
  products,
  className,
  columns = { sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 'md',
  isLoading = false,
  loadingCount = 12,
  enableQuickView = true,
  animateEntrance = true,
  scrollTriggered = false,
}: ProductGridProps) {
  // Quick view functionality
  const { isOpen, productId, openQuickView, closeQuickView } = useQuickView();

  // GSAP animations - choose between scroll-triggered or immediate
  const { ref: gridRef, animateEntrance: triggerAnimation } = useProductGridAnimation();
  const scrollGridRef = useScrollTriggeredGrid();

  // Use appropriate ref based on animation type
  const activeRef = scrollTriggered ? scrollGridRef : gridRef;

  // Trigger entrance animation when products load (only for non-scroll-triggered)
  useEffect(() => {
    if (animateEntrance && !scrollTriggered && products.length > 0) {
      triggerAnimation(0.2);
    }
  }, [products.length, animateEntrance, scrollTriggered, triggerAnimation]);
  // Define grid column classes based on the columns prop
  const gridCols = {
    sm: {
      1: 'grid-cols-1',
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-3',
      4: 'sm:grid-cols-4',
    },
    md: {
      1: 'md:grid-cols-1',
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-4',
    },
    lg: {
      1: 'lg:grid-cols-1',
      2: 'lg:grid-cols-2',
      3: 'lg:grid-cols-3',
      4: 'lg:grid-cols-4',
      5: 'lg:grid-cols-5',
      6: 'lg:grid-cols-6',
    },
    xl: {
      1: 'xl:grid-cols-1',
      2: 'xl:grid-cols-2',
      3: 'xl:grid-cols-3',
      4: 'xl:grid-cols-4',
      5: 'xl:grid-cols-5',
      6: 'xl:grid-cols-6',
    },
  };

  // Define gap classes
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  // Show loading skeleton
  if (isLoading) {
    // Map gap values to what ProductGridSkeleton accepts
    const skeletonGap = gap === 'xl' || gap === 'xs' ? 'lg' : gap;
    return (
      <ProductGridSkeleton
        count={loadingCount}
        columns={columns}
        gap={skeletonGap}
        className={className}
      />
    );
  }

  // If no products, return empty state
  if (!products || products.length === 0) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed p-8 text-center">
        <div>
          <p className="text-sm text-muted-foreground">No products found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={activeRef as React.RefObject<HTMLDivElement>}>
        <ResponsiveGrid
          columns={{
            base: 1,
            sm: columns.sm || 2,
            md: columns.md || 3,
            lg: columns.lg || 4,
            xl: columns.xl || 4,
          }}
          gap={gap}
          className={className}
        >
          {products.map((product, index) => (
            <div key={product.id} data-product-card>
              <ProductCard
                product={product}
                onQuickView={enableQuickView ? openQuickView : undefined}
                priority={index < 4} // Prioritize first 4 images for loading
              />
            </div>
          ))}
        </ResponsiveGrid>
      </div>

      {/* Quick View Modal */}
      {enableQuickView && (
        <QuickViewModal productId={productId} isOpen={isOpen} onClose={closeQuickView} />
      )}
    </>
  );
}
