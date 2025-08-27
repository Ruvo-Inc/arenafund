import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for performance reports
const PerformanceReportSchema = z.object({
  url: z.string().url(),
  timestamp: z.number(),
  metrics: z.array(z.object({
    name: z.string(),
    value: z.number(),
    rating: z.enum(['good', 'needs-improvement', 'poor']),
    delta: z.number(),
    id: z.string(),
    navigationType: z.string(),
  })),
  userAgent: z.string(),
  connectionType: z.string().optional(),
});

type PerformanceReport = z.infer<typeof PerformanceReportSchema>;

// In-memory storage for development (replace with database in production)
const performanceData: PerformanceReport[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const report = PerformanceReportSchema.parse(body);
    
    // Store the performance data
    performanceData.push(report);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance API] Received metrics:', {
        url: report.url,
        metrics: report.metrics.map(m => `${m.name}: ${m.value} (${m.rating})`),
      });
    }
    
    // In production, you would store this in a database
    // await storePerformanceData(report);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Performance API] Error processing report:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    let filteredData = performanceData;
    
    // Filter by URL if provided
    if (url) {
      filteredData = performanceData.filter(report => report.url.includes(url));
    }
    
    // Limit results
    const limitedData = filteredData.slice(-limit);
    
    // Calculate summary statistics
    const summary = calculatePerformanceSummary(limitedData);
    
    return NextResponse.json({
      reports: limitedData,
      summary,
      total: filteredData.length,
    });
  } catch (error) {
    console.error('[Performance API] Error retrieving data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate performance summary statistics
 */
function calculatePerformanceSummary(reports: PerformanceReport[]) {
  if (reports.length === 0) {
    return {
      totalReports: 0,
      averageMetrics: {},
      ratingDistribution: {},
    };
  }
  
  const allMetrics = reports.flatMap(report => report.metrics);
  const metricsByName = allMetrics.reduce((acc, metric) => {
    if (!acc[metric.name]) {
      acc[metric.name] = [];
    }
    acc[metric.name].push(metric);
    return acc;
  }, {} as Record<string, typeof allMetrics>);
  
  const averageMetrics: Record<string, number> = {};
  const ratingDistribution: Record<string, Record<string, number>> = {};
  
  for (const [name, metrics] of Object.entries(metricsByName)) {
    // Calculate average value
    averageMetrics[name] = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
    
    // Calculate rating distribution
    ratingDistribution[name] = {
      good: metrics.filter(m => m.rating === 'good').length,
      'needs-improvement': metrics.filter(m => m.rating === 'needs-improvement').length,
      poor: metrics.filter(m => m.rating === 'poor').length,
    };
  }
  
  return {
    totalReports: reports.length,
    averageMetrics,
    ratingDistribution,
    timeRange: {
      start: Math.min(...reports.map(r => r.timestamp)),
      end: Math.max(...reports.map(r => r.timestamp)),
    },
  };
}