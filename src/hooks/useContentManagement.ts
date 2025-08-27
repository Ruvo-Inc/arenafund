import { useState, useEffect, useCallback } from 'react';
import { 
  Content, 
  ContentTemplate, 
  ContentScore, 
  OptimizationSuggestion,
  PublishingWorkflow,
  ContentPerformance,
  contentManagementSystem 
} from '../lib/content-management';

export interface UseContentManagementReturn {
  // Content management
  content: Content[];
  templates: ContentTemplate[];
  selectedContent: Content | null;
  
  // Content operations
  createContent: (templateId: string, data: Partial<Content>) => Promise<Content>;
  updateContent: (contentId: string, updates: Partial<Content>) => Promise<void>;
  deleteContent: (contentId: string) => Promise<void>;
  selectContent: (contentId: string | null) => void;
  
  // Optimization
  optimizeContent: (contentId: string) => Promise<ContentScore>;
  getOptimizationSuggestions: (contentId: string) => Promise<OptimizationSuggestion[]>;
  
  // Publishing workflow
  startPublishingWorkflow: (contentId: string) => Promise<PublishingWorkflow>;
  getWorkflowStatus: (contentId: string) => PublishingWorkflow | null;
  
  // Performance tracking
  getContentPerformance: (contentId: string) => Promise<ContentPerformance | null>;
  getPerformanceRecommendations: (contentId: string) => Promise<OptimizationSuggestion[]>;
  
  // State management
  loading: boolean;
  error: string | null;
  refreshContent: () => void;
}

export const useContentManagement = (): UseContentManagementReturn => {
  const [content, setContent] = useState<Content[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadTemplates();
    refreshContent();
  }, []);

  const loadTemplates = useCallback(() => {
    try {
      const availableTemplates = contentManagementSystem.getAllTemplates();
      setTemplates(availableTemplates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    }
  }, []);

  const refreshContent = useCallback(() => {
    try {
      const allContent = contentManagementSystem.getAllContent();
      setContent(allContent);
      
      // Update selected content if it exists
      if (selectedContent) {
        const updated = allContent.find(c => c.id === selectedContent.id);
        setSelectedContent(updated || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    }
  }, [selectedContent]);

  const createContent = useCallback(async (templateId: string, data: Partial<Content>): Promise<Content> => {
    setLoading(true);
    setError(null);

    try {
      const newContent = await contentManagementSystem.createContent(templateId, data);
      refreshContent();
      return newContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create content';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [refreshContent]);

  const updateContent = useCallback(async (contentId: string, updates: Partial<Content>): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const existingContent = contentManagementSystem.getContent(contentId);
      if (!existingContent) {
        throw new Error('Content not found');
      }

      // Update content (in a real implementation, this would be a method on the CMS)
      const updatedContent = { ...existingContent, ...updates, updatedAt: new Date() };
      
      // For now, we'll simulate the update by refreshing
      refreshContent();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update content';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [refreshContent]);

  const deleteContent = useCallback(async (contentId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would be a method on the CMS
      // For now, we'll simulate by refreshing
      if (selectedContent?.id === contentId) {
        setSelectedContent(null);
      }
      refreshContent();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete content';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedContent, refreshContent]);

  const selectContent = useCallback((contentId: string | null) => {
    if (contentId) {
      const contentItem = content.find(c => c.id === contentId);
      setSelectedContent(contentItem || null);
    } else {
      setSelectedContent(null);
    }
  }, [content]);

  const optimizeContent = useCallback(async (contentId: string): Promise<ContentScore> => {
    setLoading(true);
    setError(null);

    try {
      const score = await contentManagementSystem.optimizeContent(contentId);
      refreshContent();
      return score;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize content';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [refreshContent]);

  const getOptimizationSuggestions = useCallback(async (contentId: string): Promise<OptimizationSuggestion[]> => {
    try {
      const contentItem = contentManagementSystem.getContent(contentId);
      return contentItem?.seoScore.suggestions || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get optimization suggestions';
      setError(errorMessage);
      return [];
    }
  }, []);

  const startPublishingWorkflow = useCallback(async (contentId: string): Promise<PublishingWorkflow> => {
    setLoading(true);
    setError(null);

    try {
      const workflow = await contentManagementSystem.startPublishingWorkflow(contentId);
      refreshContent();
      return workflow;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start publishing workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [refreshContent]);

  const getWorkflowStatus = useCallback((contentId: string): PublishingWorkflow | null => {
    return contentManagementSystem.getWorkflow(contentId) || null;
  }, []);

  const getContentPerformance = useCallback(async (contentId: string): Promise<ContentPerformance | null> => {
    setLoading(true);
    setError(null);

    try {
      const performance = await contentManagementSystem.getContentPerformance(contentId);
      return performance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get content performance';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPerformanceRecommendations = useCallback(async (contentId: string): Promise<OptimizationSuggestion[]> => {
    try {
      const recommendations = await contentManagementSystem.getPerformanceOptimizationRecommendations(contentId);
      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get performance recommendations';
      setError(errorMessage);
      return [];
    }
  }, []);

  return {
    // Content management
    content,
    templates,
    selectedContent,
    
    // Content operations
    createContent,
    updateContent,
    deleteContent,
    selectContent,
    
    // Optimization
    optimizeContent,
    getOptimizationSuggestions,
    
    // Publishing workflow
    startPublishingWorkflow,
    getWorkflowStatus,
    
    // Performance tracking
    getContentPerformance,
    getPerformanceRecommendations,
    
    // State management
    loading,
    error,
    refreshContent
  };
};