'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/product-card';
import { useProducts } from '@/lib/hooks';

export interface RelatedProductsProps {
  productId: string;
  categoryId?: string;
  title?: string;
  className?: string;
}

export function RelatedProducts({
  productId,
  categoryId,
  title = 'You may also like',
  className,
}: RelatedProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Fetch products from the same category
  const { data, isLoading, error } = useProducts({
    enabled: !!categoryId,
    queryParams: {
      category_id: categoryId,
      limit: 10,
    },
  });

  // Filter out the current product
  const relatedProducts = data?.products?.filter(product => product.id !== productId) || [];

  // Check if scroll arrows should be shown
  const checkScrollArrows = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  // Set up scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollArrows);
      // Initial check
      checkScrollArrows();
      
      // Check again after images load as this might change the scrollWidth
      window.addEventListener('load', checkScrollArrows);
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollArrows);
        window.removeEventListener('load', checkScrollArrows);
      };
    }
  }, [relatedProducts]);

  // If there are no related products, don't render anything
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <div className="hidden space-x-2 sm:flex">
          <Button
            variant="outline"
            size="icon"
            className={cn('rounded-full', !showLeftArrow && 'opacity-50')}
            onClick={scrollLeft}
            disabled={!showLeftArrow}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Scroll left</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn('rounded-full', !showRightArrow && 'opacity-50')}
            onClick={scrollRight}
            disabled={!showRightArrow}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Scroll right</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        {/* Mobile scroll arrows */}
        <div className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 sm:hidden">
          {showLeftArrow && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm"
              onClick={scrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Scroll left</span>
            </Button>
          )}
        </div>
        <div className="absolute right-0 top-1/2 z-10 flex -translate-y-1/2 sm:hidden">
          {showRightArrow && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm"
              onClick={scrollRight}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Scroll right</span>
            </Button>
          )}
        </div>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="min-w-[250px] animate-pulse rounded-lg border bg-muted p-4"
                style={{ height: '350px' }}
              />
            ))
          ) : error ? (
            <div className="w-full p-4 text-center text-muted-foreground">
              Failed to load related products
            </div>
          ) : (
            relatedProducts.map((product) => (
              <div key={product.id} className="min-w-[250px] max-w-[250px]">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Link href={`/categories/${categoryId}`}>
          <Button variant="outline">View All</Button>
        </Link>
      </div>
    </div>
  );
}
