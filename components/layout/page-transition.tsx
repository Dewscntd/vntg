'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

export interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: 'fade' | 'slide' | 'scale' | 'blur';
  duration?: number;
  delay?: number;
}

export function PageTransition({ 
  children, 
  className,
  variant = 'fade',
  duration = 0.6,
  delay = 0
}: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Set initial state based on variant
    const getInitialState = () => {
      switch (variant) {
        case 'slide':
          return { opacity: 0, y: 30, scale: 1 };
        case 'scale':
          return { opacity: 0, y: 0, scale: 0.95 };
        case 'blur':
          return { opacity: 0, y: 0, scale: 1, filter: 'blur(10px)' };
        default: // fade
          return { opacity: 0, y: 0, scale: 1 };
      }
    };

    const getFinalState = () => {
      switch (variant) {
        case 'slide':
          return { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration,
            delay,
            ease: 'power3.out'
          };
        case 'scale':
          return { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration,
            delay,
            ease: 'back.out(1.7)'
          };
        case 'blur':
          return { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            filter: 'blur(0px)',
            duration,
            delay,
            ease: 'power2.out'
          };
        default: // fade
          return { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration,
            delay,
            ease: 'power2.out'
          };
      }
    };

    // Set initial state
    gsap.set(container, getInitialState());

    // Animate to final state
    const animation = gsap.to(container, getFinalState());

    return () => {
      animation.kill();
    };
  }, [pathname, variant, duration, delay]);

  return (
    <div 
      ref={containerRef}
      className={cn('w-full', className)}
    >
      {children}
    </div>
  );
}

// Hook for programmatic page transitions
export function usePageTransition() {
  const triggerExit = (element: HTMLElement, variant: PageTransitionProps['variant'] = 'fade') => {
    const getExitState = () => {
      switch (variant) {
        case 'slide':
          return { opacity: 0, y: -20, duration: 0.4, ease: 'power3.in' };
        case 'scale':
          return { opacity: 0, scale: 0.95, duration: 0.4, ease: 'power2.in' };
        case 'blur':
          return { opacity: 0, filter: 'blur(10px)', duration: 0.4, ease: 'power2.in' };
        default: // fade
          return { opacity: 0, duration: 0.4, ease: 'power2.in' };
      }
    };

    return gsap.to(element, getExitState());
  };

  const triggerEnter = (element: HTMLElement, variant: PageTransitionProps['variant'] = 'fade') => {
    const getEnterState = () => {
      switch (variant) {
        case 'slide':
          return { 
            opacity: 1, 
            y: 0, 
            duration: 0.6, 
            ease: 'power3.out',
            delay: 0.1
          };
        case 'scale':
          return { 
            opacity: 1, 
            scale: 1, 
            duration: 0.6, 
            ease: 'back.out(1.7)',
            delay: 0.1
          };
        case 'blur':
          return { 
            opacity: 1, 
            filter: 'blur(0px)', 
            duration: 0.6, 
            ease: 'power2.out',
            delay: 0.1
          };
        default: // fade
          return { 
            opacity: 1, 
            duration: 0.6, 
            ease: 'power2.out',
            delay: 0.1
          };
      }
    };

    // Set initial state
    gsap.set(element, { opacity: 0 });
    
    return gsap.to(element, getEnterState());
  };

  return { triggerExit, triggerEnter };
}

// Staggered page transition for multiple elements
export function StaggeredPageTransition({ 
  children, 
  className,
  stagger = 0.1,
  variant = 'fade'
}: PageTransitionProps & { stagger?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const elements = container.children;

    if (elements.length === 0) return;

    // Set initial state for all elements
    const getInitialState = () => {
      switch (variant) {
        case 'slide':
          return { opacity: 0, y: 30 };
        case 'scale':
          return { opacity: 0, scale: 0.8 };
        case 'blur':
          return { opacity: 0, filter: 'blur(10px)' };
        default: // fade
          return { opacity: 0 };
      }
    };

    const getFinalState = () => {
      switch (variant) {
        case 'slide':
          return { 
            opacity: 1, 
            y: 0, 
            duration: 0.6,
            ease: 'power3.out',
            stagger
          };
        case 'scale':
          return { 
            opacity: 1, 
            scale: 1, 
            duration: 0.6,
            ease: 'back.out(1.7)',
            stagger
          };
        case 'blur':
          return { 
            opacity: 1, 
            filter: 'blur(0px)', 
            duration: 0.6,
            ease: 'power2.out',
            stagger
          };
        default: // fade
          return { 
            opacity: 1, 
            duration: 0.6,
            ease: 'power2.out',
            stagger
          };
      }
    };

    // Set initial state
    gsap.set(elements, getInitialState());

    // Animate with stagger
    const animation = gsap.to(elements, getFinalState());

    return () => {
      animation.kill();
    };
  }, [pathname, variant, stagger]);

  return (
    <div 
      ref={containerRef}
      className={cn('w-full', className)}
    >
      {children}
    </div>
  );
}
