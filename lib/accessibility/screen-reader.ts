// Screen reader utilities and announcements
export class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer;
  private liveRegion: HTMLElement | null = null;
  private politeRegion: HTMLElement | null = null;

  private constructor() {
    this.createLiveRegions();
  }

  static getInstance(): ScreenReaderAnnouncer {
    if (!ScreenReaderAnnouncer.instance) {
      ScreenReaderAnnouncer.instance = new ScreenReaderAnnouncer();
    }
    return ScreenReaderAnnouncer.instance;
  }

  private createLiveRegions() {
    if (typeof window === 'undefined') return;

    // Create assertive live region for urgent announcements
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'assertive');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('aria-relevant', 'text');
    this.liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.liveRegion);

    // Create polite live region for non-urgent announcements
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.setAttribute('aria-relevant', 'text');
    this.politeRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.politeRegion);
  }

  // Announce message with specified priority
  announce(message: string, priority: 'assertive' | 'polite' = 'polite') {
    const region = priority === 'assertive' ? this.liveRegion : this.politeRegion;

    if (region) {
      // Clear the region first to ensure the announcement is read
      region.textContent = '';

      // Use setTimeout to ensure the clearing is processed first
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    }
  }

  // Announce status changes
  announceStatus(status: string) {
    this.announce(`Status: ${status}`, 'polite');
  }

  // Announce errors
  announceError(error: string) {
    this.announce(`Error: ${error}`, 'assertive');
  }

  // Announce success messages
  announceSuccess(message: string) {
    this.announce(`Success: ${message}`, 'polite');
  }

  // Announce loading states
  announceLoading(message: string = 'Loading') {
    this.announce(message, 'polite');
  }

  // Announce navigation changes
  announceNavigation(location: string) {
    this.announce(`Navigated to ${location}`, 'polite');
  }

  // Announce form validation
  announceValidation(field: string, message: string, isError: boolean = true) {
    const prefix = isError ? 'Error' : 'Success';
    this.announce(`${prefix} in ${field}: ${message}`, isError ? 'assertive' : 'polite');
  }

  // Cleanup
  destroy() {
    if (this.liveRegion) {
      document.body.removeChild(this.liveRegion);
      this.liveRegion = null;
    }
    if (this.politeRegion) {
      document.body.removeChild(this.politeRegion);
      this.politeRegion = null;
    }
  }
}

// React hooks for screen reader announcements
export function useScreenReader() {
  const announcer = ScreenReaderAnnouncer.getInstance();

  return {
    announce: (message: string, priority?: 'assertive' | 'polite') =>
      announcer.announce(message, priority),
    announceStatus: (status: string) => announcer.announceStatus(status),
    announceError: (error: string) => announcer.announceError(error),
    announceSuccess: (message: string) => announcer.announceSuccess(message),
    announceLoading: (message?: string) => announcer.announceLoading(message),
    announceNavigation: (location: string) => announcer.announceNavigation(location),
    announceValidation: (field: string, message: string, isError?: boolean) =>
      announcer.announceValidation(field, message, isError),
  };
}

// Hook for form accessibility
export function useFormAccessibility() {
  const { announceValidation, announceError, announceSuccess } = useScreenReader();

  const announceFieldError = (fieldName: string, error: string) => {
    announceValidation(fieldName, error, true);
  };

  const announceFieldSuccess = (fieldName: string, message: string = 'Valid') => {
    announceValidation(fieldName, message, false);
  };

  const announceFormSubmission = (isSuccess: boolean, message: string) => {
    if (isSuccess) {
      announceSuccess(message);
    } else {
      announceError(message);
    }
  };

  return {
    announceFieldError,
    announceFieldSuccess,
    announceFormSubmission,
  };
}

// Accessibility utilities
export const accessibilityUtils = {
  // Generate unique IDs for accessibility
  generateId: (prefix: string = 'a11y') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Check if element is hidden from screen readers
  isHiddenFromScreenReader: (element: HTMLElement): boolean => {
    return (
      element.getAttribute('aria-hidden') === 'true' ||
      element.hasAttribute('hidden') ||
      element.style.display === 'none' ||
      element.style.visibility === 'hidden'
    );
  },

  // Get accessible name for element
  getAccessibleName: (element: HTMLElement): string => {
    // Check aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent || '';
    }

    // Check associated label
    if (
      element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.tagName === 'SELECT'
    ) {
      const id = element.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) return label.textContent || '';
      }
    }

    // Check title attribute
    const title = element.getAttribute('title');
    if (title) return title;

    // Fall back to text content
    return element.textContent || '';
  },

  // Set accessible description
  setAccessibleDescription: (element: HTMLElement, description: string) => {
    const descId = accessibilityUtils.generateId('desc');

    // Create description element
    const descElement = document.createElement('div');
    descElement.id = descId;
    descElement.textContent = description;
    descElement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;

    document.body.appendChild(descElement);
    element.setAttribute('aria-describedby', descId);

    return () => {
      document.body.removeChild(descElement);
      element.removeAttribute('aria-describedby');
    };
  },

  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check if user prefers high contrast
  prefersHighContrast: (): boolean => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Check if user prefers dark mode
  prefersDarkMode: (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  // Get color contrast ratio
  getContrastRatio: (color1: string, color2: string): number => {
    // This is a simplified version - in production, use a proper color contrast library
    const getLuminance = (color: string): number => {
      // Convert hex to RGB and calculate luminance
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      const sRGB = [r, g, b].map((c) => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast ratio meets WCAG standards
  meetsContrastStandards: (ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean => {
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  },
};

export default ScreenReaderAnnouncer;
