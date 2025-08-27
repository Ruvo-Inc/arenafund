/**
 * Interaction feedback hooks for enhanced user experience
 * Provides haptic feedback, ripple effects, and interaction states
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface InteractionState {
  isPressed: boolean;
  isHovered: boolean;
  isFocused: boolean;
  isLoading: boolean;
  isDisabled: boolean;
}

interface InteractionHandlers {
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
}

interface UseInteractionFeedbackOptions {
  disabled?: boolean;
  loading?: boolean;
  hapticFeedback?: boolean;
  longPressAction?: () => void;
  longPressDuration?: number;
}

export function useInteractionFeedback({
  disabled = false,
  loading = false,
  hapticFeedback = false,
  longPressAction,
  longPressDuration = 500,
}: UseInteractionFeedbackOptions = {}) {
  const [state, setState] = useState<InteractionState>({
    isPressed: false,
    isHovered: false,
    isFocused: false,
    isLoading: loading,
    isDisabled: disabled,
  });

  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  // Update state when props change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      isDisabled: disabled,
    }));
  }, [loading, disabled]);

  // Haptic feedback function
  const triggerHapticFeedback = useCallback(() => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [hapticFeedback]);

  // Mouse handlers
  const handleMouseDown = useCallback(() => {
    if (disabled || loading) return;
    
    setState(prev => ({ ...prev, isPressed: true }));
    triggerHapticFeedback();

    // Start long press timer
    if (longPressAction) {
      isLongPressTriggeredRef.current = false;
      longPressTimeoutRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        longPressAction();
        triggerHapticFeedback();
      }, longPressDuration);
    }
  }, [disabled, loading, longPressAction, longPressDuration, triggerHapticFeedback]);

  const handleMouseUp = useCallback(() => {
    setState(prev => ({ ...prev, isPressed: false }));
    
    // Clear long press timer
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (disabled || loading) return;
    setState(prev => ({ ...prev, isHovered: true }));
  }, [disabled, loading]);

  const handleMouseLeave = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isHovered: false, 
      isPressed: false 
    }));
    
    // Clear long press timer
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  // Focus handlers
  const handleFocus = useCallback(() => {
    if (disabled || loading) return;
    setState(prev => ({ ...prev, isFocused: true }));
  }, [disabled, loading]);

  const handleBlur = useCallback(() => {
    setState(prev => ({ ...prev, isFocused: false }));
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback(() => {
    if (disabled || loading) return;
    
    setState(prev => ({ ...prev, isPressed: true }));
    triggerHapticFeedback();

    // Start long press timer for touch
    if (longPressAction) {
      isLongPressTriggeredRef.current = false;
      longPressTimeoutRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        longPressAction();
        triggerHapticFeedback();
      }, longPressDuration);
    }
  }, [disabled, loading, longPressAction, longPressDuration, triggerHapticFeedback]);

  const handleTouchEnd = useCallback(() => {
    setState(prev => ({ ...prev, isPressed: false }));
    
    // Clear long press timer
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  const handlers: InteractionHandlers = {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };

  return {
    state,
    handlers,
    isLongPressTriggered: isLongPressTriggeredRef.current,
  };
}

// Ripple effect hook
export function useRippleEffect() {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const createRipple = useCallback((event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    const newRipple = {
      id: Date.now(),
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, []);

  return {
    ripples,
    createRipple,
  };
}

export function useHoverCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handlers = {
    onMouseEnter: useCallback(() => setIsHovered(true), []),
    onMouseLeave: useCallback(() => setIsHovered(false), []),
    onMouseMove: useCallback((event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }, []),
  };

  return { isHovered, position, handlers };
}

export function useLoadingState(isLoading: boolean) {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isLoading) {
      timeout = setTimeout(() => setShowSpinner(true), 200);
    } else {
      setShowSpinner(false);
    }

    return () => clearTimeout(timeout);
  }, [isLoading]);

  return { showSpinner };
}

export function useFieldFeedback() {
  const [fieldState, setFieldState] = useState({
    isValid: true,
    isDirty: false,
    isTouched: false,
  });

  const setValid = useCallback((valid: boolean) => {
    setFieldState(prev => ({ ...prev, isValid: valid }));
  }, []);

  const setDirty = useCallback(() => {
    setFieldState(prev => ({ ...prev, isDirty: true }));
  }, []);

  const setTouched = useCallback(() => {
    setFieldState(prev => ({ ...prev, isTouched: true }));
  }, []);

  return { fieldState, setValid, setDirty, setTouched };
}