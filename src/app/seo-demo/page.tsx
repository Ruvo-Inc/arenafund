'use client';

import React, { useState } from 'react';
import { SEOOptimizationDashboard } from '../../components/SEOOptimizationDashboard';

export default function SEODemoPage() {
  const [content, setContent] = useState(`
    <h1>AI Venture Capital: The Future of Enterprise Investment</h1>
    <p>Arena Fund is a leading AI venture capital firm focused on enterprise AI investment opportunities. We specialize in B2B AI startup funding and help Fortune 500 companies adopt AI technologies.</p>
    <h2>Our Investment Approach</h2>
    <p>We focus on enterprise AI companies that demonstrate strong buyer psychology understanding and can scale from AI pilot to production. Our portfolio includes innovative startups that are transforming how businesses operate.</p>
    <img src="/portfolio.jpg" alt="AI startup portfolio companies" />
    <p>Learn more about our <a href="/thesis">investment thesis</a> and <a href="/portfolio">portfolio companies</a>.</p>
    <h3>Key Investment Areas</h3>
    <ul>
      <li>Enterprise AI automation</li>
      <li>B2B AI platforms</li>
      <li>AI-powered business intelligence</li>
    </ul>
  `);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            SEO Content Optimization Demo
          </h1>
          <p className="text-gray-600 mb-6">
            This demo shows how the SEO optimization engine analyzes content and provides actionable insights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Content Editor
            </h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm"
              placeholder="Enter your HTML content here..."
            />
            <div className="mt-4 text-sm text-gray-500">
              <p>Edit the content above to see real-time SEO analysis updates.</p>
            </div>
          </div>

          {/* SEO Analysis Dashboard */}
          <div>
            <SEOOptimizationDashboard
              content={content}
              url="/demo-page"
              className="h-fit"
            />
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Usage Examples
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                1. Basic Content Analysis
              </h3>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
{`import { seoOptimizationEngine } from '@/lib/seo-optimization-engine';

const analysis = seoOptimizationEngine.analyzeContent(content, '/page-url');
const score = seoOptimizationEngine.generateSEOScore(analysis, '/page-url');

console.log('SEO Score:', score.overall);
console.log('Suggestions:', score.suggestions);`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                2. Generate Optimized Metadata
              </h3>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
{`import { generatePageMetadata } from '@/lib/seo-page-optimizer';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: 'Your Page Title',
    description: 'Your page description',
    content: 'Your page content',
    url: '/your-page-url'
  });
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                3. React Hook Usage
              </h3>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
{`import { useSEOOptimization } from '@/hooks/useSEOOptimization';

function MyComponent() {
  const seo = useSEOOptimization();
  
  useEffect(() => {
    seo.analyzeContent(content, '/page-url');
  }, [content]);
  
  return (
    <div>
      <p>SEO Score: {seo.score?.overall}</p>
      <p>Grade: {seo.overallGrade}</p>
      {seo.criticalSuggestions.map(suggestion => (
        <div key={suggestion.message}>{suggestion.message}</div>
      ))}
    </div>
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}