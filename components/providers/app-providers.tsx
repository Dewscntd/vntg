'use client';

import { useEffect } from 'react';
import { CartProvider } from '@/lib/context/cart-context';
import { CheckoutProvider } from '@/lib/context/checkout-context';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { initializePerformanceMonitoring } from '@/lib/performance/performance-monitor';

export function AppProviders({ children }: { children: React.ReactNode }) {
  // Initialize performance monitoring
  useEffect(() => {
    initializePerformanceMonitoring();
  }, []);

  return (
    <CartProvider>
      <CheckoutProvider>
        {children}
        {/* Global cart drawer - always available */}
        <CartDrawer />
      </CheckoutProvider>
    </CartProvider>
  );
}
