/**
 * AI Readability Scorer
 * System for scoring content readability for AI models and providing optimization suggestions
 */

export interface ReadabilityMetrics {
  overallScore: number;
  structureScore: number;
  clarityScore: number;
  factualityScore: number;
  citationScore: number;
  aiParsingScore: number;
  suggestions: ReadabilitySuggestion[];
}

export interface ReadabilitySuggestion {
  type: 'structure' | 'clarity' | 'factuality' | 'citation' | 'parsing';
  priority: 'high' | 'medium' | 'low';
  message: string;
  example?: string;
}

export interface ContentAnalysis {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  headerCount: number;
  listCount: number;
  factCount: number;
  citationCount: number;
  dataPointCount: number;
  averageSentenceLength: number;
  readingLevel: 'elementary' | 'middle' | 'high' | 'college' | 'graduate';
}

/**
 * AI Readability Scorer class
 */
export class AIReadabilityScorer {
  private readonly maxSentenceLength = 25;
  private readonly idealSentenceLength = 15;
  private readonly maxParagraphSentences = 5;
  private readonly idealParagraphSentences = 3;

  /**
   * Score content for AI readability
   */
  scoreContent(content: string): ReadabilityMetrics {
    const analysis = this.analyzeContent(content);
    
    const structureScore = this.calculateStructureScore(content, analysis);
    const clarityScore = this.calculateClarityScore(content, analysis);
    const factualityScore = this.calculateFactualityScore(content, analysis);
    const citationScore = this.calculateCitationScore(content, analysis);
    const aiParsingScore = this.calculateAIParsingScore(content, analysis);
    
    const overallScore = Math.round(
      (structureScore * 0.25) +
      (clarityScore * 0.25) +
      (factualityScore * 0.20) +
      (citationScore * 0.15) +
      (aiParsingScore * 0.15)
    );

    const suggestions = this.generateSuggestions(content, analysis, {
      structureScore,
      clarityScore,
      factualityScore,
      citationScore,
      aiParsingScore
    });

    return {
      overallScore,
      structureScore,
      clarityScore,
      factualityScore,
      citationScore,
      aiParsingScore,
      suggestions
    };
  }

  /**
   * Analyze content structure and characteristics
   */
  private analyzeContent(content: string): ContentAnalysis {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const headers = content.match(/^#{1,6}\s+.+$/gm) || [];
    const lists = content.match(/^[-*+]\s+.+$/gm) || [];
    const facts = content.match(/\*\*FACT:\*\*|\[FACT\]/g) || [];
    const citations = content.match(/\[REF:[^\]]+\]|\[CITATION\]/g) || [];
    const dataPoints = content.match(/\$?[0-9,]+(?:\.[0-9]+)?(?:\s*(?:million|billion|M|B|%))?\b/g) || [];
    
    const averageSentenceLength = sentences.length > 0 ? 
      words.length / sentences.length : 0;
    
    const readingLevel = this.calculateReadingLevel(averageSentenceLength, words);

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      headerCount: headers.length,
      listCount: lists.length,
      factCount: facts.length,
      citationCount: citations.length,
      dataPointCount: dataPoints.length,
      averageSentenceLength,
      readingLevel
    };
  }

  /**
   * Calculate structure score (headers, lists, organization)
   */
  private calculateStructureScore(content: string, analysis: ContentAnalysis): number {
    let score = 100;
    
    // Penalize lack of headers
    if (analysis.headerCount === 0) {
      score -= 30;
    } else if (analysis.wordCount > 500 && analysis.headerCount < 3) {
      score -= 15;
    }
    
    // Reward proper header hierarchy
    const headerLevels = (content.match(/^(#{1,6})/gm) || []).map(h => h.length);
    if (headerLevels.length > 1) {
      const hasProperHierarchy = headerLevels.every((level, i) => 
        i === 0 || level <= headerLevels[i - 1] + 1
      );
      if (hasProperHierarchy) score += 10;
      else score -= 10;
    }
    
    // Reward lists for better structure
    if (analysis.listCount > 0) score += 5;
    if (analysis.listCount > 3) score += 5;
    
    // Penalize very long paragraphs
    const paragraphs = content.split(/\n\s*\n/);
    const longParagraphs = paragraphs.filter(p => p.split(/[.!?]+/).length > this.maxParagraphSentences);
    score -= longParagraphs.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate clarity score (sentence length, complexity, ambiguity)
   */
  private calculateClarityScore(content: string, analysis: ContentAnalysis): number {
    let score = 100;
    
    // Penalize long sentences
    if (analysis.averageSentenceLength > this.maxSentenceLength) {
      score -= (analysis.averageSentenceLength - this.maxSentenceLength) * 2;
    }
    
    // Reward ideal sentence length
    if (analysis.averageSentenceLength >= 10 && analysis.averageSentenceLength <= this.idealSentenceLength) {
      score += 10;
    }
    
    // Penalize ambiguous language
    const ambiguousWords = ['maybe', 'perhaps', 'might', 'could be', 'possibly', 'probably', 'seems', 'appears'];
    const ambiguousCount = ambiguousWords.reduce((count, word) => 
      count + (content.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length, 0
    );
    score -= ambiguousCount * 3;
    
    // Penalize passive voice
    const passivePatterns = [/\bis\s+\w+ed\b/g, /\bwas\s+\w+ed\b/g, /\bare\s+\w+ed\b/g, /\bwere\s+\w+ed\b/g];
    const passiveCount = passivePatterns.reduce((count, pattern) => 
      count + (content.match(pattern) || []).length, 0
    );
    score -= passiveCount * 2;
    
    // Reward active, direct language
    const activePatterns = [/\b(Arena Fund|we|our company)\s+(invests?|focuses?|provides?|creates?)\b/gi];
    const activeCount = activePatterns.reduce((count, pattern) => 
      count + (content.match(pattern) || []).length, 0
    );
    score += Math.min(activeCount * 3, 15);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate factuality score (specific claims, data points, verifiable statements)
   */
  private calculateFactualityScore(content: string, analysis: ContentAnalysis): number {
    let score = 50; // Start at middle score
    
    // Reward fact markers
    score += Math.min(analysis.factCount * 10, 30);
    
    // Reward data points
    score += Math.min(analysis.dataPointCount * 5, 20);
    
    // Reward specific dates
    const dateCount = (content.match(/\b(?:19|20)\d{2}\b/g) || []).length;
    score += Math.min(dateCount * 3, 15);
    
    // Reward specific numbers and metrics
    const metricCount = (content.match(/\b\d+(?:\.\d+)?%|\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:million|billion|thousand)\b/gi) || []).length;
    score += Math.min(metricCount * 4, 20);
    
    // Penalize vague claims
    const vagueWords = ['many', 'several', 'numerous', 'various', 'significant', 'substantial', 'considerable'];
    const vagueCount = vagueWords.reduce((count, word) => 
      count + (content.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length, 0
    );
    score -= vagueCount * 2;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate citation score (proper attribution, source quality)
   */
  private calculateCitationScore(content: string, analysis: ContentAnalysis): number {
    let score = 0;
    
    // Base score for having citations
    if (analysis.citationCount > 0) {
      score = 60;
      score += Math.min(analysis.citationCount * 8, 32);
    }
    
    // Reward citation-to-fact ratio
    if (analysis.factCount > 0 && analysis.citationCount > 0) {
      const ratio = analysis.citationCount / analysis.factCount;
      if (ratio >= 0.5) score += 8;
      if (ratio >= 1.0) score += 8;
    }
    
    // Check for proper citation format
    const properCitations = content.match(/\[REF:[^\]]+\]|\[CITATION\][^[]+\[\/CITATION\]/g) || [];
    if (properCitations.length > 0) {
      score += 10;
    }
    
    // Check for bibliography/sources section
    if (/(?:sources?|references?|bibliography|citations?)/i.test(content)) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate AI parsing score (structured markers, clear formatting)
   */
  private calculateAIParsingScore(content: string, analysis: ContentAnalysis): number {
    let score = 100;
    
    // Reward AI-friendly markers
    const aiMarkers = [
      /\*\*FACT:\*\*/g,
      /\*\*DATA:\*\*/g,
      /\[SECTION\]/g,
      /\[FACT\]/g,
      /\[LIST_ITEM\]/g
    ];
    
    const markerCount = aiMarkers.reduce((count, pattern) => 
      count + (content.match(pattern) || []).length, 0
    );
    
    if (markerCount > 0) score += 10;
    if (markerCount > 5) score += 10;
    
    // Reward consistent formatting
    const hasConsistentHeaders = /^#{1,6}\s+[A-Z\s]+$/gm.test(content);
    if (hasConsistentHeaders) score += 5;
    
    const hasConsistentLists = /^[-*+]\s+/gm.test(content);
    if (hasConsistentLists) score += 5;
    
    // Penalize inconsistent formatting
    const mixedListStyles = content.includes('- ') && content.includes('* ') && content.includes('+ ');
    if (mixedListStyles) score -= 10;
    
    // Reward structured data format
    if (/\*\*[A-Z]+:\*\*\s+[^*]+/g.test(content)) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate optimization suggestions
   */
  private generateSuggestions(
    content: string, 
    analysis: ContentAnalysis, 
    scores: Record<string, number>
  ): ReadabilitySuggestion[] {
    const suggestions: ReadabilitySuggestion[] = [];

    // Structure suggestions
    if (scores.structureScore < 70) {
      if (analysis.headerCount === 0) {
        suggestions.push({
          type: 'structure',
          priority: 'high',
          message: 'Add section headers to improve content organization',
          example: '# MAIN TOPIC\n## Subtopic\n### Details'
        });
      }
      
      if (analysis.listCount === 0 && analysis.wordCount > 200) {
        suggestions.push({
          type: 'structure',
          priority: 'medium',
          message: 'Consider using bullet points to break down complex information',
          example: '• Key point 1\n• Key point 2\n• Key point 3'
        });
      }
    }

    // Clarity suggestions
    if (scores.clarityScore < 70) {
      if (analysis.averageSentenceLength > this.maxSentenceLength) {
        suggestions.push({
          type: 'clarity',
          priority: 'high',
          message: `Average sentence length is ${Math.round(analysis.averageSentenceLength)} words. Consider breaking down complex sentences.`,
          example: 'Instead of: "Arena Fund, which was founded in 2020, invests in AI companies that focus on enterprise solutions."\nTry: "Arena Fund was founded in 2020. We invest in AI companies that focus on enterprise solutions."'
        });
      }
      
      const ambiguousWords = ['maybe', 'perhaps', 'might', 'could be', 'possibly'];
      const hasAmbiguous = ambiguousWords.some(word => 
        content.toLowerCase().includes(word)
      );
      
      if (hasAmbiguous) {
        suggestions.push({
          type: 'clarity',
          priority: 'medium',
          message: 'Replace ambiguous language with specific, factual statements',
          example: 'Instead of: "We might invest in AI companies"\nTry: "Arena Fund invests $X-Y in AI companies"'
        });
      }
    }

    // Factuality suggestions
    if (scores.factualityScore < 70) {
      if (analysis.factCount < 2) {
        suggestions.push({
          type: 'factuality',
          priority: 'high',
          message: 'Add more specific facts and data points to support claims',
          example: '**FACT:** Arena Fund has invested $50M across 25 AI companies since 2020.'
        });
      }
      
      if (analysis.dataPointCount < 3) {
        suggestions.push({
          type: 'factuality',
          priority: 'medium',
          message: 'Include more specific numbers, dates, and measurable data',
          example: 'Add specific metrics like "$2M average investment", "founded in 2020", "25% portfolio growth"'
        });
      }
    }

    // Citation suggestions
    if (scores.citationScore < 50) {
      suggestions.push({
        type: 'citation',
        priority: 'high',
        message: 'Add citations and sources to support factual claims',
        example: '**FACT:** Arena Fund focuses on enterprise AI [REF:cite-1]'
      });
    }

    // AI parsing suggestions
    if (scores.aiParsingScore < 70) {
      suggestions.push({
        type: 'parsing',
        priority: 'medium',
        message: 'Add AI-friendly markers to improve machine readability',
        example: 'Use markers like **FACT:**, **DATA:**, [SECTION], [/SECTION] for better AI parsing'
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate reading level based on sentence length and word complexity
   */
  private calculateReadingLevel(avgSentenceLength: number, words: string[]): ContentAnalysis['readingLevel'] {
    const complexWords = words.filter(word => word.length > 6).length;
    const complexityRatio = complexWords / words.length;
    
    if (avgSentenceLength < 12 && complexityRatio < 0.15) return 'elementary';
    if (avgSentenceLength < 16 && complexityRatio < 0.25) return 'middle';
    if (avgSentenceLength < 20 && complexityRatio < 0.35) return 'high';
    if (avgSentenceLength < 25 && complexityRatio < 0.45) return 'college';
    return 'graduate';
  }

  /**
   * Get optimization recommendations based on score
   */
  getOptimizationLevel(score: number): 'excellent' | 'good' | 'needs-improvement' | 'poor' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Generate detailed report
   */
  generateDetailedReport(content: string): string {
    const metrics = this.scoreContent(content);
    const analysis = this.analyzeContent(content);
    const level = this.getOptimizationLevel(metrics.overallScore);
    
    let report = `# AI READABILITY ANALYSIS REPORT\n\n`;
    report += `**Overall Score:** ${metrics.overallScore}/100 (${level.toUpperCase()})\n\n`;
    
    report += `## DETAILED SCORES\n\n`;
    report += `- **Structure:** ${metrics.structureScore}/100\n`;
    report += `- **Clarity:** ${metrics.clarityScore}/100\n`;
    report += `- **Factuality:** ${metrics.factualityScore}/100\n`;
    report += `- **Citations:** ${metrics.citationScore}/100\n`;
    report += `- **AI Parsing:** ${metrics.aiParsingScore}/100\n\n`;
    
    report += `## CONTENT ANALYSIS\n\n`;
    report += `- **Word Count:** ${analysis.wordCount}\n`;
    report += `- **Sentences:** ${analysis.sentenceCount}\n`;
    report += `- **Average Sentence Length:** ${Math.round(analysis.averageSentenceLength)} words\n`;
    report += `- **Headers:** ${analysis.headerCount}\n`;
    report += `- **Facts Identified:** ${analysis.factCount}\n`;
    report += `- **Citations:** ${analysis.citationCount}\n`;
    report += `- **Data Points:** ${analysis.dataPointCount}\n`;
    report += `- **Reading Level:** ${analysis.readingLevel}\n\n`;
    
    if (metrics.suggestions.length > 0) {
      report += `## OPTIMIZATION SUGGESTIONS\n\n`;
      metrics.suggestions.forEach((suggestion, index) => {
        report += `### ${index + 1}. ${suggestion.message} (${suggestion.priority.toUpperCase()} PRIORITY)\n\n`;
        if (suggestion.example) {
          report += `**Example:**\n\`\`\`\n${suggestion.example}\n\`\`\`\n\n`;
        }
      });
    }
    
    return report;
  }
}

// Export singleton instance
export const aiReadabilityScorer = new AIReadabilityScorer();