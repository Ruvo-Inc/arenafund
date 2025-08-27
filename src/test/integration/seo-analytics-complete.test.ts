import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SEOAnalyticsService } from '@/lib/seo-analytics';
import { SEOReportingService } from '@/lib/seo-reporting';

// Store original fetch
const originalFetch = global.fetch;
const mockFetch = vi.fn();

describe('SEO Analytics Complete Integration', () => {
  let analyticsService: SEOAnalyticsService;
  let reportingService: SEOReportingService;

  beforeEach(() => {
    global.fetch = mockFetch;
    analyticsService = new SEOAnalyticsService('test-key', 'https://test.com');
    reportingService = new SEOReportingService(analyticsService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should complete full analytics and reporting workflow', async () => {
    // Mock Search Console API response for all calls
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        rows: [
          {
            keys: ['AI venture capital', 'https://test.com/page'],
            clicks: 100,
            impressions: 1000,
            position: 5.2,
          },
        ],
      }),
    };

    // Set up multiple mock responses for all the calls that will be made
    mockFetch.mockResolvedValue(mockResponse);

    // 1. Test analytics service
    const rankings = await analyticsService.fetchSearchConsoleData('2024-01-01', '2024-01-31');
    expect(rankings).toHaveLength(1);
    expect(rankings[0].keyword).toBe('AI venture capital');
    expect(rankings[0].clicks).toBe(100);

    // 2. Test performance metrics
    const metrics = await analyticsService.getPerformanceMetrics();
    expect(metrics).toMatchObject({
      organicTraffic: expect.any(Number),
      averageRanking: expect.any(Number),
      totalKeywords: expect.any(Number),
      coreWebVitals: expect.any(Object),
    });

    // 3. Test AI mentions monitoring
    const mentions = await analyticsService.monitorAIMentions(['AI venture capital']);
    expect(mentions).toBeInstanceOf(Array);
    expect(mentions.length).toBeGreaterThan(0);

    // 4. Test alert generation
    const alerts = await analyticsService.generateAlerts(metrics);
    expect(alerts).toBeInstanceOf(Array);

    // 5. Test report generation
    const config = {
      frequency: 'weekly' as const,
      recipients: ['test@example.com'],
      includeAlerts: true,
      includeAIMentions: true,
      includeRankings: true,
      includePerformance: true,
    };

    const report = await reportingService.generateReport(config, {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(report).toMatchObject({
      id: expect.stringContaining('seo-report-'),
      generatedAt: expect.any(Date),
      summary: {
        organicTraffic: expect.any(Number),
        averageRanking: expect.any(Number),
        totalKeywords: expect.any(Number),
        aiMentions: expect.any(Number),
      },
      details: {
        topPerformingKeywords: expect.any(Array),
        aiMentionHighlights: expect.any(Array),
      },
      recommendations: expect.any(Array),
    });

    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it('should handle errors gracefully throughout the workflow', async () => {
    // Mock API error
    mockFetch.mockRejectedValue(new Error('API Error'));

    // Analytics should handle errors
    await expect(
      analyticsService.fetchSearchConsoleData('2024-01-01', '2024-01-31')
    ).rejects.toThrow('API Error');

    // Reporting should handle analytics errors
    const config = {
      frequency: 'weekly' as const,
      recipients: ['test@example.com'],
      includeAlerts: true,
      includeAIMentions: true,
      includeRankings: true,
      includePerformance: true,
    };

    await expect(
      reportingService.generateReport(config, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      })
    ).rejects.toThrow();
  });

  it('should validate data consistency across components', async () => {
    // Mock consistent data
    const mockSearchData = {
      rows: [
        {
          keys: ['test keyword', 'https://test.com/page'],
          clicks: 50,
          impressions: 500,
          position: 10.0,
        },
      ],
    };

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockSearchData) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockSearchData) });

    // Get rankings
    const rankings = await analyticsService.fetchSearchConsoleData('2024-01-01', '2024-01-31');
    
    // Get metrics (which uses rankings internally)
    const metrics = await analyticsService.getPerformanceMetrics();

    // Verify consistency
    expect(metrics.organicTraffic).toBe(rankings.reduce((sum, r) => sum + r.clicks, 0));
    expect(metrics.totalKeywords).toBe(rankings.length);
    expect(metrics.averageRanking).toBe(rankings.reduce((sum, r) => sum + r.currentRank, 0) / rankings.length);
  });
});