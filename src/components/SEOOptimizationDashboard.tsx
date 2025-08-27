'use client';

import React, { useState } from 'react';
import { useSEOOptimization } from '../hooks/useSEOOptimization';
import { OptimizationSuggestion } from '../lib/seo-optimization-engine';

interface SEOOptimizationDashboardProps {
  content: string;
  url: string;
  className?: string;
}

export function SEOOptimizationDashboard({ 
  content, 
  url, 
  className = '' 
}: SEOOptimizationDashboardProps) {
  const seo = useSEOOptimization();
  const [isExpanded, setIsExpanded] = useState(false);

  React.useEffect(() => {
    if (content && url) {
      seo.analyzeContent(content, url);
    }
  }, [content, url, seo.analyzeContent]);

  if (seo.isAnalyzing) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Analyzing SEO performance...</span>
        </div>
      </div>
    );
  }

  if (seo.error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="text-red-500">⚠️</div>
          <div>
            <h3 className="text-red-800 font-medium">Analysis Error</h3>
            <p className="text-red-600 text-sm mt-1">{seo.error}</p>
          </div>
        </div>
        <button
          onClick={() => seo.analyzeContent(content, url)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!seo.hasAnalysis || !seo.hasScore) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <p className="text-gray-600">No SEO analysis available. Provide content to analyze.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header with Overall Score */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">SEO Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">
              Last analyzed: {seo.lastAnalyzed?.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <span className={`text-3xl font-bold ${getScoreColor(seo.score!.overall)}`}>
                {seo.score!.overall}
              </span>
              <div className="text-sm">
                <div className={`font-medium ${getScoreColor(seo.score!.overall)}`}>
                  Grade {seo.overallGrade}
                </div>
                <div className="text-gray-500">out of 100</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Score Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(seo.scoreByCategory!).map(([category, score]) => (
            <div key={category} className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-sm text-gray-600 capitalize">{category}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${getScoreBarColor(score)}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Issues */}
      {seo.criticalSuggestions.length > 0 && (
        <div className="p-6 border-b border-gray-200 bg-red-50">
          <h3 className="text-lg font-medium text-red-800 mb-3 flex items-center">
            <span className="mr-2">🚨</span>
            Critical Issues ({seo.criticalSuggestions.length})
          </h3>
          <div className="space-y-3">
            {seo.criticalSuggestions.map((suggestion, index) => (
              <SuggestionCard key={index} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {/* Content Insights */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content Insights</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InsightCard
            label="Word Count"
            value={seo.contentInsights!.wordCount}
            status={getWordCountStatus(seo.contentInsights!.wordCount)}
          />
          <InsightCard
            label="Readability"
            value={seo.contentInsights!.readabilityScore}
            status={getReadabilityStatus(seo.contentInsights!.readabilityScore)}
          />
          <InsightCard
            label="Headings"
            value={seo.contentInsights!.headingCount}
            status={seo.contentInsights!.headingCount >= 3 ? 'good' : 'warning'}
          />
          <InsightCard
            label="Images with Alt"
            value={`${seo.contentInsights!.imagesWithAlt}/${seo.contentInsights!.imageCount}`}
            status={
              seo.contentInsights!.imageCount === 0 || 
              seo.contentInsights!.imagesWithAlt === seo.contentInsights!.imageCount 
                ? 'good' : 'warning'
            }
          />
        </div>
      </div>

      {/* Keyword Insights */}
      {seo.keywordInsights && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Keyword Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Top Keywords</h4>
              <div className="space-y-2">
                {seo.keywordInsights.topKeywords.map(({ keyword, density }) => (
                  <div key={keyword} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 truncate">{keyword}</span>
                    <span className={`text-sm font-medium ${getDensityColor(density)}`}>
                      {density.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Keyword Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Keywords:</span>
                  <span className="font-medium">{seo.keywordInsights.totalKeywords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Keywords:</span>
                  <span className="font-medium text-green-600">{seo.keywordInsights.targetKeywords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Over-optimized:</span>
                  <span className="font-medium text-red-600">{seo.keywordInsights.overOptimized}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Suggestions */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            All Suggestions ({seo.suggestions.length})
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isExpanded ? 'Show Less' : 'Show All'}
          </button>
        </div>
        
        <div className="space-y-3">
          {(isExpanded ? seo.suggestions : seo.suggestions.slice(0, 3)).map((suggestion, index) => (
            <SuggestionCard key={index} suggestion={suggestion} />
          ))}
        </div>
        
        {!isExpanded && seo.suggestions.length > 3 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Show {seo.suggestions.length - 3} more suggestions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: OptimizationSuggestion }) {
  const typeColors = {
    critical: 'border-red-200 bg-red-50',
    important: 'border-yellow-200 bg-yellow-50',
    minor: 'border-blue-200 bg-blue-50'
  };

  const typeIcons = {
    critical: '🚨',
    important: '⚠️',
    minor: 'ℹ️'
  };

  return (
    <div className={`border rounded-lg p-4 ${typeColors[suggestion.type]}`}>
      <div className="flex items-start space-x-3">
        <span className="text-lg">{typeIcons[suggestion.type]}</span>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {suggestion.category}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              suggestion.type === 'critical' ? 'bg-red-100 text-red-800' :
              suggestion.type === 'important' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {suggestion.type}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{suggestion.message}</p>
          {suggestion.fix && (
            <p className="text-xs text-gray-600 bg-white bg-opacity-50 rounded p-2">
              <strong>Fix:</strong> {suggestion.fix}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ 
  label, 
  value, 
  status 
}: { 
  label: string; 
  value: string | number; 
  status: 'good' | 'warning' | 'error' 
}) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${statusColors[status]}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
}

function getScoreBarColor(score: number): string {
  if (score >= 90) return 'bg-green-500';
  if (score >= 80) return 'bg-blue-500';
  if (score >= 70) return 'bg-yellow-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
}

function getWordCountStatus(count: number): 'good' | 'warning' | 'error' {
  if (count >= 300 && count <= 2000) return 'good';
  if (count >= 200) return 'warning';
  return 'error';
}

function getReadabilityStatus(score: number): 'good' | 'warning' | 'error' {
  if (score >= 60 && score <= 70) return 'good';
  if (score >= 50) return 'warning';
  return 'error';
}

function getDensityColor(density: number): string {
  if (density >= 1 && density <= 3) return 'text-green-600';
  if (density > 3) return 'text-red-600';
  return 'text-yellow-600';
}