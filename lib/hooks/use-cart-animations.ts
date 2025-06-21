'use client';

import { useRef, useCallback } from 'react';
import { cartAnimations } from '@/lib/animations/cart-animations';

// Hook for cart drawer animations
export function useCartDrawerAnimation() {
  const drawerRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLElement>(null);

  const slideIn = useCallback(() => {
    if (!drawerRef.current) return;
    
    return cartAnimations.drawerSlideIn(
      drawerRef.current, 
      backdropRef.current || undefined
    );
  }, []);

  const slideOut = useCallback(() => {
    if (!drawerRef.current) return;
    
    return cartAnimations.drawerSlideOut(
      drawerRef.current, 
      backdropRef.current || undefined
    );
  }, []);

  const animateContent = useCallback(() => {
    if (!drawerRef.current) return;
    
    return cartAnimations.drawerContentSlideIn(drawerRef.current);
  }, []);

  return {
    drawerRef,
    backdropRef,
    slideIn,
    slideOut,
    animateContent
  };
}

// Hook for cart item animations
export function useCartItemAnimation() {
  const itemRef = useRef<HTMLElement>(null);

  const slideIn = useCallback((delay: number = 0) => {
    if (!itemRef.current) return;
    
    return cartAnimations.itemSlideIn(itemRef.current, delay);
  }, []);

  const slideOut = useCallback(() => {
    if (!itemRef.current) return;
    
    return cartAnimations.itemSlideOut(itemRef.current);
  }, []);

  const updateQuantity = useCallback(() => {
    if (!itemRef.current) return;
    
    const quantityElement = itemRef.current.querySelector('[data-quantity]');
    if (quantityElement) {
      return cartAnimations.itemQuantityUpdate(quantityElement);
    }
  }, []);

  return {
    itemRef,
    slideIn,
    slideOut,
    updateQuantity
  };
}

// Hook for add to cart animations
export function useAddToCartAnimation() {
  const animateAddToCart = useCallback((
    productElement: Element,
    cartElement: Element,
    productData: {
      image: string;
      name: string;
    }
  ) => {
    return cartAnimations.itemAddAnimation(productElement, cartElement, productData);
  }, []);

  const animateCartButton = useCallback((button: Element) => {
    return cartAnimations.addToCartSuccess(button);
  }, []);

  const animateCartBadge = useCallback((badge: Element) => {
    return cartAnimations.badgeUpdate(badge);
  }, []);

  const animateCartTotal = useCallback((total: Element) => {
    return cartAnimations.totalUpdate(total);
  }, []);

  return {
    animateAddToCart,
    animateCartButton,
    animateCartBadge,
    animateCartTotal
  };
}

// Hook for cart state change animations
export function useCartStateAnimations() {
  const animateStateChange = useCallback((
    type: 'add' | 'remove' | 'update' | 'clear',
    elements: {
      cartButton?: Element;
      cartBadge?: Element;
      cartTotal?: Element;
      cartItems?: Element[];
    }
  ) => {
    const { cartButton, cartBadge, cartTotal, cartItems } = elements;

    switch (type) {
      case 'add':
        if (cartButton) cartAnimations.addToCartSuccess(cartButton);
        if (cartBadge) cartAnimations.badgeUpdate(cartBadge);
        if (cartTotal) cartAnimations.totalUpdate(cartTotal);
        break;

      case 'remove':
        if (cartBadge) cartAnimations.badgeUpdate(cartBadge);
        if (cartTotal) cartAnimations.totalUpdate(cartTotal);
        break;

      case 'update':
        if (cartTotal) cartAnimations.totalUpdate(cartTotal);
        break;

      case 'clear':
        if (cartItems) {
          cartItems.forEach((item, index) => {
            setTimeout(() => {
              cartAnimations.itemSlideOut(item);
            }, index * 100);
          });
        }
        break;
    }
  }, []);

  return { animateStateChange };
}

// Hook for cart loading states
export function useCartLoadingAnimation() {
  const containerRef = useRef<HTMLElement>(null);

  const startLoading = useCallback(() => {
    if (!containerRef.current) return;
    
    return cartAnimations.cartLoading(containerRef.current);
  }, []);

  const stopLoading = useCallback(() => {
    if (!containerRef.current) return;
    
    // Stop the loading animation
    const timeline = cartAnimations.cartLoading(containerRef.current);
    timeline.kill();
    
    // Reset to normal state
    return cartAnimations.totalUpdate(containerRef.current);
  }, []);

  return {
    containerRef,
    startLoading,
    stopLoading
  };
}

// Hook for empty cart animation
export function useEmptyCartAnimation() {
  const illustrationRef = useRef<HTMLElement>(null);

  const startFloating = useCallback(() => {
    if (!illustrationRef.current) return;
    
    return cartAnimations.emptyCartFloat(illustrationRef.current);
  }, []);

  const stopFloating = useCallback(() => {
    if (!illustrationRef.current) return;
    
    const timeline = cartAnimations.emptyCartFloat(illustrationRef.current);
    timeline.kill();
  }, []);

  return {
    illustrationRef,
    startFloating,
    stopFloating
  };
}
