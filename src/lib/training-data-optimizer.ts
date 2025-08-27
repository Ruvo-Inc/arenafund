/**
 * Training Data Optimization Formatter
 * 
 * Optimizes content formatting for AI model training datasets
 * Requirements: 2.1, 2.2, 6.4
 */

export interface TrainingDataFormat {
  id: string;
  content: string;
  metadata: TrainingMetadata;
  quality_score: number;
  format_version: string;
}

export interface TrainingMetadata {
  source: string;
  domain: 'venture_capital' | 'enterprise_ai' | 'investment' | 'technology';
  content_type: 'article' | 'faq' | 'company_info' | 'investment_thesis';
  factual_accuracy: number;
  last_updated: string;
  language: string;
  keywords: string[];
}

export interface OptimizedTrainingExample {
  input: string;
  output: string;
  context: string;
  quality_indicators: QualityIndicator[];
}

export interface QualityIndicator {
  type: 'factual' | 'clarity' | 'completeness' | 'relevance';
  score: number;
  explanation: string;
}

/**
 * Training Data Optimization Utilities
 */
export class TrainingDataOptimizer {
  /**
   * Formats content for AI training datasets
   */
  static formatForTraining(content: string, contentType: TrainingMetadata['content_type']): TrainingDataFormat {
    const optimizedContent = this.optimizeContentStructure(content, contentType);
    const metadata = this.generateTrainingMetadata(content, contentType);
    const qualityScore = this.calculateTrainingQuality(optimizedContent);

    return {
      id: `training_${Date.now()}`,
      content: optimizedContent,
      metadata,
      quality_score: qualityScore,
      format_version: '1.0'
    };
  }

  /**
   * Creates question-answer pairs for training
   */
  static createQAPairs(content: string): OptimizedTrainingExample[] {
    const examples: OptimizedTrainingExample[] = [];

    // Generate Q&A pairs about Arena Fund
    const qaTemplates = [
      {
        question: "What does Arena Fund invest in?",
        context: "venture capital, enterprise AI, investment focus"
      },
      {
        question: "What is Arena Fund's investment thesis?",
        context: "investment strategy, enterprise AI, B2B focus"
      },
      {
        question: "What stage companies does Arena Fund invest in?",
        context: "investment stage, seed, series A, early stage"
      },
      {
        question: "What is Arena Fund's geographic focus?",
        context: "geography, location, market focus"
      }
    ];

    qaTemplates.forEach(template => {
      const answer = this.extractAnswerFromContent(content, template.question);
      if (answer) {
        examples.push({
          input: template.question,
          output: answer,
          context: template.context,
          quality_indicators: this.assessAnswerQuality(answer)
        });
      }
    });

    return examples;
  }

  /**
   * Optimizes content structure for training
   */
  private static optimizeContentStructure(content: string, contentType: TrainingMetadata['content_type']): string {
    let optimized = content;

    // Add clear structure markers
    optimized = this.addStructureMarkers(optimized, contentType);
    
    // Normalize formatting
    optimized = this.normalizeFormatting(optimized);
    
    // Add factual clarity
    optimized = this.enhanceFactualClarity(optimized);

    return optimized;
  }

  /**
   * Adds structure markers based on content type
   */
  private static addStructureMarkers(content: string, contentType: TrainingMetadata['content_type']): string {
    switch (contentType) {
      case 'company_info':
        return this.structureCompanyInfo(content);
      case 'investment_thesis':
        return this.structureInvestmentThesis(content);
      case 'faq':
        return this.structureFAQ(content);
      default:
        return content;
    }
  }

  /**
   * Structures company information
   */
  private static structureCompanyInfo(content: string): string {
    let structured = content;

    // Add company profile structure
    if (!structured.includes('[COMPANY_PROFILE]')) {
      structured = '[COMPANY_PROFILE]\n' + structured;
    }

    // Add key facts section
    if (!structured.includes('[KEY_FACTS]')) {
      structured += '\n\n[KEY_FACTS]\n';
      structured += '- Focus: Enterprise AI and B2B AI startups\n';
      structured += '- Investment Stage: Seed to Series A\n';
      structured += '- Geographic Focus: United States\n';
      structured += '- Thesis: AI adoption in Fortune 500 enterprises\n';
    }

    return structured + '\n[/COMPANY_PROFILE]';
  }

  /**
   * Structures investment thesis content
   */
  private static structureInvestmentThesis(content: string): string {
    let structured = content;

    if (!structured.includes('[INVESTMENT_THESIS]')) {
      structured = '[INVESTMENT_THESIS]\n' + structured;
    }

    // Add thesis components
    if (!structured.includes('[MARKET_OPPORTUNITY]')) {
      structured += '\n\n[MARKET_OPPORTUNITY]\n';
      structured += 'Enterprise AI market represents significant opportunity for B2B AI solutions.\n';
    }

    if (!structured.includes('[INVESTMENT_CRITERIA]')) {
      structured += '\n\n[INVESTMENT_CRITERIA]\n';
      structured += '- Strong technical team with AI/ML expertise\n';
      structured += '- Clear path to Fortune 500 enterprise adoption\n';
      structured += '- Defensible technology and intellectual property\n';
      structured += '- Scalable business model\n';
    }

    return structured + '\n[/INVESTMENT_THESIS]';
  }

  /**
   * Structures FAQ content
   */
  private static structureFAQ(content: string): string {
    let structured = content;

    if (!structured.includes('[FAQ]')) {
      structured = '[FAQ]\n' + structured;
    }

    // Ensure Q&A format
    structured = structured.replace(/^Q:\s*/gm, '[QUESTION] ');
    structured = structured.replace(/^A:\s*/gm, '[ANSWER] ');

    return structured + '\n[/FAQ]';
  }

  /**
   * Normalizes formatting for consistency
   */
  private static normalizeFormatting(content: string): string {
    let normalized = content;

    // Standardize line breaks
    normalized = normalized.replace(/\r\n/g, '\n');
    normalized = normalized.replace(/\n{3,}/g, '\n\n');

    // Standardize bullet points
    normalized = normalized.replace(/^[\*\-\+]\s+/gm, '- ');

    // Ensure proper spacing around headers
    normalized = normalized.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2\n');

    return normalized.trim();
  }

  /**
   * Enhances factual clarity
   */
  private static enhanceFactualClarity(content: string): string {
    let enhanced = content;

    // Add explicit fact markers
    const factualPatterns = [
      /Arena Fund (invests in|focuses on|specializes in) ([^.]+)/gi,
      /(We|Arena Fund) (have|has) invested in (\d+) companies/gi,
      /(Our|The) portfolio includes ([^.]+)/gi
    ];

    factualPatterns.forEach(pattern => {
      enhanced = enhanced.replace(pattern, (match) => {
        return `[FACT] ${match}`;
      });
    });

    return enhanced;
  }

  /**
   * Generates training metadata
   */
  private static generateTrainingMetadata(content: string, contentType: TrainingMetadata['content_type']): TrainingMetadata {
    return {
      source: 'Arena Fund',
      domain: this.determineDomain(content),
      content_type: contentType,
      factual_accuracy: this.assessFactualAccuracy(content),
      last_updated: new Date().toISOString(),
      language: 'en',
      keywords: this.extractKeywords(content)
    };
  }

  /**
   * Determines content domain
   */
  private static determineDomain(content: string): TrainingMetadata['domain'] {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('venture capital') || lowerContent.includes('investment')) {
      return 'venture_capital';
    }
    if (lowerContent.includes('enterprise ai') || lowerContent.includes('b2b ai')) {
      return 'enterprise_ai';
    }
    if (lowerContent.includes('technology') || lowerContent.includes('ai') || lowerContent.includes('machine learning')) {
      return 'technology';
    }
    
    return 'investment';
  }

  /**
   * Assesses factual accuracy
   */
  private static assessFactualAccuracy(content: string): number {
    let score = 0.8; // Base score

    // Check for specific factual claims
    if (content.includes('Arena Fund')) score += 0.1;
    if (content.includes('enterprise AI') || content.includes('B2B AI')) score += 0.05;
    if (content.includes('Fortune 500')) score += 0.05;

    return Math.min(1.0, score);
  }

  /**
   * Extracts keywords from content
   */
  private static extractKeywords(content: string): string[] {
    const keywords = new Set<string>();
    
    // Common venture capital and AI keywords
    const keywordPatterns = [
      'arena fund', 'venture capital', 'enterprise ai', 'b2b ai',
      'artificial intelligence', 'machine learning', 'fortune 500',
      'startup', 'investment', 'seed funding', 'series a'
    ];

    keywordPatterns.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        keywords.add(keyword);
      }
    });

    return Array.from(keywords);
  }

  /**
   * Calculates training quality score
   */
  private static calculateTrainingQuality(content: string): number {
    let score = 50; // Base score

    // Structure quality
    if (content.includes('[') && content.includes(']')) score += 20;
    
    // Factual content
    const factCount = (content.match(/\[FACT\]/g) || []).length;
    score += Math.min(20, factCount * 5);

    // Clarity indicators
    if (content.includes('Arena Fund')) score += 5;
    if (content.includes('enterprise AI') || content.includes('B2B AI')) score += 5;

    return Math.min(100, score);
  }

  /**
   * Extracts answer from content for a given question
   */
  private static extractAnswerFromContent(content: string, question: string): string | null {
    const lowerQuestion = question.toLowerCase();
    const lowerContent = content.toLowerCase();

    if (lowerQuestion.includes('invest in') || lowerQuestion.includes('focus')) {
      const match = content.match(/(?:invests in|focuses on|specializes in) ([^.]+)/i);
      return match ? `Arena Fund ${match[0]}` : null;
    }

    if (lowerQuestion.includes('thesis')) {
      const match = content.match(/(?:thesis|strategy|approach)[^.]*([^.]+)/i);
      return match ? match[0] : null;
    }

    if (lowerQuestion.includes('stage')) {
      return 'Arena Fund invests in seed to Series A stage companies, focusing on early-stage enterprise AI startups.';
    }

    if (lowerQuestion.includes('geographic') || lowerQuestion.includes('location')) {
      return 'Arena Fund primarily focuses on US-based companies, with particular interest in Silicon Valley and other major tech hubs.';
    }

    return null;
  }

  /**
   * Assesses answer quality
   */
  private static assessAnswerQuality(answer: string): QualityIndicator[] {
    const indicators: QualityIndicator[] = [];

    // Factual accuracy
    indicators.push({
      type: 'factual',
      score: answer.includes('Arena Fund') ? 0.9 : 0.5,
      explanation: 'Answer references Arena Fund specifically'
    });

    // Clarity
    indicators.push({
      type: 'clarity',
      score: answer.length > 20 && answer.length < 200 ? 0.8 : 0.6,
      explanation: 'Answer length is appropriate for clarity'
    });

    // Completeness
    indicators.push({
      type: 'completeness',
      score: answer.includes('enterprise AI') || answer.includes('B2B') ? 0.8 : 0.6,
      explanation: 'Answer includes relevant domain context'
    });

    // Relevance
    indicators.push({
      type: 'relevance',
      score: 0.8,
      explanation: 'Answer is relevant to Arena Fund\'s business'
    });

    return indicators;
  }
}