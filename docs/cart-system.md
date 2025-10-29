# Shopping Cart System Documentation

## Overview

The Peakees shopping cart system is a comprehensive, production-ready cart implementation featuring persistent state, cross-device synchronization, abandonment recovery, and advanced UX with GSAP animations.

## 🏗️ Architecture

### Core Components

- **CartContext** - Global state management with React Context
- **CartProvider** - Provider wrapper with persistence and sync
- **Cart Components** - UI components for cart interactions
- **Cart Hooks** - Custom hooks for cart operations
- **Analytics System** - Comprehensive tracking and insights
- **Abandonment Recovery** - Automated recovery mechanisms

### Data Flow

```
User Action → Cart Hook → API Call → Database → Context Update → UI Update
                ↓
         Analytics Tracking → Recovery System → Notifications
```

## 🛒 Components

### CartButton

The main cart trigger button with item count badge.

```tsx
import { CartButton } from '@/components/cart';

<CartButton
  variant="ghost" // 'default' | 'outline' | 'ghost'
  size="md" // 'sm' | 'md' | 'lg'
  showText={false} // Show "Cart" text
  showBadge={true} // Show item count badge
/>;
```

**Features:**

- ✅ Animated item count badge
- ✅ Multiple size and style variants
- ✅ Accessibility support with ARIA labels
- ✅ GSAP animations for interactions

### CartDrawer

Sliding panel cart interface.

```tsx
import { CartDrawer } from '@/components/cart';

<CartDrawer>
  <CartButton />
</CartDrawer>;
```

**Features:**

- ✅ Smooth slide-in/out animations
- ✅ Scrollable item list
- ✅ Loading states and error handling
- ✅ Mobile-optimized design
- ✅ Keyboard navigation support

### CartPreview

Hover preview of cart contents.

```tsx
import { CartPreview } from '@/components/cart';

<CartPreview
  trigger={<CartButton />}
  side="bottom" // 'top' | 'bottom' | 'left' | 'right'
  align="end" // 'start' | 'center' | 'end'
  showOnHover={true} // Show on hover vs click
  hideDelay={300} // Hide delay in ms
/>;
```

**Features:**

- ✅ Configurable positioning
- ✅ Quick actions (view cart, checkout)
- ✅ Compact item display
- ✅ Smart show/hide timing

### CartItem

Individual cart item display and controls.

```tsx
import { CartItem } from '@/components/cart';

<CartItem
  item={cartItem}
  compact={false} // Compact mode for previews
/>;
```

**Features:**

- ✅ Quantity controls with validation
- ✅ Remove item functionality
- ✅ Stock limit enforcement
- ✅ Animated interactions
- ✅ Compact and full display modes

### CartSummary

Order summary with pricing and actions.

```tsx
import { CartSummary } from '@/components/cart';

<CartSummary showCheckoutButton={true} showContinueShoppingButton={true} compact={false} />;
```

**Features:**

- ✅ Price calculations (subtotal, tax, shipping)
- ✅ Free shipping progress indicator
- ✅ Trust indicators and security badges
- ✅ Action buttons for checkout

### EmptyCart

Empty cart state with suggestions.

```tsx
import { EmptyCart } from '@/components/cart';

<EmptyCart compact={false} showSuggestions={true} />;
```

**Features:**

- ✅ Animated empty state illustration
- ✅ Shopping suggestions (featured, new, sale)
- ✅ Call-to-action buttons
- ✅ Compact mode for small spaces

## 🔧 Hooks and Context

### useCart

Main cart context hook for state and actions.

```tsx
import { useCart } from '@/lib/context/cart-context';

const {
  // State
  items, // CartItem[]
  itemCount, // number
  total, // number
  isLoading, // boolean
  error, // string | null
  isOpen, // boolean

  // Actions
  addItem, // (productId: string, quantity?: number) => Promise<void>
  removeItem, // (itemId: string) => Promise<void>
  updateQuantity, // (itemId: string, quantity: number) => Promise<void>
  clearCart, // () => Promise<void>
  openCart, // () => void
  closeCart, // () => void
  toggleCart, // () => void
  refreshCart, // () => Promise<void>
} = useCart();
```

### useCartActions

Enhanced cart actions with toast notifications.

```tsx
import { useCartActions } from '@/lib/hooks/use-cart-actions';

const {
  addToCartWithToast, // (productId, productName, quantity) => Promise<void>
  removeFromCartWithToast, // (itemId, productName) => Promise<void>
  updateQuantityWithToast, // (itemId, quantity, productName) => Promise<void>
} = useCartActions();
```

### useCartAccessibility

Accessibility features and ARIA attributes.

```tsx
import { useCartAccessibility } from '@/lib/hooks/use-cart-accessibility';

const {
  getCartButtonProps, // () => ARIA props for cart button
  getCartDrawerProps, // () => ARIA props for cart drawer
  getCartItemProps, // (name, quantity, price) => ARIA props
  announceCartChange, // (message: string) => void
} = useCartAccessibility();
```

## 💾 Persistence & Synchronization

### Local Storage

Cart data is automatically saved to localStorage for non-authenticated users.

```typescript
// Automatic persistence
- Saves cart state on every change
- 7-day expiration for stored data
- Handles corrupted or expired data
- Clears on successful checkout
```

### Cross-Device Sync

Authenticated users have their cart synchronized across devices.

```typescript
// Sync process
1. User logs in
2. Load local cart from storage
3. Fetch server cart from API
4. Merge local and server carts
5. Update server with merged data
6. Clear local storage
```

### Data Merging

Smart merging of local and server cart data.

```typescript
// Merge strategy
- Combine items from both carts
- Sum quantities for duplicate products
- Respect inventory limits
- Preserve most recent data
```

## 📊 Analytics & Tracking

### Automatic Events

The cart system automatically tracks:

```typescript
// Cart Events
- add_to_cart: When items are added
- remove_from_cart: When items are removed
- view_cart: When cart is opened/viewed
- update_cart_quantity: When quantities change
- abandon_cart: When cart is abandoned
- recover_cart: When cart is recovered
```

### Google Analytics 4

Enhanced ecommerce tracking with GA4.

```typescript
// GA4 Events
- add_to_cart: Standard ecommerce event
- remove_from_cart: Standard ecommerce event
- view_cart: Standard ecommerce event
- begin_checkout: When proceeding to checkout
```

### Custom Analytics

Internal analytics API for detailed insights.

```typescript
// Custom Events
- Cart performance metrics
- User behavior patterns
- Conversion funnel analysis
- A/B testing data
```

## 🔄 Abandonment Recovery

### Detection

Automatic detection of cart abandonment.

```typescript
// Abandonment Triggers
- User inactive for 5+ minutes
- User leaves page with items in cart
- User closes browser tab
- User switches to different site
```

### Recovery Methods

#### 1. Popup Notifications

Timed popups with discount offers.

```typescript
// Popup Features
- Appears after 30 minutes of inactivity
- Offers discount code
- One-click cart recovery
- Dismissible with tracking
```

#### 2. Email Reminders

Scheduled email campaigns (backend integration required).

```typescript
// Email Schedule
- 30 minutes: Gentle reminder
- 1 hour: Product highlights
- 3 hours: Discount offer
- 24 hours: Final reminder
```

#### 3. Recovery Pages

Dedicated recovery pages with special offers.

```typescript
// Recovery Page Features
- One-click cart restoration
- Automatic discount application
- Trust indicators
- Urgency messaging
```

### Recovery Analytics

Track recovery performance and optimize campaigns.

```typescript
// Recovery Metrics
- Recovery rate by method
- Time to recovery
- Discount effectiveness
- Revenue recovered
```

## 🎨 Animations

### GSAP Integration

Professional animations powered by GSAP.

```typescript
// Animation Types
- Cart drawer slide in/out
- Item add/remove animations
- Badge count updates
- Button feedback
- Loading states
- Error states
```

### Animation Performance

Optimized for smooth 60fps performance.

```typescript
// Performance Features
- Hardware acceleration
- Efficient cleanup
- Memory management
- Reduced layout thrashing
```

## ♿ Accessibility

### Screen Reader Support

Comprehensive screen reader compatibility.

```typescript
// Accessibility Features
- Cart change announcements
- Item count updates
- Error message announcements
- Success confirmations
```

### Keyboard Navigation

Full keyboard accessibility.

```typescript
// Keyboard Features
- Tab navigation through cart
- Enter/Space for actions
- Escape to close cart
- Arrow keys for quantity
- Ctrl+Shift+C to toggle cart
```

### ARIA Attributes

Complete ARIA markup for assistive technologies.

```typescript
// ARIA Features
- Proper roles and labels
- Live regions for updates
- Expanded/collapsed states
- Item descriptions
```

## 🔒 Security

### Input Validation

Comprehensive validation on client and server.

```typescript
// Validation Features
- Product ID validation
- Quantity limits
- Inventory checking
- User authorization
```

### API Security

Secure API endpoints with proper authentication.

```typescript
// Security Features
- JWT token validation
- Rate limiting
- CSRF protection
- Input sanitization
```

## 🚀 Performance

### Optimizations

Multiple performance optimizations implemented.

```typescript
// Performance Features
- Optimistic updates
- Debounced API calls
- Efficient re-renders
- Lazy loading
- Image optimization
```

### Caching

Smart caching strategies for better performance.

```typescript
// Caching Features
- API response caching
- Local storage backup
- Memory caching
- CDN integration
```

## 🧪 Testing

### Unit Tests

Comprehensive unit test coverage.

```typescript
// Test Coverage
- Cart context functionality
- Hook behavior
- Utility functions
- Component rendering
```

### Integration Tests

End-to-end cart workflow testing.

```typescript
// Integration Tests
- Add to cart flow
- Checkout process
- Recovery scenarios
- Cross-device sync
```

## 🔧 Configuration

### Environment Variables

Required environment variables for cart functionality.

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id
```

### Feature Flags

Configurable features for different environments.

```typescript
// Feature Configuration
- Abandonment recovery enabled
- Analytics tracking enabled
- Debug mode
- Performance monitoring
```

## 📱 Mobile Optimization

### Responsive Design

Fully responsive cart components.

```typescript
// Mobile Features
- Touch-friendly controls
- Optimized drawer sizing
- Gesture support
- Mobile-specific animations
```

### Performance

Optimized for mobile performance.

```typescript
// Mobile Optimizations
- Reduced animation complexity
- Efficient touch handling
- Minimal network requests
- Fast loading times
```

## 🛠️ Troubleshooting

### Common Issues

#### Cart Not Persisting

```typescript
// Solutions
1. Check localStorage permissions
2. Verify authentication state
3. Check browser storage limits
4. Clear corrupted data
```

#### Animations Not Working

```typescript
// Solutions
1. Verify GSAP is loaded
2. Check for CSS conflicts
3. Ensure proper element refs
4. Check animation triggers
```

#### Analytics Not Tracking

```typescript
// Solutions
1. Verify analytics configuration
2. Check network requests
3. Validate event data
4. Check consent settings
```

### Debug Mode

Enable debug logging for troubleshooting.

```typescript
// Enable Debug Mode
localStorage.setItem('peakees-cart-debug', 'true');

// Debug Features
- Console logging
- Performance metrics
- State changes
- API calls
```

## 🔄 Migration Guide

### From Basic Cart

Steps to migrate from a basic cart implementation.

```typescript
// Migration Steps
1. Install cart dependencies
2. Set up CartProvider
3. Replace cart components
4. Update API endpoints
5. Test functionality
```

### Data Migration

Migrate existing cart data to new format.

```typescript
// Data Migration
1. Export existing cart data
2. Transform to new schema
3. Import to new system
4. Validate data integrity
5. Test user flows
```

## 📈 Future Enhancements

### Planned Features

- Wishlist integration
- Cart sharing
- Bulk operations
- Advanced recommendations
- Multi-currency support

### Performance Improvements

- Service worker caching
- Background sync
- Predictive loading
- Edge computing

---

For more detailed implementation examples, see the [Cart Integration Guide](cart-integration-guide.md).
