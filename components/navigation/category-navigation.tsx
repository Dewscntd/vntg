'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCategories } from '@/lib/hooks';

export interface CategoryNavigationProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showAllLink?: boolean;
  maxItems?: number;
  currentCategoryId?: string;
}

interface CategoryWithChildren {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  children?: CategoryWithChildren[];
  productCount?: number;
}

export function CategoryNavigation({
  className,
  orientation = 'horizontal',
  showAllLink = true,
  maxItems,
  currentCategoryId,
}: CategoryNavigationProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const { data: categoriesData, isLoading } = useCategories({
    url: '/api/categories?limit=50&orderBy=name&orderDirection=asc',
    cacheKey: 'categories-navigation',
  });

  const categories = categoriesData?.categories || [];

  // Build category tree
  const buildCategoryTree = (categories: any[]): CategoryWithChildren[] => {
    const categoryMap = new Map<string, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // First pass: create all category objects
    categories.forEach((category) => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    });

    // Second pass: build the tree structure
    categories.forEach((category) => {
      const categoryNode = categoryMap.get(category.id)!;

      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children!.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return rootCategories;
  };

  const categoryTree = buildCategoryTree(categories);
  const displayCategories = maxItems ? categoryTree.slice(0, maxItems) : categoryTree;

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const CategoryItem = ({
    category,
    level = 0,
  }: {
    category: CategoryWithChildren;
    level?: number;
  }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isCurrent = currentCategoryId === category.id;

    return (
      <div className={cn('relative', level > 0 && 'ml-4')}>
        <div className="flex items-center">
          {hasChildren && orientation === 'vertical' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCategory(category.id)}
              className="mr-1 h-auto p-1"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}

          <Link
            href={`/categories/${category.id}`}
            className={cn(
              'flex items-center space-x-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
              isCurrent && 'bg-accent font-medium text-accent-foreground',
              orientation === 'horizontal' && 'whitespace-nowrap'
            )}
          >
            {level === 0 && <Package className="h-4 w-4" />}
            <span>{category.name}</span>
            {category.productCount && (
              <span className="text-xs text-muted-foreground">({category.productCount})</span>
            )}
          </Link>
        </div>

        {/* Subcategories */}
        {hasChildren && (orientation === 'vertical' ? isExpanded : true) && (
          <div
            className={cn(
              orientation === 'vertical'
                ? 'mt-1 space-y-1'
                : 'absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-md border bg-popover p-1 shadow-md',
              orientation === 'horizontal' && 'hidden group-hover:block'
            )}
          >
            {category.children!.map((child) => (
              <CategoryItem key={child.id} category={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        <span className="text-sm text-muted-foreground">Loading categories...</span>
      </div>
    );
  }

  if (orientation === 'horizontal') {
    return (
      <nav className={cn('flex items-center space-x-1', className)}>
        {showAllLink && (
          <Link
            href="/products"
            className={cn(
              'rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
              !currentCategoryId && 'bg-accent font-medium text-accent-foreground'
            )}
          >
            All Products
          </Link>
        )}

        {displayCategories.map((category) => (
          <div key={category.id} className="group relative">
            <CategoryItem category={category} />
          </div>
        ))}

        {maxItems && categoryTree.length > maxItems && (
          <Link
            href="/categories"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View All Categories
          </Link>
        )}
      </nav>
    );
  }

  return (
    <nav className={cn('space-y-1', className)}>
      {showAllLink && (
        <Link
          href="/products"
          className={cn(
            'flex items-center space-x-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
            !currentCategoryId && 'bg-accent font-medium text-accent-foreground'
          )}
        >
          <Package className="h-4 w-4" />
          <span>All Products</span>
        </Link>
      )}

      {displayCategories.map((category) => (
        <CategoryItem key={category.id} category={category} />
      ))}

      {maxItems && categoryTree.length > maxItems && (
        <Link
          href="/categories"
          className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Package className="h-4 w-4" />
          <span>View All Categories</span>
        </Link>
      )}
    </nav>
  );
}
