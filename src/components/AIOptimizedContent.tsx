/**
 * AI Optimized Content Component
 * Wrapper component that optimizes content for AI model consumption
 */

import { ReactNode, useMemo } from 'react';
import { aiContentSystem } from '@/lib/ai-content-system';

interface AIOptimizedContentProps {
  children: ReactNode;
  content?: string;
  sources?: string[];
  enableFactMarkers?: boolean;
  enableCitations?: boolean;
  className?: string;
}

/**
 * AI Optimized Content wrapper component
 * Automatically optimizes content for AI model consumption and citation
 */
export function AIOptimizedContent({
  children,
  content,
  sources = [],
  enableFactMarkers = true,
  enableCitations = true,
  className,
}: AIOptimizedContentProps) {
  // Optimize content if provided
  const optimizedContent = useMemo(() => {
    if (!content) return null;
    
    try {
      return aiContentSystem.optimizeContent(content, sources);
    } catch (error) {
      console.warn('Failed to optimize content for AI:', error);
      return null;
    }
  }, [content, sources]);

  // Generate optimization report for development
  const optimizationReport = useMemo(() => {
    if (!content || process.env.NODE_ENV !== 'development') return null;
    
    try {
      return aiContentSystem.generateOptimizationReport(content, sources);
    } catch (error) {
      console.warn('Failed to generate optimization report:', error);
      return null;
    }
  }, [content, sources]);

  // Log optimization report in development
  if (optimizationReport && process.env.NODE_ENV === 'development') {
    console.log('AI Content Optimization Report:', optimizationReport);
  }

  return (
    <div className={className}>
      {children}
      
      {/* Development optimization info */}
      {process.env.NODE_ENV === 'development' && optimizedContent && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm opacity-75 hover:opacity-100 transition-opacity">
          <div className="font-bold mb-2">AI Optimization Score</div>
          <div>Overall: {optimizedContent.readabilityMetrics.overallScore}/100</div>
          <div>Structure: {optimizedContent.readabilityMetrics.structureScore}/100</div>
          <div>Clarity: {optimizedContent.readabilityMetrics.clarityScore}/100</div>
          <div>Facts: {optimizedContent.optimizedContent.structuredFacts.length}</div>
          <div>Citations: {optimizedContent.optimizedContent.citationData.length}</div>
        </div>
      )}
    </div>
  );
}

/**
 * AI Fact Marker component
 * Marks content as factual for AI consumption
 */
export function AIFactMarker({ children, confidence = 0.9 }: { children: ReactNode; confidence?: number }) {
  return (
    <span data-ai-fact="true" data-confidence={confidence}>
      {children}
    </span>
  );
}

/**
 * AI Data Point component
 * Marks numerical data for AI extraction
 */
export function AIDataPoint({ children, type = 'metric' }: { children: ReactNode; type?: 'metric' | 'date' | 'currency' | 'percentage' }) {
  return (
    <span data-ai-data="true" data-type={type}>
      {children}
    </span>
  );
}

/**
 * AI Citation component
 * Adds citation reference for AI models
 */
export function AICitation({ children, source, url }: { children: ReactNode; source: string; url?: string }) {
  return (
    <span data-ai-citation="true" data-source={source} data-url={url}>
      {children}
    </span>
  );
}

export default AIOptimizedContent;