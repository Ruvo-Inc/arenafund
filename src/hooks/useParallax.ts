import { useState, useEffect, useCallback, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

export interface ParallaxConfig {
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  offset?: number;
  enableOnMobile?: boolean;
}

export interface ParallaxState {
  offset: number;
  progress: number;
  isInView: boolean;
  ref: React.RefObject<HTMLElement | null>;
  transform: string;
  shouldAnimate: boolean;
}

export function useParallax(config: ParallaxConfig = {}): ParallaxState {
  const {
    speed = 0.5,
    direction = 'up',
    easing = 'linear',
    offset = 0,
    enableOnMobile = true,
  } = config;

  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<ParallaxState>({
    offset: 0,
    progress: 0,
    isInView: false,
    ref,
    transform: 'translate3d(0, 0, 0)',
    shouldAnimate: !prefersReducedMotion && enableOnMobile,
  });

  const handleScroll = useCallback(() => {
    if (prefersReducedMotion || !enableOnMobile) {
      setState(prev => ({ 
        ...prev, 
        offset: 0, 
        progress: 0, 
        isInView: true,
        transform: 'translate3d(0, 0, 0)',
        shouldAnimate: false,
      }));
      return;
    }

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Calculate progress (0 to 1)
    const progress = Math.max(0, Math.min(1, scrollY / (documentHeight - windowHeight)));
    
    // Calculate offset based on direction and speed
    let calculatedOffset = 0;
    switch (direction) {
      case 'up':
        calculatedOffset = -scrollY * speed;
        break;
      case 'down':
        calculatedOffset = scrollY * speed;
        break;
      case 'left':
        calculatedOffset = -scrollY * speed;
        break;
      case 'right':
        calculatedOffset = scrollY * speed;
        break;
    }

    // Apply easing
    let easedOffset = calculatedOffset;
    switch (easing) {
      case 'ease-in':
        easedOffset = calculatedOffset * progress;
        break;
      case 'ease-out':
        easedOffset = calculatedOffset * (1 - Math.pow(1 - progress, 3));
        break;
      case 'ease-in-out':
        easedOffset = calculatedOffset * (progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2);
        break;
      default:
        easedOffset = calculatedOffset;
    }

    const finalOffset = easedOffset + offset;
    const transform = `translate3d(0, ${finalOffset}px, 0)`;

    setState(prev => ({
      ...prev,
      offset: finalOffset,
      progress,
      isInView: true,
      transform,
      shouldAnimate: true,
    }));
  }, [speed, direction, easing, offset, prefersReducedMotion, enableOnMobile]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return state;
}

export interface MultiLayerParallaxConfig {
  layers: Array<{
    speed?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
    offset?: number;
  }>;
}

export function useMultiLayerParallax(config: MultiLayerParallaxConfig) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const [layerStates, setLayerStates] = useState<ParallaxState[]>([]);

  const handleScroll = useCallback(() => {
    if (prefersReducedMotion) {
      setLayerStates(config.layers.map(() => ({ 
        offset: 0, 
        progress: 0, 
        isInView: true,
        ref: containerRef,
        transform: 'translate3d(0, 0, 0)',
        shouldAnimate: false,
      })));
      return;
    }

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const progress = Math.max(0, Math.min(1, scrollY / (documentHeight - windowHeight)));

    const newLayerStates = config.layers.map(layer => {
      let calculatedOffset = 0;
      const speed = layer.speed || 0.5;
      switch (layer.direction || 'up') {
        case 'up':
          calculatedOffset = -scrollY * speed;
          break;
        case 'down':
          calculatedOffset = scrollY * speed;
          break;
        case 'left':
          calculatedOffset = -scrollY * speed;
          break;
        case 'right':
          calculatedOffset = scrollY * speed;
          break;
      }

      // Apply easing
      let easedOffset = calculatedOffset;
      switch (layer.easing || 'linear') {
        case 'ease-in':
          easedOffset = calculatedOffset * progress;
          break;
        case 'ease-out':
          easedOffset = calculatedOffset * (1 - Math.pow(1 - progress, 3));
          break;
        case 'ease-in-out':
          easedOffset = calculatedOffset * (progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2);
          break;
        default:
          easedOffset = calculatedOffset;
      }

      const finalOffset = easedOffset + (layer.offset || 0);
      const transform = `translate3d(0, ${finalOffset}px, 0)`;

      return {
        offset: finalOffset,
        progress,
        isInView: true,
        ref: containerRef,
        transform,
        shouldAnimate: true,
      };
    });

    setLayerStates(newLayerStates);
  }, [config.layers, prefersReducedMotion]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return {
    containerRef,
    layerStates,
    shouldAnimate: !prefersReducedMotion,
  };
}
