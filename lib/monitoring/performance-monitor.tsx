import * as Sentry from '@sentry/nextjs';

// Performance monitoring utilities for production
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track API response times
  trackApiResponse(endpoint: string, duration: number, status: number) {
    const metricName = `api.${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Store metric
    this.metrics.set(`${metricName}.duration`, duration);
    this.metrics.set(`${metricName}.status`, status);

    // Send to Sentry
    Sentry.addBreadcrumb({
      category: 'api',
      message: `${endpoint} - ${status}`,
      level: status >= 400 ? 'error' : 'info',
      data: {
        endpoint,
        duration,
        status,
      },
    });

    // Alert on slow responses
    if (duration > 5000) {
      this.alertSlowResponse(endpoint, duration);
    }

    // Alert on errors
    if (status >= 500) {
      this.alertServerError(endpoint, status);
    }
  }

  // Track database query performance
  trackDatabaseQuery(query: string, duration: number, rowCount?: number) {
    const metricName = 'database.query';

    this.metrics.set(`${metricName}.duration`, duration);
    if (rowCount !== undefined) {
      this.metrics.set(`${metricName}.rows`, rowCount);
    }

    Sentry.addBreadcrumb({
      category: 'database',
      message: `Query executed in ${duration}ms`,
      level: duration > 1000 ? 'warning' : 'info',
      data: {
        query: query.substring(0, 100), // Truncate for privacy
        duration,
        rowCount,
      },
    });

    // Alert on slow queries
    if (duration > 2000) {
      this.alertSlowQuery(query, duration);
    }
  }

  // Track payment processing
  trackPaymentProcessing(
    paymentIntentId: string,
    amount: number,
    status: 'success' | 'failed' | 'pending',
    duration: number
  ) {
    const metricName = 'payment.processing';

    this.metrics.set(`${metricName}.duration`, duration);
    this.metrics.set(`${metricName}.amount`, amount);

    Sentry.addBreadcrumb({
      category: 'payment',
      message: `Payment ${status} - ${paymentIntentId}`,
      level: status === 'failed' ? 'error' : 'info',
      data: {
        paymentIntentId,
        amount,
        status,
        duration,
      },
    });

    // Alert on payment failures
    if (status === 'failed') {
      this.alertPaymentFailure(paymentIntentId, amount);
    }
  }

  // Track user actions
  trackUserAction(action: string, userId?: string, metadata?: Record<string, any>) {
    Sentry.addBreadcrumb({
      category: 'user',
      message: `User action: ${action}`,
      level: 'info',
      data: {
        action,
        userId,
        ...metadata,
      },
    });

    // Track conversion events
    if (['purchase_completed', 'signup_completed'].includes(action)) {
      this.trackConversion(action, metadata);
    }
  }

  // Track business metrics
  trackBusinessMetric(metric: string, value: number, tags?: Record<string, string>) {
    this.metrics.set(`business.${metric}`, value);

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric, {
        value,
        ...tags,
      });
    }
  }

  // Get current metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Clear metrics (useful for testing)
  clearMetrics() {
    this.metrics.clear();
  }

  // Private alert methods
  private alertSlowResponse(endpoint: string, duration: number) {
    Sentry.captureMessage(`Slow API response: ${endpoint}`, {
      level: 'warning',
      tags: {
        type: 'performance',
        endpoint,
      },
      extra: {
        duration,
        threshold: 5000,
      },
    });
  }

  private alertServerError(endpoint: string, status: number) {
    Sentry.captureMessage(`Server error: ${endpoint}`, {
      level: 'error',
      tags: {
        type: 'server_error',
        endpoint,
        status: status.toString(),
      },
    });
  }

  private alertSlowQuery(query: string, duration: number) {
    Sentry.captureMessage('Slow database query', {
      level: 'warning',
      tags: {
        type: 'database_performance',
      },
      extra: {
        query: query.substring(0, 100),
        duration,
        threshold: 2000,
      },
    });
  }

  private alertPaymentFailure(paymentIntentId: string, amount: number) {
    Sentry.captureMessage('Payment processing failed', {
      level: 'error',
      tags: {
        type: 'payment_failure',
      },
      extra: {
        paymentIntentId,
        amount,
      },
    });
  }

  private trackConversion(event: string, metadata?: Record<string, any>) {
    // Send conversion event to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        send_to: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
        event_category: 'ecommerce',
        event_label: event,
        value: metadata?.value || 1,
      });
    }
  }
}

// Middleware for automatic API monitoring
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  handler: T,
  endpoint: string
): T {
  return (async (...args: any[]) => {
    const monitor = PerformanceMonitor.getInstance();
    const startTime = Date.now();

    try {
      const result = await handler(...args);
      const duration = Date.now() - startTime;

      // Extract status from response
      const status = result?.status || 200;
      monitor.trackApiResponse(endpoint, duration, status);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      monitor.trackApiResponse(endpoint, duration, 500);
      throw error;
    }
  }) as T;
}

// Hook for client-side performance monitoring
export function usePerformanceMonitoring() {
  const monitor = PerformanceMonitor.getInstance();

  const trackPageView = (page: string) => {
    monitor.trackUserAction('page_view', undefined, { page });
  };

  const trackUserInteraction = (action: string, element: string) => {
    monitor.trackUserAction('user_interaction', undefined, { action, element });
  };

  const trackError = (error: Error, context?: string) => {
    Sentry.captureException(error, {
      tags: {
        context: context || 'client',
      },
    });
  };

  return {
    trackPageView,
    trackUserInteraction,
    trackError,
    getMetrics: () => monitor.getMetrics(),
  };
}

// Global error boundary for React components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error }>
) {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error }) => (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>We've been notified of this error and are working to fix it.</p>
        {process.env.NODE_ENV === 'development' && (
          <details>
            <summary>Error details</summary>
            <pre>{error instanceof Error ? error.message : String(error)}</pre>
          </details>
        )}
      </div>
    ),
    beforeCapture: (scope) => {
      scope.setTag('errorBoundary', true);
    },
  });
}
