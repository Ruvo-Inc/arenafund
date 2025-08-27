/**
 * Mobile optimization utilities for ensuring consistent UX across devices
 */

// Touch target minimum sizes (WCAG AA compliance)
export const TOUCH_TARGETS = {
  MINIMUM: 44, // 44px minimum for accessibility
  COMFORTABLE: 48, // 48px for better UX
  LARGE: 56, // 56px for primary actions
} as const;

// Viewport breakpoints optimized for mobile-first design
export const BREAKPOINTS = {
  MOBILE: 320,
  MOBILE_LARGE: 375,
  TABLET: 768,
  DESKTOP: 1024,
  DESKTOP_LARGE: 1440,
} as const;

// iOS Safari specific optimizations
export const IOS_OPTIMIZATIONS = {
  FONT_SIZE_MIN: 16, // Prevents zoom on input focus
  TAP_HIGHLIGHT: 'transparent',
  TOUCH_ACTION: 'manipulation',
} as const;

/**
 * Detects if the device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Detects if the device is iOS
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * Detects if the device is Android
 */
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android/.test(navigator.userAgent);
};

/**
 * Gets the current viewport width
 */
export const getViewportWidth = (): number => {
  if (typeof window === 'undefined') return BREAKPOINTS.DESKTOP;
  
  return window.innerWidth || document.documentElement.clientWidth;
};

/**
 * Checks if the current viewport is mobile
 */
export const isMobileViewport = (): boolean => {
  return getViewportWidth() < BREAKPOINTS.TABLET;
};

/**
 * Checks if the current viewport is tablet
 */
export const isTabletViewport = (): boolean => {
  const width = getViewportWidth();
  return width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP;
};

/**
 * Gets optimal touch target size based on device and context
 */
export const getOptimalTouchTarget = (context: 'primary' | 'secondary' | 'minimal' = 'secondary'): number => {
  const isMobile = isMobileViewport();
  
  switch (context) {
    case 'primary':
      return isMobile ? TOUCH_TARGETS.LARGE : TOUCH_TARGETS.COMFORTABLE;
    case 'minimal':
      return TOUCH_TARGETS.MINIMUM;
    case 'secondary':
    default:
      return isMobile ? TOUCH_TARGETS.COMFORTABLE : TOUCH_TARGETS.MINIMUM;
  }
};

/**
 * Generates mobile-optimized CSS classes
 */
export const getMobileClasses = (element: 'button' | 'input' | 'select' | 'textarea' | 'link'): string => {
  const baseClasses = 'touch-target';
  
  switch (element) {
    case 'button':
      return `${baseClasses} btn-mobile`;
    case 'input':
    case 'select':
    case 'textarea':
      return `${baseClasses} form-input-mobile`;
    case 'link':
      return `${baseClasses}`;
    default:
      return baseClasses;
  }
};

/**
 * Generates mobile-optimized styles
 */
export const getMobileStyles = (element: 'button' | 'input' | 'select' | 'textarea'): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    fontSize: `${IOS_OPTIMIZATIONS.FONT_SIZE_MIN}px`,
    WebkitTapHighlightColor: IOS_OPTIMIZATIONS.TAP_HIGHLIGHT,
    touchAction: IOS_OPTIMIZATIONS.TOUCH_ACTION,
  };

  switch (element) {
    case 'button':
      return {
        ...baseStyles,
        minHeight: `${getOptimalTouchTarget('primary')}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
    case 'input':
    case 'select':
    case 'textarea':
      return {
        ...baseStyles,
        minHeight: `${getOptimalTouchTarget('secondary')}px`,
      };
    default:
      return baseStyles;
  }
};

/**
 * Handles safe area insets for devices with notches
 */
export const getSafeAreaStyles = (position: 'top' | 'bottom' | 'left' | 'right' | 'all'): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  if (position === 'all' || position === 'top') {
    styles.paddingTop = 'env(safe-area-inset-top)';
  }
  if (position === 'all' || position === 'bottom') {
    styles.paddingBottom = 'env(safe-area-inset-bottom)';
  }
  if (position === 'all' || position === 'left') {
    styles.paddingLeft = 'env(safe-area-inset-left)';
  }
  if (position === 'all' || position === 'right') {
    styles.paddingRight = 'env(safe-area-inset-right)';
  }
  
  return styles;
};

/**
 * Optimizes images for mobile devices
 */
export const getOptimizedImageProps = (src: string, alt: string) => {
  return {
    src,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    style: {
      maxWidth: '100%',
      height: 'auto',
    },
  };
};

/**
 * Handles orientation changes
 */
export const handleOrientationChange = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const handleChange = () => {
    // Small delay to ensure viewport dimensions are updated
    setTimeout(callback, 100);
  };
  
  window.addEventListener('orientationchange', handleChange);
  window.addEventListener('resize', handleChange);
  
  return () => {
    window.removeEventListener('orientationchange', handleChange);
    window.removeEventListener('resize', handleChange);
  };
};

/**
 * Prevents body scroll (useful for modals on mobile)
 */
export const preventBodyScroll = (prevent: boolean): void => {
  if (typeof document === 'undefined') return;
  
  if (prevent) {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  } else {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }
};

/**
 * Optimizes form validation for mobile
 */
export const getMobileValidationProps = () => {
  return {
    // Disable browser validation on mobile for better UX
    noValidate: isMobileViewport(),
    // Use appropriate input modes
    inputMode: 'text' as const,
    autoComplete: 'off',
    autoCorrect: 'off',
    autoCapitalize: 'off',
    spellCheck: false,
  };
};

/**
 * Gets appropriate grid classes for responsive design
 */
export const getResponsiveGridClasses = (
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3
): string => {
  return `grid grid-cols-${mobile} sm:grid-cols-${tablet} lg:grid-cols-${desktop} gap-4 sm:gap-6`;
};

/**
 * Performance optimization for mobile
 */
export const optimizeForMobile = () => {
  if (typeof document === 'undefined') return;
  
  // Add viewport meta tag if not present
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1, shrink-to-fit=no';
    document.head.appendChild(viewport);
  }
  
  // Add mobile-optimized meta tags
  const metaTags = [
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'format-detection', content: 'telephone=no' },
  ];
  
  metaTags.forEach(({ name, content }) => {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  });
};

/**
 * Accessibility helpers for mobile
 */
export const getMobileA11yProps = (role: string) => {
  const baseProps = {
    role,
    tabIndex: 0,
  };
  
  if (isTouchDevice()) {
    return {
      ...baseProps,
      // Enhanced touch accessibility
      'aria-describedby': 'touch-instructions',
    };
  }
  
  return baseProps;
};

export default {
  TOUCH_TARGETS,
  BREAKPOINTS,
  IOS_OPTIMIZATIONS,
  isTouchDevice,
  isIOS,
  isAndroid,
  getViewportWidth,
  isMobileViewport,
  isTabletViewport,
  getOptimalTouchTarget,
  getMobileClasses,
  getMobileStyles,
  getSafeAreaStyles,
  getOptimizedImageProps,
  handleOrientationChange,
  preventBodyScroll,
  getMobileValidationProps,
  getResponsiveGridClasses,
  optimizeForMobile,
  getMobileA11yProps,
};