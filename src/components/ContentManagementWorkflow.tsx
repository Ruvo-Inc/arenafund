'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ContentCreationTemplates } from './ContentCreationTemplates';
import { ContentOptimizationDashboard } from './ContentOptimizationDashboard';
import { ContentPerformanceTracker } from './ContentPerformanceTracker';
import { 
  Content, 
  contentManagementSystem 
} from '../lib/content-management';

type WorkflowStep = 'create' | 'optimize' | 'performance' | 'overview';

export const ContentManagementWorkflow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('overview');
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = () => {
    const contents = contentManagementSystem.getAllContent();
    setAllContent(contents);
  };

  const handleContentCreated = (content: Content) => {
    loadAllContent();
    setSelectedContentId(content.id);
    setCurrentStep('optimize');
  };

  const handleContentUpdated = (content: Content) => {
    loadAllContent();
  };

  const getStepStatus = (step: WorkflowStep): 'current' | 'completed' | 'upcoming' => {
    const steps: WorkflowStep[] = ['create', 'optimize', 'performance'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    
    if (step === currentStep) return 'current';
    if (stepIndex < currentIndex) return 'completed';
    return 'upcoming';
  };

  const getContentStatusColor = (status: Content['status']): string => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'optimizing': return 'bg-purple-100 text-purple-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'create':
        return (
          <ContentCreationTemplates 
            onContentCreated={handleContentCreated}
          />
        );
      case 'optimize':
        return (
          <ContentOptimizationDashboard 
            contentId={selectedContentId || undefined}
            onContentUpdated={handleContentUpdated}
          />
        );
      case 'performance':
        return (
          <ContentPerformanceTracker 
            contentId={selectedContentId || undefined}
          />
        );
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Content Management Overview
              </h2>
              <p className="text-gray-600">
                Manage your content lifecycle from creation to performance tracking with built-in SEO and AI optimization.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {allContent.length}
                </div>
                <div className="text-sm text-gray-500">Total Content</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {allContent.filter(c => c.status === 'published').length}
                </div>
                <div className="text-sm text-gray-500">Published</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {allContent.filter(c => c.status === 'draft' || c.status === 'review').length}
                </div>
                <div className="text-sm text-gray-500">In Progress</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.round(allContent.reduce((sum, c) => sum + c.seoScore.overall, 0) / Math.max(allContent.length, 1))}
                </div>
                <div className="text-sm text-gray-500">Avg. Score</div>
              </Card>
            </div>

            {/* Recent Content */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Content</h3>
                <Button
                  onClick={() => setCurrentStep('create')}
                  variant="primary"
                >
                  Create New Content
                </Button>
              </div>
              
              {allContent.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Content Yet</h4>
                  <p className="text-gray-500 mb-4">Get started by creating your first piece of optimized content.</p>
                  <Button
                    onClick={() => setCurrentStep('create')}
                    variant="primary"
                  >
                    Create Your First Content
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {allContent
                    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                    .slice(0, 10)
                    .map(content => (
                      <div key={content.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {content.title || 'Untitled'}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getContentStatusColor(content.status)}`}>
                              {content.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>By {content.author}</span>
                            <span>•</span>
                            <span>{content.category}</span>
                            <span>•</span>
                            <span>Score: {content.seoScore.overall}/100</span>
                            <span>•</span>
                            <span>Updated {content.updatedAt.toLocaleDateString()}</span>
                          </div>
                          
                          {content.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {content.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                  {tag}
                                </span>
                              ))}
                              {content.tags.length > 3 && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                  +{content.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => {
                              setSelectedContentId(content.id);
                              setCurrentStep('optimize');
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Optimize
                          </Button>
                          
                          {content.status === 'published' && (
                            <Button
                              onClick={() => {
                                setSelectedContentId(content.id);
                                setCurrentStep('performance');
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Performance
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>

            {/* Workflow Guide */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Workflow</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Create Content</h4>
                    <p className="text-sm text-gray-600">
                      Choose from optimized templates with built-in SEO structure and AI-friendly formatting.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Optimize & Review</h4>
                    <p className="text-sm text-gray-600">
                      Get real-time optimization suggestions and run through the publishing workflow.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Track Performance</h4>
                    <p className="text-sm text-gray-600">
                      Monitor SEO rankings, AI mentions, and get recommendations for continuous improvement.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setCurrentStep('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentStep === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            
            <button
              onClick={() => setCurrentStep('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentStep === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Content
            </button>
            
            <button
              onClick={() => setCurrentStep('optimize')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentStep === 'optimize'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Optimize & Publish
            </button>
            
            <button
              onClick={() => setCurrentStep('performance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentStep === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Performance Tracking
            </button>
          </nav>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
};