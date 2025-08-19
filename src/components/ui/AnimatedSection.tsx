'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation, ScrollAnimationConfig } from '@/hooks/useScrollAnimation';

export interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'custom';
  customVariants?: {
    hidden: any;
    visible: any;
  };
  duration?: number;
  delay?: number;
  scrollConfig?: ScrollAnimationConfig;
  as?: keyof JSX.IntrinsicElements;
}

const animationVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }
};

/**
 * Enterprise-grade animated section component with accessibility compliance
 * Provides smooth scroll-triggered animations with performance optimization
 */
export function AnimatedSection({
  children,
  className = '',
  animation = 'fadeIn',
  customVariants,
  duration = 0.6,
  delay = 0,
  scrollConfig = {},
  as = 'div'
}: AnimatedSectionProps) {
  const { ref, hasTriggered, shouldAnimate } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true,
    delay,
    ...scrollConfig
  });

  const variants = customVariants || (animation !== 'custom' ? animationVariants[animation] : undefined);
  
  const MotionComponent = (motion as any)[as];

  // If animations are disabled, render static content
  if (!shouldAnimate) {
    const StaticComponent = as as any;
    return (
      <StaticComponent ref={ref} className={className}>
        {children}
      </StaticComponent>
    );
  }

  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial="hidden"
      animate={hasTriggered ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration,
        ease: "easeOut",
        delay: hasTriggered ? delay : 0
      }}
    >
      {children}
    </MotionComponent>
  );
}