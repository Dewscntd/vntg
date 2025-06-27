'use client';

import { useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animationUtils, animationPresets, productAnimations } from '@/lib/animations/gsap-utils';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Hook for basic GSAP animations
export function useGSAP(
  callback: (context: { timeline: gsap.core.Timeline; utils: typeof animationUtils }) => void,
  dependencies: React.DependencyList = []
) {
  const timelineRef = useRef<gsap.core.Timeline>();

  useIsomorphicLayoutEffect(() => {
    const timeline = gsap.timeline();
    timelineRef.current = timeline;

    callback({ timeline, utils: animationUtils });

    return () => {
      timeline.kill();
    };
  }, dependencies);

  return timelineRef.current;
}

// Hook for scroll-triggered animations
export function useScrollAnimation(
  preset: keyof typeof animationPresets,
  triggerOptions?: ScrollTrigger.Vars,
  animationOptions?: gsap.TweenVars
) {
  const elementRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!elementRef.current) return;

    const animation = animationUtils.scrollAnimate(
      elementRef.current,
      preset,
      triggerOptions,
      animationOptions
    );

    return () => {
      animation.kill();
    };
  }, [preset]);

  return elementRef;
}

// Hook for hover animations
export function useHoverAnimation(
  hoverPreset: keyof typeof animationPresets,
  leavePreset?: keyof typeof animationPresets
) {
  const elementRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const hoverAnimation = animationPresets[hoverPreset];
    const leaveAnimation = leavePreset
      ? animationPresets[leavePreset]
      : { scale: 1, y: 0, duration: 0.3 };

    const handleMouseEnter = () => {
      if ('to' in hoverAnimation) {
        gsap.to(element, hoverAnimation.to as gsap.TweenVars);
      } else {
        gsap.to(element, hoverAnimation as gsap.TweenVars);
      }
    };

    const handleMouseLeave = () => {
      if ('to' in leaveAnimation) {
        gsap.to(element, leaveAnimation.to as gsap.TweenVars);
      } else {
        gsap.to(element, leaveAnimation as gsap.TweenVars);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(element);
    };
  }, [hoverPreset, leavePreset]);

  return elementRef;
}

// Hook for stagger animations
export function useStaggerAnimation(
  preset: keyof typeof animationPresets,
  staggerAmount: number = 0.1,
  options?: gsap.TweenVars
) {
  const containerRef = useRef<HTMLElement>(null);

  const animate = (selector: string = '[data-stagger]') => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll(selector);
    if (elements.length === 0) return;

    return animationUtils.staggerAnimate(Array.from(elements), preset, staggerAmount, options);
  };

  return { ref: containerRef, animate };
}

// Hook for enhanced product card animations
export function useProductCardAnimation(variant: 'default' | 'magnetic' = 'default') {
  const cardRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline>();
  const cleanupRef = useRef<(() => void) | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!cardRef.current) return;

    const element = cardRef.current;

    if (variant === 'magnetic') {
      // Use magnetic hover effect
      cleanupRef.current = productAnimations.cardMagneticHover(element);
    } else {
      // Use default hover timeline
      const timeline = productAnimations.cardHover(element);
      timelineRef.current = timeline;

      const handleMouseEnter = () => timeline.play();
      const handleMouseLeave = () => timeline.reverse();

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);

      cleanupRef.current = () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        timeline.kill();
      };
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [variant]);

  return cardRef;
}

// Hook for product image zoom
export function useProductImageZoom() {
  const imageRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline>();

  useIsomorphicLayoutEffect(() => {
    if (!imageRef.current) return;

    const timeline = productAnimations.imageZoom(imageRef.current);
    timelineRef.current = timeline;

    const element = imageRef.current;

    const handleMouseEnter = () => timeline.play();
    const handleMouseLeave = () => timeline.reverse();

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      timeline.kill();
    };
  }, []);

  return imageRef;
}

// Hook for product grid entrance animation
export function useProductGridAnimation() {
  const gridRef = useRef<HTMLElement>(null);

  const animateEntrance = (delay: number = 0) => {
    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('[data-product-card]');
    if (cards.length === 0) return;

    return productAnimations.gridEntrance(Array.from(cards), delay);
  };

  return { ref: gridRef, animateEntrance };
}

// Hook for add to cart animation
export function useAddToCartAnimation() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const animate = (cartIconSelector?: string) => {
    if (!buttonRef.current) return;

    const cartIcon = cartIconSelector ? document.querySelector(cartIconSelector) : null;

    return productAnimations.addToCart(buttonRef.current, cartIcon || undefined);
  };

  return { ref: buttonRef, animate };
}

// Hook for page transitions
export function usePageTransition() {
  const pageRef = useRef<HTMLElement>(null);

  const enter = () => {
    if (!pageRef.current) return;
    return animationUtils.pageTransition.enter(pageRef.current);
  };

  const exit = () => {
    if (!pageRef.current) return;
    return animationUtils.pageTransition.exit(pageRef.current);
  };

  return { ref: pageRef, enter, exit };
}

// Hook for intersection observer with GSAP
export function useIntersectionAnimation(
  preset: keyof typeof animationPresets,
  options: IntersectionObserverInit = {}
) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animationUtils.animate(entry.target, preset);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [preset]);

  return elementRef;
}

// Hook for loading animations
export function useLoadingAnimation() {
  const elementRef = useRef<HTMLElement>(null);

  const startLoading = () => {
    if (!elementRef.current) return;
    const pulseAnimation = animationPresets.pulse;
    if ('to' in pulseAnimation) {
      return gsap.to(elementRef.current, pulseAnimation.to as gsap.TweenVars);
    } else {
      return gsap.to(elementRef.current, pulseAnimation as gsap.TweenVars);
    }
  };

  const stopLoading = () => {
    if (!elementRef.current) return;
    gsap.killTweensOf(elementRef.current);
    return gsap.to(elementRef.current, { scale: 1, duration: 0.3 });
  };

  return { ref: elementRef, startLoading, stopLoading };
}

// Hook for product badge animations
export function useProductBadgeAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  const animateEntrance = () => {
    if (!containerRef.current) return;

    const badges = Array.from(containerRef.current.children);
    if (badges.length === 0) return;

    return productAnimations.badgeEntrance(badges);
  };

  return { ref: containerRef, animateEntrance };
}

// Hook for quick view modal animations
export function useQuickViewAnimation() {
  const modalRef = useRef<HTMLElement>(null);

  const open = () => {
    if (!modalRef.current) return;
    return productAnimations.quickViewOpen(modalRef.current);
  };

  const close = () => {
    if (!modalRef.current) return;
    return productAnimations.quickViewClose(modalRef.current);
  };

  return { ref: modalRef, open, close };
}

// Hook for enhanced add to cart with ripple effect
export function useEnhancedAddToCartAnimation() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const animate = (cartIconSelector?: string) => {
    if (!buttonRef.current) return;

    const cartIcon = cartIconSelector ? document.querySelector(cartIconSelector) : null;

    return productAnimations.addToCart(buttonRef.current, cartIcon || undefined);
  };

  return { ref: buttonRef, animate };
}

// Hook for scroll-triggered product grid animations
export function useScrollTriggeredGrid<T extends HTMLElement = HTMLDivElement>() {
  const gridRef = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    if (!gridRef.current) return;

    const { scrollAnimations } = require('@/lib/animations/scroll-animations');
    const animation = scrollAnimations.productGridReveal(gridRef.current);

    return () => {
      if (animation) animation.kill();
    };
  }, []);

  return gridRef;
}

// Hook for scroll-triggered section animations
export function useScrollTriggeredSection<T extends HTMLElement = HTMLDivElement>(
  animationType: 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale' = 'fadeIn'
) {
  const sectionRef = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current) return;

    const { scrollAnimations } = require('@/lib/animations/scroll-animations');
    let animation;

    switch (animationType) {
      case 'slideLeft':
        animation = scrollAnimations.slideInFromLeft(sectionRef.current);
        break;
      case 'slideRight':
        animation = scrollAnimations.slideInFromRight(sectionRef.current);
        break;
      case 'scale':
        animation = scrollAnimations.scaleOnScroll(sectionRef.current);
        break;
      default:
        animation = scrollAnimations.sectionFadeIn(sectionRef.current);
    }

    return () => {
      if (animation) animation.kill();
    };
  }, [animationType]);

  return sectionRef;
}

// Hook for scroll-triggered staggered reveals
export function useScrollTriggeredStagger<T extends HTMLElement = HTMLDivElement>(
  selector: string = '[data-reveal]'
) {
  const containerRef = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return;

    const { scrollAnimations } = require('@/lib/animations/scroll-animations');
    const animation = scrollAnimations.staggeredReveal(containerRef.current, selector);

    return () => {
      if (animation) animation.kill();
    };
  }, [selector]);

  return containerRef;
}

// Hook for parallax effects
export function useParallax<T extends HTMLElement = HTMLDivElement>(speed: number = 0.5) {
  const elementRef = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    if (!elementRef.current) return;

    const { scrollAnimations } = require('@/lib/animations/scroll-animations');
    const animation = scrollAnimations.parallaxMove(elementRef.current, speed);

    return () => {
      if (animation) animation.kill();
    };
  }, [speed]);

  return elementRef;
}

// Hook for image reveal animations
export function useImageReveal<T extends HTMLElement = HTMLDivElement>() {
  const imageRef = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    if (!imageRef.current) return;

    const { scrollAnimations } = require('@/lib/animations/scroll-animations');
    const animation = scrollAnimations.imageReveal(imageRef.current);

    return () => {
      if (animation) animation.kill();
    };
  }, []);

  return imageRef;
}

// Hook for text reveal animation
export function useTextReveal<T extends HTMLElement = HTMLElement>() {
  const textRef = useRef<T>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const { scrollAnimations } = require('@/lib/animations/scroll-animations');
    const animation = scrollAnimations.textReveal(textRef.current);

    return () => {
      if (animation) animation.kill();
    };
  }, []);

  return textRef;
}

// Hook for counter animations
export function useCounterAnimation<T extends HTMLElement = HTMLSpanElement>(endValue: number) {
  const counterRef = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    if (!counterRef.current) return;

    const { scrollAnimations } = require('@/lib/animations/scroll-animations');
    const animation = scrollAnimations.counterAnimation(counterRef.current, endValue);

    return () => {
      if (animation) animation.kill();
    };
  }, [endValue]);

  return counterRef;
}
