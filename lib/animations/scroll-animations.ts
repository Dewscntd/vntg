'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Scroll-triggered animation utilities
export const scrollAnimations = {
  // Product grid reveal animation
  productGridReveal: (container: Element, options?: ScrollTrigger.Vars) => {
    const cards = container.querySelectorAll('[data-product-card]');
    if (cards.length === 0) return;

    // Set initial state
    gsap.set(cards, { opacity: 0, y: 50, scale: 0.9 });

    // Create scroll-triggered animation
    return gsap.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...options
      }
    });
  },

  // Section fade in animation
  sectionFadeIn: (section: Element, options?: ScrollTrigger.Vars) => {
    gsap.set(section, { opacity: 0, y: 30 });

    return gsap.to(section, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        end: 'bottom 15%',
        toggleActions: 'play none none reverse',
        ...options
      }
    });
  },

  // Staggered content reveal
  staggeredReveal: (container: Element, selector: string = '[data-reveal]', options?: ScrollTrigger.Vars) => {
    const elements = container.querySelectorAll(selector);
    if (elements.length === 0) return;

    gsap.set(elements, { opacity: 0, y: 40, rotationX: 15 });

    return gsap.to(elements, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 75%',
        end: 'bottom 25%',
        toggleActions: 'play none none reverse',
        ...options
      }
    });
  },

  // Parallax effect
  parallaxMove: (element: Element, speed: number = 0.5, options?: ScrollTrigger.Vars) => {
    return gsap.to(element, {
      y: () => -window.innerHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        ...options
      }
    });
  },

  // Scale on scroll
  scaleOnScroll: (element: Element, options?: ScrollTrigger.Vars) => {
    gsap.set(element, { scale: 0.8 });

    return gsap.to(element, {
      scale: 1,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'center center',
        toggleActions: 'play none none reverse',
        ...options
      }
    });
  },

  // Slide in from sides
  slideInFromLeft: (element: Element, options?: ScrollTrigger.Vars) => {
    gsap.set(element, { x: -100, opacity: 0 });

    return gsap.to(element, {
      x: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...options
      }
    });
  },

  slideInFromRight: (element: Element, options?: ScrollTrigger.Vars) => {
    gsap.set(element, { x: 100, opacity: 0 });

    return gsap.to(element, {
      x: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...options
      }
    });
  },

  // Progressive image reveal
  imageReveal: (imageContainer: Element, options?: ScrollTrigger.Vars) => {
    const image = imageContainer.querySelector('img');
    if (!image) return;

    gsap.set(imageContainer, { clipPath: 'inset(100% 0 0 0)' });
    gsap.set(image, { scale: 1.3 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: imageContainer,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...options
      }
    });

    tl.to(imageContainer, {
      clipPath: 'inset(0% 0 0 0)',
      duration: 1.2,
      ease: 'power3.out'
    })
    .to(image, {
      scale: 1,
      duration: 1.2,
      ease: 'power2.out'
    }, 0);

    return tl;
  },

  // Text reveal animation
  textReveal: (textElement: Element, options?: ScrollTrigger.Vars) => {
    const text = textElement.textContent || '';
    const words = text.split(' ');
    
    // Wrap each word in a span
    textElement.innerHTML = words.map(word => 
      `<span class="inline-block overflow-hidden"><span class="inline-block">${word}</span></span>`
    ).join(' ');

    const wordSpans = textElement.querySelectorAll('span span');
    gsap.set(wordSpans, { y: '100%' });

    return gsap.to(wordSpans, {
      y: '0%',
      duration: 0.8,
      stagger: 0.05,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: textElement,
        start: 'top 85%',
        end: 'bottom 15%',
        toggleActions: 'play none none reverse',
        ...options
      }
    });
  },

  // Counter animation
  counterAnimation: (element: Element, endValue: number, options?: ScrollTrigger.Vars) => {
    const obj = { value: 0 };

    return gsap.to(obj, {
      value: endValue,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = Math.round(obj.value).toString();
      },
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none none',
        ...options
      }
    });
  },

  // Progress bar fill
  progressBarFill: (progressBar: Element, percentage: number, options?: ScrollTrigger.Vars) => {
    gsap.set(progressBar, { width: '0%' });

    return gsap.to(progressBar, {
      width: `${percentage}%`,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: progressBar.parentElement,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
        ...options
      }
    });
  },

  // Card stack reveal
  cardStackReveal: (container: Element, options?: ScrollTrigger.Vars) => {
    const cards = container.querySelectorAll('[data-card]');
    if (cards.length === 0) return;

    gsap.set(cards, { y: 100, opacity: 0, rotationX: 45 });

    return gsap.to(cards, {
      y: 0,
      opacity: 1,
      rotationX: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 70%',
        end: 'bottom 30%',
        toggleActions: 'play none none reverse',
        ...options
      }
    });
  },

  // Morphing shapes
  morphShape: (element: Element, options?: ScrollTrigger.Vars) => {
    return gsap.to(element, {
      morphSVG: element.getAttribute('data-morph-to') || '',
      duration: 1,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...options
      }
    });
  },

  // Cleanup all ScrollTriggers
  cleanup: () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  },

  // Refresh ScrollTrigger (useful after content changes)
  refresh: () => {
    ScrollTrigger.refresh();
  }
};

export default scrollAnimations;
