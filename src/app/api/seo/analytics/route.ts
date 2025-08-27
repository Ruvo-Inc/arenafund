import { NextRequest, NextResponse } from 'next/server';
import { SEOAnalyticsService } from '@/lib/seo-analytics';

const seoAnalytics = new SEOAnalyticsService(
  process.env.GOOGLE_SEARCH_CONSOLE_API_KEY || '',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://arenafund.vc'
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    switch (type) {
      case 'rankings':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate and endDate are required for rankings data' },
            { status: 400 }
          );
        }
        const rankings = await seoAnalytics.fetchSearchConsoleData(startDate, endDate);
        return NextResponse.json({ data: rankings });

      case 'ai-mentions':
        const queries = searchParams.get('queries')?.split(',') || [
          'AI venture capital',
          'Arena Fund',
          'enterprise AI investment',
          'B2B AI startup funding'
        ];
        const mentions = await seoAnalytics.monitorAIMentions(queries);
        return NextResponse.json({ data: mentions });

      case 'performance':
        const metrics = await seoAnalytics.getPerformanceMetrics();
        return NextResponse.json({ data: metrics });

      case 'alerts':
        const currentMetrics = await seoAnalytics.getPerformanceMetrics();
        // In a real implementation, you'd fetch previous metrics from database
        const alerts = await seoAnalytics.generateAlerts(currentMetrics);
        return NextResponse.json({ data: alerts });

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Use: rankings, ai-mentions, performance, or alerts' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SEO Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'resolve-alert':
        // In a real implementation, this would update the alert status in the database
        return NextResponse.json({ success: true, message: 'Alert resolved' });

      case 'update-monitoring':
        // Update monitoring configuration
        return NextResponse.json({ success: true, message: 'Monitoring configuration updated' });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SEO Analytics POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}