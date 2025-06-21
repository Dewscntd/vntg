'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCart } from '@/lib/context/cart-context';

export function useCartAccessibility() {
  const { isOpen, closeCart, items, itemCount } = useCart();
  const previousItemCount = useRef(itemCount);
  const cartDrawerRef = useRef<HTMLElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // Announce cart changes to screen readers
  const announceCartChange = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Announce when items are added/removed
  useEffect(() => {
    if (previousItemCount.current !== itemCount) {
      const difference = itemCount - previousItemCount.current;
      
      if (difference > 0) {
        announceCartChange(
          `${difference} item${difference > 1 ? 's' : ''} added to cart. Cart now has ${itemCount} item${itemCount !== 1 ? 's' : ''}.`
        );
      } else if (difference < 0) {
        announceCartChange(
          `${Math.abs(difference)} item${Math.abs(difference) > 1 ? 's' : ''} removed from cart. Cart now has ${itemCount} item${itemCount !== 1 ? 's' : ''}.`
        );
      }
      
      previousItemCount.current = itemCount;
    }
  }, [itemCount, announceCartChange]);

  // Focus management for cart drawer
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      lastFocusedElement.current = document.activeElement as HTMLElement;
      
      // Focus the cart drawer
      setTimeout(() => {
        if (cartDrawerRef.current) {
          const firstFocusableElement = cartDrawerRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          
          if (firstFocusableElement) {
            firstFocusableElement.focus();
          }
        }
      }, 100);
    } else {
      // Return focus to the previously focused element
      if (lastFocusedElement.current) {
        lastFocusedElement.current.focus();
        lastFocusedElement.current = null;
      }
    }
  }, [isOpen]);

  // Keyboard navigation for cart drawer
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeCart();
        break;
        
      case 'Tab':
        // Trap focus within cart drawer
        if (cartDrawerRef.current) {
          const focusableElements = cartDrawerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
        break;
    }
  }, [isOpen, closeCart]);

  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ARIA attributes for cart button
  const getCartButtonProps = () => ({
    'aria-label': `Shopping cart with ${itemCount} item${itemCount !== 1 ? 's' : ''}`,
    'aria-expanded': isOpen,
    'aria-haspopup': 'dialog',
  });

  // ARIA attributes for cart drawer
  const getCartDrawerProps = () => ({
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': 'Shopping cart',
    'aria-describedby': 'cart-description',
  });

  // ARIA attributes for cart items
  const getCartItemProps = (itemName: string, quantity: number, price: number) => ({
    'aria-label': `${itemName}, quantity ${quantity}, price $${price.toFixed(2)}`,
    role: 'listitem',
  });

  // ARIA attributes for quantity controls
  const getQuantityControlProps = (currentQuantity: number, maxQuantity: number) => ({
    decreaseButton: {
      'aria-label': `Decrease quantity, current quantity ${currentQuantity}`,
      disabled: currentQuantity <= 1,
    },
    increaseButton: {
      'aria-label': `Increase quantity, current quantity ${currentQuantity}`,
      disabled: currentQuantity >= maxQuantity,
    },
    input: {
      'aria-label': 'Quantity',
      min: 1,
      max: maxQuantity,
      'aria-describedby': 'quantity-help',
    },
  });

  return {
    cartDrawerRef,
    announceCartChange,
    getCartButtonProps,
    getCartDrawerProps,
    getCartItemProps,
    getQuantityControlProps,
  };
}

// Hook for cart keyboard shortcuts
export function useCartKeyboardShortcuts() {
  const { toggleCart, isOpen } = useCart();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + C to toggle cart
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        toggleCart();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleCart]);

  return {
    isOpen,
    toggleCart,
  };
}

// Hook for cart screen reader announcements
export function useCartAnnouncements() {
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }, []);

  const announceCartAction = useCallback((action: string, itemName: string, quantity?: number) => {
    let message = '';
    
    switch (action) {
      case 'added':
        message = `${itemName} ${quantity ? `(${quantity})` : ''} added to cart`;
        break;
      case 'removed':
        message = `${itemName} removed from cart`;
        break;
      case 'updated':
        message = `${itemName} quantity updated to ${quantity}`;
        break;
      case 'cleared':
        message = 'Cart cleared';
        break;
      default:
        message = `Cart ${action}`;
    }
    
    announceToScreenReader(message);
  }, [announceToScreenReader]);

  return {
    announceToScreenReader,
    announceCartAction,
  };
}
