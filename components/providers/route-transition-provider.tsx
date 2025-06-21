'use client';

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';

interface RouteTransitionContextType {
  isTransitioning: boolean;
  triggerTransition: (href: string) => Promise<void>;
}

const RouteTransitionContext = createContext<RouteTransitionContextType | null>(null);

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext);
  if (!context) {
    throw new Error('useRouteTransition must be used within RouteTransitionProvider');
  }
  return context;
}

interface RouteTransitionProviderProps {
  children: ReactNode;
  duration?: number;
  easing?: string;
}

export function RouteTransitionProvider({ 
  children, 
  duration = 0.4,
  easing = 'power2.inOut'
}: RouteTransitionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isTransitioning = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerTransition = async (href: string): Promise<void> => {
    if (isTransitioning.current || !containerRef.current) return;
    
    isTransitioning.current = true;

    // Exit animation
    await new Promise<void>((resolve) => {
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -20,
        duration: duration / 2,
        ease: easing,
        onComplete: resolve
      });
    });

    // Navigate to new route
    router.push(href);

    // Wait for navigation to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    // Enter animation
    await new Promise<void>((resolve) => {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: duration / 2,
          ease: easing,
          onComplete: resolve
        }
      );
    });

    isTransitioning.current = false;
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    if (!containerRef.current) return;

    // Animate in on route change
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: duration / 2, 
        ease: easing,
        delay: 0.1
      }
    );
  }, [pathname, duration, easing]);

  const contextValue: RouteTransitionContextType = {
    isTransitioning: isTransitioning.current,
    triggerTransition
  };

  return (
    <RouteTransitionContext.Provider value={contextValue}>
      <div ref={containerRef} className="w-full">
        {children}
      </div>
    </RouteTransitionContext.Provider>
  );
}

// Enhanced Link component with transitions
import Link from 'next/link';
import { forwardRef, MouseEvent } from 'react';

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
}

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  ({ href, children, onClick, ...props }, ref) => {
    const { triggerTransition } = useRouteTransition();

    const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
      // Call custom onClick if provided
      if (onClick) {
        onClick(e);
      }

      // Don't intercept if modifier keys are pressed or if it's an external link
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }

      e.preventDefault();
      await triggerTransition(href);
    };

    return (
      <Link 
        ref={ref}
        href={href} 
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

TransitionLink.displayName = 'TransitionLink';

// Hook for programmatic navigation with transitions
export function useTransitionRouter() {
  const { triggerTransition } = useRouteTransition();
  const router = useRouter();

  const push = async (href: string) => {
    await triggerTransition(href);
  };

  const replace = async (href: string) => {
    await triggerTransition(href);
  };

  return {
    push,
    replace,
    back: router.back,
    forward: router.forward,
    refresh: router.refresh,
    prefetch: router.prefetch
  };
}
