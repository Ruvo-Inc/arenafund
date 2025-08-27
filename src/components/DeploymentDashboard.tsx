'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DeploymentStatus {
  phase: 'preparing' | 'deploying' | 'monitoring' | 'completed' | 'failed' | 'rolled_back';
  progress: number;
  startTime: number;
  endTime?: number;
  errors: string[];
  warnings: string[];
  metrics: {
    performanceScore: number;
    errorRate: number;
    userSatisfaction: number;
    seoImpact: number;
    rollbackTriggers: number;
  };
}

interface FeatureFlags {
  flags: Record<string, boolean>;
  seoFeatures: Record<string, boolean>;
}

interface PerformanceSummary {
  timeWindow: number;
  sampleCount: number;
  averages: Record<string, number>;
  p95: Record<string, number>;
  violations: Array<{
    metric: string;
    level: 'warning' | 'critical';
    value: number;
    threshold: number;
  }>;
}

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: Array<{
    id: string;
    name: string;
    trafficWeight: number;
  }>;
}

export function DeploymentDashboard() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [errorMetrics, setErrorMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [flagsRes, perfRes, testsRes, errorsRes] = await Promise.all([
        fetch('/api/deployment/monitoring?action=feature-flags'),
        fetch('/api/deployment/monitoring?action=performance-summary&timeWindow=60'),
        fetch('/api/deployment/monitoring?action=ab-tests'),
        fetch('/api/deployment/monitoring?action=error-metrics')
      ]);

      const [flagsData, perfData, testsData, errorsData] = await Promise.all([
        flagsRes.json(),
        perfRes.json(),
        testsRes.json(),
        errorsRes.json()
      ]);

      if (flagsData.success) setFeatureFlags(flagsData.data);
      if (perfData.success) setPerformanceSummary(perfData.data);
      if (testsData.success) setABTests(testsData.data.activeTests);
      if (errorsData.success) setErrorMetrics(errorsData.data);

      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFeatureFlag = async (flagPath: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/deployment/monitoring?action=update-feature-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flagPath,
          updates: { enabled }
        })
      });

      if (response.ok) {
        await fetchDashboardData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to update feature flag:', err);
    }
  };

  const startABTest = async (testType: string) => {
    try {
      const response = await fetch('/api/deployment/monitoring?action=start-ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType })
      });

      if (response.ok) {
        await fetchDashboardData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to start A/B test:', err);
    }
  };

  if (loading && !featureFlags) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <Button 
            onClick={fetchDashboardData}
            className="mt-3 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">SEO Deployment Dashboard</h1>
        <Button onClick={fetchDashboardData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Feature Flags Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Feature Flags</h2>
        {featureFlags && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(featureFlags.seoFeatures).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => updateFeatureFlag(`seoOptimization.${feature}`, !enabled)}
                    className={enabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {enabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Performance Metrics Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        {performanceSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-medium text-blue-900">Sample Count</h3>
              <p className="text-2xl font-bold text-blue-600">{performanceSummary.sampleCount}</p>
              <p className="text-sm text-blue-700">Last {performanceSummary.timeWindow} minutes</p>
            </div>
            
            {performanceSummary.averages.lcp && (
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-medium text-green-900">Avg LCP</h3>
                <p className="text-2xl font-bold text-green-600">
                  {performanceSummary.averages.lcp.toFixed(0)}ms
                </p>
                <p className="text-sm text-green-700">Largest Contentful Paint</p>
              </div>
            )}
            
            {performanceSummary.averages.cls && (
              <div className="bg-yellow-50 p-4 rounded">
                <h3 className="font-medium text-yellow-900">Avg CLS</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {performanceSummary.averages.cls.toFixed(3)}
                </p>
                <p className="text-sm text-yellow-700">Cumulative Layout Shift</p>
              </div>
            )}
          </div>
        )}
        
        {performanceSummary?.violations && performanceSummary.violations.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-red-900 mb-2">Performance Violations</h3>
            <div className="space-y-2">
              {performanceSummary.violations.slice(0, 5).map((violation, index) => (
                <div key={index} className={`p-2 rounded text-sm ${
                  violation.level === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <span className="font-medium">{violation.metric.toUpperCase()}</span>: 
                  {violation.value} exceeds {violation.level} threshold of {violation.threshold}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* A/B Tests Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">A/B Tests</h2>
          <div className="space-x-2">
            <Button
              size="sm"
              onClick={() => startABTest('meta-tag-optimization')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Meta Tag Test
            </Button>
            <Button
              size="sm"
              onClick={() => startABTest('structured-data')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Start Schema Test
            </Button>
          </div>
        </div>
        
        {abTests.length > 0 ? (
          <div className="space-y-3">
            {abTests.map(test => (
              <div key={test.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{test.name}</h3>
                    <p className="text-sm text-gray-600">ID: {test.id}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    test.status === 'running' ? 'bg-green-100 text-green-800' :
                    test.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {test.status}
                  </span>
                </div>
                <div className="mt-2 flex space-x-4">
                  {test.variants.map(variant => (
                    <span key={variant.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {variant.name}: {variant.trafficWeight}%
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No active A/B tests</p>
        )}
      </Card>

      {/* Error Metrics Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Error Metrics</h2>
        {errorMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded">
              <h3 className="font-medium text-red-900">Total Errors</h3>
              <p className="text-2xl font-bold text-red-600">{errorMetrics.totalErrors}</p>
              <p className="text-sm text-red-700">Error Rate: {errorMetrics.errorRate.toFixed(2)}%</p>
            </div>
            
            {errorMetrics.errorsByType && Object.keys(errorMetrics.errorsByType).length > 0 && (
              <div className="bg-orange-50 p-4 rounded">
                <h3 className="font-medium text-orange-900">Error Types</h3>
                <div className="mt-2 space-y-1">
                  {Object.entries(errorMetrics.errorsByType).slice(0, 3).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-orange-800">{type}</span>
                      <span className="text-orange-600 font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}