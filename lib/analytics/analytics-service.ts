// Analytics service for tracking user behavior and business metrics

export interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
  timestamp?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  pageUrl?: string;
}

export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface ProductMetrics {
  productId: string;
  name: string;
  views: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  inventoryTurnover: number;
}

export interface SalesMetrics {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
  refunds: number;
  cancellations: number;
}

export class AnalyticsService {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession() {
    // Only track session start in browser environment
    if (typeof window !== 'undefined') {
      this.track('session_start', {
        timestamp: new Date().toISOString(),
        userAgent: window.navigator.userAgent,
        referrer: document.referrer,
        pageUrl: window.location.href,
      });
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Track events
  async track(eventType: string, properties: Record<string, any> = {}) {
    // Only track events in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const event: AnalyticsEvent = {
      eventType,
      userId: this.userId,
      sessionId: this.sessionId,
      properties,
      timestamp: new Date().toISOString(),
      ipAddress: await this.getClientIP(),
      userAgent: window.navigator.userAgent,
      referrer: document.referrer,
      pageUrl: window.location.href,
    };

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Page view tracking
  trackPageView(page: string, title?: string) {
    this.track('page_view', {
      page,
      title: title || document.title,
      url: window.location.href,
    });
  }

  // Product tracking
  trackProductView(productId: string, productName: string, category?: string, price?: number) {
    this.track('product_view', {
      productId,
      productName,
      category,
      price,
    });
  }

  trackAddToCart(productId: string, productName: string, quantity: number, price: number) {
    this.track('add_to_cart', {
      productId,
      productName,
      quantity,
      price,
      value: price * quantity,
    });
  }

  trackRemoveFromCart(productId: string, productName: string, quantity: number, price: number) {
    this.track('remove_from_cart', {
      productId,
      productName,
      quantity,
      price,
      value: price * quantity,
    });
  }

  // Purchase tracking
  trackPurchase(orderId: string, items: any[], total: number, currency = 'USD') {
    this.track('purchase', {
      orderId,
      items,
      total,
      currency,
      itemCount: items.length,
    });
  }

  trackCheckoutStart(items: any[], total: number) {
    this.track('checkout_start', {
      items,
      total,
      itemCount: items.length,
    });
  }

  trackCheckoutStep(step: number, stepName: string, items: any[]) {
    this.track('checkout_step', {
      step,
      stepName,
      items,
      itemCount: items.length,
    });
  }

  // Search tracking
  trackSearch(query: string, results: number, filters?: Record<string, any>) {
    this.track('search', {
      query,
      results,
      filters,
    });
  }

  // User engagement
  trackSignUp(method: string) {
    this.track('sign_up', {
      method,
    });
  }

  trackLogin(method: string) {
    this.track('login', {
      method,
    });
  }

  trackLogout() {
    this.track('logout', {});
  }

  // Custom events
  trackCustomEvent(eventName: string, properties: Record<string, any>) {
    this.track(eventName, properties);
  }

  // Utility methods
  private async getClientIP(): Promise<string | undefined> {
    // Only get IP in browser environment
    if (typeof window === 'undefined') {
      return undefined;
    }

    try {
      const response = await fetch('/api/analytics/ip');
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }

  // Get analytics data (admin only)
  static async getMetrics(startDate: string, endDate: string): Promise<AnalyticsMetrics> {
    const response = await fetch(`/api/analytics/metrics?start=${startDate}&end=${endDate}`);
    return response.json();
  }

  static async getProductMetrics(startDate: string, endDate: string): Promise<ProductMetrics[]> {
    const response = await fetch(`/api/analytics/products?start=${startDate}&end=${endDate}`);
    return response.json();
  }

  static async getSalesMetrics(
    period: 'day' | 'week' | 'month',
    startDate: string,
    endDate: string
  ): Promise<SalesMetrics[]> {
    const response = await fetch(
      `/api/analytics/sales?period=${period}&start=${startDate}&end=${endDate}`
    );
    return response.json();
  }

  static async getUserBehavior(userId: string, limit = 100) {
    const response = await fetch(`/api/analytics/users/${userId}?limit=${limit}`);
    return response.json();
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackProductView: analytics.trackProductView.bind(analytics),
    trackAddToCart: analytics.trackAddToCart.bind(analytics),
    trackRemoveFromCart: analytics.trackRemoveFromCart.bind(analytics),
    trackPurchase: analytics.trackPurchase.bind(analytics),
    trackCheckoutStart: analytics.trackCheckoutStart.bind(analytics),
    trackCheckoutStep: analytics.trackCheckoutStep.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackSignUp: analytics.trackSignUp.bind(analytics),
    trackLogin: analytics.trackLogin.bind(analytics),
    trackLogout: analytics.trackLogout.bind(analytics),
    trackCustomEvent: analytics.trackCustomEvent.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
  };
}

// Utility functions for analytics
export function calculateConversionRate(conversions: number, visitors: number): number {
  return visitors > 0 ? (conversions / visitors) * 100 : 0;
}

export function calculateAverageOrderValue(totalRevenue: number, totalOrders: number): number {
  return totalOrders > 0 ? totalRevenue / totalOrders : 0;
}

export function calculateBounceRate(singlePageSessions: number, totalSessions: number): number {
  return totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0;
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
