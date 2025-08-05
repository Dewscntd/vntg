'use client';

import Link from 'next/link';
import { Loader2, Package, User, BookOpen, Gamepad2 } from 'lucide-react';

import { useCategories } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/supabase';

type Category = Database['public']['Tables']['categories']['Row'];

// Define category icons and colors for better UX
const getCategoryIcon = (categoryName: string) => {
  switch (categoryName) {
    case 'Man':
      return { icon: User, color: 'text-blue-600', bg: 'bg-blue-500/10' };
    case 'Woman':
      return { icon: User, color: 'text-pink-600', bg: 'bg-pink-500/10' };
    case 'Teens':
      return { icon: User, color: 'text-purple-600', bg: 'bg-purple-500/10' };
    case 'Kids':
      return { icon: User, color: 'text-green-600', bg: 'bg-green-500/10' };
    case 'Books & Media':
      return { icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-500/10' };
    case 'Toys & Games':
      return { icon: Gamepad2, color: 'text-red-600', bg: 'bg-red-500/10' };
    default:
      return { icon: Package, color: 'text-gray-600', bg: 'bg-gray-500/10' };
  }
};

export default function CategoriesPage() {
  const { data, isLoading, error, refetch } = useCategories();

  const categories = data?.categories || [];
  
  // Sort categories in the desired order
  const categoryOrder = ['Man', 'Woman', 'Teens', 'Kids', 'Books & Media', 'Toys & Games'];
  const sortedCategories = categoryOrder
    .map(name => categories.find((cat: Category) => cat.name === name))
    .filter(Boolean) as Category[];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Shop by Category
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover curated vintage fashion for every member of your family, plus books and games to complete your lifestyle
        </p>
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
          {sortedCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {sortedCategories.map((category: Category) => {
                const { icon: Icon, color, bg } = getCategoryIcon(category.name);
                return (
                  <Link key={category.id} href={`/categories/${category.id}`}>
                    <Card className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl group border-0 shadow-lg">
                      <CardHeader className="text-center pb-4">
                        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${bg} transition-all duration-300 group-hover:scale-110`}>
                          <Icon className={`h-10 w-10 ${color}`} />
                        </div>
                        <CardTitle className="text-xl font-semibold">{category.name}</CardTitle>
                      </CardHeader>
                      {category.description && (
                        <CardContent className="pt-0">
                          <p className="text-center text-muted-foreground leading-relaxed">
                            {category.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                );
              })}
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
