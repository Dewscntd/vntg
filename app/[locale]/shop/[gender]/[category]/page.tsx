/**
 * Shop Category Page (e.g., /shop/women/dresses, /shop/men/jackets)
 *
 * Category-specific product listing with filters and sorting.
 */

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ShopLayout } from '@/components/shop/shop-layout';
import { ShopContent } from '../shop-content';
import { Gender } from '@/types/shop';
import { isValidCategory, getCategorySlugs } from '@/lib/config/shop-categories';

interface ShopCategoryPageProps {
  params: Promise<{
    locale: string;
    gender: string;
    category: string;
  }>;
  searchParams: Promise<{
    sort?: string;
    priceMin?: string;
    priceMax?: string;
    sizes?: string;
    colors?: string;
    inStock?: string;
    new?: string;
    sale?: string;
  }>;
}

export async function generateStaticParams() {
  const params: { gender: string; category: string }[] = [];

  // Generate paths for all gender/category combinations
  for (const gender of ['women', 'men']) {
    const slugs = getCategorySlugs(gender as Gender);
    for (const category of slugs) {
      if (category !== 'all') {
        // Skip 'all' as it's handled by the gender page
        params.push({ gender, category });
      }
    }
  }

  return params;
}

export default async function ShopCategoryPage({ params, searchParams }: ShopCategoryPageProps) {
  const { gender, category } = await params;
  const resolvedSearchParams = await searchParams;

  // Validate gender and category
  if (gender !== 'men' && gender !== 'women') {
    notFound();
  }

  if (!isValidCategory(gender as Gender, category)) {
    notFound();
  }

  // Add category to search params for filtering
  const enhancedSearchParams = {
    ...resolvedSearchParams,
    category,
  };

  return (
    <ShopLayout gender={gender as Gender} category={category}>
      <Suspense fallback={<ShopContentSkeleton />}>
        <ShopContent gender={gender as Gender} searchParams={enhancedSearchParams} />
      </Suspense>
    </ShopLayout>
  );
}

function ShopContentSkeleton() {
  return (
    <div className="mx-auto max-w-[1920px] px-6 py-8 md:px-8">
      <div className="grid gap-px bg-border md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse bg-muted" />
        ))}
      </div>
    </div>
  );
}
