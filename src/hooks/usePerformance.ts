'use client';

import { useState, useEffect, useCallback } from 'react';
import { detectPerformancePreferences, PerformanceConfig, performanceMonitor } from '@/lib/performance-utils';

/**
 * Hook for managing component performance preferences and monitoring
 */
export function usePerformance(componentName?: string) {
  const [config, setConfig] = useState<PerformanceConfig>(() => detectPerformancePreferences());
  const [measurementId, setMeasurementId] = useState<string | null>(null);

  useEffect(() => {
    // Listen for preference changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-reduced-data: reduce)'),
    ];

    const handleChange = () => {
      setConfig(detectPerformancePreferences());
    };

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', handleChange);
    });

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', handleChange);
      });
    };
  }, []);

  const startMeasurement = useCallback(() => {
    if (componentName && config.mode === 'high') {
      const id = performanceMonitor.startMeasurement(componentName);
      setMeasurementId(id);
      return id;
    }
    return null;
  }, [componentName, config.mode]);

  const endMeasurement = useCallback(() => {
    if (measurementId && componentName) {
      const duration = performanceMonitor.endMeasurement(measurementId, componentName);
      setMeasurementId(null);
      return duration;
    }
    return 0;
  }, [measurementId, componentName]);

  const shouldUseAdvancedAnimations = useCallback(() => {
    return config.mode === 'high' && !config.reducedMotion;
  }, [config]);

  const getOptimizedTransition = useCallback((baseTransition: any = {}) => {
    switch (config.mode) {
      case 'battery':
        return {
          ...baseTransition,
          duration: (baseTransition.duration || 0.3) * 1.5,
          ease: 'easeOut',
        };
      case 'high':
        return {
          ...baseTransition,
          type: 'spring',
          stiffness: 400,
          damping: 30,
        };
      default:
        return baseTransition;
    }
  }, [config.mode]);

  return {
    config,
    startMeasurement,
    endMeasurement,
    shouldUseAdvancedAnimations,
    getOptimizedTransition,
    isHighPerformance: config.mode === 'high',
    isBatteryMode: config.mode === 'battery',
    reducedMotion: config.reducedMotion,
  };
}

/**
 * Hook for optimizing animations based on performance preferences
 */
export function useOptimizedAnimation(
  baseAnimation: any,
  componentName?: string
) {
  const { config, getOptimizedTransition } = usePerformance(componentName);

  const optimizedAnimation = {
    ...baseAnimation,
    transition: getOptimizedTransition(baseAnimation.transition),
  };

  // Disable complex animations in battery mode or with reduced motion
  if (config.mode === 'battery' || config.reducedMotion) {
    return {
      ...optimizedAnimation,
      scale: baseAnimation.scale ? [1, 1.02, 1] : undefined,
      rotate: undefined,
      x: undefined,
      y: undefined,
    };
  }

  return optimizedAnimation;
}