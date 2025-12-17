# Product Entity Design - Fashion E-Commerce

## Overview

This document describes the comprehensive product entity design for a fashion e-commerce platform with seasonal collections, rich product descriptions, and second-hand marketplace capabilities.

## Architecture Principles

This design follows **Domain-Driven Design (DDD)** principles with clear separation of concerns:

- **Entities**: Immutable business objects representing core domain concepts
- **DTOs**: Data Transfer Objects for API communication
- **Value Objects**: Self-contained, immutable data structures (Season, Gender, etc.)
- **Aggregates**: Product is the aggregate root for clothing attributes and inventory

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       SeasonalConfig                             │
│  - id: string                                                    │
│  - active_season: Season                                         │
│  - active_year: number                                           │
│  - is_active: boolean                                            │
│  - start_date: Date                                              │
│  - end_date: Date                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ configures
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FashionProduct                             │
├─────────────────────────────────────────────────────────────────┤
│ Core Fields:                                                     │
│  - id: string                                                    │
│  - name: string                                                  │
│  - description: string                                           │
│  - price: number                                                 │
│  - image_url: string                                             │
│  - inventory_count: number                                       │
│  - is_featured: boolean                                          │
│                                                                  │
│ Classification:                                                  │
│  - gender: Gender ('men' | 'women' | 'unisex' | 'kids' | 'teens')│
│  - clothing_type: string (e.g., 'dresses', 'jackets-coats')     │
│  - category_id: string (FK to categories)                        │
│                                                                  │
│ Seasonal Collection:                                             │
│  - season: Season ('spring-summer' | 'fall-winter' | 'all-season')│
│  - collection_year: number (e.g., 2025)                          │
│                                                                  │
│ Rich Attributes (ClothingAttributes):                            │
│  - material?: string (e.g., "70% Wool, 30% Cashmere")           │
│  - country_of_origin?: string (e.g., "Made in Italy")           │
│  - care_instructions?: string                                    │
│  - sizes?: string[] (e.g., ['XS', 'S', 'M', 'L', 'XL'])        │
│  - colors?: string[] (e.g., ['black', 'navy', 'camel'])        │
│                                                                  │
│ Second-Hand Attributes:                                          │
│  - condition?: ClothingCondition ('excellent' | 'good' | 'fair') │
│  - original_price?: number (for showing discount)                │
│                                                                  │
│ Computed Fields:                                                 │
│  - is_new?: boolean                                              │
│  - is_sale?: boolean                                             │
│  - discount_percent?: number (calculated from original_price)    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ belongs to
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Category                                 │
│  - id: string                                                    │
│  - name: string                                                  │
│  - description: string                                           │
│  - parent_id: string?                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Core Entities

### 1. FashionProduct Entity

The central entity representing a fashion product with comprehensive attributes.

```typescript
interface FashionProduct extends Product {
  // Core classification
  gender: Gender;
  clothing_type: string;

  // Seasonal collection
  season: Season;
  collection_year: number;

  // Rich clothing attributes
  material?: string;
  country_of_origin?: string;
  care_instructions?: string;
  sizes?: string[];
  size_guide_url?: string;
  colors?: string[];

  // Second-hand specific
  condition?: ClothingCondition;
  original_price?: number;

  // Computed fields
  is_new?: boolean;
  is_sale?: boolean;
  discount_percent?: number;
}
```

**Invariants:**
- `gender` is required - every product must have a gender classification
- `season` is required - products belong to a seasonal collection
- `collection_year` is required - tracks which year's collection
- `price` must be > 0
- `inventory_count` must be >= 0
- If `original_price` exists, it must be > `price`
- `discount_percent` is calculated: `((original_price - price) / original_price) * 100`

**Business Rules:**
1. Products are filtered by active season from `SeasonalConfig`
2. Products with `season: 'all-season'` appear in all collections
3. Products with `condition` field are second-hand items
4. Products with `original_price` show as "sale" items with discount badges

### 2. SeasonalConfig Entity

Manages which seasonal collection is currently active in the shop.

```typescript
interface SeasonalConfig {
  id: string;
  active_season: Season;
  active_year: number;
  is_active: boolean;
  start_date?: Date;
  end_date?: Date;
  created_at: Date;
  updated_at: Date;
}
```

**Invariants:**
- Only one `SeasonalConfig` can have `is_active: true` at a time
- `active_year` should be current year or next year
- `start_date` must be before `end_date` if both exist

**Business Rules:**
1. Admin panel configures active season and year
2. Shop automatically filters products by active season
3. Season transitions are managed by changing active config

### 3. Value Objects

#### Gender
```typescript
type Gender = 'men' | 'women' | 'unisex' | 'kids' | 'teens';
```

Used for:
- Product classification
- Shop navigation (men's shop, women's shop)
- URL routing (`/shop/men`, `/shop/women`)

#### Season
```typescript
type Season = 'spring-summer' | 'fall-winter' | 'all-season';
```

Used for:
- Seasonal collection management
- Product filtering
- Collection year tracking

#### ClothingCondition
```typescript
type ClothingCondition = 'excellent' | 'good' | 'fair';
```

Used for:
- Second-hand item quality classification
- Price justification
- Customer expectations

## API Layer - Data Transfer Objects (DTOs)

### Request DTO

```typescript
interface ShopProductsQueryDTO {
  gender: Gender;              // Required for shop filtering
  category?: string;
  sort?: SortOption;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  page?: number;
  limit?: number;
  // Note: season is NOT a query param - comes from admin config
}
```

### Response DTO

```typescript
interface ShopProductsResponseDTO {
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
```

### Product DTO

Optimized for client consumption with camelCase naming and computed fields.

```typescript
interface ProductDTO {
  // Core
  id: string;
  name: string;
  description: string;

  // Pricing
  price: number;
  originalPrice?: number;
  discount?: number;           // Calculated percentage

  // Media
  imageUrl: string;

  // Classification
  gender: Gender;
  clothingType: string;
  season: Season;
  collectionYear: number;

  // Rich attributes
  material?: string;
  countryOfOrigin?: string;
  careInstructions?: string;
  sizes?: string[];
  colors?: string[];
  condition?: ClothingCondition;

  // Availability
  inStock: boolean;
  inventoryCount?: number;

  // Flags
  isNew?: boolean;
  isFeatured?: boolean;
  isSale?: boolean;
}
```

## Filtering Logic

### 1. Seasonal Filtering (Automatic)

```typescript
// API always filters by active season
products = products.filter(p =>
  (p.season === activeConfig.active_season || p.season === 'all-season') &&
  p.collection_year === activeConfig.active_year
);
```

### 2. Gender Filtering (Required for Shop)

```typescript
// Shop page MUST include gender parameter
if (gender) {
  products = products.filter(p => p.gender === gender);
}
```

### 3. Additional Filters (Optional)

- **Clothing Type**: `p.clothing_type === clothingType`
- **Price Range**: `p.price >= minPrice && p.price <= maxPrice`
- **Stock**: `p.inventory_count > 0`
- **New Items**: `p.is_new === true`
- **Sale Items**: `p.is_sale === true`
- **Search**: Match against name, description, material, clothing_type

## Admin Panel Integration

### Seasonal Config Management

Admin panel should provide:
1. View current active season and year
2. Change active season (spring-summer, fall-winter, all-season)
3. Set collection year
4. Set start/end dates for season
5. Preview products in selected season

### Product Management

Admin panel should allow:
1. Create products with all fashion attributes
2. Set gender and clothing type
3. Assign to seasonal collection
4. Mark as new/featured/sale
5. Set second-hand condition and original price
6. Manage inventory by size/color

## Database Schema Extensions

### Required Columns

Add these columns to `products` table:

```sql
-- Classification
gender VARCHAR(20) NOT NULL CHECK (gender IN ('men', 'women', 'unisex', 'kids', 'teens')),
clothing_type VARCHAR(100) NOT NULL,

-- Seasonal
season VARCHAR(20) NOT NULL CHECK (season IN ('spring-summer', 'fall-winter', 'all-season')),
collection_year INTEGER NOT NULL,

-- Rich attributes
material TEXT,
country_of_origin VARCHAR(200),
care_instructions TEXT,
sizes JSONB,
colors JSONB,

-- Second-hand
condition VARCHAR(20) CHECK (condition IN ('excellent', 'good', 'fair')),
original_price NUMERIC(10,2),

-- Flags
is_new BOOLEAN DEFAULT false,
is_sale BOOLEAN DEFAULT false
```

### Indexes

```sql
-- Critical for shop filtering performance
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_season ON products(season, collection_year);
CREATE INDEX idx_products_clothing_type ON products(clothing_type);
CREATE INDEX idx_products_gender_season ON products(gender, season, collection_year);
```

### New Table: seasonal_configs

```sql
CREATE TABLE seasonal_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  active_season VARCHAR(20) NOT NULL CHECK (active_season IN ('spring-summer', 'fall-winter', 'all-season')),
  active_year INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Only one active config at a time
  CONSTRAINT unique_active_config UNIQUE (is_active) WHERE (is_active = true)
);
```

## Mock Data Structure

See `/lib/stubs/mock-data.ts` for complete examples.

### Seasonal Config
```typescript
export const mockSeasonalConfig: SeasonalConfig = {
  id: 'seasonal-config-1',
  active_season: 'fall-winter',
  active_year: 2025,
  is_active: true,
  start_date: new Date('2024-09-01'),
  end_date: new Date('2025-03-31'),
  created_at: new Date('2024-09-01'),
  updated_at: new Date('2024-09-01'),
};
```

### Fashion Products
12 products with mix of:
- 6 women's items
- 6 men's items
- All fall-winter 2025 collection
- Mix of new/sale items
- Mix of first-hand and second-hand (with condition)
- Rich attributes (material, country of origin, care instructions)
- Multiple sizes and colors

## API Implementation

### GET /api/products

**Query Parameters:**
- `gender` (required for shop): 'men' | 'women'
- `category` (optional): category slug
- `sort` (optional): 'newest' | 'price-asc' | 'price-desc'
- `minPrice` (optional): minimum price filter
- `maxPrice` (optional): maximum price filter
- `inStock` (optional): boolean
- `new` (optional): show only new items
- `sale` (optional): show only sale items
- `page` (optional): page number
- `limit` (optional): items per page

**Response:**
```json
{
  "status": "success",
  "data": {
    "products": [...],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    },
    "activeCollection": {
      "season": "fall-winter",
      "year": 2025
    }
  }
}
```

## Testing Strategy

### Unit Tests
1. Test seasonal filtering logic
2. Test gender filtering
3. Test price range filtering
4. Test DTO transformations
5. Test discount calculation

### Integration Tests
1. Test API with various filter combinations
2. Test seasonal config changes
3. Test product creation with all attributes
4. Test inventory management by size/color

### E2E Tests
1. Navigate to men's shop - verify products appear
2. Navigate to women's shop - verify products appear
3. Apply filters and verify results
4. Test pagination
5. Test product detail page with all attributes

## Performance Considerations

### Caching Strategy
- Cache active seasonal config (changes infrequently)
- Cache product list by gender (invalidate on product updates)
- Cache product detail pages (invalidate on product update)

### Query Optimization
- Index on (gender, season, collection_year) for shop queries
- Limit response to 50 items per page
- Lazy load product images
- Preload featured products on homepage

### Scale Considerations
- **10K products**: Current indexes sufficient
- **100K products**: Consider partitioning by gender
- **1M+ products**: Consider separate tables per gender, ElasticSearch for search

## Migration Path

### Phase 1: Add Required Fields (Immediate)
1. Add gender, season, collection_year columns
2. Update existing products with default values
3. Create seasonal_configs table with default config

### Phase 2: Add Rich Attributes (Week 2)
1. Add material, country_of_origin, care_instructions
2. Add sizes, colors JSONB columns
3. Backfill data for existing products

### Phase 3: Add Second-Hand Features (Week 3)
1. Add condition, original_price columns
2. Update UI to show condition badges
3. Add discount calculation logic

### Phase 4: Admin Panel (Week 4)
1. Build seasonal config management UI
2. Add product form with all new fields
3. Add bulk import for seasonal collections

## Troubleshooting

### Issue: Shop shows 0 products

**Diagnosis:**
1. Check if products have `gender` field populated
2. Verify API includes `gender` query parameter
3. Check seasonal config is active
4. Verify products match active season

**Solution:**
- Ensure all products in mock data have `gender: 'men' | 'women'`
- Ensure shop page passes `gender` parameter to API
- Verify seasonal filtering logic includes 'all-season' products

### Issue: Wrong products showing in season

**Diagnosis:**
1. Check active seasonal config
2. Verify product season and collection_year
3. Check if products are marked 'all-season'

**Solution:**
- Update seasonal config to correct season/year
- Update products to match correct season
- Mark evergreen products as 'all-season'

## References

- Entity implementation: `/types/shop.ts`
- Mock data: `/lib/stubs/mock-data.ts`
- API implementation: `/app/[locale]/api/products/route.ts`
- Shop component: `/app/[locale]/shop/[gender]/shop-content.tsx`
