/**
 * Citation Formatter
 * Utilities for creating citation-friendly content formatting
 */

export interface Citation {
  id: string;
  type: 'website' | 'article' | 'report' | 'press-release' | 'internal';
  title: string;
  author?: string;
  organization: string;
  url?: string;
  publishedDate?: Date;
  accessedDate: Date;
  pageNumbers?: string;
  doi?: string;
}

export interface CitationStyle {
  name: string;
  format: (citation: Citation) => string;
}

/**
 * Citation formatting styles
 */
export const citationStyles: Record<string, CitationStyle> = {
  apa: {
    name: 'APA Style',
    format: (citation: Citation) => {
      const author = citation.author || citation.organization;
      const year = citation.publishedDate ? citation.publishedDate.getFullYear() : 'n.d.';
      const title = citation.title;
      const url = citation.url ? ` Retrieved from ${citation.url}` : '';
      
      return `${author} (${year}). ${title}.${url}`;
    }
  },
  
  mla: {
    name: 'MLA Style',
    format: (citation: Citation) => {
      const author = citation.author || citation.organization;
      const title = `"${citation.title}"`;
      const org = citation.organization !== author ? citation.organization : '';
      const date = citation.publishedDate ? 
        citation.publishedDate.toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }) : '';
      const url = citation.url ? ` Web. ${citation.accessedDate.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      })}.` : '';
      
      return `${author}. ${title} ${org}, ${date}.${url}`;
    }
  },
  
  chicago: {
    name: 'Chicago Style',
    format: (citation: Citation) => {
      const author = citation.author || citation.organization;
      const title = `"${citation.title}"`;
      const org = citation.organization;
      const date = citation.publishedDate ? 
        citation.publishedDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        }) : '';
      const accessed = citation.url ? 
        ` Accessed ${citation.accessedDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}.` : '';
      const url = citation.url ? ` ${citation.url}.` : '';
      
      return `${author}. ${title} ${org}, ${date}.${url}${accessed}`;
    }
  },
  
  ai_optimized: {
    name: 'AI-Optimized Citation',
    format: (citation: Citation) => {
      // Format optimized for AI model consumption and verification
      const parts = [
        `TITLE: ${citation.title}`,
        `AUTHOR: ${citation.author || citation.organization}`,
        `ORGANIZATION: ${citation.organization}`,
        citation.publishedDate ? `PUBLISHED: ${citation.publishedDate.toISOString().split('T')[0]}` : null,
        `ACCESSED: ${citation.accessedDate.toISOString().split('T')[0]}`,
        citation.url ? `URL: ${citation.url}` : null,
        citation.doi ? `DOI: ${citation.doi}` : null
      ].filter(Boolean);
      
      return `[CITATION] ${parts.join(' | ')} [/CITATION]`;
    }
  }
};

/**
 * Citation Manager class
 */
export class CitationManager {
  private citations: Map<string, Citation> = new Map();
  private citationCounter = 1;

  /**
   * Add a citation and return its ID
   */
  addCitation(citation: Omit<Citation, 'id' | 'accessedDate'>): string {
    const id = `cite-${this.citationCounter++}`;
    const fullCitation: Citation = {
      ...citation,
      id,
      accessedDate: new Date()
    };
    
    this.citations.set(id, fullCitation);
    return id;
  }

  /**
   * Get citation by ID
   */
  getCitation(id: string): Citation | undefined {
    return this.citations.get(id);
  }

  /**
   * Format citation in specified style
   */
  formatCitation(id: string, style: keyof typeof citationStyles = 'ai_optimized'): string {
    const citation = this.citations.get(id);
    if (!citation) {
      return `[Citation not found: ${id}]`;
    }
    
    const formatter = citationStyles[style];
    return formatter.format(citation);
  }

  /**
   * Generate bibliography in specified style
   */
  generateBibliography(style: keyof typeof citationStyles = 'ai_optimized'): string {
    const formatter = citationStyles[style];
    const citations = Array.from(this.citations.values())
      .sort((a, b) => a.title.localeCompare(b.title));
    
    return citations.map(citation => formatter.format(citation)).join('\n\n');
  }

  /**
   * Add inline citation to content
   */
  addInlineCitation(content: string, citationId: string, style: keyof typeof citationStyles = 'ai_optimized'): string {
    const citation = this.citations.get(citationId);
    if (!citation) {
      return content;
    }
    
    let inlineCitation = '';
    
    switch (style) {
      case 'apa':
        const author = citation.author || citation.organization;
        const year = citation.publishedDate ? citation.publishedDate.getFullYear() : 'n.d.';
        inlineCitation = `(${author}, ${year})`;
        break;
      case 'mla':
        const mlaAuthor = citation.author || citation.organization;
        inlineCitation = `(${mlaAuthor})`;
        break;
      case 'chicago':
        inlineCitation = `^${this.citationCounter}`;
        break;
      case 'ai_optimized':
        inlineCitation = `[REF:${citationId}]`;
        break;
    }
    
    return `${content} ${inlineCitation}`;
  }

  /**
   * Extract and format citations from content
   */
  extractCitationsFromContent(content: string): { content: string; citations: Citation[] } {
    const urlPattern = /https?:\/\/[^\s)]+/g;
    const urls = content.match(urlPattern) || [];
    const extractedCitations: Citation[] = [];
    let processedContent = content;
    
    urls.forEach(url => {
      const citationId = this.addCitation({
        type: 'website',
        title: this.extractTitleFromUrl(url),
        organization: this.extractDomainFromUrl(url),
        url
      });
      
      const citation = this.citations.get(citationId)!;
      extractedCitations.push(citation);
      
      // Replace URL with citation reference
      processedContent = processedContent.replace(url, `[REF:${citationId}]`);
    });
    
    return {
      content: processedContent,
      citations: extractedCitations
    };
  }

  /**
   * Create fact-based content with citations
   */
  createFactWithCitation(fact: string, sources: string[]): string {
    const citationIds = sources.map(source => {
      return this.addCitation({
        type: 'website',
        title: this.extractTitleFromUrl(source),
        organization: this.extractDomainFromUrl(source),
        url: source
      });
    });
    
    const citationRefs = citationIds.map(id => `[REF:${id}]`).join(' ');
    return `**FACT:** ${fact} ${citationRefs}`;
  }

  /**
   * Generate AI-friendly citation block
   */
  generateAICitationBlock(): string {
    const citations = Array.from(this.citations.values());
    if (citations.length === 0) return '';
    
    let block = '\n\n---\n\n## SOURCES AND CITATIONS\n\n';
    block += '*The following sources were used in the preparation of this content:*\n\n';
    
    citations.forEach(citation => {
      block += `**${citation.id.toUpperCase()}:** ${citationStyles.ai_optimized.format(citation)}\n\n`;
    });
    
    block += '*All information is accurate as of the access date listed. Arena Fund maintains these sources for verification and transparency.*\n\n';
    
    return block;
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return `Content from ${domain}`;
    } catch {
      return 'Web Content';
    }
  }

  private extractDomainFromUrl(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Unknown Source';
    }
  }
}

/**
 * Content formatter for AI-friendly citations
 */
export class AIContentFormatter {
  private citationManager: CitationManager;

  constructor() {
    this.citationManager = new CitationManager();
  }

  /**
   * Format content with AI-optimized structure and citations
   */
  formatForAI(content: string, sources: string[] = []): string {
    // Extract existing citations from content
    const { content: processedContent, citations } = this.citationManager.extractCitationsFromContent(content);
    
    // Add additional sources
    sources.forEach(source => {
      this.citationManager.addCitation({
        type: 'website',
        title: this.extractTitleFromUrl(source),
        organization: this.extractDomainFromUrl(source),
        url: source
      });
    });

    // Add AI-friendly markers
    let aiContent = processedContent
      // Mark facts clearly
      .replace(/^(.+(?:Arena Fund|we|our).+(?:invest|focus|specialize).+)$/gm, '**FACT:** $1')
      // Structure data points
      .replace(/(\$[0-9,]+(?:\.[0-9]+)?(?:\s*(?:million|billion|M|B))?)/g, '**DATA:** $1')
      // Mark dates
      .replace(/\b((?:19|20)\d{2})\b/g, '**DATE:** $1')
      // Add section markers
      .replace(/^(#{1,3})\s*(.+)$/gm, '$1 [SECTION] $2 [/SECTION]');

    // Add citation block
    aiContent += this.citationManager.generateAICitationBlock();

    return aiContent;
  }

  /**
   * Create citation-ready fact statement
   */
  createCitedFact(statement: string, sources: string[]): string {
    return this.citationManager.createFactWithCitation(statement, sources);
  }

  /**
   * Get citation manager instance
   */
  getCitationManager(): CitationManager {
    return this.citationManager;
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return `Content from ${domain}`;
    } catch {
      return 'Web Content';
    }
  }

  private extractDomainFromUrl(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Unknown Source';
    }
  }
}

// Export singleton instances
export const citationManager = new CitationManager();
export const aiContentFormatter = new AIContentFormatter();