/**
 * Shop Gender Page (e.g., /shop/women, /shop/men)
 *
 * Main shop page for a specific gender showing all products
 * with filtering and sorting capabilities.
 */

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ShopLayout } from '@/components/shop/shop-layout';
import { ShopContent } from './shop-content';
import { Gender } from '@/types/shop';

interface ShopGenderPageProps {
  params: Promise<{
    locale: string;
    gender: string;
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
  return [{ gender: 'women' }, { gender: 'men' }];
}

export default async function ShopGenderPage({ params, searchParams }: ShopGenderPageProps) {
  const { gender } = await params;
  const resolvedSearchParams = await searchParams;

  // Validate gender
  if (gender !== 'men' && gender !== 'women') {
    notFound();
  }

  return (
    <ShopLayout gender={gender as Gender}>
      <Suspense fallback={<ShopContentSkeleton />}>
        <ShopContent gender={gender as Gender} searchParams={resolvedSearchParams} />
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
