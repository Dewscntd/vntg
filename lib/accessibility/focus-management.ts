// Focus management utilities for accessibility
export class FocusManager {
  private static instance: FocusManager;
  private focusStack: HTMLElement[] = [];
  private trapStack: HTMLElement[] = [];

  private constructor() {}

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  // Save current focus and set new focus
  saveFocus(newFocus?: HTMLElement) {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus && currentFocus !== document.body) {
      this.focusStack.push(currentFocus);
    }
    
    if (newFocus) {
      newFocus.focus();
    }
  }

  // Restore previous focus
  restoreFocus() {
    const previousFocus = this.focusStack.pop();
    if (previousFocus && document.contains(previousFocus)) {
      previousFocus.focus();
    }
  }

  // Focus trap for modals and dialogs
  trapFocus(container: HTMLElement) {
    this.trapStack.push(container);
    
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      this.trapStack.pop();
    };
  }

  // Get all focusable elements within a container
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    return elements.filter(element => {
      return this.isVisible(element) && !this.isInert(element);
    });
  }

  // Check if element is visible
  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }

  // Check if element is inert
  private isInert(element: HTMLElement): boolean {
    return element.hasAttribute('inert') || 
           element.closest('[inert]') !== null;
  }

  // Move focus to next/previous focusable element
  moveFocus(direction: 'next' | 'previous', container?: HTMLElement) {
    const focusableElements = this.getFocusableElements(container || document.body);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    let nextIndex: number;
    if (direction === 'next') {
      nextIndex = currentIndex + 1;
      if (nextIndex >= focusableElements.length) nextIndex = 0;
    } else {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) nextIndex = focusableElements.length - 1;
    }
    
    focusableElements[nextIndex]?.focus();
  }

  // Focus first element in container
  focusFirst(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    focusableElements[0]?.focus();
  }

  // Focus last element in container
  focusLast(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    focusableElements[focusableElements.length - 1]?.focus();
  }
}

// React hooks for focus management
export function useFocusManagement() {
  const focusManager = FocusManager.getInstance();

  return {
    saveFocus: (newFocus?: HTMLElement) => focusManager.saveFocus(newFocus),
    restoreFocus: () => focusManager.restoreFocus(),
    trapFocus: (container: HTMLElement) => focusManager.trapFocus(container),
    getFocusableElements: (container: HTMLElement) => focusManager.getFocusableElements(container),
    moveFocus: (direction: 'next' | 'previous', container?: HTMLElement) => 
      focusManager.moveFocus(direction, container),
    focusFirst: (container: HTMLElement) => focusManager.focusFirst(container),
    focusLast: (container: HTMLElement) => focusManager.focusLast(container),
  };
}

// Hook for focus trap
export function useFocusTrap(isActive: boolean) {
  const { trapFocus } = useFocusManagement();
  
  return (container: HTMLElement | null) => {
    if (!container || !isActive) return;
    
    return trapFocus(container);
  };
}

// Hook for focus restoration
export function useFocusRestore() {
  const { saveFocus, restoreFocus } = useFocusManagement();
  
  return {
    save: saveFocus,
    restore: restoreFocus
  };
}

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Handle arrow key navigation for grids/lists
  handleArrowKeys: (
    e: KeyboardEvent, 
    container: HTMLElement, 
    options: {
      orientation?: 'horizontal' | 'vertical' | 'both';
      wrap?: boolean;
      itemSelector?: string;
    } = {}
  ) => {
    const { orientation = 'both', wrap = true, itemSelector = '[role="gridcell"], [role="option"], [role="menuitem"]' } = options;
    
    const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex === -1) return;
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          nextIndex = wrap ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
          e.preventDefault();
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          nextIndex = wrap ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
          e.preventDefault();
        }
        break;
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          nextIndex = wrap ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
          e.preventDefault();
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          nextIndex = wrap ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
          e.preventDefault();
        }
        break;
      case 'Home':
        nextIndex = 0;
        e.preventDefault();
        break;
      case 'End':
        nextIndex = items.length - 1;
        e.preventDefault();
        break;
    }
    
    if (nextIndex !== currentIndex) {
      items[nextIndex]?.focus();
    }
  },

  // Handle escape key
  handleEscape: (callback: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      callback();
    }
  },

  // Handle enter/space activation
  handleActivation: (callback: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  }
};

export default FocusManager;
