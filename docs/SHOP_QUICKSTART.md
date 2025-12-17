# Shop Redesign - Quick Start Guide

## Getting Started in 5 Minutes

This guide will get you up and running with the new shop pages immediately.

---

## Step 1: Start the Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000/en/shop`

You'll be automatically redirected to `http://localhost:3000/en/shop/women`

---

## Step 2: Navigate the Shop

### Gender Collections

- **Women's Collection**: `/en/shop/women`
- **Men's Collection**: `/en/shop/men`

Use the prominent gender toggle at the top to switch between collections.

### Categories

Click the horizontal category tabs to filter:

**Women**: All | New Arrivals | Dresses | Tops | Knitwear | Jackets & Coats | Pants | Skirts | Accessories

**Men**: All | New Arrivals | Jackets & Coats | Knitwear | Shirts | T-Shirts | Pants | Denim | Accessories

### Example URLs

```
/en/shop/women              → All women's products
/en/shop/women/dresses      → Women's dresses
/en/shop/men/jackets-coats  → Men's jackets & coats
/en/shop/men/denim          → Men's denim
```

---

## Step 3: Use Filters and Sorting

### Desktop

1. Filters appear in the left sidebar
2. Adjust price range with slider
3. Select sizes and colors
4. Toggle "In Stock Only"
5. Products update automatically

### Mobile

1. Tap "Filters" button in toolbar
2. Make selections in modal
3. Tap "View Products" to apply
4. Filters appear in URL as query params

### Sort Options

- **Newest**: Latest arrivals first
- **Price: Low to High**: Cheapest first
- **Price: High to Low**: Most expensive first
- **Name: A to Z**: Alphabetical ascending
- **Name: Z to A**: Alphabetical descending

---

## Step 4: Change Grid Layout

Use the grid toggle buttons in the top-right toolbar:

- **2-Column**: Large product cards
- **4-Column**: Compact grid (default on desktop)

Your preference is saved in localStorage.

---

## Step 5: Test RTL Support

Switch to Hebrew locale:

```
http://localhost:3000/he/shop/women
```

Everything automatically mirrors:
- Text aligns right
- Layout reverses
- Icons flip
- Scroll direction reverses

---

## Common Tasks

### Adding a New Category

1. **Define Category** in `/lib/config/shop-categories.ts`:

```typescript
export const WOMEN_CATEGORIES: ShopCategory[] = [
  // ... existing categories
  {
    id: 'women-swimwear',
    slug: 'swimwear',
    name: 'Swimwear',
    gender: 'women',
    description: 'Vintage swimwear and beachwear',
  },
];
```

2. **Add Translation** in `/messages/en.json`:

```json
{
  "shop": {
    "categories": {
      "women": {
        "swimwear": "Swimwear"
      }
    }
  }
}
```

3. **Generate Static Route** (automatic - no code needed!)

The category page will be auto-generated at `/shop/women/swimwear`

### Customizing Filters

Edit `/components/shop/filter-sort-panel.tsx`:

```typescript
// Add new filter option
const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair'];

// In the component:
<div>
  <h3>Condition</h3>
  {CONDITION_OPTIONS.map(condition => (
    <Checkbox
      key={condition}
      checked={filters.condition?.includes(condition)}
      onCheckedChange={() => toggleCondition(condition)}
    />
  ))}
</div>
```

### Changing Default Grid Layout

Edit `/lib/hooks/use-shop-state.ts`:

```typescript
function getStoredPreferences(): ShopPreferences {
  // Change default from 4 to 2
  return { gridLayout: 2, lastGender: 'women' };
}
```

---

## Troubleshooting

### Products Not Loading

**Problem**: Grid shows "No products found"

**Solution**:
1. Check API is running: `http://localhost:3000/api/products`
2. Verify stub mode: `echo $NEXT_PUBLIC_USE_STUBS`
3. Check console for errors

### Filters Not Working

**Problem**: Changing filters doesn't update products

**Solution**:
1. Check URL is updating with query params
2. Verify useEffect dependencies in `shop-content.tsx`
3. Clear localStorage: `localStorage.clear()`

### Layout Not Persisting

**Problem**: Grid layout resets on refresh

**Solution**:
1. Check localStorage permissions in browser
2. Verify `useGridLayout` hook is being called
3. Check for hydration errors in console

---

## Development Workflow

### Making Changes

1. **Edit Components**: All components are in `/components/shop/`
2. **Hot Reload**: Changes appear instantly
3. **Type Check**: Run `npm run type-check`
4. **Lint**: Run `npm run lint:fix`

### Adding New Features

1. **Create Component**: Use existing patterns
2. **Add Types**: Update `/types/shop.ts`
3. **Add Tests**: Create `*.test.tsx` file
4. **Update Docs**: Add to `SHOP_REDESIGN.md`

### Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## Key Files Reference

### Components

- `/components/shop/gender-toggle.tsx` - Gender switcher
- `/components/shop/category-tabs.tsx` - Category navigation
- `/components/shop/filter-sort-panel.tsx` - Filters and sort
- `/components/shop/grid-layout-toggle.tsx` - Grid layout toggle
- `/components/shop/shop-product-grid.tsx` - Product grid
- `/components/shop/shop-layout.tsx` - Layout wrapper

### Configuration

- `/lib/config/shop-categories.ts` - Category definitions
- `/lib/hooks/use-shop-state.ts` - State management
- `/lib/utils/shop-helpers.ts` - Utility functions
- `/types/shop.ts` - TypeScript types

### Routes

- `/app/[locale]/shop/page.tsx` - Root redirect
- `/app/[locale]/shop/[gender]/page.tsx` - Gender page
- `/app/[locale]/shop/[gender]/[category]/page.tsx` - Category page
- `/app/[locale]/shop/[gender]/shop-content.tsx` - Data fetching

### i18n

- `/messages/en.json` - English translations
- `/messages/he.json` - Hebrew translations

---

## Next Steps

1. **Explore Components**: Check each component's source code
2. **Read Full Docs**: See `/docs/SHOP_REDESIGN.md` for architecture details
3. **Customize Styling**: Edit Tailwind classes to match your brand
4. **Add Products**: Enhance mock data in `/lib/stubs/mock-data.ts`
5. **Integrate Real API**: Replace stub calls with Supabase queries

---

## Support

### Documentation

- **Architecture Guide**: `/docs/SHOP_REDESIGN.md`
- **Stub System**: `/docs/STUB_SYSTEM.md`
- **Main Docs**: `/CLAUDE.md`

### Getting Help

1. Check this guide first
2. Review component source code
3. Check TypeScript types for API surface
4. Refer to architecture documentation

---

## Example: Complete Customization

Let's add a "Vintage Score" filter to rank items by authenticity:

### 1. Add Type Definition

```typescript
// types/shop.ts
export interface ProductFilters {
  // ... existing filters
  vintageScore?: number; // 1-5 scale
}
```

### 2. Update Filter Panel

```typescript
// components/shop/filter-sort-panel.tsx
const VINTAGE_SCORES = [1, 2, 3, 4, 5];

// In component:
<div>
  <h3>Vintage Score</h3>
  <div className="flex gap-2">
    {VINTAGE_SCORES.map(score => (
      <button
        key={score}
        onClick={() => updateFilters({ vintageScore: score })}
        className={filters.vintageScore === score ? 'active' : ''}
      >
        {'⭐'.repeat(score)}
      </button>
    ))}
  </div>
</div>
```

### 3. Update Helper Function

```typescript
// lib/utils/shop-helpers.ts
export function filterProducts(products, filters) {
  let filtered = [...products];

  if (filters.vintageScore) {
    filtered = filtered.filter(
      p => p.vintageScore >= filters.vintageScore
    );
  }

  return filtered;
}
```

### 4. Add Translation

```json
{
  "shop": {
    "filters": {
      "vintageScore": "Vintage Score",
      "minScore": "Minimum authenticity rating"
    }
  }
}
```

Done! Your new filter is now fully integrated with URL state, RTL support, and i18n.

---

**Happy coding!** 🎨✨
