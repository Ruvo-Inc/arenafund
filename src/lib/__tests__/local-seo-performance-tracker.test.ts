/**
 * Tests for Local SEO Performance Tracker
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalSEOPerformanceTracker, LocalSearchRanking, IndustrySearchRanking } from '../local-seo-performance-tracker';

describe('LocalSEOPerformanceTracker', () => {
  let tracker: LocalSEOPerformanceTracker;

  beforeEach(() => {
    tracker = new LocalSEOPerformanceTracker();
  });

  describe('generateLocalMetrics', () => {
    it('should generate correct metrics for local rankings', () => {
      const rankings: LocalSearchRanking[] = [
        {
          keyword: 'AI venture capital San Francisco',
          location: 'San Francisco, CA',
          position: 5,
          searchVolume: 1000,
          difficulty: 70,
          url: 'https://arenafund.vc',
          lastChecked: new Date(),
          trend: 'up'
        },
        {
          keyword: 'startup funding San Francisco',
          location: 'San Francisco, CA',
          position: 10,
          searchVolume: 800,
          difficulty: 65,
          url: 'https://arenafund.vc',
          lastChecked: new Date(),
          trend: 'stable'
        },
        {
          keyword: 'AI investment New York',
          location: 'New York, NY',
          position: 15,
          searchVolume: 1200,
          difficulty: 75,
          url: 'https://arenafund.vc',
          lastChecked: new Date(),
          trend: 'down'
        }
      ];

      const metrics = tracker.generateLocalMetrics(rankings);

      expect(metrics.totalLocalKeywords).toBe(3);
      expect(metrics.averageLocalPosition).toBe(10); // (5 + 10 + 15) / 3
      expect(metrics.localVisibilityScore).toBeGreaterThan(0);
      expect(metrics.topPerformingLocations).toHaveLength(2);
      expect(metrics.topPerformingLocations[0].location).toBe('San Francisco, CA');
      expect(metrics.topPerformingLocations[0].averagePosition).toBe(7.5); // (5 + 10) / 2
    });

    it('should handle empty rankings', () => {
      const metrics = tracker.generateLocalMetrics([]);

      expect(metrics.totalLocalKeywords).toBe(0);
      expect(metrics.averageLocalPosition).toBe(0);
      expect(metrics.localVisibilityScore).toBe(0);
      expect(metrics.topPerformingLocations).toHaveLength(0);
    });

    it('should calculate visibility score based on position and volume', () => {
      const highVolumeGoodPosition: LocalSearchRanking = {
        keyword: 'high volume good position',
        location: 'San Francisco, CA',
        position: 1,
        searchVolume: 10000,
        difficulty: 80,
        url: 'https://arenafund.vc',
        lastChecked: new Date(),
        trend: 'up'
      };

      const lowVolumePoorPosition: LocalSearchRanking = {
        keyword: 'low volume poor position',
        location: 'San Francisco, CA',
        position: 50,
        searchVolume: 100,
        difficulty: 30,
        url: 'https://arenafund.vc',
        lastChecked: new Date(),
        trend: 'down'
      };

      const highVolumeMetrics = tracker.generateLocalMetrics([highVolumeGoodPosition]);
      const lowVolumeMetrics = tracker.generateLocalMetrics([lowVolumePoorPosition]);

      expect(highVolumeMetrics.localVisibilityScore).toBeGreaterThan(lowVolumeMetrics.localVisibilityScore);
    });
  });

  describe('generateIndustryMetrics', () => {
    it('should generate correct metrics for industry rankings', () => {
      const rankings: IndustrySearchRanking[] = [
        {
          keyword: 'enterprise AI software',
          industry: 'Enterprise AI Software',
          position: 3,
          searchVolume: 2000,
          difficulty: 80,
          url: 'https://arenafund.vc',
          lastChecked: new Date(),
          trend: 'up'
        },
        {
          keyword: 'AI analytics platform',
          industry: 'AI-Powered Analytics',
          position: 8,
          searchVolume: 1500,
          difficulty: 75,
          url: 'https://arenafund.vc',
          lastChecked: new Date(),
          trend: 'stable'
        }
      ];

      const metrics = tracker.generateIndustryMetrics(rankings);

      expect(metrics.totalIndustryKeywords).toBe(2);
      expect(metrics.averageIndustryPosition).toBe(5.5); // (3 + 8) / 2
      expect(metrics.industryVisibilityScore).toBeGreaterThan(0);
      expect(metrics.topPerformingVerticals).toHaveLength(2);
      expect(metrics.topPerformingVerticals[0].vertical).toBe('Enterprise AI Software');
      expect(metrics.topPerformingVerticals[0].averagePosition).toBe(3);
    });

    it('should handle empty rankings', () => {
      const metrics = tracker.generateIndustryMetrics([]);

      expect(metrics.totalIndustryKeywords).toBe(0);
      expect(metrics.averageIndustryPosition).toBe(0);
      expect(metrics.industryVisibilityScore).toBe(0);
      expect(metrics.topPerformingVerticals).toHaveLength(0);
    });
  });

  describe('generateLocalSEORecommendations', () => {
    it('should generate high priority recommendations for low visibility', () => {
      const localMetrics = {
        totalLocalKeywords: 10,
        averageLocalPosition: 45,
        localVisibilityScore: 20, // Low visibility
        topPerformingLocations: [],
        localSearchTraffic: { organic: 0, local: 0, percentage: 0 }
      };

      const industryMetrics = {
        totalIndustryKeywords: 15,
        averageIndustryPosition: 35,
        industryVisibilityScore: 25, // Low visibility
        topPerformingVerticals: [],
        industrySearchTraffic: { organic: 0, industry: 0, percentage: 0 }
      };

      const recommendations = tracker.generateLocalSEORecommendations(localMetrics, industryMetrics, []);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.priority === 'high')).toBe(true);
      expect(recommendations.some(r => r.type === 'location')).toBe(true);
      expect(recommendations.some(r => r.type === 'industry')).toBe(true);
    });

    it('should prioritize recommendations by importance', () => {
      const localMetrics = {
        totalLocalKeywords: 5, // Low keyword count
        averageLocalPosition: 25,
        localVisibilityScore: 15, // Very low visibility
        topPerformingLocations: [
          { location: 'Poor Location', averagePosition: 50, keywordCount: 2 }
        ],
        localSearchTraffic: { organic: 0, local: 0, percentage: 0 }
      };

      const industryMetrics = {
        totalIndustryKeywords: 8,
        averageIndustryPosition: 30,
        industryVisibilityScore: 20,
        topPerformingVerticals: [],
        industrySearchTraffic: { organic: 0, industry: 0, percentage: 0 }
      };

      const rankings: LocalSearchRanking[] = Array(20).fill(null).map((_, i) => ({
        keyword: `keyword ${i}`,
        location: 'Test Location',
        position: 35 + i, // Many poor rankings
        searchVolume: 500,
        difficulty: 60,
        url: 'https://arenafund.vc',
        lastChecked: new Date(),
        trend: 'stable'
      }));

      const recommendations = tracker.generateLocalSEORecommendations(localMetrics, industryMetrics, rankings);

      // Should be sorted by priority (high first)
      const priorities = recommendations.map(r => r.priority);
      const highIndex = priorities.indexOf('high');
      const mediumIndex = priorities.indexOf('medium');
      const lowIndex = priorities.indexOf('low');

      if (highIndex !== -1 && mediumIndex !== -1) {
        expect(highIndex).toBeLessThan(mediumIndex);
      }
      if (mediumIndex !== -1 && lowIndex !== -1) {
        expect(mediumIndex).toBeLessThan(lowIndex);
      }
    });

    it('should generate content recommendations for low keyword coverage', () => {
      const localMetrics = {
        totalLocalKeywords: 20, // Below threshold of 50
        averageLocalPosition: 15,
        localVisibilityScore: 60,
        topPerformingLocations: [],
        localSearchTraffic: { organic: 0, local: 0, percentage: 0 }
      };

      const industryMetrics = {
        totalIndustryKeywords: 25,
        averageIndustryPosition: 20,
        industryVisibilityScore: 65,
        topPerformingVerticals: [],
        industrySearchTraffic: { organic: 0, industry: 0, percentage: 0 }
      };

      const recommendations = tracker.generateLocalSEORecommendations(localMetrics, industryMetrics, []);

      expect(recommendations.some(r => r.type === 'content')).toBe(true);
      expect(recommendations.some(r => r.title.includes('Content Strategy'))).toBe(true);
    });
  });

  describe('trackLocalRankings', () => {
    it('should track rankings for multiple keywords and locations', async () => {
      const keywords = ['AI venture capital', 'startup funding'];
      const locations = ['San Francisco, CA', 'New York, NY'];

      const rankings = await tracker.trackLocalRankings(keywords, locations);

      expect(rankings).toHaveLength(4); // 2 keywords × 2 locations
      expect(rankings.every(r => r.keyword && r.location && r.position)).toBe(true);
      expect(rankings.every(r => r.searchVolume > 0)).toBe(true);
      expect(rankings.every(r => r.lastChecked instanceof Date)).toBe(true);
    });

    it('should store rankings for historical tracking', async () => {
      const keywords = ['test keyword'];
      const locations = ['Test Location'];

      await tracker.trackLocalRankings(keywords, locations);

      // Check that data was stored (accessing private property for testing)
      const storedData = (tracker as any).localRankings;
      expect(storedData.size).toBeGreaterThan(0);
    });
  });

  describe('trackIndustryRankings', () => {
    it('should track rankings for multiple keywords and industries', async () => {
      const keywords = ['enterprise AI', 'business intelligence'];
      const industries = ['Enterprise AI Software', 'AI-Powered Analytics'];

      const rankings = await tracker.trackIndustryRankings(keywords, industries);

      expect(rankings).toHaveLength(4); // 2 keywords × 2 industries
      expect(rankings.every(r => r.keyword && r.industry && r.position)).toBe(true);
      expect(rankings.every(r => r.searchVolume > 0)).toBe(true);
      expect(rankings.every(r => r.lastChecked instanceof Date)).toBe(true);
    });
  });

  describe('generateLocalSEOReport', () => {
    it('should generate comprehensive report', async () => {
      // First add some test data
      await tracker.trackLocalRankings(['test keyword'], ['Test Location']);
      await tracker.trackIndustryRankings(['test industry keyword'], ['Test Industry']);

      const report = await tracker.generateLocalSEOReport('monthly');

      expect(report.reportDate).toBeInstanceOf(Date);
      expect(report.timeframe).toBe('monthly');
      expect(report.localMetrics).toBeDefined();
      expect(report.industryMetrics).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.topLocalKeywords)).toBe(true);
      expect(Array.isArray(report.topIndustryKeywords)).toBe(true);
    });

    it('should handle different timeframes', async () => {
      const weeklyReport = await tracker.generateLocalSEOReport('weekly');
      const quarterlyReport = await tracker.generateLocalSEOReport('quarterly');

      expect(weeklyReport.timeframe).toBe('weekly');
      expect(quarterlyReport.timeframe).toBe('quarterly');
    });
  });

  describe('exportPerformanceData', () => {
    it('should export data in JSON format', async () => {
      await tracker.trackLocalRankings(['test'], ['location']);
      
      const jsonData = tracker.exportPerformanceData('json');
      const parsed = JSON.parse(jsonData);

      expect(parsed.localRankings).toBeDefined();
      expect(parsed.industryRankings).toBeDefined();
      expect(parsed.exportDate).toBeDefined();
    });

    it('should export data in CSV format', async () => {
      await tracker.trackLocalRankings(['test keyword'], ['test location']);
      await tracker.trackIndustryRankings(['test industry'], ['test vertical']);
      
      const csvData = tracker.exportPerformanceData('csv');

      expect(csvData).toContain('Type,Keyword,Location/Industry,Position');
      expect(csvData).toContain('local,test keyword');
      expect(csvData).toContain('industry,test industry');
    });

    it('should default to JSON format', async () => {
      const data = tracker.exportPerformanceData();
      
      expect(() => JSON.parse(data)).not.toThrow();
    });
  });
});