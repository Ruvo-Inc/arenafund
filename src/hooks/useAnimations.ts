/**
 * React hooks for animation utilities
 * 
 * React-specific hooks that work with the animation utilities system.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
// Animation utilities are now handled by individual hooks

// Hook for tracking reduced motion preference - moved to separate file
// Use the existing useReducedMotion hook instead

// Hook for scroll reveal animations - use useScrollAnimation instead

// Hook for count up animations - simplified version
export const useCountUp = (targetValue: number, duration: number = 2000) => {
  const elementRef = useRef<HTMLElement>(null);
  const [currentValue, setCurrentValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const start = useCallback(() => {
    const startTime = Date.now();
    const startValue = currentValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const newValue = startValue + (targetValue - startValue) * easedProgress;
      
      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration, currentValue]);

  // Set up intersection observer to trigger when visible
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          start();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, start]);

  return {
    ref: elementRef,
    value: Math.round(currentValue),
    start,
    isVisible
  };
};

// Hook for staggered animations
export const useStaggeredAnimation = (
  animationClass: string,
  delay: number = 100
) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isTriggered, setIsTriggered] = useState(false);

  const trigger = useCallback(() => {
    if (isTriggered) return;
    
    const container = containerRef.current;
    if (!container) return;

    const elements = container.children;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      Array.from(elements).forEach(element => {
        element.classList.add(animationClass);
      });
    } else {
      Array.from(elements).forEach((element, index) => {
        setTimeout(() => {
          element.classList.add(animationClass);
        }, index * delay);
      });
    }

    setIsTriggered(true);
  }, [animationClass, delay, isTriggered]);

  // Auto-trigger when container becomes visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trigger();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [trigger]);

  return {
    ref: containerRef,
    trigger,
    isTriggered
  };
};

// Hook for progress bar animations
export const useProgressBar = (targetPercentage: number, animated: boolean = true) => {
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!animated || reducedMotion) {
      setCurrentPercentage(targetPercentage);
      return;
    }

    // Animate to target percentage
    const duration = 1000; // 1 second
    const startTime = Date.now();
    const startPercentage = currentPercentage;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const newPercentage = startPercentage + (targetPercentage - startPercentage) * easedProgress;
      
      setCurrentPercentage(newPercentage);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetPercentage, animated, isVisible, currentPercentage]);

  const triggerAnimation = useCallback(() => {
    setIsVisible(true);
  }, []);

  return {
    percentage: currentPercentage,
    triggerAnimation,
    isVisible
  };
};

// Hook for intersection observer
export const useIntersectionObserver = (
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return elementRef;
};

// Hook for hover animations
export const useHoverAnimation = (
  effect: 'lift' | 'scale' | 'glow' | 'fade' = 'lift'
) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const effectClasses = {
      lift: 'hover-lift',
      scale: 'hover-scale',
      glow: 'hover-glow',
      fade: 'hover-fade'
    };

    element.classList.add(effectClasses[effect]);

    return () => {
      element.classList.remove(effectClasses[effect]);
    };
  }, [effect]);

  return elementRef;
};

// Hook for focus animations
export const useFocusAnimation = (
  effect: 'ring' | 'scale' = 'ring'
) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const effectClasses = {
      ring: 'focus-ring-animated',
      scale: 'focus-scale'
    };

    element.classList.add(effectClasses[effect]);

    return () => {
      element.classList.remove(effectClasses[effect]);
    };
  }, [effect]);

  return elementRef;
};

// Hook for loading states
export const useLoadingState = (isLoading: boolean) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      // Show loading immediately
      setShowLoading(true);
    } else {
      // Delay hiding loading to prevent flashing
      timeoutId = setTimeout(() => {
        setShowLoading(false);
      }, 150);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  return showLoading;
};