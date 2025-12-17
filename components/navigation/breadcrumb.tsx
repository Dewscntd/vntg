'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
}

export function Breadcrumb({
  items,
  className,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4" />,
}: BreadcrumbProps) {
  const t = useTranslations('navigation.breadcrumb');
  const allItems = showHome ? [{ label: t('home'), href: '/' }, ...items] : items;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-1 text-sm', className)}>
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isCurrent = item.current || isLast;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-2 text-muted-foreground">{separator}</span>}

              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {index === 0 && showHome ? (
                    <div className="flex items-center">
                      <Home className="mr-1 h-4 w-4" />
                      <span className="sr-only">{item.label}</span>
                    </div>
                  ) : (
                    item.label
                  )}
                </Link>
              ) : (
                <span
                  className={cn(
                    'font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {index === 0 && showHome ? (
                    <div className="flex items-center">
                      <Home className="mr-1 h-4 w-4" />
                      <span className="sr-only">{item.label}</span>
                    </div>
                  ) : (
                    item.label
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Utility function to generate breadcrumbs for common pages
// Note: These need translation labels passed in from the calling component
export function generateProductBreadcrumbs(
  productsLabel: string,
  productName?: string,
  categoryName?: string,
  categoryId?: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: productsLabel, href: '/products' }];

  if (categoryName && categoryId) {
    items.push({
      label: categoryName,
      href: `/categories/${categoryId}`,
    });
  }

  if (productName) {
    items.push({
      label: productName,
      current: true,
    });
  }

  return items;
}

// Generate breadcrumbs for shop product pages with gender and clothing type
export interface ShopProductBreadcrumbParams {
  gender?: string;
  genderLabel?: string;
  clothingType?: string;
  clothingTypeLabel?: string;
  productName: string;
}

export function generateShopProductBreadcrumbs({
  gender,
  genderLabel,
  clothingType,
  clothingTypeLabel,
  productName,
}: ShopProductBreadcrumbParams): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  // Add gender (Men/Women)
  if (gender && genderLabel) {
    items.push({
      label: genderLabel,
      href: `/shop/${gender}`,
    });
  }

  // Add clothing type (Sweaters, Jackets, etc.)
  if (gender && clothingType && clothingTypeLabel) {
    items.push({
      label: clothingTypeLabel,
      href: `/shop/${gender}/${clothingType}`,
    });
  }

  // Add product name
  items.push({
    label: productName,
    current: true,
  });

  return items;
}

export function generateCategoryBreadcrumbs(
  categoriesLabel: string,
  categoryName?: string,
  parentCategory?: { name: string; id: string }
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: categoriesLabel, href: '/categories' }];

  if (parentCategory) {
    items.push({
      label: parentCategory.name,
      href: `/categories/${parentCategory.id}`,
    });
  }

  if (categoryName) {
    items.push({
      label: categoryName,
      current: true,
    });
  }

  return items;
}

export function generateSearchBreadcrumbs(
  productsLabel: string,
  searchResultsTemplate: string,
  query: string
): BreadcrumbItem[] {
  return [
    { label: productsLabel, href: '/products' },
    { label: searchResultsTemplate.replace('{query}', query), current: true },
  ];
}
