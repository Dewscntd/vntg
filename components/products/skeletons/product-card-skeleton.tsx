import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border bg-background', className)}>
      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full" />

      {/* Content skeleton */}
      <div className="space-y-3 p-4">
        {/* Category */}
        <Skeleton className="h-3 w-16" />

        {/* Product name */}
        <Skeleton className="h-4 w-3/4" />

        {/* Price */}
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

export interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

export function ProductGridSkeleton({
  count = 12,
  className,
  columns = { sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 'md',
}: ProductGridSkeletonProps) {
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

  return (
    <div
      className={cn(
        'grid grid-cols-1',
        columns.sm && gridCols.sm[columns.sm as keyof typeof gridCols.sm],
        columns.md && gridCols.md[columns.md as keyof typeof gridCols.md],
        columns.lg && gridCols.lg[columns.lg as keyof typeof gridCols.lg],
        columns.xl && gridCols.xl[columns.xl as keyof typeof gridCols.xl],
        gapClasses[gap],
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
