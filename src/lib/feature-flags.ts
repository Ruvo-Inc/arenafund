/**
 * Feature flags system for gradual SEO optimization rollout
 * Supports environment-based and percentage-based rollouts
 */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  environment?: string[];
  description: string;
}

export interface FeatureFlagConfig {
  seoOptimization: {
    metaTagOptimization: FeatureFlag;
    structuredDataGeneration: FeatureFlag;
    aiContentOptimization: FeatureFlag;
    performanceMonitoring: FeatureFlag;
    analyticsTracking: FeatureFlag;
    localSeoFeatures: FeatureFlag;
    contentOptimizationEngine: FeatureFlag;
    abTestingFramework: FeatureFlag;
  };
}

// Default feature flag configuration
const defaultFeatureFlags: FeatureFlagConfig = {
  seoOptimization: {
    metaTagOptimization: {
      name: 'meta-tag-optimization',
      enabled: true,
      rolloutPercentage: 100,
      environment: ['production', 'staging'],
      description: 'Automated meta tag generation and optimization'
    },
    structuredDataGeneration: {
      name: 'structured-data-generation',
      enabled: true,
      rolloutPercentage: 100,
      environment: ['production', 'staging'],
      description: 'JSON-LD structured data generation'
    },
    aiContentOptimization: {
      name: 'ai-content-optimization',
      enabled: process.env.NODE_ENV === 'production',
      rolloutPercentage: 50,
      environment: ['production'],
      description: 'AI-powered content optimization and structuring'
    },
    performanceMonitoring: {
      name: 'performance-monitoring',
      enabled: true,
      rolloutPercentage: 100,
      environment: ['production', 'staging'],
      description: 'Core Web Vitals and performance monitoring'
    },
    analyticsTracking: {
      name: 'analytics-tracking',
      enabled: true,
      rolloutPercentage: 100,
      environment: ['production'],
      description: 'SEO analytics and ranking tracking'
    },
    localSeoFeatures: {
      name: 'local-seo-features',
      enabled: false,
      rolloutPercentage: 25,
      environment: ['production'],
      description: 'Geographic and industry-specific SEO features'
    },
    contentOptimizationEngine: {
      name: 'content-optimization-engine',
      enabled: process.env.NODE_ENV === 'production',
      rolloutPercentage: 75,
      environment: ['production', 'staging'],
      description: 'Automated content optimization suggestions'
    },
    abTestingFramework: {
      name: 'ab-testing-framework',
      enabled: false,
      rolloutPercentage: 10,
      environment: ['production'],
      description: 'A/B testing for SEO optimization strategies'
    }
  }
};

class FeatureFlagManager {
  private config: FeatureFlagConfig;
  private userHash: string | null = null;

  constructor(config: FeatureFlagConfig = defaultFeatureFlags) {
    this.config = config;
  }

  /**
   * Check if a feature flag is enabled for the current environment and user
   */
  isEnabled(flagPath: string, userId?: string): boolean {
    const flag = this.getFlag(flagPath);
    if (!flag) return false;

    // Check environment
    if (flag.environment && flag.environment.length > 0) {
      const currentEnv = process.env.NODE_ENV || 'development';
      if (!flag.environment.includes(currentEnv)) {
        return false;
      }
    }

    // Check base enabled state
    if (!flag.enabled) return false;

    // Check rollout percentage
    if (flag.rolloutPercentage >= 100) return true;
    if (flag.rolloutPercentage <= 0) return false;

    // Use consistent hashing for percentage rollout
    const hash = this.getUserHash(userId || 'anonymous');
    const percentage = this.hashToPercentage(hash, flag.name);
    
    return percentage <= flag.rolloutPercentage;
  }

  /**
   * Get feature flag configuration
   */
  getFlag(flagPath: string): FeatureFlag | null {
    const parts = flagPath.split('.');
    let current: any = this.config;
    
    for (const part of parts) {
      current = current[part];
      if (!current) return null;
    }
    
    return current as FeatureFlag;
  }

  /**
   * Update feature flag configuration (for runtime updates)
   */
  updateFlag(flagPath: string, updates: Partial<FeatureFlag>): void {
    const flag = this.getFlag(flagPath);
    if (flag) {
      Object.assign(flag, updates);
    }
  }

  /**
   * Get all feature flags status
   */
  getAllFlags(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    
    const traverse = (obj: any, prefix = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && 'name' in value) {
          result[path] = this.isEnabled(path);
        } else if (typeof value === 'object') {
          traverse(value, path);
        }
      }
    };
    
    traverse(this.config);
    return result;
  }

  private getUserHash(userId: string): string {
    if (this.userHash) return this.userHash;
    
    // Simple hash function for consistent user bucketing
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    this.userHash = Math.abs(hash).toString();
    return this.userHash;
  }

  private hashToPercentage(hash: string, flagName: string): number {
    const combined = hash + flagName;
    let hashValue = 0;
    
    for (let i = 0; i < combined.length; i++) {
      hashValue = ((hashValue << 5) - hashValue) + combined.charCodeAt(i);
      hashValue = hashValue & hashValue;
    }
    
    return Math.abs(hashValue) % 100;
  }
}

// Global feature flag manager instance
export const featureFlags = new FeatureFlagManager();

// Convenience functions for common SEO feature checks
export const seoFeatures = {
  isMetaTagOptimizationEnabled: (userId?: string) => 
    featureFlags.isEnabled('seoOptimization.metaTagOptimization', userId),
  
  isStructuredDataEnabled: (userId?: string) => 
    featureFlags.isEnabled('seoOptimization.structuredDataGeneration', userId),
  
  isAIOptimizationEnabled: (userId?: string) => 
    featureFlags.isEnabled('seoOptimization.aiContentOptimization', userId),
  
  isPerformanceMonitoringEnabled: (userId?: string) => 
    featureFlags.isEnabled('seoOptimization.performanceMonitoring', userId),
  
  isAnalyticsTrackingEnabled: (userId?: string) => 
    featureFlags.isEnabled('seoOptimization.analyticsTracking', userId),
  
  isLocalSeoEnabled: (userId?: string) => 
    featureFlags.isEnabled('seoOptimization.localSeoFeatures', userId),
  
  isContentOptimizationEnabled: (userId?: string) => 
    featureFlags.isEnabled('seoOptimization.contentOptimizationEngine', userId),
  
  isABTestingEnabled: (userId?: string) => 
    featureFlags.isEnabled('seoOptimization.abTestingFramework', userId)
};