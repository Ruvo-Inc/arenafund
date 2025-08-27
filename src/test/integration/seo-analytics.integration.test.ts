import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001;

describe('SEO Analytics Integration Tests', () => {
  let app: any;
  let handle: any;
  let server: any;

  beforeAll(async () => {
    // Set up Next.js app for testing
    app = next({ dev, hostname, port });
    handle = app.getRequestHandler();
    await app.prepare();

    server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url!, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });

    await new Promise<void>((resolve) => {
      server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('SEO Analytics API', () => {
    const baseUrl = `http://${hostname}:${port}`;

    it('should fetch performance metrics', async () => {
      const response = await fetch(`${baseUrl}/api/seo/analytics?type=performance`);
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data).toMatchObject({
        organicTraffic: expect.any(Number),
        averageRanking: expect.any(Number),
        totalKeywords: expect.any(Number),
        topRankingKeywords: expect.any(Number),
        coreWebVitals: {
          lcp: expect.any(Number),
          fid: expect.any(Number),
          cls: expect.any(Number),
          score: expect.any(Number),
        },
        backlinks: expect.any(Number),
        domainAuthority: expect.any(Number),
        lastUpdated: expect.any(String),
      });
    });

    it('should fetch rankings data with date parameters', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      
      const response = await fetch(
        `${baseUrl}/api/seo/analytics?type=rankings&startDate=${startDate}&endDate=${endDate}`
      );
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      
      if (data.data.length > 0) {
        expect(data.data[0]).toMatchObject({
          keyword: expect.any(String),
          currentRank: expect.any(Number),
          clicks: expect.any(Number),
          impressions: expect.any(Number),
          clickThroughRate: expect.any(Number),
        });
      }
    });

    it('should fetch AI mentions data', async () => {
      const response = await fetch(`${baseUrl}/api/seo/analytics?type=ai-mentions`);
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      
      if (data.data.length > 0) {
        expect(data.data[0]).toMatchObject({
          source: expect.any(String),
          query: expect.any(String),
          mentionContext: expect.any(String),
          accuracy: expect.any(Number),
          timestamp: expect.any(String),
          citationIncluded: expect.any(Boolean),
          sentiment: expect.stringMatching(/^(positive|neutral|negative)$/),
          relevanceScore: expect.any(Number),
        });
      }
    });

    it('should fetch alerts data', async () => {
      const response = await fetch(`${baseUrl}/api/seo/analytics?type=alerts`);
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      
      if (data.data.length > 0) {
        expect(data.data[0]).toMatchObject({
          id: expect.any(String),
          type: expect.stringMatching(/^(ranking_drop|traffic_drop|performance_issue|ai_mention)$/),
          severity: expect.stringMatching(/^(low|medium|high|critical)$/),
          message: expect.any(String),
          timestamp: expect.any(String),
          resolved: expect.any(Boolean),
        });
      }
    });

    it('should handle invalid type parameter', async () => {
      const response = await fetch(`${baseUrl}/api/seo/analytics?type=invalid`);
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Invalid type parameter');
    });

    it('should handle missing date parameters for rankings', async () => {
      const response = await fetch(`${baseUrl}/api/seo/analytics?type=rankings`);
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('startDate and endDate are required');
    });

    it('should resolve alerts via POST', async () => {
      const response = await fetch(`${baseUrl}/api/seo/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'resolve-alert',
          data: { alertId: 'test-alert-id' },
        }),
      });
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        message: 'Alert resolved',
      });
    });

    it('should update monitoring configuration via POST', async () => {
      const response = await fetch(`${baseUrl}/api/seo/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-monitoring',
          data: { frequency: 'daily', alerts: true },
        }),
      });
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        message: 'Monitoring configuration updated',
      });
    });
  });

  describe('SEO Reports API', () => {
    const baseUrl = `http://${hostname}:${port}`;

    it('should generate a report', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      
      const response = await fetch(
        `${baseUrl}/api/seo/reports?action=generate&startDate=${startDate}&endDate=${endDate}`
      );
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data).toMatchObject({
        id: expect.stringContaining('seo-report-'),
        generatedAt: expect.any(String),
        period: {
          startDate,
          endDate,
        },
        summary: {
          organicTraffic: expect.any(Number),
          averageRanking: expect.any(Number),
          totalKeywords: expect.any(Number),
          topRankingKeywords: expect.any(Number),
          aiMentions: expect.any(Number),
          activeAlerts: expect.any(Number),
        },
        details: {
          topPerformingKeywords: expect.any(Array),
          declinedKeywords: expect.any(Array),
          aiMentionHighlights: expect.any(Array),
          criticalAlerts: expect.any(Array),
        },
        recommendations: expect.any(Array),
      });
    });

    it('should schedule reports', async () => {
      const response = await fetch(
        `${baseUrl}/api/seo/reports?action=schedule&frequency=weekly&recipients=test@example.com`
      );
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('weekly reports scheduled'),
      });
    });

    it('should generate custom reports via POST', async () => {
      const config = {
        frequency: 'monthly',
        recipients: ['test@example.com'],
        includeAlerts: true,
        includeAIMentions: true,
        includeRankings: true,
        includePerformance: true,
      };

      const period = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      const response = await fetch(`${baseUrl}/api/seo/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-custom',
          config,
          period,
        }),
      });
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data.period).toEqual(period);
    });

    it('should handle missing parameters for report generation', async () => {
      const response = await fetch(`${baseUrl}/api/seo/reports?action=generate`);
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('startDate and endDate are required');
    });
  });

  describe('End-to-End Analytics Workflow', () => {
    const baseUrl = `http://${hostname}:${port}`;

    it('should complete full analytics workflow', async () => {
      // 1. Fetch performance metrics
      const metricsResponse = await fetch(`${baseUrl}/api/seo/analytics?type=performance`);
      expect(metricsResponse.ok).toBe(true);
      const metricsData = await metricsResponse.json();

      // 2. Fetch rankings data
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const rankingsResponse = await fetch(
        `${baseUrl}/api/seo/analytics?type=rankings&startDate=${startDate}&endDate=${endDate}`
      );
      expect(rankingsResponse.ok).toBe(true);
      const rankingsData = await rankingsResponse.json();

      // 3. Fetch AI mentions
      const mentionsResponse = await fetch(`${baseUrl}/api/seo/analytics?type=ai-mentions`);
      expect(mentionsResponse.ok).toBe(true);
      const mentionsData = await mentionsResponse.json();

      // 4. Fetch alerts
      const alertsResponse = await fetch(`${baseUrl}/api/seo/analytics?type=alerts`);
      expect(alertsResponse.ok).toBe(true);
      const alertsData = await alertsResponse.json();

      // 5. Generate comprehensive report
      const reportResponse = await fetch(
        `${baseUrl}/api/seo/reports?action=generate&startDate=${startDate}&endDate=${endDate}`
      );
      expect(reportResponse.ok).toBe(true);
      const reportData = await reportResponse.json();

      // Verify all data is consistent and properly structured
      expect(metricsData.data).toBeDefined();
      expect(rankingsData.data).toBeDefined();
      expect(mentionsData.data).toBeDefined();
      expect(alertsData.data).toBeDefined();
      expect(reportData.data).toBeDefined();

      // Verify report includes all expected sections
      expect(reportData.data.summary).toBeDefined();
      expect(reportData.data.details).toBeDefined();
      expect(reportData.data.recommendations).toBeDefined();
      expect(reportData.data.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle error recovery in analytics workflow', async () => {
      // Test with invalid date range
      const invalidStartDate = '2024-13-01'; // Invalid month
      const endDate = '2024-01-31';

      const response = await fetch(
        `${baseUrl}/api/seo/analytics?type=rankings&startDate=${invalidStartDate}&endDate=${endDate}`
      );

      // Should handle gracefully (either return empty data or proper error)
      expect(response.status).toBeOneOf([200, 400, 500]);
      
      if (response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty('data');
        expect(Array.isArray(data.data)).toBe(true);
      } else {
        const errorData = await response.json();
        expect(errorData).toHaveProperty('error');
      }
    });
  });
});