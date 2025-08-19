import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

export interface ScrollAnimationConfig {
  /** Intersection threshold (0-1) for triggering animation */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Whether animation should trigger only once */
  triggerOnce?: boolean;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Disable animations entirely */
  disabled?: boolean;
  /** Custom intersection observer options */
  observerOptions?: Omit<IntersectionObserverInit, 'threshold' | 'rootMargin'>;
}

export interface ScrollAnimationState {
  /** Whether element is currently visible in viewport */
  isVisible: boolean;
  /** Whether animation has been triggered */
  hasTriggered: boolean;
  /** Animation progress (0-1) */
  progress: number;
}

export interface ScrollAnimationReturn extends ScrollAnimationState {
  /** Ref to attach to the animated element */
  ref: React.RefObject<HTMLElement>;
  /** Whether animations should be active */
  shouldAnimate: boolean;
}

/**
 * Production-grade scroll animation hook with intersection observer optimization
 * Handles reduced motion, performance throttling, and accessibility compliance
 */
export function useScrollAnimation(config: ScrollAnimationConfig = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    delay = 0,
    disabled = false
  } = config;

  const elementRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<ScrollAnimationState>({
    isVisible: false,
    hasTriggered: false,
    progress: 0
  });

  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !disabled && !prefersReducedMotion;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !shouldAnimate) {
      // Immediate visibility for accessibility and reduced motion
      if (!shouldAnimate) {
        setState({
          isVisible: true,
          hasTriggered: true,
          progress: 1
        });
      }
      return;
    }

    // Performance monitoring
    const startTime = performance.now();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          const progress = Math.min(entry.intersectionRatio / threshold, 1);

          setState(prevState => {
            const newState = {
              isVisible: isIntersecting,
              hasTriggered: prevState.hasTriggered || isIntersecting,
              progress: isIntersecting ? progress : (triggerOnce && prevState.hasTriggered ? 1 : 0)
            };

            // Apply delay if specified
            if (delay > 0 && isIntersecting && !prevState.hasTriggered) {
              setTimeout(() => {
                setState(current => ({
                  ...current,
                  hasTriggered: true
                }));
              }, delay);
              return { ...newState, hasTriggered: false };
            }

            return newState;
          });
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      
      // Performance logging for production monitoring
      const endTime = performance.now();
      if (endTime - startTime > 16.67) { // > 1 frame at 60fps
        console.warn(`ScrollAnimation performance warning: ${endTime - startTime}ms`);
      }
    };
  }, [threshold, rootMargin, triggerOnce, delay, shouldAnimate]);

  return {
    ref: elementRef,
    ...state,
    shouldAnimate
  } as ScrollAnimationReturn;
}

/**
 * High-performance scroll progress tracking for enterprise applications
 * Optimized for smooth 60fps performance with requestAnimationFrame throttling
 */
export function useScrollProgress(config: { threshold?: number } = {}) {
  const { threshold = 0 } = config;
  const elementRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion) {
      setProgress(1);
      return;
    }

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the element has been scrolled past
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Progress from 0 to 1 as element scrolls through viewport
      let scrollProgress = 0;
      
      if (elementTop < windowHeight && elementTop + elementHeight > 0) {
        const visibleHeight = Math.min(windowHeight - elementTop, elementHeight);
        scrollProgress = Math.max(0, visibleHeight / elementHeight);
      } else if (elementTop + elementHeight <= 0) {
        scrollProgress = 1;
      }
      
      setProgress(Math.min(scrollProgress, 1));
    };

    // Initial calculation
    handleScroll();

    // Throttled scroll listener for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [threshold, prefersReducedMotion]);

  return {
    ref: elementRef,
    progress,
    shouldAnimate: !prefersReducedMotion
  };
}