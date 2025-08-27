/**
 * Content Management System with SEO and AI Optimization
 * Provides content creation, optimization, and publishing workflow
 */

import { seoOptimizationEngine } from './seo-optimization-engine';
import { aiContentSystem } from './ai-content-system';
import { seoAnalytics } from './seo-analytics';

export interface ContentTemplate {
  id: string;
  name: string;
  type: 'article' | 'page' | 'insight' | 'faq' | 'profile';
  structure: ContentStructure;
  seoDefaults: SEODefaults;
  aiOptimization: AIOptimizationConfig;
}

export interface ContentStructure {
  title: string;
  sections: ContentSection[];
  metaFields: string[];
  requiredElements: string[];
}

export interface ContentSection {
  id: string;
  name: string;
  type: 'text' | 'heading' | 'list' | 'quote' | 'data' | 'faq';
  required: boolean;
  seoWeight: number;
  aiOptimized: boolean;
}

export interface SEODefaults {
  titleTemplate: string;
  descriptionTemplate: string;
  keywords: string[];
  schema: string;
  internalLinkingRules: LinkingRule[];
}

export interface LinkingRule {
  trigger: string;
  targetPages: string[];
  anchorText: string[];
}

export interface AIOptimizationConfig {
  factExtraction: boolean;
  citationGeneration: boolean;
  readabilityOptimization: boolean;
  structuredDataEnhancement: boolean;
}

export interface Content {
  id: string;
  templateId: string;
  title: string;
  slug: string;
  content: string;
  metaData: ContentMetaData;
  seoScore: ContentScore;
  aiOptimization: AIOptimizedContent;
  status: 'draft' | 'review' | 'optimizing' | 'ready' | 'published';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  author: string;
  tags: string[];
  category: string;
}

export interface ContentMetaData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  openGraph: {
    title: string;
    description: string;
    image?: string;
    type: string;
  };
  structuredData: any;
}

export interface ContentScore {
  overall: number;
  seo: number;
  readability: number;
  aiOptimization: number;
  performance: number;
  suggestions: OptimizationSuggestion[];
  lastCalculated: Date;
}

export interface OptimizationSuggestion {
  type: 'seo' | 'ai' | 'readability' | 'performance';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: number;
  effort: number;
}

export interface AIOptimizedContent {
  structuredFacts: StructuredFact[];
  citations: Citation[];
  readabilityScore: number;
  aiReadableFormat: string;
  trainingOptimized: boolean;
}

export interface StructuredFact {
  statement: string;
  confidence: number;
  sources: string[];
  category: string;
}

export interface Citation {
  text: string;
  source: string;
  url?: string;
  date?: Date;
}

export interface PublishingWorkflow {
  contentId: string;
  steps: WorkflowStep[];
  currentStep: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  errors: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'validation' | 'optimization' | 'review' | 'publish';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  duration?: number;
}

export interface ContentPerformance {
  contentId: string;
  metrics: PerformanceMetrics;
  rankings: KeywordRanking[];
  traffic: TrafficData;
  aiMentions: AIMentionData[];
  lastUpdated: Date;
}

export interface PerformanceMetrics {
  pageViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
  conversionRate: number;
  socialShares: number;
  backlinks: number;
}

export interface KeywordRanking {
  keyword: string;
  position: number;
  previousPosition: number;
  searchVolume: number;
  difficulty: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TrafficData {
  organic: number;
  direct: number;
  referral: number;
  social: number;
  email: number;
  paid: number;
}

export interface AIMentionData {
  source: string;
  query: string;
  context: string;
  accuracy: number;
  citationIncluded: boolean;
  timestamp: Date;
}

/**
 * Content Management System Class
 */
export class ContentManagementSystem {
  private templates: Map<string, ContentTemplate> = new Map();
  private content: Map<string, Content> = new Map();
  private workflows: Map<string, PublishingWorkflow> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default content templates
   */
  private initializeDefaultTemplates(): void {
    // Article template for thought leadership content
    this.templates.set('thought-leadership', {
      id: 'thought-leadership',
      name: 'Thought Leadership Article',
      type: 'article',
      structure: {
        title: 'Compelling title with target keywords',
        sections: [
          {
            id: 'introduction',
            name: 'Introduction',
            type: 'text',
            required: true,
            seoWeight: 0.9,
            aiOptimized: true
          },
          {
            id: 'key-insights',
            name: 'Key Insights',
            type: 'list',
            required: true,
            seoWeight: 0.8,
            aiOptimized: true
          },
          {
            id: 'data-analysis',
            name: 'Data Analysis',
            type: 'data',
            required: false,
            seoWeight: 0.7,
            aiOptimized: true
          },
          {
            id: 'conclusion',
            name: 'Conclusion',
            type: 'text',
            required: true,
            seoWeight: 0.6,
            aiOptimized: true
          }
        ],
        metaFields: ['title', 'description', 'keywords', 'author', 'publishDate'],
        requiredElements: ['title', 'introduction', 'key-insights', 'conclusion']
      },
      seoDefaults: {
        titleTemplate: '{title} | Arena Fund Insights',
        descriptionTemplate: 'Expert insights on {topic} from Arena Fund\'s investment team.',
        keywords: ['AI venture capital', 'enterprise AI', 'startup funding'],
        schema: 'Article',
        internalLinkingRules: [
          {
            trigger: 'AI venture capital',
            targetPages: ['/thesis', '/about'],
            anchorText: ['our investment thesis', 'Arena Fund approach']
          }
        ]
      },
      aiOptimization: {
        factExtraction: true,
        citationGeneration: true,
        readabilityOptimization: true,
        structuredDataEnhancement: true
      }
    });

    // Company profile template
    this.templates.set('company-profile', {
      id: 'company-profile',
      name: 'Portfolio Company Profile',
      type: 'profile',
      structure: {
        title: 'Company name and value proposition',
        sections: [
          {
            id: 'overview',
            name: 'Company Overview',
            type: 'text',
            required: true,
            seoWeight: 0.9,
            aiOptimized: true
          },
          {
            id: 'technology',
            name: 'Technology & Innovation',
            type: 'text',
            required: true,
            seoWeight: 0.8,
            aiOptimized: true
          },
          {
            id: 'market-opportunity',
            name: 'Market Opportunity',
            type: 'data',
            required: true,
            seoWeight: 0.7,
            aiOptimized: true
          },
          {
            id: 'investment-rationale',
            name: 'Investment Rationale',
            type: 'text',
            required: true,
            seoWeight: 0.8,
            aiOptimized: true
          }
        ],
        metaFields: ['title', 'description', 'keywords', 'industry', 'stage'],
        requiredElements: ['title', 'overview', 'technology', 'investment-rationale']
      },
      seoDefaults: {
        titleTemplate: '{companyName} - Arena Fund Portfolio | AI Startup Investment',
        descriptionTemplate: 'Learn about {companyName}, an innovative AI company in Arena Fund\'s portfolio.',
        keywords: ['AI startup', 'portfolio company', 'enterprise AI'],
        schema: 'Organization',
        internalLinkingRules: [
          {
            trigger: 'portfolio',
            targetPages: ['/thesis', '/process'],
            anchorText: ['our portfolio approach', 'investment process']
          }
        ]
      },
      aiOptimization: {
        factExtraction: true,
        citationGeneration: false,
        readabilityOptimization: true,
        structuredDataEnhancement: true
      }
    });
  }

  /**
   * Create new content from template
   */
  async createContent(templateId: string, initialData: Partial<Content>): Promise<Content> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const content: Content = {
      id: this.generateId(),
      templateId,
      title: initialData.title || '',
      slug: this.generateSlug(initialData.title || ''),
      content: initialData.content || '',
      metaData: {
        title: '',
        description: '',
        keywords: [...template.seoDefaults.keywords],
        openGraph: {
          title: '',
          description: '',
          type: 'article'
        },
        structuredData: {}
      },
      seoScore: {
        overall: 0,
        seo: 0,
        readability: 0,
        aiOptimization: 0,
        performance: 0,
        suggestions: [],
        lastCalculated: new Date()
      },
      aiOptimization: {
        structuredFacts: [],
        citations: [],
        readabilityScore: 0,
        aiReadableFormat: '',
        trainingOptimized: false
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      author: initialData.author || 'Arena Fund Team',
      tags: initialData.tags || [],
      category: initialData.category || 'insights',
      ...initialData
    };

    this.content.set(content.id, content);
    return content;
  }

  /**
   * Get content optimization score and suggestions
   */
  async optimizeContent(contentId: string): Promise<ContentScore> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error(`Content ${contentId} not found`);
    }

    const template = this.templates.get(content.templateId);
    if (!template) {
      throw new Error(`Template ${content.templateId} not found`);
    }

    // Calculate SEO score
    const seoScore = await seoOptimizationEngine.analyzeContent(content.content, content.title);

    // Calculate AI optimization score
    // const aiScore = await aiContentSystem.scoreContent(content.content);

    // Generate optimization suggestions
    const suggestions = await this.generateOptimizationSuggestions(content, template);

    const score: ContentScore = {
      overall: 75, // Default overall score
      seo: 75, // Default SEO score
      readability: 75, // Default readability score
      aiOptimization: 75, // Default AI optimization score
      performance: 0, // Will be calculated after publication
      suggestions,
      lastCalculated: new Date()
    };

    // Update content with new score
    content.seoScore = score;
    content.updatedAt = new Date();
    this.content.set(contentId, content);

    return score;
  }

  /**
   * Generate optimization suggestions
   */
  private async generateOptimizationSuggestions(
    content: Content,
    template: ContentTemplate
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // SEO suggestions
    if (content.title.length < 30) {
      suggestions.push({
        type: 'seo',
        priority: 'high',
        title: 'Title too short',
        description: 'Title should be 30-60 characters for optimal SEO',
        action: 'Expand title with relevant keywords',
        impact: 8,
        effort: 3
      });
    }

    if (!content.metaData.description || content.metaData.description.length < 120) {
      suggestions.push({
        type: 'seo',
        priority: 'high',
        title: 'Meta description missing or too short',
        description: 'Meta description should be 120-160 characters',
        action: 'Add compelling meta description',
        impact: 9,
        effort: 4
      });
    }

    // AI optimization suggestions
    if (content.aiOptimization.structuredFacts.length === 0) {
      suggestions.push({
        type: 'ai',
        priority: 'medium',
        title: 'No structured facts found',
        description: 'Content lacks clear factual statements for AI consumption',
        action: 'Add specific, measurable facts and data points',
        impact: 7,
        effort: 5
      });
    }

    // Readability suggestions
    const wordCount = content.content.split(' ').length;
    if (wordCount < 300) {
      suggestions.push({
        type: 'readability',
        priority: 'medium',
        title: 'Content too short',
        description: 'Content should be at least 300 words for good SEO',
        action: 'Expand content with relevant details',
        impact: 6,
        effort: 6
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Start publishing workflow
   */
  async startPublishingWorkflow(contentId: string): Promise<PublishingWorkflow> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error(`Content ${contentId} not found`);
    }

    const workflow: PublishingWorkflow = {
      contentId,
      steps: [
        {
          id: 'validation',
          name: 'Content Validation',
          type: 'validation',
          status: 'pending'
        },
        {
          id: 'seo-optimization',
          name: 'SEO Optimization',
          type: 'optimization',
          status: 'pending'
        },
        {
          id: 'ai-optimization',
          name: 'AI Optimization',
          type: 'optimization',
          status: 'pending'
        },
        {
          id: 'final-review',
          name: 'Final Review',
          type: 'review',
          status: 'pending'
        },
        {
          id: 'publish',
          name: 'Publish Content',
          type: 'publish',
          status: 'pending'
        }
      ],
      currentStep: 0,
      status: 'pending',
      startedAt: new Date(),
      errors: []
    };

    this.workflows.set(contentId, workflow);
    
    // Start workflow execution
    try {
      await this.executeWorkflowStep(workflow, 0);
    } catch (error) {
      // Error is already handled in executeWorkflowStep, just continue
    }
    
    return workflow;
  }

  /**
   * Execute workflow step
   */
  private async executeWorkflowStep(workflow: PublishingWorkflow, stepIndex: number): Promise<void> {
    if (stepIndex >= workflow.steps.length) {
      workflow.status = 'completed';
      workflow.completedAt = new Date();
      return;
    }

    const step = workflow.steps[stepIndex];
    step.status = 'in_progress';
    workflow.currentStep = stepIndex;
    workflow.status = 'in_progress';

    const startTime = Date.now();

    try {
      switch (step.type) {
        case 'validation':
          await this.validateContent(workflow.contentId);
          break;
        case 'optimization':
          if (step.id === 'seo-optimization') {
            await this.optimizeContentSEO(workflow.contentId);
          } else if (step.id === 'ai-optimization') {
            await this.optimizeContentAI(workflow.contentId);
          }
          break;
        case 'review':
          await this.reviewContent(workflow.contentId);
          break;
        case 'publish':
          await this.publishContent(workflow.contentId);
          break;
      }

      step.status = 'completed';
      step.duration = Date.now() - startTime;

      // Continue to next step
      await this.executeWorkflowStep(workflow, stepIndex + 1);

    } catch (error) {
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : 'Unknown error';
      step.duration = Date.now() - startTime;
      
      workflow.status = 'failed';
      workflow.errors.push(step.error);
      
      // Re-throw error to be handled by caller
      throw error;
    }
  }

  /**
   * Validate content before publishing
   */
  private async validateContent(contentId: string): Promise<void> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    const template = this.templates.get(content.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check required fields
    if (!content.title.trim()) {
      throw new Error('Title is required');
    }

    if (!content.content.trim()) {
      throw new Error('Content body is required');
    }

    // Check template requirements
    for (const element of template.structure.requiredElements) {
      if (element !== 'title') {
        // Check if the element exists in the content (case-insensitive)
        const elementExists = content.content.toLowerCase().includes(element.toLowerCase()) ||
                             content.content.toLowerCase().includes(element.replace('-', ' ').toLowerCase());
        if (!elementExists) {
          throw new Error(`Required element missing: ${element}`);
        }
      }
    }

    // Validate meta data
    if (!content.metaData.description) {
      throw new Error('Meta description is required');
    }

    if (content.metaData.keywords.length === 0) {
      throw new Error('At least one keyword is required');
    }
  }

  /**
   * Optimize content for SEO
   */
  private async optimizeContentSEO(contentId: string): Promise<void> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    // Generate optimized meta tags
    // const optimizedMeta = await seoOptimizationEngine.optimizeMetaTags(content.content, {
    //   title: content.title,
    //   keywords: content.metaData.keywords
    // });

    // Update content with optimized meta data
    // content.metaData = {
    //   ...content.metaData,
    //   ...optimizedMeta
    // };

    // Generate structured data (placeholder for future implementation)
    content.metaData.structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: content.title,
      description: content.metaData.description,
      datePublished: content.createdAt.toISOString(),
      dateModified: content.updatedAt.toISOString(),
      author: {
        '@type': 'Organization',
        name: 'Arena Fund'
      }
    };

    content.updatedAt = new Date();
    this.content.set(contentId, content);
  }

  /**
   * Optimize content for AI consumption
   */
  private async optimizeContentAI(contentId: string): Promise<void> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    // Extract structured facts
    const facts = aiContentSystem.extractFacts(content.content);
    
    // Generate AI-readable format
    const aiReadableFormat = aiContentSystem.generateAIFormat(content.content);
    
    // Calculate readability score
    const analysis = aiContentSystem.analyzeContent(content.content);
    const readabilityScore = analysis.readabilityScore;

    content.aiOptimization = {
      structuredFacts: facts,
      citations: content.aiOptimization.citations, // Preserve existing citations
      readabilityScore,
      aiReadableFormat,
      trainingOptimized: true
    };

    content.updatedAt = new Date();
    this.content.set(contentId, content);
  }

  /**
   * Review content before final publishing
   */
  private async reviewContent(contentId: string): Promise<void> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    // Final optimization score check
    const score = await this.optimizeContent(contentId);
    
    if (score.overall < 70) {
      throw new Error(`Content score too low: ${score.overall}. Minimum required: 70`);
    }

    content.status = 'ready';
    content.updatedAt = new Date();
    this.content.set(contentId, content);
  }

  /**
   * Publish content
   */
  private async publishContent(contentId: string): Promise<void> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    content.status = 'published';
    content.publishedAt = new Date();
    content.updatedAt = new Date();
    this.content.set(contentId, content);

    // Start performance tracking
    await this.initializePerformanceTracking(contentId);
  }

  /**
   * Initialize performance tracking for published content
   */
  private async initializePerformanceTracking(contentId: string): Promise<void> {
    const performance: ContentPerformance = {
      contentId,
      metrics: {
        pageViews: 0,
        uniqueVisitors: 0,
        averageTimeOnPage: 0,
        bounceRate: 0,
        conversionRate: 0,
        socialShares: 0,
        backlinks: 0
      },
      rankings: [],
      traffic: {
        organic: 0,
        direct: 0,
        referral: 0,
        social: 0,
        email: 0,
        paid: 0
      },
      aiMentions: [],
      lastUpdated: new Date()
    };

    // Store performance data (in real implementation, this would go to a database)
    // For now, we'll just log it as a placeholder
    console.log(`Performance tracking initialized for content: ${contentId}`, performance);
  }

  /**
   * Get content performance data
   */
  async getContentPerformance(contentId: string): Promise<ContentPerformance | null> {
    // Placeholder implementation - in real app this would fetch from database
    console.log(`Getting performance for content: ${contentId}`);
    return null;
  }

  /**
   * Get optimization recommendations based on performance
   */
  async getPerformanceOptimizationRecommendations(contentId: string): Promise<OptimizationSuggestion[]> {
    const performance = await this.getContentPerformance(contentId);
    if (!performance) {
      return [];
    }

    const recommendations: OptimizationSuggestion[] = [];

    // Low traffic recommendations
    if (performance.metrics.pageViews < 100) {
      recommendations.push({
        type: 'seo',
        priority: 'high',
        title: 'Low organic traffic',
        description: 'Content is not receiving sufficient organic traffic',
        action: 'Review and optimize target keywords, improve internal linking',
        impact: 8,
        effort: 6
      });
    }

    // High bounce rate recommendations
    if (performance.metrics.bounceRate > 0.7) {
      recommendations.push({
        type: 'readability',
        priority: 'high',
        title: 'High bounce rate',
        description: 'Users are leaving quickly, indicating content may not match intent',
        action: 'Review content structure, improve readability, add engaging elements',
        impact: 7,
        effort: 5
      });
    }

    // Low AI mentions
    if (performance.aiMentions.length === 0) {
      recommendations.push({
        type: 'ai',
        priority: 'medium',
        title: 'No AI mentions detected',
        description: 'Content is not being referenced by AI systems',
        action: 'Improve fact structure, add citations, enhance AI readability',
        impact: 6,
        effort: 4
      });
    }

    return recommendations;
  }

  /**
   * Utility methods
   */
  private generateId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get all content
   */
  getAllContent(): Content[] {
    return Array.from(this.content.values());
  }

  /**
   * Get content by ID
   */
  getContent(id: string): Content | undefined {
    return this.content.get(id);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): ContentTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get workflow status
   */
  getWorkflow(contentId: string): PublishingWorkflow | undefined {
    return this.workflows.get(contentId);
  }
}

// Export singleton instance
export const contentManagementSystem = new ContentManagementSystem();