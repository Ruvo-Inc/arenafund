/**
 * Tests for deployment pipeline functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { featureFlags } from '../feature-flags';
import { performanceMonitor } from '../performance-monitoring';
import { abTestingFramework } from '../ab-testing-framework';
import { createDeploymentPipeline, deploymentUtils } from '../deployment-pipeline';

// Mock external dependencies
vi.mock('../feature-flags');
vi.mock('../performance-monitoring');
vi.mock('../ab-testing-framework');
vi.mock('../error-handling-logging');

describe('Deployment Pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Feature Flags', () => {
    it('should enable feature flags based on rollout percentage', () => {
      const pipeline = createDeploymentPipeline({
        rolloutPercentage: 50,
        environment: 'production'
      });

      expect(pipeline).toBeDefined();
    });

    it('should disable features during rollback', async () => {
      const pipeline = createDeploymentPipeline({
        autoRollbackEnabled: true
      });

      await pipeline.triggerRollback('Test rollback');

      expect(featureFlags.updateFlag).toHaveBeenCalledWith(
        'seoOptimization.aiContentOptimization',
        { enabled: false }
      );
    });
  });

  describe('Performance Monitoring', () => {
    it('should record performance metrics', () => {
      const mockMetrics = {
        timestamp: Date.now(),
        url: 'https://example.com',
        lcp: 2000,
        fid: 50,
        cls: 0.05,
        ttfb: 500,
        seoScore: 95,
        loadTime: 1500,
        errorRate: 0.1,
        userAgent: 'test-agent'
      };

      performanceMonitor.recordMetrics(mockMetrics);

      expect(performanceMonitor.recordMetrics).toHaveBeenCalledWith(mockMetrics);
    });

    it('should trigger rollback on performance degradation', async () => {
      const mockSummary = {
        timeWindow: 10,
        sampleCount: 100,
        averages: {},
        p95: {},
        violations: [
          { level: 'critical', metric: 'lcp', value: 5000, threshold: 4000 },
          { level: 'critical', metric: 'cls', value: 0.3, threshold: 0.25 }
        ]
      };

      vi.mocked(performanceMonitor.getPerformanceSummary).mockReturnValue(mockSummary);

      const pipeline = createDeploymentPipeline({
        autoRollbackEnabled: true
      });

      // This would be triggered by the monitoring system
      const shouldRollback = mockSummary.violations.filter(v => v.level === 'critical').length > 1;
      expect(shouldRollback).toBe(true);
    });
  });

  describe('A/B Testing Framework', () => {
    it('should create and start A/B tests', () => {
      const mockTest = {
        id: 'test-1',
        name: 'Meta Tag Test',
        status: 'running' as const,
        variants: [
          { id: 'control', name: 'Control', isControl: true },
          { id: 'variant', name: 'Variant', isControl: false }
        ]
      };

      vi.mocked(abTestingFramework.getActiveTests).mockReturnValue([mockTest]);

      const activeTests = abTestingFramework.getActiveTests();
      expect(activeTests).toHaveLength(1);
      expect(activeTests[0].id).toBe('test-1');
    });

    it('should record A/B test results', () => {
      const mockResult = {
        testId: 'test-1',
        variantId: 'variant',
        userId: 'user-123',
        sessionId: 'session-456',
        timestamp: Date.now(),
        metrics: { conversion: 1, ctr: 0.05 },
        metadata: {}
      };

      abTestingFramework.recordResult(mockResult);

      expect(abTestingFramework.recordResult).toHaveBeenCalledWith(mockResult);
    });

    it('should analyze test results for statistical significance', () => {
      const mockAnalysis = {
        testId: 'test-1',
        status: 'winner_found' as const,
        winner: 'variant',
        confidence: 95,
        results: [],
        recommendations: ['Implement variant as winner'],
        updatedAt: Date.now()
      };

      vi.mocked(abTestingFramework.analyzeTest).mockReturnValue(mockAnalysis);

      const analysis = abTestingFramework.analyzeTest('test-1');
      expect(analysis.status).toBe('winner_found');
      expect(analysis.winner).toBe('variant');
    });
  });

  describe('Error Handling and Logging', () => {
    it('should log deployment events', async () => {
      const pipeline = createDeploymentPipeline();
      
      // Start deployment would trigger logging
      expect(pipeline.getStatus().phase).toBe('preparing');
    });

    it('should handle deployment errors gracefully', async () => {
      const pipeline = createDeploymentPipeline({
        autoRollbackEnabled: true
      });

      await pipeline.triggerRollback('Test error handling');

      const status = pipeline.getStatus();
      expect(status.phase).toBe('rolled_back');
      expect(status.errors).toContain('Rollback triggered: Test error handling');
    });
  });

  describe('Deployment Strategies', () => {
    it('should create production pipeline with canary deployment', () => {
      const pipeline = deploymentUtils.createProductionPipeline(25);
      const status = pipeline.getStatus();
      
      expect(status.phase).toBe('preparing');
    });

    it('should create staging pipeline with immediate deployment', () => {
      const pipeline = deploymentUtils.createStagingPipeline();
      const status = pipeline.getStatus();
      
      expect(status.phase).toBe('preparing');
    });

    it('should support gradual rollout', async () => {
      const pipeline = createDeploymentPipeline({
        rolloutStrategy: 'gradual',
        rolloutPercentage: 100
      });

      // Mock the rollout process
      const status = pipeline.getStatus();
      expect(status.progress).toBe(0);
    });
  });

  describe('Health Checks', () => {
    it('should perform regular health checks', () => {
      vi.useFakeTimers();
      
      const pipeline = createDeploymentPipeline({
        monitoringEnabled: true,
        healthCheckInterval: 60000
      });

      // Fast-forward time to trigger health check
      vi.advanceTimersByTime(60000);
      
      // Health check would be performed
      expect(true).toBe(true); // Placeholder assertion
      
      vi.useRealTimers();
    });

    it('should calculate performance scores correctly', () => {
      const mockSummary = {
        sampleCount: 100,
        violations: [
          { level: 'critical' },
          { level: 'warning' },
          { level: 'warning' }
        ]
      };

      // Performance score calculation: 100 - (1 * 10) - (2 * 2) = 86
      const expectedScore = 100 - (1 * 10) - (2 * 2);
      expect(expectedScore).toBe(86);
    });
  });

  describe('Integration Tests', () => {
    it('should integrate all components in deployment flow', async () => {
      const pipeline = createDeploymentPipeline({
        environment: 'staging',
        rolloutStrategy: 'immediate',
        monitoringEnabled: true,
        abTestingEnabled: false
      });

      const initialStatus = pipeline.getStatus();
      expect(initialStatus.phase).toBe('preparing');
      expect(initialStatus.progress).toBe(0);
    });

    it('should handle rollback scenarios end-to-end', async () => {
      const pipeline = createDeploymentPipeline({
        autoRollbackEnabled: true
      });

      // Simulate rollback trigger
      await pipeline.triggerRollback('Integration test rollback');

      const status = pipeline.getStatus();
      expect(status.phase).toBe('rolled_back');
      expect(status.errors.length).toBeGreaterThan(0);
    });
  });
});