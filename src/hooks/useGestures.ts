'use client';

import { useRef, useCallback, useEffect } from 'react';

export interface GestureState {
  isActive: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  distance: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  velocity: number;
  timestamp: number;
}

export interface SwipeOptions {
  threshold?: number;
  velocityThreshold?: number;
  onSwipeLeft?: (state: GestureState) => void;
  onSwipeRight?: (state: GestureState) => void;
  onSwipeUp?: (state: GestureState) => void;
  onSwipeDown?: (state: GestureState) => void;
  onSwipeStart?: (state: GestureState) => void;
  onSwipeMove?: (state: GestureState) => void;
  onSwipeEnd?: (state: GestureState) => void;
}

export interface PinchOptions {
  threshold?: number;
  onPinchStart?: (scale: number) => void;
  onPinchMove?: (scale: number) => void;
  onPinchEnd?: (scale: number) => void;
}

export interface LongPressOptions {
  delay?: number;
  threshold?: number;
  onLongPress?: (event: TouchEvent | MouseEvent) => void;
  onLongPressStart?: (event: TouchEvent | MouseEvent) => void;
  onLongPressEnd?: (event: TouchEvent | MouseEvent) => void;
}

/**
 * Hook for handling swipe gestures
 */
export function useSwipeGesture(options: SwipeOptions = {}) {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeStart,
    onSwipeMove,
    onSwipeEnd,
  } = options;

  const gestureState = useRef<GestureState>({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    distance: 0,
    direction: null,
    velocity: 0,
    timestamp: 0,
  });

  const startTimeRef = useRef<number>(0);

  const getEventCoordinates = (event: TouchEvent | MouseEvent) => {
    if ('touches' in event) {
      return {
        x: event.touches[0]?.clientX || 0,
        y: event.touches[0]?.clientY || 0,
      };
    }
    return {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const updateGestureState = (x: number, y: number) => {
    const state = gestureState.current;
    state.currentX = x;
    state.currentY = y;
    state.deltaX = x - state.startX;
    state.deltaY = y - state.startY;
    state.distance = Math.sqrt(state.deltaX ** 2 + state.deltaY ** 2);
    
    // Calculate direction
    if (Math.abs(state.deltaX) > Math.abs(state.deltaY)) {
      state.direction = state.deltaX > 0 ? 'right' : 'left';
    } else {
      state.direction = state.deltaY > 0 ? 'down' : 'up';
    }

    // Calculate velocity
    const timeDelta = Date.now() - startTimeRef.current;
    state.velocity = timeDelta > 0 ? state.distance / timeDelta : 0;
    state.timestamp = Date.now();
  };

  const handleStart = useCallback((event: TouchEvent | MouseEvent) => {
    const { x, y } = getEventCoordinates(event);
    
    gestureState.current = {
      isActive: true,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      direction: null,
      velocity: 0,
      timestamp: Date.now(),
    };

    startTimeRef.current = Date.now();
    onSwipeStart?.(gestureState.current);
  }, [onSwipeStart]);

  const handleMove = useCallback((event: TouchEvent | MouseEvent) => {
    if (!gestureState.current.isActive) return;

    const { x, y } = getEventCoordinates(event);
    updateGestureState(x, y);
    onSwipeMove?.(gestureState.current);
  }, [onSwipeMove]);

  const handleEnd = useCallback((event: TouchEvent | MouseEvent) => {
    if (!gestureState.current.isActive) return;

    const state = gestureState.current;
    state.isActive = false;

    // Check if swipe meets threshold requirements
    if (state.distance >= threshold || state.velocity >= velocityThreshold) {
      switch (state.direction) {
        case 'left':
          onSwipeLeft?.(state);
          break;
        case 'right':
          onSwipeRight?.(state);
          break;
        case 'up':
          onSwipeUp?.(state);
          break;
        case 'down':
          onSwipeDown?.(state);
          break;
      }
    }

    onSwipeEnd?.(state);
  }, [threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipeEnd]);

  const handlers = {
    onTouchStart: handleStart,
    onTouchMove: handleMove,
    onTouchEnd: handleEnd,
    onMouseDown: handleStart,
    onMouseMove: handleMove,
    onMouseUp: handleEnd,
  };

  return {
    handlers,
    gestureState: gestureState.current,
  };
}

/**
 * Hook for handling pinch/zoom gestures
 */
export function usePinchGesture(options: PinchOptions = {}) {
  const {
    threshold = 0.1,
    onPinchStart,
    onPinchMove,
    onPinchEnd,
  } = options;

  const initialDistance = useRef<number>(0);
  const currentScale = useRef<number>(1);
  const isActive = useRef<boolean>(false);

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 2) {
      const distance = getDistance(event.touches[0], event.touches[1]);
      initialDistance.current = distance;
      currentScale.current = 1;
      isActive.current = true;
      onPinchStart?.(1);
    }
  }, [onPinchStart]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isActive.current || event.touches.length !== 2) return;

    const distance = getDistance(event.touches[0], event.touches[1]);
    const scale = distance / initialDistance.current;
    
    if (Math.abs(scale - currentScale.current) >= threshold) {
      currentScale.current = scale;
      onPinchMove?.(scale);
    }
  }, [threshold, onPinchMove]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (isActive.current && event.touches.length < 2) {
      isActive.current = false;
      onPinchEnd?.(currentScale.current);
    }
  }, [onPinchEnd]);

  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return {
    handlers,
    scale: currentScale.current,
    isActive: isActive.current,
  };
}

/**
 * Hook for handling long press gestures
 */
export function useLongPress(options: LongPressOptions = {}) {
  const {
    delay = 500,
    threshold = 10,
    onLongPress,
    onLongPressStart,
    onLongPressEnd,
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const startPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isLongPressing = useRef<boolean>(false);

  const getEventCoordinates = (event: TouchEvent | MouseEvent) => {
    if ('touches' in event) {
      return {
        x: event.touches[0]?.clientX || 0,
        y: event.touches[0]?.clientY || 0,
      };
    }
    return {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const clearLongPressTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const handleStart = useCallback((event: TouchEvent | MouseEvent) => {
    const { x, y } = getEventCoordinates(event);
    startPosition.current = { x, y };
    isLongPressing.current = false;

    timeoutRef.current = setTimeout(() => {
      isLongPressing.current = true;
      onLongPressStart?.(event);
      onLongPress?.(event);
    }, delay);
  }, [delay, onLongPress, onLongPressStart]);

  const handleMove = useCallback((event: TouchEvent | MouseEvent) => {
    if (!timeoutRef.current) return;

    const { x, y } = getEventCoordinates(event);
    const distance = Math.sqrt(
      (x - startPosition.current.x) ** 2 + (y - startPosition.current.y) ** 2
    );

    if (distance > threshold) {
      clearLongPressTimeout();
      if (isLongPressing.current) {
        isLongPressing.current = false;
        onLongPressEnd?.(event);
      }
    }
  }, [threshold, clearLongPressTimeout, onLongPressEnd]);

  const handleEnd = useCallback((event: TouchEvent | MouseEvent) => {
    clearLongPressTimeout();
    if (isLongPressing.current) {
      isLongPressing.current = false;
      onLongPressEnd?.(event);
    }
  }, [clearLongPressTimeout, onLongPressEnd]);

  useEffect(() => {
    return () => {
      clearLongPressTimeout();
    };
  }, [clearLongPressTimeout]);

  const handlers = {
    onTouchStart: handleStart,
    onTouchMove: handleMove,
    onTouchEnd: handleEnd,
    onMouseDown: handleStart,
    onMouseMove: handleMove,
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
  };

  return {
    handlers,
    isLongPressing: isLongPressing.current,
  };
}

/**
 * Hook for handling pull-to-refresh gesture
 */
export function usePullToRefresh(onRefresh: () => void | Promise<void>, threshold = 80) {
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isRefreshing = useRef<boolean>(false);
  const isPulling = useRef<boolean>(false);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = event.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isPulling.current || isRefreshing.current) return;

    currentY.current = event.touches[0].clientY;
    const pullDistance = currentY.current - startY.current;

    if (pullDistance > 0 && window.scrollY === 0) {
      event.preventDefault();
      
      // Add visual feedback based on pull distance
      const element = event.currentTarget as HTMLElement;
      if (element) {
        element.style.transform = `translateY(${Math.min(pullDistance * 0.5, threshold)}px)`;
        
        if (pullDistance > threshold) {
          element.classList.add('pull-refresh-ready');
        } else {
          element.classList.remove('pull-refresh-ready');
        }
      }
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(async (event: TouchEvent) => {
    if (!isPulling.current || isRefreshing.current) return;

    const pullDistance = currentY.current - startY.current;
    const element = event.currentTarget as HTMLElement;

    if (pullDistance > threshold) {
      isRefreshing.current = true;
      element?.classList.add('refreshing');
      
      try {
        await onRefresh();
      } finally {
        isRefreshing.current = false;
        element?.classList.remove('refreshing', 'pull-refresh-ready');
        if (element) {
          element.style.transform = '';
        }
      }
    } else {
      element?.classList.remove('pull-refresh-ready');
      if (element) {
        element.style.transform = '';
      }
    }

    isPulling.current = false;
  }, [threshold, onRefresh]);

  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return {
    handlers,
    isRefreshing: isRefreshing.current,
    isPulling: isPulling.current,
  };
}

/**
 * Hook for haptic feedback
 */
export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50,
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const triggerSelectionHaptic = useCallback(() => {
    // iOS-specific haptic feedback
    if ('Taptic' in window) {
      (window as any).Taptic.selection();
    } else {
      triggerHaptic('light');
    }
  }, [triggerHaptic]);

  const triggerImpactHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    // iOS-specific haptic feedback
    if ('Taptic' in window) {
      (window as any).Taptic.impact(intensity);
    } else {
      triggerHaptic(intensity);
    }
  }, [triggerHaptic]);

  const triggerNotificationHaptic = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    // iOS-specific haptic feedback
    if ('Taptic' in window) {
      (window as any).Taptic.notification(type);
    } else {
      const patterns = {
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [50, 100, 50, 100, 50],
      };
      if ('vibrate' in navigator) {
        navigator.vibrate(patterns[type]);
      }
    }
  }, []);

  return {
    triggerHaptic,
    triggerSelectionHaptic,
    triggerImpactHaptic,
    triggerNotificationHaptic,
  };
}