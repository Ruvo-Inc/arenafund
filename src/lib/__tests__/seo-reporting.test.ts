import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SEOReportingService, ReportConfig } from '../seo-reporting';
import { SEOAnalyticsService } from '../seo-analytics';

// Mock the SEOAnalyticsService
vi.mock('../seo-analytics');

describe('SEOReportingService', () => {
  let reportingService: SEOReportingService;
  let mockAnalyticsService: vi.Mocked<SEOAnalyticsService>;
  let mockEmailService: any;

  const mockPerformanceMetrics = {
    organicTraffic: 1000,
    averageRanking: 12.5,
    totalKeywords: 150,
    topRankingKeywords: 25,
    coreWebVitals: {
      lcp: 2.1,
      fid: 45,
      cls: 0.08,
      score: 92,
    },
    backlinks: 150,
    domainAuthority: 45,
    lastUpdated: new Date(),
  };

  const mockRankings = [
    {
      keyword: 'AI venture capital',
      currentRank: 5,
      previousRank: 6,
      searchVolume: 1000,
      difficulty: 75,
      url: 'https://arenafund.vc',
      lastChecked: new Date(),
      trend: 'up' as const,
      clickThroughRate: 0.12,
      impressions: 1000,
      clicks: 120,
    },
    {
      keyword: 'enterprise AI investment',
      currentRank: 15,
      previousRank: 12,
      searchVolume: 500,
      difficulty: 60,
      url: 'https://arenafund.vc/thesis',
      lastChecked: new Date(),
      trend: 'down' as const,
      clickThroughRate: 0.08,
      impressions: 500,
      clicks: 40,
    },
  ];

  const mockPreviousRankings = [
    {
      keyword: 'AI venture capital',
      currentRank: 6,
      previousRank: 7,
      searchVolume: 1000,
      difficulty: 75,
      url: 'https://arenafund.vc',
      lastChecked: new Date(),
      trend: 'up' as const,
      clickThroughRate: 0.10,
      impressions: 900,
      clicks: 90,
    },
    {
      keyword: 'enterprise AI investment',
      currentRank: 12,
      previousRank: 10,
      searchVolume: 500,
      difficulty: 60,
      url: 'https://arenafund.vc/thesis',
      lastChecked: new Date(),
      trend: 'down' as const,
      clickThroughRate: 0.09,
      impressions: 450,
      clicks: 45,
    },
  ];

  const mockAIMentions = [
    {
      source: 'chatgpt' as const,
      query: 'AI venture capital firms',
      mentionContext: 'Arena Fund is a leading AI venture capital firm...',
      accuracy: 0.95,
      timestamp: new Date(),
      citationIncluded: true,
      sentiment: 'positive' as const,
      relevanceScore: 0.88,
    },
  ];

  beforeEach(() => {
    mockAnalyticsService = {
      getPerformanceMetrics: vi.fn(),
      fetchSearchConsoleData: vi.fn(),
      monitorAIMentions: vi.fn(),
      generateAlerts: vi.fn(),
    } as any;

    mockEmailService = {
      send: vi.fn(),
    };

    reportingService = new SEOReportingService(mockAnalyticsService, mockEmailService);
  });

  describe('generateReport', () => {
    const mockConfig: ReportConfig = {
      frequency: 'weekly',
      recipients: ['test@example.com'],
      includeAlerts: true,
      includeAIMentions: true,
      includeRankings: true,
      includePerformance: true,
    };

    const mockPeriod = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    };

    beforeEach(() => {
      mockAnalyticsService.getPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);
      mockAnalyticsService.fetchSearchConsoleData
        .mockResolvedValueOnce(mockRankings) // Current period
        .mockResolvedValueOnce(mockPreviousRankings); // Previous period
      mockAnalyticsService.monitorAIMentions.mockResolvedValue(mockAIMentions);
      mockAnalyticsService.generateAlerts.mockResolvedValue([]);
    });

    it('should generate a comprehensive report', async () => {
      const report = await reportingService.generateReport(mockConfig, mockPeriod);

      expect(report).toMatchObject({
        id: expect.stringContaining('seo-report-'),
        generatedAt: expect.any(Date),
        period: mockPeriod,
        summary: {
          organicTraffic: 160, // Sum of clicks from rankings
          averageRanking: 10, // Average of 5 and 15
          totalKeywords: 2,
          topRankingKeywords: 1, // Only one keyword in top 10
          aiMentions: 1,
          activeAlerts: 0,
        },
        details: {
          topPerformingKeywords: expect.any(Array),
          declinedKeywords: expect.any(Array),
          aiMentionHighlights: expect.any(Array),
          criticalAlerts: expect.any(Array),
        },
        recommendations: expect.any(Array),
      });

      expect(mockAnalyticsService.getPerformanceMetrics).toHaveBeenCalled();
      expect(mockAnalyticsService.fetchSearchConsoleData).toHaveBeenCalledTimes(2); // Current and previous period
      expect(mockAnalyticsService.monitorAIMentions).toHaveBeenCalled();
      expect(mockAnalyticsService.generateAlerts).toHaveBeenCalled();
    });

    it('should include top performing keywords', async () => {
      const report = await reportingService.generateReport(mockConfig, mockPeriod);

      expect(report.details.topPerformingKeywords).toHaveLength(2);
      expect(report.details.topPerformingKeywords[0]).toMatchObject({
        keyword: 'AI venture capital',
        position: 5,
        clicks: 120,
        impressions: 1000,
      });
    });

    it('should identify declined keywords', async () => {
      const report = await reportingService.generateReport(mockConfig, mockPeriod);

      expect(report.details.declinedKeywords).toHaveLength(1);
      expect(report.details.declinedKeywords[0]).toMatchObject({
        keyword: 'enterprise AI investment',
        position: 15,
        previousPosition: 12,
        change: 3,
      });
    });

    it('should include AI mention highlights', async () => {
      const report = await reportingService.generateReport(mockConfig, mockPeriod);

      expect(report.details.aiMentionHighlights).toHaveLength(1);
      expect(report.details.aiMentionHighlights[0]).toMatchObject({
        source: 'chatgpt',
        query: 'AI venture capital firms',
        sentiment: 'positive',
        accuracy: 0.95,
      });
    });

    it('should generate relevant recommendations', async () => {
      // Mock low Core Web Vitals score to trigger recommendation
      const lowPerformanceMetrics = {
        ...mockPerformanceMetrics,
        coreWebVitals: {
          ...mockPerformanceMetrics.coreWebVitals,
          score: 70,
        },
      };
      
      // Reset and setup new mocks for this test
      mockAnalyticsService.getPerformanceMetrics.mockReset();
      mockAnalyticsService.fetchSearchConsoleData.mockReset();
      mockAnalyticsService.monitorAIMentions.mockReset();
      mockAnalyticsService.generateAlerts.mockReset();
      
      mockAnalyticsService.getPerformanceMetrics.mockResolvedValue(lowPerformanceMetrics);
      mockAnalyticsService.fetchSearchConsoleData
        .mockResolvedValueOnce(mockRankings)
        .mockResolvedValueOnce(mockPreviousRankings);
      mockAnalyticsService.monitorAIMentions.mockResolvedValue(mockAIMentions);
      mockAnalyticsService.generateAlerts.mockResolvedValue([]);

      const report = await reportingService.generateReport(mockConfig, mockPeriod);



      expect(report.recommendations.some(rec => rec.includes('Core Web Vitals'))).toBe(true);
      expect(report.recommendations.some(rec => rec.includes('AI discovery'))).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      mockAnalyticsService.getPerformanceMetrics.mockRejectedValue(new Error('API Error'));

      await expect(
        reportingService.generateReport(mockConfig, mockPeriod)
      ).rejects.toThrow('API Error');
    });
  });

  describe('sendReport', () => {
    const mockReport = {
      id: 'test-report',
      generatedAt: new Date(),
      period: { startDate: '2024-01-01', endDate: '2024-01-31' },
      summary: {
        organicTraffic: 1000,
        trafficChange: 10,
        averageRanking: 12.5,
        rankingChange: -2,
        totalKeywords: 150,
        topRankingKeywords: 25,
        aiMentions: 5,
        activeAlerts: 2,
      },
      details: {
        topPerformingKeywords: [],
        declinedKeywords: [],
        aiMentionHighlights: [],
        criticalAlerts: [],
      },
      recommendations: ['Test recommendation'],
    };

    const mockConfig: ReportConfig = {
      frequency: 'weekly',
      recipients: ['test@example.com'],
      includeAlerts: true,
      includeAIMentions: true,
      includeRankings: true,
      includePerformance: true,
    };

    it('should send report via email', async () => {
      mockEmailService.send.mockResolvedValue(true);

      await reportingService.sendReport(mockReport, mockConfig);

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: mockConfig.recipients,
        subject: expect.stringContaining('SEO Performance Report'),
        html: expect.stringContaining('SEO Performance Report'),
      });
    });

    it('should handle missing email service', async () => {
      const serviceWithoutEmail = new SEOReportingService(mockAnalyticsService);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await serviceWithoutEmail.sendReport(mockReport, mockConfig);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Email service not configured, skipping report delivery'
      );

      consoleSpy.mockRestore();
    });

    it('should handle email sending errors', async () => {
      mockEmailService.send.mockRejectedValue(new Error('Email Error'));

      await expect(
        reportingService.sendReport(mockReport, mockConfig)
      ).rejects.toThrow('Email Error');
    });
  });

  describe('scheduleReport', () => {
    it('should schedule reports with given configuration', async () => {
      const config: ReportConfig = {
        frequency: 'daily',
        recipients: ['test@example.com'],
        includeAlerts: true,
        includeAIMentions: true,
        includeRankings: true,
        includePerformance: true,
      };

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await reportingService.scheduleReport(config);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Scheduled daily SEO report')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('generateEmailContent', () => {
    it('should generate HTML email content', () => {
      const mockReport = {
        id: 'test-report',
        generatedAt: new Date(),
        period: { startDate: '2024-01-01', endDate: '2024-01-31' },
        summary: {
          organicTraffic: 1000,
          trafficChange: 10,
          averageRanking: 12.5,
          rankingChange: -2,
          totalKeywords: 150,
          topRankingKeywords: 25,
          aiMentions: 5,
          activeAlerts: 0,
        },
        details: {
          topPerformingKeywords: [
            { keyword: 'test keyword', position: 5, clicks: 100, impressions: 1000 },
          ],
          declinedKeywords: [],
          aiMentionHighlights: [],
          criticalAlerts: [],
        },
        recommendations: ['Test recommendation'],
      };

      // Access private method for testing
      const generateEmailContent = (reportingService as any).generateEmailContent;
      const emailContent = generateEmailContent(mockReport);

      expect(emailContent).toContain('SEO Performance Report');
      expect(emailContent).toContain('1,000'); // Formatted traffic number
      expect(emailContent).toContain('+10%'); // Traffic change
      expect(emailContent).toContain('test keyword'); // Top performing keyword
      expect(emailContent).toContain('Test recommendation'); // Recommendation
    });
  });

  describe('calculatePreviousPeriod', () => {
    it('should calculate correct previous period', () => {
      const period = {
        startDate: '2024-01-15',
        endDate: '2024-01-31',
      };

      // Access private method for testing
      const calculatePreviousPeriod = (reportingService as any).calculatePreviousPeriod;
      const previousPeriod = calculatePreviousPeriod(period);

      expect(previousPeriod.startDate).toBe('2023-12-29'); // 17 days before Jan 15
      expect(previousPeriod.endDate).toBe('2024-01-14'); // Day before start
    });
  });
});