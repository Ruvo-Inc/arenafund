'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { 
  SEORankingData, 
  AIMentionData, 
  SEOPerformanceMetrics, 
  PerformanceAlert 
} from '@/lib/seo-analytics';

interface SEOAnalyticsDashboardProps {
  className?: string;
}

export function SEOAnalyticsDashboard({ className = '' }: SEOAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'rankings' | 'ai-mentions' | 'alerts'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [performanceMetrics, setPerformanceMetrics] = useState<SEOPerformanceMetrics | null>(null);
  const [rankings, setRankings] = useState<SEORankingData[]>([]);
  const [aiMentions, setAIMentionData] = useState<AIMentionData[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load performance metrics
      const metricsResponse = await fetch('/api/seo/analytics?type=performance');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setPerformanceMetrics(metricsData.data);
      }

      // Load rankings data
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const rankingsResponse = await fetch(`/api/seo/analytics?type=rankings&startDate=${startDate}&endDate=${endDate}`);
      if (rankingsResponse.ok) {
        const rankingsData = await rankingsResponse.json();
        setRankings(rankingsData.data);
      }

      // Load AI mentions
      const mentionsResponse = await fetch('/api/seo/analytics?type=ai-mentions');
      if (mentionsResponse.ok) {
        const mentionsData = await mentionsResponse.json();
        setAIMentionData(mentionsData.data);
      }

      // Load alerts
      const alertsResponse = await fetch('/api/seo/analytics?type=alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch('/api/seo/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve-alert', data: { alertId } }),
      });
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Organic Traffic</h3>
        <div className="text-3xl font-bold text-blue-600">
          {performanceMetrics?.organicTraffic?.toLocaleString() || '0'}
        </div>
        <p className="text-sm text-gray-600 mt-1">Last 30 days</p>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Ranking</h3>
        <div className="text-3xl font-bold text-green-600">
          {performanceMetrics?.averageRanking || '0'}
        </div>
        <p className="text-sm text-gray-600 mt-1">Position</p>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Top 10 Keywords</h3>
        <div className="text-3xl font-bold text-purple-600">
          {performanceMetrics?.topRankingKeywords || '0'}
        </div>
        <p className="text-sm text-gray-600 mt-1">Out of {performanceMetrics?.totalKeywords || '0'}</p>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Core Web Vitals</h3>
        <div className="text-3xl font-bold text-orange-600">
          {performanceMetrics?.coreWebVitals?.score || '0'}
        </div>
        <p className="text-sm text-gray-600 mt-1">Performance Score</p>
      </Card>

      {/* Core Web Vitals Details */}
      <Card className="p-6 md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals Details</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">LCP</p>
            <p className="text-xl font-semibold">{performanceMetrics?.coreWebVitals?.lcp}s</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">FID</p>
            <p className="text-xl font-semibold">{performanceMetrics?.coreWebVitals?.fid}ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">CLS</p>
            <p className="text-xl font-semibold">{performanceMetrics?.coreWebVitals?.cls}</p>
          </div>
        </div>
      </Card>

      {/* AI Mentions Summary */}
      <Card className="p-6 md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Mentions Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Mentions</span>
            <span className="font-semibold">{aiMentions.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">With Citations</span>
            <span className="font-semibold">
              {aiMentions.filter(m => m.citationIncluded).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Positive Sentiment</span>
            <span className="font-semibold">
              {aiMentions.filter(m => m.sentiment === 'positive').length}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderRankings = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Rankings</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Keyword</th>
              <th className="text-left py-2">Position</th>
              <th className="text-left py-2">Clicks</th>
              <th className="text-left py-2">Impressions</th>
              <th className="text-left py-2">CTR</th>
              <th className="text-left py-2">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rankings.slice(0, 20).map((ranking, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 font-medium">{ranking.keyword}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    ranking.currentRank <= 3 ? 'bg-green-100 text-green-800' :
                    ranking.currentRank <= 10 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    #{ranking.currentRank}
                  </span>
                </td>
                <td className="py-2">{ranking.clicks}</td>
                <td className="py-2">{ranking.impressions.toLocaleString()}</td>
                <td className="py-2">{(ranking.clickThroughRate * 100).toFixed(1)}%</td>
                <td className="py-2">
                  <span className={`text-xs ${
                    ranking.trend === 'up' ? 'text-green-600' :
                    ranking.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {ranking.trend === 'up' ? '↗' : ranking.trend === 'down' ? '↘' : '→'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderAIMentions = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Platform Mentions</h3>
      <div className="space-y-4">
        {aiMentions.map((mention, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {mention.source}
                </span>
                <span className={`px-2 py-1 text-xs rounded ${
                  mention.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                  mention.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {mention.sentiment}
                </span>
                {mention.citationIncluded && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    Cited
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(mention.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Query: "{mention.query}"</p>
            <p className="text-sm">{mention.mentionContext}</p>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Accuracy: {(mention.accuracy * 100).toFixed(1)}%</span>
              <span>Relevance: {(mention.relevanceScore * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderAlerts = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Alerts</h3>
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <p className="text-gray-600">No active alerts</p>
        ) : (
          alerts.map((alert) => (
            <Alert
              key={alert.id}
              type={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'}
              className={alert.resolved ? 'opacity-50' : ''}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                {!alert.resolved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </Alert>
          ))
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">SEO Analytics Dashboard</h2>
        <Button onClick={loadDashboardData} disabled={loading}>
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert type="error">
          {error}
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'rankings', label: 'Rankings' },
            { key: 'ai-mentions', label: 'AI Mentions' },
            { key: 'alerts', label: 'Alerts' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.key === 'alerts' && alerts.filter(a => !a.resolved).length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {alerts.filter(a => !a.resolved).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'rankings' && renderRankings()}
        {activeTab === 'ai-mentions' && renderAIMentions()}
        {activeTab === 'alerts' && renderAlerts()}
      </div>
    </div>
  );
}