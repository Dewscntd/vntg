'use client';

import type { CartItem } from '@/lib/context/cart-context';

const CART_STORAGE_KEY = 'vntg-cart';
const CART_TIMESTAMP_KEY = 'vntg-cart-timestamp';
const CART_EXPIRY_DAYS = 7; // Cart expires after 7 days

export interface StoredCart {
  items: CartItem[];
  total: number;
  itemCount: number;
  timestamp: number;
}

// Save cart to local storage
export function saveCartToStorage(cart: Omit<StoredCart, 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  try {
    const cartData: StoredCart = {
      ...cart,
      timestamp: Date.now(),
    };

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    localStorage.setItem(CART_TIMESTAMP_KEY, cartData.timestamp.toString());
  } catch (error) {
    console.warn('Failed to save cart to localStorage:', error);
  }
}

// Load cart from local storage
export function loadCartFromStorage(): StoredCart | null {
  if (typeof window === 'undefined') return null;

  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    const timestamp = localStorage.getItem(CART_TIMESTAMP_KEY);

    if (!cartData || !timestamp) return null;

    const parsedCart: StoredCart = JSON.parse(cartData);
    const cartAge = Date.now() - parseInt(timestamp);
    const maxAge = CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    // Check if cart has expired
    if (cartAge > maxAge) {
      clearCartFromStorage();
      return null;
    }

    return parsedCart;
  } catch (error) {
    console.warn('Failed to load cart from localStorage:', error);
    clearCartFromStorage();
    return null;
  }
}

// Clear cart from local storage
export function clearCartFromStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CART_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Failed to clear cart from localStorage:', error);
  }
}

// Merge local cart with server cart (for when user logs in)
export function mergeCartData(
  localCart: StoredCart | null,
  serverCart: { items: CartItem[]; total: number; itemCount: number }
): { items: CartItem[]; total: number; itemCount: number } {
  if (!localCart || localCart.items.length === 0) {
    return serverCart;
  }

  if (serverCart.items.length === 0) {
    return {
      items: localCart.items,
      total: localCart.total,
      itemCount: localCart.itemCount,
    };
  }

  // Merge items, avoiding duplicates
  const mergedItems: CartItem[] = [...serverCart.items];

  localCart.items.forEach((localItem) => {
    const existingItemIndex = mergedItems.findIndex(
      (serverItem) => serverItem.product_id === localItem.product_id
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      mergedItems[existingItemIndex].quantity += localItem.quantity;
    } else {
      // Add new item
      mergedItems.push(localItem);
    }
  });

  // Recalculate totals
  const total = mergedItems.reduce((sum, item) => {
    const price = item.product.discount_percent
      ? item.product.price * (1 - item.product.discount_percent / 100)
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = mergedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: mergedItems,
    total,
    itemCount,
  };
}

// Sync cart with server (for authenticated users)
export async function syncCartWithServer(
  localCart: StoredCart | null,
  accessToken: string
): Promise<{ items: CartItem[]; total: number; itemCount: number } | null> {
  try {
    // First, get server cart
    const serverResponse = await fetch('/api/cart', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!serverResponse.ok) {
      throw new Error('Failed to fetch server cart');
    }

    const serverCart = await serverResponse.json();

    // Merge with local cart if it exists
    const mergedCart = mergeCartData(localCart, serverCart);

    // If there were local items, sync them to server
    if (localCart && localCart.items.length > 0) {
      const syncResponse = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ items: mergedCart.items }),
      });

      if (!syncResponse.ok) {
        console.warn('Failed to sync cart to server');
        return mergedCart; // Return merged cart even if sync failed
      }

      // Clear local storage after successful sync
      clearCartFromStorage();
    }

    return mergedCart;
  } catch (error) {
    console.warn('Failed to sync cart with server:', error);
    return localCart
      ? {
          items: localCart.items,
          total: localCart.total,
          itemCount: localCart.itemCount,
        }
      : null;
  }
}

// Cart analytics helpers
export function trackCartEvent(event: string, data?: any): void {
  if (typeof window === 'undefined') return;

  // This would integrate with your analytics service
  // For now, just log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Cart Event:', event, data);
  }

  // Example integration with Google Analytics
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', event, {
      event_category: 'cart',
      ...data,
    });
  }
}

// Cart abandonment tracking
export function trackCartAbandonment(): void {
  const cart = loadCartFromStorage();

  if (cart && cart.items.length > 0) {
    trackCartEvent('cart_abandoned', {
      item_count: cart.itemCount,
      cart_value: cart.total,
      items: cart.items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
    });
  }
}

// Set up cart abandonment tracking on page unload
export function setupCartAbandonmentTracking(): (() => void) | void {
  if (typeof window === 'undefined') return;

  const handleBeforeUnload = () => {
    trackCartAbandonment();
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}
