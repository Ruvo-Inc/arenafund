/**
 * AI Content System
 * Main integration point for AI-optimized content structure system
 */

import { aiContentOptimizer, AIOptimizedContent, ContentTemplate } from './ai-content-optimizer';
import { contentTemplates, generateContentFromTemplate } from './ai-content-templates';
import { aiContentFormatter, CitationManager } from './citation-formatter';
import { aiReadabilityScorer, ReadabilityMetrics } from './ai-readability-scorer';

export interface ContentOptimizationResult {
  optimizedContent: AIOptimizedContent;
  readabilityMetrics: ReadabilityMetrics;
  formattedContent: string;
  citationManager: CitationManager;
  recommendations: string[];
}

export interface ContentCreationOptions {
  templateId?: keyof typeof contentTemplates;
  templateData?: Record<string, string>;
  sources?: string[];
  optimizeForAI?: boolean;
  includeCitations?: boolean;
}

/**
 * Main AI Content System class
 */
export class AIContentSystem {
  private contentOptimizer = aiContentOptimizer;
  private readabilityScorer = aiReadabilityScorer;
  private contentFormatter = aiContentFormatter;

  /**
   * Create optimized content from template
   */
  createContentFromTemplate(
    templateId: keyof typeof contentTemplates,
    data: Record<string, string>,
    options: ContentCreationOptions = {}
  ): string {
    const content = generateContentFromTemplate(templateId, data);
    
    if (options.optimizeForAI) {
      return this.contentFormatter.formatForAI(content, options.sources || []);
    }
    
    return content;
  }

  /**
   * Optimize existing content for AI consumption
   */
  optimizeContent(
    content: string,
    sources: string[] = []
  ): ContentOptimizationResult {
    // Step 1: Optimize content for AI
    const optimizedContent = this.contentOptimizer.optimizeForAI(content, sources);
    
    // Step 2: Score readability
    const readabilityMetrics = this.readabilityScorer.scoreContent(optimizedContent.aiReadableFormat);
    
    // Step 3: Format with citations
    const formattedContent = this.contentFormatter.formatForAI(content, sources);
    
    // Step 4: Get citation manager
    const citationManager = this.contentFormatter.getCitationManager();
    
    // Step 5: Generate recommendations
    const recommendations = this.generateRecommendations(optimizedContent, readabilityMetrics);
    
    return {
      optimizedContent,
      readabilityMetrics,
      formattedContent,
      citationManager,
      recommendations
    };
  }

  /**
   * Analyze content and provide optimization suggestions
   */
  analyzeContent(content: string): {
    readabilityScore: number;
    suggestions: string[];
    aiOptimizationLevel: string;
    detailedReport: string;
  } {
    const metrics = this.readabilityScorer.scoreContent(content);
    const optimizationLevel = this.readabilityScorer.getOptimizationLevel(metrics.overallScore);
    const detailedReport = this.readabilityScorer.generateDetailedReport(content);
    
    const suggestions = metrics.suggestions.map(s => s.message);
    
    return {
      readabilityScore: metrics.overallScore,
      suggestions,
      aiOptimizationLevel: optimizationLevel,
      detailedReport
    };
  }

  /**
   * Get available content templates
   */
  getAvailableTemplates(): Array<{
    id: string;
    name: string;
    description: string;
  }> {
    return Object.entries(contentTemplates).map(([id, template]) => ({
      id,
      name: template.name,
      description: template.description
    }));
  }

  /**
   * Get template structure for a specific template
   */
  getTemplateStructure(templateId: keyof typeof contentTemplates): ContentTemplate | null {
    return contentTemplates[templateId] || null;
  }

  /**
   * Create fact-based content with citations
   */
  createFactWithCitations(fact: string, sources: string[]): string {
    return this.contentFormatter.createCitedFact(fact, sources);
  }

  /**
   * Extract facts from content
   */
  extractFacts(content: string) {
    return this.contentOptimizer.extractFacts(content);
  }

  /**
   * Generate AI-readable format
   */
  generateAIFormat(content: string): string {
    return this.contentOptimizer.generateAIReadableFormat(content);
  }

  /**
   * Validate content for AI optimization
   */
  validateContent(content: string): {
    isValid: boolean;
    issues: string[];
    score: number;
  } {
    const metrics = this.readabilityScorer.scoreContent(content);
    const issues: string[] = [];
    
    // Check for critical issues
    if (metrics.structureScore < 50) {
      issues.push('Poor content structure - add headers and organize sections');
    }
    
    if (metrics.factualityScore < 40) {
      issues.push('Insufficient factual content - add specific data and facts');
    }
    
    if (metrics.citationScore < 30) {
      issues.push('Missing citations - add sources for factual claims');
    }
    
    if (metrics.clarityScore < 50) {
      issues.push('Poor clarity - simplify sentences and remove ambiguous language');
    }
    
    const isValid = issues.length === 0 && metrics.overallScore >= 70;
    
    return {
      isValid,
      issues,
      score: metrics.overallScore
    };
  }

  /**
   * Generate comprehensive optimization report
   */
  generateOptimizationReport(content: string, sources: string[] = []): string {
    const result = this.optimizeContent(content, sources);
    
    let report = `# CONTENT OPTIMIZATION REPORT\n\n`;
    
    // Overall assessment
    report += `## OVERALL ASSESSMENT\n\n`;
    report += `**Readability Score:** ${result.readabilityMetrics.overallScore}/100\n`;
    report += `**Optimization Level:** ${this.readabilityScorer.getOptimizationLevel(result.readabilityMetrics.overallScore)}\n\n`;
    
    // Detailed scores
    report += `## DETAILED SCORES\n\n`;
    report += `- Structure: ${result.readabilityMetrics.structureScore}/100\n`;
    report += `- Clarity: ${result.readabilityMetrics.clarityScore}/100\n`;
    report += `- Factuality: ${result.readabilityMetrics.factualityScore}/100\n`;
    report += `- Citations: ${result.readabilityMetrics.citationScore}/100\n`;
    report += `- AI Parsing: ${result.readabilityMetrics.aiParsingScore}/100\n\n`;
    
    // Extracted facts
    if (result.optimizedContent.structuredFacts.length > 0) {
      report += `## EXTRACTED FACTS\n\n`;
      result.optimizedContent.structuredFacts.forEach((fact, index) => {
        report += `${index + 1}. **${fact.category.toUpperCase()}:** ${fact.statement} (Confidence: ${Math.round(fact.confidence * 100)}%)\n`;
      });
      report += `\n`;
    }
    
    // Recommendations
    if (result.recommendations.length > 0) {
      report += `## RECOMMENDATIONS\n\n`;
      result.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
      report += `\n`;
    }
    
    // AI-optimized content preview
    report += `## AI-OPTIMIZED CONTENT PREVIEW\n\n`;
    report += `\`\`\`\n${result.optimizedContent.aiReadableFormat.substring(0, 500)}...\n\`\`\`\n\n`;
    
    return report;
  }

  /**
   * Generate recommendations based on optimization results
   */
  private generateRecommendations(
    optimizedContent: AIOptimizedContent,
    readabilityMetrics: ReadabilityMetrics
  ): string[] {
    const recommendations: string[] = [];
    
    // Add readability suggestions
    readabilityMetrics.suggestions.forEach(suggestion => {
      recommendations.push(`${suggestion.type.toUpperCase()}: ${suggestion.message}`);
    });
    
    // Add content-specific recommendations
    if (optimizedContent.structuredFacts.length < 3) {
      recommendations.push('CONTENT: Add more specific facts and data points for better AI understanding');
    }
    
    if (optimizedContent.citationData.length === 0) {
      recommendations.push('CITATIONS: Include source citations to improve credibility and AI reference capability');
    }
    
    if (optimizedContent.readabilityScore < 70) {
      recommendations.push('READABILITY: Improve content structure and clarity for better AI parsing');
    }
    
    // Add optimization suggestions from the content
    optimizedContent.optimizationSuggestions.forEach(suggestion => {
      recommendations.push(`OPTIMIZATION: ${suggestion}`);
    });
    
    return recommendations;
  }
}

// Export singleton instance
export const aiContentSystem = new AIContentSystem();

// Export all types and utilities
export * from './ai-content-optimizer';
export * from './ai-content-templates';
export * from './citation-formatter';
export * from './ai-readability-scorer';