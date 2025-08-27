/**
 * API route for deployment monitoring and pipeline management
 * Provides endpoints for feature flag management, performance monitoring, and A/B testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { featureFlags, seoFeatures } from '@/lib/feature-flags';
import { performanceMonitor, PerformanceMetrics } from '@/lib/performance-monitoring';
import { abTestingFramework, seoABTests } from '@/lib/ab-testing-framework';
import { logger, seoErrorHandler, seoErrorHandling } from '@/lib/error-handling-logging';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'feature-flags':
        return handleGetFeatureFlags();
      
      case 'performance-summary':
        return handleGetPerformanceSummary(searchParams);
      
      case 'ab-tests':
        return handleGetABTests();
      
      case 'error-metrics':
        return handleGetErrorMetrics();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    await seoErrorHandler.handleError(error as Error, {
      component: 'deployment-api',
      action: action || 'unknown',
      metadata: { searchParams: Object.fromEntries(searchParams) }
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const body = await request.json();

    switch (action) {
      case 'update-feature-flag':
        return handleUpdateFeatureFlag(body);
      
      case 'record-performance':
        return handleRecordPerformance(body);
      
      case 'start-ab-test':
        return handleStartABTest(body);
      
      case 'record-ab-result':
        return handleRecordABResult(body);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    await seoErrorHandler.handleError(error as Error, {
      component: 'deployment-api',
      action: action || 'unknown'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get current feature flag status
 */
async function handleGetFeatureFlags(): Promise<NextResponse> {
  try {
    const flags = featureFlags.getAllFlags();
    
    logger.info('Feature flags retrieved', 'deployment-api', {
      flagCount: Object.keys(flags).length
    });

    return NextResponse.json({
      success: true,
      data: {
        flags,
        seoFeatures: {
          metaTagOptimization: seoFeatures.isMetaTagOptimizationEnabled(),
          structuredData: seoFeatures.isStructuredDataEnabled(),
          aiOptimization: seoFeatures.isAIOptimizationEnabled(),
          performanceMonitoring: seoFeatures.isPerformanceMonitoringEnabled(),
          analyticsTracking: seoFeatures.isAnalyticsTrackingEnabled(),
          localSeo: seoFeatures.isLocalSeoEnabled(),
          contentOptimization: seoFeatures.isContentOptimizationEnabled(),
          abTesting: seoFeatures.isABTestingEnabled()
        }
      }
    });
  } catch (error) {
    await seoErrorHandler.handleError(error as Error, {
      component: 'deployment-api',
      action: 'get-feature-flags'
    });
    return NextResponse.json({ error: 'Failed to retrieve feature flags' }, { status: 500 });
  }
}

/**
 * Update feature flag configuration
 */
async function handleUpdateFeatureFlag(body: any): Promise<NextResponse> {
  try {
    const { flagPath, updates } = body;

    if (!flagPath || !updates) {
      return NextResponse.json(
        { error: 'Missing flagPath or updates' },
        { status: 400 }
      );
    }

    featureFlags.updateFlag(flagPath, updates);
    
    logger.info('Feature flag updated', 'deployment-api', {
      flagPath,
      updates
    });

    return NextResponse.json({
      success: true,
      message: `Feature flag ${flagPath} updated successfully`
    });
  } catch (error) {
    await seoErrorHandler.handleError(error as Error, {
      component: 'deployment-api',
      action: 'update-feature-flag'
    });
    return NextResponse.json({ error: 'Failed to update feature flag' }, { status: 500 });
  }
}

/**
 * Get performance summary
 */
async function handleGetPerformanceSummary(searchParams: URLSearchParams): Promise<NextResponse> {
  try {
    const timeWindow = parseInt(searchParams.get('timeWindow') || '60');
    const summary = performanceMonitor.getPerformanceSummary(timeWindow);
    
    logger.info('Performance summary retrieved', 'deployment-api', {
      timeWindow,
      sampleCount: summary.sampleCount
    });

    return NextResponse.json({
      success: true,
      data: summary
    });
  } catch (error) {
    await seoErrorHandler.handleError(error as Error, {
      component: 'deployment-api',
      action: 'get-performance-summary'
    });
    return NextResponse.json({ error: 'Failed to retrieve performance summary' }, { status: 500 });
  }
}

/**
 * Record performance metrics
 */
async function handleRecordPerformance(body: any): Promise<NextResponse> {
  try {
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      url: body.url || '',
      lcp: body.lcp || 0,
      fid: body.fid || 0,
      cls: body.cls || 0,
      ttfb: body.ttfb || 0,
      seoScore: body.seoScore || 100,
      loadTime: body.loadTime || 0,
      errorRate: body.errorRate || 0,
      userAgent: body.userAgent || ''
    };

    performanceMonitor.recordMetrics(metrics);
    
    logger.info('Performance metrics recorded', 'deployment-api', {
      url: metrics.url,
      lcp: metrics.lcp,
      seoScore: metrics.seoScore
    });

    return NextResponse.json({
      success: true,
      message: 'Performance metrics recorded successfully'
    });
  } catch (error) {
    await seoErrorHandler.handleError(error as Error, {
      component: 'deployment-api',
      action: 'record-performance'
    });
    return NextResponse.json({ error: 'Failed to record performance metrics' }, { status: 500 });
  }
}

/**
 * Get active A/B tests
 */
async function handleGetABTests(): Promise<NextResponse> {
  try {
    const activeTests = abTestingFramework.getActiveTests();
    
    logger.info('A/B tests retrieved', 'deployment-api', {
      activeTestCount: activeTests.length
    });

    return NextResponse.json({
      success: true,
      data: {
        activeTests,
        availableTests: [
          'meta-tag-optimization-v1',
          'structured-data-v1'
        ]
      }
    });
  } catch (error) {
    await seoErrorHandler.handleError(error as Error, {
      component: 'deployment-api',
      action: 'get-ab-tests'
    });
    return NextResponse.json({ error: 'Failed to retrieve A/B tests' }, { status: 500 });
  }
}

/**
 * Start A/B test
 */
async function handleStartABTest(body: any): Promise<NextResponse> {
  try {
    const { testType } = body;

    let testId: string;
    
    switch (testType) {
      case 'meta-tag-optimization':
        testId = seoABTests.createMetaTagTest();
        break;
      case 'structured-data':
        testId = seoABTests.createStructuredDataTest();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        );
    }

    abTestingFramework.startTest(testId);
    
    logger.info('A/B test started', 'deployment-api', {
      testId,
      testType
    });

    return NextResponse.json({
      success: true,
      data: { testId },
      message: `A/B test ${testId} started successfully`
    });
  } catch (error) {
    await seoErrorHandler.handleError(error as Error, {
      component: 'deployment-api',
      action: 'start-ab-test'
    });
    return NextResponse.json({ error: 'Failed to start A/B test' }, { status: 500 });
  }
}

/**
 * Record A/B test result
 */
async function handleRecordABResult(body: any): Promise<NextResponse> {
  try {
    const { testId, variantId, userId, sessionId, metrics, metadata } = body;

    if (!testId || !variantId || !userId || !metrics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    abTestingFramework.recordResult({
      testId,
      variantId,
      userId,
      sessionId: sessionId || '',
      timestamp: Date.now(),
      metrics,
      metadata: metadata || {}
    });
    
    logger.info('A/B test result recorded', 'deployment-api', {
      testId,
      variantId,
      userId
    });

    return NextResponse.json({
      success: true,
      message: 'A/B test result recorded successfully'
    });
  } catch (error) {
    await seoErrorHandler.handleError(error as Error, {
      component: 'deployment-api',
      action: 'record-ab-result'
    });
    return NextResponse.json({ error: 'Failed to record A/B test result' }, { status: 500 });
  }
}

/**
 * Get error metrics
 */
async function handleGetErrorMetrics(): Promise<NextResponse> {
  try {
    const errorMetrics = logger.getErrorMetrics();
    
    return NextResponse.json({
      success: true,
      data: errorMetrics
    });
  } catch (error) {
    await seoErrorHandler.handleError(error as Error, {
      component: 'deployment-api',
      action: 'get-error-metrics'
    });
    return NextResponse.json({ error: 'Failed to retrieve error metrics' }, { status: 500 });
  }
}