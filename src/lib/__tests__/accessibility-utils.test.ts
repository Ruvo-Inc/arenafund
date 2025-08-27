import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
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
  WCAG_CONSTANTS,
} from '../accessibility-utils';

// Mock window and document
const mockWindow = {
  matchMedia: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  innerWidth: 1024,
  innerHeight: 768,
};

const mockDocument = {
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    style: {},
  },
  createElement: vi.fn(),
  activeElement: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

describe('accessibility-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Color Contrast', () => {
    it('should calculate contrast ratio correctly', () => {
      const ratio = calculateContrastRatio('#000000', '#ffffff');
      expect(ratio).toBe(21); // Perfect contrast
    });

    it('should calculate contrast ratio for same colors', () => {
      const ratio = calculateContrastRatio('#000000', '#000000');
      expect(ratio).toBe(1); // No contrast
    });

    it('should check WCAG AA compliance for normal text', () => {
      expect(meetsContrastRequirement('#000000', '#ffffff', 'AA', false)).toBe(true);
      expect(meetsContrastRequirement('#777777', '#ffffff', 'AA', false)).toBe(false);
    });

    it('should check WCAG AA compliance for large text', () => {
      expect(meetsContrastRequirement('#777777', '#ffffff', 'AA', true)).toBe(true);
      expect(meetsContrastRequirement('#999999', '#ffffff', 'AA', true)).toBe(false);
    });

    it('should check WCAG AAA compliance', () => {
      expect(meetsContrastRequirement('#000000', '#ffffff', 'AAA', false)).toBe(true);
      expect(meetsContrastRequirement('#666666', '#ffffff', 'AAA', false)).toBe(false);
    });
  });

  describe('User Preferences', () => {
    it('should detect reduced motion preference', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true });
      expect(prefersReducedMotion()).toBe(true);
      
      mockWindow.matchMedia.mockReturnValue({ matches: false });
      expect(prefersReducedMotion()).toBe(false);
    });

    it('should detect high contrast preference', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true });
      expect(prefersHighContrast()).toBe(true);
      
      mockWindow.matchMedia.mockReturnValue({ matches: false });
      expect(prefersHighContrast()).toBe(false);
    });

    it('should detect dark mode preference', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true });
      expect(prefersDarkMode()).toBe(true);
      
      mockWindow.matchMedia.mockReturnValue({ matches: false });
      expect(prefersDarkMode()).toBe(false);
    });

    it('should return appropriate animation duration', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true });
      expect(getAnimationDuration()).toBe(WCAG_CONSTANTS.ANIMATION.REDUCED_MOTION_DURATION);
      
      mockWindow.matchMedia.mockReturnValue({ matches: false });
      expect(getAnimationDuration()).toBe(WCAG_CONSTANTS.ANIMATION.DEFAULT_DURATION);
    });
  });

  describe('Focus Styles', () => {
    it('should generate proper focus styles', () => {
      const styles = getFocusStyles('#0066cc');
      expect(styles).toEqual({
        outline: '2px solid #0066cc',
        outlineOffset: '2px',
      });
    });

    it('should use default color when none provided', () => {
      const styles = getFocusStyles();
      expect(styles.outline).toContain('#0066cc');
    });
  });

  describe('Touch Target Validation', () => {
    it('should validate minimum touch target size', () => {
      expect(validateTouchTarget(44, 44)).toBe(true);
      expect(validateTouchTarget(48, 48)).toBe(true);
      expect(validateTouchTarget(40, 40)).toBe(false);
      expect(validateTouchTarget(44, 40)).toBe(false);
    });
  });

  describe('ARIA Attributes', () => {
    it('should generate basic ARIA attributes', () => {
      const attrs = getAriaAttributes('button', { label: 'Test Button' });
      expect(attrs).toEqual({
        role: 'button',
        'aria-label': 'Test Button',
      });
    });

    it('should generate complex ARIA attributes', () => {
      const attrs = getAriaAttributes('listbox', {
        label: 'Options',
        expanded: true,
        selected: false,
        disabled: false,
        required: true,
        invalid: false,
        live: 'polite',
        controls: 'menu-items',
      });

      expect(attrs).toEqual({
        role: 'listbox',
        'aria-label': 'Options',
        'aria-expanded': true,
        'aria-selected': false,
        'aria-disabled': false,
        'aria-required': true,
        'aria-invalid': false,
        'aria-live': 'polite',
        'aria-controls': 'menu-items',
      });
    });

    it('should omit undefined attributes', () => {
      const attrs = getAriaAttributes('button', { label: 'Test' });
      expect(attrs).not.toHaveProperty('aria-expanded');
      expect(attrs).not.toHaveProperty('aria-selected');
    });
  });

  describe('FocusTrap', () => {
    let mockElement: HTMLElement;
    let focusTrap: FocusTrap;

    beforeEach(() => {
      mockElement = {
        querySelectorAll: vi.fn().mockReturnValue([]),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as any;

      focusTrap = new FocusTrap(mockElement);
    });

    it('should create focus trap instance', () => {
      expect(focusTrap).toBeInstanceOf(FocusTrap);
    });

    it('should activate focus trap', () => {
      const mockButton = { focus: vi.fn() } as any;
      mockElement.querySelectorAll = vi.fn().mockReturnValue([mockButton]);
      
      focusTrap.activate();
      
      expect(mockDocument.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockButton.focus).toHaveBeenCalled();
    });

    it('should deactivate focus trap', () => {
      focusTrap.deactivate();
      expect(mockDocument.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Screen Reader Announcements', () => {
    beforeEach(() => {
      mockDocument.createElement.mockReturnValue({
        setAttribute: vi.fn(),
        textContent: '',
        className: '',
      });
    });

    it('should announce message to screen reader', () => {
      announceToScreenReader('Test message');
      
      expect(mockDocument.createElement).toHaveBeenCalledWith('div');
      expect(mockDocument.body.appendChild).toHaveBeenCalled();
    });

    it('should announce with assertive priority', () => {
      const mockElement = {
        setAttribute: vi.fn(),
        textContent: '',
        className: '',
      };
      mockDocument.createElement.mockReturnValue(mockElement);
      
      announceToScreenReader('Urgent message', 'assertive');
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
    });
  });

  describe('Form Validation', () => {
    let mockForm: HTMLFormElement;

    beforeEach(() => {
      mockForm = {
        querySelectorAll: vi.fn(),
        querySelector: vi.fn(),
      } as any;
    });

    it('should validate form with proper labels', () => {
      const mockInput = {
        getAttribute: vi.fn().mockImplementation((attr) => {
          if (attr === 'id') return 'test-input';
          return null;
        }),
        tagName: 'INPUT',
      };

      const mockLabel = { textContent: 'Test Label' };

      mockForm.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('input')) return [mockInput];
        if (selector.includes('fieldset')) return [];
        return [];
      });
      mockForm.querySelector.mockReturnValue(mockLabel);

      const issues = validateFormAccessibility(mockForm);
      expect(issues).toHaveLength(0);
    });

    it('should detect missing labels', () => {
      const mockInput = {
        getAttribute: vi.fn().mockReturnValue(null),
        tagName: 'INPUT',
      };

      mockForm.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('input')) return [mockInput];
        if (selector.includes('fieldset')) return [];
        return [];
      });
      mockForm.querySelector.mockReturnValue(null);

      const issues = validateFormAccessibility(mockForm);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('missing accessible label');
    });

    it('should detect missing fieldset legends', () => {
      const mockFieldset = {
        querySelector: vi.fn().mockReturnValue(null),
      };

      mockForm.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('fieldset')) return [mockFieldset];
        return [];
      });

      const issues = validateFormAccessibility(mockForm);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('missing legend');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle arrow key navigation', () => {
      const items = [
        { focus: vi.fn() },
        { focus: vi.fn() },
        { focus: vi.fn() },
      ] as any[];
      
      const onIndexChange = vi.fn();
      const mockEvent = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as any;

      KeyboardNavigation.handleArrowKeys(mockEvent, items, 0, onIndexChange);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onIndexChange).toHaveBeenCalledWith(1);
      expect(items[1].focus).toHaveBeenCalled();
    });

    it('should handle escape key', () => {
      const onEscape = vi.fn();
      const mockEvent = {
        key: 'Escape',
        preventDefault: vi.fn(),
      } as any;

      KeyboardNavigation.handleEscape(mockEvent, onEscape);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onEscape).toHaveBeenCalled();
    });

    it('should handle activation keys', () => {
      const onActivate = vi.fn();
      
      const enterEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as any;

      const spaceEvent = {
        key: ' ',
        preventDefault: vi.fn(),
      } as any;

      KeyboardNavigation.handleActivation(enterEvent, onActivate);
      KeyboardNavigation.handleActivation(spaceEvent, onActivate);

      expect(enterEvent.preventDefault).toHaveBeenCalled();
      expect(spaceEvent.preventDefault).toHaveBeenCalled();
      expect(onActivate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Screen Reader Utilities', () => {
    it('should detect screen reader activity', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'NVDA screen reader' },
        writable: true,
      });

      expect(ScreenReader.isActive()).toBe(true);
    });

    it('should optimize text for screen readers', () => {
      const text = 'Price: $100 & 50% off + shipping';
      const optimized = ScreenReader.optimizeText(text);
      
      expect(optimized).toBe('Price: dollars100 and 50percent off plus shipping');
    });

    it('should describe elements', () => {
      const mockElement = {
        getAttribute: vi.fn().mockImplementation((attr) => {
          if (attr === 'role') return 'button';
          if (attr === 'aria-label') return 'Submit form';
          if (attr === 'aria-expanded') return 'false';
          return null;
        }),
        tagName: 'BUTTON',
        textContent: '',
      } as any;

      const description = ScreenReader.describeElement(mockElement);
      expect(description).toBe('button Submit form collapsed');
    });
  });

  describe('Mobile Accessibility', () => {
    it('should optimize touch targets', () => {
      const mockElement = {
        getBoundingClientRect: vi.fn().mockReturnValue({
          width: 30,
          height: 30,
        }),
        style: {},
      } as any;

      MobileAccessibility.optimizeTouchTarget(mockElement);

      expect(mockElement.style.minWidth).toBe('44px');
      expect(mockElement.style.minHeight).toBe('44px');
    });

    it('should add mobile ARIA attributes', () => {
      const mockButton = {
        setAttribute: vi.fn(),
        getAttribute: vi.fn().mockReturnValue('Submit'),
        tagName: 'BUTTON',
        textContent: 'Submit',
      } as any;

      MobileAccessibility.addMobileAria(mockButton);

      expect(mockButton.setAttribute).toHaveBeenCalledWith('aria-touchable', 'true');
      expect(mockButton.setAttribute).toHaveBeenCalledWith('aria-label', 'Submit button');
    });

    it('should handle orientation changes', () => {
      const callback = vi.fn();
      const cleanup = MobileAccessibility.handleOrientationChange(callback);

      expect(mockWindow.addEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
      
      cleanup();
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    });
  });

  describe('Accessibility Testing', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = {
        querySelectorAll: vi.fn().mockReturnValue([]),
        querySelector: vi.fn().mockReturnValue(null),
      } as any;
    });

    it('should audit element and return report', () => {
      const report = AccessibilityTesting.auditElement(mockElement);
      
      expect(report).toHaveProperty('passed');
      expect(report).toHaveProperty('issues');
      expect(typeof report.passed).toBe('boolean');
      expect(Array.isArray(report.issues)).toBe(true);
    });

    it('should generate comprehensive report', () => {
      const report = AccessibilityTesting.generateReport(mockElement);
      
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('passed');
      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('focusableElementsCount');
      expect(report).toHaveProperty('hasSkipLinks');
      expect(report).toHaveProperty('hasLandmarks');
      expect(report).toHaveProperty('hasHeadings');
    });

    it('should detect missing alt text', () => {
      const mockImg = {
        getAttribute: vi.fn().mockReturnValue(null),
        tagName: 'IMG',
      };

      mockElement.querySelectorAll.mockImplementation((selector) => {
        if (selector === 'img') return [mockImg];
        return [];
      });

      const report = AccessibilityTesting.auditElement(mockElement);
      expect(report.issues).toContain('Image missing alt text');
    });
  });
});