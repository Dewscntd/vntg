'use client';

import { CartProvider } from '@/lib/context/cart-context';
import { CartDrawer } from '@/components/cart/cart-drawer';

export function CartProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      {/* Global cart drawer - always available */}
      <CartDrawer />
    </CartProvider>
  );
}
