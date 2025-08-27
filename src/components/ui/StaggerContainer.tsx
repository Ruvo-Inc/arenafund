'use client';

import React, { ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation, ScrollAnimationConfig } from '@/hooks/useScrollAnimation';

export interface StaggerConfig {
  delayChildren?: number;
  staggerChildren?: number;
  duration?: number;
  ease?: string;
}

export interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerConfig?: StaggerConfig;
  scrollConfig?: ScrollAnimationConfig;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'custom';
  customVariants?: {
    hidden: any;
    visible: any;
  };
  as?: keyof React.JSX.IntrinsicElements;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}

export interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'custom';
  customVariants?: {
    hidden: any;
    visible: any;
  };
  as?: keyof React.JSX.IntrinsicElements;
}

// Animation variants for container
const containerVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  },
  slideUp: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.15
      }
    }
  },
  slideLeft: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  },
  slideRight: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  },
  scale: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.12
      }
    }
  }
};

// Animation variants for items
const itemVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  slideUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  slideLeft: {
    hidden: { opacity: 0, x: 30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  slideRight: {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }
};

/**
 * Production error boundary with graceful animation failure handling
 */
class StaggerAnimationErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Production error logging
    if (process.env.NODE_ENV === 'production') {
      // Log to monitoring service in production
      console.error('Animation system failure:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn('StaggerContainer animation error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="opacity-100">
          {this.props.children}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Enterprise staggered animation container with precision timing control
 * Orchestrates complex animation sequences with performance monitoring
 */
export function StaggerContainer({
  children,
  className = '',
  staggerConfig = {},
  scrollConfig = {},
  animation = 'fadeIn',
  customVariants,
  as = 'div',
  onAnimationStart,
  onAnimationComplete
}: StaggerContainerProps) {
  const { ref, hasTriggered, shouldAnimate } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true,
    ...scrollConfig
  });

  const {
    delayChildren = 0.1,
    staggerChildren = 0.1,
    duration = 0.6,
    ease = "easeOut"
  } = staggerConfig;

  // Create container variants with custom stagger config
  const variants = customVariants || (animation !== 'custom' ? {
    ...containerVariants[animation],
    visible: {
      ...containerVariants[animation].visible,
      transition: {
        delayChildren,
        staggerChildren,
        duration,
        ease
      }
    }
  } : undefined);

  const MotionComponent = (motion as any)[as];

  // If animations are disabled, render static content
  if (!shouldAnimate) {
    const StaticComponent = as as any;
    return (
      <StaggerAnimationErrorBoundary>
        <StaticComponent ref={ref} className={className}>
          {children}
        </StaticComponent>
      </StaggerAnimationErrorBoundary>
    );
  }

  return (
    <StaggerAnimationErrorBoundary>
      <MotionComponent
        ref={ref}
        className={className}
        initial="hidden"
        animate={hasTriggered ? "visible" : "hidden"}
        variants={variants}
        onAnimationStart={onAnimationStart}
        onAnimationComplete={onAnimationComplete}
      >
        {children}
      </MotionComponent>
    </StaggerAnimationErrorBoundary>
  );
}

/**
 * Optimized stagger item component for seamless animation coordination
 */
export function StaggerItem({
  children,
  className = '',
  animation = 'fadeIn',
  customVariants,
  as = 'div'
}: StaggerItemProps) {
  const variants = customVariants || (animation !== 'custom' ? itemVariants[animation] : undefined);
  const MotionComponent = (motion as any)[as];

  return (
    <MotionComponent
      className={className}
      variants={variants}
    >
      {children}
    </MotionComponent>
  );
}

/**
 * Professional animation timing configurations for Arena Fund's interface standards
 */
export const StaggerPresets = {
  /**
   * Rapid succession for navigation and UI elements
   */
  Navigation: {
    delayChildren: 0.03,
    staggerChildren: 0.05,
    duration: 0.35
  },

  /**
   * Balanced timing for content sections and cards
   */
  Content: {
    delayChildren: 0.08,
    staggerChildren: 0.12,
    duration: 0.55
  },

  /**
   * Premium reveal timing for hero and key sections
   */
  Hero: {
    delayChildren: 0.15,
    staggerChildren: 0.18,
    duration: 0.75
  },

  /**
   * Refined timing for data visualization and metrics
   */
  Metrics: {
    delayChildren: 0.06,
    staggerChildren: 0.08,
    duration: 0.45
  }
};

/**
 * Advanced HOC for dynamic list animation with type safety
 */
export function withStaggerAnimation<T extends object>(
  Component: React.ComponentType<T>,
  staggerConfig?: StaggerConfig
) {
  return function StaggeredComponent(props: T & { items?: any[]; className?: string }) {
    const { items = [], className = '', ...componentProps } = props;

    return (
      <StaggerContainer
        className={className}
        staggerConfig={staggerConfig}
        animation="slideUp"
      >
        {items.map((item, index) => (
          <StaggerItem key={index} animation="slideUp">
            <Component {...(componentProps as T)} item={item} index={index} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    );
  };
}