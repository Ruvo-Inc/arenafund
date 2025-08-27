/**
 * Performance monitoring system with automatic rollback triggers
 * Monitors Core Web Vitals, SEO performance, and system health
 */

import { featureFlags } from './feature-flags';

export interface PerformanceMetrics {
  timestamp: number;
  url: string;
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  seoScore: number;
  loadTime: number;
  errorRate: number;
  userAgent: string;
}

export interface PerformanceThresholds {
  lcp: { warning: number; critical: number };
  fid: { warning: number; critical: number };
  cls: { warning: number; critical: number };
  ttfb: { warning: number; critical: number };
  seoScore: { warning: number; critical: number };
  loadTime: { warning: number; critical: number };
  errorRate: { warning: number; critical: number };
}

export interface RollbackTrigger {
  metric: keyof PerformanceThresholds;
  threshold: 'warning' | 'critical';
  consecutiveFailures: number;
  timeWindow: number; // minutes
  action: 'disable_feature' | 'rollback_deployment' | 'alert_only';
  featureFlag?: string;
}

const defaultThresholds: PerformanceThresholds = {
  lcp: { warning: 2500, critical: 4000 },
  fid: { warning: 100, critical: 300 },
  cls: { warning: 0.1, critical: 0.25 },
  ttfb: { warning: 800, critical: 1800 },
  seoScore: { warning: 80, critical: 60 },
  loadTime: { warning: 3000, critical: 5000 },
  errorRate: { warning: 1, critical: 5 } // percentage
};

const defaultRollbackTriggers: RollbackTrigger[] = [
  {
    metric: 'lcp',
    threshold: 'critical',
    consecutiveFailures: 3,
    timeWindow: 10,
    action: 'disable_feature',
    featureFlag: 'seoOptimization.aiContentOptimization'
  },
  {
    metric: 'cls',
    threshold: 'critical',
    consecutiveFailures: 5,
    timeWindow: 15,
    action: 'disable_feature',
    featureFlag: 'seoOptimization.contentOptimizationEngine'
  },
  {
    metric: 'errorRate',
    threshold: 'critical',
    consecutiveFailures: 2,
    timeWindow: 5,
    action: 'rollback_deployment'
  },
  {
    metric: 'seoScore',
    threshold: 'warning',
    consecutiveFailures: 10,
    timeWindow: 60,
    action: 'alert_only'
  }
];

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds;
  private rollbackTriggers: RollbackTrigger[];
  private alertCallbacks: ((alert: PerformanceAlert) => void)[] = [];

  constructor(
    thresholds: PerformanceThresholds = defaultThresholds,
    rollbackTriggers: RollbackTrigger[] = defaultRollbackTriggers
  ) {
    this.thresholds = thresholds;
    this.rollbackTriggers = rollbackTriggers;
  }

  /**
   * Record performance metrics
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Check for threshold violations and potential rollbacks
    this.checkThresholds(metrics);
  }

  /**
   * Get current performance summary
   */
  getPerformanceSummary(timeWindow: number = 60): PerformanceSummary {
    const cutoff = Date.now() - (timeWindow * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);

    if (recentMetrics.length === 0) {
      return {
        timeWindow,
        sampleCount: 0,
        averages: {} as any,
        p95: {} as any,
        violations: []
      };
    }

    const averages = this.calculateAverages(recentMetrics);
    const p95 = this.calculateP95(recentMetrics);
    const violations = this.getThresholdViolations(recentMetrics);

    return {
      timeWindow,
      sampleCount: recentMetrics.length,
      averages,
      p95,
      violations
    };
  }

  /**
   * Check if automatic rollback should be triggered
   */
  private checkThresholds(metrics: PerformanceMetrics): void {
    for (const trigger of this.rollbackTriggers) {
      const violations = this.getConsecutiveViolations(trigger);
      
      if (violations >= trigger.consecutiveFailures) {
        this.executeTrigger(trigger, violations);
      }
    }
  }

  /**
   * Get consecutive violations for a specific trigger
   */
  private getConsecutiveViolations(trigger: RollbackTrigger): number {
    const cutoff = Date.now() - (trigger.timeWindow * 60 * 1000);
    const recentMetrics = this.metrics
      .filter(m => m.timestamp > cutoff)
      .sort((a, b) => b.timestamp - a.timestamp);

    let consecutiveViolations = 0;
    const threshold = this.thresholds[trigger.metric][trigger.threshold];

    for (const metric of recentMetrics) {
      const value = metric[trigger.metric as keyof PerformanceMetrics] as number;
      
      if (this.isViolation(trigger.metric, value, trigger.threshold)) {
        consecutiveViolations++;
      } else {
        break; // Stop counting if we hit a non-violation
      }
    }

    return consecutiveViolations;
  }

  /**
   * Execute rollback trigger action
   */
  private executeTrigger(trigger: RollbackTrigger, violations: number): void {
    const alert: PerformanceAlert = {
      type: 'rollback_trigger',
      metric: trigger.metric,
      threshold: trigger.threshold,
      violations,
      action: trigger.action,
      featureFlag: trigger.featureFlag,
      timestamp: Date.now()
    };

    switch (trigger.action) {
      case 'disable_feature':
        if (trigger.featureFlag) {
          featureFlags.updateFlag(trigger.featureFlag, { enabled: false });
          console.warn(`Feature flag ${trigger.featureFlag} disabled due to performance issues`);
        }
        break;
      
      case 'rollback_deployment':
        // In a real implementation, this would trigger deployment rollback
        console.error('Deployment rollback triggered due to performance issues');
        break;
      
      case 'alert_only':
        console.warn(`Performance alert: ${trigger.metric} threshold exceeded`);
        break;
    }

    // Notify alert callbacks
    this.alertCallbacks.forEach(callback => callback(alert));
  }

  /**
   * Check if a metric value violates threshold
   */
  private isViolation(metric: keyof PerformanceThresholds, value: number, level: 'warning' | 'critical'): boolean {
    const threshold = this.thresholds[metric][level];
    
    // For SEO score, lower is worse (violation if below threshold)
    if (metric === 'seoScore') {
      return value < threshold;
    }
    
    // For other metrics, higher is worse (violation if above threshold)
    return value > threshold;
  }

  /**
   * Calculate average metrics
   */
  private calculateAverages(metrics: PerformanceMetrics[]): Partial<PerformanceMetrics> {
    const sums: Partial<PerformanceMetrics> = {};
    const keys: (keyof PerformanceMetrics)[] = ['lcp', 'fid', 'cls', 'ttfb', 'seoScore', 'loadTime', 'errorRate'];

    keys.forEach(key => {
      const values = metrics.map(m => m[key] as number).filter(v => typeof v === 'number');
      (sums as any)[key] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    });

    return sums;
  }

  /**
   * Calculate 95th percentile metrics
   */
  private calculateP95(metrics: PerformanceMetrics[]): Partial<PerformanceMetrics> {
    const p95: Partial<PerformanceMetrics> = {};
    const keys: (keyof PerformanceMetrics)[] = ['lcp', 'fid', 'cls', 'ttfb', 'seoScore', 'loadTime', 'errorRate'];

    keys.forEach(key => {
      const values = metrics.map(m => m[key] as number).filter(v => typeof v === 'number').sort((a, b) => a - b);
      if (values.length > 0) {
        const index = Math.floor(values.length * 0.95);
        (p95 as any)[key] = values[index];
      }
    });

    return p95;
  }

  /**
   * Get threshold violations in recent metrics
   */
  private getThresholdViolations(metrics: PerformanceMetrics[]): ThresholdViolation[] {
    const violations: ThresholdViolation[] = [];

    metrics.forEach(metric => {
      Object.entries(this.thresholds).forEach(([key, thresholds]) => {
        const metricKey = key as keyof PerformanceThresholds;
        const value = metric[metricKey] as number;

        if (this.isViolation(metricKey, value, 'critical')) {
          violations.push({
            metric: metricKey,
            level: 'critical',
            value,
            threshold: thresholds.critical,
            timestamp: metric.timestamp,
            url: metric.url
          });
        } else if (this.isViolation(metricKey, value, 'warning')) {
          violations.push({
            metric: metricKey,
            level: 'warning',
            value,
            threshold: thresholds.warning,
            timestamp: metric.timestamp,
            url: metric.url
          });
        }
      });
    });

    return violations;
  }

  /**
   * Add alert callback
   */
  onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Remove alert callback
   */
  offAlert(callback: (alert: PerformanceAlert) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }
}

export interface PerformanceSummary {
  timeWindow: number;
  sampleCount: number;
  averages: Partial<PerformanceMetrics>;
  p95: Partial<PerformanceMetrics>;
  violations: ThresholdViolation[];
}

export interface ThresholdViolation {
  metric: keyof PerformanceThresholds;
  level: 'warning' | 'critical';
  value: number;
  threshold: number;
  timestamp: number;
  url: string;
}

export interface PerformanceAlert {
  type: 'rollback_trigger' | 'threshold_violation';
  metric: keyof PerformanceThresholds;
  threshold: 'warning' | 'critical';
  violations: number;
  action: 'disable_feature' | 'rollback_deployment' | 'alert_only';
  featureFlag?: string;
  timestamp: number;
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Web Vitals integration
export const recordWebVitals = (metric: any) => {
  if (typeof window !== 'undefined') {
    const performanceMetrics: PerformanceMetrics = {
      timestamp: Date.now(),
      url: window.location.href,
      lcp: metric.name === 'LCP' ? metric.value : 0,
      fid: metric.name === 'FID' ? metric.value : 0,
      cls: metric.name === 'CLS' ? metric.value : 0,
      ttfb: metric.name === 'TTFB' ? metric.value : 0,
      seoScore: 100, // Default, should be calculated separately
      loadTime: performance.now(),
      errorRate: 0, // Should be calculated from error tracking
      userAgent: navigator.userAgent
    };

    performanceMonitor.recordMetrics(performanceMetrics);
  }
};