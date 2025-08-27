'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { 
  Content, 
  ContentScore, 
  OptimizationSuggestion,
  PublishingWorkflow,
  contentManagementSystem 
} from '../lib/content-management';

interface ContentOptimizationDashboardProps {
  contentId?: string;
  onContentUpdated?: (content: Content) => void;
}

export const ContentOptimizationDashboard: React.FC<ContentOptimizationDashboardProps> = ({
  contentId,
  onContentUpdated
}) => {
  const [content, setContent] = useState<Content | null>(null);
  const [score, setScore] = useState<ContentScore | null>(null);
  const [workflow, setWorkflow] = useState<PublishingWorkflow | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(contentId || null);

  useEffect(() => {
    loadAllContent();
  }, []);

  useEffect(() => {
    if (selectedContentId) {
      loadContent(selectedContentId);
    }
  }, [selectedContentId]);

  const loadAllContent = () => {
    const contents = contentManagementSystem.getAllContent();
    setAllContent(contents);
    
    if (!selectedContentId && contents.length > 0) {
      setSelectedContentId(contents[0].id);
    }
  };

  const loadContent = async (id: string) => {
    try {
      const contentData = contentManagementSystem.getContent(id);
      if (contentData) {
        setContent(contentData);
        setScore(contentData.seoScore);
        
        const workflowData = contentManagementSystem.getWorkflow(id);
        setWorkflow(workflowData || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    }
  };

  const handleOptimizeContent = async () => {
    if (!selectedContentId) return;

    setIsOptimizing(true);
    setError(null);

    try {
      const optimizedScore = await contentManagementSystem.optimizeContent(selectedContentId);
      setScore(optimizedScore);
      
      const updatedContent = contentManagementSystem.getContent(selectedContentId);
      if (updatedContent) {
        setContent(updatedContent);
        onContentUpdated?.(updatedContent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize content');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleStartPublishing = async () => {
    if (!selectedContentId) return;

    setIsPublishing(true);
    setError(null);

    try {
      const publishingWorkflow = await contentManagementSystem.startPublishingWorkflow(selectedContentId);
      setWorkflow(publishingWorkflow);
      
      // Poll for workflow updates
      const pollInterval = setInterval(async () => {
        const updatedWorkflow = contentManagementSystem.getWorkflow(selectedContentId);
        if (updatedWorkflow) {
          setWorkflow(updatedWorkflow);
          
          if (updatedWorkflow.status === 'completed' || updatedWorkflow.status === 'failed') {
            clearInterval(pollInterval);
            setIsPublishing(false);
            
            // Reload content to get updated status
            await loadContent(selectedContentId);
          }
        }
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start publishing workflow');
      setIsPublishing(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getPriorityColor = (priority: OptimizationSuggestion['priority']): string => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
    }
  };

  const getWorkflowStepStatus = (step: any) => {
    switch (step.status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (allContent.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Found</h3>
        <p className="text-gray-500">Create some content first to see optimization options.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Content Optimization Dashboard</h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedContentId || ''}
            onChange={(e) => setSelectedContentId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {allContent.map(item => (
              <option key={item.id} value={item.id}>
                {item.title || 'Untitled'} ({item.status})
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

      {content && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Content Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Content Overview</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  content.status === 'published' ? 'bg-green-100 text-green-800' :
                  content.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                  content.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {content.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Title</h4>
                  <p className="text-gray-900">{content.title}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Author</h4>
                  <p className="text-gray-900">{content.author}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Category</h4>
                  <p className="text-gray-900">{content.category}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Tags</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {content.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Last Updated</h4>
                  <p className="text-gray-900">{content.updatedAt.toLocaleDateString()}</p>
                </div>
              </div>
            </Card>

            {/* Optimization Suggestions */}
            {score && score.suggestions.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Suggestions</h3>
                
                <div className="space-y-4">
                  {score.suggestions.map((suggestion, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority}
                          </span>
                          <span className="text-xs text-gray-500">{suggestion.type}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Impact: {suggestion.impact}/10</span>
                          <span>Effort: {suggestion.effort}/10</span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                      <p className="text-sm font-medium text-blue-600">{suggestion.action}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Publishing Workflow */}
            {workflow && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Workflow</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      workflow.status === 'completed' ? 'bg-green-100 text-green-800' :
                      workflow.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      workflow.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getWorkflowStepStatus(step)}`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{step.name}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getWorkflowStepStatus(step)}`}>
                              {step.status}
                            </span>
                          </div>
                          {step.error && (
                            <p className="text-xs text-red-600 mt-1">{step.error}</p>
                          )}
                          {step.duration && (
                            <p className="text-xs text-gray-500 mt-1">
                              Completed in {Math.round(step.duration / 1000)}s
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {workflow.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Workflow Errors</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {workflow.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Content Score */}
            {score && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Score</h3>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(score.overall)}`}>
                      {score.overall}
                    </div>
                    <div className="text-sm text-gray-500">Overall Score</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">SEO</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-16 h-2 rounded-full ${getScoreBgColor(score.seo)}`}>
                          <div 
                            className={`h-2 rounded-full ${score.seo >= 80 ? 'bg-green-500' : score.seo >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${score.seo}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getScoreColor(score.seo)}`}>
                          {score.seo}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Readability</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-16 h-2 rounded-full ${getScoreBgColor(score.readability)}`}>
                          <div 
                            className={`h-2 rounded-full ${score.readability >= 80 ? 'bg-green-500' : score.readability >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${score.readability}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getScoreColor(score.readability)}`}>
                          {score.readability}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">AI Optimization</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-16 h-2 rounded-full ${getScoreBgColor(score.aiOptimization)}`}>
                          <div 
                            className={`h-2 rounded-full ${score.aiOptimization >= 80 ? 'bg-green-500' : score.aiOptimization >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${score.aiOptimization}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getScoreColor(score.aiOptimization)}`}>
                          {score.aiOptimization}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    Last calculated: {score.lastCalculated.toLocaleString()}
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <Button
                  onClick={handleOptimizeContent}
                  disabled={isOptimizing || !content}
                  className="w-full"
                  variant="primary"
                >
                  {isOptimizing ? 'Optimizing...' : 'Analyze & Optimize'}
                </Button>
                
                {content && content.status !== 'published' && (
                  <Button
                    onClick={handleStartPublishing}
                    disabled={isPublishing || !score || score.overall < 70}
                    className="w-full"
                    variant={score && score.overall >= 70 ? 'primary' : 'outline'}
                  >
                    {isPublishing ? 'Publishing...' : 'Start Publishing Workflow'}
                  </Button>
                )}
                
                {score && score.overall < 70 && (
                  <p className="text-xs text-gray-500 text-center">
                    Content score must be 70+ to publish
                  </p>
                )}
              </div>
            </Card>

            {/* AI Optimization Status */}
            {content && content.aiOptimization && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Optimization</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Structured Facts</span>
                    <span className="text-sm font-medium text-gray-900">
                      {content.aiOptimization.structuredFacts.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Citations</span>
                    <span className="text-sm font-medium text-gray-900">
                      {content.aiOptimization.citations.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Readability Score</span>
                    <span className={`text-sm font-medium ${getScoreColor(content.aiOptimization.readabilityScore)}`}>
                      {content.aiOptimization.readabilityScore}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Training Optimized</span>
                    <span className={`text-sm font-medium ${content.aiOptimization.trainingOptimized ? 'text-green-600' : 'text-gray-400'}`}>
                      {content.aiOptimization.trainingOptimized ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};