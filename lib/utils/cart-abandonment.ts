'use client';

import { CartItem } from '@/lib/context/cart-context';

export interface AbandonmentEvent {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
  itemCount: number;
  userAgent: string;
  url: string;
  sessionId?: string;
  userId?: string;
}

export interface AbandonmentRecoveryOptions {
  emailEnabled: boolean;
  pushEnabled: boolean;
  popupEnabled: boolean;
  discountOffered: boolean;
  discountPercentage?: number;
  reminderDelays: number[]; // in minutes
}

const ABANDONMENT_STORAGE_KEY = 'vntg-cart-abandonment';
const ABANDONMENT_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_ABANDONMENT_EVENTS = 10;

// Track cart abandonment event
export function trackCartAbandonment(
  items: CartItem[],
  total: number,
  itemCount: number,
  userId?: string
): void {
  if (typeof window === 'undefined' || items.length === 0) return;

  const abandonmentEvent: AbandonmentEvent = {
    id: generateEventId(),
    timestamp: Date.now(),
    items: items.map((item) => ({
      ...item,
      // Only store essential product data to reduce storage size
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image_url: item.product.image_url,
        inventory_count: item.product.inventory_count,
        discount_percent: item.product.discount_percent,
      },
    })),
    total,
    itemCount,
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId,
  };

  // Store abandonment event
  storeAbandonmentEvent(abandonmentEvent);

  // Track analytics
  trackAbandonmentAnalytics(abandonmentEvent);

  // Trigger recovery mechanisms
  scheduleRecoveryActions(abandonmentEvent);
}

// Store abandonment event in localStorage
function storeAbandonmentEvent(event: AbandonmentEvent): void {
  try {
    const stored = localStorage.getItem(ABANDONMENT_STORAGE_KEY);
    const events: AbandonmentEvent[] = stored ? JSON.parse(stored) : [];

    // Add new event
    events.unshift(event);

    // Keep only recent events
    const recentEvents = events.slice(0, MAX_ABANDONMENT_EVENTS);

    localStorage.setItem(ABANDONMENT_STORAGE_KEY, JSON.stringify(recentEvents));
  } catch (error) {
    console.warn('Failed to store abandonment event:', error);
  }
}

// Get stored abandonment events
export function getAbandonmentEvents(): AbandonmentEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(ABANDONMENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to retrieve abandonment events:', error);
    return [];
  }
}

// Clear abandonment events (when cart is completed)
export function clearAbandonmentEvents(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(ABANDONMENT_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear abandonment events:', error);
  }
}

// Check if user has abandoned cart recently
export function hasRecentAbandonment(): boolean {
  const events = getAbandonmentEvents();
  if (events.length === 0) return false;

  const latestEvent = events[0];
  const timeSinceAbandonment = Date.now() - latestEvent.timestamp;

  return timeSinceAbandonment < ABANDONMENT_THRESHOLD;
}

// Get the most recent abandonment event
export function getLatestAbandonmentEvent(): AbandonmentEvent | null {
  const events = getAbandonmentEvents();
  return events.length > 0 ? events[0] : null;
}

// Track abandonment analytics
function trackAbandonmentAnalytics(event: AbandonmentEvent): void {
  // Google Analytics 4
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: event.total,
      items: event.items.map((item) => ({
        item_id: item.product.id,
        item_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
    });

    (window as any).gtag('event', 'cart_abandonment', {
      event_category: 'ecommerce',
      event_label: 'cart_abandoned',
      value: event.total,
      custom_parameters: {
        item_count: event.itemCount,
        abandonment_id: event.id,
      },
    });
  }

  // Facebook Pixel
  if (typeof (window as any).fbq !== 'undefined') {
    (window as any).fbq('track', 'InitiateCheckout', {
      value: event.total,
      currency: 'USD',
      num_items: event.itemCount,
    });
  }

  // Custom analytics endpoint
  fetch('/api/analytics/cart-abandonment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_id: event.id,
      timestamp: event.timestamp,
      total: event.total,
      item_count: event.itemCount,
      user_id: event.userId,
      items: event.items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    }),
  }).catch((error) => {
    console.warn('Failed to send abandonment analytics:', error);
  });
}

// Schedule recovery actions
function scheduleRecoveryActions(event: AbandonmentEvent): void {
  const options: AbandonmentRecoveryOptions = {
    emailEnabled: true,
    pushEnabled: true,
    popupEnabled: true,
    discountOffered: true,
    discountPercentage: 10,
    reminderDelays: [30, 60, 180, 1440], // 30min, 1hr, 3hr, 24hr
  };

  // Schedule popup reminder
  if (options.popupEnabled) {
    setTimeout(
      () => {
        showAbandonmentPopup(event, options);
      },
      30 * 60 * 1000
    ); // 30 minutes
  }

  // Schedule email reminders (would be handled by backend)
  if (options.emailEnabled && event.userId) {
    fetch('/api/cart/abandonment/schedule-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id: event.id,
        user_id: event.userId,
        delays: options.reminderDelays,
        discount_percentage: options.discountOffered ? options.discountPercentage : null,
      }),
    }).catch((error) => {
      console.warn('Failed to schedule email reminders:', error);
    });
  }
}

// Show abandonment recovery popup
function showAbandonmentPopup(event: AbandonmentEvent, options: AbandonmentRecoveryOptions): void {
  // Check if user is still on the site and hasn't completed purchase
  if (document.hidden || hasRecentAbandonment() === false) return;

  // Create popup element
  const popup = document.createElement('div');
  popup.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50';
  popup.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
      <h3 class="text-lg font-semibold mb-2">Don't forget your items!</h3>
      <p class="text-gray-600 mb-4">
        You have ${event.itemCount} item${event.itemCount !== 1 ? 's' : ''} waiting in your cart.
        ${options.discountOffered ? `Complete your purchase now and save ${options.discountPercentage}%!` : ''}
      </p>
      <div class="flex gap-3">
        <button id="recovery-continue" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Complete Purchase
        </button>
        <button id="recovery-close" class="px-4 py-2 border rounded hover:bg-gray-50">
          Maybe Later
        </button>
      </div>
    </div>
  `;

  // Add event listeners
  const continueBtn = popup.querySelector('#recovery-continue');
  const closeBtn = popup.querySelector('#recovery-close');

  continueBtn?.addEventListener('click', () => {
    document.body.removeChild(popup);
    // Redirect to cart or checkout
    window.location.href = '/cart';

    // Track recovery attempt
    trackRecoveryAttempt(event.id, 'popup_continue');
  });

  closeBtn?.addEventListener('click', () => {
    document.body.removeChild(popup);

    // Track dismissal
    trackRecoveryAttempt(event.id, 'popup_dismiss');
  });

  // Add to DOM
  document.body.appendChild(popup);

  // Auto-remove after 30 seconds
  setTimeout(() => {
    if (document.body.contains(popup)) {
      document.body.removeChild(popup);
    }
  }, 30000);
}

// Track recovery attempt
function trackRecoveryAttempt(eventId: string, action: string): void {
  // Only track recovery in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  fetch('/api/analytics/cart-recovery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_id: eventId,
      action,
      timestamp: Date.now(),
    }),
  }).catch((error) => {
    console.warn('Failed to track recovery attempt:', error);
  });

  // Google Analytics
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', 'cart_recovery_attempt', {
      event_category: 'ecommerce',
      event_label: action,
      custom_parameters: {
        abandonment_id: eventId,
      },
    });
  }
}

// Generate unique event ID
function generateEventId(): string {
  return `abandon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Set up abandonment tracking
export function setupAbandonmentTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  let abandonmentTimeout: NodeJS.Timeout;

  const trackAbandonment = () => {
    // This would be called by the cart context when appropriate
    console.log('Cart abandonment tracked');
  };

  const resetAbandonmentTimer = () => {
    if (abandonmentTimeout) {
      clearTimeout(abandonmentTimeout);
    }

    abandonmentTimeout = setTimeout(trackAbandonment, ABANDONMENT_THRESHOLD);
  };

  // Track user activity to reset abandonment timer
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

  activityEvents.forEach((event) => {
    document.addEventListener(event, resetAbandonmentTimer, { passive: true });
  });

  // Track page visibility changes
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // User switched tabs/minimized - potential abandonment
      resetAbandonmentTimer();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Cleanup function
  return () => {
    if (abandonmentTimeout) {
      clearTimeout(abandonmentTimeout);
    }

    activityEvents.forEach((event) => {
      document.removeEventListener(event, resetAbandonmentTimer);
    });

    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

// Recovery email template data
export function generateRecoveryEmailData(event: AbandonmentEvent, discountPercentage?: number) {
  return {
    subject: `Don't forget your ${event.itemCount} item${event.itemCount !== 1 ? 's' : ''}!`,
    items: event.items.map((item) => ({
      name: item.product.name,
      image: item.product.image_url,
      price: item.product.price,
      quantity: item.quantity,
    })),
    total: event.total,
    discount: discountPercentage
      ? {
          percentage: discountPercentage,
          code: `SAVE${discountPercentage}`,
          savings: event.total * (discountPercentage / 100),
        }
      : null,
    recoveryUrl: `${window.location.origin}/cart?recovery=${event.id}`,
  };
}
