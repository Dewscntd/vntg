# VNTG Architecture Overview

This document provides a comprehensive overview of the VNTG e-commerce platform architecture, design patterns, and technical decisions.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │    │   (Supabase)    │    │   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React 18      │    │ • PostgreSQL    │    │ • Stripe        │
│ • TypeScript    │◄──►│ • Auth          │◄──►│ • Analytics     │
│ • Tailwind CSS  │    │ • Storage       │    │ • CDN           │
│ • GSAP          │    │ • Edge Functions│    │ • Email         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI component library
- **GSAP** - Professional animation library
- **Radix UI** - Accessible primitive components

#### Backend
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Relational database
- **Row Level Security** - Database-level security
- **Edge Functions** - Serverless compute
- **Real-time** - WebSocket connections

#### External Services
- **Stripe** - Payment processing
- **Vercel** - Hosting and deployment
- **Google Analytics** - Web analytics
- **Facebook Pixel** - Social media analytics

## Design Patterns

### 1. Component Composition

```typescript
// Composable component pattern
<CartPreview
  trigger={<CartButton />}
  side="bottom"
  align="end"
>
  <CartSummary />
</CartPreview>
```

**Benefits:**
- Reusable components
- Flexible composition
- Separation of concerns
- Easy testing

### 2. Context + Hooks Pattern

```typescript
// Context for global state
const CartContext = createContext<CartContextType>();

// Custom hook for consuming context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

**Benefits:**
- Centralized state management
- Type-safe context consumption
- Prevents context misuse
- Easy to test and mock

### 3. Provider Pattern

```typescript
// Provider wrapper for easy setup
export function CartProviderWrapper({ children }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
```

**Benefits:**
- Encapsulates setup logic
- Reduces boilerplate
- Consistent initialization
- Easy to configure

### 4. Custom Hooks Pattern

```typescript
// Encapsulate complex logic in hooks
export function useCartActions() {
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const addToCartWithToast = useCallback(async (productId, name) => {
    await addItem(productId);
    toast({ title: 'Added to cart', description: `${name} added` });
  }, [addItem, toast]);
  
  return { addToCartWithToast };
}
```

**Benefits:**
- Reusable business logic
- Separation of concerns
- Easy to test
- Composable functionality

### 5. Render Props Pattern

```typescript
// Flexible rendering with render props
<DataFetcher
  url="/api/products"
  render={({ data, loading, error }) => (
    loading ? <ProductSkeleton /> :
    error ? <ErrorMessage /> :
    <ProductGrid products={data} />
  )}
/>
```

**Benefits:**
- Flexible rendering
- Reusable data logic
- Inversion of control
- Easy to customize

## Data Flow Architecture

### 1. Unidirectional Data Flow

```
User Action → Hook → API Call → Database → Context Update → UI Update
```

### 2. State Management Layers

```typescript
// 1. Server State (API data)
const { data: products } = useProducts();

// 2. Global State (React Context)
const { items, total } = useCart();

// 3. Local State (Component state)
const [isOpen, setIsOpen] = useState(false);

// 4. Persistent State (localStorage)
const cart = loadCartFromStorage();
```

### 3. Event-Driven Updates

```typescript
// Events trigger state updates
cartAnalytics.addToCart(item, userId);
trackCartAbandonment(items, total, userId);
announceCartChange('Item added to cart');
```

## Component Architecture

### 1. Atomic Design Principles

```
Atoms → Molecules → Organisms → Templates → Pages
```

#### Atoms (Basic UI Elements)
- Button, Input, Label
- Icon, Badge, Separator
- Typography components

#### Molecules (Simple Components)
- SearchBox, PriceDisplay
- QuantitySelector, ProductBadge
- FormField, NavigationItem

#### Organisms (Complex Components)
- ProductCard, CartItem
- ProductGrid, CartDrawer
- Header, Footer

#### Templates (Page Layouts)
- ShopLayout, ProductLayout
- CartLayout, CheckoutLayout
- AdminLayout, AuthLayout

#### Pages (Complete Views)
- ProductsPage, ProductDetailPage
- CartPage, CheckoutPage
- LoginPage, DashboardPage

### 2. Component Patterns

#### Container/Presentational Pattern

```typescript
// Container (logic)
function ProductListContainer() {
  const { data, loading, error } = useProducts();
  return (
    <ProductListPresentation 
      products={data}
      loading={loading}
      error={error}
    />
  );
}

// Presentational (UI)
function ProductListPresentation({ products, loading, error }) {
  if (loading) return <ProductSkeleton />;
  if (error) return <ErrorMessage />;
  return <ProductGrid products={products} />;
}
```

#### Compound Component Pattern

```typescript
// Compound components for flexibility
<Card>
  <Card.Header>
    <Card.Title>Product Name</Card.Title>
  </Card.Header>
  <Card.Content>
    <Card.Description>Product description</Card.Description>
  </Card.Content>
  <Card.Footer>
    <Card.Actions>
      <Button>Add to Cart</Button>
    </Card.Actions>
  </Card.Footer>
</Card>
```

## API Architecture

### 1. RESTful API Design

```typescript
// Resource-based URLs
GET    /api/products           # List products
GET    /api/products/:id       # Get product
POST   /api/products           # Create product
PUT    /api/products/:id       # Update product
DELETE /api/products/:id       # Delete product

GET    /api/cart               # Get cart
POST   /api/cart/add           # Add to cart
PUT    /api/cart/update        # Update cart item
DELETE /api/cart/remove        # Remove from cart
```

### 2. API Route Structure

```typescript
// Consistent API route pattern
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, session) => {
    try {
      const data = await fetchData(session.user.id);
      return successResponse(data);
    } catch (error) {
      return handleDatabaseError(error);
    }
  });
}
```

### 3. Middleware Pattern

```typescript
// Composable middleware
export function withAuth(req, handler) {
  return withValidation(req, schema, (req, data) =>
    withRateLimit(req, () =>
      handler(req, data)
    )
  );
}
```

## Database Architecture

### 1. Schema Design

```sql
-- Users table
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Products table
products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2),
  inventory_count INTEGER,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Cart items table
cart_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 2. Row Level Security

```sql
-- RLS policies for data security
CREATE POLICY "Users can only see their own cart items"
ON cart_items FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);
```

### 3. Database Functions

```sql
-- Custom database functions
CREATE OR REPLACE FUNCTION get_cart_total(user_uuid UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT SUM(p.price * ci.quantity)
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;
```

## Security Architecture

### 1. Authentication Flow

```
1. User submits credentials
2. Supabase validates credentials
3. JWT token issued
4. Token stored in httpOnly cookie
5. Token validated on each request
6. RLS policies enforce data access
```

### 2. Authorization Layers

```typescript
// Multiple authorization layers
1. Route-level protection (middleware)
2. Component-level guards
3. API-level validation
4. Database-level RLS
```

### 3. Data Validation

```typescript
// Input validation with Zod
const addToCartSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

export async function POST(req: NextRequest) {
  return withValidation(req, addToCartSchema, async (req, data) => {
    // Validated data is safe to use
    return await addToCart(data);
  });
}
```

## Performance Architecture

### 1. Rendering Strategy

```typescript
// Hybrid rendering approach
- Static pages: Pre-rendered at build time
- Dynamic pages: Server-side rendered
- Interactive components: Client-side rendered
- API routes: Edge functions
```

### 2. Caching Strategy

```typescript
// Multi-layer caching
1. CDN caching (Vercel Edge)
2. Browser caching (Cache-Control headers)
3. API response caching (SWR/React Query)
4. Database query caching (Supabase)
5. Local storage caching (cart data)
```

### 3. Code Splitting

```typescript
// Automatic code splitting
- Route-based splitting (Next.js)
- Component-based splitting (dynamic imports)
- Library splitting (vendor chunks)
- CSS splitting (per-route styles)
```

### 4. Image Optimization

```typescript
// Next.js Image optimization
<Image
  src="/product.jpg"
  alt="Product"
  width={400}
  height={300}
  priority={isAboveFold}
  placeholder="blur"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

## Animation Architecture

### 1. GSAP Integration

```typescript
// Centralized animation utilities
export const cartAnimations = {
  slideIn: (element) => gsap.fromTo(element, ...),
  fadeIn: (element) => gsap.fromTo(element, ...),
  scaleIn: (element) => gsap.fromTo(element, ...),
};

// React hook integration
export function useCartAnimation() {
  const ref = useRef();
  
  useGSAP(() => {
    cartAnimations.slideIn(ref.current);
  }, []);
  
  return ref;
}
```

### 2. Performance Optimization

```typescript
// Animation performance best practices
- Hardware acceleration (transform3d)
- Efficient cleanup (useGSAP)
- Reduced layout thrashing
- RequestAnimationFrame usage
```

## Testing Architecture

### 1. Testing Strategy

```typescript
// Testing pyramid
1. Unit tests (70%) - Individual functions/components
2. Integration tests (20%) - Component interactions
3. E2E tests (10%) - Full user workflows
```

### 2. Testing Tools

```typescript
// Testing stack
- Jest: Unit testing framework
- React Testing Library: Component testing
- Playwright: E2E testing
- MSW: API mocking
- Storybook: Component documentation
```

### 3. Test Organization

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
├── mocks/         # Mock data and functions
└── utils/         # Testing utilities
```

## Deployment Architecture

### 1. CI/CD Pipeline

```yaml
# GitHub Actions workflow
1. Code push to repository
2. Run linting and type checking
3. Run unit and integration tests
4. Build application
5. Deploy to Vercel
6. Run E2E tests
7. Notify team of deployment status
```

### 2. Environment Strategy

```typescript
// Environment separation
- Development: Local development
- Preview: Feature branch deployments
- Staging: Pre-production testing
- Production: Live application
```

### 3. Monitoring & Observability

```typescript
// Monitoring stack
- Vercel Analytics: Performance metrics
- Sentry: Error tracking
- Google Analytics: User behavior
- Custom analytics: Business metrics
```

## Scalability Considerations

### 1. Horizontal Scaling

```typescript
// Scalable architecture patterns
- Stateless components
- Database connection pooling
- CDN for static assets
- Edge functions for API routes
```

### 2. Performance Monitoring

```typescript
// Key metrics to monitor
- Core Web Vitals (LCP, FID, CLS)
- API response times
- Database query performance
- Error rates and types
```

### 3. Future Enhancements

```typescript
// Planned improvements
- Service worker for offline support
- GraphQL for efficient data fetching
- Micro-frontends for team scaling
- Advanced caching strategies
```

---

This architecture provides a solid foundation for a scalable, maintainable, and performant e-commerce platform. The modular design allows for easy extension and modification as requirements evolve.
