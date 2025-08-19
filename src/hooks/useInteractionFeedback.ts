'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface InteractionState {
  isHovered: boolean;
  isFocused: boolean;
  isPressed: boolean;
  isLoading: boolean;
  isDisabled: boolean;
}

export interface InteractionFeedbackOptions {
  disabled?: boolean;
  loading?: boolean;
  onHover?: (isHovered: boolean) => void;
  onFocus?: (isFocused: boolean) => void;
  onPress?: (isPressed: boolean) => void;
  hapticFeedback?: boolean;
}

export interface InteractionHandlers {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
}

/**
 * Hook for managing interaction states and providing consistent feedback
 * across all interactive elements in the Arena Fund application
 */
export function useInteractionFeedback(options: InteractionFeedbackOptions = {}) {
  const {
    disabled = false,
    loading = false,
    onHover,
    onFocus,
    onPress,
    hapticFeedback = false,
  } = options;

  const [state, setState] = useState<InteractionState>({
    isHovered: false,
    isFocused: false,
    isPressed: false,
    isLoading: loading,
    isDisabled: disabled,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update loading and disabled states when props change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      isDisabled: disabled,
    }));
  }, [loading, disabled]);

  // Provide haptic feedback on supported devices
  const triggerHapticFeedback = useCallback(() => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Very short vibration
    }
  }, [hapticFeedback]);

  const handleMouseEnter = useCallback(() => {
    if (disabled || loading) return;
    
    setState(prev => ({ ...prev, isHovered: true }));
    onHover?.(true);
  }, [disabled, loading, onHover]);

  const handleMouseLeave = useCallback(() => {
    if (disabled || loading) return;
    
    setState(prev => ({ 
      ...prev, 
      isHovered: false, 
      isPressed: false // Reset pressed state when mouse leaves
    }));
    onHover?.(false);
    onPress?.(false);
  }, [disabled, loading, onHover, onPress]);

  const handleFocus = useCallback(() => {
    if (disabled || loading) return;
    
    setState(prev => ({ ...prev, isFocused: true }));
    onFocus?.(true);
  }, [disabled, loading, onFocus]);

  const handleBlur = useCallback(() => {
    if (disabled || loading) return;
    
    setState(prev => ({ 
      ...prev, 
      isFocused: false,
      isPressed: false // Reset pressed state when focus is lost
    }));
    onFocus?.(false);
    onPress?.(false);
  }, [disabled, loading, onFocus, onPress]);

  const handleMouseDown = useCallback(() => {
    if (disabled || loading) return;
    
    setState(prev => ({ ...prev, isPressed: true }));
    onPress?.(true);
    triggerHapticFeedback();
  }, [disabled, loading, onPress, triggerHapticFeedback]);

  const handleMouseUp = useCallback(() => {
    if (disabled || loading) return;
    
    setState(prev => ({ ...prev, isPressed: false }));
    onPress?.(false);
  }, [disabled, loading, onPress]);

  const handleTouchStart = useCallback(() => {
    if (disabled || loading) return;
    
    setState(prev => ({ ...prev, isPressed: true }));
    onPress?.(true);
    triggerHapticFeedback();
  }, [disabled, loading, onPress, triggerHapticFeedback]);

  const handleTouchEnd = useCallback(() => {
    if (disabled || loading) return;
    
    // Delay the reset to allow for visual feedback
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isPressed: false }));
      onPress?.(false);
    }, 150);
  }, [disabled, loading, onPress]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlers: InteractionHandlers = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };

  return {
    state,
    handlers,
  };
}

/**
 * Hook for managing loading states with automatic timeout
 */
export function useLoadingState(initialLoading = false, timeout = 30000) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startLoading = useCallback(() => {
    setIsLoading(true);
    
    // Auto-timeout loading state
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, timeout);
  }, [timeout]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
}

/**
 * Hook for managing form field feedback states
 */
export function useFieldFeedback() {
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning' | null;
    message: string;
    timestamp: number;
  }>({
    type: null,
    message: '',
    timestamp: 0,
  });

  const showSuccess = useCallback((message: string) => {
    setFeedback({
      type: 'success',
      message,
      timestamp: Date.now(),
    });
  }, []);

  const showError = useCallback((message: string) => {
    setFeedback({
      type: 'error',
      message,
      timestamp: Date.now(),
    });
  }, []);

  const showWarning = useCallback((message: string) => {
    setFeedback({
      type: 'warning',
      message,
      timestamp: Date.now(),
    });
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback({
      type: null,
      message: '',
      timestamp: 0,
    });
  }, []);

  return {
    feedback,
    showSuccess,
    showError,
    showWarning,
    clearFeedback,
  };
}

/**
 * Hook for managing hover card states with delay
 */
export function useHoverCard(delay = 300) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showCard = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const hideCard = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isVisible,
    showCard,
    hideCard,
  };
}

/**
 * Hook for managing ripple effect animations
 */
export function useRippleEffect() {
  const [ripples, setRipples] = useState<Array<{
    id: number;
    x: number;
    y: number;
    timestamp: number;
  }>>([]);

  const createRipple = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      timestamp: Date.now(),
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, []);

  return {
    ripples,
    createRipple,
  };
}