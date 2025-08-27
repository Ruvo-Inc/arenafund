import { NextRequest, NextResponse } from 'next/server';
import { NewsletterCacheOperations } from '@/lib/newsletter-cache';
import { trackNewsletterPerformance } from '@/lib/newsletter-analytics';

// Performance metrics endpoint for newsletter functionality
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    
    // Get cache statistics
    const cacheStats = NewsletterCacheOperations.getCacheStats();
    
    // Get performance metrics based on request
    const performanceData = {
      cache: cacheStats,
      timestamp: new Date().toISOString(),
      metrics: {
        // These would be populated from your analytics system
        averageModalLoadTime: 0,
        averageApiResponseTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
      }
    };

    // Track the performance check itself
    trackNewsletterPerformance('performance_check', performance.now(), 'ms');

    return NextResponse.json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    console.error('Performance metrics error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve performance metrics'
      },
      { status: 500 }
    );
  }
}

// Clear cache endpoint for performance testing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clearType = searchParams.get('type') || 'all';
    
    if (clearType === 'all') {
      NewsletterCacheOperations.clearCache();
    }
    
    return NextResponse.json({
      success: true,
      message: `Cache cleared: ${clearType}`
    });

  } catch (error) {
    console.error('Cache clear error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to clear cache'
      },
      { status: 500 }
    );
  }
}