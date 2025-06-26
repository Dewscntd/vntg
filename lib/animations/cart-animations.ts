'use client';

import { gsap } from 'gsap';

// Enhanced cart-specific animation utilities
export const cartAnimations = {
  // Enhanced cart drawer slide in with backdrop
  drawerSlideIn: (drawer: Element, backdrop?: Element) => {
    const tl = gsap.timeline();

    // Set initial states
    gsap.set(drawer, { x: '100%', opacity: 0 });
    if (backdrop) gsap.set(backdrop, { opacity: 0 });

    // Animate backdrop first
    if (backdrop) {
      tl.to(backdrop, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    }

    // Then slide in drawer with elastic effect
    tl.to(
      drawer,
      {
        x: '0%',
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(1.7)',
      },
      backdrop ? '-=0.1' : 0
    );

    return tl;
  },

  drawerSlideOut: (drawer: Element, backdrop?: Element) => {
    const tl = gsap.timeline();

    // Slide out drawer first
    tl.to(drawer, {
      x: '100%',
      opacity: 0,
      duration: 0.4,
      ease: 'power3.in',
    });

    // Then fade out backdrop
    if (backdrop) {
      tl.to(
        backdrop,
        {
          opacity: 0,
          duration: 0.2,
        },
        '-=0.2'
      );
    }

    return tl;
  },

  // Enhanced drawer content animation
  drawerContentSlideIn: (content: Element) => {
    const header = content.querySelector('[data-cart-header]');
    const items = content.querySelectorAll('[data-cart-item]');
    const summary = content.querySelector('[data-cart-summary]');

    const tl = gsap.timeline();

    // Header slides down
    if (header) {
      tl.fromTo(
        header,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }

    // Items stagger in from right
    if (items.length > 0) {
      tl.fromTo(
        items,
        { x: 50, opacity: 0, scale: 0.9 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power3.out',
        },
        '-=0.2'
      );
    }

    // Summary slides up
    if (summary) {
      tl.fromTo(
        summary,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
        '-=0.2'
      );
    }

    return tl;
  },

  // Cart button badge animation
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

  // Enhanced cart item animations
  itemSlideIn: (item: Element, delay: number = 0) => {
    const tl = gsap.timeline({ delay });

    // Set initial state
    gsap.set(item, { x: 50, opacity: 0, scale: 0.9, rotationY: 15 });

    // Slide in with 3D effect
    tl.to(item, {
      x: 0,
      opacity: 1,
      scale: 1,
      rotationY: 0,
      duration: 0.5,
      ease: 'back.out(1.7)',
    })
      // Add subtle bounce
      .to(item, {
        scale: 1.02,
        duration: 0.1,
        ease: 'power2.out',
      })
      .to(item, {
        scale: 1,
        duration: 0.1,
        ease: 'power2.out',
      });

    return tl;
  },

  itemSlideOut: (item: Element) => {
    const tl = gsap.timeline();

    // Slide out with rotation and scale
    tl.to(item, {
      x: 100,
      opacity: 0,
      scale: 0.8,
      rotationY: -15,
      duration: 0.4,
      ease: 'power3.in',
    })
      // Collapse height
      .to(
        item,
        {
          height: 0,
          marginTop: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: 0.3,
          ease: 'power2.in',
        },
        '-=0.2'
      );

    return tl;
  },

  // New item addition animation (fly from product to cart)
  itemAddAnimation: (productElement: Element, cartElement: Element, productData: any) => {
    const productRect = productElement.getBoundingClientRect();
    const cartRect = cartElement.getBoundingClientRect();

    // Create flying element
    const flyingElement = document.createElement('div');
    flyingElement.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-2 border">
        <img src="${productData.image}" alt="${productData.name}" class="w-12 h-12 object-cover rounded" />
      </div>
    `;
    flyingElement.style.cssText = `
      position: fixed;
      top: ${productRect.top}px;
      left: ${productRect.left}px;
      z-index: 9999;
      pointer-events: none;
    `;

    document.body.appendChild(flyingElement);

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.removeChild(flyingElement);
        // Trigger cart button animation
        cartAnimations.addToCartSuccess(cartElement);
      },
    });

    // Fly to cart with arc motion
    tl.to(flyingElement, {
      motionPath: {
        path: `M${productRect.left},${productRect.top} Q${(productRect.left + cartRect.left) / 2},${productRect.top - 100} ${cartRect.left},${cartRect.top}`,
        autoRotate: true,
      },
      scale: 0.5,
      duration: 0.8,
      ease: 'power2.out',
    })
      // Fade out at the end
      .to(
        flyingElement,
        {
          opacity: 0,
          scale: 0.2,
          duration: 0.2,
        },
        '-=0.2'
      );

    return tl;
  },

  itemQuantityUpdate: (quantityElement: Element) => {
    const tl = gsap.timeline();
    return tl
      .to(quantityElement, { scale: 1.2, duration: 0.1 })
      .to(quantityElement, { scale: 1, duration: 0.2, ease: 'back.out(1.7)' });
  },

  // Add to cart button feedback
  addToCartSuccess: (button: Element) => {
    const tl = gsap.timeline();
    return tl
      .to(button, { scale: 0.95, duration: 0.1 })
      .to(button, { scale: 1.05, duration: 0.2, ease: 'back.out(1.7)' })
      .to(button, { scale: 1, duration: 0.1 });
  },

  // Cart icon shake (for errors or attention)
  cartIconShake: (icon: Element) => {
    return gsap.to(icon, {
      keyframes: [{ x: -2 }, { x: 2 }, { x: -2 }, { x: 2 }, { x: 0 }],
      duration: 0.4,
      ease: 'power2.inOut',
    });
  },

  // Cart total update animation
  totalUpdate: (totalElement: Element) => {
    const tl = gsap.timeline();
    return tl
      .to(totalElement, { scale: 1.1, color: '#10b981', duration: 0.2 })
      .to(totalElement, { scale: 1, color: 'inherit', duration: 0.3 });
  },

  // Empty cart illustration
  emptyCartFloat: (illustration: Element) => {
    return gsap.to(illustration, {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });
  },

  // Cart summary expand/collapse
  summaryExpand: (summary: Element) => {
    return gsap.fromTo(
      summary,
      { height: 0, opacity: 0 },
      { height: 'auto', opacity: 1, duration: 0.4, ease: 'power3.out' }
    );
  },

  summaryCollapse: (summary: Element) => {
    return gsap.to(summary, {
      height: 0,
      opacity: 0,
      duration: 0.3,
      ease: 'power3.in',
    });
  },

  // Product image fly to cart animation
  flyToCart: (productImage: Element, cartButton: Element) => {
    const productRect = productImage.getBoundingClientRect();
    const cartRect = cartButton.getBoundingClientRect();

    // Create a clone of the product image
    const clone = productImage.cloneNode(true) as Element;
    clone.setAttribute(
      'style',
      `
      position: fixed;
      top: ${productRect.top}px;
      left: ${productRect.left}px;
      width: ${productRect.width}px;
      height: ${productRect.height}px;
      z-index: 9999;
      pointer-events: none;
    `
    );

    document.body.appendChild(clone);

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.removeChild(clone);
        // Animate cart button
        cartAnimations.addToCartSuccess(cartButton);
      },
    });

    return tl
      .to(clone, {
        x: cartRect.left - productRect.left,
        y: cartRect.top - productRect.top,
        scale: 0.3,
        duration: 0.8,
        ease: 'power2.out',
      })
      .to(
        clone,
        {
          opacity: 0,
          scale: 0,
          duration: 0.2,
        },
        '-=0.2'
      );
  },

  // Cart loading animation
  cartLoading: (container: Element) => {
    const tl = gsap.timeline({ repeat: -1 });
    return tl
      .to(container, { opacity: 0.5, duration: 0.5 })
      .to(container, { opacity: 1, duration: 0.5 });
  },

  // Checkout button pulse
  checkoutPulse: (button: Element) => {
    return gsap.to(button, {
      scale: 1.05,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });
  },

  // Cart notification slide in
  notificationSlideIn: (notification: Element) => {
    return gsap.fromTo(
      notification,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
  },

  notificationSlideOut: (notification: Element) => {
    return gsap.to(notification, {
      y: -100,
      opacity: 0,
      duration: 0.3,
      ease: 'power3.in',
    });
  },

  // Stagger animation for multiple cart items
  staggerCartItems: (items: Element[]) => {
    return gsap.fromTo(
      items,
      { x: 50, opacity: 0, scale: 0.9 },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power3.out',
      }
    );
  },

  // Cart backdrop fade
  backdropFadeIn: (backdrop: Element) => {
    return gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  },

  backdropFadeOut: (backdrop: Element) => {
    return gsap.to(backdrop, {
      opacity: 0,
      duration: 0.3,
    });
  },
};

// Cart animation hooks for React components
export const useCartAnimations = () => {
  return cartAnimations;
};

// Utility function to animate cart state changes
export const animateCartStateChange = (
  type: 'add' | 'remove' | 'update' | 'clear',
  elements: {
    cartButton?: Element;
    cartBadge?: Element;
    cartTotal?: Element;
    cartItems?: Element[];
  }
) => {
  const { cartButton, cartBadge, cartTotal, cartItems } = elements;

  switch (type) {
    case 'add':
      if (cartButton) cartAnimations.addToCartSuccess(cartButton);
      if (cartBadge) cartAnimations.badgeUpdate(cartBadge);
      if (cartTotal) cartAnimations.totalUpdate(cartTotal);
      break;

    case 'remove':
      if (cartBadge) cartAnimations.badgeUpdate(cartBadge);
      if (cartTotal) cartAnimations.totalUpdate(cartTotal);
      break;

    case 'update':
      if (cartTotal) cartAnimations.totalUpdate(cartTotal);
      break;

    case 'clear':
      if (cartItems) {
        cartItems.forEach((item, index) => {
          setTimeout(() => {
            cartAnimations.itemSlideOut(item);
          }, index * 100);
        });
      }
      break;
  }
};

export default cartAnimations;
