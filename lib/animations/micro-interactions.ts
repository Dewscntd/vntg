'use client';

import { gsap } from 'gsap';

// Micro-interaction animations for enhanced UX
export const microInteractions = {
  // Button interactions
  buttonPress: (button: Element) => {
    const tl = gsap.timeline();

    return tl
      .to(button, { scale: 0.95, duration: 0.1, ease: 'power2.out' })
      .to(button, { scale: 1, duration: 0.2, ease: 'back.out(1.7)' });
  },

  buttonHover: (button: Element) => {
    return gsap.to(button, {
      scale: 1.05,
      y: -2,
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      duration: 0.3,
      ease: 'power2.out',
    });
  },

  buttonLeave: (button: Element) => {
    return gsap.to(button, {
      scale: 1,
      y: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      duration: 0.3,
      ease: 'power2.out',
    });
  },

  // Loading states
  skeletonPulse: (skeleton: Element) => {
    return gsap.to(skeleton, {
      opacity: 0.5,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });
  },

  loadingSpinner: (spinner: Element) => {
    return gsap.to(spinner, {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: 'none',
    });
  },

  loadingDots: (dots: Element[]) => {
    const tl = gsap.timeline({ repeat: -1 });

    dots.forEach((dot, index) => {
      tl.to(
        dot,
        {
          y: -10,
          duration: 0.4,
          ease: 'power2.out',
        },
        index * 0.1
      ).to(
        dot,
        {
          y: 0,
          duration: 0.4,
          ease: 'power2.in',
        },
        index * 0.1 + 0.4
      );
    });

    return tl;
  },

  // Form interactions
  inputFocus: (input: Element) => {
    const label = input.parentElement?.querySelector('label');
    const tl = gsap.timeline();

    tl.to(input, {
      scale: 1.02,
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      duration: 0.2,
      ease: 'power2.out',
    });

    if (label) {
      tl.to(
        label,
        {
          color: '#3b82f6',
          scale: 0.9,
          y: -5,
          duration: 0.2,
          ease: 'power2.out',
        },
        0
      );
    }

    return tl;
  },

  inputBlur: (input: Element) => {
    const label = input.parentElement?.querySelector('label');
    const tl = gsap.timeline();

    tl.to(input, {
      scale: 1,
      borderColor: '#d1d5db',
      boxShadow: 'none',
      duration: 0.2,
      ease: 'power2.out',
    });

    if (label) {
      tl.to(
        label,
        {
          color: '#6b7280',
          scale: 1,
          y: 0,
          duration: 0.2,
          ease: 'power2.out',
        },
        0
      );
    }

    return tl;
  },

  inputError: (input: Element) => {
    const tl = gsap.timeline();

    return tl
      .to(input, {
        x: -5,
        borderColor: '#ef4444',
        duration: 0.1,
      })
      .to(input, {
        x: 5,
        duration: 0.1,
      })
      .to(input, {
        x: -3,
        duration: 0.1,
      })
      .to(input, {
        x: 3,
        duration: 0.1,
      })
      .to(input, {
        x: 0,
        duration: 0.1,
      });
  },

  inputSuccess: (input: Element) => {
    return gsap.to(input, {
      borderColor: '#10b981',
      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
      duration: 0.3,
      ease: 'power2.out',
    });
  },

  // Notification animations
  toastSlideIn: (toast: Element) => {
    return gsap.fromTo(
      toast,
      { x: 400, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );
  },

  toastSlideOut: (toast: Element) => {
    return gsap.to(toast, {
      x: 400,
      opacity: 0,
      duration: 0.3,
      ease: 'power3.in',
    });
  },

  // Modal animations
  modalBackdropFadeIn: (backdrop: Element) => {
    return gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
  },

  modalContentSlideIn: (content: Element) => {
    return gsap.fromTo(
      content,
      { scale: 0.9, opacity: 0, y: 50 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
    );
  },

  modalContentSlideOut: (content: Element) => {
    return gsap.to(content, {
      scale: 0.9,
      opacity: 0,
      y: 50,
      duration: 0.3,
      ease: 'power3.in',
    });
  },

  // Badge animations
  badgePopIn: (badge: Element) => {
    return gsap.fromTo(
      badge,
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }
    );
  },

  badgeUpdate: (badge: Element) => {
    const tl = gsap.timeline();

    return tl
      .to(badge, { scale: 1.3, duration: 0.2, ease: 'power2.out' })
      .to(badge, { scale: 1, duration: 0.2, ease: 'power2.out' });
  },

  // Icon animations
  iconSpin: (icon: Element) => {
    return gsap.to(icon, {
      rotation: 360,
      duration: 0.6,
      ease: 'power2.out',
    });
  },

  iconBounce: (icon: Element) => {
    const tl = gsap.timeline();

    return tl
      .to(icon, { y: -5, duration: 0.2, ease: 'power2.out' })
      .to(icon, { y: 0, duration: 0.2, ease: 'bounce.out' });
  },

  iconPulse: (icon: Element) => {
    return gsap.to(icon, {
      scale: 1.2,
      duration: 0.6,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });
  },

  // Ripple effect
  createRipple: (element: Element, x: number, y: number) => {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.6);
      transform: scale(0);
      pointer-events: none;
      width: 20px;
      height: 20px;
      left: ${x - rect.left - 10}px;
      top: ${y - rect.top - 10}px;
    `;

    element.appendChild(ripple);

    const tl = gsap.timeline({
      onComplete: () => {
        element.removeChild(ripple);
      },
    });

    return tl.to(ripple, { scale: 4, opacity: 0, duration: 0.6, ease: 'power2.out' });
  },

  // Progress animations
  progressFill: (progressBar: Element, percentage: number) => {
    return gsap.to(progressBar, {
      width: `${percentage}%`,
      duration: 0.8,
      ease: 'power2.out',
    });
  },

  // Accordion animations
  accordionExpand: (content: Element) => {
    return gsap.fromTo(
      content,
      { height: 0, opacity: 0 },
      { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  },

  accordionCollapse: (content: Element) => {
    return gsap.to(content, {
      height: 0,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });
  },
};

export default microInteractions;
