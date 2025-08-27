'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  SEORankingData, 
  AIMentionData, 
  SEOPerformanceMetrics, 
  PerformanceAlert 
} from '@/lib/seo-analytics';

interface UseSEOAnalyticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

interface UseSEOAnalyticsReturn {
  // Data
  performanceMetrics: SEOPerformanceMetrics | null;
  rankings: SEORankingData[];
  aiMentions: AIMentionData[];
  alerts: PerformanceAlert[];
  
  // State
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  refreshData: () => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  updateMonitoringConfig: (config: any) => Promise<void>;
  
  // Computed values
  totalKeywords: number;
  topRankingKeywords: number;
  averagePosition: number;
  totalAIMentions: number;
  activeAlerts: number;
}

export function useSEOAnalytics(options: UseSEOAnalyticsOptions = {}): UseSEOAnalyticsReturn {
  const {
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    dateRange
  } = options;

  // State
  const [performanceMetrics, setPerformanceMetrics] = useState<SEOPerformanceMetrics | null>(null);
  const [rankings, setRankings] = useState<SEORankingData[]>([]);
  const [aiMentions, setAIMentions] = useState<AIMentionData[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch performance metrics
  const fetchPerformanceMetrics = useCallback(async (): Promise<SEOPerformanceMetrics | null> => {
    try {
      const response = await fetch('/api/seo/analytics?type=performance');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error('Error fetching performance metrics:', err);
      return null;
    }
  }, []);

  // Fetch rankings data
  const fetchRankings = useCallback(async (): Promise<SEORankingData[]> => {
    try {
      const endDate = dateRange?.endDate || new Date().toISOString().split('T')[0];
      const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(`/api/seo/analytics?type=rankings&startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      console.error('Error fetching rankings:', err);
      return [];
    }
  }, [dateRange]);

  // Fetch AI mentions
  const fetchAIMentions = useCallback(async (): Promise<AIMentionData[]> => {
    try {
      const response = await fetch('/api/seo/analytics?type=ai-mentions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      console.error('Error fetching AI mentions:', err);
      return [];
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async (): Promise<PerformanceAlert[]> => {
    try {
      const response = await fetch('/api/seo/analytics?type=alerts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      console.error('Error fetching alerts:', err);
      return [];
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [metricsData, rankingsData, mentionsData, alertsData] = await Promise.all([
        fetchPerformanceMetrics(),
        fetchRankings(),
        fetchAIMentions(),
        fetchAlerts(),
      ]);

      setPerformanceMetrics(metricsData);
      setRankings(rankingsData);
      setAIMentions(mentionsData);
      setAlerts(alertsData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [fetchPerformanceMetrics, fetchRankings, fetchAIMentions, fetchAlerts]);

  // Resolve alert
  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch('/api/seo/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve-alert', data: { alertId } }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
    } catch (err) {
      console.error('Error resolving alert:', err);
      throw err;
    }
  }, []);

  // Update monitoring configuration
  const updateMonitoringConfig = useCallback(async (config: any) => {
    try {
      const response = await fetch('/api/seo/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-monitoring', data: config }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh data after config update
      await refreshData();
    } catch (err) {
      console.error('Error updating monitoring config:', err);
      throw err;
    }
  }, [refreshData]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  // Computed values
  const totalKeywords = rankings.length;
  const topRankingKeywords = rankings.filter(r => r.currentRank <= 10).length;
  const averagePosition = rankings.length > 0 
    ? rankings.reduce((sum, r) => sum + r.currentRank, 0) / rankings.length 
    : 0;
  const totalAIMentions = aiMentions.length;
  const activeAlerts = alerts.filter(a => !a.resolved).length;

  return {
    // Data
    performanceMetrics,
    rankings,
    aiMentions,
    alerts,
    
    // State
    loading,
    error,
    lastUpdated,
    
    // Actions
    refreshData,
    resolveAlert,
    updateMonitoringConfig,
    
    // Computed values
    totalKeywords,
    topRankingKeywords,
    averagePosition,
    totalAIMentions,
    activeAlerts,
  };
}