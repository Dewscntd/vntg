/**
 * Shop Domain Types
 *
 * Type definitions for the shop domain following DDD principles.
 * All types are immutable and represent business entities.
 */

import { Database } from './supabase';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

/**
 * Gender types for shop navigation and product classification
 */
export type Gender = 'men' | 'women' | 'unisex' | 'kids' | 'teens';

/**
 * Season types for seasonal collections
 */
export type Season = 'spring-summer' | 'fall-winter' | 'all-season';

/**
 * Clothing condition for second-hand items
 */
export type ClothingCondition = 'excellent' | 'good' | 'fair';

/**
 * Sort options for product listings
 */
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

/**
 * Grid layout options (2 columns, 4 columns, or list view)
 */
export type GridLayout = 2 | 4 | 'list';

/**
 * Shop category with gender association
 */
export interface ShopCategory {
  id: string;
  slug: string;
  name: string;
  gender: Gender;
  description?: string;
  image_url?: string;
  product_count?: number;
}

/**
 * Rich clothing attributes for product descriptions
 */
export interface ClothingAttributes {
  material?: string; // e.g., "100% Cotton", "80% Wool, 20% Cashmere"
  country_of_origin?: string; // e.g., "Made in Italy", "Made in Portugal"
  care_instructions?: string; // e.g., "Machine wash cold, tumble dry low"
  sizes?: string[]; // ['XS', 'S', 'M', 'L', 'XL']
  size_guide_url?: string;
  colors?: string[]; // ['black', 'white', 'navy']
  condition?: ClothingCondition; // For second-hand items
}

/**
 * Seasonal collection metadata
 */
export interface SeasonalMetadata {
  season: Season;
  collection_year: number; // e.g., 2024, 2025
  is_current_season?: boolean;
}

/**
 * Enhanced product entity with fashion-specific attributes
 * Extends the base Product type from Supabase with additional fashion fields
 * Note: We override nullable season/collection_year from DB to make them required
 */
export interface FashionProduct
  extends Omit<Product, 'season' | 'collection_year' | 'material' | 'country_of_origin' | 'care_instructions'> {
  // Core classification (NEW - not in base Product)
  gender: Gender;
  clothing_type: string; // 'dresses', 'tops', 'jackets-coats', 'pants', 'shoes', etc.

  // Seasonal collection (override nullable types from base Product to required)
  season: Season;
  collection_year: number;

  // Rich clothing attributes (override nullable from Product to be more specific)
  material?: string;
  country_of_origin?: string;
  care_instructions?: string;

  // New attributes not in base Product
  sizes?: string[];
  size_guide_url?: string;
  colors?: string[];

  // Second-hand specific (NEW)
  condition?: ClothingCondition;
  original_price?: number; // For showing discount on pre-owned items

  // Computed fields (NEW)
  is_new?: boolean;
  is_sale?: boolean;
}

/**
 * Enhanced product type for shop display
 * Extends FashionProduct with additional UI-specific fields
 */
export interface ShopProduct extends FashionProduct {
  category?: Category;
}

/**
 * Seasonal collection configuration entity
 * Manages which season is currently active in the shop
 */
export interface SeasonalConfig {
  id: string;
  active_season: Season;
  active_year: number;
  is_active: boolean;
  start_date?: Date;
  end_date?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Filter state for product queries
 */
export interface ProductFilters {
  gender?: Gender;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  isNew?: boolean;
  isSale?: boolean;
}

/**
 * Sort and pagination state
 */
export interface ProductQueryState {
  filters: ProductFilters;
  sort: SortOption;
  page: number;
  limit: number;
}

/**
 * Product query result with pagination metadata
 */
export interface ProductQueryResult {
  products: ShopProduct[];
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
}

/**
 * Shop layout preferences (persisted)
 */
export interface ShopLayoutPreferences {
  gridLayout: GridLayout;
  lastVisitedGender: Gender;
  showFilters: boolean;
}

/**
 * Category navigation item
 */
export interface CategoryNavItem {
  slug: string;
  label: string;
  href: string;
  isActive: boolean;
}

/**
 * Price range for filtering
 */
export interface PriceRange {
  min: number;
  max: number;
  step: number;
}

/**
 * =============================================================================
 * API Data Transfer Objects (DTOs)
 * =============================================================================
 */

/**
 * Request DTO for shop products query
 * Used for API requests to fetch filtered and sorted products
 */
export interface ShopProductsQueryDTO {
  gender: Gender;
  category?: string;
  sort?: SortOption;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  page?: number;
  limit?: number;
  // Season is NOT a query param - it comes from admin config
}

/**
 * Response DTO for shop products
 * Provides products with pagination and active collection metadata
 */
export interface ShopProductsResponseDTO {
  status: 'success' | 'error';
  data: {
    products: ProductDTO[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    activeCollection: {
      season: Season;
      year: number;
    };
  };
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Product DTO for API responses
 * Optimized for client consumption with computed fields
 */
export interface ProductDTO {
  // Core identification
  id: string;
  name: string;
  description: string;

  // Pricing
  price: number;
  originalPrice?: number;
  discount?: number; // calculated percentage

  // Media
  imageUrl: string;

  // Classification
  gender: Gender;
  clothingType: string;

  // Seasonal
  season: Season;
  collectionYear: number;

  // Rich attributes
  material?: string;
  countryOfOrigin?: string;
  careInstructions?: string;

  // Variants
  sizes?: string[];
  colors?: string[];

  // Condition (for second-hand)
  condition?: ClothingCondition;

  // Availability
  inStock: boolean;
  inventoryCount?: number;

  // Flags
  isNew?: boolean;
  isFeatured?: boolean;
  isSale?: boolean;
}

/**
 * =============================================================================
 * CAMPAIGN & PRODUCT GROUPS (Admin Features)
 * =============================================================================
 */

/**
 * Campaign types for marketing and curation
 */
export type CampaignType = 'sale' | 'collection' | 'editorial' | 'seasonal' | 'new-arrivals';

/**
 * Campaign status
 */
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'expired' | 'archived';

/**
 * Product Group - A collection of products for campaigns
 */
export interface ProductGroup {
  id: string;
  name: string;
  description?: string;
  product_ids: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * Campaign - Marketing campaigns and curated collections
 */
export interface Campaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;

  // Product associations
  product_group_id?: string;
  product_ids: string[];

  // Scheduling
  start_date?: string;
  end_date?: string;

  // Display configuration
  banner_image_url?: string;
  thumbnail_url?: string;
  theme_color?: string;
  sort_order?: number;

  // Flags
  is_featured?: boolean;
  show_on_homepage?: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * Campaign with populated product data
 */
export interface CampaignWithProducts extends Campaign {
  products: ShopProduct[];
  product_count: number;
}

/**
 * Product Group with populated product data
 */
export interface ProductGroupWithProducts extends ProductGroup {
  products: ShopProduct[];
  product_count: number;
}

/**
 * DTO for creating/updating campaigns
 */
export interface CampaignFormData {
  name: string;
  slug?: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  product_ids: string[];
  start_date?: string;
  end_date?: string;
  banner_image_url?: string;
  thumbnail_url?: string;
  theme_color?: string;
  is_featured?: boolean;
  show_on_homepage?: boolean;
}

/**
 * DTO for creating/updating product groups
 */
export interface ProductGroupFormData {
  name: string;
  description?: string;
  product_ids: string[];
}

/**
 * Transforms a FashionProduct to ProductDTO for API responses
 */
export function toProductDTO(product: FashionProduct): ProductDTO {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : undefined;

  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    originalPrice: product.original_price,
    discount,
    imageUrl: product.image_url || '',
    gender: product.gender,
    clothingType: product.clothing_type,
    season: product.season,
    collectionYear: product.collection_year,
    material: product.material,
    countryOfOrigin: product.country_of_origin,
    careInstructions: product.care_instructions,
    sizes: product.sizes,
    colors: product.colors,
    condition: product.condition,
    inStock: product.inventory_count > 0,
    inventoryCount: product.inventory_count,
    isNew: product.is_new,
    isFeatured: product.is_featured,
    isSale: product.is_sale,
  };
}
