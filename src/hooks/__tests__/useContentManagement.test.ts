import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContentManagement } from '../useContentManagement';
import { Content, ContentTemplate, contentManagementSystem } from '../../lib/content-management';

vi.mock('../../lib/content-management', () => {
  const mockContentManagementSystem = {
    getAllTemplates: vi.fn(),
    getAllContent: vi.fn(),
    getContent: vi.fn(),
    createContent: vi.fn(),
    optimizeContent: vi.fn(),
    startPublishingWorkflow: vi.fn(),
    getWorkflow: vi.fn(),
    getContentPerformance: vi.fn(),
    getPerformanceOptimizationRecommendations: vi.fn()
  };

  return {
    contentManagementSystem: mockContentManagementSystem,
    Content: {},
    ContentTemplate: {},
    ContentScore: {},
    OptimizationSuggestion: {},
    PublishingWorkflow: {},
    ContentPerformance: {}
  };
});

describe('useContentManagement', () => {
  const mockContentManagementSystem = contentManagementSystem as any;
  const mockTemplate: ContentTemplate = {
    id: 'test-template',
    name: 'Test Template',
    type: 'article',
    structure: {
      title: 'Test Structure',
      sections: [],
      metaFields: [],
      requiredElements: []
    },
    seoDefaults: {
      titleTemplate: 'Test Title',
      descriptionTemplate: 'Test Description',
      keywords: ['test'],
      schema: 'Article',
      internalLinkingRules: []
    },
    aiOptimization: {
      factExtraction: true,
      citationGeneration: true,
      readabilityOptimization: true,
      structuredDataEnhancement: true
    }
  };

  const mockContent: Content = {
    id: 'test-content',
    templateId: 'test-template',
    title: 'Test Content',
    slug: 'test-content',
    content: 'Test content body',
    metaData: {
      title: 'Test Meta Title',
      description: 'Test meta description',
      keywords: ['test'],
      openGraph: {
        title: 'Test OG Title',
        description: 'Test OG Description',
        type: 'article'
      },
      structuredData: {}
    },
    seoScore: {
      overall: 85,
      seo: 80,
      readability: 90,
      aiOptimization: 85,
      performance: 0,
      suggestions: [],
      lastCalculated: new Date()
    },
    aiOptimization: {
      structuredFacts: [],
      citations: [],
      readabilityScore: 90,
      aiReadableFormat: 'Test AI format',
      trainingOptimized: true
    },
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: 'Test Author',
    tags: ['test'],
    category: 'test'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockContentManagementSystem.getAllTemplates.mockReturnValue([mockTemplate]);
    mockContentManagementSystem.getAllContent.mockReturnValue([mockContent]);
    mockContentManagementSystem.getContent.mockReturnValue(mockContent);
  });

  describe('Initialization', () => {
    it('should load templates and content on mount', async () => {
      const { result } = renderHook(() => useContentManagement());

      expect(mockContentManagementSystem.getAllTemplates).toHaveBeenCalled();
      expect(mockContentManagementSystem.getAllContent).toHaveBeenCalled();
      
      expect(result.current.templates).toEqual([mockTemplate]);
      expect(result.current.content).toEqual([mockContent]);
    });

    it('should handle template loading errors', () => {
      mockContentManagementSystem.getAllTemplates.mockImplementation(() => {
        throw new Error('Template loading failed');
      });

      const { result } = renderHook(() => useContentManagement());

      expect(result.current.error).toBe('Template loading failed');
    });

    it('should handle content loading errors', () => {
      mockContentManagementSystem.getAllContent.mockImplementation(() => {
        throw new Error('Content loading failed');
      });

      const { result } = renderHook(() => useContentManagement());

      expect(result.current.error).toBe('Content loading failed');
    });
  });

  describe('Content Operations', () => {
    it('should create content successfully', async () => {
      const newContent = { ...mockContent, id: 'new-content', title: 'New Content' };
      mockContentManagementSystem.createContent.mockResolvedValue(newContent);

      const { result } = renderHook(() => useContentManagement());

      let createdContent: Content | undefined;
      await act(async () => {
        createdContent = await result.current.createContent('test-template', {
          title: 'New Content'
        });
      });

      expect(mockContentManagementSystem.createContent).toHaveBeenCalledWith('test-template', {
        title: 'New Content'
      });
      expect(createdContent).toEqual(newContent);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle content creation errors', async () => {
      mockContentManagementSystem.createContent.mockRejectedValue(new Error('Creation failed'));

      const { result } = renderHook(() => useContentManagement());

      await act(async () => {
        try {
          await result.current.createContent('test-template', { title: 'Test' });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('Creation failed');
        }
      });

      expect(result.current.error).toBe('Creation failed');
      expect(result.current.loading).toBe(false);
    });

    it('should select content', () => {
      const { result } = renderHook(() => useContentManagement());

      act(() => {
        result.current.selectContent('test-content');
      });

      expect(result.current.selectedContent).toEqual(mockContent);
    });

    it('should deselect content', () => {
      const { result } = renderHook(() => useContentManagement());

      act(() => {
        result.current.selectContent('test-content');
      });
      expect(result.current.selectedContent).toEqual(mockContent);

      act(() => {
        result.current.selectContent(null);
      });
      expect(result.current.selectedContent).toBeNull();
    });

    it('should handle selecting non-existent content', () => {
      const { result } = renderHook(() => useContentManagement());

      act(() => {
        result.current.selectContent('non-existent');
      });

      expect(result.current.selectedContent).toBeNull();
    });
  });

  describe('Content Optimization', () => {
    it('should optimize content successfully', async () => {
      const optimizedScore = {
        overall: 90,
        seo: 85,
        readability: 95,
        aiOptimization: 90,
        performance: 0,
        suggestions: [],
        lastCalculated: new Date()
      };
      mockContentManagementSystem.optimizeContent.mockResolvedValue(optimizedScore);

      const { result } = renderHook(() => useContentManagement());

      let score;
      await act(async () => {
        score = await result.current.optimizeContent('test-content');
      });

      expect(mockContentManagementSystem.optimizeContent).toHaveBeenCalledWith('test-content');
      expect(score).toEqual(optimizedScore);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle optimization errors', async () => {
      mockContentManagementSystem.optimizeContent.mockRejectedValue(new Error('Optimization failed'));

      const { result } = renderHook(() => useContentManagement());

      await act(async () => {
        try {
          await result.current.optimizeContent('test-content');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('Optimization failed');
        }
      });

      expect(result.current.error).toBe('Optimization failed');
    });

    it('should get optimization suggestions', async () => {
      const suggestions = [
        {
          type: 'seo' as const,
          priority: 'high' as const,
          title: 'Test Suggestion',
          description: 'Test description',
          action: 'Test action',
          impact: 8,
          effort: 4
        }
      ];
      
      const contentWithSuggestions = {
        ...mockContent,
        seoScore: {
          ...mockContent.seoScore,
          suggestions
        }
      };
      
      mockContentManagementSystem.getContent.mockReturnValue(contentWithSuggestions);

      const { result } = renderHook(() => useContentManagement());

      let retrievedSuggestions;
      await act(async () => {
        retrievedSuggestions = await result.current.getOptimizationSuggestions('test-content');
      });

      expect(retrievedSuggestions).toEqual(suggestions);
    });
  });

  describe('Publishing Workflow', () => {
    it('should start publishing workflow successfully', async () => {
      const workflow = {
        contentId: 'test-content',
        steps: [],
        currentStep: 0,
        status: 'pending' as const,
        startedAt: new Date(),
        errors: []
      };
      mockContentManagementSystem.startPublishingWorkflow.mockResolvedValue(workflow);

      const { result } = renderHook(() => useContentManagement());

      let startedWorkflow;
      await act(async () => {
        startedWorkflow = await result.current.startPublishingWorkflow('test-content');
      });

      expect(mockContentManagementSystem.startPublishingWorkflow).toHaveBeenCalledWith('test-content');
      expect(startedWorkflow).toEqual(workflow);
    });

    it('should handle workflow start errors', async () => {
      mockContentManagementSystem.startPublishingWorkflow.mockRejectedValue(new Error('Workflow failed'));

      const { result } = renderHook(() => useContentManagement());

      await act(async () => {
        try {
          await result.current.startPublishingWorkflow('test-content');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('Workflow failed');
        }
      });

      expect(result.current.error).toBe('Workflow failed');
    });

    it('should get workflow status', () => {
      const workflow = {
        contentId: 'test-content',
        steps: [],
        currentStep: 0,
        status: 'in_progress' as const,
        startedAt: new Date(),
        errors: []
      };
      mockContentManagementSystem.getWorkflow.mockReturnValue(workflow);

      const { result } = renderHook(() => useContentManagement());

      const status = result.current.getWorkflowStatus('test-content');
      expect(status).toEqual(workflow);
    });
  });

  describe('Performance Tracking', () => {
    it('should get content performance successfully', async () => {
      const performance = {
        contentId: 'test-content',
        metrics: {
          pageViews: 1000,
          uniqueVisitors: 800,
          averageTimeOnPage: 120,
          bounceRate: 0.3,
          conversionRate: 0.05,
          socialShares: 25,
          backlinks: 10
        },
        rankings: [],
        traffic: {
          organic: 600,
          direct: 200,
          referral: 150,
          social: 50,
          email: 0,
          paid: 0
        },
        aiMentions: [],
        lastUpdated: new Date()
      };
      mockContentManagementSystem.getContentPerformance.mockResolvedValue(performance);

      const { result } = renderHook(() => useContentManagement());

      let retrievedPerformance;
      await act(async () => {
        retrievedPerformance = await result.current.getContentPerformance('test-content');
      });

      expect(mockContentManagementSystem.getContentPerformance).toHaveBeenCalledWith('test-content');
      expect(retrievedPerformance).toEqual(performance);
    });

    it('should handle performance retrieval errors', async () => {
      mockContentManagementSystem.getContentPerformance.mockRejectedValue(new Error('Performance failed'));

      const { result } = renderHook(() => useContentManagement());

      let retrievedPerformance;
      await act(async () => {
        retrievedPerformance = await result.current.getContentPerformance('test-content');
      });

      expect(result.current.error).toBe('Performance failed');
      expect(retrievedPerformance).toBeNull();
    });

    it('should get performance recommendations', async () => {
      const recommendations = [
        {
          type: 'performance' as const,
          priority: 'medium' as const,
          title: 'Improve loading speed',
          description: 'Page loads slowly',
          action: 'Optimize images',
          impact: 7,
          effort: 5
        }
      ];
      mockContentManagementSystem.getPerformanceOptimizationRecommendations.mockResolvedValue(recommendations);

      const { result } = renderHook(() => useContentManagement());

      let retrievedRecommendations;
      await act(async () => {
        retrievedRecommendations = await result.current.getPerformanceRecommendations('test-content');
      });

      expect(retrievedRecommendations).toEqual(recommendations);
    });
  });

  describe('State Management', () => {
    it('should refresh content', () => {
      const updatedContent = [{ ...mockContent, title: 'Updated Content' }];
      mockContentManagementSystem.getAllContent.mockReturnValue(updatedContent);

      const { result } = renderHook(() => useContentManagement());

      act(() => {
        result.current.refreshContent();
      });

      expect(result.current.content).toEqual(updatedContent);
    });

    it('should update selected content when refreshing', () => {
      const { result } = renderHook(() => useContentManagement());

      act(() => {
        result.current.selectContent('test-content');
      });

      const updatedContent = [{ ...mockContent, title: 'Updated Content' }];
      mockContentManagementSystem.getAllContent.mockReturnValue(updatedContent);

      act(() => {
        result.current.refreshContent();
      });

      expect(result.current.selectedContent?.title).toBe('Updated Content');
    });

    it('should clear selected content if it no longer exists', () => {
      const { result } = renderHook(() => useContentManagement());

      act(() => {
        result.current.selectContent('test-content');
      });

      mockContentManagementSystem.getAllContent.mockReturnValue([]);

      act(() => {
        result.current.refreshContent();
      });

      expect(result.current.selectedContent).toBeNull();
    });

    it('should manage loading state correctly', async () => {
      mockContentManagementSystem.createContent.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockContent), 100))
      );

      const { result } = renderHook(() => useContentManagement());

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.createContent('test-template', { title: 'Test' });
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.loading).toBe(false);
    });
  });
});