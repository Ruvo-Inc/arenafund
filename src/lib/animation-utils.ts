/**
 * Animation utilities for the homepage redesign integration
 * Centralized utilities for consistent animations across components
 */

import { Variants, Transition } from 'framer-motion';
import { easings, transitions } from './animation-config';

/**
 * Creates a hover animation variant for interactive elements
 */
export function createHoverVariant(
  scale = 1.05,
  duration = 0.2
): { whileHover: any; whileTap: any } {
  return {
    whileHover: {
      scale,
      transition: { duration, ease: easings.easeOut },
    },
    whileTap: {
      scale: scale * 0.95,
      transition: { duration: 0.1, ease: easings.easeOut },
    },
  };
}

/**
 * Creates a loading animation variant
 */
export function createLoadingVariant(): Variants {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: transitions.default,
    },
    loading: {
      opacity: 0.6,
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: easings.easeInOut,
      },
    },
  };
}

/**
 * Creates a slide animation for navigation elements
 */
export function createSlideVariant(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance = 100
): Variants {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: -distance };
      case 'down':
        return { y: distance };
      case 'left':
        return { x: -distance };
      case 'right':
        return { x: distance };
      default:
        return { y: -distance };
    }
  };

  return {
    initial: {
      opacity: 0,
      ...getInitialPosition(),
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: transitions.default,
    },
    exit: {
      opacity: 0,
      ...getInitialPosition(),
      transition: transitions.fast,
    },
  };
}

/**
 * Creates a gradient text animation
 */
export function createGradientTextAnimation(): any {
  return {
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  };
}

/**
 * Creates a floating animation for background elements
 */
export function createFloatingAnimation(
  intensity = 10,
  duration = 4
): any {
  return {
    animate: {
      y: [-intensity, intensity, -intensity],
      x: [-intensity / 2, intensity / 2, -intensity / 2],
    },
    transition: {
      duration,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  };
}

/**
 * Creates a pulse animation for status indicators
 */
export function createPulseAnimation(): any {
  return {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.8, 1],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  };
}

/**
 * Creates a typewriter effect animation
 */
export function createTypewriterVariant(text: string): Variants {
  return {
    initial: { width: 0 },
    animate: {
      width: 'auto',
      transition: {
        duration: text.length * 0.1,
        ease: easings.easeOut,
      },
    },
  };
}

/**
 * Creates a reveal animation for images
 */
export function createImageRevealVariant(): Variants {
  return {
    initial: {
      opacity: 0,
      scale: 1.1,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: easings.easeOut,
      },
    },
  };
}

/**
 * Utility to combine multiple animation variants
 */
export function combineVariants(...variants: Variants[]): Variants {
  return variants.reduce((combined, variant) => {
    Object.keys(variant).forEach((key) => {
      if (combined[key]) {
        combined[key] = { ...combined[key], ...variant[key] };
      } else {
        combined[key] = variant[key];
      }
    });
    return combined;
  }, {});
}

/**
 * Performance-optimized animation settings
 */
export const performanceSettings = {
  // Reduce animations on lower-end devices
  reducedMotion: {
    duration: 0,
    ease: 'linear',
  },
  // Optimize for 60fps
  optimized: {
    duration: 0.3,
    ease: easings.easeOut,
  },
  // Full animations for high-performance devices
  full: {
    duration: 0.8,
    ease: easings.easeOut,
  },
};

/**
 * Detects device performance capability
 */
export function getPerformanceLevel(): 'low' | 'medium' | 'high' {
  if (typeof window === 'undefined') return 'medium';
  
  // Simple heuristic based on hardware concurrency and memory
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;
  
  if (cores >= 8 && memory >= 8) return 'high';
  if (cores >= 4 && memory >= 4) return 'medium';
  return 'low';
}