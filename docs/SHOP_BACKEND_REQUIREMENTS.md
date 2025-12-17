# Shop Backend Requirements

## Overview
This document outlines the backend changes required for the new shop functionality to work properly with the gender-based navigation and filtering system.

## Database Schema Changes Required

### 1. Add Gender Field to Products Table

The products table needs a `gender` field to support the men's/women's shop separation:

```sql
-- Add gender column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('men', 'women', 'unisex', 'kids', 'teens'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);

-- Update existing products to have gender values
-- This should be done based on your category structure
```

### 2. Add Category Slug Field

Categories need slugs for URL-friendly routing:

```sql
-- Add slug column to categories table
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add index
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Populate slugs from existing category names
-- Example: UPDATE categories SET slug = lower(replace(name, ' ', '-'));
```

### 3. Add Product Metadata Fields

Products need additional fields for filtering:

```sql
-- Add sizes field (array of available sizes)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}';

-- Add colors field (array of available colors)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';

-- Add is_new field (for new arrivals filter)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE;

-- Add is_sale field (for sale filter)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_sale BOOLEAN DEFAULT FALSE;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_is_new ON public.products(is_new) WHERE is_new = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_is_sale ON public.products(is_sale) WHERE is_sale = TRUE;
```

## API Updates Required

### 1. Update Products API Endpoint (`/api/products`)

The API needs to support additional query parameters:

**New Query Parameters:**
- `gender` - Filter by gender (men/women/unisex/kids/teens)
- `category` - Filter by category slug (instead of category_id)
- `sizes` - Filter by available sizes (comma-separated)
- `colors` - Filter by available colors (comma-separated)
- `inStock` - Filter only products with inventory > 0
- `new` - Filter new arrivals (is_new = true)
- `sale` - Filter sale items (is_sale = true)
- `sort` - Sort option (newest/price-asc/price-desc/name-asc/name-desc)

**Example API call:**
```
GET /api/products?gender=women&category=dresses&inStock=true&sort=newest&limit=20
```

### 2. Update Product Query Logic

```typescript
// In /app/[locale]/api/products/route.ts
// Add gender filter
if (gender) {
  dbQuery = dbQuery.eq('gender', gender);
}

// Filter by category slug instead of ID
if (category) {
  // Join with categories table to filter by slug
  dbQuery = dbQuery
    .select('*, categories!inner(slug)')
    .eq('categories.slug', category);
}

// Filter by sizes
if (sizes && sizes.length > 0) {
  dbQuery = dbQuery.overlaps('sizes', sizes);
}

// Filter by colors
if (colors && colors.length > 0) {
  dbQuery = dbQuery.overlaps('colors', colors);
}

// Filter in-stock only
if (inStock) {
  dbQuery = dbQuery.gt('inventory_count', 0);
}

// Filter new arrivals
if (isNew) {
  dbQuery = dbQuery.eq('is_new', true);
}

// Filter sale items
if (isSale) {
  dbQuery = dbQuery.eq('is_sale', true);
}

// Handle sort parameter
switch (sort) {
  case 'newest':
    dbQuery = dbQuery.order('created_at', { ascending: false });
    break;
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
}
```

## Mock Data Updates (For Development)

Update `/lib/stubs/mock-data.ts` to include the new fields:

```typescript
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Classic Denim Jacket',
    description: 'Vintage-style denim jacket perfect for casual outings',
    price: 89.99,
    gender: 'men', // NEW
    category_id: 'cat-men-jackets',
    sizes: ['S', 'M', 'L', 'XL'], // NEW
    colors: ['blue', 'black'], // NEW
    is_new: true, // NEW
    is_sale: false, // NEW
    discount_percent: 0,
    image_url: 'https://images.unsplash.com/...',
    inventory_count: 45,
    is_featured: true,
    // ... other fields
  },
  // More products with proper gender, sizes, colors, etc.
];

// Update categories to include slugs
export const mockCategories: Category[] = [
  {
    id: 'cat-men-all',
    name: 'All',
    slug: 'all', // NEW
    description: 'All men\'s products',
    parent_id: null,
    // ... other fields
  },
  {
    id: 'cat-men-jackets',
    name: 'Jackets & Coats',
    slug: 'jackets-coats', // NEW
    description: 'Vintage jackets and coats for men',
    parent_id: 'cat-men-all',
    // ... other fields
  },
  // More categories with slugs matching shop-categories.ts
];
```

## Categories Structure Required

The categories need to match the structure defined in `/lib/config/shop-categories.ts`:

### Men's Categories (gender: 'men'):
- all (All)
- new-arrivals (New Arrivals)
- jackets-coats (Jackets & Coats)
- knitwear (Knitwear)
- shirts (Shirts)
- t-shirts (T-Shirts)
- pants (Pants)
- denim (Denim)
- accessories (Accessories)

### Women's Categories (gender: 'women'):
- all (All)
- new-arrivals (New Arrivals)
- dresses (Dresses)
- tops (Tops)
- knitwear (Knitwear)
- jackets-coats (Jackets & Coats)
- pants (Pants)
- skirts (Skirts)
- accessories (Accessories)

## Frontend Requirements (Already Implemented)

The frontend is now ready with:
- ✅ Gender toggle (Women/Men)
- ✅ Category tabs with proper slugs
- ✅ Filter panel (price, size, color, availability)
- ✅ Sort options (newest, price, name)
- ✅ Grid layout toggle (2/4 columns)
- ✅ All translations (English + Hebrew)

## Migration Script Example

Create a migration file: `/supabase/migrations/20240103000000_add_shop_fields.sql`

```sql
-- Add gender column
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('men', 'women', 'unisex', 'kids', 'teens'));

-- Add category slug
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add product metadata
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_sale BOOLEAN DEFAULT FALSE;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON public.products(is_new) WHERE is_new = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_is_sale ON public.products(is_sale) WHERE is_sale = TRUE;

-- Add comments
COMMENT ON COLUMN public.products.gender IS 'Product gender category (men/women/unisex/kids/teens)';
COMMENT ON COLUMN public.categories.slug IS 'URL-friendly category identifier';
COMMENT ON COLUMN public.products.sizes IS 'Available sizes for the product';
COMMENT ON COLUMN public.products.colors IS 'Available colors for the product';
COMMENT ON COLUMN public.products.is_new IS 'Whether product is a new arrival';
COMMENT ON COLUMN public.products.is_sale IS 'Whether product is on sale';
```

## Testing Checklist

Once backend changes are deployed:

1. ✅ Navigate to `/shop/women` - should show women's products
2. ✅ Navigate to `/shop/men` - should show men's products
3. ✅ Click category tabs - should filter by category
4. ✅ Use price filter - should filter by price range
5. ✅ Use size filter - should filter by available sizes
6. ✅ Use color filter - should filter by colors
7. ✅ Toggle "In Stock Only" - should filter available items
8. ✅ Change sort options - should reorder products
9. ✅ Toggle grid layout - should change column count
10. ✅ Test in Hebrew locale - translations should work

## Priority Order

1. **HIGH PRIORITY** - Add gender field to products (required for shop navigation)
2. **HIGH PRIORITY** - Add category slug field (required for routing)
3. **MEDIUM PRIORITY** - Add sizes/colors fields (for filtering)
4. **MEDIUM PRIORITY** - Add is_new/is_sale fields (for special filters)
5. **LOW PRIORITY** - Update mock data (for local development)

## Notes

- The frontend is fully implemented and translated
- All components use proper TypeScript types from `/types/shop.ts`
- The shop uses client-side filtering state with URL sync
- Products API is called with proper query params
- Mock data system (stubs) can be used for development without database changes
