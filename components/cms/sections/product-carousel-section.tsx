/**
 * Product Carousel Section - Standalone Section Component
 *
 * Renders a product carousel as a homepage section.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { ProductCarouselSection as ProductCarouselSectionType } from '@/types/cms';
import { ProductCarousel } from './product-carousel';
import { apiUrl } from '@/lib/utils/api';

interface ProductCarouselSectionProps {
  section: ProductCarouselSectionType;
  isPreview?: boolean;
}

export function ProductCarouselSection({
  section,
  isPreview = false,
}: ProductCarouselSectionProps) {
  const { config, title, subtitle } = section;
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);

      try {
        // If dynamic selection is enabled, fetch products based on criteria
        if (config.dynamicSelection?.enabled) {
          const { source, categoryId, limit, sortBy } = config.dynamicSelection;

          const params = new URLSearchParams({
            limit: limit.toString(),
            ...(sortBy && { sort: sortBy }),
            ...(categoryId && { category: categoryId }),
          });

          // Map source to API endpoint
          let endpoint = '/api/products';
          if (source === 'featured') {
            params.append('featured', 'true');
          } else if (source === 'new_arrivals') {
            params.append('sort', 'created_at');
            params.append('order', 'desc');
          } else if (source === 'best_sellers') {
            params.append('sort', 'popularity');
            params.append('order', 'desc');
          }

          const response = await fetch(apiUrl(`${endpoint}?${params}`));
          const data = await response.json();
          const productList = data.products || data.data || [];
          setProducts(Array.isArray(productList) ? productList : []);
        } else {
          // Fetch specific products by IDs
          const productIds = config.products?.map((p) => p.product_id) || [];
          if (productIds.length === 0) {
            setProducts([]);
          } else {
            const response = await fetch(apiUrl(`/api/products/batch?ids=${productIds.join(',')}`));
            const data = await response.json();
            const productList = data.products || data.data || [];

            // Sort products based on the order specified in config
            const sortedProducts = Array.isArray(productList)
              ? productIds.map((id) => productList.find((p: any) => p.id === id)).filter(Boolean)
              : [];

            setProducts(sortedProducts);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]); // Ensure products is always an array
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [config]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {title && <div className="h-8 w-48 rounded bg-muted" />}
          {subtitle && <div className="h-4 w-96 rounded bg-muted" />}
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 flex-1 rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Section Header */}
      {(title || subtitle) && (
        <div className="mb-8 text-center">
          {title && <h2 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h2>}
          {subtitle && <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      {/* Carousel */}
      <ProductCarousel config={config} products={products} />
    </div>
  );
}
