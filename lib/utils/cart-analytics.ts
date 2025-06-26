'use client';

import { CartItem } from '@/lib/context/cart-context';

export interface CartAnalyticsEvent {
  event: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  data: Record<string, any>;
}

export interface ProductAnalytics {
  product_id: string;
  product_name: string;
  category?: string;
  price: number;
  quantity: number;
  variant?: string;
}

// Generate session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('vntg-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('vntg-session-id', sessionId);
  }
  return sessionId;
}

// Base analytics tracking function
function trackEvent(event: string, data: Record<string, any>, userId?: string): void {
  const analyticsEvent: CartAnalyticsEvent = {
    event,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    userId,
    data,
  };

  // Send to internal analytics
  sendToInternalAnalytics(analyticsEvent);

  // Send to Google Analytics
  sendToGoogleAnalytics(event, data);

  // Send to Facebook Pixel
  sendToFacebookPixel(event, data);

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Cart Analytics:', analyticsEvent);
  }
}

// Send to internal analytics API
async function sendToInternalAnalytics(event: CartAnalyticsEvent): Promise<void> {
  // Only send analytics in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  try {
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.warn('Failed to send internal analytics:', error);
  }
}

// Send to Google Analytics 4
function sendToGoogleAnalytics(event: string, data: Record<string, any>): void {
  if (typeof (window as any).gtag === 'undefined') return;

  switch (event) {
    case 'add_to_cart':
      (window as any).gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: data.value,
        items: data.items,
      });
      break;

    case 'remove_from_cart':
      (window as any).gtag('event', 'remove_from_cart', {
        currency: 'USD',
        value: data.value,
        items: data.items,
      });
      break;

    case 'view_cart':
      (window as any).gtag('event', 'view_cart', {
        currency: 'USD',
        value: data.value,
        items: data.items,
      });
      break;

    case 'begin_checkout':
      (window as any).gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: data.value,
        items: data.items,
      });
      break;

    default:
      (window as any).gtag('event', event, {
        event_category: 'cart',
        ...data,
      });
  }
}

// Send to Facebook Pixel
function sendToFacebookPixel(event: string, data: Record<string, any>): void {
  if (typeof (window as any).fbq === 'undefined') return;

  switch (event) {
    case 'add_to_cart':
      (window as any).fbq('track', 'AddToCart', {
        value: data.value,
        currency: 'USD',
        content_ids: data.items?.map((item: any) => item.item_id) || [],
        content_type: 'product',
      });
      break;

    case 'view_cart':
      (window as any).fbq('track', 'ViewContent', {
        value: data.value,
        currency: 'USD',
        content_ids: data.items?.map((item: any) => item.item_id) || [],
        content_type: 'product',
      });
      break;

    case 'begin_checkout':
      (window as any).fbq('track', 'InitiateCheckout', {
        value: data.value,
        currency: 'USD',
        num_items: data.num_items,
      });
      break;
  }
}

// Convert cart item to analytics format
function cartItemToAnalytics(item: CartItem): ProductAnalytics {
  return {
    product_id: item.product.id,
    product_name: item.product.name,
    category: 'Unknown', // Category not available in CartItem product
    price: item.product.discount_percent
      ? item.product.price * (1 - item.product.discount_percent / 100)
      : item.product.price,
    quantity: item.quantity,
  };
}

// Cart Analytics Functions
export const cartAnalytics = {
  // Track add to cart
  addToCart: (item: CartItem, userId?: string) => {
    const analytics = cartItemToAnalytics(item);
    trackEvent(
      'add_to_cart',
      {
        value: analytics.price * analytics.quantity,
        items: [analytics],
        product_id: analytics.product_id,
        product_name: analytics.product_name,
        category: analytics.category,
        quantity: analytics.quantity,
        price: analytics.price,
      },
      userId
    );
  },

  // Track remove from cart
  removeFromCart: (item: CartItem, userId?: string) => {
    const analytics = cartItemToAnalytics(item);
    trackEvent(
      'remove_from_cart',
      {
        value: analytics.price * analytics.quantity,
        items: [analytics],
        product_id: analytics.product_id,
        product_name: analytics.product_name,
        category: analytics.category,
        quantity: analytics.quantity,
        price: analytics.price,
      },
      userId
    );
  },

  // Track quantity update
  updateQuantity: (item: CartItem, oldQuantity: number, newQuantity: number, userId?: string) => {
    const analytics = cartItemToAnalytics(item);
    trackEvent(
      'update_cart_quantity',
      {
        product_id: analytics.product_id,
        product_name: analytics.product_name,
        old_quantity: oldQuantity,
        new_quantity: newQuantity,
        quantity_change: newQuantity - oldQuantity,
        price: analytics.price,
      },
      userId
    );
  },

  // Track view cart
  viewCart: (items: CartItem[], total: number, userId?: string) => {
    const analyticsItems = items.map(cartItemToAnalytics);
    trackEvent(
      'view_cart',
      {
        value: total,
        items: analyticsItems,
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        cart_total: total,
      },
      userId
    );
  },

  // Track cart open/close
  openCart: (items: CartItem[], total: number, userId?: string) => {
    trackEvent(
      'open_cart',
      {
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        cart_total: total,
        items_in_cart: items.length,
      },
      userId
    );
  },

  closeCart: (items: CartItem[], total: number, timeSpent: number, userId?: string) => {
    trackEvent(
      'close_cart',
      {
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        cart_total: total,
        time_spent_seconds: Math.round(timeSpent / 1000),
        items_in_cart: items.length,
      },
      userId
    );
  },

  // Track begin checkout
  beginCheckout: (items: CartItem[], total: number, userId?: string) => {
    const analyticsItems = items.map(cartItemToAnalytics);
    trackEvent(
      'begin_checkout',
      {
        value: total,
        items: analyticsItems,
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        cart_total: total,
      },
      userId
    );
  },

  // Track cart abandonment
  abandonCart: (items: CartItem[], total: number, timeOnPage: number, userId?: string) => {
    trackEvent(
      'abandon_cart',
      {
        cart_total: total,
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        items_in_cart: items.length,
        time_on_page_seconds: Math.round(timeOnPage / 1000),
        abandonment_stage: 'cart',
      },
      userId
    );
  },

  // Track cart recovery
  recoverCart: (recoveryMethod: string, items: CartItem[], total: number, userId?: string) => {
    trackEvent(
      'recover_cart',
      {
        recovery_method: recoveryMethod, // 'email', 'popup', 'direct'
        cart_total: total,
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        items_in_cart: items.length,
      },
      userId
    );
  },

  // Track cart sharing
  shareCart: (method: string, items: CartItem[], total: number, userId?: string) => {
    trackEvent(
      'share_cart',
      {
        share_method: method, // 'email', 'social', 'link'
        cart_total: total,
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        items_in_cart: items.length,
      },
      userId
    );
  },

  // Track cart errors
  cartError: (errorType: string, errorMessage: string, context: any, userId?: string) => {
    trackEvent(
      'cart_error',
      {
        error_type: errorType,
        error_message: errorMessage,
        context,
      },
      userId
    );
  },

  // Track cart performance
  cartPerformance: (action: string, duration: number, userId?: string) => {
    trackEvent(
      'cart_performance',
      {
        action, // 'load', 'add_item', 'remove_item', 'update_quantity'
        duration_ms: duration,
        performance_category: 'cart',
      },
      userId
    );
  },

  // Track cart funnel steps
  funnelStep: (step: string, items: CartItem[], total: number, userId?: string) => {
    trackEvent(
      'cart_funnel_step',
      {
        funnel_step: step, // 'view_product', 'add_to_cart', 'view_cart', 'begin_checkout', 'complete_purchase'
        cart_total: total,
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        items_in_cart: items.length,
      },
      userId
    );
  },

  // Track cart recommendations
  recommendationClick: (
    productId: string,
    recommendationType: string,
    position: number,
    userId?: string
  ) => {
    trackEvent(
      'cart_recommendation_click',
      {
        product_id: productId,
        recommendation_type: recommendationType, // 'related', 'upsell', 'cross_sell'
        position,
      },
      userId
    );
  },

  // Track cart discount usage
  applyDiscount: (
    discountCode: string,
    discountAmount: number,
    cartTotal: number,
    userId?: string
  ) => {
    trackEvent(
      'apply_cart_discount',
      {
        discount_code: discountCode,
        discount_amount: discountAmount,
        cart_total_before: cartTotal,
        cart_total_after: cartTotal - discountAmount,
        discount_percentage: (discountAmount / cartTotal) * 100,
      },
      userId
    );
  },
};

// Performance tracking utilities
export const performanceTracker = {
  start: (action: string): (() => void) => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      cartAnalytics.cartPerformance(action, duration);
    };
  },

  measure: async <T>(action: string, fn: () => Promise<T>, userId?: string): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      cartAnalytics.cartPerformance(action, duration, userId);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      cartAnalytics.cartError(action, (error as Error).message, { duration }, userId);
      throw error;
    }
  },
};

export default cartAnalytics;
