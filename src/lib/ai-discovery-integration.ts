/**
 * AI Discovery Optimization Integration
 * 
 * Provides a unified interface for all AI discovery optimization tools
 * Requirements: 2.1, 2.2, 6.4
 */

import { ContentStructuringUtility, AIOptimizedContent } from './ai-discovery-optimizer';
import { TrainingDataOptimizer, TrainingDataFormat, OptimizedTrainingExample } from './training-data-optimizer';
import { FactVerificationSystem, VerificationResult } from './fact-verification-system';
import { AIKnowledgeBase, AIFriendlyFAQ, KnowledgeBaseEntry } from './ai-knowledge-base';

export interface ComprehensiveAIOptimization {
  structuredContent: AIOptimizedContent;
  trainingData: TrainingDataFormat;
  verificationResults: VerificationResult[];
  knowledgeEntry: KnowledgeBaseEntry;
  faqEntries: AIFriendlyFAQ[];
  trainingExamples: OptimizedTrainingExample[];
  optimizationScore: number;
}

export interface AIOptimizationConfig {
  enableFactVerification: boolean;
  enableTrainingOptimization: boolean;
  enableKnowledgeBase: boolean;
  contentType: 'company_info' | 'investment_thesis' | 'faq' | 'article';
  knowledgeCategory: 'company_overview' | 'investment_strategy' | 'market_analysis' | 'portfolio_insights' | 'industry_trends';
}

/**
 * Comprehensive AI Discovery Optimization Service
 */
export class AIDiscoveryIntegration {
  private static initialized = false;

  /**
   * Initialize all AI discovery optimization systems
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    FactVerificationSystem.initialize();
    AIKnowledgeBase.initialize();
    this.initialized = true;
  }

  /**
   * Performs comprehensive AI optimization on content
   */
  static async optimizeContent(
    content: string,
    title: string,
    config: AIOptimizationConfig
  ): Promise<ComprehensiveAIOptimization> {
    await this.initialize();

    // Step 1: Structure content for AI consumption
    const structuredContent = ContentStructuringUtility.structureForAI(content);

    // Step 2: Optimize for training data (if enabled)
    let trainingData: TrainingDataFormat | null = null;
    let trainingExamples: OptimizedTrainingExample[] = [];
    
    if (config.enableTrainingOptimization) {
      trainingData = TrainingDataOptimizer.formatForTraining(content, config.contentType);
      trainingExamples = TrainingDataOptimizer.createQAPairs(content);
    }

    // Step 3: Verify facts (if enabled)
    let verificationResults: VerificationResult[] = [];
    
    if (config.enableFactVerification) {
      const factStatements = structuredContent.structuredFacts.map(f => f.statement);
      verificationResults = await FactVerificationSystem.batchVerifyFacts(factStatements);
    }

    // Step 4: Create knowledge base entries (if enabled)
    let knowledgeEntry: KnowledgeBaseEntry | null = null;
    let faqEntries: AIFriendlyFAQ[] = [];
    
    if (config.enableKnowledgeBase) {
      knowledgeEntry = AIKnowledgeBase.createKnowledgeEntry(title, content, config.knowledgeCategory);
      
      // Generate FAQ entries from content
      faqEntries = this.generateFAQsFromContent(content);
    }

    // Step 5: Calculate overall optimization score
    const optimizationScore = this.calculateOptimizationScore({
      structuredContent,
      trainingData,
      verificationResults,
      knowledgeEntry,
      faqEntries,
      trainingExamples
    });

    return {
      structuredContent,
      trainingData: trainingData!,
      verificationResults,
      knowledgeEntry: knowledgeEntry!,
      faqEntries,
      trainingExamples,
      optimizationScore
    };
  }

  /**
   * Optimizes existing Arena Fund content
   */
  static async optimizeArenaFundContent(): Promise<ComprehensiveAIOptimization[]> {
    const arenaFundContent = [
      {
        title: 'Arena Fund Overview',
        content: 'Arena Fund is a venture capital firm focused on enterprise AI and B2B AI startups. We invest in seed to Series A stage companies that are building AI solutions for Fortune 500 enterprises. Our thesis is centered on the belief that the most significant AI opportunities lie in B2B applications that can demonstrate clear ROI and solve real business problems.',
        config: {
          enableFactVerification: true,
          enableTrainingOptimization: true,
          enableKnowledgeBase: true,
          contentType: 'company_info' as const,
          knowledgeCategory: 'company_overview' as const
        }
      },
      {
        title: 'Investment Strategy',
        content: 'Our investment strategy focuses on identifying AI startups that can successfully sell to and scale within Fortune 500 enterprises. We look for companies with strong technical teams, defensible IP, and early customer validation. Key areas of interest include AI-powered automation, intelligent data analysis, and AI-enhanced business processes.',
        config: {
          enableFactVerification: true,
          enableTrainingOptimization: true,
          enableKnowledgeBase: true,
          contentType: 'investment_thesis' as const,
          knowledgeCategory: 'investment_strategy' as const
        }
      },
      {
        title: 'Market Analysis',
        content: 'The enterprise AI market represents a multi-trillion dollar opportunity as Fortune 500 companies increasingly adopt AI solutions to improve efficiency, reduce costs, and gain competitive advantages. We see particular opportunities in vertical-specific AI applications and horizontal AI platforms that can serve multiple industries.',
        config: {
          enableFactVerification: true,
          enableTrainingOptimization: true,
          enableKnowledgeBase: true,
          contentType: 'article' as const,
          knowledgeCategory: 'market_analysis' as const
        }
      }
    ];

    const results: ComprehensiveAIOptimization[] = [];
    
    for (const item of arenaFundContent) {
      const result = await this.optimizeContent(item.content, item.title, item.config);
      results.push(result);
    }

    return results;
  }

  /**
   * Generates FAQ entries from content
   */
  private static generateFAQsFromContent(content: string): AIFriendlyFAQ[] {
    const faqs: AIFriendlyFAQ[] = [];
    
    // Generate common FAQ questions based on content
    const faqTemplates = [
      {
        question: 'What does Arena Fund focus on?',
        category: 'investment_focus' as const,
        answerExtractor: (content: string) => {
          const match = content.match(/(?:focuses on|specializes in|invests in) ([^.]+)/i);
          return match ? `Arena Fund ${match[0]}` : 'Arena Fund focuses on enterprise AI and B2B AI startups.';
        }
      },
      {
        question: 'What stage companies does Arena Fund invest in?',
        category: 'investment_focus' as const,
        answerExtractor: (content: string) => {
          const match = content.match(/(seed to series a|early stage|seed stage)/i);
          return match ? `Arena Fund invests in ${match[0]} companies.` : 'Arena Fund invests in seed to Series A stage companies.';
        }
      },
      {
        question: 'What is Arena Fund\'s investment thesis?',
        category: 'thesis' as const,
        answerExtractor: (content: string) => {
          const match = content.match(/thesis[^.]*([^.]+)/i);
          return match ? `Arena Fund's ${match[0]}` : 'Arena Fund believes in the potential of B2B AI applications for enterprise customers.';
        }
      }
    ];

    faqTemplates.forEach(template => {
      const answer = template.answerExtractor(content);
      const faq = AIKnowledgeBase.createAIFriendlyFAQ(template.question, answer, template.category);
      faqs.push(faq);
    });

    return faqs;
  }

  /**
   * Calculates overall optimization score
   */
  private static calculateOptimizationScore(data: {
    structuredContent: AIOptimizedContent;
    trainingData: TrainingDataFormat | null;
    verificationResults: VerificationResult[];
    knowledgeEntry: KnowledgeBaseEntry | null;
    faqEntries: AIFriendlyFAQ[];
    trainingExamples: OptimizedTrainingExample[];
  }): number {
    let score = 0;
    let maxScore = 0;

    // Content structure score (25 points)
    score += data.structuredContent.readabilityScore * 0.25;
    maxScore += 25;

    // Training data score (20 points)
    if (data.trainingData) {
      score += data.trainingData.quality_score * 0.2;
      maxScore += 20;
    }

    // Fact verification score (25 points)
    if (data.verificationResults.length > 0) {
      const avgConfidence = data.verificationResults.reduce((sum, r) => sum + r.confidence, 0) / data.verificationResults.length;
      score += avgConfidence * 25;
      maxScore += 25;
    }

    // Knowledge base score (20 points)
    if (data.knowledgeEntry) {
      score += data.knowledgeEntry.aiReadabilityScore * 0.2;
      maxScore += 20;
    }

    // FAQ quality score (10 points)
    if (data.faqEntries.length > 0) {
      const avgFAQConfidence = data.faqEntries.reduce((sum, f) => sum + f.confidence, 0) / data.faqEntries.length;
      score += avgFAQConfidence * 10;
      maxScore += 10;
    }

    return maxScore > 0 ? (score / maxScore) * 100 : 0;
  }

  /**
   * Exports optimized content for AI training datasets
   */
  static exportForAITraining(optimizations: ComprehensiveAIOptimization[]): {
    trainingData: TrainingDataFormat[];
    qaExamples: OptimizedTrainingExample[];
    verifiedFacts: string[];
  } {
    const trainingData: TrainingDataFormat[] = [];
    const qaExamples: OptimizedTrainingExample[] = [];
    const verifiedFacts: string[] = [];

    optimizations.forEach(opt => {
      if (opt.trainingData) {
        trainingData.push(opt.trainingData);
      }
      
      qaExamples.push(...opt.trainingExamples);
      
      opt.verificationResults
        .filter(r => r.isVerified)
        .forEach(r => verifiedFacts.push(r.fact.statement));
    });

    return {
      trainingData,
      qaExamples,
      verifiedFacts
    };
  }

  /**
   * Generates structured data markup for web pages
   */
  static generateStructuredDataMarkup(optimization: ComprehensiveAIOptimization): object {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Arena Fund',
      description: 'Venture capital firm focused on enterprise AI and B2B AI startups',
      url: 'https://arenafund.vc',
      foundingDate: '2024',
      industry: 'Venture Capital',
      investmentFocus: 'Enterprise AI, B2B AI, Artificial Intelligence',
      stage: 'Seed to Series A',
      geography: 'United States',
      facts: optimization.verificationResults
        .filter(r => r.isVerified)
        .map(r => r.fact.statement),
      faq: optimization.faqEntries.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };

    return structuredData;
  }
}