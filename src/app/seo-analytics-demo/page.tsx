'use client';

import React from 'react';
import { SEOAnalyticsDashboard } from '@/components/SEOAnalyticsDashboard';

export default function SEOAnalyticsDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SEO Analytics Demo</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive SEO and AI discovery monitoring dashboard for Arena Fund
          </p>
        </div>
        
        <SEOAnalyticsDashboard />
      </div>
    </div>
  );
}