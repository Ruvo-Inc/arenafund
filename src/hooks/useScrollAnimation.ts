import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';
import { useRef, useState, useEffect } from 'react';

interface ScrollAnimationOptions {
  inputRange?: [number, number];
  outputRange?: [number, number];
  clamp?: boolean;
  threshold?: number;
  triggerOnce?: boolean;
}

export interface ScrollAnimationConfig {
  inputRange?: [number, number];
  outputRange?: [number, number];
  clamp?: boolean;
  threshold?: number;
  rootMargin?: string;
}

interface ScrollAnimationReturn {
  scrollY: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  blur: MotionValue<number>;
  createTransform: (options: ScrollAnimationOptions) => MotionValue<number>;
  ref: React.RefObject<HTMLElement | null>;
  hasTriggered: boolean;
  shouldAnimate: boolean;
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}): ScrollAnimationReturn {
  const { scrollY, scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(!prefersReducedMotion);

  const {
    inputRange = [0, 100],
    outputRange = [0, 1],
    clamp = true,
    threshold = 0.1,
    triggerOnce = false,
  } = options;

  // Common transforms
  const opacity = useTransform(
    scrollY,
    [0, 50, 100],
    [1, 0.8, 0.6],
    { clamp }
  );

  const y = useTransform(
    scrollY,
    [0, 100],
    [0, -20],
    { clamp }
  );

  const scale = useTransform(
    scrollY,
    [0, 100],
    [1, 0.95],
    { clamp }
  );

  const blur = useTransform(
    scrollY,
    [0, 50, 100],
    [0, 2, 4],
    { clamp }
  );

  // Helper function to create custom transforms
  const createTransform = (transformOptions: ScrollAnimationOptions) => {
    const {
      inputRange: customInputRange = inputRange,
      outputRange: customOutputRange = outputRange,
      clamp: customClamp = clamp
    } = transformOptions;

    return useTransform(
      scrollY,
      customInputRange,
      customOutputRange,
      { clamp: customClamp }
    );
  };

  // Disable animations if user prefers reduced motion
  if (prefersReducedMotion) {
    return {
      scrollY,
      scrollYProgress,
      opacity: useTransform(scrollY, [0, 1], [1, 1]),
      y: useTransform(scrollY, [0, 1], [0, 0]),
      scale: useTransform(scrollY, [0, 1], [1, 1]),
      blur: useTransform(scrollY, [0, 1], [0, 0]),
      createTransform: () => useTransform(scrollY, [0, 1], [0, 0]),
      ref,
      hasTriggered: true,
      shouldAnimate: false,
    };
  }

  return {
    scrollY,
    scrollYProgress,
    opacity,
    y,
    scale,
    blur,
    createTransform,
    ref,
    hasTriggered,
    shouldAnimate,
  };
}
