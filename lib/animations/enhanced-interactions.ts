import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Enhanced micro-interactions for better UX
export const enhancedInteractions = {
  // Magnetic button effect
  magneticButton: (button: Element, strength: number = 0.3) => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      
      gsap.to(button, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out'
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    };
    
    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  },

  // Ripple effect for buttons
  rippleEffect: (button: Element, color: string = 'rgba(255, 255, 255, 0.3)') => {
    const handleClick = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        transform: scale(0);
        z-index: 1;
      `;
      
      button.appendChild(ripple);
      
      gsap.to(ripple, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          ripple.remove();
        }
      });
    };
    
    button.addEventListener('click', handleClick);
    
    return () => {
      button.removeEventListener('click', handleClick);
    };
  },

  // Smooth cursor follow effect
  cursorFollow: (element: Element, follower: Element) => {
    let isHovering = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovering) return;
      
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      gsap.to(follower, {
        x: x - (follower as HTMLElement).offsetWidth / 2,
        y: y - (follower as HTMLElement).offsetHeight / 2,
        duration: 0.3,
        ease: 'power2.out'
      });
    };
    
    const handleMouseEnter = () => {
      isHovering = true;
      gsap.to(follower, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'back.out(1.7)'
      });
    };
    
    const handleMouseLeave = () => {
      isHovering = false;
      gsap.to(follower, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: 'power2.out'
      });
    };
    
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  },

  // Parallax scroll effect
  parallaxScroll: (element: Element, speed: number = 0.5) => {
    return ScrollTrigger.create({
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const y = self.progress * 100 * speed;
        gsap.set(element, { y: `${y}px` });
      }
    });
  },

  // Morphing shapes on scroll
  morphOnScroll: (element: Element, morphPath: string) => {
    return ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        // This would require MorphSVG plugin for full functionality
        gsap.set(element, {
          attr: { d: morphPath },
          ease: 'none'
        });
      }
    });
  },

  // Text reveal animation
  textReveal: (element: Element, options?: { stagger?: number; duration?: number }) => {
    const { stagger = 0.1, duration = 0.8 } = options || {};
    
    // Split text into characters or words
    const text = element.textContent || '';
    const chars = text.split('').map(char => 
      char === ' ' ? '&nbsp;' : `<span style="display: inline-block;">${char}</span>`
    ).join('');
    
    element.innerHTML = chars;
    const charElements = element.querySelectorAll('span');
    
    gsap.set(charElements, { y: 100, opacity: 0 });
    
    return gsap.to(charElements, {
      y: 0,
      opacity: 1,
      duration,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  },

  // Image reveal with mask
  imageReveal: (image: Element, direction: 'left' | 'right' | 'top' | 'bottom' = 'left') => {
    const mask = document.createElement('div');
    mask.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: currentColor;
      z-index: 1;
    `;
    
    const container = image.parentElement;
    if (container) {
      container.style.position = 'relative';
      container.style.overflow = 'hidden';
      container.appendChild(mask);
    }
    
    const getInitialState = () => {
      switch (direction) {
        case 'right': return { x: '-100%' };
        case 'top': return { y: '100%' };
        case 'bottom': return { y: '-100%' };
        default: return { x: '100%' };
      }
    };
    
    const getFinalState = () => {
      switch (direction) {
        case 'right': return { x: '100%' };
        case 'top': return { y: '-100%' };
        case 'bottom': return { y: '100%' };
        default: return { x: '-100%' };
      }
    };
    
    gsap.set(mask, getInitialState());
    
    return gsap.to(mask, {
      ...getFinalState(),
      duration: 1.2,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  },

  // Cleanup function
  cleanup: () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
};

export default enhancedInteractions;
