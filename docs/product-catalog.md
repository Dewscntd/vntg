# Product Catalog Documentation

## Overview

The VNTG product catalog system provides a comprehensive solution for browsing, searching, and discovering products. It includes advanced filtering, sorting, pagination, and performance optimizations.

## 🏗️ Architecture

### Core Components
- **Product Pages** - Listing, detail, category, and search pages
- **Navigation Components** - Search, filters, sorting, breadcrumbs
- **Product Components** - Cards, grids, galleries, information displays
- **Performance Features** - Lazy loading, skeleton states, caching
- **SEO Components** - Meta tags, structured data, social sharing

## 📄 Pages

### Products Listing Page (`/products`)

Main product catalog page with full browsing capabilities.

```typescript
// Features
- Product grid with responsive layout
- Advanced filtering and sorting
- Search integration
- Pagination with URL state
- Skeleton loading states
- SEO optimization
```

**URL Parameters:**
```
/products?search=query&category=id&sort=price&order=asc&page=1
```

### Product Detail Page (`/products/[id]`)

Individual product information and purchase interface.

```typescript
// Features
- Product image gallery with zoom
- Detailed product information
- Variant selection (size, color)
- Add to cart functionality
- Related products
- Reviews and ratings
- Quick view modal
- SEO optimization
```

### Category Pages (`/categories/[id]`)

Category-specific product listings.

```typescript
// Features
- Category-filtered products
- Category description and metadata
- Hierarchical breadcrumb navigation
- All product listing features
- Category-specific SEO
```

### Search Results Page (`/search`)

Search-specific product results.

```typescript
// Features
- Search query highlighting
- Search suggestions and autocomplete
- Filter and sort search results
- Search analytics tracking
- No results state with suggestions
```

## 🧩 Components

### Product Display Components

#### ProductCard
Individual product display card.

```tsx
import { ProductCard } from '@/components/products';

<ProductCard
  product={product}
  priority={false}        // Priority loading for above-fold
  onQuickView={handleQuickView}
  className="custom-class"
/>
```

**Features:**
- ✅ Responsive image with lazy loading
- ✅ Product badges (sale, new, featured)
- ✅ Price display with discounts
- ✅ Hover actions (add to cart, quick view)
- ✅ GSAP animations
- ✅ Accessibility support

#### ProductGrid
Grid layout for multiple products.

```tsx
import { ProductGrid } from '@/components/products';

<ProductGrid
  products={products}
  isLoading={isLoading}
  loadingCount={12}
  enableQuickView={true}
  animateEntrance={true}
  className="custom-grid"
/>
```

**Features:**
- ✅ Responsive grid layout (1-4 columns)
- ✅ Skeleton loading states
- ✅ Staggered entrance animations
- ✅ Quick view integration
- ✅ Empty state handling

#### ProductImageGallery
Image gallery for product detail pages.

```tsx
import { ProductImageGallery } from '@/components/products/detail';

<ProductImageGallery
  images={product.images}
  productName={product.name}
  enableZoom={true}
  showThumbnails={true}
/>
```

**Features:**
- ✅ Main image with thumbnail navigation
- ✅ Zoom functionality
- ✅ Touch/swipe support
- ✅ Keyboard navigation
- ✅ Lazy loading

#### ProductInformation
Product details and specifications.

```tsx
import { ProductInformation } from '@/components/products/detail';

<ProductInformation
  product={product}
  showDescription={true}
  showSpecifications={true}
  showReviews={true}
/>
```

**Features:**
- ✅ Product name and description
- ✅ Price with discount display
- ✅ Stock status and availability
- ✅ Product specifications
- ✅ Review summary

### Navigation Components

#### ProductSearch
Search input with autocomplete.

```tsx
import { ProductSearch } from '@/components/products/browse';

<ProductSearch
  placeholder="Search products..."
  showSuggestions={true}
  onSearch={handleSearch}
  className="w-full"
/>
```

**Features:**
- ✅ Real-time search suggestions
- ✅ Debounced input for performance
- ✅ Keyboard navigation
- ✅ Search history
- ✅ Mobile-optimized

#### ProductFilters
Advanced filtering interface.

```tsx
import { ProductFilters } from '@/components/products/browse';

<ProductFilters
  onFiltersChange={handleFiltersChange}
  showMobileToggle={true}
  className="sidebar-filters"
/>
```

**Features:**
- ✅ Category dropdown
- ✅ Price range slider
- ✅ Product type checkboxes
- ✅ Active filter display
- ✅ Mobile-responsive design

#### ProductSorting
Sort options for product lists.

```tsx
import { ProductSorting } from '@/components/products/browse';

<ProductSorting
  currentSort="price"
  currentOrder="asc"
  onSortChange={handleSortChange}
/>
```

**Features:**
- ✅ Multiple sort options
- ✅ Ascending/descending order
- ✅ URL parameter integration
- ✅ Clean dropdown interface

#### Breadcrumb
Navigation breadcrumbs.

```tsx
import { Breadcrumb } from '@/components/navigation';

<Breadcrumb
  items={breadcrumbItems}
  showHome={true}
  className="mb-6"
/>
```

**Features:**
- ✅ Hierarchical navigation
- ✅ Current page highlighting
- ✅ Home icon integration
- ✅ Accessible markup

#### Pagination
Page navigation for large datasets.

```tsx
import { Pagination } from '@/components/navigation';

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  showInfo={true}
/>
```

**Features:**
- ✅ Smart page number display
- ✅ Previous/next navigation
- ✅ Results information
- ✅ URL parameter integration

### Performance Components

#### LazyImage
Optimized image loading.

```tsx
import { LazyImage } from '@/components/ui';

<LazyImage
  src="/product.jpg"
  alt="Product name"
  width={400}
  height={300}
  placeholder="skeleton"
  rootMargin="50px"
/>
```

**Features:**
- ✅ Intersection Observer
- ✅ Multiple placeholder options
- ✅ Error handling
- ✅ Smooth transitions

#### ProductSkeleton
Loading state components.

```tsx
import { ProductCardSkeleton, ProductGridSkeleton } from '@/components/products/skeletons';

// Single card skeleton
<ProductCardSkeleton />

// Grid skeleton
<ProductGridSkeleton count={12} />
```

**Features:**
- ✅ Realistic loading states
- ✅ Configurable count
- ✅ Smooth animations
- ✅ Responsive design

#### QuickViewModal
Product preview modal.

```tsx
import { QuickViewModal } from '@/components/products';

<QuickViewModal
  productId={productId}
  isOpen={isOpen}
  onClose={handleClose}
/>
```

**Features:**
- ✅ Product preview without navigation
- ✅ Add to cart functionality
- ✅ Variant selection
- ✅ GSAP animations
- ✅ Keyboard navigation

## 🔧 Hooks and Utilities

### Data Fetching Hooks

#### useProducts
Fetch products with filtering and pagination.

```tsx
import { useProducts } from '@/lib/hooks';

const {
  data: products,
  isLoading,
  error,
  pagination,
  refetch
} = useProducts({
  search: 'query',
  category: 'category-id',
  sort: 'price',
  order: 'asc',
  page: 1,
  limit: 12
});
```

#### useProduct
Fetch single product details.

```tsx
import { useProduct } from '@/lib/hooks';

const {
  data: product,
  isLoading,
  error,
  refetch
} = useProduct(productId);
```

#### useCategories
Fetch product categories.

```tsx
import { useCategories } from '@/lib/hooks';

const {
  data: categories,
  isLoading,
  error
} = useCategories();
```

### Search and Filter Hooks

#### useProductSearch
Search functionality with debouncing.

```tsx
import { useProductSearch } from '@/lib/hooks';

const {
  query,
  setQuery,
  suggestions,
  isSearching,
  results
} = useProductSearch({
  debounceMs: 300,
  minLength: 2
});
```

#### useProductFilters
Filter state management.

```tsx
import { useProductFilters } from '@/lib/hooks';

const {
  filters,
  updateFilter,
  clearFilters,
  activeFilters,
  filterCount
} = useProductFilters();
```

### Animation Hooks

#### useProductCardAnimation
GSAP animations for product cards.

```tsx
import { useProductCardAnimation } from '@/lib/hooks/use-gsap';

const cardRef = useProductCardAnimation({
  hoverScale: 1.05,
  duration: 0.3
});

return <div ref={cardRef}>Product Card</div>;
```

#### useGridAnimation
Staggered animations for product grids.

```tsx
import { useGridAnimation } from '@/lib/hooks/use-gsap';

const { containerRef, animateItems } = useGridAnimation();

useEffect(() => {
  if (products.length > 0) {
    animateItems();
  }
}, [products, animateItems]);
```

## 🎨 Styling and Theming

### Design System
Product components follow a consistent design system.

```css
/* CSS Variables for theming */
:root {
  --product-card-radius: 0.5rem;
  --product-card-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --product-card-hover-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --product-grid-gap: 1.5rem;
  --product-image-aspect: 1 / 1;
}
```

### Responsive Breakpoints
```css
/* Grid responsive behavior */
.product-grid {
  grid-template-columns: 1fr;                    /* Mobile */
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);       /* Tablet */
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);       /* Desktop */
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);       /* Large */
  }
}
```

### Component Variants
```tsx
// Product card variants
<ProductCard variant="default" />    // Standard card
<ProductCard variant="compact" />    // Smaller card
<ProductCard variant="featured" />   // Highlighted card
<ProductCard variant="minimal" />    // Clean, minimal design
```

## 🔍 SEO Optimization

### Meta Tags
Automatic meta tag generation for product pages.

```tsx
// Product detail page SEO
<ProductSEO
  product={product}
  canonical={`https://vntg.com/products/${product.id}`}
/>
```

### Structured Data
JSON-LD structured data for search engines.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description",
  "image": ["https://example.com/image.jpg"],
  "brand": {
    "@type": "Brand",
    "name": "VNTG"
  },
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
```

### URL Structure
SEO-friendly URL patterns.

```
/products                           # All products
/products?search=query              # Search results
/products?category=electronics      # Category filter
/products/product-slug-123          # Product detail
/categories/electronics             # Category page
```

## 📊 Performance Optimizations

### Image Optimization
- Next.js Image component with automatic optimization
- WebP format with fallbacks
- Responsive images with srcset
- Lazy loading with intersection observer
- Priority loading for above-fold images

### Code Splitting
- Route-based code splitting
- Dynamic imports for heavy components
- Lazy loading of non-critical features
- Vendor chunk optimization

### Caching Strategy
- Static page generation for product listings
- Incremental Static Regeneration for product details
- API response caching
- Browser caching with proper headers

### Loading Performance
- Skeleton loading states
- Progressive image loading
- Debounced search inputs
- Optimistic UI updates

## 🧪 Testing

### Unit Tests
```tsx
// Product component tests
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/products';

test('renders product card with correct information', () => {
  const product = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    image_url: '/test.jpg'
  };
  
  render(<ProductCard product={product} />);
  
  expect(screen.getByText('Test Product')).toBeInTheDocument();
  expect(screen.getByText('$99.99')).toBeInTheDocument();
});
```

### Integration Tests
```tsx
// Product listing integration test
test('filters products by category', async () => {
  render(<ProductsPage />);
  
  const categoryFilter = screen.getByLabelText('Category');
  fireEvent.change(categoryFilter, { target: { value: 'electronics' } });
  
  await waitFor(() => {
    expect(screen.getByText('Electronics Products')).toBeInTheDocument();
  });
});
```

### E2E Tests
```typescript
// Product browsing E2E test
test('user can browse and view product details', async ({ page }) => {
  await page.goto('/products');
  
  // Click on first product
  await page.click('[data-testid="product-card"]:first-child');
  
  // Verify product detail page
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-testid="add-to-cart"]')).toBeVisible();
});
```

## 🔧 Configuration

### Environment Variables
```env
# Product catalog configuration
NEXT_PUBLIC_PRODUCTS_PER_PAGE=12
NEXT_PUBLIC_ENABLE_QUICK_VIEW=true
NEXT_PUBLIC_ENABLE_PRODUCT_REVIEWS=true
NEXT_PUBLIC_MAX_SEARCH_SUGGESTIONS=5
```

### Feature Flags
```typescript
// Feature configuration
export const productConfig = {
  enableQuickView: process.env.NEXT_PUBLIC_ENABLE_QUICK_VIEW === 'true',
  enableReviews: process.env.NEXT_PUBLIC_ENABLE_PRODUCT_REVIEWS === 'true',
  productsPerPage: parseInt(process.env.NEXT_PUBLIC_PRODUCTS_PER_PAGE || '12'),
  maxSearchSuggestions: parseInt(process.env.NEXT_PUBLIC_MAX_SEARCH_SUGGESTIONS || '5'),
};
```

## 🚀 Future Enhancements

### Planned Features
- Advanced product recommendations
- Product comparison functionality
- Wishlist integration
- Product reviews and ratings
- Advanced search with filters
- Product variants (size, color)
- Bulk product operations
- Product import/export

### Performance Improvements
- Service worker for offline browsing
- Predictive loading of product details
- Advanced image optimization
- GraphQL for efficient data fetching

---

The product catalog system provides a solid foundation for e-commerce product browsing with excellent performance, SEO, and user experience.
