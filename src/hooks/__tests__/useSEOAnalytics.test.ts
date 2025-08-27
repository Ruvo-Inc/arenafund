import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSEOAnalytics } from '../useSEOAnalytics';

// Store original fetch and create mock
const originalFetch = global.fetch;
const mockFetch = vi.fn();

describe('useSEOAnalytics', () => {
  beforeEach(() => {
    // Replace global fetch with our mock
    global.fetch = mockFetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

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
      previousRank: 15,
      searchVolume: 500,
      difficulty: 60,
      url: 'https://arenafund.vc/thesis',
      lastChecked: new Date(),
      trend: 'stable' as const,
      clickThroughRate: 0.08,
      impressions: 500,
      clicks: 40,
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

  const mockAlerts = [
    {
      id: 'alert-1',
      type: 'traffic_drop' as const,
      severity: 'high' as const,
      message: 'Organic traffic dropped by 25%',
      data: { current: 750, previous: 1000 },
      timestamp: new Date(),
      resolved: false,
    },
  ];

  const setupMockResponses = () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockPerformanceMetrics }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockRankings }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockAIMentions }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockAlerts }),
      });
  };

  it('should initialize with default state', () => {
    // Mock empty responses to prevent automatic loading
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const { result } = renderHook(() => useSEOAnalytics());

    // Check initial state before any async operations complete
    expect(result.current.performanceMetrics).toBeNull();
    expect(result.current.rankings).toEqual([]);
    expect(result.current.aiMentions).toEqual([]);
    expect(result.current.alerts).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
  });

  it('should load data on mount', async () => {
    setupMockResponses();

    const { result } = renderHook(() => useSEOAnalytics());

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.performanceMetrics).toEqual(mockPerformanceMetrics);
    expect(result.current.rankings).toEqual(mockRankings);
    expect(result.current.aiMentions).toEqual(mockAIMentions);
    expect(result.current.alerts).toEqual(mockAlerts);
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  it('should calculate computed values correctly', async () => {
    setupMockResponses();

    const { result } = renderHook(() => useSEOAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.totalKeywords).toBe(2);
    expect(result.current.topRankingKeywords).toBe(1); // Only one keyword in top 10
    expect(result.current.averagePosition).toBe(10); // (5 + 15) / 2
    expect(result.current.totalAIMentions).toBe(1);
    expect(result.current.activeAlerts).toBe(1);
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useSEOAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.error).toBe('API Error');
    expect(result.current.performanceMetrics).toBeNull();
  });

  it('should refresh data when refreshData is called', async () => {
    setupMockResponses();

    const { result } = renderHook(() => useSEOAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    // Setup new mock responses for refresh
    setupMockResponses();

    // Call refresh
    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.lastUpdated).toBeInstanceOf(Date);
    expect(mockFetch).toHaveBeenCalledTimes(8); // 4 initial + 4 refresh calls
  });

  it('should resolve alerts', async () => {
    setupMockResponses();

    const { result } = renderHook(() => useSEOAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    // Mock successful alert resolution
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await act(async () => {
      await result.current.resolveAlert('alert-1');
    });

    // Check that alert is marked as resolved
    const resolvedAlert = result.current.alerts.find(a => a.id === 'alert-1');
    expect(resolvedAlert?.resolved).toBe(true);
  });

  it('should handle custom date range', async () => {
    const dateRange = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    };

    setupMockResponses();

    renderHook(() => useSEOAnalytics({ dateRange }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        expect.any(Object)
      );
    }, { timeout: 3000 });
  });

  it('should update monitoring configuration', async () => {
    setupMockResponses();

    const { result } = renderHook(() => useSEOAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    const config = { frequency: 'daily', alerts: true };

    // Mock successful config update
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    // Setup mock for data refresh after config update
    setupMockResponses();

    await act(async () => {
      await result.current.updateMonitoringConfig(config);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/seo/analytics',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ action: 'update-monitoring', data: config }),
      })
    );
  });

  it('should handle network errors in individual operations', async () => {
    setupMockResponses();

    const { result } = renderHook(() => useSEOAnalytics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    // Mock network error for alert resolution
    mockFetch.mockRejectedValueOnce(new Error('Network Error'));

    await expect(
      act(async () => {
        await result.current.resolveAlert('alert-1');
      })
    ).rejects.toThrow('Network Error');
  });
});