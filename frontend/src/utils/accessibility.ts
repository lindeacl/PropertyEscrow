/**
 * Accessibility utilities for enhanced user experience
 */

// Focus management utilities
export const focusManagement = {
  // Trap focus within a container
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  // Restore focus to previous element
  restoreFocus: (previousActiveElement: Element | null) => {
    if (previousActiveElement && 'focus' in previousActiveElement) {
      (previousActiveElement as HTMLElement).focus();
    }
  },

  // Get next focusable element
  getNextFocusableElement: (currentElement: HTMLElement, container?: HTMLElement): HTMLElement | null => {
    const scope = container || document;
    const focusableElements = Array.from(scope.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(currentElement);
    return focusableElements[currentIndex + 1] || focusableElements[0];
  }
};

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Handle arrow key navigation for lists/grids
  handleArrowNavigation: (
    event: KeyboardEvent, 
    items: HTMLElement[], 
    currentIndex: number,
    options: {
      orientation?: 'vertical' | 'horizontal' | 'both';
      wrap?: boolean;
      cols?: number;
    } = {}
  ): number => {
    const { orientation = 'both', wrap = true, cols } = options;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          if (cols) {
            newIndex = currentIndex - cols;
            if (newIndex < 0 && wrap) {
              newIndex = Math.floor((items.length - 1) / cols) * cols + (currentIndex % cols);
              if (newIndex >= items.length) newIndex -= cols;
            }
          } else {
            newIndex = wrap ? (currentIndex - 1 + items.length) % items.length : Math.max(0, currentIndex - 1);
          }
          event.preventDefault();
        }
        break;
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          if (cols) {
            newIndex = currentIndex + cols;
            if (newIndex >= items.length && wrap) {
              newIndex = currentIndex % cols;
            }
          } else {
            newIndex = wrap ? (currentIndex + 1) % items.length : Math.min(items.length - 1, currentIndex + 1);
          }
          event.preventDefault();
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          newIndex = wrap ? (currentIndex - 1 + items.length) % items.length : Math.max(0, currentIndex - 1);
          event.preventDefault();
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          newIndex = wrap ? (currentIndex + 1) % items.length : Math.min(items.length - 1, currentIndex + 1);
          event.preventDefault();
        }
        break;
      case 'Home':
        newIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        newIndex = items.length - 1;
        event.preventDefault();
        break;
    }

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < items.length) {
      items[newIndex].focus();
      return newIndex;
    }

    return currentIndex;
  }
};

// ARIA utilities
export const ariaUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Announce to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('class', 'sr-only');
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  // Update ARIA labels dynamically
  updateAriaLabel: (element: HTMLElement, label: string): void => {
    element.setAttribute('aria-label', label);
  },

  // Set ARIA expanded state
  setExpanded: (element: HTMLElement, expanded: boolean): void => {
    element.setAttribute('aria-expanded', expanded.toString());
  }
};

// Color contrast utilities
export const colorContrast = {
  // Calculate relative luminance
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio
  getContrastRatio: (color1: [number, number, number], color2: [number, number, number]): number => {
    const lum1 = colorContrast.getLuminance(...color1);
    const lum2 = colorContrast.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast meets WCAG guidelines
  meetsWCAG: (ratio: number, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): boolean => {
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    }
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
};

// Screen reader utilities
export const screenReader = {
  // Create visually hidden text for screen readers
  createSROnlyText: (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  },

  // Check if screen reader is active
  isScreenReaderActive: (): boolean => {
    return window.navigator.userAgent.includes('NVDA') ||
           window.navigator.userAgent.includes('JAWS') ||
           window.speechSynthesis?.speaking ||
           document.activeElement?.getAttribute('role') === 'application';
  }
};

// High contrast mode detection
export const highContrast = {
  // Detect high contrast mode
  isHighContrastMode: (): boolean => {
    const testElement = document.createElement('div');
    testElement.style.border = '1px solid';
    testElement.style.borderColor = 'red green';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    const isHighContrast = computedStyle.borderTopColor === computedStyle.borderRightColor;
    
    document.body.removeChild(testElement);
    return isHighContrast;
  },

  // Apply high contrast styles
  applyHighContrastStyles: (): void => {
    document.documentElement.classList.add('high-contrast');
  }
};

// Reduced motion utilities
export const reducedMotion = {
  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Conditionally apply animations
  conditionalAnimation: (element: HTMLElement, animationClass: string): void => {
    if (!reducedMotion.prefersReducedMotion()) {
      element.classList.add(animationClass);
    }
  }
};

// Skip links utility
export const skipLinks = {
  // Create skip to main content link
  createSkipLink: (targetId: string, text = 'Skip to main content'): HTMLAnchorElement => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
      border-radius: 0 0 4px 4px;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    return skipLink;
  }
};

export default {
  focusManagement,
  keyboardNavigation,
  ariaUtils,
  colorContrast,
  screenReader,
  highContrast,
  reducedMotion,
  skipLinks
};