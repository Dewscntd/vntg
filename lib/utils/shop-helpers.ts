/**
 * Shop Helper Functions
 *
 * Pure utility functions for shop operations.
 * Following functional programming principles.
 */

import { ProductFilters, ShopProduct, SortOption } from '@/types/shop';

/**
 * Filter products based on criteria
 */
export function filterProducts(products: ShopProduct[], filters: ProductFilters): ShopProduct[] {
  let filtered = [...products];

  // Filter by category
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter((product) => {
      // Match category slug or name
      return (
        product.category?.name.toLowerCase().includes(filters.category!) ||
        product.name.toLowerCase().includes(filters.category!)
      );
    });
  }

  // Filter by price range
  if (filters.priceMin !== undefined) {
    filtered = filtered.filter((product) => product.price >= filters.priceMin!);
  }

  if (filters.priceMax !== undefined) {
    filtered = filtered.filter((product) => product.price <= filters.priceMax!);
  }

  // Filter by stock
  if (filters.inStock) {
    filtered = filtered.filter((product) => product.inventory_count > 0);
  }

  // Filter by new arrivals
  if (filters.isNew) {
    filtered = filtered.filter((product) => product.is_new === true);
  }

  // Filter by sale
  if (filters.isSale) {
    filtered = filtered.filter((product) => product.is_sale === true);
  }

  return filtered;
}

/**
 * Sort products based on option
 */
export function sortProducts(products: ShopProduct[], sort: SortOption): ShopProduct[] {
  const sorted = [...products];

  switch (sort) {
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);

    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);

    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    default:
      return sorted;
  }
}

/**
 * Calculate price range from products
 */
export function calculatePriceRange(products: ShopProduct[]): {
  min: number;
  max: number;
} {
  if (products.length === 0) {
    return { min: 0, max: 1000 };
  }

  const prices = products.map((p) => p.price);
  return {
    min: Math.floor(Math.min(...prices) / 10) * 10,
    max: Math.ceil(Math.max(...prices) / 10) * 10,
  };
}

/**
 * Generate SEO-friendly category URL
 */
export function getCategoryUrl(locale: string, gender: 'men' | 'women', category?: string): string {
  const base = `/${locale}/shop/${gender}`;
  return category && category !== 'all' ? `${base}/${category}` : base;
}

/**
 * Parse category from product name or description
 */
export function inferCategoryFromProduct(product: ShopProduct): string {
  const text = `${product.name} ${product.description}`.toLowerCase();

  // Men's categories
  if (text.includes('jacket') || text.includes('coat')) return 'jackets-coats';
  if (text.includes('sweater') || text.includes('cardigan')) return 'knitwear';
  if (text.includes('shirt') && !text.includes('t-shirt')) return 'shirts';
  if (text.includes('t-shirt') || text.includes('tee')) return 't-shirts';
  if (text.includes('pants') || text.includes('trousers')) return 'pants';
  if (text.includes('jeans') || text.includes('denim')) return 'denim';

  // Women's categories
  if (text.includes('dress')) return 'dresses';
  if (text.includes('blouse') || text.includes('top')) return 'tops';
  if (text.includes('skirt')) return 'skirts';

  // Accessories
  if (
    text.includes('bag') ||
    text.includes('hat') ||
    text.includes('belt') ||
    text.includes('scarf')
  ) {
    return 'accessories';
  }

  return 'all';
}

/**
 * Determine gender from product category or name
 */
export function inferGenderFromProduct(product: ShopProduct): 'men' | 'women' | 'unisex' {
  const text = `${product.name} ${product.description} ${product.category?.name}`.toLowerCase();

  if (text.includes('men') || text.includes('man')) return 'men';
  if (text.includes('women') || text.includes('woman') || text.includes('dress')) return 'women';

  return 'unisex';
}
