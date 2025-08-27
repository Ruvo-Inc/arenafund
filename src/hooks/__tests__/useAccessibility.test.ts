import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAccessibility, useFocusManagement, useKeyboardNavigation, useLiveRegion } from '../useAccessibility';

// Mock the accessibility utils
vi.mock('../accessibility-utils', () => ({
  prefersReducedMotion: vi.fn(() => false),
  prefersHighContrast: vi.fn(() => false),
  prefersDarkMode: vi.fn(() => false),
  getAnimationDuration: vi.fn(() => 0.3),
  FocusTrap: vi.fn().mockImplementation(() => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
  })),
  announceToScreenReader: vi.fn(),
  KeyboardNavigation: {
    handleArrowKeys: vi.fn(),
    handleEscape: vi.fn(),
    handleActivation: vi.fn(),
  },
  ScreenReader: {
    isActive: vi.fn(() => false),
  },
  MobileAccessibility: {
    optimizeTouchTarget: vi.fn(),
    addMobileAria: vi.fn(),
  },
  AccessibilityTesting: {
    generateReport: vi.fn(() => ({
      passed: true,
      issues: [],
      warnings: [],
      score: 100,
    })),
  },
}));

// Mock window and document
const mockWindow = {
  matchMedia: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
  location: { pathname: '/test' },
  getComputedStyle: vi.fn(() => ({ fontSize: '16px' })),
};

const mockDocument = {
  documentElement: { style: { fontSize: '16px' } },
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

describe('useAccessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default accessibility state', () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.prefersHighContrast).toBe(false);
    expect(result.current.prefersDarkMode).toBe(false);
    expect(result.current.isScreenReaderActive).toBe(false);
    expect(result.current.fontSize).toBe(16);
    expect(result.current.animationDuration).toBe(0.3);
  });

  it('should provide announcement function', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.announce('Test message');
    });

    expect(result.current.announce).toBeDefined();
  });

  it('should provide focus management functions', () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.createFocusTrap).toBeDefined();
    expect(result.current.activateFocusTrap).toBeDefined();
    expect(result.current.deactivateFocusTrap).toBeDefined();
  });

  it('should provide keyboard navigation helpers', () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.handleArrowNavigation).toBeDefined();
    expect(result.current.handleEscapeKey).toBeDefined();
    expect(result.current.handleActivationKeys).toBeDefined();
  });

  it('should provide mobile optimization functions', () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.optimizeTouchTarget).toBeDefined();
    expect(result.current.addMobileAria).toBeDefined();
  });

  it('should provide accessibility testing function', () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.runAccessibilityAudit).toBeDefined();
  });

  it('should provide ARIA helper functions', () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.getButtonProps).toBeDefined();
    expect(result.current.getInputProps).toBeDefined();
    expect(result.current.getDialogProps).toBeDefined();
    expect(result.current.getListProps).toBeDefined();
    expect(result.current.getListItemProps).toBeDefined();
  });

  it('should generate proper button props', () => {
    const { result } = renderHook(() => useAccessibility());

    const props = result.current.getButtonProps('Test Button', {
      expanded: true,
      disabled: false,
    });

    expect(props).toEqual({
      'aria-label': 'Test Button',
      'aria-expanded': true,
      'aria-pressed': undefined,
      'aria-disabled': false,
      'aria-describedby': undefined,
      role: 'button',
      tabIndex: 0,
    });
  });

  it('should generate proper input props', () => {
    const { result } = renderHook(() => useAccessibility());

    const props = result.current.getInputProps('Email Address', {
      required: true,
      invalid: true,
      errorId: 'email-error',
    });

    expect(props).toEqual({
      'aria-label': 'Email Address',
      'aria-required': true,
      'aria-invalid': true,
      'aria-describedby': 'email-error',
    });
  });

  it('should generate optimal styles based on preferences', () => {
    const { result } = renderHook(() => useAccessibility());

    const styles = result.current.getOptimalStyles({
      color: 'blue',
    });

    expect(styles).toHaveProperty('animationDuration');
    expect(styles).toHaveProperty('transitionDuration');
    expect(styles).toHaveProperty('fontSize');
    expect(styles.color).toBe('blue');
  });

  it('should disable features when options are false', () => {
    const { result } = renderHook(() => 
      useAccessibility({
        enableAnnouncements: false,
        enableFocusManagement: false,
        enableKeyboardNavigation: false,
        enableMobileOptimizations: false,
      })
    );

    // Functions should still exist but may not perform actions
    expect(result.current.announce).toBeDefined();
    expect(result.current.createFocusTrap).toBeDefined();
    expect(result.current.handleArrowNavigation).toBeDefined();
    expect(result.current.optimizeTouchTarget).toBeDefined();
  });
});

describe('useFocusManagement', () => {
  it('should provide focus trap functions', () => {
    const containerRef = { current: document.createElement('div') };
    const { result } = renderHook(() => useFocusManagement(containerRef));

    expect(result.current.trapFocus).toBeDefined();
    expect(result.current.releaseFocus).toBeDefined();
  });

  it('should handle null container ref', () => {
    const containerRef = { current: null };
    const { result } = renderHook(() => useFocusManagement(containerRef));

    act(() => {
      result.current.trapFocus();
    });

    // Should not throw error
    expect(result.current.trapFocus).toBeDefined();
  });
});

describe('useKeyboardNavigation', () => {
  it('should initialize with default state', () => {
    const items: HTMLElement[] = [];
    const { result } = renderHook(() => useKeyboardNavigation(items));

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.setCurrentIndex).toBeDefined();
    expect(result.current.handleKeyDown).toBeDefined();
  });

  it('should handle arrow key navigation', () => {
    const mockItems = [
      { focus: vi.fn() } as any,
      { focus: vi.fn() } as any,
      { focus: vi.fn() } as any,
    ];

    const { result } = renderHook(() => useKeyboardNavigation(mockItems));

    const mockEvent = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.currentIndex).toBe(1);
    expect(mockItems[1].focus).toHaveBeenCalled();
  });

  it('should handle activation keys', () => {
    const onActivate = vi.fn();
    const mockItems: HTMLElement[] = [];

    const { result } = renderHook(() => 
      useKeyboardNavigation(mockItems, { onActivate })
    );

    const mockEvent = {
      key: 'Enter',
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(onActivate).toHaveBeenCalledWith(0);
  });

  it('should handle looping navigation', () => {
    const mockItems = [
      { focus: vi.fn() } as any,
      { focus: vi.fn() } as any,
    ];

    const { result } = renderHook(() => 
      useKeyboardNavigation(mockItems, { loop: true })
    );

    // Move to last item
    act(() => {
      result.current.setCurrentIndex(1);
    });

    // Arrow down should loop to first item
    const mockEvent = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.currentIndex).toBe(0);
    expect(mockItems[0].focus).toHaveBeenCalled();
  });

  it('should handle non-looping navigation', () => {
    const mockItems = [
      { focus: vi.fn() } as any,
      { focus: vi.fn() } as any,
    ];

    const { result } = renderHook(() => 
      useKeyboardNavigation(mockItems, { loop: false })
    );

    // Move to last item
    act(() => {
      result.current.setCurrentIndex(1);
    });

    // Arrow down should stay at last item
    const mockEvent = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it('should handle horizontal navigation', () => {
    const mockItems = [
      { focus: vi.fn() } as any,
      { focus: vi.fn() } as any,
    ];

    const { result } = renderHook(() => 
      useKeyboardNavigation(mockItems, { orientation: 'horizontal' })
    );

    const mockEvent = {
      key: 'ArrowRight',
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.currentIndex).toBe(1);
    expect(mockItems[1].focus).toHaveBeenCalled();
  });

  it('should handle Home and End keys', () => {
    const mockItems = [
      { focus: vi.fn() } as any,
      { focus: vi.fn() } as any,
      { focus: vi.fn() } as any,
    ];

    const { result } = renderHook(() => useKeyboardNavigation(mockItems));

    // Test Home key
    const homeEvent = {
      key: 'Home',
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.setCurrentIndex(2);
    });

    act(() => {
      result.current.handleKeyDown(homeEvent);
    });

    expect(result.current.currentIndex).toBe(0);
    expect(mockItems[0].focus).toHaveBeenCalled();

    // Test End key
    const endEvent = {
      key: 'End',
      preventDefault: vi.fn(),
    } as any;

    act(() => {
      result.current.handleKeyDown(endEvent);
    });

    expect(result.current.currentIndex).toBe(2);
    expect(mockItems[2].focus).toHaveBeenCalled();
  });
});

describe('useLiveRegion', () => {
  it('should initialize with empty message', () => {
    const { result } = renderHook(() => useLiveRegion());

    expect(result.current.message).toBe('');
    expect(result.current.priority).toBe('polite');
    expect(result.current.announce).toBeDefined();
    expect(result.current.liveRegionProps).toBeDefined();
  });

  it('should announce messages', () => {
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce('Test announcement', 'assertive');
    });

    expect(result.current.message).toBe('Test announcement');
    expect(result.current.priority).toBe('assertive');
  });

  it('should provide proper live region props', () => {
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce('Test', 'polite');
    });

    expect(result.current.liveRegionProps).toEqual({
      'aria-live': 'polite',
      'aria-atomic': true,
      className: 'sr-only',
    });
  });

  it('should clear message after timeout', async () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce('Test message');
    });

    expect(result.current.message).toBe('Test message');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.message).toBe('');

    vi.useRealTimers();
  });
});