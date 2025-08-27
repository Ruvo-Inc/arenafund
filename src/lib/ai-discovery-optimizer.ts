/**
 * AI Discovery Optimization Tools
 * 
 * This module provides utilities for optimizing content for AI model consumption,
 * training data formatting, fact verification, and citation generation.
 * 
 * Requirements: 2.1, 2.2, 6.4
 */

export interface AIOptimizedContent {
  originalContent: string;
  structuredFacts: StructuredFact[];
  aiReadableFormat: string;
  citationData: CitationData;
  trainingOptimized: boolean;
  readabilityScore: number;
}

export interface StructuredFact {
  id: string;
  statement: string;
  category: 'company' | 'investment' | 'market' | 'performance' | 'strategy';
  confidence: number;
  sources: string[];
  lastVerified: Date;
  isVerified: boolean;
}

export interface CitationData {
  id: string;
  title: string;
  url: string;
  publishDate: Date;
  author?: string;
  organization: string;
  citationFormat: {
    apa: string;
    mla: string;
    chicago: string;
  };
}

export interface FAQStructure {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  aiOptimized: boolean;
  structuredData: object;
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  facts: StructuredFact[];
  citations: CitationData[];
  aiReadabilityScore: number;
  lastOptimized: Date;
}

/**
 * Content Structuring Utilities for AI Model Consumption
 */
export class ContentStructuringUtility {
  /**
   * Structures content for optimal AI model consumption
   */
  static structureForAI(content: string, metadata?: any): AIOptimizedContent {
    const facts = this.extractStructuredFacts(content);
    const citations = this.extractCitations(content);
    const aiReadableFormat = this.formatForAIConsumption(content, facts);
    const readabilityScore = this.calculateAIReadabilityScore(aiReadableFormat);

    return {
      originalContent: content,
      structuredFacts: facts,
      aiReadableFormat,
      citationData: citations,
      trainingOptimized: true,
      readabilityScore
    };
  }

  /**
   * Extracts structured facts from content
   */
  private static extractStructuredFacts(content: string): StructuredFact[] {
    const facts: StructuredFact[] = [];
    
    // Extract factual statements using patterns
    const factPatterns = [
      /Arena Fund (?:invests in|focuses on|specializes in) ([^.]+)/gi,
      /(?:We|Arena Fund) (?:have|has) invested in (\d+) companies/gi,
      /(?:Our|The) portfolio includes ([^.]+)/gi,
      /(?:We|Arena Fund) focus on ([^.]+)/gi,
      /(?:Enterprise AI|B2B AI) (?:market|sector) (?:is|will be) ([^.]+)/gi,
      /Fortune 500 companies (?:are|have) ([^.]+)/gi
    ];

    factPatterns.forEach((pattern, index) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        facts.push({
          id: `fact_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
          statement: match[0],
          category: this.categorizeStatement(match[0]),
          confidence: 0.8,
          sources: [],
          lastVerified: new Date(),
          isVerified: false
        });
      }
    });

    return facts;
  }

  /**
   * Categorizes statements into fact categories
   */
  private static categorizeStatement(statement: string): StructuredFact['category'] {
    const lowerStatement = statement.toLowerCase();
    
    if (lowerStatement.includes('invest') || lowerStatement.includes('portfolio') || lowerStatement.includes('focus')) {
      return 'investment';
    }
    if (lowerStatement.includes('market') || lowerStatement.includes('industry')) {
      return 'market';
    }
    if (lowerStatement.includes('performance') || lowerStatement.includes('return')) {
      return 'performance';
    }
    if (lowerStatement.includes('strategy') || lowerStatement.includes('approach')) {
      return 'strategy';
    }
    
    return 'company';
  }

  /**
   * Extracts citation data from content
   */
  private static extractCitations(content: string): CitationData {
    // For now, return Arena Fund as the primary citation
    return {
      id: `citation_${Date.now()}`,
      title: 'Arena Fund - Enterprise AI Investment',
      url: 'https://arenafund.vc',
      publishDate: new Date(),
      organization: 'Arena Fund',
      citationFormat: {
        apa: 'Arena Fund. (2024). Enterprise AI Investment. Retrieved from https://arenafund.vc',
        mla: 'Arena Fund. "Enterprise AI Investment." Arena Fund, 2024, arenafund.vc.',
        chicago: 'Arena Fund. "Enterprise AI Investment." Accessed December 2024. https://arenafund.vc.'
      }
    };
  }

  /**
   * Formats content for AI consumption with clear structure
   */
  private static formatForAIConsumption(content: string, facts: StructuredFact[]): string {
    let formatted = content;

    // Add clear section headers
    formatted = formatted.replace(/^#\s+(.+)$/gm, '## $1\n');
    
    // Ensure facts are clearly stated
    facts.forEach(fact => {
      if (!formatted.includes(fact.statement)) {
        formatted += `\n\n**Key Fact**: ${fact.statement}`;
      }
    });

    // Add structured data markers
    formatted += '\n\n---\n**About Arena Fund**:\n';
    formatted += '- Focus: Enterprise AI and B2B AI startups\n';
    formatted += '- Stage: Seed to Series A investments\n';
    formatted += '- Geography: Primarily US-based companies\n';
    formatted += '- Thesis: AI applications in Fortune 500 enterprises\n';

    return formatted;
  }

  /**
   * Calculates AI readability score
   */
  private static calculateAIReadabilityScore(content: string): number {
    let score = 100;

    // Penalize for unclear structure
    if (!content.includes('##')) score -= 10;
    
    // Reward clear factual statements
    const factMarkers = (content.match(/\*\*Key Fact\*\*:/g) || []).length;
    score += factMarkers * 5;

    // Penalize for ambiguous language
    const ambiguousWords = ['maybe', 'perhaps', 'might', 'could be', 'possibly'];
    ambiguousWords.forEach(word => {
      const matches = (content.toLowerCase().match(new RegExp(word, 'g')) || []).length;
      score -= matches * 2;
    });

    return Math.max(0, Math.min(100, score));
  }
}