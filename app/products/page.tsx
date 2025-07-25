'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { ProductGrid } from '@/components/products/product-grid';
import { ProductSearch, ProductFilters, ProductSorting } from '@/components/products/browse';
import { Breadcrumb, Pagination, calculatePagination } from '@/components/navigation';
import { useProducts } from '@/lib/hooks';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [queryParams, setQueryParams] = useState({
    limit: 12,
    offset: 0,
    orderBy: 'created_at' as const,
    orderDirection: 'desc' as const,
    category_id: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    is_featured: searchParams.get('featured') === 'true' ? true : undefined,
  });

  const { data, isLoading, error, refetch } = useProducts({
    url: `/api/products?${new URLSearchParams(
      Object.entries(queryParams).reduce(
        (acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        },
        {} as Record<string, string>
      )
    ).toString()}`,
    cacheKey: `products-${JSON.stringify(queryParams)}`,
  });

  // Update query params when URL search params change
  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      category_id: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      is_featured: searchParams.get('featured') === 'true' ? true : undefined,
      offset: 0, // Reset to first page when filters change
    }));
  }, [searchParams]);

  const products = data?.products || [];
  const pagination = data?.pagination;

  const handleLoadMore = () => {
    if (pagination && pagination.offset + pagination.limit < pagination.total) {
      setQueryParams((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const hasMore = pagination && pagination.offset + pagination.limit < pagination.total;

  const paginationData = pagination
    ? calculatePagination(pagination.offset, pagination.limit, pagination.total)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={[{ label: 'Products', current: true }]} />
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="mt-2 text-muted-foreground">Discover our collection of premium products</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-6">
        {/* Search Bar */}
        <div className="flex justify-center">
          <ProductSearch className="w-full max-w-lg" />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 lg:flex-shrink-0">
            <ProductFilters />
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:min-w-0">
            {/* Sorting and Results Info */}
            <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="text-sm text-muted-foreground">
                {pagination && (
                  <>
                    Showing {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
                    {pagination.total} products
                  </>
                )}
              </div>
              <ProductSorting />
            </div>

            {/* Loading State */}
            {isLoading && products.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading products...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
                <p className="font-medium text-destructive">Failed to load products</p>
                <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid
              products={products}
              isLoading={isLoading}
              loadingCount={12}
              enableQuickView={true}
              animateEntrance={true}
            />

            {/* Pagination */}
            {!isLoading && !error && paginationData && paginationData.totalPages > 1 && (
              <div className="mt-12">
                <Pagination {...paginationData} />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
              <div className="py-12 text-center">
                <div className="mx-auto max-w-md">
                  <h3 className="text-lg font-medium text-foreground">No products found</h3>
                  <p className="mt-2 text-muted-foreground">
                    We couldn't find any products matching your criteria. Try adjusting your filters
                    or search terms.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
