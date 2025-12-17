/**
 * Category Tabs Component
 *
 * Horizontal scrolling category navigation with smooth animations.
 * Features snap scrolling and active state indicators.
 */

'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ShopCategory } from '@/types/shop';
import { getCategoriesByGender } from '@/lib/config/shop-categories';

interface CategoryTabsProps {
  gender: 'men' | 'women';
  activeCategory?: string;
  className?: string;
}

export function CategoryTabs({ gender, activeCategory = 'all', className }: CategoryTabsProps) {
  const params = useParams();
  const locale = params?.locale || 'en';
  const t = useTranslations('shop.categories');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  const categories = getCategoriesByGender(gender);

  // Auto-scroll to active category on mount
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const tab = activeTabRef.current;

      const containerWidth = container.offsetWidth;
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;

      const scrollPosition = tabLeft - containerWidth / 2 + tabWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [activeCategory]);

  return (
    <div className={cn('relative border-b border-border bg-background', className)}>
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex gap-8 overflow-x-auto px-6 md:justify-center md:px-8"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.slug;
          const href =
            category.slug === 'all'
              ? `/${locale}/shop/${gender}`
              : `/${locale}/shop/${gender}/${category.slug}`;

          return (
            <Link
              key={category.id}
              href={href}
              ref={isActive ? activeTabRef : undefined}
              className={cn(
                'relative shrink-0 whitespace-nowrap py-4 text-sm font-medium uppercase tracking-wider transition-colors',
                'hover:text-foreground',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
              style={{ scrollSnapAlign: 'center' }}
              aria-current={isActive ? 'page' : undefined}
            >
              {t(`${gender}.${category.slug}`)}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Fade indicators for scroll */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent md:hidden" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent md:hidden" />
    </div>
  );
}
