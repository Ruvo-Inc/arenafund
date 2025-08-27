import { NextRequest, NextResponse } from 'next/server';
import { SEOAnalyticsService } from '@/lib/seo-analytics';
import { SEOReportingService, ReportConfig } from '@/lib/seo-reporting';

const seoAnalytics = new SEOAnalyticsService(
  process.env.GOOGLE_SEARCH_CONSOLE_API_KEY || '',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://arenafund.vc'
);

const reportingService = new SEOReportingService(seoAnalytics);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    switch (action) {
      case 'generate':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate and endDate are required for report generation' },
            { status: 400 }
          );
        }

        const config: ReportConfig = {
          frequency: 'weekly',
          recipients: ['team@arenafund.vc'],
          includeAlerts: true,
          includeAIMentions: true,
          includeRankings: true,
          includePerformance: true,
        };

        const report = await reportingService.generateReport(config, { startDate, endDate });
        return NextResponse.json({ data: report });

      case 'schedule':
        const frequency = searchParams.get('frequency') as 'daily' | 'weekly' | 'monthly';
        const recipients = searchParams.get('recipients')?.split(',') || ['team@arenafund.vc'];
        
        const scheduleConfig: ReportConfig = {
          frequency: frequency || 'weekly',
          recipients,
          includeAlerts: true,
          includeAIMentions: true,
          includeRankings: true,
          includePerformance: true,
        };

        await reportingService.scheduleReport(scheduleConfig);
        return NextResponse.json({ 
          success: true, 
          message: `${frequency} reports scheduled for ${recipients.join(', ')}` 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: generate or schedule' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SEO Reports API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config, period } = body;

    switch (action) {
      case 'generate-custom':
        if (!config || !period) {
          return NextResponse.json(
            { error: 'config and period are required' },
            { status: 400 }
          );
        }

        const report = await reportingService.generateReport(config, period);
        return NextResponse.json({ data: report });

      case 'send-report':
        if (!config || !body.report) {
          return NextResponse.json(
            { error: 'config and report are required' },
            { status: 400 }
          );
        }

        await reportingService.sendReport(body.report, config);
        return NextResponse.json({ 
          success: true, 
          message: 'Report sent successfully' 
        });

      case 'update-schedule':
        if (!config) {
          return NextResponse.json(
            { error: 'config is required' },
            { status: 400 }
          );
        }

        await reportingService.scheduleReport(config);
        return NextResponse.json({ 
          success: true, 
          message: 'Report schedule updated' 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SEO Reports POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}