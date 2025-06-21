'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
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
  separator = <ChevronRight className="h-4 w-4" />
}: BreadcrumbProps) {
  const allItems = showHome 
    ? [{ label: 'Home', href: '/' }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1 text-sm", className)}>
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isCurrent = item.current || isLast;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground">
                  {separator}
                </span>
              )}
              
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {index === 0 && showHome ? (
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1" />
                      <span className="sr-only">{item.label}</span>
                    </div>
                  ) : (
                    item.label
                  )}
                </Link>
              ) : (
                <span 
                  className={cn(
                    "font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {index === 0 && showHome ? (
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1" />
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
export function generateProductBreadcrumbs(
  productName?: string,
  categoryName?: string,
  categoryId?: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Products', href: '/products' }
  ];

  if (categoryName && categoryId) {
    items.push({
      label: categoryName,
      href: `/categories/${categoryId}`
    });
  }

  if (productName) {
    items.push({
      label: productName,
      current: true
    });
  }

  return items;
}

export function generateCategoryBreadcrumbs(
  categoryName?: string,
  parentCategory?: { name: string; id: string }
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Categories', href: '/categories' }
  ];

  if (parentCategory) {
    items.push({
      label: parentCategory.name,
      href: `/categories/${parentCategory.id}`
    });
  }

  if (categoryName) {
    items.push({
      label: categoryName,
      current: true
    });
  }

  return items;
}

export function generateSearchBreadcrumbs(query: string): BreadcrumbItem[] {
  return [
    { label: 'Products', href: '/products' },
    { label: `Search results for "${query}"`, current: true }
  ];
}
