import { Metadata } from 'next';
import { DeploymentDashboard } from '@/components/DeploymentDashboard';

export const metadata: Metadata = {
  title: 'SEO Deployment Pipeline Demo | Arena Fund',
  description: 'Demonstration of the SEO deployment and monitoring pipeline with feature flags, performance monitoring, A/B testing, and error handling.',
  robots: 'noindex, nofollow', // Don't index demo pages
};

export default function DeploymentDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                SEO Deployment Pipeline Demo
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage SEO optimization deployments with feature flags, performance tracking, and A/B testing
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Environment: {process.env.NODE_ENV}
            </div>
          </div>
        </div>
      </div>
      
      <DeploymentDashboard />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            About This Demo
          </h2>
          <div className="text-blue-800 space-y-2">
            <p>
              This dashboard demonstrates the comprehensive deployment and monitoring pipeline for SEO optimizations, including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Feature Flags:</strong> Gradual rollout control for SEO features</li>
              <li><strong>Performance Monitoring:</strong> Real-time Core Web Vitals tracking with automatic rollback triggers</li>
              <li><strong>A/B Testing:</strong> Statistical testing framework for optimization strategies</li>
              <li><strong>Error Handling:</strong> Comprehensive logging and error recovery system</li>
            </ul>
            <p className="mt-4">
              The system supports canary deployments, automatic rollbacks based on performance thresholds, 
              and data-driven optimization decisions through A/B testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}