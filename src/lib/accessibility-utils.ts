/**
 * Comprehensive accessibility utilities for WCAG 2.1 AA compliance
 */

// WCAG 2.1 AA compliance constants
export const WCAG_CONSTANTS = {
  // Color contrast ratios
  CONTRAST_RATIOS: {
    AA_NORMAL: 4.5,
    AA_LARGE: 3,
    AAA_NORMAL: 7,
    AAA_LARGE: 4.5,
  },
  
  // Touch target sizes (in pixels)
  TOUCH_TARGETS: {
    MINIMUM: 44, // WCAG 2.1 AA minimum
    RECOMMENDED: 48, // Better UX
    LARGE: 56, // Primary actions
  },
  
  // Focus indicators
  FOCUS: {
    MIN_THICKNESS: 2, // pixels
    MIN_OFFSET: 2, // pixels
  },
  
  // Animation and motion
  ANIMATION: {
    REDUCED_MOTION_DURATION: 0.01, // seconds
    DEFAULT_DURATION: 0.3, // seconds
  },
  
  // Text sizing
  TEXT: {
    MIN_FONT_SIZE: 16, // pixels - prevents iOS zoom
    LINE_HEIGHT_MIN: 1.5,
    PARAGRAPH_SPACING: 1.5, // em
  },
} as const;

/**
 * Calculates color contrast ratio between two colors
 */
export const calculateContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Calculate relative luminance
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Checks if color contrast meets WCAG standards
 */
export const meetsContrastRequirement = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean => {
  const ratio = calculateContrastRatio(foreground, background);
  const required = level === 'AA' 
    ? (isLargeText ? WCAG_CONSTANTS.CONTRAST_RATIOS.AA_LARGE : WCAG_CONSTANTS.CONTRAST_RATIOS.AA_NORMAL)
    : (isLargeText ? WCAG_CONSTANTS.CONTRAST_RATIOS.AAA_LARGE : WCAG_CONSTANTS.CONTRAST_RATIOS.AAA_NORMAL);
  
  return ratio >= required;
};

/**
 * Detects if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Detects if user prefers high contrast
 */
export const prefersHighContrast = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Detects if user prefers dark mode
 */
export const prefersDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Gets optimal animation duration based on user preferences
 */
export const getAnimationDuration = (defaultDuration: number = WCAG_CONSTANTS.ANIMATION.DEFAULT_DURATION): number => {
  return prefersReducedMotion() ? WCAG_CONSTANTS.ANIMATION.REDUCED_MOTION_DURATION : defaultDuration;
};

/**
 * Generates accessible focus styles
 */
export const getFocusStyles = (color: string = '#0066cc'): React.CSSProperties => {
  return {
    outline: `${WCAG_CONSTANTS.FOCUS.MIN_THICKNESS}px solid ${color}`,
    outlineOffset: `${WCAG_CONSTANTS.FOCUS.MIN_OFFSET}px`,
  };
};

/**
 * Validates touch target size
 */
export const validateTouchTarget = (width: number, height: number): boolean => {
  return width >= WCAG_CONSTANTS.TOUCH_TARGETS.MINIMUM && height >= WCAG_CONSTANTS.TOUCH_TARGETS.MINIMUM;
};

/**
 * Generates ARIA attributes for interactive elements
 */
export const getAriaAttributes = (
  role: string,
  options: {
    label?: string;
    describedBy?: string;
    expanded?: boolean;
    selected?: boolean;
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    live?: 'polite' | 'assertive' | 'off';
    atomic?: boolean;
    controls?: string;
    owns?: string;
    haspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  } = {}
) => {
  const attributes: Record<string, any> = { role };
  
  if (options.label) attributes['aria-label'] = options.label;
  if (options.describedBy) attributes['aria-describedby'] = options.describedBy;
  if (options.expanded !== undefined) attributes['aria-expanded'] = options.expanded;
  if (options.selected !== undefined) attributes['aria-selected'] = options.selected;
  if (options.disabled !== undefined) attributes['aria-disabled'] = options.disabled;
  if (options.required !== undefined) attributes['aria-required'] = options.required;
  if (options.invalid !== undefined) attributes['aria-invalid'] = options.invalid;
  if (options.live) attributes['aria-live'] = options.live;
  if (options.atomic !== undefined) attributes['aria-atomic'] = options.atomic;
  if (options.controls) attributes['aria-controls'] = options.controls;
  if (options.owns) attributes['aria-owns'] = options.owns;
  if (options.haspopup !== undefined) attributes['aria-haspopup'] = options.haspopup;
  
  return attributes;
};

/**
 * Manages focus trap for modals and dialogs
 */
export class FocusTrap {
  private element: HTMLElement;
  private focusableElements: HTMLElement[] = [];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  private previousActiveElement: Element | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.updateFocusableElements();
  }

  private updateFocusableElements() {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    this.focusableElements = Array.from(
      this.element.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  activate() {
    this.previousActiveElement = document.activeElement;
    this.updateFocusableElements();
    
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }

    document.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    document.removeEventListener('keydown', this.handleKeyDown);
    
    if (this.previousActiveElement && 'focus' in this.previousActiveElement) {
      (this.previousActiveElement as HTMLElement).focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (this.focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  };
}

/**
 * Announces content to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (typeof document === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Validates form accessibility
 */
export const validateFormAccessibility = (form: HTMLFormElement): string[] => {
  const issues: string[] = [];
  
  // Check for labels
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (!id || (!ariaLabel && !ariaLabelledBy && !form.querySelector(`label[for="${id}"]`))) {
      issues.push(`Input element missing accessible label: ${input.tagName.toLowerCase()}`);
    }
  });
  
  // Check for fieldsets with legends
  const fieldsets = form.querySelectorAll('fieldset');
  fieldsets.forEach((fieldset) => {
    if (!(fieldset as HTMLElement).querySelector('legend')) {
      issues.push('Fieldset missing legend element');
    }
  });
  
  // Check for error messages
  const errorElements = form.querySelectorAll('[aria-invalid="true"]');
  errorElements.forEach((element) => {
    const describedBy = element.getAttribute('aria-describedby');
    if (!describedBy || !form.querySelector(`#${describedBy}`)) {
      issues.push('Invalid element missing error description');
    }
  });
  
  return issues;
};

/**
 * Keyboard navigation utilities
 */
export const KeyboardNavigation = {
  /**
   * Handles arrow key navigation in lists
   */
  handleArrowKeys: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) => {
    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
    
    switch (event.key) {
      case nextKey:
        event.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        onIndexChange(nextIndex);
        items[nextIndex]?.focus();
        break;
        
      case prevKey:
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        onIndexChange(prevIndex);
        items[prevIndex]?.focus();
        break;
        
      case 'Home':
        event.preventDefault();
        onIndexChange(0);
        items[0]?.focus();
        break;
        
      case 'End':
        event.preventDefault();
        const lastIndex = items.length - 1;
        onIndexChange(lastIndex);
        items[lastIndex]?.focus();
        break;
    }
  },

  /**
   * Handles escape key to close modals/dropdowns
   */
  handleEscape: (event: KeyboardEvent, onEscape: () => void) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape();
    }
  },

  /**
   * Handles enter/space activation
   */
  handleActivation: (event: KeyboardEvent, onActivate: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate();
    }
  },
};

/**
 * Screen reader utilities
 */
export const ScreenReader = {
  /**
   * Checks if screen reader is likely active
   */
  isActive: (): boolean => {
    if (typeof navigator === 'undefined') return false;
    
    // Check for common screen reader user agents
    const userAgent = navigator.userAgent.toLowerCase();
    const screenReaderIndicators = [
      'nvda', 'jaws', 'dragon', 'zoomtext', 'fusion', 'supernova',
      'narrator', 'voiceover', 'talkback', 'orca'
    ];
    
    return screenReaderIndicators.some(indicator => userAgent.includes(indicator));
  },

  /**
   * Provides screen reader optimized text
   */
  optimizeText: (text: string): string => {
    return text
      .replace(/&/g, 'and')
      .replace(/\$/g, 'dollars')
      .replace(/%/g, 'percent')
      .replace(/\+/g, 'plus')
      .replace(/-/g, 'minus')
      .replace(/\*/g, 'times')
      .replace(/\//g, 'divided by');
  },

  /**
   * Creates descriptive text for complex UI elements
   */
  describeElement: (element: HTMLElement): string => {
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    const label = element.getAttribute('aria-label') || element.textContent || '';
    const state = element.getAttribute('aria-expanded') === 'true' ? 'expanded' : 'collapsed';
    
    return `${role} ${label} ${state}`.trim();
  },
};

/**
 * Mobile accessibility enhancements
 */
export const MobileAccessibility = {
  /**
   * Optimizes touch targets for accessibility
   */
  optimizeTouchTarget: (element: HTMLElement): void => {
    const rect = element.getBoundingClientRect();
    const minSize = WCAG_CONSTANTS.TOUCH_TARGETS.MINIMUM;
    
    if (rect.width < minSize || rect.height < minSize) {
      element.style.minWidth = `${minSize}px`;
      element.style.minHeight = `${minSize}px`;
      element.style.display = 'inline-flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
    }
  },

  /**
   * Adds mobile-specific ARIA attributes
   */
  addMobileAria: (element: HTMLElement): void => {
    // Add touch-specific attributes
    element.setAttribute('aria-touchable', 'true');
    
    // Enhance button descriptions for touch
    if (element.tagName.toLowerCase() === 'button') {
      const currentLabel = element.getAttribute('aria-label') || element.textContent || '';
      element.setAttribute('aria-label', `${currentLabel} button`);
    }
  },

  /**
   * Handles orientation change accessibility
   */
  handleOrientationChange: (callback: () => void): (() => void) => {
    if (typeof window === 'undefined') return () => {};
    
    const handleChange = () => {
      // Announce orientation change to screen readers
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      announceToScreenReader(`Screen orientation changed to ${orientation}`, 'polite');
      callback();
    };
    
    window.addEventListener('orientationchange', handleChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleChange);
    };
  },
};

/**
 * Accessibility testing utilities
 */
export const AccessibilityTesting = {
  /**
   * Runs basic accessibility audit on element
   */
  auditElement: (element: HTMLElement): { passed: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    // Check for alt text on images
    const images = element.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.getAttribute('alt')) {
        issues.push('Image missing alt text');
      }
    });
    
    // Check for proper heading hierarchy
    const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let previousLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push(`Heading level skipped: ${heading.tagName}`);
      }
      previousLevel = level;
    });
    
    // Check for color contrast (simplified)
    const textElements = element.querySelectorAll('p, span, div, a, button');
    textElements.forEach((el) => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && backgroundColor && color !== backgroundColor) {
        // This is a simplified check - in practice, you'd need more sophisticated color parsing
        if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
          issues.push('Potential color contrast issue detected');
        }
      }
    });
    
    return {
      passed: issues.length === 0,
      issues,
    };
  },

  /**
   * Generates accessibility report
   */
  generateReport: (element: HTMLElement = document.body): AccessibilityReport => {
    const audit = AccessibilityTesting.auditElement(element);
    const focusableElements = element.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    return {
      timestamp: new Date().toISOString(),
      passed: audit.passed,
      issues: audit.issues,
      focusableElementsCount: focusableElements.length,
      hasSkipLinks: !!element.querySelector('a[href^="#"]'),
      hasLandmarks: !!element.querySelector('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]'),
      hasHeadings: !!element.querySelector('h1, h2, h3, h4, h5, h6'),
    };
  },
};

export interface AccessibilityReport {
  timestamp: string;
  passed: boolean;
  issues: string[];
  focusableElementsCount: number;
  hasSkipLinks: boolean;
  hasLandmarks: boolean;
  hasHeadings: boolean;
}

export default {
  WCAG_CONSTANTS,
  calculateContrastRatio,
  meetsContrastRequirement,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  getAnimationDuration,
  getFocusStyles,
  validateTouchTarget,
  getAriaAttributes,
  FocusTrap,
  announceToScreenReader,
  validateFormAccessibility,
  KeyboardNavigation,
  ScreenReader,
  MobileAccessibility,
  AccessibilityTesting,
};