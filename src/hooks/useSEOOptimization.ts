import { useState, useCallback, useMemo } from 'react';
import { 
  seoOptimizationEngine, 
  ContentAnalysis, 
  SEOScore, 
  InternalLinkingStrategy,
  OptimizationSuggestion 
} from '../lib/seo-optimization-engine';

export interface UseSEOOptimizationOptions {
  autoAnalyze?: boolean;
  debounceMs?: number;
}

export interface SEOOptimizationState {
  analysis: ContentAnalysis | null;
  score: SEOScore | null;
  isAnalyzing: boolean;
  error: string | null;
  lastAnalyzed: Date | null;
}

export function useSEOOptimization(options: UseSEOOptimizationOptions = {}) {
  const { autoAnalyze = false, debounceMs = 500 } = options;
  
  const [state, setState] = useState<SEOOptimizationState>({
    analysis: null,
    score: null,
    isAnalyzing: false,
    error: null,
    lastAnalyzed: null
  });

  const analyzeContent = useCallback(async (content: string, url: string) => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const analysis = seoOptimizationEngine.analyzeContent(content, url);
      const score = seoOptimizationEngine.generateSEOScore(analysis, url);

      setState({
        analysis,
        score,
        isAnalyzing: false,
        error: null,
        lastAnalyzed: new Date()
      });

      return { analysis, score };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  const analyzeInternalLinking = useCallback(async (
    pages: Array<{ url: string; content: string; title: string }>
  ): Promise<InternalLinkingStrategy> => {
    try {
      return seoOptimizationEngine.analyzeInternalLinking(pages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal linking analysis failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  const generateMetaTags = useCallback((content: string, url: string) => {
    try {
      return seoOptimizationEngine.generateMetaTagSuggestions(content, url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Meta tag generation failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setState({
      analysis: null,
      score: null,
      isAnalyzing: false,
      error: null,
      lastAnalyzed: null
    });
  }, []);

  // Memoized computed values
  const suggestions = useMemo(() => {
    return state.score?.suggestions || [];
  }, [state.score]);

  const criticalSuggestions = useMemo(() => {
    return suggestions.filter(s => s.type === 'critical');
  }, [suggestions]);

  const importantSuggestions = useMemo(() => {
    return suggestions.filter(s => s.type === 'important');
  }, [suggestions]);

  const minorSuggestions = useMemo(() => {
    return suggestions.filter(s => s.type === 'minor');
  }, [suggestions]);

  const scoreByCategory = useMemo(() => {
    if (!state.score) return null;
    
    return {
      content: state.score.breakdown.content,
      technical: state.score.breakdown.technical,
      keywords: state.score.breakdown.keywords,
      structure: state.score.breakdown.structure
    };
  }, [state.score]);

  const overallGrade = useMemo(() => {
    if (!state.score) return null;
    
    const score = state.score.overall;
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }, [state.score]);

  const keywordInsights = useMemo(() => {
    if (!state.analysis) return null;

    const densities = Object.entries(state.analysis.keywordDensity);
    const targetKeywords = densities.filter(([keyword]) => 
      ['AI venture capital', 'enterprise AI investment', 'B2B AI startup funding'].includes(keyword)
    );
    
    const overOptimized = densities.filter(([, density]) => density > 3);
    const underOptimized = densities.filter(([, density]) => density < 1);

    return {
      totalKeywords: densities.length,
      targetKeywords: targetKeywords.length,
      overOptimized: overOptimized.length,
      underOptimized: underOptimized.length,
      topKeywords: densities
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([keyword, density]) => ({ keyword, density }))
    };
  }, [state.analysis]);

  const contentInsights = useMemo(() => {
    if (!state.analysis) return null;

    return {
      wordCount: state.analysis.wordCount,
      readabilityScore: state.analysis.readabilityScore,
      headingCount: state.analysis.headingStructure.length,
      imageCount: state.analysis.images.length,
      imagesWithAlt: state.analysis.images.filter(img => img.hasAlt).length,
      internalLinkCount: state.analysis.internalLinks.length,
      externalLinkCount: state.analysis.externalLinks.length
    };
  }, [state.analysis]);

  return {
    // State
    ...state,
    
    // Actions
    analyzeContent,
    analyzeInternalLinking,
    generateMetaTags,
    clearAnalysis,
    
    // Computed values
    suggestions,
    criticalSuggestions,
    importantSuggestions,
    minorSuggestions,
    scoreByCategory,
    overallGrade,
    keywordInsights,
    contentInsights,
    
    // Utilities
    hasAnalysis: !!state.analysis,
    hasScore: !!state.score,
    hasCriticalIssues: criticalSuggestions.length > 0,
    needsImprovement: state.score ? state.score.overall < 70 : false,
    isGoodScore: state.score ? state.score.overall >= 80 : false
  };
}

export type UseSEOOptimizationReturn = ReturnType<typeof useSEOOptimization>;