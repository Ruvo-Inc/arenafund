/**
 * Animation configuration and utilities for the homepage redesign integration
 * Provides consistent animation settings and accessibility support
 */

import { Variants, Transition } from 'framer-motion';

// Animation configuration interface
export interface AnimationConfig {
  enableAnimations: boolean;
  respectReducedMotion: boolean;
  parallaxIntensity: number;
  staggerDelay: number;
  transitionDuration: number;
}

// Default animation configuration
export const defaultAnimationConfig: AnimationConfig = {
  enableAnimations: true,
  respectReducedMotion: true,
  parallaxIntensity: 0.5,
  staggerDelay: 0.1,
  transitionDuration: 0.8,
};

// Common easing curves
export const easings = {
  easeOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

// Common transition configurations
export const transitions = {
  default: {
    duration: 0.8,
    ease: easings.easeOut,
  },
  fast: {
    duration: 0.3,
    ease: easings.easeOut,
  },
  slow: {
    duration: 1.2,
    ease: easings.easeOut,
  },
  bounce: {
    duration: 0.6,
    ease: easings.bounce,
  },
} as const;

// Fade in up animation variant
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    y: -60,
    transition: transitions.fast,
  },
};

// Fade in animation variant
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

// Scale in animation variant
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: transitions.fast,
  },
};

// Slide in from left animation variant
export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: transitions.fast,
  },
};

// Slide in from right animation variant
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: transitions.fast,
  },
};

// Stagger container variant
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: defaultAnimationConfig.staggerDelay,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Utility function to create reduced motion variants
export function createReducedMotionVariant(
  normalVariant: Variants,
  reducedMotion: boolean
): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return normalVariant;
}

// Utility function to get transition with reduced motion support
export function getTransition(
  transition: Transition,
  reducedMotion: boolean
): Transition {
  if (reducedMotion) {
    return { duration: 0 };
  }
  return transition;
}