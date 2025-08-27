import { useEffect, useState, useCallback } from 'react';
import {
  isTouchDevice,
  isIOS,
  isAndroid,
  getViewportWidth,
  isMobileViewport,
  isTabletViewport,
  handleOrientationChange,
  optimizeForMobile,
  BREAKPOINTS,
} from '@/lib/mobile-utils';

interface MobileOptimizationState {
  isTouchDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  viewportWidth: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  isOnline: boolean;
  connectionType: string;
}

interface MobileOptimizationOptions {
  enableOrientationTracking?: boolean;
  enableConnectionTracking?: boolean;
  enablePerformanceOptimizations?: boolean;
  debounceMs?: number;
}

/**
 * Comprehensive hook for mobile optimization and device detection
 */
export const useMobileOptimization = (options: MobileOptimizationOptions = {}) => {
  const {
    enableOrientationTracking = true,
    enableConnectionTracking = true,
    enablePerformanceOptimizations = true,
    debounceMs = 100,
  } = options;

  const [state, setState] = useState<MobileOptimizationState>(() => {
    if (typeof window === 'undefined') {
      return {
        isTouchDevice: false,
        isIOS: false,
        isAndroid: false,
        viewportWidth: BREAKPOINTS.DESKTOP,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        orientation: 'landscape',
        isOnline: true,
        connectionType: 'unknown',
      };
    }

    const width = getViewportWidth();
    return {
      isTouchDevice: isTouchDevice(),
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      viewportWidth: width,
      isMobile: isMobileViewport(),
      isTablet: isTabletViewport(),
      isDesktop: width >= BREAKPOINTS.DESKTOP,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      isOnline: navigator.onLine,
      connectionType: getConnectionType(),
    };
  });

  // Debounced update function
  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = getViewportWidth();
    setState(prev => ({
      ...prev,
      viewportWidth: width,
      isMobile: isMobileViewport(),
      isTablet: isTabletViewport(),
      isDesktop: width >= BREAKPOINTS.DESKTOP,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      isOnline: navigator.onLine,
      connectionType: getConnectionType(),
    }));
  }, []);

  // Debounced version of updateState
  const debouncedUpdateState = useCallback(() => {
    const timeoutId = setTimeout(updateState, debounceMs);
    return () => clearTimeout(timeoutId);
  }, [updateState, debounceMs]);

  // Initialize optimizations
  useEffect(() => {
    if (enablePerformanceOptimizations) {
      optimizeForMobile();
    }
  }, [enablePerformanceOptimizations]);

  // Handle orientation and resize changes
  useEffect(() => {
    if (!enableOrientationTracking) return;

    const cleanup = handleOrientationChange(updateState);
    return cleanup;
  }, [enableOrientationTracking, updateState]);

  // Handle connection changes
  useEffect(() => {
    if (!enableConnectionTracking || typeof window === 'undefined') return;

    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));
    const handleConnectionChange = () => setState(prev => ({ 
      ...prev, 
      connectionType: getConnectionType() 
    }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // @ts-ignore - Connection API is experimental
    if (navigator.connection) {
      // @ts-ignore
      navigator.connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      // @ts-ignore
      if (navigator.connection) {
        // @ts-ignore
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [enableConnectionTracking]);

  // Utility functions
  const getOptimalImageSize = useCallback((baseWidth: number) => {
    if (state.isMobile) return Math.min(baseWidth, state.viewportWidth - 32); // Account for padding
    if (state.isTablet) return Math.min(baseWidth, state.viewportWidth / 2);
    return baseWidth;
  }, [state.isMobile, state.isTablet, state.viewportWidth]);

  const shouldUseReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const getOptimalFontSize = useCallback((baseFontSize: number) => {
    if (state.isMobile && baseFontSize < 16) return 16; // Prevent iOS zoom
    return baseFontSize;
  }, [state.isMobile]);

  const shouldShowMobileUI = useCallback(() => {
    return state.isTouchDevice || state.isMobile;
  }, [state.isTouchDevice, state.isMobile]);

  const getGridColumns = useCallback((mobile: number, tablet: number, desktop: number) => {
    if (state.isMobile) return mobile;
    if (state.isTablet) return tablet;
    return desktop;
  }, [state.isMobile, state.isTablet]);

  const isSlowConnection = useCallback(() => {
    return state.connectionType === '2g' || state.connectionType === 'slow-2g';
  }, [state.connectionType]);

  const shouldPreloadImages = useCallback(() => {
    return !state.isMobile && !isSlowConnection() && state.isOnline;
  }, [state.isMobile, state.isOnline, isSlowConnection]);

  return {
    // State
    ...state,
    
    // Utility functions
    getOptimalImageSize,
    shouldUseReducedMotion,
    getOptimalFontSize,
    shouldShowMobileUI,
    getGridColumns,
    isSlowConnection,
    shouldPreloadImages,
    
    // Manual update function
    updateState,
  };
};

/**
 * Hook for mobile-specific form optimizations
 */
export const useMobileForm = () => {
  const { isMobile, isIOS, isAndroid, isTouchDevice } = useMobileOptimization();

  const getInputProps = useCallback((type: 'text' | 'email' | 'tel' | 'number' = 'text') => {
    const baseProps = {
      style: {
        fontSize: '16px', // Prevent iOS zoom
        WebkitTapHighlightColor: 'transparent',
      },
      autoComplete: 'off',
      autoCorrect: 'off',
      autoCapitalize: 'off',
      spellCheck: false,
    };

    // iOS-specific optimizations
    if (isIOS) {
      return {
        ...baseProps,
        inputMode: getInputMode(type),
      };
    }

    // Android-specific optimizations
    if (isAndroid) {
      return {
        ...baseProps,
        inputMode: getInputMode(type),
      };
    }

    return baseProps;
  }, [isIOS, isAndroid]);

  const getButtonProps = useCallback(() => {
    return {
      style: {
        fontSize: '16px',
        minHeight: '48px',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      },
      type: 'button' as const,
    };
  }, []);

  const getSelectProps = useCallback(() => {
    return {
      style: {
        fontSize: '16px', // Prevent iOS zoom
        minHeight: '48px',
        WebkitTapHighlightColor: 'transparent',
      },
    };
  }, []);

  return {
    isMobile,
    isIOS,
    isAndroid,
    isTouchDevice,
    getInputProps,
    getButtonProps,
    getSelectProps,
  };
};

/**
 * Hook for mobile navigation optimizations
 */
export const useMobileNavigation = () => {
  const { isMobile, orientation, viewportWidth } = useMobileOptimization();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Close menu on orientation change
  useEffect(() => {
    closeMenu();
  }, [orientation, closeMenu]);

  // Close menu when viewport becomes desktop
  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      closeMenu();
    }
  }, [isMobile, isMenuOpen, closeMenu]);

  const getNavProps = useCallback(() => {
    return {
      className: isMobile ? 'mobile-nav' : 'desktop-nav',
      'aria-label': 'Main navigation',
    };
  }, [isMobile]);

  const getMenuButtonProps = useCallback(() => {
    return {
      'aria-expanded': isMenuOpen,
      'aria-controls': 'mobile-menu',
      'aria-label': isMenuOpen ? 'Close menu' : 'Open menu',
      onClick: toggleMenu,
    };
  }, [isMenuOpen, toggleMenu]);

  return {
    isMobile,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    getNavProps,
    getMenuButtonProps,
  };
};

// Helper functions
function getConnectionType(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  
  // @ts-ignore - Connection API is experimental
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return 'unknown';
  
  return connection.effectiveType || connection.type || 'unknown';
}

function getInputMode(type: string): string {
  switch (type) {
    case 'email':
      return 'email';
    case 'tel':
      return 'tel';
    case 'number':
      return 'numeric';
    default:
      return 'text';
  }
}

export default useMobileOptimization;