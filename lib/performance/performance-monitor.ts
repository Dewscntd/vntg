// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  private constructor() {
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals observer
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              this.recordMetric('CLS', entry.value);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);

        // Navigation timing
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('TTFB', entry.responseStart - entry.requestStart);
            this.recordMetric('DOMContentLoaded', entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart);
            this.recordMetric('LoadComplete', entry.loadEventEnd - entry.loadEventStart);
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);

      } catch (error) {
        console.warn('Performance monitoring setup failed:', error);
      }
    }
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Log significant metrics
    if (name === 'LCP' && value > 2500) {
      console.warn(`Poor LCP detected: ${value}ms`);
    }
    if (name === 'FID' && value > 100) {
      console.warn(`Poor FID detected: ${value}ms`);
    }
    if (name === 'CLS' && value > 0.1) {
      console.warn(`Poor CLS detected: ${value}`);
    }
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    this.metrics.forEach((values, name) => {
      if (values.length > 0) {
        result[name] = {
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    });

    return result;
  }

  // Measure custom performance
  startMeasure(name: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`);
    }
  }

  endMeasure(name: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name, 'measure')[0];
      if (measure) {
        this.recordMetric(name, measure.duration);
      }
    }
  }

  // Memory usage monitoring
  getMemoryUsage() {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  // Network information
  getNetworkInfo() {
    if (typeof window !== 'undefined' && 'navigator' in window && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  }

  // Generate performance report
  generateReport() {
    const metrics = this.getMetrics();
    const memory = this.getMemoryUsage();
    const network = this.getNetworkInfo();

    return {
      timestamp: new Date().toISOString(),
      metrics,
      memory,
      network,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
    };
  }

  // Send report to analytics (placeholder)
  sendReport() {
    const report = this.generateReport();
    
    // In a real application, you would send this to your analytics service
    console.log('Performance Report:', report);
    
    // Example: Send to analytics service
    // fetch('/api/analytics/performance', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(report)
    // });
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();

  const startMeasure = (name: string) => monitor.startMeasure(name);
  const endMeasure = (name: string) => monitor.endMeasure(name);
  const getMetrics = () => monitor.getMetrics();
  const getReport = () => monitor.generateReport();

  return {
    startMeasure,
    endMeasure,
    getMetrics,
    getReport,
    recordMetric: (name: string, value: number) => monitor.recordMetric(name, value)
  };
}

// Performance measurement decorator
export function measurePerformance(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      monitor.startMeasure(`${name}-${propertyKey}`);
      
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        monitor.endMeasure(`${name}-${propertyKey}`);
      }
    };
    
    return descriptor;
  };
}

// Initialize performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    const monitor = PerformanceMonitor.getInstance();
    
    // Send report every 30 seconds
    setInterval(() => {
      monitor.sendReport();
    }, 30000);
    
    // Send report on page unload
    window.addEventListener('beforeunload', () => {
      monitor.sendReport();
    });
  }
}

export default PerformanceMonitor;
