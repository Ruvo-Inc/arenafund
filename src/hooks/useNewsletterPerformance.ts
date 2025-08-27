'use client';

import { useCallback, useRef, useEffect } from 'react';
import { trackNewsletterPerformance } from '@/lib/newsletter-analytics';

interface PerformanceMetrics {
  modalOpenTime?: number;
  modalCloseTime?: number;
  formSubmissionTime?: number;
  apiResponseTime?: number;
  totalInteractionTime?: number;
}

interface UseNewsletterPerformanceReturn {
  startModalTimer: () => () => void;
  startFormTimer: () => () => void;
  startApiTimer: () => () => void;
  trackModalInteraction: (action: string, duration?: number) => void;
  getMetrics: () => PerformanceMetrics;
  resetMetrics: () => void;
}

export function useNewsletterPerformance(): UseNewsletterPerformanceReturn {
  const metricsRef = useRef<PerformanceMetrics>({});
  const timersRef = useRef<Map<string, number>>(new Map());

  // Generic timer function
  const startTimer = useCallback((timerName: string) => {
    const startTime = performance.now();
    timersRef.current.set(timerName, startTime);

    return () => {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      // Store the duration in metrics
      switch (timerName) {
        case 'modal':
          metricsRef.current.modalOpenTime = duration;
          break;
        case 'form':
          metricsRef.current.formSubmissionTime = duration;
          break;
        case 'api':
          metricsRef.current.apiResponseTime = duration;
          break;
      }

      // Track the performance metric
      trackNewsletterPerformance(`${timerName}_duration`, duration, 'ms');
      
      timersRef.current.delete(timerName);
      return duration;
    };
  }, []);

  // Specific timer functions
  const startModalTimer = useCallback(() => startTimer('modal'), [startTimer]);
  const startFormTimer = useCallback(() => startTimer('form'), [startTimer]);
  const startApiTimer = useCallback(() => startTimer('api'), [startTimer]);

  // Track modal interactions with performance data
  const trackModalInteraction = useCallback((action: string, duration?: number) => {
    const timestamp = performance.now();
    
    // Track the interaction
    trackNewsletterPerformance(`modal_${action}`, duration || timestamp, 'ms');

    // Update total interaction time
    if (action === 'close' && metricsRef.current.modalOpenTime) {
      const totalTime = timestamp - (timersRef.current.get('modal_start') || timestamp);
      metricsRef.current.totalInteractionTime = Math.round(totalTime);
      trackNewsletterPerformance('modal_total_interaction', Math.round(totalTime), 'ms');
    }
  }, []);

  // Get current metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    return { ...metricsRef.current };
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {};
    timersRef.current.clear();
  }, []);

  // Track page performance metrics on mount
  useEffect(() => {
    // Track initial page load performance if available
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const pageLoadTime = Math.round(navigation.loadEventEnd - navigation.fetchStart);
        trackNewsletterPerformance('page_load_time', pageLoadTime, 'ms');
      }

      // Track largest contentful paint
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              trackNewsletterPerformance('largest_contentful_paint', Math.round(lastEntry.startTime), 'ms');
            }
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });

          // Cleanup observer after 10 seconds
          setTimeout(() => {
            observer.disconnect();
          }, 10000);
        } catch (error) {
          console.warn('Performance observer not supported:', error);
        }
      }
    }
  }, []);

  return {
    startModalTimer,
    startFormTimer,
    startApiTimer,
    trackModalInteraction,
    getMetrics,
    resetMetrics,
  };
}

// Hook for tracking component render performance
export function useRenderPerformance(componentName: string) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    const currentTime = performance.now();
    
    if (lastRenderTimeRef.current > 0) {
      const timeSinceLastRender = currentTime - lastRenderTimeRef.current;
      trackNewsletterPerformance(
        `${componentName}_render_interval`,
        Math.round(timeSinceLastRender),
        'ms'
      );
    }
    
    lastRenderTimeRef.current = currentTime;
    
    // Track render count every 10 renders
    if (renderCountRef.current % 10 === 0) {
      trackNewsletterPerformance(
        `${componentName}_render_count`,
        renderCountRef.current,
        'count'
      );
    }
  });

  return {
    renderCount: renderCountRef.current,
  };
}

// Hook for tracking memory usage (if available)
export function useMemoryTracking() {
  const trackMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        trackNewsletterPerformance('memory_used_js_heap', Math.round(memory.usedJSHeapSize / 1024 / 1024), 'bytes');
        trackNewsletterPerformance('memory_total_js_heap', Math.round(memory.totalJSHeapSize / 1024 / 1024), 'bytes');
        trackNewsletterPerformance('memory_js_heap_limit', Math.round(memory.jsHeapSizeLimit / 1024 / 1024), 'bytes');
      }
    }
  }, []);

  useEffect(() => {
    // Track memory usage on mount
    trackMemoryUsage();

    // Track memory usage every 30 seconds
    const interval = setInterval(trackMemoryUsage, 30000);

    return () => clearInterval(interval);
  }, [trackMemoryUsage]);

  return { trackMemoryUsage };
}