'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { ProductGrid } from '@/components/products/product-grid';
import { ProductSearch, ProductFilters, ProductSorting } from '@/components/products/browse';
import {
  Breadcrumb,
  generateCategoryBreadcrumbs,
  Pagination,
  calculatePagination,
} from '@/components/navigation';
import { useProducts, useCategory } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params.id as string;

  const [queryParams, setQueryParams] = useState({
    limit: 12,
    offset: 0,
    orderBy: 'created_at' as const,
    orderDirection: 'desc' as const,
    category_id: categoryId,
    search: searchParams.get('search') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
  });

  // Fetch category details
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategory(categoryId);

  // Fetch products in this category
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch,
  } = useProducts({
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
    cacheKey: `category-products-${categoryId}-${JSON.stringify(queryParams)}`,
  });

  // Update query params when URL search params change
  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: searchParams.get('search') || undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      offset: 0, // Reset to first page when filters change
    }));
  }, [searchParams]);

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;

  const handleLoadMore = () => {
    if (pagination && pagination.offset + pagination.limit < pagination.total) {
      setQueryParams((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const hasMore = pagination && pagination.offset + pagination.limit < pagination.total;
  const isLoading = categoryLoading || productsLoading;
  const error = categoryError || productsError;

  if (isLoading && !category && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading category...</span>
        </div>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="font-medium text-destructive">Failed to load category</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <div className="mt-4 space-x-2">
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
            <Button asChild>
              <Link href="/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = generateCategoryBreadcrumbs(
    category?.name,
    category?.parent ? { name: category.parent.name, id: category.parent.id } : undefined
  );

  const paginationData = pagination
    ? calculatePagination(pagination.offset, pagination.limit, pagination.total)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{category?.name || 'Category'}</h1>
        {category?.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}
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
                    {pagination.total} products in {category?.name}
                  </>
                )}
              </div>
              <ProductSorting />
            </div>

            {/* Products Loading State */}
            {productsLoading && products.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading products...</span>
              </div>
            )}

            {/* Products Error State */}
            {productsError && (
              <div className="mb-8 rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
                <p className="font-medium text-destructive">Failed to load products</p>
                <p className="mt-1 text-sm text-muted-foreground">{productsError.message}</p>
                <Button onClick={() => refetch()} className="mt-4">
                  Try Again
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {!productsLoading && !productsError && (
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
                  /* Empty State */
                  <div className="py-12 text-center">
                    <div className="mx-auto max-w-md">
                      <h3 className="text-lg font-medium text-foreground">No products found</h3>
                      <p className="mt-2 text-muted-foreground">
                        This category doesn't have any products yet. Check back later or browse
                        other categories.
                      </p>
                      <div className="mt-4 space-x-2">
                        <Button asChild variant="outline">
                          <Link href="/categories">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href="/products">Browse All Products</Link>
                        </Button>
                      </div>
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
