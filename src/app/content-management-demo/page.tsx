import React from 'react';
import { ContentManagementWorkflow } from '../../components/ContentManagementWorkflow';

export default function ContentManagementDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Content Management System
              </h1>
              <p className="mt-2 text-gray-600">
                Create, optimize, and track content with built-in SEO and AI optimization
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                SEO Optimized
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                AI Ready
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Performance Tracked
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <ContentManagementWorkflow />
    </div>
  );
}

export const metadata = {
  title: 'Content Management System - Arena Fund',
  description: 'Create, optimize, and track content with built-in SEO and AI optimization for maximum visibility and performance.',
  keywords: ['content management', 'SEO optimization', 'AI content', 'performance tracking'],
};