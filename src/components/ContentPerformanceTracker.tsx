'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { 
  Content, 
  ContentPerformance,
  OptimizationSuggestion,
  contentManagementSystem 
} from '../lib/content-management';

interface ContentPerformanceTrackerProps {
  contentId?: string;
}

export const ContentPerformanceTracker: React.FC<ContentPerformanceTrackerProps> = ({
  contentId
}) => {
  const [content, setContent] = useState<Content[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(contentId || null);
  const [performance, setPerformance] = useState<ContentPerformance | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (selectedContentId) {
      loadPerformanceData(selectedContentId);
    }
  }, [selectedContentId, timeRange]);

  const loadContent = () => {
    const allContent = contentManagementSystem.getAllContent()
      .filter(item => item.status === 'published');
    setContent(allContent);
    
    if (!selectedContentId && allContent.length > 0) {
      setSelectedContentId(allContent[0].id);
    }
  };

  const loadPerformanceData = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const performanceData = await contentManagementSystem.getContentPerformance(id);
      setPerformance(performanceData);
      
      if (performanceData) {
        const recs = await contentManagementSystem.getPerformanceOptimizationRecommendations(id);
        setRecommendations(recs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return (num * 100).toFixed(1) + '%';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        );
      case 'stable':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  const getPriorityColor = (priority: OptimizationSuggestion['priority']): string => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
    }
  };

  if (content.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Published Content</h3>
        <p className="text-gray-500">Publish some content first to see performance tracking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Content Performance Tracker</h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <select
            value={selectedContentId || ''}
            onChange={(e) => setSelectedContentId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {content.map(item => (
              <option key={item.id} value={item.id}>
                {item.title || 'Untitled'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading performance data...</p>
        </div>
      ) : performance ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(performance.metrics.pageViews)}
                  </div>
                  <div className="text-sm text-gray-500">Page Views</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(performance.metrics.uniqueVisitors)}
                  </div>
                  <div className="text-sm text-gray-500">Unique Visitors</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(performance.metrics.averageTimeOnPage)}s
                  </div>
                  <div className="text-sm text-gray-500">Avg. Time on Page</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatPercentage(performance.metrics.bounceRate)}
                  </div>
                  <div className="text-sm text-gray-500">Bounce Rate</div>
                </div>
              </div>
            </Card>

            {/* Traffic Sources */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Organic Search</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${(performance.traffic.organic / (performance.traffic.organic + performance.traffic.direct + performance.traffic.referral + performance.traffic.social)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(performance.traffic.organic)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Direct</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(performance.traffic.direct / (performance.traffic.organic + performance.traffic.direct + performance.traffic.referral + performance.traffic.social)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(performance.traffic.direct)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Referral</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-purple-500 rounded-full"
                        style={{ width: `${(performance.traffic.referral / (performance.traffic.organic + performance.traffic.direct + performance.traffic.referral + performance.traffic.social)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(performance.traffic.referral)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Social</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-pink-500 rounded-full"
                        style={{ width: `${(performance.traffic.social / (performance.traffic.organic + performance.traffic.direct + performance.traffic.referral + performance.traffic.social)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(performance.traffic.social)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Keyword Rankings */}
            {performance.rankings.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Rankings</h3>
                
                <div className="space-y-3">
                  {performance.rankings.slice(0, 10).map((ranking, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{ranking.keyword}</div>
                        <div className="text-sm text-gray-500">
                          Volume: {formatNumber(ranking.searchVolume)} • Difficulty: {ranking.difficulty}/100
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-medium text-gray-900">#{ranking.position}</div>
                          {ranking.previousPosition !== ranking.position && (
                            <div className="flex items-center text-sm">
                              {getTrendIcon(ranking.trend)}
                              <span className={`ml-1 ${
                                ranking.trend === 'up' ? 'text-green-600' :
                                ranking.trend === 'down' ? 'text-red-600' :
                                'text-gray-500'
                              }`}>
                                {Math.abs(ranking.position - ranking.previousPosition)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* AI Mentions */}
            {performance.aiMentions.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Mentions</h3>
                
                <div className="space-y-4">
                  {performance.aiMentions.slice(0, 5).map((mention, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {mention.source}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            mention.citationIncluded ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {mention.citationIncluded ? 'Cited' : 'Mentioned'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Accuracy: {Math.round(mention.accuracy * 100)}%
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <div className="text-sm font-medium text-gray-700 mb-1">Query:</div>
                        <div className="text-sm text-gray-600 italic">"{mention.query}"</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Context:</div>
                        <div className="text-sm text-gray-600">{mention.context}</div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        {mention.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Performance Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPercentage(performance.metrics.conversionRate)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Social Shares</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(performance.metrics.socialShares)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backlinks</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(performance.metrics.backlinks)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Mentions</span>
                  <span className="text-sm font-medium text-gray-900">
                    {performance.aiMentions.length}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Last updated: {performance.lastUpdated.toLocaleDateString()}
                </div>
              </div>
            </Card>

            {/* Optimization Recommendations */}
            {recommendations.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Recommendations</h3>
                
                <div className="space-y-4">
                  {recommendations.slice(0, 5).map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(rec.priority)}`}>
                          {rec.priority}
                        </span>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Impact: {rec.impact}/10</span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{rec.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                      <p className="text-xs font-medium text-blue-600">{rec.action}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <Button
                  onClick={() => loadPerformanceData(selectedContentId!)}
                  disabled={isLoading}
                  className="w-full"
                  variant="primary"
                >
                  Refresh Data
                </Button>
                
                <Button
                  onClick={() => {
                    // Export performance data
                    const dataStr = JSON.stringify(performance, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `content-performance-${selectedContentId}-${timeRange}.json`;
                    link.click();
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Export Data
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
          <p className="text-gray-500">Performance data will be available after content is published and indexed.</p>
        </div>
      )}
    </div>
  );
};