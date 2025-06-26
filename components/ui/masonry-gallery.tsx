'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from './optimized-image';

export interface MasonryItem {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  tags?: string[];
}

export interface MasonryGalleryProps {
  items: MasonryItem[];
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  className?: string;
  onItemClick?: (item: MasonryItem, index: number) => void;
  renderItem?: (item: MasonryItem, index: number) => ReactNode;
  enableInfiniteScroll?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export function MasonryGallery({
  items,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 16,
  className,
  onItemClick,
  renderItem,
  enableInfiniteScroll = false,
  onLoadMore,
  isLoading = false,
}: MasonryGalleryProps) {
  const [columnHeights, setColumnHeights] = useState<number[]>([]);
  const [itemPositions, setItemPositions] = useState<
    Array<{ x: number; y: number; width: number; height: number }>
  >([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [currentColumns, setCurrentColumns] = useState(columns.mobile || 1);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update columns based on screen size
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setCurrentColumns(columns.desktop || 3);
      } else if (width >= 768) {
        setCurrentColumns(columns.tablet || 2);
      } else {
        setCurrentColumns(columns.mobile || 1);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [columns]);

  // Calculate masonry layout
  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    const containerWidth = containerRef.current.offsetWidth;
    const columnWidth = (containerWidth - gap * (currentColumns - 1)) / currentColumns;

    // Initialize column heights
    const heights = new Array(currentColumns).fill(0);
    const positions: Array<{ x: number; y: number; width: number; height: number }> = [];

    items.forEach((item, index) => {
      // Find the shortest column
      const shortestColumnIndex = heights.indexOf(Math.min(...heights));

      // Calculate item dimensions maintaining aspect ratio
      const aspectRatio = item.height / item.width;
      const itemHeight = columnWidth * aspectRatio;

      // Calculate position
      const x = shortestColumnIndex * (columnWidth + gap);
      const y = heights[shortestColumnIndex];

      positions.push({
        x,
        y,
        width: columnWidth,
        height: itemHeight,
      });

      // Update column height
      heights[shortestColumnIndex] += itemHeight + gap;
    });

    setColumnHeights(heights);
    setItemPositions(positions);
    setContainerHeight(Math.max(...heights) - gap);
  }, [items, currentColumns, gap]);

  // Infinite scroll
  useEffect(() => {
    if (!enableInfiniteScroll || !onLoadMore) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 1000 && !isLoading) {
        onLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableInfiniteScroll, onLoadMore, isLoading]);

  const defaultRenderItem = (item: MasonryItem, index: number) => (
    <div
      key={item.id}
      ref={(el) => {
        itemRefs.current[index] = el;
      }}
      className="group absolute cursor-pointer"
      style={{
        left: itemPositions[index]?.x || 0,
        top: itemPositions[index]?.y || 0,
        width: itemPositions[index]?.width || 0,
        height: itemPositions[index]?.height || 0,
        transition: 'all 0.3s ease',
      }}
      onClick={() => onItemClick?.(item, index)}
    >
      <div className="relative h-full w-full overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl">
        <OptimizedImage
          src={item.src}
          alt={item.alt}
          fill
          className="transition-transform duration-300 group-hover:scale-105"
          sizes={`${100 / currentColumns}vw`}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

        {/* Caption */}
        {item.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="text-sm font-medium text-white">{item.caption}</p>
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {item.tags.slice(0, 2).map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="rounded-full bg-white/90 px-2 py-1 text-xs text-black"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      <div ref={containerRef} className="relative" style={{ height: containerHeight }}>
        {items.map((item, index) =>
          renderItem ? renderItem(item, index) : defaultRenderItem(item, index)
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

// CSS Grid based masonry (simpler but less control)
export interface CSSMasonryProps {
  children: ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CSSMasonry({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className,
}: CSSMasonryProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const columnClasses = [
    `columns-${columns.mobile}`,
    `md:columns-${columns.tablet}`,
    `lg:columns-${columns.desktop}`,
  ].join(' ');

  return (
    <div className={cn(columnClasses, gapClasses[gap], 'space-y-4', className)}>{children}</div>
  );
}

// Pinterest-style masonry item
export interface MasonryItemProps {
  src: string;
  alt: string;
  caption?: string;
  tags?: string[];
  aspectRatio?: number;
  onClick?: () => void;
  className?: string;
}

export function MasonryItem({
  src,
  alt,
  caption,
  tags,
  aspectRatio,
  onClick,
  className,
}: MasonryItemProps) {
  return (
    <div
      className={cn('group mb-4 cursor-pointer break-inside-avoid', className)}
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl">
        <OptimizedImage
          src={src}
          alt={alt}
          width={400}
          height={aspectRatio ? 400 * aspectRatio : 600}
          className="h-auto w-full transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

        {/* Caption */}
        {caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="text-sm font-medium text-white">{caption}</p>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="rounded-full bg-white/90 px-2 py-1 text-xs text-black">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
