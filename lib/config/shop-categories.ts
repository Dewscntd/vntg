/**
 * Shop Categories Configuration
 *
 * Centralized configuration for shop categories per gender.
 * This follows the single source of truth principle for category data.
 */

import { ShopCategory } from '@/types/shop';

/**
 * Men's category definitions
 */
export const MEN_CATEGORIES: ShopCategory[] = [
  {
    id: 'men-all',
    slug: 'all',
    name: 'All',
    gender: 'men',
    description: "Shop all men's products",
  },
  {
    id: 'men-new-arrivals',
    slug: 'new-arrivals',
    name: 'New Arrivals',
    gender: 'men',
    description: "Latest additions to our men's collection",
  },
  {
    id: 'men-jackets-coats',
    slug: 'jackets-coats',
    name: 'Jackets & Coats',
    gender: 'men',
    description: 'Vintage jackets and coats for men',
  },
  {
    id: 'men-knitwear',
    slug: 'knitwear',
    name: 'Knitwear',
    gender: 'men',
    description: 'Sweaters, cardigans, and knit tops',
  },
  {
    id: 'men-shirts',
    slug: 'shirts',
    name: 'Shirts',
    gender: 'men',
    description: 'Casual and formal shirts',
  },
  {
    id: 'men-t-shirts',
    slug: 't-shirts',
    name: 'T-Shirts',
    gender: 'men',
    description: 'Vintage and graphic t-shirts',
  },
  {
    id: 'men-pants',
    slug: 'pants',
    name: 'Pants',
    gender: 'men',
    description: 'Trousers, chinos, and dress pants',
  },
  {
    id: 'men-denim',
    slug: 'denim',
    name: 'Denim',
    gender: 'men',
    description: 'Vintage jeans and denim jackets',
  },
  {
    id: 'men-accessories',
    slug: 'accessories',
    name: 'Accessories',
    gender: 'men',
    description: 'Hats, bags, belts, and more',
  },
];

/**
 * Women's category definitions
 */
export const WOMEN_CATEGORIES: ShopCategory[] = [
  {
    id: 'women-all',
    slug: 'all',
    name: 'All',
    gender: 'women',
    description: "Shop all women's products",
  },
  {
    id: 'women-new-arrivals',
    slug: 'new-arrivals',
    name: 'New Arrivals',
    gender: 'women',
    description: "Latest additions to our women's collection",
  },
  {
    id: 'women-dresses',
    slug: 'dresses',
    name: 'Dresses',
    gender: 'women',
    description: 'Vintage and contemporary dresses',
  },
  {
    id: 'women-tops',
    slug: 'tops',
    name: 'Tops',
    gender: 'women',
    description: 'Blouses, shirts, and casual tops',
  },
  {
    id: 'women-knitwear',
    slug: 'knitwear',
    name: 'Knitwear',
    gender: 'women',
    description: 'Sweaters, cardigans, and knit tops',
  },
  {
    id: 'women-jackets-coats',
    slug: 'jackets-coats',
    name: 'Jackets & Coats',
    gender: 'women',
    description: 'Vintage jackets and coats for women',
  },
  {
    id: 'women-pants',
    slug: 'pants',
    name: 'Pants',
    gender: 'women',
    description: 'Trousers, wide-leg pants, and more',
  },
  {
    id: 'women-skirts',
    slug: 'skirts',
    name: 'Skirts',
    gender: 'women',
    description: 'Midi, mini, and maxi skirts',
  },
  {
    id: 'women-accessories',
    slug: 'accessories',
    name: 'Accessories',
    gender: 'women',
    description: 'Bags, scarves, jewelry, and more',
  },
];

/**
 * Get categories by gender
 */
export function getCategoriesByGender(gender: 'men' | 'women'): ShopCategory[] {
  return gender === 'men' ? MEN_CATEGORIES : WOMEN_CATEGORIES;
}

/**
 * Find category by slug and gender
 */
export function findCategory(gender: 'men' | 'women', slug: string): ShopCategory | undefined {
  const categories = getCategoriesByGender(gender);
  return categories.find((cat) => cat.slug === slug);
}

/**
 * Get all category slugs for a gender (for static generation)
 */
export function getCategorySlugs(gender: 'men' | 'women'): string[] {
  return getCategoriesByGender(gender).map((cat) => cat.slug);
}

/**
 * Validate if a category slug exists for a gender
 */
export function isValidCategory(gender: 'men' | 'women', slug: string): boolean {
  return getCategorySlugs(gender).includes(slug);
}
