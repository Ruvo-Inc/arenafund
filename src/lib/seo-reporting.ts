/**
 * SEO Automated Reporting System
 * Generates and sends automated reports for SEO performance and AI mentions
 */

import { SEOAnalyticsService, SEOPerformanceMetrics, PerformanceAlert } from './seo-analytics';

export interface ReportConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  includeAlerts: boolean;
  includeAIMentions: boolean;
  includeRankings: boolean;
  includePerformance: boolean;
  customMetrics?: string[];
}

export interface SEOReport {
  id: string;
  generatedAt: Date;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    organicTraffic: number;
    trafficChange: number;
    averageRanking: number;
    rankingChange: number;
    totalKeywords: number;
    topRankingKeywords: number;
    aiMentions: number;
    activeAlerts: number;
  };
  details: {
    topPerformingKeywords: Array<{
      keyword: string;
      position: number;
      clicks: number;
      impressions: number;
    }>;
    declinedKeywords: Array<{
      keyword: string;
      position: number;
      previousPosition: number;
      change: number;
    }>;
    aiMentionHighlights: Array<{
      source: string;
      query: string;
      sentiment: string;
      accuracy: number;
    }>;
    criticalAlerts: PerformanceAlert[];
  };
  recommendations: string[];
}

export class SEOReportingService {
  private analyticsService: SEOAnalyticsService;
  private emailService: any; // Would integrate with your email service

  constructor(analyticsService: SEOAnalyticsService, emailService?: any) {
    this.analyticsService = analyticsService;
    this.emailService = emailService;
  }

  /**
   * Generate a comprehensive SEO report
   */
  async generateReport(config: ReportConfig, period: { startDate: string; endDate: string }): Promise<SEOReport> {
    const reportId = `seo-report-${Date.now()}`;
    
    try {
      // Fetch current metrics
      const currentMetrics = await this.analyticsService.getPerformanceMetrics();
      
      // Fetch rankings data
      const rankings = await this.analyticsService.fetchSearchConsoleData(
        period.startDate,
        period.endDate
      );

      // Fetch AI mentions
      const aiMentions = await this.analyticsService.monitorAIMentions([
        'Arena Fund',
        'AI venture capital',
        'enterprise AI investment',
        'B2B AI startup funding'
      ]);

      // Fetch alerts
      const alerts = await this.analyticsService.generateAlerts(currentMetrics);

      // Calculate previous period for comparison
      const previousPeriod = this.calculatePreviousPeriod(period);
      const previousRankings = await this.analyticsService.fetchSearchConsoleData(
        previousPeriod.startDate,
        previousPeriod.endDate
      );

      // Generate report
      const report: SEOReport = {
        id: reportId,
        generatedAt: new Date(),
        period,
        summary: this.generateSummary(currentMetrics, rankings, previousRankings, aiMentions, alerts),
        details: this.generateDetails(rankings, previousRankings, aiMentions, alerts),
        recommendations: this.generateRecommendations(currentMetrics, rankings, alerts),
      };

      return report;
    } catch (error) {
      console.error('Error generating SEO report:', error);
      throw error;
    }
  }

  /**
   * Generate report summary
   */
  private generateSummary(
    currentMetrics: SEOPerformanceMetrics,
    rankings: any[],
    previousRankings: any[],
    aiMentions: any[],
    alerts: PerformanceAlert[]
  ) {
    const currentTraffic = rankings.reduce((sum, r) => sum + r.clicks, 0);
    const previousTraffic = previousRankings.reduce((sum, r) => sum + r.clicks, 0);
    const trafficChange = previousTraffic > 0 ? ((currentTraffic - previousTraffic) / previousTraffic) * 100 : 0;

    const currentAvgRanking = rankings.length > 0 
      ? rankings.reduce((sum, r) => sum + r.currentRank, 0) / rankings.length 
      : 0;
    const previousAvgRanking = previousRankings.length > 0 
      ? previousRankings.reduce((sum, r) => sum + r.currentRank, 0) / previousRankings.length 
      : 0;
    const rankingChange = previousAvgRanking - currentAvgRanking; // Positive is better

    return {
      organicTraffic: currentTraffic,
      trafficChange: Math.round(trafficChange * 100) / 100,
      averageRanking: Math.round(currentAvgRanking * 10) / 10,
      rankingChange: Math.round(rankingChange * 10) / 10,
      totalKeywords: rankings.length,
      topRankingKeywords: rankings.filter(r => r.currentRank <= 10).length,
      aiMentions: aiMentions.length,
      activeAlerts: alerts.filter(a => !a.resolved).length,
    };
  }

  /**
   * Generate detailed report sections
   */
  private generateDetails(
    rankings: any[],
    previousRankings: any[],
    aiMentions: any[],
    alerts: PerformanceAlert[]
  ) {
    // Top performing keywords
    const topPerformingKeywords = rankings
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map(r => ({
        keyword: r.keyword,
        position: r.currentRank,
        clicks: r.clicks,
        impressions: r.impressions,
      }));

    // Declined keywords (comparing with previous period)
    const declinedKeywords = rankings
      .map(current => {
        const previous = previousRankings.find(p => p.keyword === current.keyword);
        if (previous && current.currentRank > previous.currentRank) {
          return {
            keyword: current.keyword,
            position: current.currentRank,
            previousPosition: previous.currentRank,
            change: current.currentRank - previous.currentRank,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.change - a!.change)
      .slice(0, 10) as any[];

    // AI mention highlights
    const aiMentionHighlights = aiMentions
      .filter(m => m.accuracy > 0.8)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5)
      .map(m => ({
        source: m.source,
        query: m.query,
        sentiment: m.sentiment,
        accuracy: m.accuracy,
      }));

    // Critical alerts
    const criticalAlerts = alerts.filter(a => 
      (a.severity === 'critical' || a.severity === 'high') && !a.resolved
    );

    return {
      topPerformingKeywords,
      declinedKeywords,
      aiMentionHighlights,
      criticalAlerts,
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    metrics: SEOPerformanceMetrics,
    rankings: any[],
    alerts: PerformanceAlert[]
  ): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (metrics.coreWebVitals.score < 80) {
      recommendations.push(
        `Improve Core Web Vitals score (currently ${metrics.coreWebVitals.score}). Focus on optimizing LCP, FID, and CLS metrics.`
      );
    }

    // Ranking recommendations
    const lowRankingKeywords = rankings.filter(r => r.currentRank > 20 && r.impressions > 100);
    if (lowRankingKeywords.length > 0) {
      recommendations.push(
        `Optimize content for ${lowRankingKeywords.length} keywords ranking below position 20 but receiving significant impressions.`
      );
    }

    // CTR recommendations
    const lowCTRKeywords = rankings.filter(r => r.currentRank <= 10 && r.clickThroughRate < 0.05);
    if (lowCTRKeywords.length > 0) {
      recommendations.push(
        `Improve meta titles and descriptions for ${lowCTRKeywords.length} top-ranking keywords with low CTR.`
      );
    }

    // Alert-based recommendations
    const trafficAlerts = alerts.filter(a => a.type === 'traffic_drop' && !a.resolved);
    if (trafficAlerts.length > 0) {
      recommendations.push(
        'Investigate recent traffic drops and consider content refresh or technical SEO audit.'
      );
    }

    // AI optimization recommendations
    recommendations.push(
      'Continue optimizing content structure for AI discovery platforms to increase mention frequency and accuracy.'
    );

    return recommendations;
  }

  /**
   * Calculate previous period for comparison
   */
  private calculatePreviousPeriod(period: { startDate: string; endDate: string }) {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const duration = end.getTime() - start.getTime();

    const previousEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000); // Day before start
    const previousStart = new Date(previousEnd.getTime() - duration);

    return {
      startDate: previousStart.toISOString().split('T')[0],
      endDate: previousEnd.toISOString().split('T')[0],
    };
  }

  /**
   * Send report via email
   */
  async sendReport(report: SEOReport, config: ReportConfig): Promise<void> {
    if (!this.emailService) {
      console.log('Email service not configured, skipping report delivery');
      return;
    }

    const emailContent = this.generateEmailContent(report);
    
    try {
      await this.emailService.send({
        to: config.recipients,
        subject: `SEO Performance Report - ${report.period.startDate} to ${report.period.endDate}`,
        html: emailContent,
      });
      
      console.log(`SEO report ${report.id} sent to ${config.recipients.join(', ')}`);
    } catch (error) {
      console.error('Error sending SEO report:', error);
      throw error;
    }
  }

  /**
   * Generate HTML email content for the report
   */
  private generateEmailContent(report: SEOReport): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>SEO Performance Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .metric { display: inline-block; margin: 10px; padding: 15px; background: #fff; border: 1px solid #ddd; border-radius: 4px; }
          .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
          .metric-label { font-size: 14px; color: #666; }
          .section { margin: 20px 0; }
          .alert { padding: 10px; margin: 5px 0; border-radius: 4px; }
          .alert-critical { background: #f8d7da; border: 1px solid #f5c6cb; }
          .alert-high { background: #fff3cd; border: 1px solid #ffeaa7; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f8f9fa; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SEO Performance Report</h1>
          <p>Period: ${report.period.startDate} to ${report.period.endDate}</p>
          <p>Generated: ${report.generatedAt.toLocaleString()}</p>
        </div>

        <div class="section">
          <h2>Summary</h2>
          <div class="metric">
            <div class="metric-value">${report.summary.organicTraffic.toLocaleString()}</div>
            <div class="metric-label">Organic Traffic (${report.summary.trafficChange > 0 ? '+' : ''}${report.summary.trafficChange}%)</div>
          </div>
          <div class="metric">
            <div class="metric-value">${report.summary.averageRanking}</div>
            <div class="metric-label">Average Ranking (${report.summary.rankingChange > 0 ? '+' : ''}${report.summary.rankingChange})</div>
          </div>
          <div class="metric">
            <div class="metric-value">${report.summary.topRankingKeywords}</div>
            <div class="metric-label">Top 10 Keywords</div>
          </div>
          <div class="metric">
            <div class="metric-value">${report.summary.aiMentions}</div>
            <div class="metric-label">AI Mentions</div>
          </div>
        </div>

        ${report.details.criticalAlerts.length > 0 ? `
        <div class="section">
          <h2>Critical Alerts</h2>
          ${report.details.criticalAlerts.map(alert => `
            <div class="alert alert-${alert.severity}">
              <strong>${alert.type.replace('_', ' ').toUpperCase()}:</strong> ${alert.message}
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="section">
          <h2>Top Performing Keywords</h2>
          <table>
            <thead>
              <tr><th>Keyword</th><th>Position</th><th>Clicks</th><th>Impressions</th></tr>
            </thead>
            <tbody>
              ${report.details.topPerformingKeywords.map(kw => `
                <tr>
                  <td>${kw.keyword}</td>
                  <td>#${kw.position}</td>
                  <td>${kw.clicks}</td>
                  <td>${kw.impressions.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Recommendations</h2>
          <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Schedule automated reports
   */
  async scheduleReport(config: ReportConfig): Promise<void> {
    // In a real implementation, this would integrate with a job scheduler
    console.log(`Scheduled ${config.frequency} SEO report for recipients: ${config.recipients.join(', ')}`);
    
    // For demonstration, we'll just log the configuration
    console.log('Report configuration:', {
      frequency: config.frequency,
      includeAlerts: config.includeAlerts,
      includeAIMentions: config.includeAIMentions,
      includeRankings: config.includeRankings,
      includePerformance: config.includePerformance,
    });
  }
}