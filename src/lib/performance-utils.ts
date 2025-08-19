/**
 * Performance utilities for enhanced components
 * Provides performance monitoring and optimization helpers
 */

export interface PerformanceConfig {
  mode: 'high' | 'balanced' | 'battery';
  reducedMotion: boolean;
  prefersReducedData: boolean;
}

/**
 * Detects user's performance preferences
 */
export function detectPerformancePreferences(): PerformanceConfig {
  if (typeof window === 'undefined') {
    return {
      mode: 'balanced',
      reducedMotion: false,
      prefersReducedData: false,
    };
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
  
  // Detect device capabilities
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  
  let mode: 'high' | 'balanced' | 'battery' = 'balanced';
  
  if (isSlowConnection || isLowEndDevice || prefersReducedData) {
    mode = 'battery';
  } else if (!reducedMotion && 'requestIdleCallback' in window) {
    mode = 'high';
  }

  return {
    mode,
    reducedMotion,
    prefersReducedData,
  };
}

/**
 * Optimizes animation configuration based on performance mode
 */
export function optimizeAnimationConfig(
  config: any,
  performanceMode: 'high' | 'balanced' | 'battery'
) {
  switch (performanceMode) {
    case 'battery':
      return {
        ...config,
        transition: {
          ...config.transition,
          duration: (config.transition?.duration || 0.3) * 1.5,
          ease: 'easeOut',
        },
      };
    case 'high':
      return {
        ...config,
        transition: {
          ...config.transition,
          type: 'spring',
          stiffness: 400,
          damping: 30,
        },
      };
    default:
      return config;
  }
}

/**
 * Debounces expensive operations for better performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttles high-frequency events like mouse move
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Checks if the current device supports advanced animations
 */
export function supportsAdvancedAnimations(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'requestAnimationFrame' in window &&
    'CSS' in window &&
    CSS.supports('transform', 'translateZ(0)') &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Performance monitoring for component render times
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measurements: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasurement(componentName: string): string {
    const measurementId = `${componentName}-${Date.now()}`;
    if (typeof performance !== 'undefined') {
      performance.mark(`${measurementId}-start`);
    }
    return measurementId;
  }

  endMeasurement(measurementId: string, componentName: string): number {
    if (typeof performance === 'undefined') return 0;

    try {
      performance.mark(`${measurementId}-end`);
      performance.measure(measurementId, `${measurementId}-start`, `${measurementId}-end`);
      
      const measure = performance.getEntriesByName(measurementId)[0];
      const duration = measure.duration;

      // Store measurement
      if (!this.measurements.has(componentName)) {
        this.measurements.set(componentName, []);
      }
      const measurements = this.measurements.get(componentName)!;
      measurements.push(duration);
      
      // Keep only last 100 measurements
      if (measurements.length > 100) {
        measurements.shift();
      }

      // Clean up performance entries
      performance.clearMarks(`${measurementId}-start`);
      performance.clearMarks(`${measurementId}-end`);
      performance.clearMeasures(measurementId);

      return duration;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return 0;
    }
  }

  getAverageRenderTime(componentName: string): number {
    const measurements = this.measurements.get(componentName);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((acc, time) => acc + time, 0);
    return sum / measurements.length;
  }

  getPerformanceReport(): Record<string, { average: number; count: number }> {
    const report: Record<string, { average: number; count: number }> = {};
    
    this.measurements.forEach((measurements, componentName) => {
      report[componentName] = {
        average: this.getAverageRenderTime(componentName),
        count: measurements.length,
      };
    });
    
    return report;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();