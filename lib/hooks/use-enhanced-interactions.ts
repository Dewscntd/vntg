import { useEffect, useRef } from 'react';
import { enhancedInteractions } from '@/lib/animations/enhanced-interactions';

// Hook for magnetic button effect
export function useMagneticButton(strength: number = 0.3) {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    return enhancedInteractions.magneticButton(element, strength);
  }, [strength]);
  
  return ref;
}

// Hook for ripple effect
export function useRippleEffect(color?: string) {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    return enhancedInteractions.rippleEffect(element, color);
  }, [color]);
  
  return ref;
}

// Hook for cursor follow effect
export function useCursorFollow() {
  const elementRef = useRef<HTMLElement>(null);
  const followerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    const follower = followerRef.current;
    if (!element || !follower) return;
    
    return enhancedInteractions.cursorFollow(element, follower);
  }, []);
  
  return { elementRef, followerRef };
}

// Hook for parallax scroll
export function useParallaxScroll(speed: number = 0.5) {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const trigger = enhancedInteractions.parallaxScroll(element, speed);
    
    return () => {
      trigger.kill();
    };
  }, [speed]);
  
  return ref;
}

// Hook for text reveal animation
export function useTextReveal(options?: { stagger?: number; duration?: number }) {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const animation = enhancedInteractions.textReveal(element, options);
    
    return () => {
      animation.kill();
    };
  }, [options]);
  
  return ref;
}

// Hook for image reveal animation
export function useImageReveal(direction?: 'left' | 'right' | 'top' | 'bottom') {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const animation = enhancedInteractions.imageReveal(element, direction);
    
    return () => {
      animation.kill();
    };
  }, [direction]);
  
  return ref;
}

// Hook for multiple enhanced interactions
export function useEnhancedInteractions(
  interactions: Array<{
    type: 'magnetic' | 'ripple' | 'parallax' | 'textReveal' | 'imageReveal';
    options?: any;
  }>
) {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const cleanupFunctions: Array<() => void> = [];
    
    interactions.forEach(({ type, options }) => {
      switch (type) {
        case 'magnetic':
          cleanupFunctions.push(
            enhancedInteractions.magneticButton(element, options?.strength)
          );
          break;
        case 'ripple':
          cleanupFunctions.push(
            enhancedInteractions.rippleEffect(element, options?.color)
          );
          break;
        case 'parallax':
          const trigger = enhancedInteractions.parallaxScroll(element, options?.speed);
          cleanupFunctions.push(() => trigger.kill());
          break;
        case 'textReveal':
          const textAnimation = enhancedInteractions.textReveal(element, options);
          cleanupFunctions.push(() => textAnimation.kill());
          break;
        case 'imageReveal':
          const imageAnimation = enhancedInteractions.imageReveal(element, options?.direction);
          cleanupFunctions.push(() => imageAnimation.kill());
          break;
      }
    });
    
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [interactions]);
  
  return ref;
}

// Hook for performance-optimized animations
export function usePerformantAnimation() {
  useEffect(() => {
    // Enable hardware acceleration for better performance
    const style = document.createElement('style');
    style.textContent = `
      [data-gsap] {
        will-change: transform;
        transform: translateZ(0);
      }
      
      .gsap-optimized {
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
}

// Hook for cleanup on unmount
export function useAnimationCleanup() {
  useEffect(() => {
    return () => {
      enhancedInteractions.cleanup();
    };
  }, []);
}
