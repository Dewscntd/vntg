/**
 * Category Grid Section - Storefront Component
 *
 * Renders a grid of category tiles.
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoryGridSection as CategoryGridSectionType } from '@/types/cms';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { apiUrl } from '@/lib/utils/api';

interface CategoryGridSectionProps {
  section: CategoryGridSectionType;
  isPreview?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

export function CategoryGridSection({
  section,
  isPreview = false,
}: CategoryGridSectionProps) {
  const { config } = section;
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);

      try {
        const categoryConfigs = config.categories || [];

        // If no categories configured, skip fetch
        if (categoryConfigs.length === 0) {
          setCategories([]);
          setIsLoading(false);
          return;
        }

        const categoryIds = categoryConfigs.map((c) => c.category_id);
        const response = await fetch(
          apiUrl(`/api/categories/batch?ids=${categoryIds.join(',')}`)
        );

        if (!response.ok) {
          // If API fails, use placeholder data from config
          const placeholderCategories = categoryConfigs.map((c, index) => ({
            id: c.category_id,
            name: c.customTitle || `Category ${index + 1}`,
            slug: c.category_id,
            image_url: c.customImage,
            customImage: c.customImage,
            customTitle: c.customTitle,
            order: c.order,
          }));
          setCategories(placeholderCategories);
          return;
        }

        const data = await response.json();
        const categoryList = data.categories || data.data || [];

        // Sort categories based on config order
        const sortedCategories = categoryIds
          .map((id) => {
            const category = Array.isArray(categoryList)
              ? categoryList.find((c: Category) => c.id === id)
              : null;
            const configItem = categoryConfigs.find((c) => c.category_id === id);

            if (configItem) {
              return {
                id: category?.id || id,
                name: category?.name || configItem.customTitle || 'Category',
                slug: category?.slug || id,
                image_url: category?.image_url,
                customImage: configItem.customImage,
                customTitle: configItem.customTitle,
                order: configItem.order,
              };
            }
            return null;
          })
          .filter(Boolean);

        setCategories(sortedCategories as any);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use placeholder data on error
        const categoryConfigs = config.categories || [];
        const placeholderCategories = categoryConfigs.map((c, index) => ({
          id: c.category_id,
          name: c.customTitle || `Category ${index + 1}`,
          slug: c.category_id,
          image_url: c.customImage,
          customImage: c.customImage,
          customTitle: c.customTitle,
          order: c.order,
        }));
        setCategories(placeholderCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [config.categories]);

  if (isLoading) {
    const skeletonCount = config.categories?.length || 4;
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {config.title && <div className="h-8 w-48 bg-muted rounded mx-auto" />}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const gridCols = {
    mobile: `grid-cols-${config.columns.mobile}`,
    tablet: `md:grid-cols-${config.columns.tablet}`,
    desktop: `lg:grid-cols-${config.columns.desktop}`,
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Section Title */}
      {config.title && (
        <h2 className="mb-8 text-center text-3xl font-bold text-foreground md:text-4xl">
          {config.title}
        </h2>
      )}

      {/* Category Grid */}
      <div
        className={cn(
          'grid gap-4',
          gridCols.mobile,
          gridCols.tablet,
          gridCols.desktop
        )}
      >
        {categories.map((category: any) => (
          <CategoryCard
            key={category.id}
            category={category}
            cardStyle={config.cardStyle || 'overlay'}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Category Card Component
 */
interface CategoryCardProps {
  category: any;
  cardStyle: 'overlay' | 'below' | 'minimal';
}

function CategoryCard({ category, cardStyle }: CategoryCardProps) {
  const imageUrl = category.customImage || category.image_url;
  const title = category.customTitle || category.name;

  return (
    <Link
      href={`/categories/${category.slug || category.id}`}
      className="group relative overflow-hidden rounded-lg transition-transform hover:scale-105"
    >
      <div className="relative aspect-square bg-muted">
        {imageUrl && (
          <OptimizedImage
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Overlay styles */}
        {cardStyle === 'overlay' && (
          <>
            <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-2xl font-bold text-white">{title}</h3>
            </div>
          </>
        )}

        {/* Minimal overlay */}
        {cardStyle === 'minimal' && (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        )}
      </div>

      {/* Below image styles */}
      {cardStyle === 'below' && (
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      )}
    </Link>
  );
}
