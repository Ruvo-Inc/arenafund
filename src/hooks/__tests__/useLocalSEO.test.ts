/**
 * Tests for useLocalSEO hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalSEO } from '../useLocalSEO';
import { DEFAULT_GEOGRAPHIC_TARGETS, AI_INDUSTRY_VERTICALS } from '../../lib/local-seo-utils';

// Mock the local SEO tracker
vi.mock('../../lib/local-seo-performance-tracker', () => ({
  localSEOTracker: {
    trackLocalRankings: vi.fn().mockResolvedValue([
      {
        keyword: 'test keyword',
        location: 'Test Location',
        position: 5,
        searchVolume: 1000,
        difficulty: 70,
        url: 'https://arenafund.vc',
        lastChecked: new Date(),
        trend: 'up'
      }
    ]),
    trackIndustryRankings: vi.fn().mockResolvedValue([
      {
        keyword: 'test industry keyword',
        industry: 'Test Industry',
        position: 8,
        searchVolume: 800,
        difficulty: 65,
        url: 'https://arenafund.vc',
        lastChecked: new Date(),
        trend: 'stable'
      }
    ]),
    generateLocalSEOReport: vi.fn().mockResolvedValue({
      reportDate: new Date(),
      timeframe: 'monthly',
      localMetrics: {
        totalLocalKeywords: 10,
        averageLocalPosition: 15,
        localVisibilityScore: 75,
        topPerformingLocations: [],
        localSearchTraffic: { organic: 0, local: 0, percentage: 0 }
      },
      industryMetrics: {
        totalIndustryKeywords: 8,
        averageIndustryPosition: 12,
        industryVisibilityScore: 80,
        topPerformingVerticals: [],
        industrySearchTraffic: { organic: 0, industry: 0, percentage: 0 }
      },
      topLocalKeywords: [],
      topIndustryKeywords: [],
      recommendations: [
        {
          type: 'location',
          priority: 'medium',
          title: 'Test Recommendation',
          description: 'Test description',
          expectedImpact: 'Test impact',
          effort: 'low',
          timeline: '1 month'
        }
      ]
    }),
    exportPerformanceData: vi.fn().mockReturnValue('{"test": "data"}')
  }
}));

describe('useLocalSEO', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useLocalSEO());
      const [state] = result.current;

      expect(state.selectedLocation).toEqual(DEFAULT_GEOGRAPHIC_TARGETS[0]);
      expect(state.selectedVertical).toEqual(AI_INDUSTRY_VERTICALS[0]);
      expect(state.availableLocations).toEqual(DEFAULT_GEOGRAPHIC_TARGETS);
      expect(state.availableVerticals).toEqual(AI_INDUSTRY_VERTICALS);
      expect(state.localRankings).toEqual([]);
      expect(state.industryRankings).toEqual([]);
      expect(state.performanceReport).toBeNull();
      expect(state.recommendations).toEqual([]);
      expect(state.isLoadingRankings).toBe(false);
      expect(state.isLoadingReport).toBe(false);
      expect(state.isOptimizing).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should accept custom default values', () => {
      const customLocation = DEFAULT_GEOGRAPHIC_TARGETS[1];
      const customVertical = AI_INDUSTRY_VERTICALS[1];

      const { result } = renderHook(() => useLocalSEO({
        defaultLocation: customLocation,
        defaultVertical: customVertical
      }));
      const [state] = result.current;

      expect(state.selectedLocation).toEqual(customLocation);
      expect(state.selectedVertical).toEqual(customVertical);
    });
  });

  describe('configuration actions', () => {
    it('should update selected location', () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      act(() => {
        actions.setSelectedLocation(DEFAULT_GEOGRAPHIC_TARGETS[1]);
      });

      const [newState] = result.current;
      expect(newState.selectedLocation).toEqual(DEFAULT_GEOGRAPHIC_TARGETS[1]);
    });

    it('should update selected vertical', () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      act(() => {
        actions.setSelectedVertical(AI_INDUSTRY_VERTICALS[1]);
      });

      const [newState] = result.current;
      expect(newState.selectedVertical).toEqual(AI_INDUSTRY_VERTICALS[1]);
    });

    it('should allow setting null values', () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      act(() => {
        actions.setSelectedLocation(null);
        actions.setSelectedVertical(null);
      });

      const [newState] = result.current;
      expect(newState.selectedLocation).toBeNull();
      expect(newState.selectedVertical).toBeNull();
    });
  });

  describe('performance tracking actions', () => {
    it('should refresh rankings successfully', async () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      await act(async () => {
        await actions.refreshRankings();
      });

      const [newState] = result.current;
      expect(newState.localRankings).toHaveLength(1);
      expect(newState.industryRankings).toHaveLength(1);
      expect(newState.isLoadingRankings).toBe(false);
      expect(newState.error).toBeNull();
    });

    it('should handle ranking refresh errors', async () => {
      const mockError = new Error('API Error');
      const { localSEOTracker } = await import('../../lib/local-seo-performance-tracker');
      vi.mocked(localSEOTracker.trackLocalRankings).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      await act(async () => {
        await actions.refreshRankings();
      });

      const [newState] = result.current;
      expect(newState.error).toBe('API Error');
      expect(newState.isLoadingRankings).toBe(false);
    });

    it('should generate report successfully', async () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      await act(async () => {
        await actions.generateReport('weekly');
      });

      const [newState] = result.current;
      expect(newState.performanceReport).toBeDefined();
      expect(newState.performanceReport?.timeframe).toBe('monthly'); // Mocked value
      expect(newState.recommendations).toHaveLength(1);
      expect(newState.isLoadingReport).toBe(false);
      expect(newState.error).toBeNull();
    });

    it('should handle report generation errors', async () => {
      const mockError = new Error('Report Error');
      const { localSEOTracker } = await import('../../lib/local-seo-performance-tracker');
      vi.mocked(localSEOTracker.generateLocalSEOReport).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      await act(async () => {
        await actions.generateReport();
      });

      const [newState] = result.current;
      expect(newState.error).toBe('Report Error');
      expect(newState.isLoadingReport).toBe(false);
    });
  });

  describe('content optimization actions', () => {
    it('should optimize content for location', async () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      let optimizationResult;
      await act(async () => {
        optimizationResult = await actions.optimizePageForLocation('Test content', ['test keyword']);
      });

      expect(optimizationResult).toBeDefined();
      expect(optimizationResult.suggestions).toBeDefined();
      expect(optimizationResult.structuredData).toBeDefined();
    });

    it('should throw error when no location selected for optimization', async () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      // Set location to null
      act(() => {
        actions.setSelectedLocation(null);
      });

      await act(async () => {
        await expect(actions.optimizePageForLocation('Test content', ['test'])).rejects.toThrow('No location selected');
      });
    });

    it('should optimize content for industry', async () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      let optimizationResult;
      await act(async () => {
        optimizationResult = await actions.optimizePageForIndustry('Test content');
      });

      expect(optimizationResult).toBeDefined();
      expect(optimizationResult.suggestions).toBeDefined();
      expect(optimizationResult.structuredData).toBeDefined();
    });

    it('should throw error when no vertical selected for optimization', async () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      // Set vertical to null
      act(() => {
        actions.setSelectedVertical(null);
      });

      await act(async () => {
        await expect(actions.optimizePageForIndustry('Test content')).rejects.toThrow('No industry vertical selected');
      });
    });
  });

  describe('SEO metadata generation', () => {
    it('should generate SEO metadata with location and vertical', () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      const metadata = actions.generateSEOMetadata({
        title: 'Test Title',
        description: 'Test Description',
        url: '/test'
      });

      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.keywords).toBeDefined();
      expect(metadata.structuredData).toBeDefined();
      expect(metadata.structuredData.length).toBeGreaterThan(0);
    });

    it('should generate metadata without location/vertical when null', () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      // Set both to null
      act(() => {
        actions.setSelectedLocation(null);
        actions.setSelectedVertical(null);
      });

      const metadata = actions.generateSEOMetadata({
        title: 'Test Title',
        description: 'Test Description',
        url: '/test'
      });

      expect(metadata.title).toBe('Test Title');
      expect(metadata.description).toBe('Test Description');
      expect(metadata.structuredData).toHaveLength(0);
    });
  });

  describe('keyword research actions', () => {
    it('should get location keywords when location selected', () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      const keywords = actions.getLocationKeywords(['venture capital', 'AI investment']);

      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.some(k => k.includes(DEFAULT_GEOGRAPHIC_TARGETS[0].city))).toBe(true);
    });

    it('should return empty array when no location selected', () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      // Set location to null
      act(() => {
        actions.setSelectedLocation(null);
      });

      const keywords = actions.getLocationKeywords(['venture capital']);

      expect(keywords).toEqual([]);
    });

    it('should get industry keywords', () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      const keywords = actions.getIndustryKeywords();

      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.some(k => k.includes('AI'))).toBe(true);
    });
  });

  describe('export functionality', () => {
    it('should export data in specified format', () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      const jsonData = actions.exportData('json');
      const csvData = actions.exportData('csv');

      expect(jsonData).toBe('{"test": "data"}');
      expect(csvData).toBe('{"test": "data"}'); // Mocked to return same value
    });

    it('should default to JSON format', () => {
      const { result } = renderHook(() => useLocalSEO());
      const [, actions] = result.current;

      const data = actions.exportData();

      expect(data).toBe('{"test": "data"}');
    });
  });

  describe('auto-tracking', () => {
    it('should not start auto-tracking by default', () => {
      const { result } = renderHook(() => useLocalSEO());
      const [state] = result.current;

      // Should not automatically start loading
      expect(state.isLoadingRankings).toBe(false);
    });

    it('should start auto-tracking when enabled', () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useLocalSEO({
        enableTracking: true,
        trackingInterval: 1 // 1 minute for testing
      }));

      // Should start loading immediately
      const [initialState] = result.current;
      expect(initialState.isLoadingRankings).toBe(true);

      vi.useRealTimers();
    });
  });
});