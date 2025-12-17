/**
 * Shop Content Component (Client Component)
 *
 * Handles data fetching and rendering for shop pages with:
 * - Infinite scroll pagination
 * - Virtual scrolling for performance
 * - Filter and sort integration
 * - Grid/List layout toggle
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';
import { Gender, ShopProduct } from '@/types/shop';
import { ShopProductGrid } from '@/components/shop/shop-product-grid';
import { FilterSortPanel } from '@/components/shop/filter-sort-panel';
import { GridLayoutToggle } from '@/components/shop/grid-layout-toggle';
import { useShopFilters, useGridLayout } from '@/lib/hooks/use-shop-state';
import { Button } from '@/components/ui/button';

interface ShopContentProps {
  gender: Gender;
  searchParams: Record<string, string | undefined>;
}

export function ShopContent({ gender, searchParams }: ShopContentProps) {
  const t = useTranslations('shop');
  const { filters, sort } = useShopFilters();
  const { gridLayout, setGridLayout } = useGridLayout();

  // Hydration safety - only show dynamic content after mount
  const [mounted, setMounted] = useState(false);

  // Product state
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const limit = 10;

  // Mark as mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Fetch products with current filters and pagination
   */
  const fetchProducts = useCallback(
    async (pageNum: number, append = false) => {
      setIsLoading(true);
      try {
        // Build query params
        const params = new URLSearchParams();
        params.set('gender', gender);
        params.set('page', pageNum.toString());
        params.set('limit', limit.toString());

        if (filters.category) params.set('category', filters.category);
        if (filters.priceMin) params.set('priceMin', filters.priceMin.toString());
        if (filters.priceMax) params.set('priceMax', filters.priceMax.toString());
        if (filters.inStock) params.set('inStock', 'true');
        if (filters.isNew) params.set('new', 'true');
        if (filters.isSale) params.set('sale', 'true');
        params.set('sort', sort);

        const response = await fetch(`/api/products?${params.toString()}`);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
          const newProducts = result.data.products || [];
          const pagination = result.data.pagination;

          if (append) {
            // Append for infinite scroll
            setProducts((prev) => [...prev, ...newProducts]);
          } else {
            // Replace for new search/filter
            setProducts(newProducts);
          }

          setTotal(pagination.total || 0);
          setHasMore(pagination.hasMore || false);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        if (!append) {
          setProducts([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [gender, filters, sort]
  );

  /**
   * Load more products for infinite scroll
   */
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
    }
  }, [page, hasMore, isLoading, fetchProducts]);

  /**
   * Reset and fetch when filters change
   */
  useEffect(() => {
    setPage(1);
    setProducts([]);
    fetchProducts(1, false);
  }, [gender, filters, sort]); // fetchProducts is memoized with useCallback

  return (
    <div className="mx-auto max-w-[1920px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4 md:px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <SlidersHorizontal className="me-2 h-4 w-4" />
            {t('filters.filters')}
          </Button>

          <p className="text-sm text-muted-foreground">
            {!mounted || (isLoading && products.length === 0) ? (
              <span>{t('loading')}</span>
            ) : (
              <span>
                {total} {t('products')}
              </span>
            )}
          </p>
        </div>

        <GridLayoutToggle value={gridLayout} onChange={setGridLayout} />
      </div>

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden w-64 shrink-0 border-e border-border p-6 md:block">
          <FilterSortPanel variant="sidebar" />
        </div>

        {/* Product Grid with Virtual Scrolling */}
        <div className="flex-1">
          <ShopProductGrid
            products={products}
            gridLayout={gridLayout}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            className="p-6 md:p-8"
          />
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="text-sm font-medium uppercase tracking-wider">
                {t('filters.filters')}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                {t('close')}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <FilterSortPanel variant="sidebar" />
            </div>
            <div className="border-t border-border p-6">
              <Button onClick={() => setShowFilters(false)} className="w-full">
                {t('filters.viewProducts')} ({total})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
