# Gender-Based Shop Backend Implementation Plan

## Executive Summary

This document outlines the comprehensive backend changes required to support gender-based shop pages with advanced filtering capabilities. The implementation follows domain-driven design principles, maintains backward compatibility, and ensures scalability for future growth.

---

## 1. Database Schema Changes

### 1.1 Products Table Migration

**Migration File**: `supabase/migrations/20241217000000_add_gender_shop_fields.sql`

```sql
-- Add new columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('men', 'women', 'unisex')),
  ADD COLUMN IF NOT EXISTS clothing_type TEXT,
  ADD COLUMN IF NOT EXISTS sizes TEXT[], -- Array of sizes
  ADD COLUMN IF NOT EXISTS colors TEXT[], -- Array of colors
  ADD COLUMN IF NOT EXISTS condition TEXT CHECK (condition IN ('excellent', 'good', 'fair')),
  ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2) CHECK (original_price >= 0);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
CREATE INDEX IF NOT EXISTS idx_products_clothing_type ON public.products(clothing_type);
CREATE INDEX IF NOT EXISTS idx_products_sizes ON public.products USING GIN(sizes);
CREATE INDEX IF NOT EXISTS idx_products_colors ON public.products USING GIN(colors);
CREATE INDEX IF NOT EXISTS idx_products_condition ON public.products(condition);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_gender_clothing ON public.products(gender, clothing_type);
CREATE INDEX IF NOT EXISTS idx_products_gender_price ON public.products(gender, price);

-- Add comments for documentation
COMMENT ON COLUMN public.products.gender IS 'Target gender: men, women, or unisex';
COMMENT ON COLUMN public.products.clothing_type IS 'Category of clothing: dresses, tops, knitwear, jackets-coats, pants, skirts, shirts, t-shirts, denim, accessories';
COMMENT ON COLUMN public.products.sizes IS 'Available sizes as array: XS, S, M, L, XL, XXL';
COMMENT ON COLUMN public.products.colors IS 'Available colors as array';
COMMENT ON COLUMN public.products.condition IS 'Second-hand condition: excellent, good, fair';
COMMENT ON COLUMN public.products.original_price IS 'Original price before discount (for showing savings)';
```

### 1.2 Data Validation Constraints

**Key Design Decisions**:
- Use PostgreSQL arrays for `sizes` and `colors` to support efficient filtering with GIN indexes
- Use CHECK constraints for enum-like values (gender, condition) to ensure data integrity at DB level
- `original_price` is nullable to support items that are not discounted
- All new fields are nullable initially to maintain backward compatibility

### 1.3 Migration Strategy

**Rollout Phases**:

1. **Phase 1 - Schema Update** (Zero Downtime)
   - Add all new columns as nullable
   - Deploy schema changes to production
   - Existing queries continue to work

2. **Phase 2 - Data Backfill** (Background Process)
   ```sql
   -- Example backfill query
   UPDATE public.products
   SET
     gender = CASE
       WHEN category_id IN (SELECT id FROM categories WHERE name ILIKE '%woman%') THEN 'women'
       WHEN category_id IN (SELECT id FROM categories WHERE name ILIKE '%man%') THEN 'men'
       ELSE 'unisex'
     END,
     clothing_type = 'tops', -- Default, to be manually updated
     sizes = ARRAY['S', 'M', 'L'], -- Default sizes
     colors = ARRAY['black'], -- Default color
     condition = 'excellent' -- Default condition
   WHERE gender IS NULL;
   ```

3. **Phase 3 - Add NOT NULL Constraints** (After Backfill)
   ```sql
   ALTER TABLE public.products
     ALTER COLUMN gender SET NOT NULL,
     ALTER COLUMN clothing_type SET NOT NULL,
     ALTER COLUMN sizes SET NOT NULL,
     ALTER COLUMN colors SET NOT NULL,
     ALTER COLUMN condition SET NOT NULL;
   ```

---

## 2. TypeScript Type Definitions

### 2.1 Update Supabase Types

**File**: `types/supabase.ts`

```typescript
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          created_at: string;
          updated_at: string;
          category_id: string | null;
          inventory_count: number;
          is_featured: boolean;
          stripe_product_id: string | null;

          // New fields
          gender: 'men' | 'women' | 'unisex';
          clothing_type: ClothingType;
          sizes: Size[];
          colors: Color[];
          condition: 'excellent' | 'good' | 'fair';
          original_price: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
          category_id?: string | null;
          inventory_count?: number;
          is_featured?: boolean;
          stripe_product_id?: string | null;

          // New fields
          gender: 'men' | 'women' | 'unisex';
          clothing_type: ClothingType;
          sizes: Size[];
          colors: Color[];
          condition: 'excellent' | 'good' | 'fair';
          original_price?: number | null;
        };
        Update: {
          // Same as Insert but all fields optional
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
          category_id?: string | null;
          inventory_count?: number;
          is_featured?: boolean;
          stripe_product_id?: string | null;
          gender?: 'men' | 'women' | 'unisex';
          clothing_type?: ClothingType;
          sizes?: Size[];
          colors?: Color[];
          condition?: 'excellent' | 'good' | 'fair';
          original_price?: number | null;
        };
      };
      // ... other tables
    };
  };
}

// Type definitions
export type ClothingType =
  | 'dresses'
  | 'tops'
  | 'knitwear'
  | 'jackets-coats'
  | 'pants'
  | 'skirts'
  | 'shirts'
  | 't-shirts'
  | 'denim'
  | 'accessories';

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type Color =
  | 'black'
  | 'white'
  | 'gray'
  | 'blue'
  | 'red'
  | 'green'
  | 'brown'
  | 'beige'
  | 'pink'
  | 'yellow'
  | 'orange'
  | 'purple';

export type Gender = 'men' | 'women' | 'unisex';

export type Condition = 'excellent' | 'good' | 'fair';
```

### 2.2 Product Domain Types

**File**: `types/product.ts`

```typescript
import { Database } from './supabase';

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

// Enhanced product with computed fields
export interface EnhancedProduct extends Product {
  discount_amount?: number;
  final_price: number;
  is_on_sale: boolean;
  category?: {
    id: string;
    name: string;
  };
}

// Filter options for shop page
export interface ProductFilters {
  gender?: Gender;
  category?: ClothingType;
  minPrice?: number;
  maxPrice?: number;
  sizes?: Size[];
  colors?: Color[];
  condition?: Condition;
  inStock?: boolean;
  search?: string;
}

// Sort options
export type ProductSortOption =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc';

// API response shape
export interface ProductsResponse {
  products: EnhancedProduct[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Filter options response
export interface FilterOptionsResponse {
  priceRange: {
    min: number;
    max: number;
  };
  sizes: Size[];
  colors: Color[];
  categories: ClothingType[];
  conditions: Condition[];
}
```

---

## 3. API Endpoints Specification

### 3.1 GET /api/shop/products

**Purpose**: Fetch products with advanced filtering for shop pages

**Query Parameters**:
```typescript
interface ShopProductsQuery {
  // Required
  gender: 'men' | 'women';

  // Filtering
  category?: ClothingType;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string; // Comma-separated: "S,M,L"
  colors?: string; // Comma-separated: "black,white"
  condition?: Condition;
  inStock?: boolean; // Filter products with inventory_count > 0
  search?: string; // Search in name and description

  // Sorting
  sort?: ProductSortOption; // Default: 'newest'

  // Pagination
  page?: number; // Default: 1
  limit?: number; // Default: 24, Max: 100
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "products": EnhancedProduct[],
    "pagination": {
      "total": 145,
      "limit": 24,
      "offset": 0,
      "hasMore": true,
      "currentPage": 1,
      "totalPages": 7
    }
  }
}
```

**Implementation File**: `app/[locale]/api/shop/products/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { shopProductsQuerySchema } from '@/lib/validations/shop';
import { withQueryValidation } from '@/lib/api/middleware';
import { successResponse, handleServerError } from '@/lib/api';
import { USE_STUBS, getFilteredMockProducts } from '@/lib/stubs/shop';

export async function GET(req: NextRequest) {
  // Stub mode implementation
  if (USE_STUBS) {
    return handleStubRequest(req);
  }

  return withQueryValidation(req, shopProductsQuerySchema, async (req, query) => {
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient<Database>({
        cookies: () => cookieStore as any
      });

      const {
        gender,
        category,
        minPrice,
        maxPrice,
        sizes,
        colors,
        condition,
        inStock,
        search,
        sort = 'newest',
        page = 1,
        limit = 24,
      } = query;

      // Build query
      let dbQuery = supabase
        .from('products')
        .select('*, categories!category_id(id, name)', { count: 'exact' })
        .eq('gender', gender);

      // Apply filters
      if (category) {
        dbQuery = dbQuery.eq('clothing_type', category);
      }

      if (minPrice !== undefined) {
        dbQuery = dbQuery.gte('price', minPrice);
      }

      if (maxPrice !== undefined) {
        dbQuery = dbQuery.lte('price', maxPrice);
      }

      if (sizes && sizes.length > 0) {
        // Use overlaps operator for array fields
        dbQuery = dbQuery.overlaps('sizes', sizes);
      }

      if (colors && colors.length > 0) {
        dbQuery = dbQuery.overlaps('colors', colors);
      }

      if (condition) {
        dbQuery = dbQuery.eq('condition', condition);
      }

      if (inStock) {
        dbQuery = dbQuery.gt('inventory_count', 0);
      }

      if (search) {
        dbQuery = dbQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply sorting
      switch (sort) {
        case 'price-asc':
          dbQuery = dbQuery.order('price', { ascending: true });
          break;
        case 'price-desc':
          dbQuery = dbQuery.order('price', { ascending: false });
          break;
        case 'name-asc':
          dbQuery = dbQuery.order('name', { ascending: true });
          break;
        case 'name-desc':
          dbQuery = dbQuery.order('name', { ascending: false });
          break;
        case 'newest':
        default:
          dbQuery = dbQuery.order('created_at', { ascending: false });
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      dbQuery = dbQuery.range(offset, offset + limit - 1);

      // Execute query
      const { data: products, count, error } = await dbQuery;

      if (error) throw error;

      // Enhance products with computed fields
      const enhancedProducts = products?.map(p => ({
        ...p,
        final_price: p.original_price
          ? p.original_price - (p.original_price * (p.discount_percent || 0) / 100)
          : p.price,
        is_on_sale: !!p.original_price && p.original_price > p.price,
        discount_amount: p.original_price ? p.original_price - p.price : 0,
      })) || [];

      return successResponse({
        products: enhancedProducts,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: offset + limit < (count || 0),
          currentPage: page,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    } catch (error) {
      return handleServerError(error as Error);
    }
  });
}
```

**Query Performance Optimization**:
- Uses composite indexes (gender + clothing_type, gender + price)
- GIN indexes for array overlap operations (sizes, colors)
- Single database round-trip with joins
- Response time target: <100ms for uncached queries at scale

**Scalability Considerations**:
- At 10,000 products: All queries remain sub-50ms with proper indexes
- At 100,000 products: Consider materialized views for filter options
- At 1M+ products: Implement Elasticsearch for full-text search and faceted filtering

### 3.2 GET /api/shop/filters

**Purpose**: Get available filter options based on current selection

**Query Parameters**:
```typescript
interface FilterOptionsQuery {
  gender: 'men' | 'women';
  category?: ClothingType; // Pre-filter options based on category
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "priceRange": {
      "min": 19.99,
      "max": 299.99
    },
    "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
    "colors": ["black", "white", "gray", "blue", "red"],
    "categories": ["dresses", "tops", "knitwear", ...],
    "conditions": ["excellent", "good", "fair"]
  }
}
```

**Implementation File**: `app/[locale]/api/shop/filters/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { successResponse, handleServerError } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const gender = url.searchParams.get('gender') as 'men' | 'women';
    const category = url.searchParams.get('category');

    if (!gender) {
      return Response.json(
        { success: false, error: 'Gender parameter is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore as any
    });

    // Build base query
    let query = supabase
      .from('products')
      .select('price, sizes, colors, clothing_type, condition')
      .eq('gender', gender);

    if (category) {
      query = query.eq('clothing_type', category);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    // Aggregate filter options
    const priceRange = {
      min: Math.min(...(products?.map(p => p.price) || [0])),
      max: Math.max(...(products?.map(p => p.price) || [0])),
    };

    // Collect unique values using Set
    const sizesSet = new Set<string>();
    const colorsSet = new Set<string>();
    const categoriesSet = new Set<string>();
    const conditionsSet = new Set<string>();

    products?.forEach(product => {
      product.sizes?.forEach(size => sizesSet.add(size));
      product.colors?.forEach(color => colorsSet.add(color));
      if (product.clothing_type) categoriesSet.add(product.clothing_type);
      if (product.condition) conditionsSet.add(product.condition);
    });

    return successResponse({
      priceRange,
      sizes: Array.from(sizesSet).sort(),
      colors: Array.from(colorsSet).sort(),
      categories: Array.from(categoriesSet).sort(),
      conditions: Array.from(conditionsSet).sort(),
    });
  } catch (error) {
    return handleServerError(error as Error);
  }
}
```

**Caching Strategy**:
- Cache filter options for 5 minutes (sliding window)
- Invalidate cache on product updates
- Use Redis for distributed caching in production
- CDN edge caching for static filter lists

### 3.3 Update Existing /api/products Endpoint

**Changes Required**:
- Add support for new fields in POST and PATCH operations
- Update validation schemas
- Maintain backward compatibility for existing clients

**File**: `app/[locale]/api/products/route.ts` (existing file, add new fields)

---

## 4. Validation Schemas

### 4.1 Shop Products Query Schema

**File**: `lib/validations/shop.ts` (new file)

```typescript
import { z } from 'zod';
import { ClothingType, Size, Color, Condition, Gender } from '@/types/supabase';

// Enum schemas
export const genderSchema = z.enum(['men', 'women', 'unisex']);

export const clothingTypeSchema = z.enum([
  'dresses',
  'tops',
  'knitwear',
  'jackets-coats',
  'pants',
  'skirts',
  'shirts',
  't-shirts',
  'denim',
  'accessories',
]);

export const sizeSchema = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']);

export const colorSchema = z.enum([
  'black',
  'white',
  'gray',
  'blue',
  'red',
  'green',
  'brown',
  'beige',
  'pink',
  'yellow',
  'orange',
  'purple',
]);

export const conditionSchema = z.enum(['excellent', 'good', 'fair']);

export const sortOptionSchema = z.enum([
  'newest',
  'price-asc',
  'price-desc',
  'name-asc',
  'name-desc',
]);

// Shop products query schema
export const shopProductsQuerySchema = z.object({
  // Required
  gender: genderSchema,

  // Filtering
  category: clothingTypeSchema.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sizes: z.string()
    .optional()
    .transform(val => val ? val.split(',').filter(Boolean) : [])
    .pipe(z.array(sizeSchema)),
  colors: z.string()
    .optional()
    .transform(val => val ? val.split(',').filter(Boolean) : [])
    .pipe(z.array(colorSchema)),
  condition: conditionSchema.optional(),
  inStock: z.coerce.boolean().optional(),
  search: z.string().optional(),

  // Sorting
  sort: sortOptionSchema.default('newest'),

  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export type ShopProductsQuery = z.infer<typeof shopProductsQuerySchema>;
```

### 4.2 Update Product Schema

**File**: `lib/validations/product.ts` (update existing)

```typescript
import { z } from 'zod';
import {
  genderSchema,
  clothingTypeSchema,
  sizeSchema,
  colorSchema,
  conditionSchema
} from './shop';

// Extended product schema with new fields
export const productSchema = z.object({
  // Existing fields
  name: z.string().min(1, { message: 'Product name is required' }),
  description: z.string().nullable().optional(),
  price: z.number().min(0, { message: 'Price must be a positive number' }),
  discount_percent: z.number().min(0).max(100).default(0),
  image_url: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'Invalid image URL',
    }),
  category_id: z.string().uuid({ message: 'Invalid category ID' }).nullable().optional(),
  inventory_count: z
    .number()
    .int()
    .min(0, { message: 'Inventory count must be a non-negative integer' })
    .default(0),
  is_featured: z.boolean().default(false),
  specifications: z.record(z.string()).optional().default({}),
  stripe_product_id: z.string().nullable().optional(),

  // New fields for gender-based shop
  gender: genderSchema,
  clothing_type: clothingTypeSchema,
  sizes: z.array(sizeSchema).min(1, { message: 'At least one size is required' }),
  colors: z.array(colorSchema).min(1, { message: 'At least one color is required' }),
  condition: conditionSchema,
  original_price: z.number().min(0).nullable().optional(),
});

// Validation: If original_price is provided, it must be >= price
export const createProductSchema = productSchema.refine(
  (data) => {
    if (data.original_price !== null && data.original_price !== undefined) {
      return data.original_price >= data.price;
    }
    return true;
  },
  {
    message: 'Original price must be greater than or equal to current price',
    path: ['original_price'],
  }
);

export const updateProductSchema = productSchema.partial();

// Types
export type ProductFormData = z.infer<typeof productSchema>;
```

---

## 5. Admin Panel Modifications

### 5.1 Product Form Updates

**File**: `app/[locale]/admin/products/new/page.tsx` (update existing)

**Changes Required**:

1. **Add Gender Selector**
```typescript
<div>
  <Label htmlFor="gender">Gender *</Label>
  <Select
    value={formData.gender}
    onValueChange={(value) => handleInputChange('gender', value)}
    required
  >
    <SelectTrigger>
      <SelectValue placeholder="Select gender" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="women">Women</SelectItem>
      <SelectItem value="men">Men</SelectItem>
      <SelectItem value="unisex">Unisex</SelectItem>
    </SelectContent>
  </Select>
</div>
```

2. **Add Clothing Type Selector**
```typescript
<div>
  <Label htmlFor="clothing_type">Clothing Type *</Label>
  <Select
    value={formData.clothing_type}
    onValueChange={(value) => handleInputChange('clothing_type', value)}
    required
  >
    <SelectTrigger>
      <SelectValue placeholder="Select clothing type" />
    </SelectTrigger>
    <SelectContent>
      {formData.gender === 'women' && (
        <>
          <SelectItem value="dresses">Dresses</SelectItem>
          <SelectItem value="skirts">Skirts</SelectItem>
        </>
      )}
      <SelectItem value="tops">Tops</SelectItem>
      <SelectItem value="knitwear">Knitwear</SelectItem>
      <SelectItem value="jackets-coats">Jackets & Coats</SelectItem>
      <SelectItem value="pants">Pants</SelectItem>
      <SelectItem value="shirts">Shirts</SelectItem>
      <SelectItem value="t-shirts">T-Shirts</SelectItem>
      <SelectItem value="denim">Denim</SelectItem>
      <SelectItem value="accessories">Accessories</SelectItem>
    </SelectContent>
  </Select>
</div>
```

3. **Add Multi-Select for Sizes**
```typescript
<div>
  <Label>Available Sizes *</Label>
  <MultiSelect
    options={['XS', 'S', 'M', 'L', 'XL', 'XXL']}
    selected={formData.sizes}
    onChange={(sizes) => handleInputChange('sizes', sizes)}
    placeholder="Select available sizes"
  />
</div>
```

4. **Add Multi-Select for Colors**
```typescript
<div>
  <Label>Available Colors *</Label>
  <ColorMultiSelect
    options={[
      { value: 'black', label: 'Black', hex: '#000000' },
      { value: 'white', label: 'White', hex: '#FFFFFF' },
      { value: 'gray', label: 'Gray', hex: '#808080' },
      { value: 'blue', label: 'Blue', hex: '#0000FF' },
      { value: 'red', label: 'Red', hex: '#FF0000' },
      { value: 'green', label: 'Green', hex: '#00FF00' },
      // ... more colors
    ]}
    selected={formData.colors}
    onChange={(colors) => handleInputChange('colors', colors)}
  />
</div>
```

5. **Add Condition Selector**
```typescript
<div>
  <Label htmlFor="condition">Condition *</Label>
  <Select
    value={formData.condition}
    onValueChange={(value) => handleInputChange('condition', value)}
    required
  >
    <SelectTrigger>
      <SelectValue placeholder="Select condition" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="excellent">Excellent</SelectItem>
      <SelectItem value="good">Good</SelectItem>
      <SelectItem value="fair">Fair</SelectItem>
    </SelectContent>
  </Select>
</div>
```

6. **Add Original Price Field**
```typescript
<div>
  <Label htmlFor="original_price">Original Price (₪)</Label>
  <Input
    id="original_price"
    type="number"
    step="0.01"
    min="0"
    value={formData.original_price || ''}
    onChange={(e) => handleInputChange('original_price', e.target.value)}
    placeholder="Enter original price for discount display"
  />
  <p className="text-sm text-gray-500 mt-1">
    Leave empty if not on sale
  </p>
</div>
```

### 5.2 Product List Filtering

**File**: `app/[locale]/admin/products/page.tsx` (update existing)

**Add Gender Filter to Product List**:
```typescript
<div className="flex gap-4 mb-6">
  <Select
    value={genderFilter}
    onValueChange={setGenderFilter}
  >
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Filter by gender" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Genders</SelectItem>
      <SelectItem value="women">Women</SelectItem>
      <SelectItem value="men">Men</SelectItem>
      <SelectItem value="unisex">Unisex</SelectItem>
    </SelectContent>
  </Select>

  <Select
    value={clothingTypeFilter}
    onValueChange={setClothingTypeFilter}
  >
    <SelectTrigger className="w-[200px]">
      <SelectValue placeholder="Filter by type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Types</SelectItem>
      <SelectItem value="dresses">Dresses</SelectItem>
      <SelectItem value="tops">Tops</SelectItem>
      {/* ... more options */}
    </SelectContent>
  </Select>
</div>
```

### 5.3 Bulk Edit Tool

**New File**: `app/[locale]/admin/products/bulk-edit/page.tsx`

**Purpose**: Allow admins to quickly assign gender to existing products

```typescript
'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BulkEditPage() {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkGender, setBulkGender] = useState('');
  const [bulkClothingType, setBulkClothingType] = useState('');
  const [bulkCondition, setBulkCondition] = useState('');

  const handleBulkUpdate = async () => {
    const updates = {
      ...(bulkGender && { gender: bulkGender }),
      ...(bulkClothingType && { clothing_type: bulkClothingType }),
      ...(bulkCondition && { condition: bulkCondition }),
    };

    // Update selected products
    await Promise.all(
      selectedIds.map(id =>
        fetch(`/api/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
      )
    );

    // Refresh list
    fetchProducts();
    setSelectedIds([]);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bulk Edit Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Select value={bulkGender} onValueChange={setBulkGender}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Set gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bulkClothingType} onValueChange={setBulkClothingType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Set clothing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dresses">Dresses</SelectItem>
                  <SelectItem value="tops">Tops</SelectItem>
                  {/* ... more options */}
                </SelectContent>
              </Select>

              <Button
                onClick={handleBulkUpdate}
                disabled={selectedIds.length === 0 || (!bulkGender && !bulkClothingType)}
              >
                Update {selectedIds.length} Products
              </Button>
            </div>

            {/* Product selection table */}
            <div className="space-y-2">
              {products.map(product => (
                <div key={product.id} className="flex items-center gap-4 p-4 border rounded">
                  <Checkbox
                    checked={selectedIds.includes(product.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds([...selectedIds, product.id]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => id !== product.id));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      Gender: {product.gender || 'Not set'} |
                      Type: {product.clothing_type || 'Not set'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
```

---

## 6. Mock Data Updates

### 6.1 Enhanced Mock Products

**File**: `lib/stubs/mock-data.ts` (update existing)

```typescript
import { Database } from '@/types/supabase';

type Product = Database['public']['Tables']['products']['Row'];

export const mockProducts: Product[] = [
  // Women's Products
  {
    id: 'prod-1',
    name: 'Vintage Floral Midi Dress',
    description: 'Beautiful vintage floral print midi dress perfect for summer occasions. Features a flattering A-line silhouette with a cinched waist.',
    price: 89.99,
    original_price: 129.99,
    category_id: 'cat-2',
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop',
    created_at: '2024-12-15T00:00:00.000Z',
    updated_at: '2024-12-15T00:00:00.000Z',
    inventory_count: 12,
    is_featured: true,
    stripe_product_id: null,

    // New fields
    gender: 'women',
    clothing_type: 'dresses',
    sizes: ['S', 'M', 'L'],
    colors: ['blue', 'pink', 'white'],
    condition: 'excellent',
  },
  {
    id: 'prod-2',
    name: 'Cashmere Blend Sweater',
    description: 'Luxuriously soft cashmere blend sweater in classic design. Perfect for layering or wearing alone.',
    price: 79.99,
    original_price: null,
    category_id: 'cat-2',
    image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop',
    created_at: '2024-12-14T00:00:00.000Z',
    updated_at: '2024-12-14T00:00:00.000Z',
    inventory_count: 25,
    is_featured: true,
    stripe_product_id: null,

    gender: 'women',
    clothing_type: 'knitwear',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['black', 'gray', 'beige'],
    condition: 'excellent',
  },
  {
    id: 'prod-3',
    name: 'Silk Blend Blouse',
    description: 'Elegant silk blend blouse with delicate button details. Perfect for work or evening events.',
    price: 65.99,
    original_price: 95.99,
    category_id: 'cat-2',
    image_url: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=400&fit=crop',
    created_at: '2024-12-13T00:00:00.000Z',
    updated_at: '2024-12-13T00:00:00.000Z',
    inventory_count: 18,
    is_featured: false,
    stripe_product_id: null,

    gender: 'women',
    clothing_type: 'tops',
    sizes: ['S', 'M', 'L'],
    colors: ['white', 'black', 'pink'],
    condition: 'good',
  },
  {
    id: 'prod-4',
    name: 'Wool Blend Coat',
    description: 'Classic wool blend coat with timeless design. Warm and stylish for cold weather.',
    price: 149.99,
    original_price: 249.99,
    category_id: 'cat-2',
    image_url: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=400&fit=crop',
    created_at: '2024-12-12T00:00:00.000Z',
    updated_at: '2024-12-12T00:00:00.000Z',
    inventory_count: 8,
    is_featured: true,
    stripe_product_id: null,

    gender: 'women',
    clothing_type: 'jackets-coats',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['black', 'gray', 'brown'],
    condition: 'excellent',
  },
  {
    id: 'prod-5',
    name: 'High-Waisted Trousers',
    description: 'Modern high-waisted trousers with wide leg cut. Comfortable and professional.',
    price: 69.99,
    original_price: null,
    category_id: 'cat-2',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
    created_at: '2024-12-11T00:00:00.000Z',
    updated_at: '2024-12-11T00:00:00.000Z',
    inventory_count: 22,
    is_featured: false,
    stripe_product_id: null,

    gender: 'women',
    clothing_type: 'pants',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['black', 'gray', 'beige'],
    condition: 'excellent',
  },
  {
    id: 'prod-6',
    name: 'Pleated Midi Skirt',
    description: 'Elegant pleated midi skirt that moves beautifully. Perfect for any occasion.',
    price: 55.99,
    original_price: 79.99,
    category_id: 'cat-2',
    image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop',
    created_at: '2024-12-10T00:00:00.000Z',
    updated_at: '2024-12-10T00:00:00.000Z',
    inventory_count: 15,
    is_featured: false,
    stripe_product_id: null,

    gender: 'women',
    clothing_type: 'skirts',
    sizes: ['S', 'M', 'L'],
    colors: ['black', 'blue', 'red'],
    condition: 'good',
  },

  // Men's Products
  {
    id: 'prod-7',
    name: 'Classic Denim Jacket',
    description: 'Vintage-style denim jacket perfect for casual outings and layering',
    price: 89.99,
    original_price: null,
    category_id: 'cat-1',
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop',
    created_at: '2024-12-09T00:00:00.000Z',
    updated_at: '2024-12-09T00:00:00.000Z',
    inventory_count: 30,
    is_featured: true,
    stripe_product_id: null,

    gender: 'men',
    clothing_type: 'denim',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['blue', 'black'],
    condition: 'excellent',
  },
  {
    id: 'prod-8',
    name: 'Oxford Button-Down Shirt',
    description: 'Classic oxford button-down shirt in premium cotton. Perfect for work or casual wear.',
    price: 54.99,
    original_price: 79.99,
    category_id: 'cat-1',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
    created_at: '2024-12-08T00:00:00.000Z',
    updated_at: '2024-12-08T00:00:00.000Z',
    inventory_count: 40,
    is_featured: true,
    stripe_product_id: null,

    gender: 'men',
    clothing_type: 'shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['white', 'blue', 'gray'],
    condition: 'excellent',
  },
  {
    id: 'prod-9',
    name: 'Cotton Crew Neck T-Shirt',
    description: 'Essential crew neck t-shirt in soft cotton. A wardrobe staple.',
    price: 29.99,
    original_price: null,
    category_id: 'cat-1',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    created_at: '2024-12-07T00:00:00.000Z',
    updated_at: '2024-12-07T00:00:00.000Z',
    inventory_count: 60,
    is_featured: false,
    stripe_product_id: null,

    gender: 'men',
    clothing_type: 't-shirts',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['white', 'black', 'gray', 'blue'],
    condition: 'excellent',
  },
  {
    id: 'prod-10',
    name: 'Merino Wool Sweater',
    description: 'Premium merino wool sweater with ribbed details. Warm and breathable.',
    price: 99.99,
    original_price: 149.99,
    category_id: 'cat-1',
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
    created_at: '2024-12-06T00:00:00.000Z',
    updated_at: '2024-12-06T00:00:00.000Z',
    inventory_count: 20,
    is_featured: true,
    stripe_product_id: null,

    gender: 'men',
    clothing_type: 'knitwear',
    sizes: ['M', 'L', 'XL'],
    colors: ['black', 'gray', 'green'],
    condition: 'excellent',
  },
  {
    id: 'prod-11',
    name: 'Leather Bomber Jacket',
    description: 'Classic leather bomber jacket with vintage finish. Timeless style.',
    price: 199.99,
    original_price: 299.99,
    category_id: 'cat-1',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
    created_at: '2024-12-05T00:00:00.000Z',
    updated_at: '2024-12-05T00:00:00.000Z',
    inventory_count: 10,
    is_featured: true,
    stripe_product_id: null,

    gender: 'men',
    clothing_type: 'jackets-coats',
    sizes: ['M', 'L', 'XL'],
    colors: ['black', 'brown'],
    condition: 'good',
  },
  {
    id: 'prod-12',
    name: 'Chino Pants',
    description: 'Versatile chino pants in stretch cotton. Perfect for any occasion.',
    price: 64.99,
    original_price: null,
    category_id: 'cat-1',
    image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop',
    created_at: '2024-12-04T00:00:00.000Z',
    updated_at: '2024-12-04T00:00:00.000Z',
    inventory_count: 35,
    is_featured: false,
    stripe_product_id: null,

    gender: 'men',
    clothing_type: 'pants',
    sizes: ['30', '32', '34', '36'],
    colors: ['beige', 'blue', 'black', 'gray'],
    condition: 'excellent',
  },

  // Unisex Accessories
  {
    id: 'prod-13',
    name: 'Vintage Leather Belt',
    description: 'Classic leather belt with brass buckle. Quality craftsmanship.',
    price: 39.99,
    original_price: null,
    category_id: 'cat-1',
    image_url: 'https://images.unsplash.com/photo-1624222247344-70e3b51b2d31?w=400&h=400&fit=crop',
    created_at: '2024-12-03T00:00:00.000Z',
    updated_at: '2024-12-03T00:00:00.000Z',
    inventory_count: 25,
    is_featured: false,
    stripe_product_id: null,

    gender: 'unisex',
    clothing_type: 'accessories',
    sizes: ['S', 'M', 'L'],
    colors: ['black', 'brown'],
    condition: 'good',
  },
  {
    id: 'prod-14',
    name: 'Cashmere Scarf',
    description: 'Soft cashmere scarf in classic design. Perfect for cold weather.',
    price: 69.99,
    original_price: 99.99,
    category_id: 'cat-2',
    image_url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=400&fit=crop',
    created_at: '2024-12-02T00:00:00.000Z',
    updated_at: '2024-12-02T00:00:00.000Z',
    inventory_count: 18,
    is_featured: false,
    stripe_product_id: null,

    gender: 'unisex',
    clothing_type: 'accessories',
    sizes: ['One Size'],
    colors: ['black', 'gray', 'beige', 'red'],
    condition: 'excellent',
  },
];

// Helper function for stub endpoints
export const getFilteredMockProducts = (filters: {
  gender?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  condition?: string;
  inStock?: boolean;
  search?: string;
}) => {
  let filtered = [...mockProducts];

  if (filters.gender && filters.gender !== 'unisex') {
    filtered = filtered.filter(p => p.gender === filters.gender || p.gender === 'unisex');
  }

  if (filters.category) {
    filtered = filtered.filter(p => p.clothing_type === filters.category);
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice!);
  }

  if (filters.sizes && filters.sizes.length > 0) {
    filtered = filtered.filter(p =>
      filters.sizes!.some(size => p.sizes.includes(size as any))
    );
  }

  if (filters.colors && filters.colors.length > 0) {
    filtered = filtered.filter(p =>
      filters.colors!.some(color => p.colors.includes(color as any))
    );
  }

  if (filters.condition) {
    filtered = filtered.filter(p => p.condition === filters.condition);
  }

  if (filters.inStock) {
    filtered = filtered.filter(p => p.inventory_count > 0);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};
```

---

## 7. Component Library Additions

### 7.1 Multi-Select Component

**File**: `components/ui/multi-select.tsx` (new file)

```typescript
'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(s => s !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const handleRemove = (option: string) => {
    onChange(selected.filter(s => s !== option));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-start', className)}
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selected.map(option => (
                <Badge key={option} variant="secondary" className="mr-1">
                  {option}
                  <button
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRemove(option);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(option);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option}
                onSelect={() => handleSelect(option)}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selected.includes(option) ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

### 7.2 Color Multi-Select Component

**File**: `components/ui/color-multi-select.tsx` (new file)

```typescript
'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ColorOption {
  value: string;
  label: string;
  hex: string;
}

interface ColorMultiSelectProps {
  options: ColorOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function ColorMultiSelect({
  options,
  selected,
  onChange,
  className,
}: ColorMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(s => s !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter(s => s !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-start min-h-[40px]', className)}
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground">Select colors...</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selected.map(value => {
                const option = options.find(o => o.value === value);
                return (
                  <Badge key={value} variant="secondary" className="mr-1 gap-1">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: option?.hex }}
                    />
                    {option?.label}
                    <button
                      className="ml-1 rounded-full outline-none"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(value);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-4">
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              className={cn(
                'flex items-center gap-2 p-2 rounded hover:bg-gray-100',
                selected.includes(option.value) && 'bg-gray-100'
              )}
              onClick={() => handleSelect(option.value)}
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: option.hex }}
              />
              <span className="text-sm">{option.label}</span>
              {selected.includes(option.value) && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

---

## 8. Implementation Timeline

### Phase 1: Database & Types (Day 1-2)
- [ ] Create and run database migration
- [ ] Update TypeScript type definitions
- [ ] Create validation schemas
- [ ] Test database changes with sample queries

### Phase 2: API Endpoints (Day 3-4)
- [ ] Implement `/api/shop/products` endpoint
- [ ] Implement `/api/shop/filters` endpoint
- [ ] Update existing `/api/products` endpoints
- [ ] Create stub implementations for local development
- [ ] Write API integration tests

### Phase 3: Admin Panel (Day 5-7)
- [ ] Create multi-select UI components
- [ ] Update product creation form
- [ ] Update product edit form
- [ ] Add gender filter to product list
- [ ] Implement bulk edit tool
- [ ] Test admin workflows

### Phase 4: Mock Data & Testing (Day 8)
- [ ] Update mock data with new fields
- [ ] Create comprehensive test dataset
- [ ] Test all filter combinations
- [ ] Verify stub mode functionality
- [ ] Performance testing with large datasets

### Phase 5: Data Migration (Day 9-10)
- [ ] Run data backfill scripts
- [ ] Manually review and update product data
- [ ] Add NOT NULL constraints
- [ ] Final production validation

---

## 9. Testing Strategy

### 9.1 Unit Tests

**API Endpoint Tests**:
```typescript
// tests/api/shop/products.test.ts
describe('GET /api/shop/products', () => {
  it('should filter by gender', async () => {
    const res = await fetch('/api/shop/products?gender=women');
    const data = await res.json();
    expect(data.products.every(p => p.gender === 'women' || p.gender === 'unisex')).toBe(true);
  });

  it('should filter by size', async () => {
    const res = await fetch('/api/shop/products?gender=men&sizes=L,XL');
    const data = await res.json();
    expect(data.products.every(p =>
      p.sizes.includes('L') || p.sizes.includes('XL')
    )).toBe(true);
  });

  it('should filter by price range', async () => {
    const res = await fetch('/api/shop/products?gender=women&minPrice=50&maxPrice=100');
    const data = await res.json();
    expect(data.products.every(p => p.price >= 50 && p.price <= 100)).toBe(true);
  });

  it('should sort correctly', async () => {
    const res = await fetch('/api/shop/products?gender=women&sort=price-asc');
    const data = await res.json();
    const prices = data.products.map(p => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('should paginate correctly', async () => {
    const res1 = await fetch('/api/shop/products?gender=women&limit=5&page=1');
    const res2 = await fetch('/api/shop/products?gender=women&limit=5&page=2');
    const data1 = await res1.json();
    const data2 = await res2.json();
    expect(data1.products).toHaveLength(5);
    expect(data2.products).toHaveLength(5);
    expect(data1.products[0].id).not.toBe(data2.products[0].id);
  });
});
```

### 9.2 Integration Tests

**Admin Panel Tests**:
```typescript
// tests/admin/products.test.ts
describe('Admin Product Creation', () => {
  it('should create product with all new fields', async () => {
    const productData = {
      name: 'Test Dress',
      description: 'Test description',
      price: 99.99,
      gender: 'women',
      clothing_type: 'dresses',
      sizes: ['S', 'M', 'L'],
      colors: ['black', 'white'],
      condition: 'excellent',
      original_price: 149.99,
      inventory_count: 10,
    };

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data.gender).toBe('women');
    expect(data.data.sizes).toEqual(['S', 'M', 'L']);
  });

  it('should validate required fields', async () => {
    const invalidData = {
      name: 'Test Product',
      price: 99.99,
      // Missing required fields
    };

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData),
    });

    expect(res.status).toBe(400);
  });
});
```

### 9.3 Performance Tests

**Load Testing**:
```typescript
// tests/performance/shop-api.test.ts
describe('Shop API Performance', () => {
  it('should handle 100 concurrent requests', async () => {
    const startTime = Date.now();
    const promises = Array(100).fill(null).map(() =>
      fetch('/api/shop/products?gender=women')
    );
    await Promise.all(promises);
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5 seconds for 100 requests
  });

  it('should return results in <100ms for simple queries', async () => {
    const startTime = Date.now();
    await fetch('/api/shop/products?gender=women&limit=24');
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(100);
  });
});
```

---

## 10. Rollback Plan

### If Issues Arise

**Immediate Rollback Steps**:
1. Revert API endpoints to previous version
2. Database columns remain (no data loss)
3. Frontend continues using old fields
4. Admin panel falls back to previous form

**Database Rollback**:
```sql
-- Remove new columns if needed (CAUTION: Data loss)
ALTER TABLE public.products
  DROP COLUMN IF EXISTS gender,
  DROP COLUMN IF EXISTS clothing_type,
  DROP COLUMN IF EXISTS sizes,
  DROP COLUMN IF EXISTS colors,
  DROP COLUMN IF EXISTS condition,
  DROP COLUMN IF EXISTS original_price;

-- Drop indexes
DROP INDEX IF EXISTS idx_products_gender;
DROP INDEX IF EXISTS idx_products_clothing_type;
DROP INDEX IF EXISTS idx_products_sizes;
DROP INDEX IF EXISTS idx_products_colors;
DROP INDEX IF EXISTS idx_products_condition;
DROP INDEX IF EXISTS idx_products_gender_clothing;
DROP INDEX IF EXISTS idx_products_gender_price;
```

---

## 11. Monitoring & Observability

### Key Metrics to Track

**Performance Metrics**:
- API response time (p50, p95, p99)
- Database query execution time
- Cache hit rate
- API error rate

**Business Metrics**:
- Products by gender distribution
- Filter usage statistics
- Most searched terms
- Conversion rate by filter combinations

**Monitoring Implementation**:
```typescript
// lib/monitoring/metrics.ts
export const trackShopQuery = (params: {
  gender: string;
  filters: string[];
  resultCount: number;
  responseTime: number;
}) => {
  // Send to analytics
  analytics.track('shop_query', params);

  // Log slow queries
  if (params.responseTime > 1000) {
    console.warn('Slow shop query:', params);
  }
};
```

---

## 12. Documentation Updates Required

### Developer Documentation
- [ ] API endpoint documentation in Swagger/OpenAPI format
- [ ] Database schema diagram with new fields
- [ ] Admin panel user guide
- [ ] Migration guide for existing products

### User-Facing Documentation
- [ ] Help article: "How to filter products"
- [ ] FAQ: "What do condition ratings mean?"
- [ ] Size guide for men's and women's clothing

---

## 13. Security Considerations

### Access Control
- Only admins can create/edit products (enforced by middleware)
- RLS policies remain unchanged
- Bulk edit tool restricted to admin role

### Input Validation
- All enum values validated at API and database level
- Array inputs sanitized (sizes, colors)
- SQL injection prevented via parameterized queries

### Rate Limiting
```typescript
// lib/api/rate-limit.ts
export const shopApiRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per interval
  tokens: 100, // 100 requests per minute per user
});
```

---

## 14. Success Criteria

### Technical Success
- ✅ All API endpoints return <100ms for 95% of requests
- ✅ Database queries use indexes efficiently (verified with EXPLAIN)
- ✅ Zero downtime during migration
- ✅ 100% test coverage for new endpoints
- ✅ Stub mode fully functional for local development

### Business Success
- ✅ Admins can create fully-attributed products in <2 minutes
- ✅ Users can filter products with instant results
- ✅ All existing products successfully migrated
- ✅ Filter combinations return relevant results

---

## 15. Future Enhancements

### Phase 2 Features (Post-Launch)
1. **Advanced Search**
   - Elasticsearch integration for fuzzy search
   - Search suggestions/autocomplete
   - Visual search (upload image to find similar items)

2. **Personalization**
   - Saved size preferences
   - Color preference learning
   - Personalized recommendations

3. **Analytics Dashboard**
   - Popular filter combinations
   - A/B testing for sort orders
   - Conversion funnel by gender/category

4. **Inventory Management**
   - Low stock alerts by size/color
   - Automatic reorder suggestions
   - Seasonal demand predictions

---

## Appendix A: Color Palette Definition

```typescript
// lib/constants/colors.ts
export const COLOR_OPTIONS = [
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'white', label: 'White', hex: '#FFFFFF' },
  { value: 'gray', label: 'Gray', hex: '#808080' },
  { value: 'blue', label: 'Blue', hex: '#0000FF' },
  { value: 'red', label: 'Red', hex: '#FF0000' },
  { value: 'green', label: 'Green', hex: '#008000' },
  { value: 'brown', label: 'Brown', hex: '#8B4513' },
  { value: 'beige', label: 'Beige', hex: '#F5F5DC' },
  { value: 'pink', label: 'Pink', hex: '#FFC0CB' },
  { value: 'yellow', label: 'Yellow', hex: '#FFFF00' },
  { value: 'orange', label: 'Orange', hex: '#FFA500' },
  { value: 'purple', label: 'Purple', hex: '#800080' },
] as const;
```

---

## Appendix B: Size Guide Matrix

```typescript
// lib/constants/sizes.ts
export const SIZE_GUIDE = {
  women: {
    tops: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    dresses: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    pants: ['24', '25', '26', '27', '28', '29', '30', '31', '32'],
    shoes: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
  },
  men: {
    tops: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    pants: ['28', '29', '30', '31', '32', '33', '34', '36', '38', '40'],
    shoes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
  },
} as const;
```

---

## Conclusion

This implementation plan provides a comprehensive roadmap for adding gender-based shop functionality to the e-commerce platform. The approach prioritizes:

1. **Scalability**: Database indexes and query optimization for sub-100ms responses
2. **Maintainability**: Clean separation of concerns, type safety, comprehensive tests
3. **User Experience**: Intuitive filtering, fast responses, visual feedback
4. **Developer Experience**: Stub mode for local development, clear documentation
5. **Production Safety**: Zero-downtime migration, rollback plan, monitoring

**Estimated Total Development Time**: 10 days (2 weeks at 50% allocation)

**Team Size**: 1-2 full-stack developers

**Risk Level**: Low (backward compatible, can rollback easily)

---

**Document Version**: 1.0
**Last Updated**: 2024-12-17
**Author**: Principal Backend Engineer
**Reviewers**: Tech Lead, Product Manager
