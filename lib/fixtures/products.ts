/**
 * Product Fixtures
 * Comprehensive test data for products across all categories
 */

import { Database } from '@/types/supabase';
import {
  menCategory,
  womenCategory,
  teensCategory,
  kidsCategory,
  booksMediaCategory,
  toysGamesCategory,
} from './categories';

type Product = Database['public']['Tables']['products']['Row'];

// Default product fields for new properties
const defaultProductFields = {
  discount_percent: 0,
  specifications: null,
  material: null,
  country_of_origin: null,
  care_instructions: null,
  season: null as 'spring-summer' | 'fall-winter' | 'all-season' | null,
  collection_year: null,
};

// Men's Products
export const denimJacket: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000001',
  name: 'Classic Denim Jacket',
  description:
    'Vintage-style denim jacket perfect for casual outings and layering. Made from premium cotton with durable construction.',
  price: 89.99,
  category_id: menCategory.id,
  image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
  inventory_count: 45,
  is_featured: true,
  stripe_product_id: 'prod_test_denim_jacket',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const casualShirt: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000002',
  name: 'Casual Button-Up Shirt',
  description:
    'Versatile button-up shirt for professional and casual wear. Breathable fabric with modern fit.',
  price: 54.99,
  category_id: menCategory.id,
  image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
  inventory_count: 70,
  is_featured: false,
  stripe_product_id: 'prod_test_casual_shirt',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const mensChinoPants: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000003',
  name: 'Premium Chino Pants',
  description:
    'Classic chino pants with a modern slim fit. Perfect for business casual or weekend wear.',
  price: 69.99,
  category_id: menCategory.id,
  image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
  inventory_count: 55,
  is_featured: false,
  stripe_product_id: 'prod_test_chino_pants',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Women's Products
export const floralDress: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000011',
  name: 'Floral Summer Dress',
  description:
    'Elegant floral dress perfect for summer occasions and everyday wear. Lightweight and comfortable.',
  price: 79.99,
  category_id: womenCategory.id,
  image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
  inventory_count: 60,
  is_featured: true,
  stripe_product_id: 'prod_test_floral_dress',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const eveningBlouse: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000012',
  name: 'Elegant Evening Blouse',
  description:
    'Sophisticated blouse perfect for evening events and dinner parties. Silky smooth fabric with modern cut.',
  price: 69.99,
  category_id: womenCategory.id,
  image_url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
  inventory_count: 40,
  is_featured: true,
  stripe_product_id: 'prod_test_evening_blouse',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const womensJeans: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000013',
  name: 'High-Rise Skinny Jeans',
  description:
    'Classic skinny jeans with high-rise fit. Premium denim with stretch for all-day comfort.',
  price: 84.99,
  category_id: womenCategory.id,
  image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
  inventory_count: 75,
  is_featured: false,
  stripe_product_id: 'prod_test_skinny_jeans',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Teens Products
export const streetwearHoodie: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000021',
  name: 'Streetwear Hoodie',
  description:
    'Trendy oversized hoodie with urban design, perfect for teens. Soft fleece interior.',
  price: 65.99,
  category_id: teensCategory.id,
  image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
  inventory_count: 80,
  is_featured: false,
  stripe_product_id: 'prod_test_hoodie',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const graphicTee: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000022',
  name: 'Vintage Graphic T-Shirt',
  description: 'Cool vintage-inspired graphic tee. 100% cotton with premium print quality.',
  price: 29.99,
  category_id: teensCategory.id,
  image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
  inventory_count: 100,
  is_featured: false,
  stripe_product_id: 'prod_test_graphic_tee',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Kids Products
export const kidsRainbowTee: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000031',
  name: 'Kids Rainbow T-Shirt',
  description:
    'Colorful and comfortable t-shirt with fun rainbow design for children. Soft cotton blend.',
  price: 24.99,
  category_id: kidsCategory.id,
  image_url: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800',
  inventory_count: 120,
  is_featured: false,
  stripe_product_id: 'prod_test_kids_tee',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const kidsOveralls: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000032',
  name: 'Denim Overalls',
  description: 'Classic denim overalls for kids. Durable and comfortable with adjustable straps.',
  price: 39.99,
  category_id: kidsCategory.id,
  image_url: 'https://images.unsplash.com/photo-1622290291468-a28f7a7e3d2e?w=800',
  inventory_count: 65,
  is_featured: false,
  stripe_product_id: 'prod_test_overalls',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Books & Media
export const fashionPhotographyBook: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000041',
  name: 'Fashion Photography Book',
  description:
    'Stunning collection of contemporary fashion photography from renowned artists worldwide.',
  price: 39.99,
  category_id: booksMediaCategory.id,
  image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
  inventory_count: 30,
  is_featured: false,
  stripe_product_id: 'prod_test_fashion_book',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const styleGuideBook: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000042',
  name: 'Complete Style Guide',
  description:
    'Comprehensive guide to personal style, wardrobe essentials, and fashion fundamentals.',
  price: 29.99,
  category_id: booksMediaCategory.id,
  image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
  inventory_count: 45,
  is_featured: false,
  stripe_product_id: 'prod_test_style_guide',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Toys & Games
export const designerPuzzle: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000051',
  name: 'Designer Puzzle Game',
  description: 'Creative puzzle game featuring fashion designs and patterns. 1000 pieces.',
  price: 32.99,
  category_id: toysGamesCategory.id,
  image_url: 'https://images.unsplash.com/photo-1551431009-a802eeec77b1?w=800',
  inventory_count: 50,
  is_featured: false,
  stripe_product_id: 'prod_test_puzzle',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const fashionDollSet: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000052',
  name: 'Fashion Designer Doll Set',
  description: 'Complete fashion designer doll set with interchangeable outfits and accessories.',
  price: 44.99,
  category_id: toysGamesCategory.id,
  image_url: 'https://images.unsplash.com/photo-1578070181910-f1e514afdd08?w=800',
  inventory_count: 35,
  is_featured: false,
  stripe_product_id: 'prod_test_doll_set',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Low inventory product (for testing low stock scenarios)
export const limitedEditionJacket: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000061',
  name: 'Limited Edition Leather Jacket',
  description:
    'Exclusive limited edition leather jacket. Premium Italian leather with custom hardware.',
  price: 299.99,
  category_id: menCategory.id,
  image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
  inventory_count: 3,
  is_featured: true,
  stripe_product_id: 'prod_test_limited_jacket',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Out of stock product (for testing OOS scenarios)
export const soldOutSneakers: Product = {
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000062',
  name: 'Designer Sneakers',
  description: 'Sold out designer sneakers - check back for restock.',
  price: 149.99,
  category_id: teensCategory.id,
  image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
  inventory_count: 0,
  is_featured: false,
  stripe_product_id: 'prod_test_sneakers',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const productFixtures: Product[] = [
  // Men's
  denimJacket,
  casualShirt,
  mensChinoPants,

  // Women's
  floralDress,
  eveningBlouse,
  womensJeans,

  // Teens
  streetwearHoodie,
  graphicTee,

  // Kids
  kidsRainbowTee,
  kidsOveralls,

  // Books & Media
  fashionPhotographyBook,
  styleGuideBook,

  // Toys & Games
  designerPuzzle,
  fashionDollSet,

  // Special cases
  limitedEditionJacket,
  soldOutSneakers,
];

// Featured products only
export const featuredProducts = productFixtures.filter((p) => p.is_featured);

// In-stock products only
export const inStockProducts = productFixtures.filter((p) => (p.inventory_count ?? 0) > 0);

// Helper to create a product with custom properties
export const createProductFixture = (overrides: Partial<Product> = {}): Product => ({
  ...defaultProductFields,
  id: '20000000-0000-0000-0000-000000000099',
  name: 'Test Product',
  description: 'Test product description',
  price: 99.99,
  category_id: menCategory.id,
  image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  inventory_count: 100,
  is_featured: false,
  stripe_product_id: 'prod_test_product',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});
