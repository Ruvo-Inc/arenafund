/**
 * React hook for local and industry-specific SEO functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  GeographicTarget, 
  IndustryVertical, 
  DEFAULT_GEOGRAPHIC_TARGETS, 
  AI_INDUSTRY_VERTICALS,
  generateLocalBusinessSchema,
  generateIndustrySpecificSchema,
  generateLocationKeywords,
  generateIndustryKeywords,
  optimizeContentForLocation,
  optimizeContentForIndustry,
  generateLocalIndustrySEOData
} from '../lib/local-seo-utils';
import { 
  LocalSEOReport,
  LocalSEORecommendation,
  LocalSearchRanking,
  IndustrySearchRanking,
  localSEOTracker
} from '../lib/local-seo-performance-tracker';

export interface UseLocalSEOOptions {
  enableTracking?: boolean;
  trackingInterval?: number; // in minutes
  defaultLocation?: GeographicTarget;
  defaultVertical?: IndustryVertical;
}

export interface LocalSEOState {
  // Configuration
  selectedLocation: GeographicTarget | null;
  selectedVertical: IndustryVertical | null;
  availableLocations: GeographicTarget[];
  availableVerticals: IndustryVertical[];
  
  // Performance data
  localRankings: LocalSearchRanking[];
  industryRankings: IndustrySearchRanking[];
  performanceReport: LocalSEOReport | null;
  recommendations: LocalSEORecommendation[];
  
  // Loading states
  isLoadingRankings: boolean;
  isLoadingReport: boolean;
  isOptimizing: boolean;
  
  // Error states
  error: string | null;
}

export interface LocalSEOActions {
  // Configuration
  setSelectedLocation: (location: GeographicTarget | null) => void;
  setSelectedVertical: (vertical: IndustryVertical | null) => void;
  
  // Performance tracking
  refreshRankings: () => Promise<void>;
  generateReport: (timeframe?: 'weekly' | 'monthly' | 'quarterly') => Promise<void>;
  
  // Content optimization
  optimizePageForLocation: (content: string, keywords: string[]) => Promise<{
    optimizedContent: string;
    suggestions: string[];
    structuredData: string;
  }>;
  optimizePageForIndustry: (content: string) => Promise<{
    optimizedContent: string;
    suggestions: string[];
    structuredData: string;
  }>;
  
  // SEO data generation
  generateSEOMetadata: (config: {
    title: string;
    description: string;
    url: string;
  }) => {
    title: string;
    description: string;
    keywords: string[];
    structuredData: string[];
  };
  
  // Keyword research
  getLocationKeywords: (baseKeywords: string[]) => string[];
  getIndustryKeywords: () => string[];
  
  // Export functionality
  exportData: (format?: 'json' | 'csv') => string;
}

export function useLocalSEO(options: UseLocalSEOOptions = {}): [LocalSEOState, LocalSEOActions] {
  const {
    enableTracking = false,
    trackingInterval = 60, // 1 hour default
    defaultLocation = DEFAULT_GEOGRAPHIC_TARGETS[0],
    defaultVertical = AI_INDUSTRY_VERTICALS[0]
  } = options;

  // State management
  const [state, setState] = useState<LocalSEOState>({
    selectedLocation: defaultLocation,
    selectedVertical: defaultVertical,
    availableLocations: DEFAULT_GEOGRAPHIC_TARGETS,
    availableVerticals: AI_INDUSTRY_VERTICALS,
    localRankings: [],
    industryRankings: [],
    performanceReport: null,
    recommendations: [],
    isLoadingRankings: false,
    isLoadingReport: false,
    isOptimizing: false,
    error: null
  });

  // Configuration actions
  const setSelectedLocation = useCallback((location: GeographicTarget | null) => {
    setState(prev => ({ ...prev, selectedLocation: location }));
  }, []);

  const setSelectedVertical = useCallback((vertical: IndustryVertical | null) => {
    setState(prev => ({ ...prev, selectedVertical: vertical }));
  }, []);

  // Performance tracking actions
  const refreshRankings = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingRankings: true, error: null }));
    
    try {
      const locationKeywords = state.selectedLocation ? 
        generateLocationKeywords(['venture capital', 'AI investment'], [state.selectedLocation]) : [];
      const industryKeywords = state.selectedVertical ? 
        state.selectedVertical.keywords : [];

      const [localRankings, industryRankings] = await Promise.all([
        localSEOTracker.trackLocalRankings(
          locationKeywords.slice(0, 10), 
          state.availableLocations.map(loc => `${loc.city}, ${loc.state}`)
        ),
        localSEOTracker.trackIndustryRankings(
          industryKeywords.slice(0, 10),
          state.availableVerticals.map(v => v.name)
        )
      ]);

      setState(prev => ({
        ...prev,
        localRankings,
        industryRankings,
        isLoadingRankings: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh rankings',
        isLoadingRankings: false
      }));
    }
  }, [state.selectedLocation, state.selectedVertical, state.availableLocations, state.availableVerticals]);

  const generateReport = useCallback(async (timeframe: 'weekly' | 'monthly' | 'quarterly' = 'monthly') => {
    setState(prev => ({ ...prev, isLoadingReport: true, error: null }));
    
    try {
      const report = await localSEOTracker.generateLocalSEOReport(timeframe);
      
      setState(prev => ({
        ...prev,
        performanceReport: report,
        recommendations: report.recommendations,
        isLoadingReport: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate report',
        isLoadingReport: false
      }));
    }
  }, []);

  // Content optimization actions
  const optimizePageForLocation = useCallback(async (content: string, keywords: string[]) => {
    if (!state.selectedLocation) {
      throw new Error('No location selected for optimization');
    }

    setState(prev => ({ ...prev, isOptimizing: true }));

    try {
      const optimization = optimizeContentForLocation(content, state.selectedLocation, keywords);
      const structuredData = generateLocalBusinessSchema(state.selectedLocation);

      setState(prev => ({ ...prev, isOptimizing: false }));

      return {
        optimizedContent: optimization.optimizedContent,
        suggestions: optimization.suggestions,
        structuredData
      };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isOptimizing: false,
        error: error instanceof Error ? error.message : 'Failed to optimize content'
      }));
      throw error;
    }
  }, [state.selectedLocation]);

  const optimizePageForIndustry = useCallback(async (content: string) => {
    if (!state.selectedVertical) {
      throw new Error('No industry vertical selected for optimization');
    }

    setState(prev => ({ ...prev, isOptimizing: true }));

    try {
      const optimization = optimizeContentForIndustry(content, state.selectedVertical);
      const structuredData = generateIndustrySpecificSchema(state.selectedVertical);

      setState(prev => ({ ...prev, isOptimizing: false }));

      return {
        optimizedContent: optimization.optimizedContent,
        suggestions: optimization.suggestions,
        structuredData
      };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isOptimizing: false,
        error: error instanceof Error ? error.message : 'Failed to optimize content'
      }));
      throw error;
    }
  }, [state.selectedVertical]);

  // SEO metadata generation
  const generateSEOMetadata = useCallback((config: {
    title: string;
    description: string;
    url: string;
  }) => {
    return generateLocalIndustrySEOData({
      baseTitle: config.title,
      baseDescription: config.description,
      location: state.selectedLocation || undefined,
      vertical: state.selectedVertical || undefined,
      url: config.url
    });
  }, [state.selectedLocation, state.selectedVertical]);

  // Keyword research actions
  const getLocationKeywords = useCallback((baseKeywords: string[]) => {
    if (!state.selectedLocation) return [];
    return generateLocationKeywords(baseKeywords, [state.selectedLocation]);
  }, [state.selectedLocation]);

  const getIndustryKeywords = useCallback(() => {
    return generateIndustryKeywords(state.availableVerticals);
  }, [state.availableVerticals]);

  // Export functionality
  const exportData = useCallback((format: 'json' | 'csv' = 'json') => {
    return localSEOTracker.exportPerformanceData(format);
  }, []);

  // Auto-tracking effect
  useEffect(() => {
    if (!enableTracking) return;

    const interval = setInterval(() => {
      refreshRankings();
    }, trackingInterval * 60 * 1000);

    // Initial load
    refreshRankings();

    return () => clearInterval(interval);
  }, [enableTracking, trackingInterval, refreshRankings]);

  // Actions object
  const actions: LocalSEOActions = {
    setSelectedLocation,
    setSelectedVertical,
    refreshRankings,
    generateReport,
    optimizePageForLocation,
    optimizePageForIndustry,
    generateSEOMetadata,
    getLocationKeywords,
    getIndustryKeywords,
    exportData
  };

  return [state, actions];
}

// Utility hook for quick local SEO metadata generation
export function useLocalSEOMetadata(config: {
  title: string;
  description: string;
  url: string;
  location?: GeographicTarget;
  vertical?: IndustryVertical;
}) {
  return generateLocalIndustrySEOData({
    baseTitle: config.title,
    baseDescription: config.description,
    location: config.location,
    vertical: config.vertical,
    url: config.url
  });
}

// Utility hook for location-based keyword generation
export function useLocationKeywords(baseKeywords: string[], location?: GeographicTarget) {
  return location ? generateLocationKeywords(baseKeywords, [location]) : [];
}

// Utility hook for industry keyword generation
export function useIndustryKeywords(verticals: IndustryVertical[] = AI_INDUSTRY_VERTICALS) {
  return generateIndustryKeywords(verticals);
}