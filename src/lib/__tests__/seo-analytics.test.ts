import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SEOAnalyticsService } from '../seo-analytics';

// Store original fetch
const originalFetch = global.fetch;

// Mock fetch
const mockFetch = vi.fn();

describe('SEOAnalyticsService', () => {
  let service: SEOAnalyticsService;
  const mockApiKey = 'test-api-key';
  const mockSiteUrl = 'https://test-site.com';

  beforeEach(() => {
    // Replace global fetch with our mock
    global.fetch = mockFetch;
    service = new SEOAnalyticsService(mockApiKey, mockSiteUrl);
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe('fetchSearchConsoleData', () => {
    it('should fetch and transform search console data successfully', async () => {
      const mockResponse = {
        rows: [
          {
            keys: ['test keyword', 'https://test-site.com/page'],
            clicks: 100,
            impressions: 1000,
            position: 5.2,
          },
          {
            keys: ['another keyword', 'https://test-site.com/other'],
            clicks: 50,
            impressions: 500,
            position: 12.1,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.fetchSearchConsoleData('2024-01-01', '2024-01-31');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('webmasters/v3/sites'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          },
        })
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        keyword: 'test keyword',
        currentRank: 5.2,
        clicks: 100,
        impressions: 1000,
        clickThroughRate: 0.1,
      });
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(
        service.fetchSearchConsoleData('2024-01-01', '2024-01-31')
      ).rejects.toThrow('Search Console API error: Unauthorized');
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await service.fetchSearchConsoleData('2024-01-01', '2024-01-31');
      expect(result).toEqual([]);
    });
  });

  describe('monitorAIMentions', () => {
    it('should monitor AI mentions for given queries', async () => {
      const queries = ['AI venture capital', 'Arena Fund'];
      const result = await service.monitorAIMentions(queries);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      
      // Check structure of AI mention data
      if (result.length > 0) {
        expect(result[0]).toMatchObject({
          source: expect.any(String),
          query: expect.any(String),
          mentionContext: expect.any(String),
          accuracy: expect.any(Number),
          timestamp: expect.any(Date),
          citationIncluded: expect.any(Boolean),
          sentiment: expect.stringMatching(/^(positive|neutral|negative)$/),
          relevanceScore: expect.any(Number),
        });
      }
    });

    it('should handle errors in AI mention monitoring', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const queries = ['test query'];
      const result = await service.monitorAIMentions(queries);

      // Should return empty array on error, not throw
      expect(result).toBeInstanceOf(Array);
      
      consoleSpy.mockRestore();
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return comprehensive performance metrics', async () => {
      // Mock the fetchSearchConsoleData method
      const mockRankingData = [
        {
          keyword: 'test keyword',
          currentRank: 5,
          clicks: 100,
          impressions: 1000,
          clickThroughRate: 0.1,
          searchVolume: 1000,
          difficulty: 50,
          url: 'https://test-site.com',
          lastChecked: new Date(),
          trend: 'stable' as const,
          previousRank: 5,
        },
      ];

      vi.spyOn(service, 'fetchSearchConsoleData').mockResolvedValue(mockRankingData);

      const result = await service.getPerformanceMetrics();

      expect(result).toMatchObject({
        organicTraffic: 100,
        averageRanking: 5,
        totalKeywords: 1,
        topRankingKeywords: 1,
        coreWebVitals: {
          lcp: expect.any(Number),
          fid: expect.any(Number),
          cls: expect.any(Number),
          score: expect.any(Number),
        },
        backlinks: expect.any(Number),
        domainAuthority: expect.any(Number),
        lastUpdated: expect.any(Date),
      });
    });

    it('should handle errors in performance metrics calculation', async () => {
      vi.spyOn(service, 'fetchSearchConsoleData').mockRejectedValue(new Error('API Error'));

      await expect(service.getPerformanceMetrics()).rejects.toThrow('API Error');
    });
  });

  describe('generateAlerts', () => {
    const mockCurrentMetrics = {
      organicTraffic: 1000,
      averageRanking: 15,
      totalKeywords: 100,
      topRankingKeywords: 20,
      coreWebVitals: {
        lcp: 2.1,
        fid: 45,
        cls: 0.08,
        score: 75, // Below 80 threshold
      },
      backlinks: 150,
      domainAuthority: 45,
      lastUpdated: new Date(),
    };

    it('should generate traffic drop alert', async () => {
      const previousMetrics = {
        ...mockCurrentMetrics,
        organicTraffic: 1500, // 33% drop
      };

      const alerts = await service.generateAlerts(mockCurrentMetrics, previousMetrics);
      
      const trafficAlert = alerts.find(a => a.type === 'traffic_drop');
      expect(trafficAlert).toBeDefined();
      expect(trafficAlert?.severity).toBe('high');
      expect(trafficAlert?.message).toContain('33.3%');
    });

    it('should generate ranking drop alert', async () => {
      const previousMetrics = {
        ...mockCurrentMetrics,
        averageRanking: 8, // Dropped by 7 positions
      };

      const alerts = await service.generateAlerts(mockCurrentMetrics, previousMetrics);
      
      const rankingAlert = alerts.find(a => a.type === 'ranking_drop');
      expect(rankingAlert).toBeDefined();
      expect(rankingAlert?.severity).toBe('medium');
    });

    it('should generate performance issue alert', async () => {
      const alerts = await service.generateAlerts(mockCurrentMetrics);
      
      const performanceAlert = alerts.find(a => a.type === 'performance_issue');
      expect(performanceAlert).toBeDefined();
      expect(performanceAlert?.message).toContain('75');
    });

    it('should not generate alerts when metrics are good', async () => {
      const goodMetrics = {
        ...mockCurrentMetrics,
        coreWebVitals: {
          ...mockCurrentMetrics.coreWebVitals,
          score: 95,
        },
      };

      const previousMetrics = {
        ...goodMetrics,
        organicTraffic: 950, // Small increase
        averageRanking: 16, // Small improvement
      };

      const alerts = await service.generateAlerts(goodMetrics, previousMetrics);
      expect(alerts).toHaveLength(0);
    });
  });

  describe('calculateKeywordDifficulty', () => {
    it('should calculate higher difficulty for competitive terms', () => {
      const service = new SEOAnalyticsService(mockApiKey, mockSiteUrl);
      
      // Access private method for testing
      const calculateDifficulty = (service as any).calculateKeywordDifficulty;
      
      const competitiveKeyword = calculateDifficulty('venture capital');
      const nonCompetitiveKeyword = calculateDifficulty('specific long tail keyword phrase');
      
      expect(competitiveKeyword).toBeGreaterThan(nonCompetitiveKeyword);
      expect(competitiveKeyword).toBeGreaterThanOrEqual(0);
      expect(competitiveKeyword).toBeLessThanOrEqual(100);
    });
  });
});