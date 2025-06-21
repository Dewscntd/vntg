'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Animation presets
export const animationPresets = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1, duration: 0.6, ease: 'power2.out' },
  },
  fadeInUp: {
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
  },
  fadeInDown: {
    from: { opacity: 0, y: -30 },
    to: { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
  },
  fadeInLeft: {
    from: { opacity: 0, x: -30 },
    to: { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
  },
  fadeInRight: {
    from: { opacity: 0, x: 30 },
    to: { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
  },

  // Scale animations
  scaleIn: {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' },
  },
  scaleInBounce: {
    from: { opacity: 0, scale: 0.3 },
    to: { opacity: 1, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' },
  },

  // Slide animations
  slideInUp: {
    from: { y: '100%', opacity: 0 },
    to: { y: '0%', opacity: 1, duration: 0.8, ease: 'power3.out' },
  },
  slideInDown: {
    from: { y: '-100%', opacity: 0 },
    to: { y: '0%', opacity: 1, duration: 0.8, ease: 'power3.out' },
  },
  slideInLeft: {
    from: { x: '-100%', opacity: 0 },
    to: { x: '0%', opacity: 1, duration: 0.8, ease: 'power3.out' },
  },
  slideInRight: {
    from: { x: '100%', opacity: 0 },
    to: { x: '0%', opacity: 1, duration: 0.8, ease: 'power3.out' },
  },

  // Hover animations
  hoverScale: {
    scale: 1.05,
    duration: 0.3,
    ease: 'power2.out',
  },
  hoverLift: {
    y: -5,
    scale: 1.02,
    duration: 0.3,
    ease: 'power2.out',
  },
  hoverGlow: {
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    duration: 0.3,
    ease: 'power2.out',
  },

  // Loading animations
  pulse: {
    scale: 1.1,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: 'power2.inOut',
  },
  rotate: {
    rotation: 360,
    duration: 1,
    repeat: -1,
    ease: 'none',
  },
};

// Animation utility functions
export const animationUtils = {
  // Animate element with preset
  animate: (element: string | Element, preset: keyof typeof animationPresets, options?: gsap.TweenVars) => {
    const animation = animationPresets[preset];
    return gsap.fromTo(element, animation.from, { ...animation.to, ...options });
  },

  // Animate multiple elements with stagger
  staggerAnimate: (
    elements: string | Element[],
    preset: keyof typeof animationPresets,
    staggerAmount: number = 0.1,
    options?: gsap.TweenVars
  ) => {
    const animation = animationPresets[preset];
    return gsap.fromTo(elements, animation.from, {
      ...animation.to,
      stagger: staggerAmount,
      ...options,
    });
  },

  // Scroll-triggered animation
  scrollAnimate: (
    element: string | Element,
    preset: keyof typeof animationPresets,
    triggerOptions?: ScrollTrigger.Vars,
    animationOptions?: gsap.TweenVars
  ) => {
    const animation = animationPresets[preset];
    return gsap.fromTo(element, animation.from, {
      ...animation.to,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...triggerOptions,
      },
      ...animationOptions,
    });
  },

  // Timeline for complex animations
  createTimeline: (options?: gsap.TimelineVars) => {
    return gsap.timeline(options);
  },

  // Hover animations
  addHoverAnimation: (
    element: string | Element,
    hoverPreset: keyof typeof animationPresets,
    leavePreset?: keyof typeof animationPresets
  ) => {
    const hoverAnimation = animationPresets[hoverPreset];
    const leaveAnimation = leavePreset ? animationPresets[leavePreset] : { scale: 1, y: 0 };

    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;

    el.addEventListener('mouseenter', () => {
      gsap.to(el, hoverAnimation.to);
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { ...leaveAnimation.to, duration: 0.3 });
    });
  },

  // Kill all animations for an element
  killAnimations: (element: string | Element) => {
    gsap.killTweensOf(element);
  },

  // Set initial state
  set: (element: string | Element, properties: gsap.TweenVars) => {
    return gsap.set(element, properties);
  },

  // Quick fade in
  quickFadeIn: (element: string | Element, duration: number = 0.3) => {
    return gsap.fromTo(element, { opacity: 0 }, { opacity: 1, duration });
  },

  // Quick fade out
  quickFadeOut: (element: string | Element, duration: number = 0.3) => {
    return gsap.to(element, { opacity: 0, duration });
  },

  // Page transition
  pageTransition: {
    enter: (element: string | Element) => {
      return gsap.fromTo(
        element,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    },
    exit: (element: string | Element) => {
      return gsap.to(element, { opacity: 0, y: -20, duration: 0.4, ease: 'power3.in' });
    },
  },
};

// Product-specific animations
export const productAnimations = {
  // Enhanced product card hover with multiple effects
  cardHover: (card: Element) => {
    const image = card.querySelector('img');
    const content = card.querySelector('[data-content]');
    const overlay = card.querySelector('.absolute.inset-0');
    const actions = card.querySelector('.absolute.bottom-3');
    const badges = card.querySelector('.absolute.left-2.top-2');

    const tl = gsap.timeline({ paused: true });

    // Card lift and scale
    tl.to(card, {
      y: -12,
      scale: 1.03,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      duration: 0.4,
      ease: 'power3.out'
    })
    // Image zoom and slight rotation
    .to(image, {
      scale: 1.15,
      rotation: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, 0)
    // Content slide up
    .to(content, {
      y: -4,
      duration: 0.4,
      ease: 'power2.out'
    }, 0.1)
    // Overlay fade in
    .to(overlay, {
      opacity: 1,
      duration: 0.3
    }, 0.1)
    // Actions slide up and fade in
    .fromTo(actions,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' },
      0.2
    )
    // Badges subtle animation
    .to(badges, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out'
    }, 0.1);

    return tl;
  },

  // Enhanced card hover with magnetic effect
  cardMagneticHover: (card: Element) => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(card, {
        x: x * 0.1,
        y: y * 0.1,
        rotation: x * 0.02,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  },

  // Product grid entrance
  gridEntrance: (cards: Element[], delay: number = 0) => {
    return gsap.fromTo(
      cards,
      { opacity: 0, y: 30, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        delay,
        ease: 'power3.out',
      }
    );
  },

  // Product detail entrance
  detailEntrance: (container: Element) => {
    const images = container.querySelectorAll('[data-product-image]');
    const info = container.querySelector('[data-product-info]');
    const reviews = container.querySelector('[data-product-reviews]');
    const related = container.querySelector('[data-related-products]');

    const tl = gsap.timeline();

    tl.fromTo(images, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.1 })
      .fromTo(info, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.8 }, '-=0.4')
      .fromTo(reviews, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
      .fromTo(related, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2');

    return tl;
  },

  // Enhanced add to cart animation with ripple effect
  addToCart: (button: Element, cartIcon?: Element) => {
    const tl = gsap.timeline();

    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.6);
      transform: scale(0);
      pointer-events: none;
      width: 20px;
      height: 20px;
      top: 50%;
      left: 50%;
      margin: -10px 0 0 -10px;
    `;
    button.appendChild(ripple);

    // Button press animation
    tl.to(button, { scale: 0.95, duration: 0.1 })
      // Ripple expand
      .to(ripple, { scale: 3, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0)
      // Button bounce back
      .to(button, { scale: 1.05, duration: 0.2, ease: 'back.out(1.7)' })
      .to(button, { scale: 1, duration: 0.1 })
      // Cleanup
      .call(() => button.removeChild(ripple));

    // Cart icon animation if provided
    if (cartIcon) {
      tl.to(cartIcon, {
        scale: 1.3,
        rotation: 360,
        duration: 0.4,
        ease: 'back.out(1.7)'
      }, '-=0.3')
      .to(cartIcon, {
        scale: 1,
        rotation: 360,
        duration: 0.2
      });
    }

    return tl;
  },

  // Product image zoom on hover
  imageZoom: (imageContainer: Element) => {
    const image = imageContainer.querySelector('img');
    if (!image) return gsap.timeline();

    const tl = gsap.timeline({ paused: true });

    tl.to(image, {
      scale: 1.2,
      duration: 0.6,
      ease: 'power2.out'
    });

    return tl;
  },

  // Product badge animations
  badgeEntrance: (badges: Element[]) => {
    return gsap.fromTo(badges,
      { scale: 0, rotation: -180, opacity: 0 },
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      }
    );
  },

  // Quick view modal animation
  quickViewOpen: (modal: Element) => {
    const backdrop = modal.querySelector('[data-backdrop]');
    const content = modal.querySelector('[data-content]');

    const tl = gsap.timeline();

    // Set initial states
    gsap.set(modal, { display: 'flex' });
    gsap.set(backdrop, { opacity: 0 });
    gsap.set(content, { scale: 0.8, opacity: 0, y: 50 });

    // Animate in
    tl.to(backdrop, { opacity: 1, duration: 0.3 })
      .to(content, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'back.out(1.7)'
      }, '-=0.1');

    return tl;
  },

  quickViewClose: (modal: Element) => {
    const backdrop = modal.querySelector('[data-backdrop]');
    const content = modal.querySelector('[data-content]');

    const tl = gsap.timeline({
      onComplete: () => gsap.set(modal, { display: 'none' })
    });

    tl.to(content, {
      scale: 0.8,
      opacity: 0,
      y: 50,
      duration: 0.3,
      ease: 'power2.in'
    })
    .to(backdrop, { opacity: 0, duration: 0.2 }, '-=0.1');

    return tl;
  },
};

export default animationUtils;
