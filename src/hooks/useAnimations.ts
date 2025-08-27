/**
 * Animation hooks for Arena Fund components
 * Provides reusable animation utilities with reduced motion support
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Hook for count-up animations
 */
export function useCountUp(
  end: number,
  duration: number = 2000,
  start: number = 0
) {
  const [count, setCount] = useState(start);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(end);
      return;
    }

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = start + (end - start) * easeOutQuart;
      
      setCount(Math.floor(currentCount));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, start, prefersReducedMotion]);

  return count;
}

/**
 * Hook for staggered animations
 */
export function useStaggeredAnimation(
  itemCount: number,
  delay: number = 100
) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );
  const prefersReducedMotion = useReducedMotion();

  const startAnimation = useCallback(() => {
    if (prefersReducedMotion) {
      setVisibleItems(new Array(itemCount).fill(true));
      return;
    }

    setVisibleItems(new Array(itemCount).fill(false));
    
    for (let i = 0; i < itemCount; i++) {
      setTimeout(() => {
        setVisibleItems(prev => {
          const newState = [...prev];
          newState[i] = true;
          return newState;
        });
      }, i * delay);
    }
  }, [itemCount, delay, prefersReducedMotion]);

  return { visibleItems, startAnimation };
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, prefersReducedMotion]);

  return { ref, isVisible };
}

/**
 * Hook for focus animations
 */
export function useFocusAnimation() {
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const focusProps = {
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    className: prefersReducedMotion 
      ? '' 
      : `transition-all duration-200 ${isFocused ? 'scale-105 shadow-lg' : ''}`
  };

  return { isFocused, focusProps };
}

/**
 * Hook for loading state animations
 */
export function useLoadingState(isLoading: boolean) {
  const [showSpinner, setShowSpinner] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isLoading) {
      // Delay showing spinner to avoid flash for quick operations
      timeout = setTimeout(() => setShowSpinner(true), 200);
    } else {
      setShowSpinner(false);
    }

    return () => clearTimeout(timeout);
  }, [isLoading]);

  const spinnerClass = prefersReducedMotion 
    ? 'opacity-50' 
    : 'animate-spin opacity-50';

  return { showSpinner, spinnerClass };
}

/**
 * Hook for progress bar animations
 */
export function useProgressBar(progress: number, duration: number = 1000) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedProgress(progress);
      return;
    }

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - elapsed, 3);
      setAnimatedProgress(progress * easeOutCubic);
      
      if (elapsed < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [progress, duration, prefersReducedMotion]);

  return animatedProgress;
}

/**
 * Hook for hover animations
 */
export function useHoverAnimation() {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    className: prefersReducedMotion 
      ? '' 
      : `transition-transform duration-200 ${isHovered ? 'scale-105' : ''}`
  };

  return { isHovered, hoverProps };
}