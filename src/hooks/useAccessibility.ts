import { useEffect, useState, useCallback, useRef } from 'react';
import {
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  getAnimationDuration,
  FocusTrap,
  announceToScreenReader,
  KeyboardNavigation,
  ScreenReader,
  MobileAccessibility,
  AccessibilityTesting,
  type AccessibilityReport,
} from '@/lib/accessibility-utils';

interface AccessibilityState {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersDarkMode: boolean;
  isScreenReaderActive: boolean;
  isHighContrastMode: boolean;
  fontSize: number;
  animationDuration: number;
}

interface AccessibilityOptions {
  enableAnnouncements?: boolean;
  enableFocusManagement?: boolean;
  enableKeyboardNavigation?: boolean;
  enableMobileOptimizations?: boolean;
  announceRouteChanges?: boolean;
}

/**
 * Comprehensive accessibility hook for WCAG 2.1 AA compliance
 */
export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    enableAnnouncements = true,
    enableFocusManagement = true,
    enableKeyboardNavigation = true,
    enableMobileOptimizations = true,
    announceRouteChanges = true,
  } = options;

  const [state, setState] = useState<AccessibilityState>(() => ({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkMode: false,
    isScreenReaderActive: false,
    isHighContrastMode: false,
    fontSize: 16,
    animationDuration: 0.3,
  }));

  const focusTrapRef = useRef<FocusTrap | null>(null);
  const previousRouteRef = useRef<string>('');

  // Initialize accessibility state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setState({
      prefersReducedMotion: prefersReducedMotion(),
      prefersHighContrast: prefersHighContrast(),
      prefersDarkMode: prefersDarkMode(),
      isScreenReaderActive: ScreenReader.isActive(),
      isHighContrastMode: prefersHighContrast(),
      fontSize: parseInt(getComputedStyle(document.documentElement).fontSize) || 16,
      animationDuration: getAnimationDuration(),
    });
  }, []);

  // Listen for media query changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueries = [
      { query: '(prefers-reduced-motion: reduce)', key: 'prefersReducedMotion' as const },
      { query: '(prefers-contrast: high)', key: 'prefersHighContrast' as const },
      { query: '(prefers-color-scheme: dark)', key: 'prefersDarkMode' as const },
    ];

    const listeners: (() => void)[] = [];

    mediaQueries.forEach(({ query, key }) => {
      const mediaQuery = window.matchMedia(query);
      const listener = (e: MediaQueryListEvent) => {
        setState(prev => ({
          ...prev,
          [key]: e.matches,
          animationDuration: key === 'prefersReducedMotion' ? getAnimationDuration() : prev.animationDuration,
        }));
      };

      mediaQuery.addEventListener('change', listener);
      listeners.push(() => mediaQuery.removeEventListener('change', listener));
    });

    return () => {
      listeners.forEach(cleanup => cleanup());
    };
  }, []);

  // Route change announcements
  useEffect(() => {
    if (!announceRouteChanges || typeof window === 'undefined') return;

    const currentRoute = window.location.pathname;
    if (previousRouteRef.current && previousRouteRef.current !== currentRoute) {
      const routeName = currentRoute.split('/').pop() || 'home';
      announce(`Navigated to ${routeName} page`);
    }
    previousRouteRef.current = currentRoute;
  }, [announceRouteChanges]);

  // Announcement function
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (enableAnnouncements) {
      announceToScreenReader(message, priority);
    }
  }, [enableAnnouncements]);

  // Focus management
  const createFocusTrap = useCallback((element: HTMLElement) => {
    if (!enableFocusManagement) return null;
    
    focusTrapRef.current = new FocusTrap(element);
    return focusTrapRef.current;
  }, [enableFocusManagement]);

  const activateFocusTrap = useCallback(() => {
    focusTrapRef.current?.activate();
  }, []);

  const deactivateFocusTrap = useCallback(() => {
    focusTrapRef.current?.deactivate();
    focusTrapRef.current = null;
  }, []);

  // Keyboard navigation helpers
  const handleArrowNavigation = useCallback((
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) => {
    if (enableKeyboardNavigation) {
      KeyboardNavigation.handleArrowKeys(event, items, currentIndex, onIndexChange, orientation);
    }
  }, [enableKeyboardNavigation]);

  const handleEscapeKey = useCallback((event: KeyboardEvent, onEscape: () => void) => {
    if (enableKeyboardNavigation) {
      KeyboardNavigation.handleEscape(event, onEscape);
    }
  }, [enableKeyboardNavigation]);

  const handleActivationKeys = useCallback((event: KeyboardEvent, onActivate: () => void) => {
    if (enableKeyboardNavigation) {
      KeyboardNavigation.handleActivation(event, onActivate);
    }
  }, [enableKeyboardNavigation]);

  // Mobile accessibility optimizations
  const optimizeTouchTarget = useCallback((element: HTMLElement) => {
    if (enableMobileOptimizations) {
      MobileAccessibility.optimizeTouchTarget(element);
    }
  }, [enableMobileOptimizations]);

  const addMobileAria = useCallback((element: HTMLElement) => {
    if (enableMobileOptimizations) {
      MobileAccessibility.addMobileAria(element);
    }
  }, [enableMobileOptimizations]);

  // Accessibility testing
  const runAccessibilityAudit = useCallback((element?: HTMLElement): AccessibilityReport => {
    return AccessibilityTesting.generateReport(element);
  }, []);

  // Get optimal styles based on user preferences
  const getOptimalStyles = useCallback((baseStyles: React.CSSProperties = {}): React.CSSProperties => {
    return {
      ...baseStyles,
      animationDuration: `${state.animationDuration}s`,
      transitionDuration: `${state.animationDuration}s`,
      fontSize: state.prefersHighContrast ? Math.max(state.fontSize, 18) : state.fontSize,
      ...(state.prefersHighContrast && {
        border: '2px solid currentColor',
        outline: '2px solid transparent',
      }),
    };
  }, [state]);

  // Get ARIA attributes for common patterns
  const getButtonProps = useCallback((
    label: string,
    options: {
      expanded?: boolean;
      pressed?: boolean;
      disabled?: boolean;
      describedBy?: string;
    } = {}
  ) => ({
    'aria-label': label,
    'aria-expanded': options.expanded,
    'aria-pressed': options.pressed,
    'aria-disabled': options.disabled,
    'aria-describedby': options.describedBy,
    role: 'button',
    tabIndex: options.disabled ? -1 : 0,
  }), []);

  const getInputProps = useCallback((
    label: string,
    options: {
      required?: boolean;
      invalid?: boolean;
      describedBy?: string;
      errorId?: string;
    } = {}
  ) => ({
    'aria-label': label,
    'aria-required': options.required,
    'aria-invalid': options.invalid,
    'aria-describedby': options.invalid && options.errorId 
      ? `${options.describedBy || ''} ${options.errorId}`.trim()
      : options.describedBy,
  }), []);

  const getDialogProps = useCallback((
    title: string,
    options: {
      describedBy?: string;
      modal?: boolean;
    } = {}
  ) => ({
    role: options.modal ? 'dialog' : 'alertdialog',
    'aria-label': title,
    'aria-describedby': options.describedBy,
    'aria-modal': options.modal,
    tabIndex: -1,
  }), []);

  const getListProps = useCallback((
    label?: string,
    options: {
      multiselectable?: boolean;
      orientation?: 'horizontal' | 'vertical';
    } = {}
  ) => ({
    role: 'list',
    'aria-label': label,
    'aria-multiselectable': options.multiselectable,
    'aria-orientation': options.orientation,
  }), []);

  const getListItemProps = useCallback((
    options: {
      selected?: boolean;
      disabled?: boolean;
      index?: number;
      setSize?: number;
    } = {}
  ) => ({
    role: 'listitem',
    'aria-selected': options.selected,
    'aria-disabled': options.disabled,
    'aria-posinset': options.index !== undefined ? options.index + 1 : undefined,
    'aria-setsize': options.setSize,
    tabIndex: options.disabled ? -1 : 0,
  }), []);

  return {
    // State
    ...state,
    
    // Announcement
    announce,
    
    // Focus management
    createFocusTrap,
    activateFocusTrap,
    deactivateFocusTrap,
    
    // Keyboard navigation
    handleArrowNavigation,
    handleEscapeKey,
    handleActivationKeys,
    
    // Mobile optimizations
    optimizeTouchTarget,
    addMobileAria,
    
    // Testing
    runAccessibilityAudit,
    
    // Styling
    getOptimalStyles,
    
    // ARIA helpers
    getButtonProps,
    getInputProps,
    getDialogProps,
    getListProps,
    getListItemProps,
  };
};

/**
 * Hook for managing focus within a specific container
 */
export const useFocusManagement = (containerRef: React.RefObject<HTMLElement | null>) => {
  const focusTrapRef = useRef<FocusTrap | null>(null);

  const trapFocus = useCallback(() => {
    if (containerRef.current) {
      focusTrapRef.current = new FocusTrap(containerRef.current);
      focusTrapRef.current.activate();
    }
  }, [containerRef]);

  const releaseFocus = useCallback(() => {
    focusTrapRef.current?.deactivate();
    focusTrapRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      focusTrapRef.current?.deactivate();
    };
  }, []);

  return { trapFocus, releaseFocus };
};

/**
 * Hook for keyboard navigation in lists/menus
 */
export const useKeyboardNavigation = (
  items: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical';
    loop?: boolean;
    onActivate?: (index: number) => void;
  } = {}
) => {
  const { orientation = 'vertical', loop = true, onActivate } = options;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        setCurrentIndex(prev => {
          const next = prev < items.length - 1 ? prev + 1 : (loop ? 0 : prev);
          items[next]?.focus();
          return next;
        });
        break;

      case prevKey:
        event.preventDefault();
        setCurrentIndex(prev => {
          const next = prev > 0 ? prev - 1 : (loop ? items.length - 1 : prev);
          items[next]?.focus();
          return next;
        });
        break;

      case 'Home':
        event.preventDefault();
        setCurrentIndex(0);
        items[0]?.focus();
        break;

      case 'End':
        event.preventDefault();
        const lastIndex = items.length - 1;
        setCurrentIndex(lastIndex);
        items[lastIndex]?.focus();
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        onActivate?.(currentIndex);
        break;
    }
  }, [items, orientation, loop, onActivate, currentIndex]);

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
  };
};

/**
 * Hook for managing live regions and announcements
 */
export const useLiveRegion = () => {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((text: string, urgency: 'polite' | 'assertive' = 'polite') => {
    setMessage(text);
    setPriority(urgency);
    
    // Clear message after announcement
    setTimeout(() => setMessage(''), 1000);
  }, []);

  return {
    message,
    priority,
    announce,
    liveRegionProps: {
      'aria-live': priority,
      'aria-atomic': true,
      className: 'sr-only',
    },
  };
};

export default useAccessibility;