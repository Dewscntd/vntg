# Cart Integration Guide

## Overview
This guide explains how to integrate the VNTG cart system into your application.

## Setup

### 1. Provider Setup
Wrap your app with the CartProvider:

```tsx
import { CartProviderWrapper } from '@/components/providers/cart-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CartProviderWrapper>
          {children}
        </CartProviderWrapper>
      </body>
    </html>
  );
}
```

### 2. Header Integration
Add the cart button with preview to your header:

```tsx
import { CartPreview, CartButton } from '@/components/cart';

export function Header() {
  return (
    <header>
      {/* Other header content */}
      <CartPreview
        trigger={<CartButton />}
        side="bottom"
        align="end"
        showOnHover={true}
      />
    </header>
  );
}
```

## Components

### CartButton
Basic cart button with item count badge:

```tsx
<CartButton 
  variant="ghost"
  size="md"
  showText={false}
  showBadge={true}
/>
```

### CartDrawer
Sliding cart panel:

```tsx
<CartDrawer>
  <CartButton />
</CartDrawer>
```

### CartPreview
Hover preview of cart contents:

```tsx
<CartPreview
  trigger={<CartButton />}
  side="bottom"
  align="end"
  showOnHover={true}
  hideDelay={300}
/>
```

### CartItem
Individual cart item display:

```tsx
<CartItem 
  item={cartItem}
  compact={false}
/>
```

### CartSummary
Order summary with totals:

```tsx
<CartSummary
  showCheckoutButton={true}
  showContinueShoppingButton={true}
  compact={false}
/>
```

### EmptyCart
Empty cart state:

```tsx
<EmptyCart
  compact={false}
  showSuggestions={true}
/>
```

## Hooks

### useCart
Main cart context hook:

```tsx
const {
  items,
  itemCount,
  total,
  isLoading,
  isOpen,
  addItem,
  removeItem,
  updateQuantity,
  openCart,
  closeCart,
  toggleCart,
} = useCart();
```

### useCartActions
Enhanced cart actions with toast notifications:

```tsx
const {
  addToCartWithToast,
  removeFromCartWithToast,
  updateQuantityWithToast,
} = useCartActions();
```

### useCartAccessibility
Accessibility features:

```tsx
const {
  getCartButtonProps,
  getCartDrawerProps,
  getCartItemProps,
  announceCartChange,
} = useCartAccessibility();
```

## Analytics

### Automatic Tracking
The cart system automatically tracks:
- Add to cart events
- Remove from cart events
- Cart view events
- Cart abandonment
- Recovery attempts

### Manual Tracking
Use cartAnalytics for custom events:

```tsx
import { cartAnalytics } from '@/lib/utils/cart-analytics';

// Track custom events
cartAnalytics.shareCart('email', items, total, userId);
cartAnalytics.applyDiscount('SAVE10', 10, total, userId);
```

## Persistence

### Local Storage
Cart data is automatically saved to localStorage for non-authenticated users.

### Server Sync
When users log in, local cart data is merged with server cart data.

### Cross-Device Sync
Authenticated users have their cart synced across devices.

## Abandonment Recovery

### Automatic Tracking
Cart abandonment is tracked when:
- User leaves the page with items in cart
- User is inactive for 5+ minutes
- User closes browser tab

### Recovery Methods
- Email reminders (backend integration required)
- Popup notifications
- Recovery page links

### Recovery Page
Access via `/cart/recovery?recovery={eventId}&discount={code}`

## Animations

### GSAP Integration
Cart components include smooth GSAP animations:
- Cart drawer slide in/out
- Item add/remove animations
- Badge updates
- Button feedback

### Custom Animations
Use cart animation utilities:

```tsx
import { cartAnimations } from '@/lib/animations/cart-animations';

// Animate cart button
cartAnimations.addToCartSuccess(buttonElement);

// Animate item removal
cartAnimations.itemSlideOut(itemElement);
```

## Accessibility

### Features
- Screen reader announcements
- Keyboard navigation
- Focus management
- ARIA attributes
- High contrast support

### Keyboard Shortcuts
- `Ctrl/Cmd + Shift + C`: Toggle cart

## Mobile Optimization

### Responsive Design
All cart components are fully responsive and touch-friendly.

### Mobile-Specific Features
- Touch gestures for quantity controls
- Optimized drawer sizing
- Mobile-friendly preview

## Error Handling

### Network Errors
Cart operations gracefully handle network failures with:
- Retry mechanisms
- Offline support
- Error notifications

### Validation
- Inventory checking
- Quantity limits
- Product availability

## Performance

### Optimizations
- Lazy loading of cart data
- Debounced API calls
- Efficient re-renders
- Image optimization

### Caching
- Local storage backup
- API response caching
- Optimistic updates

## Testing

### Unit Tests
Test cart functionality:

```tsx
import { renderHook } from '@testing-library/react';
import { useCart } from '@/lib/context/cart-context';

test('should add item to cart', async () => {
  const { result } = renderHook(() => useCart());
  await result.current.addItem('product-id', 1);
  expect(result.current.itemCount).toBe(1);
});
```

### Integration Tests
Test cart workflows end-to-end.

## Troubleshooting

### Common Issues

1. **Cart not persisting**
   - Check localStorage permissions
   - Verify authentication state

2. **Animations not working**
   - Ensure GSAP is loaded
   - Check for CSS conflicts

3. **Analytics not tracking**
   - Verify analytics configuration
   - Check network requests

### Debug Mode
Enable debug logging:

```tsx
// Set in development
localStorage.setItem('vntg-cart-debug', 'true');
```

## API Integration

### Required Endpoints
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove` - Remove item from cart
- `POST /api/cart/sync` - Sync cart data

### Optional Endpoints
- `POST /api/analytics/cart-abandonment` - Track abandonment
- `POST /api/analytics/cart-recovery` - Track recovery
- `POST /api/cart/abandonment/schedule-email` - Schedule emails

## Customization

### Theming
Cart components use CSS variables for theming:

```css
:root {
  --cart-primary: #your-color;
  --cart-background: #your-bg;
  --cart-border: #your-border;
}
```

### Custom Components
Extend cart components:

```tsx
import { CartItem } from '@/components/cart';

export function CustomCartItem({ item, ...props }) {
  return (
    <CartItem item={item} {...props}>
      {/* Custom content */}
    </CartItem>
  );
}
```

## Best Practices

1. **Always use CartProvider** at the app root
2. **Handle loading states** for better UX
3. **Implement error boundaries** for cart components
4. **Test cart flows** thoroughly
5. **Monitor analytics** for optimization opportunities
6. **Keep cart data minimal** for performance
7. **Implement proper validation** on both client and server
8. **Use optimistic updates** for better perceived performance
