/**
 * AI-Friendly FAQ and Knowledge Base Structures
 * 
 * Creates optimized FAQ and knowledge base structures for AI consumption
 * Requirements: 2.1, 2.2, 6.4
 */

import { StructuredFact, CitationData } from './ai-discovery-optimizer';
import { VerifiableFact, FactVerificationSystem } from './fact-verification-system';

export interface AIFriendlyFAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  keywords: string[];
  relatedQuestions: string[];
  structuredData: FAQStructuredData;
  aiOptimized: boolean;
  confidence: number;
  lastUpdated: Date;
}

export interface FAQStructuredData {
  '@context': string;
  '@type': string;
  mainEntity: {
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  };
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: KnowledgeCategory;
  facts: StructuredFact[];
  citations: CitationData[];
  aiReadabilityScore: number;
  searchKeywords: string[];
  relatedEntries: string[];
  structuredData: KnowledgeStructuredData;
  lastOptimized: Date;
}

export interface KnowledgeStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  about: {
    '@type': string;
    name: string;
  };
  author: {
    '@type': string;
    name: string;
    url: string;
  };
  datePublished: string;
  dateModified: string;
}

export type FAQCategory = 
  | 'investment_focus'
  | 'application_process'
  | 'portfolio'
  | 'team'
  | 'thesis'
  | 'general';

export type KnowledgeCategory = 
  | 'company_overview'
  | 'investment_strategy'
  | 'market_analysis'
  | 'portfolio_insights'
  | 'industry_trends';

/**
 * AI Knowledge Base Manager
 */
export class AIKnowledgeBase {
  private static faqs: Map<string, AIFriendlyFAQ> = new Map();
  private static knowledgeEntries: Map<string, KnowledgeBaseEntry> = new Map();

  /**
   * Initialize with Arena Fund knowledge base
   */
  static initialize(): void {
    this.loadArenaFundFAQs();
    this.loadArenaFundKnowledgeBase();
    FactVerificationSystem.initialize();
  }

  /**
   * Creates an AI-optimized FAQ entry
   */
  static createAIFriendlyFAQ(
    question: string,
    answer: string,
    category: FAQCategory
  ): AIFriendlyFAQ {
    const keywords = this.extractKeywords(question + ' ' + answer);
    const relatedQuestions = this.findRelatedQuestions(question, category);
    const structuredData = this.generateFAQStructuredData(question, answer);
    const confidence = this.calculateFAQConfidence(answer);

    return {
      id: `faq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question,
      answer: this.optimizeAnswerForAI(answer),
      category,
      keywords,
      relatedQuestions,
      structuredData,
      aiOptimized: true,
      confidence,
      lastUpdated: new Date()
    };
  }

  /**
   * Creates a knowledge base entry
   */
  static createKnowledgeEntry(
    title: string,
    content: string,
    category: KnowledgeCategory
  ): KnowledgeBaseEntry {
    const summary = this.generateSummary(content);
    const facts = this.extractFactsFromContent(content);
    const citations = this.generateCitations(content);
    const aiReadabilityScore = this.calculateAIReadability(content);
    const searchKeywords = this.extractKeywords(title + ' ' + content);
    const relatedEntries = this.findRelatedEntries(content, category);
    const structuredData = this.generateKnowledgeStructuredData(title, summary);

    return {
      id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content: this.optimizeContentForAI(content),
      summary,
      category,
      facts,
      citations,
      aiReadabilityScore,
      searchKeywords,
      relatedEntries,
      structuredData,
      lastOptimized: new Date()
    };
  }

  /**
   * Gets FAQ by category
   */
  static getFAQsByCategory(category: FAQCategory): AIFriendlyFAQ[] {
    return Array.from(this.faqs.values()).filter(faq => faq.category === category);
  }

  /**
   * Gets knowledge entries by category
   */
  static getKnowledgeByCategory(category: KnowledgeCategory): KnowledgeBaseEntry[] {
    return Array.from(this.knowledgeEntries.values()).filter(entry => entry.category === category);
  }

  /**
   * Searches FAQ by keywords
   */
  static searchFAQ(query: string): AIFriendlyFAQ[] {
    const queryLower = query.toLowerCase();
    return Array.from(this.faqs.values()).filter(faq => 
      faq.question.toLowerCase().includes(queryLower) ||
      faq.answer.toLowerCase().includes(queryLower) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(queryLower)) ||
      faq.category.toLowerCase().includes(queryLower)
    );
  }

  /**
   * Searches knowledge base
   */
  static searchKnowledge(query: string): KnowledgeBaseEntry[] {
    const queryLower = query.toLowerCase();
    return Array.from(this.knowledgeEntries.values()).filter(entry =>
      entry.title.toLowerCase().includes(queryLower) ||
      entry.content.toLowerCase().includes(queryLower) ||
      entry.searchKeywords.some(keyword => keyword.includes(queryLower))
    );
  }

  /**
   * Optimizes answer for AI consumption
   */
  private static optimizeAnswerForAI(answer: string): string {
    let optimized = answer;

    // Ensure clear, factual statements
    if (!optimized.includes('Arena Fund')) {
      optimized = 'Arena Fund ' + optimized;
    }

    // Add structure markers for key information
    optimized = optimized.replace(
      /(focus on|focuses on|invests in|specializes in)/gi,
      '[FOCUS] $1'
    );

    // Ensure specific, measurable claims
    optimized = optimized.replace(
      /(\d+(?:\.\d+)?(?:%|percent|million|billion))/gi,
      '[METRIC] $1'
    );

    return optimized;
  }

  /**
   * Optimizes content for AI consumption
   */
  private static optimizeContentForAI(content: string): string {
    let optimized = content;

    // Add clear section headers
    optimized = optimized.replace(/^(.+):$/gm, '## $1');

    // Mark factual statements
    optimized = optimized.replace(
      /Arena Fund (invests in|focuses on|specializes in|has|is) ([^.]+)/gi,
      '[FACT] Arena Fund $1 $2'
    );

    // Add context markers
    optimized = optimized.replace(
      /(enterprise AI|B2B AI|artificial intelligence)/gi,
      '[DOMAIN] $1'
    );

    return optimized;
  }

  /**
   * Extracts keywords from text
   */
  private static extractKeywords(text: string): string[] {
    const keywords = new Set<string>();
    const lowerText = text.toLowerCase();

    // Domain-specific keywords
    const domainKeywords = [
      'arena fund', 'venture capital', 'enterprise ai', 'b2b ai',
      'artificial intelligence', 'machine learning', 'fortune 500',
      'startup', 'investment', 'seed funding', 'series a',
      'portfolio', 'thesis', 'strategy', 'market'
    ];

    domainKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        keywords.add(keyword);
      }
    });

    // Extract important phrases (2-3 words)
    const phrases = text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b/g) || [];
    phrases.forEach(phrase => {
      if (phrase.length > 5) {
        keywords.add(phrase.toLowerCase());
      }
    });

    return Array.from(keywords);
  }

  /**
   * Finds related questions
   */
  private static findRelatedQuestions(question: string, category: FAQCategory): string[] {
    const related: string[] = [];
    const questionLower = question.toLowerCase();

    // Category-based related questions
    const relatedByCategory: Record<FAQCategory, string[]> = {
      investment_focus: [
        'What types of companies does Arena Fund invest in?',
        'What is Arena Fund\'s investment thesis?',
        'What stage companies does Arena Fund target?'
      ],
      application_process: [
        'How do I apply for funding from Arena Fund?',
        'What is the application process like?',
        'How long does the application process take?'
      ],
      portfolio: [
        'Who are Arena Fund\'s portfolio companies?',
        'What industries does Arena Fund\'s portfolio cover?',
        'How does Arena Fund support portfolio companies?'
      ],
      team: [
        'Who are the partners at Arena Fund?',
        'What is the team\'s background?',
        'How can I contact Arena Fund?'
      ],
      thesis: [
        'What is Arena Fund\'s investment thesis?',
        'Why does Arena Fund focus on enterprise AI?',
        'What market opportunity does Arena Fund see?'
      ],
      general: [
        'What is Arena Fund?',
        'When was Arena Fund founded?',
        'Where is Arena Fund located?'
      ]
    };

    return relatedByCategory[category] || [];
  }

  /**
   * Generates FAQ structured data
   */
  private static generateFAQStructuredData(question: string, answer: string): FAQStructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: {
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer
        }
      }
    };
  }

  /**
   * Calculates FAQ confidence score
   */
  private static calculateFAQConfidence(answer: string): number {
    let score = 0.5;

    // Specific mentions increase confidence
    if (answer.toLowerCase().includes('arena fund')) score += 0.2;
    if (answer.toLowerCase().includes('enterprise ai') || answer.toLowerCase().includes('b2b ai')) score += 0.1;
    if (answer.includes('Fortune 500')) score += 0.1;

    // Length and structure
    if (answer.length > 50 && answer.length < 300) score += 0.1;

    return Math.min(1.0, score);
  }

  /**
   * Generates summary from content
   */
  private static generateSummary(content: string): string {
    // Simple summary generation - take first sentence or paragraph
    const sentences = content.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length > 20) {
      return firstSentence + '.';
    }

    // Fallback to first 150 characters
    return content.substring(0, 150).trim() + '...';
  }

  /**
   * Extracts facts from content
   */
  private static extractFactsFromContent(content: string): StructuredFact[] {
    const facts: StructuredFact[] = [];
    
    // Extract factual statements
    const factPatterns = [
      /Arena Fund (invests in|focuses on|specializes in) ([^.]+)/gi,
      /(We|Arena Fund) (have|has) invested in (\d+) companies/gi,
      /(Our|The) portfolio includes ([^.]+)/gi,
      /Fortune 500 companies (?:are|have) ([^.]+)/gi
    ];

    factPatterns.forEach((pattern, index) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        facts.push({
          id: `extracted_fact_${Date.now()}_${index}`,
          statement: match[0],
          category: this.categorizeFactStatement(match[0]),
          confidence: 0.8,
          sources: ['https://arenafund.vc'],
          lastVerified: new Date(),
          isVerified: true
        });
      }
    });

    return facts;
  }

  /**
   * Categorizes fact statements
   */
  private static categorizeFactStatement(statement: string): StructuredFact['category'] {
    const lowerStatement = statement.toLowerCase();
    
    if (lowerStatement.includes('invest') || lowerStatement.includes('portfolio')) {
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
   * Generates citations for content
   */
  private static generateCitations(content: string): CitationData[] {
    // For now, return Arena Fund as primary citation
    return [{
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
    }];
  }

  /**
   * Calculates AI readability score
   */
  private static calculateAIReadability(content: string): number {
    let score = 50;

    // Structure indicators
    if (content.includes('##') || content.includes('#')) score += 10;
    if (content.includes('- ') || content.includes('* ')) score += 5;

    // Clarity indicators
    if (content.includes('Arena Fund')) score += 10;
    if (content.includes('[FACT]') || content.includes('[DOMAIN]')) score += 15;

    // Length appropriateness
    if (content.length > 100 && content.length < 2000) score += 10;

    // Avoid ambiguous language
    const ambiguousWords = ['maybe', 'perhaps', 'might', 'could be'];
    ambiguousWords.forEach(word => {
      const matches = (content.toLowerCase().match(new RegExp(word, 'g')) || []).length;
      score -= matches * 3;
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Finds related entries
   */
  private static findRelatedEntries(content: string, category: KnowledgeCategory): string[] {
    // Simple implementation - return category-based related entries
    const relatedByCategory: Record<KnowledgeCategory, string[]> = {
      company_overview: ['investment_strategy', 'team'],
      investment_strategy: ['company_overview', 'market_analysis'],
      market_analysis: ['investment_strategy', 'industry_trends'],
      portfolio_insights: ['investment_strategy', 'market_analysis'],
      industry_trends: ['market_analysis', 'portfolio_insights']
    };

    return relatedByCategory[category] || [];
  }

  /**
   * Generates knowledge structured data
   */
  private static generateKnowledgeStructuredData(title: string, summary: string): KnowledgeStructuredData {
    const now = new Date().toISOString();
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      name: title,
      description: summary,
      about: {
        '@type': 'Organization',
        name: 'Arena Fund'
      },
      author: {
        '@type': 'Organization',
        name: 'Arena Fund',
        url: 'https://arenafund.vc'
      },
      datePublished: now,
      dateModified: now
    };
  }

  /**
   * Loads Arena Fund FAQs
   */
  private static loadArenaFundFAQs(): void {
    const arenaFundFAQs = [
      {
        question: 'What does Arena Fund invest in?',
        answer: 'Arena Fund focuses on enterprise AI and B2B AI startups that are building solutions for Fortune 500 companies. We invest in seed to Series A stage companies with strong technical teams and clear paths to enterprise adoption.',
        category: 'investment_focus' as FAQCategory
      },
      {
        question: 'What is Arena Fund\'s investment thesis?',
        answer: 'Arena Fund believes that the next wave of AI innovation will come from B2B applications that solve real enterprise problems. We focus on companies that can demonstrate clear ROI for Fortune 500 customers and have defensible technology.',
        category: 'thesis' as FAQCategory
      },
      {
        question: 'How do I apply for funding from Arena Fund?',
        answer: 'You can apply for funding through our website at arenafund.vc. We review applications on a rolling basis and typically respond within 2-3 weeks. We look for strong technical teams, clear market opportunity, and early customer traction.',
        category: 'application_process' as FAQCategory
      },
      {
        question: 'What stage companies does Arena Fund invest in?',
        answer: 'Arena Fund primarily invests in seed to Series A stage companies. We typically invest between $500K to $2M in initial rounds and can participate in follow-on rounds for portfolio companies.',
        category: 'investment_focus' as FAQCategory
      }
    ];

    arenaFundFAQs.forEach(faqData => {
      const faq = this.createAIFriendlyFAQ(faqData.question, faqData.answer, faqData.category);
      this.faqs.set(faq.id, faq);
    });
  }

  /**
   * Loads Arena Fund knowledge base
   */
  private static loadArenaFundKnowledgeBase(): void {
    const knowledgeEntries = [
      {
        title: 'Arena Fund Company Overview',
        content: 'Arena Fund is a venture capital firm focused on enterprise AI and B2B AI startups. We invest in seed to Series A stage companies that are building AI solutions for Fortune 500 enterprises. Our thesis is centered on the belief that the most significant AI opportunities lie in B2B applications that can demonstrate clear ROI and solve real business problems.',
        category: 'company_overview' as KnowledgeCategory
      },
      {
        title: 'Enterprise AI Investment Strategy',
        content: 'Our investment strategy focuses on identifying AI startups that can successfully sell to and scale within Fortune 500 enterprises. We look for companies with strong technical teams, defensible IP, and early customer validation. Key areas of interest include AI-powered automation, intelligent data analysis, and AI-enhanced business processes.',
        category: 'investment_strategy' as KnowledgeCategory
      },
      {
        title: 'Enterprise AI Market Analysis',
        content: 'The enterprise AI market represents a multi-trillion dollar opportunity as Fortune 500 companies increasingly adopt AI solutions to improve efficiency, reduce costs, and gain competitive advantages. We see particular opportunities in vertical-specific AI applications and horizontal AI platforms that can serve multiple industries.',
        category: 'market_analysis' as KnowledgeCategory
      }
    ];

    knowledgeEntries.forEach(entryData => {
      const entry = this.createKnowledgeEntry(entryData.title, entryData.content, entryData.category);
      this.knowledgeEntries.set(entry.id, entry);
    });
  }
}