'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';

import { ProductGrid } from '@/components/products/product-grid';
import { ProductSearch, ProductFilters, ProductSorting } from '@/components/products/browse';
import { Breadcrumb, generateSearchBreadcrumbs, Pagination, calculatePagination } from '@/components/navigation';
import { useProducts } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [queryParams, setQueryParams] = useState({
    limit: 12,
    offset: 0,
    orderBy: 'created_at' as const,
    orderDirection: 'desc' as const,
    search: query,
    category_id: searchParams.get('category') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    is_featured: searchParams.get('featured') === 'true' ? true : undefined,
  });

  const { data, isLoading, error, refetch } = useProducts({
    url: `/api/products?${new URLSearchParams(
      Object.entries(queryParams).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}`,
    cacheKey: `search-${JSON.stringify(queryParams)}`,
    enabled: !!query, // Only fetch if there's a search query
  });

  // Update query params when URL search params change
  useEffect(() => {
    const newQuery = searchParams.get('q') || '';
    setQueryParams(prev => ({
      ...prev,
      search: newQuery,
      category_id: searchParams.get('category') || undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      is_featured: searchParams.get('featured') === 'true' ? true : undefined,
      offset: 0, // Reset to first page when search changes
    }));
  }, [searchParams]);

  const products = data?.products || [];
  const pagination = data?.pagination;

  const handleLoadMore = () => {
    if (pagination && pagination.offset + pagination.limit < pagination.total) {
      setQueryParams(prev => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const hasMore = pagination && pagination.offset + pagination.limit < pagination.total;

  // If no search query, show search prompt
  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Search Products</h1>
          <p className="text-muted-foreground mb-6">
            Enter a search term to find products
          </p>
          <Button asChild>
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = generateSearchBreadcrumbs(query);
  const paginationData = pagination ? calculatePagination(
    pagination.offset,
    pagination.limit,
    pagination.total
  ) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Search Results
        </h1>
        <p className="text-muted-foreground mt-2">
          Results for "{query}"
        </p>
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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-muted-foreground">
                {pagination && (
                  <>
                    Found {pagination.total} result{pagination.total !== 1 ? 's' : ''} for "{query}"
                  </>
                )}
              </div>
              <ProductSorting />
            </div>

      {/* Loading State */}
      {isLoading && products.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Searching products...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive font-medium">Search failed</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      )}

            {/* Search Results */}
            {!isLoading && !error && (
              <>
                {products.length > 0 ? (
                  <>
                    <ProductGrid products={products} />

                    {/* Pagination */}
                    {paginationData && paginationData.totalPages > 1 && (
                      <div className="mt-12">
                        <Pagination {...paginationData} />
                      </div>
                    )}
                  </>
                ) : (
                  /* No Results State */
                  <div className="text-center py-12">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                    <p className="text-muted-foreground mb-6">
                      We couldn't find any products matching "{query}". Try different keywords or browse our categories.
                    </p>
                    <div className="space-x-2">
                      <Button asChild variant="outline">
                        <Link href="/categories">Browse Categories</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/products">View All Products</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
