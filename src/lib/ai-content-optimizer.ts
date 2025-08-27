/**
 * AI Content Optimizer
 * Provides utilities for optimizing content for AI model consumption and citation
 */

export interface StructuredFact {
  id: string;
  statement: string;
  confidence: number;
  sources: string[];
  category: 'financial' | 'investment' | 'company' | 'market' | 'general';
  extractedAt: Date;
}

export interface CitationData {
  url: string;
  title: string;
  author?: string;
  publishedDate?: Date;
  accessedDate: Date;
  citationFormat: string;
}

export interface AIOptimizedContent {
  originalContent: string;
  structuredFacts: StructuredFact[];
  aiReadableFormat: string;
  citationData: CitationData[];
  readabilityScore: number;
  optimizationSuggestions: string[];
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  structure: TemplateSection[];
  aiOptimizations: AIOptimization[];
}

export interface TemplateSection {
  type: 'header' | 'paragraph' | 'list' | 'fact-block' | 'citation' | 'data-point';
  content: string;
  aiInstructions?: string;
  required: boolean;
}

export interface AIOptimization {
  type: 'fact-extraction' | 'citation-format' | 'readability' | 'structure';
  description: string;
  implementation: string;
}

/**
 * Core AI Content Optimizer class
 */
export class AIContentOptimizer {
  private factPatterns: RegExp[] = [
    /Arena Fund\s+is\s+the\s+first\s+venture\s+capital\s+fund[^.]+\./gi,
    /(?:Arena Fund|we|our company)\s+(?:invests?|focuses?|specializes?|validates?|achieves?)\s+[^.]+\./gi,
    /(?:Our|The)\s+portfolio\s+includes?\s+([^.]+)/gi,
    /(?:We have|Arena Fund has)\s+(?:invested|raised|managed)\s+\$?([0-9,]+(?:\.[0-9]+)?(?:\s*(?:million|billion|M|B))?)/gi,
    /\d+%\s+[^.]*(?:conversion|pilot|success)[^.]*/gi,
    /Fortune 500[^.]*/gi,
    /(?:Founded|Established)\s+in\s+(\d{4})/gi,
    /(?:Based|Located)\s+in\s+([^,]+(?:,\s*[^.]+)?)/gi,
  ];

  /**
   * Extract structured facts from content
   */
  extractFacts(content: string): StructuredFact[] {
    const facts: StructuredFact[] = [];
    let factId = 1;

    this.factPatterns.forEach((pattern) => {
      const matches = content.matchAll(pattern);
      
      for (const match of matches) {
        if (match[0]) {
          facts.push({
            id: `fact-${factId++}`,
            statement: match[0].trim(),
            confidence: this.calculateFactConfidence(match[0]),
            sources: [], // Will be populated by citation system
            category: this.categorizeStatement(match[0]),
            extractedAt: new Date()
          });
        }
      }
    });

    return facts;
  }

  /**
   * Generate AI-readable format of content
   */
  generateAIReadableFormat(content: string): string {
    // Clean and structure content for AI consumption
    let aiContent = content
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Add clear section breaks
      .replace(/\n\n+/g, '\n\n---\n\n')
      // Enhance headers for AI parsing
      .replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, title) => {
        return `${hashes} ${title.toUpperCase()}`;
      })
      // Structure lists for better AI parsing
      .replace(/^[-*+]\s+(.+)$/gm, '• $1')
      // Add fact markers for Arena Fund statements
      .replace(/\b(Arena Fund|we|our)\s+(invests?|focuses?|specializes?|has|have|achieves?|validates?)\b[^.]*\./gi, 
        '**FACT:** $&')
      // Add fact markers for specific claims
      .replace(/\b\d+%\s+[^.]*conversion[^.]*/gi, '**DATA:** $&')
      .replace(/\bFortune 500[^.]*/gi, '**FACT:** $&');

    // Add structured data markers
    aiContent = this.addStructuredMarkers(aiContent);

    return aiContent;
  }

  /**
   * Generate citations in multiple formats
   */
  generateCitations(sources: string[]): CitationData[] {
    return sources.map(source => {
      const url = this.extractUrl(source) || '';
      const title = this.extractTitle(source) || 'Arena Fund Content';
      const now = new Date();

      return {
        url,
        title,
        publishedDate: now,
        accessedDate: now,
        citationFormat: this.formatCitation({ url, title, publishedDate: now })
      };
    });
  }

  /**
   * Calculate AI readability score
   */
  calculateReadabilityScore(content: string): number {
    let score = 100;
    
    // Penalize for complex sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    if (avgSentenceLength > 20) score -= (avgSentenceLength - 20) * 2;

    // Reward clear structure
    const hasHeaders = /^#{1,6}\s+/m.test(content);
    const hasLists = /^[-*+]\s+/m.test(content);
    const hasFacts = /\*\*FACT:\*\*/.test(content);
    
    if (hasHeaders) score += 10;
    if (hasLists) score += 5;
    if (hasFacts) score += 15;

    // Penalize for ambiguous language
    const ambiguousWords = ['maybe', 'perhaps', 'might', 'could be', 'possibly'];
    const ambiguousCount = ambiguousWords.reduce((count, word) => 
      count + (content.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0);
    score -= ambiguousCount * 5;

    // Reward specific data points
    const dataPoints = content.match(/\$?[0-9,]+(?:\.[0-9]+)?(?:\s*(?:million|billion|M|B|%))?\b/g) || [];
    score += Math.min(dataPoints.length * 3, 15);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Optimize content for AI consumption
   */
  optimizeForAI(content: string, sources: string[] = []): AIOptimizedContent {
    const structuredFacts = this.extractFacts(content);
    const aiReadableFormat = this.generateAIReadableFormat(content);
    const citationData = this.generateCitations(sources);
    const readabilityScore = this.calculateReadabilityScore(aiReadableFormat);
    const optimizationSuggestions = this.generateOptimizationSuggestions(content, readabilityScore);

    return {
      originalContent: content,
      structuredFacts,
      aiReadableFormat,
      citationData,
      readabilityScore,
      optimizationSuggestions
    };
  }

  private calculateFactConfidence(statement: string): number {
    let confidence = 0.7; // Base confidence
    
    // Higher confidence for specific data
    if (/\$?[0-9,]+(?:\.[0-9]+)?(?:\s*(?:million|billion|M|B))/.test(statement)) {
      confidence += 0.2;
    }
    
    // Higher confidence for dates
    if (/\d{4}/.test(statement)) {
      confidence += 0.1;
    }
    
    return Math.min(1.0, confidence);
  }

  private categorizeStatement(statement: string): StructuredFact['category'] {
    const lowerStatement = statement.toLowerCase();
    
    if (lowerStatement.includes('invest') || lowerStatement.includes('fund')) {
      return 'investment';
    }
    if (lowerStatement.includes('company') || lowerStatement.includes('founded')) {
      return 'company';
    }
    if (lowerStatement.includes('market') || lowerStatement.includes('industry')) {
      return 'market';
    }
    if (lowerStatement.includes('$') || lowerStatement.includes('million') || lowerStatement.includes('billion')) {
      return 'financial';
    }
    
    return 'general';
  }

  private addStructuredMarkers(content: string): string {
    return content
      .replace(/^(#{1,3})\s*(.+)$/gm, '$1 [SECTION] $2')
      .replace(/\*\*FACT:\*\*\s*(.+)/g, '[FACT] $1 [/FACT]')
      .replace(/^•\s+(.+)$/gm, '[LIST_ITEM] $1 [/LIST_ITEM]');
  }

  private extractUrl(source: string): string | null {
    const urlMatch = source.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : null;
  }

  private extractTitle(source: string): string | null {
    // Simple title extraction - in real implementation, this would be more sophisticated
    const titleMatch = source.match(/^([^-|]+)/);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  private formatCitation(data: { url: string; title: string; publishedDate: Date }): string {
    const date = data.publishedDate.toISOString().split('T')[0];
    return `"${data.title}." Arena Fund. ${date}. ${data.url}`;
  }

  private generateOptimizationSuggestions(content: string, score: number): string[] {
    const suggestions: string[] = [];
    
    if (score < 70) {
      suggestions.push('Consider breaking down complex sentences for better AI parsing');
    }
    
    if (!/^#{1,6}\s+/m.test(content)) {
      suggestions.push('Add clear section headers to improve content structure');
    }
    
    if (!/\*\*FACT:\*\*/.test(content)) {
      suggestions.push('Highlight key facts with clear markers for AI extraction');
    }
    
    const dataPoints = content.match(/\$?[0-9,]+(?:\.[0-9]+)?(?:\s*(?:million|billion|M|B|%))?\b/g) || [];
    if (dataPoints.length < 2) {
      suggestions.push('Include more specific data points and metrics');
    }
    
    return suggestions;
  }
}

// Export singleton instance
export const aiContentOptimizer = new AIContentOptimizer();