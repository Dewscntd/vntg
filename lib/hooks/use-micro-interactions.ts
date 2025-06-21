'use client';

import { useRef, useCallback, useEffect } from 'react';
import { microInteractions } from '@/lib/animations/micro-interactions';

// Hook for button micro-interactions
export function useButtonInteractions() {
  const buttonRef = useRef<HTMLElement>(null);

  const handlePress = useCallback(() => {
    if (buttonRef.current) {
      return microInteractions.buttonPress(buttonRef.current);
    }
  }, []);

  const handleHover = useCallback(() => {
    if (buttonRef.current) {
      return microInteractions.buttonHover(buttonRef.current);
    }
  }, []);

  const handleLeave = useCallback(() => {
    if (buttonRef.current) {
      return microInteractions.buttonLeave(buttonRef.current);
    }
  }, []);

  const createRipple = useCallback((x: number, y: number) => {
    if (buttonRef.current) {
      return microInteractions.createRipple(buttonRef.current, x, y);
    }
  }, []);

  return {
    buttonRef,
    handlePress,
    handleHover,
    handleLeave,
    createRipple
  };
}

// Hook for form input interactions
export function useInputInteractions() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => {
    if (inputRef.current) {
      return microInteractions.inputFocus(inputRef.current);
    }
  }, []);

  const handleBlur = useCallback(() => {
    if (inputRef.current) {
      return microInteractions.inputBlur(inputRef.current);
    }
  }, []);

  const showError = useCallback(() => {
    if (inputRef.current) {
      return microInteractions.inputError(inputRef.current);
    }
  }, []);

  const showSuccess = useCallback(() => {
    if (inputRef.current) {
      return microInteractions.inputSuccess(inputRef.current);
    }
  }, []);

  return {
    inputRef,
    handleFocus,
    handleBlur,
    showError,
    showSuccess
  };
}

// Hook for loading animations
export function useLoadingAnimations() {
  const spinnerRef = useRef<HTMLElement>(null);
  const dotsRef = useRef<HTMLElement>(null);
  const skeletonRef = useRef<HTMLElement>(null);

  const startSpinner = useCallback(() => {
    if (spinnerRef.current) {
      return microInteractions.loadingSpinner(spinnerRef.current);
    }
  }, []);

  const startDots = useCallback(() => {
    if (dotsRef.current) {
      const dots = Array.from(dotsRef.current.children);
      return microInteractions.loadingDots(dots);
    }
  }, []);

  const startSkeleton = useCallback(() => {
    if (skeletonRef.current) {
      return microInteractions.skeletonPulse(skeletonRef.current);
    }
  }, []);

  return {
    spinnerRef,
    dotsRef,
    skeletonRef,
    startSpinner,
    startDots,
    startSkeleton
  };
}

// Hook for modal animations
export function useModalAnimations() {
  const modalRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  const openModal = useCallback(() => {
    const animations = [];
    
    if (backdropRef.current) {
      animations.push(microInteractions.modalBackdropFadeIn(backdropRef.current));
    }
    
    if (contentRef.current) {
      animations.push(microInteractions.modalContentSlideIn(contentRef.current));
    }
    
    return Promise.all(animations);
  }, []);

  const closeModal = useCallback(() => {
    const animations = [];
    
    if (contentRef.current) {
      animations.push(microInteractions.modalContentSlideOut(contentRef.current));
    }
    
    if (backdropRef.current) {
      setTimeout(() => {
        if (backdropRef.current) {
          microInteractions.modalBackdropFadeIn(backdropRef.current);
        }
      }, 200);
    }
    
    return Promise.all(animations);
  }, []);

  return {
    modalRef,
    backdropRef,
    contentRef,
    openModal,
    closeModal
  };
}

// Hook for notification animations
export function useNotificationAnimations() {
  const notificationRef = useRef<HTMLElement>(null);

  const slideIn = useCallback(() => {
    if (notificationRef.current) {
      return microInteractions.toastSlideIn(notificationRef.current);
    }
  }, []);

  const slideOut = useCallback(() => {
    if (notificationRef.current) {
      return microInteractions.toastSlideOut(notificationRef.current);
    }
  }, []);

  return {
    notificationRef,
    slideIn,
    slideOut
  };
}

// Hook for badge animations
export function useBadgeAnimations() {
  const badgeRef = useRef<HTMLElement>(null);

  const popIn = useCallback(() => {
    if (badgeRef.current) {
      return microInteractions.badgePopIn(badgeRef.current);
    }
  }, []);

  const update = useCallback(() => {
    if (badgeRef.current) {
      return microInteractions.badgeUpdate(badgeRef.current);
    }
  }, []);

  return {
    badgeRef,
    popIn,
    update
  };
}

// Hook for icon animations
export function useIconAnimations() {
  const iconRef = useRef<HTMLElement>(null);

  const spin = useCallback(() => {
    if (iconRef.current) {
      return microInteractions.iconSpin(iconRef.current);
    }
  }, []);

  const bounce = useCallback(() => {
    if (iconRef.current) {
      return microInteractions.iconBounce(iconRef.current);
    }
  }, []);

  const pulse = useCallback(() => {
    if (iconRef.current) {
      return microInteractions.iconPulse(iconRef.current);
    }
  }, []);

  return {
    iconRef,
    spin,
    bounce,
    pulse
  };
}

// Hook for progress animations
export function useProgressAnimations() {
  const progressRef = useRef<HTMLElement>(null);

  const animateProgress = useCallback((percentage: number) => {
    if (progressRef.current) {
      return microInteractions.progressFill(progressRef.current, percentage);
    }
  }, []);

  return {
    progressRef,
    animateProgress
  };
}

// Hook for accordion animations
export function useAccordionAnimations() {
  const accordionRef = useRef<HTMLElement>(null);

  const expand = useCallback(() => {
    if (accordionRef.current) {
      return microInteractions.accordionExpand(accordionRef.current);
    }
  }, []);

  const collapse = useCallback(() => {
    if (accordionRef.current) {
      return microInteractions.accordionCollapse(accordionRef.current);
    }
  }, []);

  return {
    accordionRef,
    expand,
    collapse
  };
}

// Hook for auto-triggering animations on mount
export function useAutoAnimations(
  animationType: 'fadeIn' | 'slideIn' | 'scaleIn' | 'bounceIn',
  delay: number = 0
) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      const timer = setTimeout(() => {
        if (elementRef.current) {
          switch (animationType) {
            case 'fadeIn':
              microInteractions.toastSlideIn(elementRef.current);
              break;
            case 'slideIn':
              microInteractions.modalContentSlideIn(elementRef.current);
              break;
            case 'scaleIn':
              microInteractions.badgePopIn(elementRef.current);
              break;
            case 'bounceIn':
              microInteractions.iconBounce(elementRef.current);
              break;
          }
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [animationType, delay]);

  return elementRef;
}
