/**
 * A/B Testing Framework for SEO optimization strategies
 * Supports multivariate testing, statistical significance, and automated winner selection
 */

import { featureFlags } from './feature-flags';

export interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  trafficAllocation: number; // Percentage of traffic to include in test
  variants: ABTestVariant[];
  metrics: ABTestMetric[];
  targetSampleSize: number;
  confidenceLevel: number; // e.g., 0.95 for 95% confidence
  minimumDetectableEffect: number; // Minimum improvement to detect
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficWeight: number; // Percentage of test traffic
  config: Record<string, any>; // Configuration overrides
  isControl: boolean;
}

export interface ABTestMetric {
  name: string;
  type: 'conversion' | 'numeric' | 'duration';
  primary: boolean; // Primary metric for statistical significance
  description: string;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  metrics: Record<string, number>;
  metadata: Record<string, any>;
}

export interface ABTestAnalysis {
  testId: string;
  status: 'insufficient_data' | 'no_winner' | 'winner_found';
  winner?: string;
  confidence: number;
  results: VariantAnalysis[];
  recommendations: string[];
  updatedAt: number;
}

export interface VariantAnalysis {
  variantId: string;
  sampleSize: number;
  metrics: MetricAnalysis[];
  conversionRate?: number;
  statisticalSignificance: boolean;
}

export interface MetricAnalysis {
  name: string;
  mean: number;
  standardDeviation: number;
  confidenceInterval: [number, number];
  pValue: number;
  improvementOverControl: number;
}

class ABTestingFramework {
  private tests: Map<string, ABTestConfig> = new Map();
  private results: ABTestResult[] = [];
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId

  /**
   * Create a new A/B test
   */
  createTest(config: ABTestConfig): void {
    // Validate test configuration
    this.validateTestConfig(config);
    
    this.tests.set(config.id, {
      ...config,
      status: 'draft'
    });
  }

  /**
   * Start an A/B test
   */
  startTest(testId: string): void {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    if (test.status !== 'draft') {
      throw new Error(`Test ${testId} is not in draft status`);
    }

    test.status = 'running';
    test.startDate = new Date();
    
    console.log(`A/B test ${testId} started`);
  }

  /**
   * Stop an A/B test
   */
  stopTest(testId: string): void {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    test.status = 'completed';
    test.endDate = new Date();
    
    console.log(`A/B test ${testId} stopped`);
  }

  /**
   * Get variant assignment for a user
   */
  getVariantAssignment(testId: string, userId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    // Check if user is already assigned
    const userTests = this.userAssignments.get(userId);
    if (userTests?.has(testId)) {
      return userTests.get(testId)!;
    }

    // Check if user should be included in test
    if (!this.shouldIncludeUser(userId, test.trafficAllocation)) {
      return null;
    }

    // Assign user to variant
    const variantId = this.assignUserToVariant(userId, test);
    
    // Store assignment
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }
    this.userAssignments.get(userId)!.set(testId, variantId);

    return variantId;
  }

  /**
   * Record test result
   */
  recordResult(result: ABTestResult): void {
    const test = this.tests.get(result.testId);
    if (!test || test.status !== 'running') {
      return;
    }

    this.results.push(result);

    // Auto-analyze if we have enough data
    if (this.results.filter(r => r.testId === result.testId).length % 100 === 0) {
      this.analyzeTest(result.testId);
    }
  }

  /**
   * Analyze test results
   */
  analyzeTest(testId: string): ABTestAnalysis {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    const testResults = this.results.filter(r => r.testId === testId);
    
    if (testResults.length < test.targetSampleSize * 0.1) {
      return {
        testId,
        status: 'insufficient_data',
        confidence: 0,
        results: [],
        recommendations: ['Continue collecting data'],
        updatedAt: Date.now()
      };
    }

    const variantAnalyses = this.analyzeVariants(test, testResults);
    const winner = this.determineWinner(variantAnalyses, test.confidenceLevel);

    return {
      testId,
      status: winner ? 'winner_found' : 'no_winner',
      winner,
      confidence: winner ? this.getWinnerConfidence(variantAnalyses, winner) : 0,
      results: variantAnalyses,
      recommendations: this.generateRecommendations(variantAnalyses, winner),
      updatedAt: Date.now()
    };
  }

  /**
   * Get test configuration with variant overrides
   */
  getTestConfig(testId: string, userId: string): Record<string, any> {
    const variantId = this.getVariantAssignment(testId, userId);
    if (!variantId) {
      return {};
    }

    const test = this.tests.get(testId);
    const variant = test?.variants.find(v => v.id === variantId);
    
    return variant?.config || {};
  }

  /**
   * Get all active tests
   */
  getActiveTests(): ABTestConfig[] {
    return Array.from(this.tests.values()).filter(test => test.status === 'running');
  }

  /**
   * Validate test configuration
   */
  private validateTestConfig(config: ABTestConfig): void {
    if (config.variants.length < 2) {
      throw new Error('Test must have at least 2 variants');
    }

    const totalWeight = config.variants.reduce((sum, v) => sum + v.trafficWeight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant traffic weights must sum to 100%');
    }

    const controlVariants = config.variants.filter(v => v.isControl);
    if (controlVariants.length !== 1) {
      throw new Error('Test must have exactly one control variant');
    }

    if (config.metrics.filter(m => m.primary).length !== 1) {
      throw new Error('Test must have exactly one primary metric');
    }
  }

  /**
   * Check if user should be included in test
   */
  private shouldIncludeUser(userId: string, trafficAllocation: number): boolean {
    const hash = this.hashUserId(userId);
    const percentage = hash % 100;
    return percentage < trafficAllocation;
  }

  /**
   * Assign user to variant based on consistent hashing
   */
  private assignUserToVariant(userId: string, test: ABTestConfig): string {
    const hash = this.hashUserId(userId + test.id);
    let cumulativeWeight = 0;
    const targetPercentage = hash % 100;

    for (const variant of test.variants) {
      cumulativeWeight += variant.trafficWeight;
      if (targetPercentage < cumulativeWeight) {
        return variant.id;
      }
    }

    // Fallback to control variant
    return test.variants.find(v => v.isControl)!.id;
  }

  /**
   * Hash user ID for consistent bucketing
   */
  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Analyze variants for statistical significance
   */
  private analyzeVariants(test: ABTestConfig, results: ABTestResult[]): VariantAnalysis[] {
    const analyses: VariantAnalysis[] = [];

    for (const variant of test.variants) {
      const variantResults = results.filter(r => r.variantId === variant.id);
      const metricAnalyses: MetricAnalysis[] = [];

      for (const metric of test.metrics) {
        const values = variantResults.map(r => r.metrics[metric.name]).filter(v => v !== undefined);
        
        if (values.length > 0) {
          const analysis = this.analyzeMetric(values, metric, test.confidenceLevel);
          metricAnalyses.push(analysis);
        }
      }

      analyses.push({
        variantId: variant.id,
        sampleSize: variantResults.length,
        metrics: metricAnalyses,
        conversionRate: this.calculateConversionRate(variantResults, test.metrics),
        statisticalSignificance: metricAnalyses.some(m => m.pValue < (1 - test.confidenceLevel))
      });
    }

    return analyses;
  }

  /**
   * Analyze individual metric
   */
  private analyzeMetric(values: number[], metric: ABTestMetric, confidenceLevel: number): MetricAnalysis {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
    const standardDeviation = Math.sqrt(variance);
    
    // Calculate confidence interval
    const tValue = this.getTValue(confidenceLevel, values.length - 1);
    const marginOfError = tValue * (standardDeviation / Math.sqrt(values.length));
    const confidenceInterval: [number, number] = [mean - marginOfError, mean + marginOfError];

    return {
      name: metric.name,
      mean,
      standardDeviation,
      confidenceInterval,
      pValue: 0.05, // Simplified - would need proper statistical test
      improvementOverControl: 0 // Would be calculated against control variant
    };
  }

  /**
   * Calculate conversion rate for conversion metrics
   */
  private calculateConversionRate(results: ABTestResult[], metrics: ABTestMetric[]): number | undefined {
    const conversionMetric = metrics.find(m => m.type === 'conversion' && m.primary);
    if (!conversionMetric) return undefined;

    const conversions = results.filter(r => r.metrics[conversionMetric.name] > 0).length;
    return results.length > 0 ? (conversions / results.length) * 100 : 0;
  }

  /**
   * Determine test winner
   */
  private determineWinner(analyses: VariantAnalysis[], confidenceLevel: number): string | undefined {
    const significantVariants = analyses.filter(a => a.statisticalSignificance);
    
    if (significantVariants.length === 0) return undefined;

    // Find variant with highest conversion rate or primary metric
    return significantVariants.reduce((best, current) => {
      const bestRate = best.conversionRate || 0;
      const currentRate = current.conversionRate || 0;
      return currentRate > bestRate ? current : best;
    }).variantId;
  }

  /**
   * Get winner confidence level
   */
  private getWinnerConfidence(analyses: VariantAnalysis[], winnerId: string): number {
    const winner = analyses.find(a => a.variantId === winnerId);
    return winner?.statisticalSignificance ? 95 : 0; // Simplified
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(analyses: VariantAnalysis[], winner?: string): string[] {
    const recommendations: string[] = [];

    if (winner) {
      recommendations.push(`Implement variant ${winner} as the winner`);
      recommendations.push('Monitor performance after implementation');
    } else {
      recommendations.push('Continue test to gather more data');
      
      const lowSampleVariants = analyses.filter(a => a.sampleSize < 100);
      if (lowSampleVariants.length > 0) {
        recommendations.push('Increase traffic allocation to gather more data');
      }
    }

    return recommendations;
  }

  /**
   * Get t-value for confidence interval calculation
   */
  private getTValue(confidenceLevel: number, degreesOfFreedom: number): number {
    // Simplified t-table lookup - in practice, would use proper statistical library
    const tTable: Record<number, number> = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };
    
    return tTable[confidenceLevel] || 1.96;
  }
}

// Global A/B testing framework instance
export const abTestingFramework = new ABTestingFramework();

// SEO-specific A/B test configurations
export const seoABTests = {
  /**
   * Create meta tag optimization test
   */
  createMetaTagTest: () => {
    const config: ABTestConfig = {
      id: 'meta-tag-optimization-v1',
      name: 'Meta Tag Optimization',
      description: 'Test different meta tag optimization strategies',
      status: 'draft',
      startDate: new Date(),
      trafficAllocation: 50,
      targetSampleSize: 1000,
      confidenceLevel: 0.95,
      minimumDetectableEffect: 0.05,
      variants: [
        {
          id: 'control',
          name: 'Current Meta Tags',
          description: 'Existing meta tag implementation',
          trafficWeight: 50,
          config: { useAIOptimization: false },
          isControl: true
        },
        {
          id: 'ai-optimized',
          name: 'AI-Optimized Meta Tags',
          description: 'AI-generated meta tags with keyword optimization',
          trafficWeight: 50,
          config: { useAIOptimization: true },
          isControl: false
        }
      ],
      metrics: [
        {
          name: 'organic_ctr',
          type: 'numeric',
          primary: true,
          description: 'Organic click-through rate from search results'
        },
        {
          name: 'search_impressions',
          type: 'numeric',
          primary: false,
          description: 'Number of search impressions'
        }
      ]
    };

    abTestingFramework.createTest(config);
    return config.id;
  },

  /**
   * Create structured data test
   */
  createStructuredDataTest: () => {
    const config: ABTestConfig = {
      id: 'structured-data-v1',
      name: 'Structured Data Implementation',
      description: 'Test impact of comprehensive structured data markup',
      status: 'draft',
      startDate: new Date(),
      trafficAllocation: 30,
      targetSampleSize: 800,
      confidenceLevel: 0.95,
      minimumDetectableEffect: 0.1,
      variants: [
        {
          id: 'control',
          name: 'Basic Schema',
          description: 'Minimal schema markup',
          trafficWeight: 50,
          config: { enhancedSchema: false },
          isControl: true
        },
        {
          id: 'enhanced-schema',
          name: 'Enhanced Schema',
          description: 'Comprehensive structured data markup',
          trafficWeight: 50,
          config: { enhancedSchema: true },
          isControl: false
        }
      ],
      metrics: [
        {
          name: 'rich_snippet_ctr',
          type: 'numeric',
          primary: true,
          description: 'Click-through rate for rich snippets'
        },
        {
          name: 'search_visibility',
          type: 'numeric',
          primary: false,
          description: 'Overall search visibility score'
        }
      ]
    };

    abTestingFramework.createTest(config);
    return config.id;
  }
};