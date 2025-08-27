import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export interface PerformanceReport {
  url: string;
  timestamp: number;
  metrics: WebVitalsMetric[];
  userAgent: string;
  connectionType?: string;
}

// Web Vitals thresholds based on Google's recommendations
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 }, // INP replaced FID
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

/**
 * Get performance rating based on metric value and thresholds
 */
function getPerformanceRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Convert web-vitals Metric to our WebVitalsMetric format
 */
function formatMetric(metric: Metric): WebVitalsMetric {
  return {
    name: metric.name,
    value: metric.value,
    rating: getPerformanceRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType || 'navigate',
  };
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(onMetric?: (metric: WebVitalsMetric) => void) {
  const handleMetric = (metric: Metric) => {
    const formattedMetric = formatMetric(metric);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${formattedMetric.name}:`, {
        value: formattedMetric.value,
        rating: formattedMetric.rating,
        delta: formattedMetric.delta,
      });
    }
    
    // Send to analytics or custom handler
    if (onMetric) {
      onMetric(formattedMetric);
    }
    
    // Send to analytics endpoint
    sendToAnalytics(formattedMetric);
  };

  // Collect all Core Web Vitals
  onCLS(handleMetric);
  onFCP(handleMetric);
  onINP(handleMetric); // INP replaced FID in web-vitals v4+
  onLCP(handleMetric);
  onTTFB(handleMetric);
}

/**
 * Send metrics to analytics endpoint
 */
async function sendToAnalytics(metric: WebVitalsMetric) {
  try {
    const report: PerformanceReport = {
      url: window.location.href,
      timestamp: Date.now(),
      metrics: [metric],
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection?.effectiveType,
    };

    // Send to our analytics endpoint
    await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    });
  } catch (error) {
    // Silently fail to avoid impacting user experience
    console.warn('Failed to send performance metrics:', error);
  }
}

/**
 * Performance optimization utilities
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Map<string, WebVitalsMetric[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Start monitoring performance
   */
  startMonitoring() {
    if (typeof window === 'undefined') return;

    // Initialize Web Vitals
    initWebVitals((metric) => {
      this.addMetric(window.location.pathname, metric);
    });

    // Monitor resource loading
    this.observeResourceTiming();
    
    // Monitor navigation timing
    this.observeNavigationTiming();
  }

  /**
   * Add a metric for a specific page
   */
  addMetric(page: string, metric: WebVitalsMetric) {
    if (!this.metrics.has(page)) {
      this.metrics.set(page, []);
    }
    this.metrics.get(page)!.push(metric);
  }

  /**
   * Get metrics for a specific page
   */
  getMetrics(page: string): WebVitalsMetric[] {
    return this.metrics.get(page) || [];
  }

  /**
   * Get performance summary for all pages
   */
  getPerformanceSummary() {
    const summary: Record<string, any> = {};
    
    for (const [page, metrics] of this.metrics.entries()) {
      summary[page] = {
        totalMetrics: metrics.length,
        goodMetrics: metrics.filter(m => m.rating === 'good').length,
        needsImprovementMetrics: metrics.filter(m => m.rating === 'needs-improvement').length,
        poorMetrics: metrics.filter(m => m.rating === 'poor').length,
        averageValues: this.calculateAverageValues(metrics),
      };
    }
    
    return summary;
  }

  /**
   * Observe resource timing
   */
  private observeResourceTiming() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          this.analyzeResourceTiming(entry as PerformanceResourceTiming);
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }

  /**
   * Observe navigation timing
   */
  private observeNavigationTiming() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.analyzeNavigationTiming(entry as PerformanceNavigationTiming);
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.set('navigation', observer);
  }

  /**
   * Analyze resource timing for optimization opportunities
   */
  private analyzeResourceTiming(entry: PerformanceResourceTiming) {
    const duration = entry.responseEnd - entry.startTime;
    
    // Log slow resources in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`[Performance] Slow resource: ${entry.name} (${duration.toFixed(2)}ms)`);
    }
  }

  /**
   * Analyze navigation timing
   */
  private analyzeNavigationTiming(entry: PerformanceNavigationTiming) {
    const metrics = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      firstByte: entry.responseStart - entry.requestStart,
      domInteractive: entry.domInteractive - entry.fetchStart,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance] Navigation timing:', metrics);
    }
  }

  /**
   * Calculate average values for metrics
   */
  private calculateAverageValues(metrics: WebVitalsMetric[]) {
    const grouped = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) acc[metric.name] = [];
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    const averages: Record<string, number> = {};
    for (const [name, values] of Object.entries(grouped)) {
      averages[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    return averages;
  }

  /**
   * Clean up observers
   */
  cleanup() {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const fontPreloads = [
    '/fonts/inter-var.woff2',
    '/fonts/inter-var-italic.woff2',
  ];

  fontPreloads.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = href;
    document.head.appendChild(link);
  });
}

/**
 * Optimize images with intersection observer for lazy loading
 */
export function optimizeImages() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01,
  });

  // Observe all images with data-src attribute
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Defer non-critical JavaScript
 */
export function deferNonCriticalJS() {
  if (typeof window === 'undefined') return;

  // Defer analytics and other non-critical scripts
  const deferredScripts = [
    'https://www.googletagmanager.com/gtag/js',
    // Add other non-critical scripts here
  ];

  // Load deferred scripts after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      deferredScripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
      });
    }, 1000);
  });
}

/**
 * Initialize all performance optimizations
 */
export function initPerformanceOptimizations() {
  if (typeof window === 'undefined') return;

  const optimizer = PerformanceOptimizer.getInstance();
  optimizer.startMonitoring();
  
  preloadCriticalResources();
  optimizeImages();
  deferNonCriticalJS();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    optimizer.cleanup();
  });
}