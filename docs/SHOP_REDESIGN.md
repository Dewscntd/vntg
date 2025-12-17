# Shop Page Redesign - COS-Inspired Architecture

## Overview

This document details the comprehensive shop page redesign for the Peakees e-commerce platform, inspired by COS's minimal aesthetic and modern UX patterns.

**Status**: ✅ Implemented
**Version**: 1.0.0
**Last Updated**: December 17, 2025

---

## Architecture

### Design Principles

1. **Clean Architecture**: Clear separation between domain, application, and presentation layers
2. **SOLID Principles**: Single responsibility, dependency inversion, interface segregation
3. **Composition over Inheritance**: Reusable components composed together
4. **Declarative Code**: URL-based state management, configuration-driven
5. **Performance First**: Lazy loading, virtualization, optimized bundle size

### Technology Stack

- **Framework**: Next.js 14 App Router with TypeScript
- **Styling**: Tailwind CSS with logical properties for RTL support
- **i18n**: next-intl for Hebrew/English localization
- **State**: URL query params + localStorage for preferences
- **Components**: shadcn/ui primitives with custom compositions

---

## File Structure

```
├── app/[locale]/shop/
│   ├── page.tsx                              # Root redirect
│   ├── [gender]/
│   │   ├── page.tsx                          # Gender collection page
│   │   ├── shop-content.tsx                  # Client component with data fetching
│   │   └── [category]/
│   │       └── page.tsx                      # Category page
│
├── components/shop/
│   ├── gender-toggle.tsx                     # MEN/WOMEN switcher
│   ├── category-tabs.tsx                     # Horizontal scrolling tabs
│   ├── filter-sort-panel.tsx                 # Filter sidebar/modal
│   ├── grid-layout-toggle.tsx                # 2/4 column toggle
│   ├── shop-layout.tsx                       # Layout wrapper
│   └── shop-product-grid.tsx                 # Product grid with layouts
│
├── lib/
│   ├── config/
│   │   └── shop-categories.ts                # Category definitions
│   ├── hooks/
│   │   └── use-shop-state.ts                 # Shop state hooks
│   └── utils/
│       └── shop-helpers.ts                   # Pure utility functions
│
├── types/
│   └── shop.ts                               # TypeScript type definitions
│
└── messages/
    ├── en.json                               # English translations
    └── he.json                               # Hebrew translations
```

---

## Route Structure

### URL Pattern

```
/shop                           → Redirects to /shop/women (or last visited)
/shop/women                     → Women's collection (all products)
/shop/women/dresses            → Women's dresses category
/shop/women/jackets-coats      → Women's jackets & coats
/shop/men                       → Men's collection (all products)
/shop/men/shirts               → Men's shirts category
/shop/men/denim                → Men's denim category
```

### Query Parameters

All filters and sort options are managed via URL query parameters:

```
?sort=newest                    # Sort option
?category=jackets-coats         # Category filter
?priceMin=100&priceMax=500     # Price range
?sizes=M,L,XL                  # Size filters
?colors=black,white            # Color filters
?inStock=true                  # Stock availability
?new=true                      # New arrivals only
?sale=true                     # Sale items only
```

**Benefits**:
- Shareable URLs
- Browser back/forward support
- SEO-friendly
- Client-side state management

---

## Component Architecture

### 1. GenderToggle Component

**Location**: `/components/shop/gender-toggle.tsx`

Minimalist toggle for switching between men's and women's collections.

**Features**:
- Prominent positioning (sticky on mobile)
- Active state with underline indicator
- Remembers last visited gender in localStorage
- Smooth transitions
- RTL support

**Usage**:
```tsx
<GenderToggle currentGender="women" />
```

### 2. CategoryTabs Component

**Location**: `/components/shop/category-tabs.tsx`

Horizontal scrolling navigation for categories within a gender.

**Features**:
- Snap scrolling for mobile
- Auto-scroll to active category
- Fade indicators on edges
- Active state styling
- Responsive grid on desktop

**Categories**:

**Men**:
- All, New Arrivals, Jackets & Coats, Knitwear, Shirts, T-Shirts, Pants, Denim, Accessories

**Women**:
- All, New Arrivals, Dresses, Tops, Knitwear, Jackets & Coats, Pants, Skirts, Accessories

**Usage**:
```tsx
<CategoryTabs
  gender="women"
  activeCategory="dresses"
/>
```

### 3. FilterSortPanel Component

**Location**: `/components/shop/filter-sort-panel.tsx`

Comprehensive filtering and sorting UI.

**Features**:
- Dual mode: sidebar (desktop) / modal (mobile)
- Sort options (newest, price, name)
- Price range slider
- Size selection (XS, S, M, L, XL, XXL)
- Color multi-select
- Stock availability toggle
- Active filter count badge
- Clear all filters

**Usage**:
```tsx
{/* Desktop sidebar */}
<FilterSortPanel variant="sidebar" />

{/* Mobile modal */}
<FilterSortPanel variant="modal" />
```

### 4. GridLayoutToggle Component

**Location**: `/components/shop/grid-layout-toggle.tsx`

Toggle between 2-column and 4-column grid layouts.

**Features**:
- Persists preference to localStorage
- Responsive defaults (2-col mobile, 4-col desktop)
- Icon-based UI
- Active state styling

**Usage**:
```tsx
<GridLayoutToggle
  value={gridLayout}
  onChange={setGridLayout}
/>
```

### 5. ShopProductGrid Component

**Location**: `/components/shop/shop-product-grid.tsx`

Responsive product grid with dynamic layouts.

**Features**:
- Dynamic column count (2, 3, or 4)
- Gap-less borders (1px gap with background color)
- Loading skeletons
- Empty states
- Lazy image loading
- Priority loading for first 8 products

**Grid Layouts**:
- `2`: 2 columns on all screens
- `3`: 2 columns mobile, 3 desktop
- `4`: 2 columns mobile, 3 tablet, 4 desktop

**Usage**:
```tsx
<ShopProductGrid
  products={products}
  gridLayout={4}
  isLoading={false}
/>
```

---

## State Management

### URL-Based Filtering

**Hook**: `useShopFilters()`

Manages all filter and sort state through URL query parameters.

```tsx
const { filters, sort, updateFilters, updateSort, clearFilters } = useShopFilters();

// Update filters
updateFilters({ category: 'dresses', priceMin: 100 });

// Update sort
updateSort('price-asc');

// Clear all
clearFilters();
```

**Benefits**:
- Shareable state
- Browser history support
- No prop drilling
- SEO-friendly

### Layout Preferences

**Hook**: `useGridLayout()`

Persists grid layout preference to localStorage.

```tsx
const { gridLayout, setGridLayout } = useGridLayout();

setGridLayout(4); // Saves to localStorage
```

**Hook**: `useLastGender()`

Remembers last visited gender collection.

```tsx
const { lastGender, setLastGender } = useLastGender();

setLastGender('women'); // Saves to localStorage
```

---

## Data Flow

### Product Fetching

```
1. User navigates to /shop/women/dresses
2. ShopContent component mounts
3. useShopFilters() parses URL params
4. fetch() requests /api/products?gender=women&category=dresses
5. API filters products (from DB or stubs)
6. Products rendered in grid
```

### Filter Updates

```
1. User toggles "In Stock" filter
2. updateFilters({ inStock: true })
3. URL updates to ?inStock=true
4. React re-renders with new filters
5. useEffect triggers new fetch()
6. Grid updates with filtered products
```

---

## Responsive Design

### Breakpoints

Following Tailwind's default breakpoints:

- `sm`: 640px (small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (desktops)
- `xl`: 1280px (large desktops)

### Mobile (< 768px)

- 2-column product grid
- Sticky gender toggle
- Horizontal scrolling category tabs
- Bottom sheet filter modal
- Collapsible filter sections

### Tablet (768px - 1024px)

- 3-column product grid
- Sidebar filters (optional)
- Category tabs centered
- Layout toggle visible

### Desktop (> 1024px)

- 4-column product grid
- Sidebar filters always visible
- Category tabs fully visible
- All controls accessible

---

## RTL Support

### Implementation

All components use Tailwind's logical properties:

- `ms-*` / `me-*` instead of `ml-*` / `mr-*`
- `start-*` / `end-*` for positioning
- `flex-row` automatically reverses
- Icons mirror in RTL context

### Testing RTL

Set locale to Hebrew:
```
http://localhost:3000/he/shop/women
```

Components automatically adapt:
- Text aligns right
- Layouts mirror
- Scroll directions reverse
- Icons flip

---

## Performance Optimizations

### Implemented

1. **Route-based code splitting**: Each category page loads independently
2. **Image lazy loading**: Below-fold images load on scroll
3. **Priority loading**: First 8 products load immediately
4. **Suspense boundaries**: Loading states prevent layout shift
5. **Static generation**: Gender/category pages pre-rendered
6. **CSS gap trick**: 1px borders with no JavaScript

### Recommended (Future)

1. **Virtual scrolling**: For 100+ products (react-window)
2. **Intersection Observer**: Load more on scroll
3. **Request deduplication**: Cache API responses (SWR/React Query)
4. **Image CDN**: Cloudinary or Imgix for optimization
5. **Edge caching**: Vercel Edge for geo-distributed content

---

## Integration with Stub System

### Development Mode

When `NEXT_PUBLIC_USE_STUBS=true`:

```tsx
// API route automatically uses stub data
const response = await fetch('/api/products?gender=women');
// Returns mock products from lib/stubs/mock-data.ts
```

### Mock Data Enhancement

Add gender and category metadata to mock products:

```typescript
// lib/stubs/mock-data.ts
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Vintage Denim Jacket',
    price: 89.99,
    category_id: 'cat-1', // Men
    // Add metadata
    is_new: true,
    is_sale: false,
    discount_percent: 0,
    // ...
  }
];
```

### Category Mapping

Use helper function to map products to shop categories:

```typescript
import { inferCategoryFromProduct, inferGenderFromProduct } from '@/lib/utils/shop-helpers';

const category = inferCategoryFromProduct(product); // 'jackets-coats'
const gender = inferGenderFromProduct(product);     // 'men'
```

---

## i18n Configuration

### Translation Keys

All shop translations under `shop.*` namespace:

```json
{
  "shop": {
    "gender": {
      "women": "Women",
      "men": "Men"
    },
    "categories": {
      "men": {
        "all": "All",
        "jackets-coats": "Jackets & Coats",
        ...
      },
      "women": {
        "all": "All",
        "dresses": "Dresses",
        ...
      }
    },
    "filters": {
      "filters": "Filters",
      "sort": "Sort",
      ...
    }
  }
}
```

### Usage in Components

```tsx
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('shop.categories');

  return <h2>{t('women.dresses')}</h2>; // "Dresses"
}
```

---

## Testing Strategy

### Unit Tests

Test pure utility functions:

```typescript
// lib/utils/shop-helpers.test.ts
describe('filterProducts', () => {
  it('filters by price range', () => {
    const products = [...mockProducts];
    const filtered = filterProducts(products, {
      priceMin: 50,
      priceMax: 100
    });
    expect(filtered.every(p => p.price >= 50 && p.price <= 100)).toBe(true);
  });
});
```

### Integration Tests

Test filter interactions:

```typescript
// components/shop/filter-sort-panel.test.tsx
describe('FilterSortPanel', () => {
  it('updates URL when price range changes', async () => {
    render(<FilterSortPanel />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 200 } });

    await waitFor(() => {
      expect(window.location.search).toContain('priceMin=200');
    });
  });
});
```

### E2E Tests

Test complete user flows:

```typescript
// tests/e2e/shop-flow.spec.ts
test('user can filter women\'s dresses by price', async ({ page }) => {
  await page.goto('/en/shop/women/dresses');

  // Open filters
  await page.click('[data-testid="filters-button"]');

  // Set price range
  await page.fill('[data-testid="price-min"]', '100');
  await page.fill('[data-testid="price-max"]', '300');

  // Verify URL
  expect(page.url()).toContain('priceMin=100&priceMax=300');

  // Verify products
  const products = await page.$$('[data-testid="product-card"]');
  expect(products.length).toBeGreaterThan(0);
});
```

---

## Accessibility

### ARIA Labels

All interactive elements have proper labels:

```tsx
<button aria-label="2 columns" aria-pressed={value === 2}>
  <Grid2X2 />
</button>
```

### Keyboard Navigation

- Tab through filters
- Arrow keys for category tabs
- Enter/Space to activate
- Escape to close modals

### Screen Readers

- Semantic HTML (`<nav>`, `<main>`, `<aside>`)
- `aria-current` for active links
- `role="status"` for loading states
- Live regions for filter updates

---

## SEO Optimization

### Static Generation

All gender/category pages are statically generated:

```tsx
export async function generateStaticParams() {
  return [
    { gender: 'women', category: 'dresses' },
    { gender: 'women', category: 'tops' },
    // ... all combinations
  ];
}
```

### Metadata

Dynamic metadata per page:

```tsx
export async function generateMetadata({ params }) {
  return {
    title: `${capitalize(params.category)} for ${capitalize(params.gender)} | Peakees`,
    description: `Shop ${params.category} from our curated vintage collection`,
  };
}
```

### Structured Data

```tsx
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Women's Dresses",
    "numberOfItems": products.length,
  })}
</script>
```

---

## Future Enhancements

### Phase 2 (Q1 2026)

1. **Saved Searches**: Let users save filter combinations
2. **Recently Viewed**: Track viewed products
3. **Wishlist Integration**: Add to wishlist from grid
4. **Quick View Modal**: Preview product without navigation
5. **Compare Products**: Side-by-side comparison
6. **Outfit Builder**: Create looks from products

### Phase 3 (Q2 2026)

1. **AI Recommendations**: Personalized product suggestions
2. **Visual Search**: Upload image to find similar
3. **Size Recommendation**: ML-based size guidance
4. **Virtual Try-On**: AR integration
5. **Social Shopping**: Share looks with friends
6. **Live Shopping**: Real-time shopping events

---

## Troubleshooting

### Filters Not Working

**Issue**: Filter updates don't reflect in products

**Check**:
1. Verify URL params are updating: `console.log(searchParams.toString())`
2. Check API is receiving params: Network tab in DevTools
3. Ensure filter logic matches product schema

**Fix**:
```tsx
// Add debug logging
useEffect(() => {
  console.log('Filters changed:', filters);
  console.log('Current URL:', window.location.href);
}, [filters]);
```

### Grid Layout Not Persisting

**Issue**: Layout resets on page refresh

**Check**:
1. localStorage permissions
2. Hydration mismatch warnings
3. `useEffect` mounting order

**Fix**:
```tsx
// Prevent hydration mismatch
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return <Skeleton />;
```

### RTL Styles Not Applying

**Issue**: Components don't mirror in Hebrew

**Check**:
1. Using logical properties (`ms-*/me-*` not `ml-*/mr-*`)
2. `dir` attribute on `<html>` tag
3. Tailwind config has RTL plugin

**Fix**:
```tsx
// Use logical properties
<div className="ms-4"> {/* Not ml-4 */}
  <Icon className="me-2" /> {/* Not mr-2 */}
</div>
```

---

## Support

### For Developers

- Review this documentation
- Check type definitions in `/types/shop.ts`
- Examine component source for implementation details
- Run `npm run type-check` before committing

### For AI Agents

When working with shop pages:
1. Always check this documentation first
2. Follow established patterns (URL state, composition)
3. Test both LTR and RTL layouts
4. Validate with TypeScript before saving
5. Consider performance impact of changes

---

## Changelog

### v1.0.0 - December 17, 2025

**Initial Release**

✅ Complete route structure implementation
✅ All core components built
✅ URL-based state management
✅ RTL support configured
✅ i18n translations added
✅ Integration with stub system
✅ Responsive design across all breakpoints
✅ Accessibility features implemented
✅ Performance optimizations applied

**Components Created**:
- GenderToggle
- CategoryTabs
- FilterSortPanel
- GridLayoutToggle
- ShopProductGrid
- ShopLayout

**Utilities Created**:
- shop-helpers.ts (filtering, sorting, inference)
- shop-categories.ts (category configuration)
- use-shop-state.ts (state management hooks)

**Pages Created**:
- /shop (redirect)
- /shop/[gender]
- /shop/[gender]/[category]

---

## License

Part of the Peakees e-commerce platform. All rights reserved.
