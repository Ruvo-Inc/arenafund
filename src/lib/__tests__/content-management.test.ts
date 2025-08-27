import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  ContentManagementSystem, 
  Content, 
  ContentTemplate,
  ContentScore,
  OptimizationSuggestion 
} from '../content-management';

// Mock dependencies
vi.mock('../seo-optimization-engine', () => ({
  seoOptimizationEngine: {
    analyzeContent: vi.fn().mockResolvedValue({ score: 85 }),
    optimizeMetaTags: vi.fn().mockResolvedValue({
      title: 'Optimized Title',
      description: 'Optimized description'
    }),
    generateStructuredData: vi.fn().mockResolvedValue({
      '@type': 'Article',
      headline: 'Test Article'
    })
  }
}));

vi.mock('../ai-content-system', () => ({
  aiContentSystem: {
    scoreContent: vi.fn().mockResolvedValue({
      readabilityScore: 80,
      aiOptimizationScore: 75
    }),
    extractFacts: vi.fn().mockResolvedValue([
      {
        statement: 'Arena Fund invests in AI startups',
        confidence: 0.9,
        sources: ['website'],
        category: 'investment'
      }
    ]),
    optimizeForAI: vi.fn().mockResolvedValue('AI-optimized content'),
    scoreReadability: vi.fn().mockResolvedValue(80)
  }
}));

vi.mock('../seo-analytics', () => ({
  seoAnalytics: {
    trackContentPerformance: vi.fn().mockResolvedValue(undefined),
    getContentPerformance: vi.fn().mockImplementation((contentId: string) => Promise.resolve({
      contentId,
      metrics: {
        pageViews: 1000,
        uniqueVisitors: 800,
        averageTimeOnPage: 120,
        bounceRate: 0.3,
        conversionRate: 0.05,
        socialShares: 25,
        backlinks: 10
      },
      rankings: [
        {
          keyword: 'AI venture capital',
          position: 5,
          previousPosition: 7,
          searchVolume: 1000,
          difficulty: 65,
          trend: 'up' as const
        }
      ],
      traffic: {
        organic: 600,
        direct: 200,
        referral: 150,
        social: 50,
        email: 0,
        paid: 0
      },
      aiMentions: [
        {
          source: 'ChatGPT',
          query: 'AI venture capital firms',
          context: 'Arena Fund is mentioned as a leading AI investor',
          accuracy: 0.95,
          citationIncluded: true,
          timestamp: new Date()
        }
      ],
      lastUpdated: new Date()
    }))
  }
}));

describe('ContentManagementSystem', () => {
  let cms: ContentManagementSystem;

  beforeEach(() => {
    cms = new ContentManagementSystem();
  });

  describe('Template Management', () => {
    it('should initialize with default templates', () => {
      const templates = cms.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
      
      const thoughtLeadershipTemplate = templates.find(t => t.id === 'thought-leadership');
      expect(thoughtLeadershipTemplate).toBeDefined();
      expect(thoughtLeadershipTemplate?.name).toBe('Thought Leadership Article');
      expect(thoughtLeadershipTemplate?.type).toBe('article');
    });

    it('should have properly structured templates', () => {
      const templates = cms.getAllTemplates();
      
      templates.forEach(template => {
        expect(template.id).toBeTruthy();
        expect(template.name).toBeTruthy();
        expect(template.type).toBeTruthy();
        expect(template.structure).toBeDefined();
        expect(template.seoDefaults).toBeDefined();
        expect(template.aiOptimization).toBeDefined();
        
        // Check structure
        expect(template.structure.sections).toBeInstanceOf(Array);
        expect(template.structure.sections.length).toBeGreaterThan(0);
        
        // Check SEO defaults
        expect(template.seoDefaults.keywords).toBeInstanceOf(Array);
        expect(template.seoDefaults.titleTemplate).toBeTruthy();
        expect(template.seoDefaults.descriptionTemplate).toBeTruthy();
        
        // Check AI optimization config
        expect(typeof template.aiOptimization.factExtraction).toBe('boolean');
        expect(typeof template.aiOptimization.citationGeneration).toBe('boolean');
        expect(typeof template.aiOptimization.readabilityOptimization).toBe('boolean');
        expect(typeof template.aiOptimization.structuredDataEnhancement).toBe('boolean');
      });
    });
  });

  describe('Content Creation', () => {
    it('should create content from template', async () => {
      const content = await cms.createContent('thought-leadership', {
        title: 'Test Article',
        content: 'Test content',
        author: 'Test Author'
      });

      expect(content.id).toBeTruthy();
      expect(content.templateId).toBe('thought-leadership');
      expect(content.title).toBe('Test Article');
      expect(content.content).toBe('Test content');
      expect(content.author).toBe('Test Author');
      expect(content.status).toBe('draft');
      expect(content.createdAt).toBeInstanceOf(Date);
      expect(content.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error for invalid template', async () => {
      await expect(cms.createContent('invalid-template', {}))
        .rejects.toThrow('Template invalid-template not found');
    });

    it('should generate slug from title', async () => {
      const content = await cms.createContent('thought-leadership', {
        title: 'This is a Test Article!'
      });

      expect(content.slug).toBe('this-is-a-test-article');
    });

    it('should initialize with template defaults', async () => {
      const content = await cms.createContent('thought-leadership', {
        title: 'Test Article'
      });

      expect(content.metaData.keywords).toContain('AI venture capital');
      expect(content.metaData.keywords).toContain('enterprise AI');
      expect(content.metaData.keywords).toContain('startup funding');
    });
  });

  describe('Content Optimization', () => {
    let testContent: Content;

    beforeEach(async () => {
      testContent = await cms.createContent('thought-leadership', {
        title: 'Test Article',
        content: 'This is a test article about AI venture capital.',
        author: 'Test Author'
      });
    });

    it('should optimize content and return score', async () => {
      const score = await cms.optimizeContent(testContent.id);

      expect(score.overall).toBeGreaterThan(0);
      expect(score.seo).toBe(85);
      expect(score.readability).toBe(80);
      expect(score.aiOptimization).toBe(75);
      expect(score.suggestions).toBeInstanceOf(Array);
      expect(score.lastCalculated).toBeInstanceOf(Date);
    });

    it('should generate optimization suggestions', async () => {
      // Create content with short title to trigger suggestions
      const shortTitleContent = await cms.createContent('thought-leadership', {
        title: 'Short',
        content: 'Short content',
        author: 'Test Author'
      });

      const score = await cms.optimizeContent(shortTitleContent.id);
      
      expect(score.suggestions.length).toBeGreaterThan(0);
      
      const titleSuggestion = score.suggestions.find(s => s.title === 'Title too short');
      expect(titleSuggestion).toBeDefined();
      expect(titleSuggestion?.type).toBe('seo');
      expect(titleSuggestion?.priority).toBe('high');
    });

    it('should prioritize suggestions correctly', async () => {
      const content = await cms.createContent('thought-leadership', {
        title: 'A',
        content: 'B',
        author: 'Test Author'
      });

      const score = await cms.optimizeContent(content.id);
      
      // Check that high priority suggestions come first
      const priorities = score.suggestions.map(s => s.priority);
      let highPriorityIndex = -1;
      let lowPriorityIndex = -1;
      
      priorities.forEach((priority, index) => {
        if (priority === 'high' && highPriorityIndex === -1) {
          highPriorityIndex = index;
        }
        if (priority === 'low') {
          lowPriorityIndex = index;
        }
      });
      
      if (highPriorityIndex !== -1 && lowPriorityIndex !== -1) {
        expect(highPriorityIndex).toBeLessThan(lowPriorityIndex);
      }
    });
  });

  describe('Publishing Workflow', () => {
    let testContent: Content;

    beforeEach(async () => {
      testContent = await cms.createContent('thought-leadership', {
        title: 'Test Article for Publishing',
        content: `
## Introduction
This is a comprehensive test article about AI venture capital with sufficient content length to pass validation checks.

## Key Insights
- AI venture capital is growing rapidly
- Enterprise AI adoption is accelerating
- Investment opportunities are expanding

## Conclusion
The future of AI venture capital looks promising with continued growth and innovation.
        `,
        author: 'Test Author'
      });
      
      // Set required meta description
      const content = cms.getContent(testContent.id);
      if (content) {
        content.metaData.description = 'Test description for the article';
      }
    });

    it('should start publishing workflow', async () => {
      const workflow = await cms.startPublishingWorkflow(testContent.id);

      expect(workflow.contentId).toBe(testContent.id);
      expect(workflow.steps.length).toBe(5);
      expect(workflow.status).toMatch(/^(in_progress|completed)$/);
      expect(workflow.startedAt).toBeInstanceOf(Date);
      
      // Check step structure
      const stepNames = workflow.steps.map(s => s.name);
      expect(stepNames).toContain('Content Validation');
      expect(stepNames).toContain('SEO Optimization');
      expect(stepNames).toContain('AI Optimization');
      expect(stepNames).toContain('Final Review');
      expect(stepNames).toContain('Publish Content');
    });

    it('should validate content before publishing', async () => {
      // Create content without required fields
      const invalidContent = await cms.createContent('thought-leadership', {
        title: '',
        content: '',
        author: 'Test Author'
      });

      const workflow = await cms.startPublishingWorkflow(invalidContent.id);
      
      // Workflow should be created but fail at validation step
      expect(workflow.status).toBe('failed');
      expect(workflow.errors.length).toBeGreaterThan(0);
      expect(workflow.errors[0]).toContain('Title is required');
    });

    it('should track workflow progress', async () => {
      const workflow = await cms.startPublishingWorkflow(testContent.id);
      
      // Workflow should be tracked
      const trackedWorkflow = cms.getWorkflow(testContent.id);
      expect(trackedWorkflow).toBeDefined();
      expect(trackedWorkflow?.contentId).toBe(testContent.id);
    });
  });

  describe('Performance Tracking', () => {
    let publishedContent: Content;

    beforeEach(async () => {
      publishedContent = await cms.createContent('thought-leadership', {
        title: 'Published Test Article',
        content: 'This is a published test article.',
        author: 'Test Author'
      });
      
      // Simulate published status
      const content = cms.getContent(publishedContent.id);
      if (content) {
        content.status = 'published';
        content.publishedAt = new Date();
      }
    });

    it('should get content performance data', async () => {
      const performance = await cms.getContentPerformance(publishedContent.id);

      expect(performance).toBeDefined();
      expect(performance?.contentId).toBe(publishedContent.id);
      expect(performance?.metrics).toBeDefined();
      expect(performance?.rankings).toBeInstanceOf(Array);
      expect(performance?.traffic).toBeDefined();
      expect(performance?.aiMentions).toBeInstanceOf(Array);
    });

    it('should generate performance optimization recommendations', async () => {
      const recommendations = await cms.getPerformanceOptimizationRecommendations(publishedContent.id);

      expect(recommendations).toBeInstanceOf(Array);
      
      if (recommendations.length > 0) {
        recommendations.forEach(rec => {
          expect(rec.type).toBeTruthy();
          expect(rec.priority).toBeTruthy();
          expect(rec.title).toBeTruthy();
          expect(rec.description).toBeTruthy();
          expect(rec.action).toBeTruthy();
          expect(typeof rec.impact).toBe('number');
          expect(typeof rec.effort).toBe('number');
        });
      }
    });
  });

  describe('Content Management', () => {
    it('should retrieve all content', () => {
      const allContent = cms.getAllContent();
      expect(allContent).toBeInstanceOf(Array);
    });

    it('should retrieve content by ID', async () => {
      const content = await cms.createContent('thought-leadership', {
        title: 'Test Article',
        content: 'Test content'
      });

      const retrieved = cms.getContent(content.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(content.id);
      expect(retrieved?.title).toBe('Test Article');
    });

    it('should return undefined for non-existent content', () => {
      const retrieved = cms.getContent('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Utility Functions', () => {
    it('should generate unique IDs', async () => {
      const content1 = await cms.createContent('thought-leadership', { title: 'Test 1' });
      const content2 = await cms.createContent('thought-leadership', { title: 'Test 2' });

      expect(content1.id).not.toBe(content2.id);
      expect(content1.id).toMatch(/^content_\d+_[a-z0-9]+$/);
      expect(content2.id).toMatch(/^content_\d+_[a-z0-9]+$/);
    });

    it('should generate proper slugs', async () => {
      const testCases = [
        { title: 'Simple Title', expected: 'simple-title' },
        { title: 'Title with Numbers 123', expected: 'title-with-numbers-123' },
        { title: 'Title with Special Characters!@#', expected: 'title-with-special-characters' },
        { title: '  Leading and Trailing Spaces  ', expected: 'leading-and-trailing-spaces' }
      ];

      for (const testCase of testCases) {
        const content = await cms.createContent('thought-leadership', {
          title: testCase.title
        });
        expect(content.slug).toBe(testCase.expected);
      }
    });
  });
});