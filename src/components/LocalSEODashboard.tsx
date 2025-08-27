/**
 * Local SEO Dashboard Component
 * Provides interface for managing local and industry-specific SEO optimization
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useLocalSEO } from '../hooks/useLocalSEO';
import { GeographicTarget, IndustryVertical, DEFAULT_GEOGRAPHIC_TARGETS, AI_INDUSTRY_VERTICALS } from '../lib/local-seo-utils';
import { LocalSEORecommendation } from '../lib/local-seo-performance-tracker';

interface LocalSEODashboardProps {
  className?: string;
  enableAutoTracking?: boolean;
}

export function LocalSEODashboard({ className = '', enableAutoTracking = false }: LocalSEODashboardProps) {
  const [state, actions] = useLocalSEO({
    enableTracking: enableAutoTracking,
    trackingInterval: 60 // 1 hour
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'industries' | 'recommendations'>('overview');
  const [contentToOptimize, setContentToOptimize] = useState('');
  const [optimizationResults, setOptimizationResults] = useState<{
    suggestions: string[];
    structuredData: string;
  } | null>(null);

  // Handle content optimization
  const handleOptimizeContent = async (type: 'location' | 'industry') => {
    if (!contentToOptimize.trim()) return;

    try {
      let results;
      if (type === 'location') {
        results = await actions.optimizePageForLocation(contentToOptimize, ['venture capital', 'AI investment']);
      } else {
        results = await actions.optimizePageForIndustry(contentToOptimize);
      }
      
      setOptimizationResults({
        suggestions: results.suggestions,
        structuredData: results.structuredData
      });
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  // Generate sample SEO metadata
  const handleGenerateMetadata = () => {
    const metadata = actions.generateSEOMetadata({
      title: 'Arena Fund - AI Venture Capital',
      description: 'Buyer-validated venture capital for B2B AI startups',
      url: '/sample-page'
    });
    
    console.log('Generated SEO Metadata:', metadata);
  };

  return (
    <div className={`local-seo-dashboard ${className}`}>
      <div className="dashboard-header mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Local & Industry SEO Dashboard</h2>
        <p className="text-gray-600">Optimize your content for geographic and industry-specific search visibility</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'locations', label: 'Locations' },
              { id: 'industries', label: 'Industries' },
              { id: 'recommendations', label: 'Recommendations' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="error-banner mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{state.error}</p>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-tab space-y-6">
          {/* Current Configuration */}
          <div className="config-section bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Current Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Location</label>
                <select
                  value={state.selectedLocation?.city || ''}
                  onChange={(e) => {
                    const location = DEFAULT_GEOGRAPHIC_TARGETS.find(loc => loc.city === e.target.value);
                    actions.setSelectedLocation(location || null);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a location</option>
                  {DEFAULT_GEOGRAPHIC_TARGETS.map((location) => (
                    <option key={location.city} value={location.city}>
                      {location.city}, {location.state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Industry</label>
                <select
                  value={state.selectedVertical?.name || ''}
                  onChange={(e) => {
                    const vertical = AI_INDUSTRY_VERTICALS.find(v => v.name === e.target.value);
                    actions.setSelectedVertical(vertical || null);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an industry</option>
                  {AI_INDUSTRY_VERTICALS.map((vertical) => (
                    <option key={vertical.name} value={vertical.name}>
                      {vertical.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          {state.performanceReport && (
            <div className="metrics-section bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="metric-card p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {state.performanceReport.localMetrics.totalLocalKeywords}
                  </div>
                  <div className="text-sm text-gray-600">Local Keywords</div>
                </div>
                <div className="metric-card p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {state.performanceReport.localMetrics.averageLocalPosition}
                  </div>
                  <div className="text-sm text-gray-600">Avg Local Position</div>
                </div>
                <div className="metric-card p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {state.performanceReport.industryMetrics.totalIndustryKeywords}
                  </div>
                  <div className="text-sm text-gray-600">Industry Keywords</div>
                </div>
                <div className="metric-card p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(state.performanceReport.localMetrics.localVisibilityScore)}%
                  </div>
                  <div className="text-sm text-gray-600">Visibility Score</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="actions-section bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={actions.refreshRankings}
                disabled={state.isLoadingRankings}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isLoadingRankings ? 'Refreshing...' : 'Refresh Rankings'}
              </button>
              <button
                onClick={() => actions.generateReport('monthly')}
                disabled={state.isLoadingReport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isLoadingReport ? 'Generating...' : 'Generate Report'}
              </button>
              <button
                onClick={handleGenerateMetadata}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Generate SEO Metadata
              </button>
              <button
                onClick={() => {
                  const data = actions.exportData('csv');
                  const blob = new Blob([data], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'local-seo-data.csv';
                  a.click();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <div className="locations-tab space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Geographic Targeting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEFAULT_GEOGRAPHIC_TARGETS.map((location) => (
                <div
                  key={location.city}
                  className={`location-card p-4 border rounded-lg cursor-pointer transition-colors ${
                    state.selectedLocation?.city === location.city
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => actions.setSelectedLocation(location)}
                >
                  <h4 className="font-semibold">{location.city}, {location.state}</h4>
                  <p className="text-sm text-gray-600">{location.region}</p>
                  {location.coordinates && (
                    <p className="text-xs text-gray-500 mt-1">
                      {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Location Keywords */}
          {state.selectedLocation && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Location Keywords</h3>
              <div className="keywords-grid">
                {actions.getLocationKeywords(['venture capital', 'AI investment', 'startup funding']).slice(0, 12).map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-2 mb-2"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Industries Tab */}
      {activeTab === 'industries' && (
        <div className="industries-tab space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Industry Verticals</h3>
            <div className="space-y-4">
              {AI_INDUSTRY_VERTICALS.map((vertical) => (
                <div
                  key={vertical.name}
                  className={`vertical-card p-4 border rounded-lg cursor-pointer transition-colors ${
                    state.selectedVertical?.name === vertical.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => actions.setSelectedVertical(vertical)}
                >
                  <h4 className="font-semibold mb-2">{vertical.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{vertical.description}</p>
                  <div className="keywords-preview">
                    {vertical.keywords.slice(0, 5).map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs mr-1 mb-1"
                      >
                        {keyword}
                      </span>
                    ))}
                    {vertical.keywords.length > 5 && (
                      <span className="text-xs text-gray-500">+{vertical.keywords.length - 5} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="recommendations-tab space-y-6">
          {state.recommendations.length > 0 ? (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">SEO Recommendations</h3>
              <div className="space-y-4">
                {state.recommendations.map((rec, index) => (
                  <RecommendationCard key={index} recommendation={rec} />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600">No recommendations available. Generate a performance report to see recommendations.</p>
              <button
                onClick={() => actions.generateReport('monthly')}
                disabled={state.isLoadingReport}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {state.isLoadingReport ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          )}

          {/* Content Optimization Tool */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Content Optimization Tool</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content to Optimize</label>
                <textarea
                  value={contentToOptimize}
                  onChange={(e) => setContentToOptimize(e.target.value)}
                  placeholder="Paste your content here to get optimization suggestions..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleOptimizeContent('location')}
                  disabled={state.isOptimizing || !contentToOptimize.trim() || !state.selectedLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isOptimizing ? 'Optimizing...' : 'Optimize for Location'}
                </button>
                <button
                  onClick={() => handleOptimizeContent('industry')}
                  disabled={state.isOptimizing || !contentToOptimize.trim() || !state.selectedVertical}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isOptimizing ? 'Optimizing...' : 'Optimize for Industry'}
                </button>
              </div>
            </div>

            {/* Optimization Results */}
            {optimizationResults && (
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Optimization Suggestions</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {optimizationResults.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Generated Structured Data</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(JSON.parse(optimizationResults.structuredData), null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Recommendation Card Component
function RecommendationCard({ recommendation }: { recommendation: LocalSEORecommendation }) {
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50'
  };

  const priorityTextColors = {
    high: 'text-red-800',
    medium: 'text-yellow-800',
    low: 'text-green-800'
  };

  return (
    <div className={`recommendation-card p-4 border rounded-lg ${priorityColors[recommendation.priority]}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold">{recommendation.title}</h4>
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityTextColors[recommendation.priority]}`}>
          {recommendation.priority.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-3">{recommendation.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
        <div>
          <span className="font-medium">Impact:</span> {recommendation.expectedImpact}
        </div>
        <div>
          <span className="font-medium">Effort:</span> {recommendation.effort}
        </div>
        <div>
          <span className="font-medium">Timeline:</span> {recommendation.timeline}
        </div>
      </div>
    </div>
  );
}

export default LocalSEODashboard;