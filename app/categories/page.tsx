'use client';

import Link from 'next/link';
import { Loader2, Package } from 'lucide-react';

import { useCategories } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/supabase';

type Category = Database['public']['Tables']['categories']['Row'];

export default function CategoriesPage() {
  const { data, isLoading, error, refetch } = useCategories();

  const categories = data?.categories || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="mt-2 text-muted-foreground">Browse products by category</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading categories...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="font-medium text-destructive">Failed to load categories</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {/* Categories Grid */}
      {!isLoading && !error && (
        <>
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((category: Category) => (
                <Link key={category.id} href={`/categories/${category.id}`}>
                  <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-md">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Package className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    {category.description && (
                      <CardContent>
                        <p className="text-center text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="py-12 text-center">
              <div className="mx-auto max-w-md">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground">No categories found</h3>
                <p className="mt-2 text-muted-foreground">
                  Categories will appear here once they are added to the system.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/products">Browse All Products</Link>
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
