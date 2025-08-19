import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

export interface ParallaxConfig {
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  disabled?: boolean;
  rootMargin?: string;
  enableOnMobile?: boolean;
}

export interface ParallaxState {
  transform: string;
  isActive: boolean;
}

/**
 * Professional parallax system with advanced performance optimizations
 * Includes mobile detection, reduced motion support, and frame-rate optimization
 */
export function useParallax(config: ParallaxConfig = {}) {
  const {
    speed = 0.5,
    direction = 'up',
    disabled = false,
    rootMargin = '200px',
    enableOnMobile = false
  } = config;

  const elementRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<ParallaxState>({
    transform: 'translate3d(0, 0, 0)',
    isActive: false
  });

  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const shouldAnimate = !disabled && 
                       !prefersReducedMotion && 
                       (enableOnMobile || !isMobile);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !shouldAnimate) {
      setState({
        transform: 'translate3d(0, 0, 0)',
        isActive: false
      });
      return;
    }

    let isElementVisible = false;
    let animationFrameId: number;

    // Intersection Observer to track when element is in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isElementVisible = entry.isIntersecting;
          setState(prev => ({ ...prev, isActive: isElementVisible }));
        });
      },
      {
        rootMargin
      }
    );

    observer.observe(element);

    // Scroll handler with requestAnimationFrame for performance
    const handleScroll = () => {
      if (!isElementVisible) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress relative to viewport
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const scrollProgress = (viewportCenter - elementCenter) / windowHeight;
      
      // Apply speed multiplier
      const offset = scrollProgress * speed * 100;
      
      let transform = '';
      switch (direction) {
        case 'up':
          transform = `translate3d(0, ${-offset}px, 0)`;
          break;
        case 'down':
          transform = `translate3d(0, ${offset}px, 0)`;
          break;
        case 'left':
          transform = `translate3d(${-offset}px, 0, 0)`;
          break;
        case 'right':
          transform = `translate3d(${offset}px, 0, 0)`;
          break;
      }

      setState(prev => ({
        ...prev,
        transform
      }));
    };

    // Throttled scroll listener
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        animationFrameId = requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial calculation
    handleScroll();

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      observer.unobserve(element);
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [speed, direction, shouldAnimate, rootMargin]);

  return {
    ref: elementRef,
    ...state,
    shouldAnimate
  };
}

/**
 * Advanced multi-layer parallax system for complex visual compositions
 * Orchestrates multiple parallax layers with precision timing and performance monitoring
 */
export function useMultiLayerParallax(layers: ParallaxConfig[] = []) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const [layerStates, setLayerStates] = useState<ParallaxState[]>(
    layers.map(() => ({
      transform: 'translate3d(0, 0, 0)',
      isActive: false
    }))
  );

  const shouldAnimate = !prefersReducedMotion;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !shouldAnimate || layers.length === 0) {
      setLayerStates(layers.map(() => ({
        transform: 'translate3d(0, 0, 0)',
        isActive: false
      })));
      return;
    }

    let isContainerVisible = false;
    let animationFrameId: number;

    // Intersection Observer for container
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isContainerVisible = entry.isIntersecting;
        });
      },
      {
        rootMargin: '200px'
      }
    );

    observer.observe(container);

    const handleScroll = () => {
      if (!isContainerVisible) return;

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const scrollProgress = (viewportCenter - elementCenter) / windowHeight;

      const newStates = layers.map((layer, index) => {
        const speed = layer.speed || 0.5;
        const direction = layer.direction || 'up';
        const offset = scrollProgress * speed * 100;

        let transform = '';
        switch (direction) {
          case 'up':
            transform = `translate3d(0, ${-offset}px, 0)`;
            break;
          case 'down':
            transform = `translate3d(0, ${offset}px, 0)`;
            break;
          case 'left':
            transform = `translate3d(${-offset}px, 0, 0)`;
            break;
          case 'right':
            transform = `translate3d(${offset}px, 0, 0)`;
            break;
        }

        return {
          transform,
          isActive: isContainerVisible
        };
      });

      setLayerStates(newStates);
    };

    // Throttled scroll listener
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        animationFrameId = requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      observer.unobserve(container);
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [layers, shouldAnimate]);

  return {
    containerRef,
    layerStates,
    shouldAnimate
  };
}