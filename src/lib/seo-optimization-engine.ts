/**
 * SEO Content Optimization Engine
 * Provides automated meta tag optimization, internal linking, keyword analysis, and content suggestions
 */

export interface ContentAnalysis {
  wordCount: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  headingStructure: HeadingAnalysis[];
  internalLinks: string[];
  externalLinks: string[];
  images: ImageAnalysis[];
  metaTagSuggestions: MetaTagSuggestions;
}

export interface HeadingAnalysis {
  level: number;
  text: string;
  keywords: string[];
}

export interface ImageAnalysis {
  src: string;
  alt: string;
  hasAlt: boolean;
  isOptimized: boolean;
}

export interface MetaTagSuggestions {
  title: string;
  description: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    type: string;
  };
}

export interface SEOScore {
  overall: number;
  breakdown: {
    content: number;
    technical: number;
    keywords: number;
    structure: number;
  };
  suggestions: OptimizationSuggestion[];
}

export interface OptimizationSuggestion {
  type: 'critical' | 'important' | 'minor';
  category: 'meta' | 'content' | 'structure' | 'links' | 'images';
  message: string;
  fix?: string;
}

export interface InternalLinkingStrategy {
  suggestedLinks: SuggestedLink[];
  orphanedPages: string[];
  overLinkedPages: string[];
  linkDistribution: Record<string, number>;
}

export interface SuggestedLink {
  fromPage: string;
  toPage: string;
  anchorText: string;
  relevanceScore: number;
  context: string;
}

export class SEOOptimizationEngine {
  private readonly TARGET_KEYWORDS = [
    'AI venture capital',
    'enterprise AI investment',
    'B2B AI startup funding',
    'AI venture capital fund',
    'enterprise AI companies funding',
    'Fortune 500 AI adoption',
    'enterprise AI buyer psychology',
    'AI pilot to production scaling'
  ];

  private readonly STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  /**
   * Analyze content and generate comprehensive SEO insights
   */
  analyzeContent(content: string, url: string): ContentAnalysis {
    const wordCount = this.getWordCount(content);
    const keywordDensity = this.calculateKeywordDensity(content);
    const headingStructure = this.analyzeHeadingStructure(content);
    const { internalLinks, externalLinks } = this.extractLinks(content);
    const images = this.analyzeImages(content);
    const metaTagSuggestions = this.generateMetaTagSuggestions(content, url);
    const readabilityScore = this.calculateReadabilityScore(content);

    return {
      wordCount,
      readabilityScore,
      keywordDensity,
      headingStructure,
      internalLinks,
      externalLinks,
      images,
      metaTagSuggestions
    };
  }

  /**
   * Generate SEO score with detailed breakdown and suggestions
   */
  generateSEOScore(analysis: ContentAnalysis, url: string): SEOScore {
    const contentScore = this.scoreContent(analysis);
    const technicalScore = this.scoreTechnical(analysis);
    const keywordScore = this.scoreKeywords(analysis);
    const structureScore = this.scoreStructure(analysis);

    const overall = Math.round((contentScore + technicalScore + keywordScore + structureScore) / 4);
    
    const suggestions = this.generateOptimizationSuggestions(analysis, {
      content: contentScore,
      technical: technicalScore,
      keywords: keywordScore,
      structure: structureScore
    });

    return {
      overall,
      breakdown: {
        content: contentScore,
        technical: technicalScore,
        keywords: keywordScore,
        structure: structureScore
      },
      suggestions
    };
  }

  /**
   * Generate automated meta tag suggestions based on content analysis
   */
  generateMetaTagSuggestions(content: string, url: string): MetaTagSuggestions {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() || '';
    const keyPhrases = this.extractKeyPhrases(content);
    
    // Extract title from first heading or generate from key phrases
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i) || content.match(/^#\s+(.+)$/m);
    const baseTitle = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';
    
    const title = this.optimizeTitle(baseTitle || keyPhrases.slice(0, 3).join(' '), url);
    const description = this.optimizeDescription(firstSentence, keyPhrases);
    const keywords = this.selectOptimalKeywords(keyPhrases);

    return {
      title,
      description,
      keywords,
      openGraph: {
        title: title.length > 60 ? title.substring(0, 57) + '...' : title,
        description: description.length > 160 ? description.substring(0, 157) + '...' : description,
        type: 'article'
      }
    };
  }

  /**
   * Analyze internal linking opportunities and generate strategy
   */
  analyzeInternalLinking(pages: Array<{ url: string; content: string; title: string }>): InternalLinkingStrategy {
    const suggestedLinks: SuggestedLink[] = [];
    const linkCounts: Record<string, number> = {};
    const orphanedPages: string[] = [];

    // Analyze each page for linking opportunities
    pages.forEach(fromPage => {
      const existingLinks = this.extractLinks(fromPage.content).internalLinks;
      linkCounts[fromPage.url] = existingLinks.length;

      pages.forEach(toPage => {
        if (fromPage.url === toPage.url) return;

        const relevanceScore = this.calculatePageRelevance(fromPage.content, toPage.content, toPage.title);
        
        if (relevanceScore > 0.3 && !existingLinks.includes(toPage.url)) {
          const anchorText = this.generateAnchorText(toPage.title, toPage.content);
          const context = this.findLinkingContext(fromPage.content, toPage.title);

          suggestedLinks.push({
            fromPage: fromPage.url,
            toPage: toPage.url,
            anchorText,
            relevanceScore,
            context
          });
        }
      });
    });

    // Identify orphaned and over-linked pages
    Object.entries(linkCounts).forEach(([url, count]) => {
      if (count === 0) orphanedPages.push(url);
    });

    const overLinkedPages = Object.entries(linkCounts)
      .filter(([, count]) => count > 10)
      .map(([url]) => url);

    return {
      suggestedLinks: suggestedLinks.sort((a, b) => b.relevanceScore - a.relevanceScore),
      orphanedPages,
      overLinkedPages,
      linkDistribution: linkCounts
    };
  }

  private getWordCount(content: string): number {
    const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.split(' ').filter(word => word.length > 0).length;
  }

  private calculateKeywordDensity(content: string): Record<string, number> {
    const text = content.replace(/<[^>]*>/g, '').toLowerCase();
    const words = text.split(/\s+/).filter(word => 
      word.length > 2 && !this.STOP_WORDS.has(word)
    );
    
    const totalWords = words.length;
    if (totalWords === 0) return {};
    
    const wordCounts: Record<string, number> = {};

    // Count individual words
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Count target keyword phrases
    this.TARGET_KEYWORDS.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase().replace(/\s+/g, '\\s+'), 'gi');
      const matches = text.match(regex) || [];
      if (matches.length > 0) {
        wordCounts[keyword] = matches.length;
      }
    });

    // Convert to density percentages
    const density: Record<string, number> = {};
    Object.entries(wordCounts).forEach(([word, count]) => {
      density[word] = Math.round((count / totalWords) * 10000) / 100;
    });

    return density;
  }

  private analyzeHeadingStructure(content: string): HeadingAnalysis[] {
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>|^(#{1,6})\s+(.+)$/gim;
    const headings: HeadingAnalysis[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1] ? parseInt(match[1]) : match[3].length;
      const text = (match[2] || match[4]).replace(/<[^>]*>/g, '').trim();
      const keywords = this.extractKeywordsFromText(text);

      headings.push({ level, text, keywords });
    }

    return headings;
  }

  private extractLinks(content: string): { internalLinks: string[]; externalLinks: string[] } {
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    const internalLinks: string[] = [];
    const externalLinks: string[] = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const url = match[1];
      if (url.startsWith('/') || url.includes(process.env.NEXT_PUBLIC_SITE_URL || 'arenafund.vc')) {
        internalLinks.push(url);
      } else if (url.startsWith('http')) {
        externalLinks.push(url);
      }
    }

    return { internalLinks, externalLinks };
  }

  private analyzeImages(content: string): ImageAnalysis[] {
    const imgRegex = /<img[^>]+>/gi;
    const images: ImageAnalysis[] = [];
    let match;

    while ((match = imgRegex.exec(content)) !== null) {
      const imgTag = match[0];
      const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
      
      const src = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : '';
      const hasAlt = !!altMatch;
      const isOptimized = hasAlt && alt.length > 0 && alt.length < 125;

      images.push({ src, alt, hasAlt, isOptimized });
    }

    return images;
  }

  private calculateReadabilityScore(content: string): number {
    const text = content.replace(/<[^>]*>/g, '');
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    // Flesch Reading Ease Score
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = word.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;
    
    if (word.endsWith('e')) count--;
    if (word.endsWith('le') && word.length > 2) count++;
    
    return Math.max(1, count);
  }

  private extractKeyPhrases(content: string): string[] {
    const text = content.replace(/<[^>]*>/g, '').toLowerCase();
    const phrases: string[] = [];
    
    // Extract 2-3 word phrases
    const words = text.split(/\s+/).filter(word => 
      word.length > 2 && !this.STOP_WORDS.has(word)
    );

    for (let i = 0; i < words.length - 1; i++) {
      const twoWordPhrase = `${words[i]} ${words[i + 1]}`;
      phrases.push(twoWordPhrase);
      
      if (i < words.length - 2) {
        const threeWordPhrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        phrases.push(threeWordPhrase);
      }
    }

    // Count phrase frequency and return top phrases
    const phraseCounts: Record<string, number> = {};
    phrases.forEach(phrase => {
      phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
    });

    return Object.entries(phraseCounts)
      .filter(([, count]) => count > 1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([phrase]) => phrase);
  }

  private optimizeTitle(baseTitle: string, url: string): string {
    const maxLength = 60;
    let title = baseTitle;

    // Add brand if not present
    if (!title.toLowerCase().includes('arena fund')) {
      if (title.length <= 45) {
        title = `${title} | Arena Fund`;
      } else {
        // Truncate first, then add brand
        const truncatedTitle = title.substring(0, 45);
        title = `${truncatedTitle}... | Arena Fund`;
      }
    }

    // Add relevant keywords if space allows
    const relevantKeywords = this.TARGET_KEYWORDS.filter(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase())
    );

    if (relevantKeywords.length === 0 && title.length < 40) {
      title = `${title} - AI Venture Capital`;
    }

    // Final truncate if still too long
    if (title.length > maxLength) {
      title = title.substring(0, maxLength - 3) + '...';
    }

    return title;
  }

  private optimizeDescription(firstSentence: string, keyPhrases: string[]): string {
    const maxLength = 160;
    let description = firstSentence.replace(/<[^>]*>/g, '').trim();

    // Ensure it includes key phrases
    const includedPhrases = keyPhrases.filter(phrase => 
      description.toLowerCase().includes(phrase.toLowerCase())
    );

    if (includedPhrases.length === 0 && keyPhrases.length > 0) {
      description = `${keyPhrases[0]} - ${description}`;
    }

    // Add call to action if space allows
    if (description.length < 120) {
      description += ' Learn more about our enterprise AI investment approach.';
    }

    // Truncate if too long
    if (description.length > maxLength) {
      description = description.substring(0, maxLength - 3) + '...';
    }

    return description;
  }

  private selectOptimalKeywords(keyPhrases: string[]): string[] {
    const keywords = [...this.TARGET_KEYWORDS];
    
    // Add top key phrases that aren't already covered
    keyPhrases.slice(0, 5).forEach(phrase => {
      if (!keywords.some(keyword => keyword.toLowerCase().includes(phrase.toLowerCase()))) {
        keywords.push(phrase);
      }
    });

    return keywords.slice(0, 10);
  }

  private scoreContent(analysis: ContentAnalysis): number {
    let score = 0;
    
    // Word count (ideal: 300-2000 words)
    if (analysis.wordCount >= 300 && analysis.wordCount <= 2000) {
      score += 25;
    } else if (analysis.wordCount >= 200) {
      score += 15;
    }

    // Readability (ideal: 60-70)
    if (analysis.readabilityScore >= 60 && analysis.readabilityScore <= 70) {
      score += 25;
    } else if (analysis.readabilityScore >= 50) {
      score += 15;
    }

    // Keyword usage
    const targetKeywordUsage = Object.entries(analysis.keywordDensity)
      .filter(([keyword]) => this.TARGET_KEYWORDS.includes(keyword))
      .length;
    
    if (targetKeywordUsage > 0) {
      score += Math.min(25, targetKeywordUsage * 5);
    }

    // Image optimization
    const optimizedImages = analysis.images.filter(img => img.isOptimized).length;
    const imageScore = analysis.images.length > 0 ? 
      (optimizedImages / analysis.images.length) * 25 : 25;
    score += imageScore;

    return Math.round(score);
  }

  private scoreTechnical(analysis: ContentAnalysis): number {
    let score = 0;

    // Meta tags
    if (analysis.metaTagSuggestions.title.length > 0 && analysis.metaTagSuggestions.title.length <= 60) {
      score += 25;
    }
    if (analysis.metaTagSuggestions.description.length > 0 && analysis.metaTagSuggestions.description.length <= 160) {
      score += 25;
    }

    // Images with alt text
    const imagesWithAlt = analysis.images.filter(img => img.hasAlt).length;
    if (analysis.images.length > 0) {
      score += (imagesWithAlt / analysis.images.length) * 25;
    } else {
      score += 25;
    }

    // Internal linking
    if (analysis.internalLinks.length >= 2 && analysis.internalLinks.length <= 10) {
      score += 25;
    } else if (analysis.internalLinks.length > 0) {
      score += 15;
    }

    return Math.round(score);
  }

  private scoreKeywords(analysis: ContentAnalysis): number {
    let score = 0;
    
    const keywordDensities = Object.entries(analysis.keywordDensity);
    const targetKeywords = keywordDensities.filter(([keyword]) => 
      this.TARGET_KEYWORDS.includes(keyword)
    );

    // Target keyword presence
    if (targetKeywords.length > 0) {
      score += 40;
    }

    // Keyword density (ideal: 1-3%)
    const optimalDensity = keywordDensities.filter(([, density]) => 
      density >= 1 && density <= 3
    ).length;
    
    score += Math.min(35, optimalDensity * 5);

    // Keyword variety
    if (keywordDensities.length >= 5) {
      score += 25;
    } else if (keywordDensities.length >= 3) {
      score += 15;
    }

    return Math.round(score);
  }

  private scoreStructure(analysis: ContentAnalysis): number {
    let score = 0;

    // Heading structure
    const headings = analysis.headingStructure;
    if (headings.some(h => h.level === 1)) score += 25;
    if (headings.some(h => h.level === 2)) score += 25;
    if (headings.length >= 3) score += 25;

    // Heading keyword usage
    const headingsWithKeywords = headings.filter(h => h.keywords.length > 0).length;
    if (headings.length > 0) {
      score += (headingsWithKeywords / headings.length) * 25;
    }

    return Math.round(score);
  }

  private generateOptimizationSuggestions(analysis: ContentAnalysis, scores: SEOScore['breakdown']): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Content suggestions
    if (analysis.wordCount < 300) {
      suggestions.push({
        type: 'important',
        category: 'content',
        message: `Content is too short (${analysis.wordCount} words). Aim for 300-2000 words for better SEO.`,
        fix: 'Add more detailed information, examples, or explanations to reach the optimal word count.'
      });
    }

    if (analysis.readabilityScore < 50) {
      suggestions.push({
        type: 'important',
        category: 'content',
        message: `Readability score is low (${analysis.readabilityScore}). Content may be too complex.`,
        fix: 'Use shorter sentences, simpler words, and break up long paragraphs.'
      });
    }

    // Meta tag suggestions
    if (analysis.metaTagSuggestions.title.length > 60) {
      suggestions.push({
        type: 'critical',
        category: 'meta',
        message: 'Title tag is too long and may be truncated in search results.',
        fix: `Shorten title to under 60 characters. Current: ${analysis.metaTagSuggestions.title.length} characters.`
      });
    }

    if (analysis.metaTagSuggestions.description.length > 160) {
      suggestions.push({
        type: 'important',
        category: 'meta',
        message: 'Meta description is too long and may be truncated.',
        fix: `Shorten description to under 160 characters. Current: ${analysis.metaTagSuggestions.description.length} characters.`
      });
    }

    // Image suggestions
    const imagesWithoutAlt = analysis.images.filter(img => !img.hasAlt);
    if (imagesWithoutAlt.length > 0) {
      suggestions.push({
        type: 'critical',
        category: 'images',
        message: `${imagesWithoutAlt.length} images are missing alt text.`,
        fix: 'Add descriptive alt text to all images for accessibility and SEO.'
      });
    }

    // Keyword suggestions
    const targetKeywordUsage = Object.entries(analysis.keywordDensity)
      .filter(([keyword]) => this.TARGET_KEYWORDS.includes(keyword));
    
    if (targetKeywordUsage.length === 0) {
      suggestions.push({
        type: 'important',
        category: 'content',
        message: 'No target keywords found in content.',
        fix: `Consider including relevant keywords: ${this.TARGET_KEYWORDS.slice(0, 3).join(', ')}`
      });
    }

    // Structure suggestions
    if (!analysis.headingStructure.some(h => h.level === 1)) {
      suggestions.push({
        type: 'critical',
        category: 'structure',
        message: 'Missing H1 heading.',
        fix: 'Add a single H1 heading that describes the main topic of the page.'
      });
    }

    // Internal linking suggestions
    if (analysis.internalLinks.length === 0) {
      suggestions.push({
        type: 'important',
        category: 'links',
        message: 'No internal links found.',
        fix: 'Add 2-5 relevant internal links to other pages on your site.'
      });
    }

    return suggestions.sort((a, b) => {
      const typeOrder = { critical: 0, important: 1, minor: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }

  private calculatePageRelevance(fromContent: string, toContent: string, toTitle: string): number {
    const fromWords = this.extractKeywordsFromText(fromContent);
    const toWords = this.extractKeywordsFromText(toContent + ' ' + toTitle);
    
    const commonWords = fromWords.filter(word => toWords.includes(word));
    const relevance = commonWords.length / Math.max(fromWords.length, toWords.length);
    
    return Math.min(1, relevance * 2); // Boost relevance score
  }

  private extractKeywordsFromText(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.STOP_WORDS.has(word))
      .slice(0, 20);
  }

  private generateAnchorText(title: string, content: string): string {
    const cleanTitle = title.replace(/<[^>]*>/g, '').trim();
    
    // Use title if it's concise
    if (cleanTitle.length <= 50) {
      return cleanTitle;
    }
    
    // Extract key phrase from title or content
    const keyPhrases = this.extractKeyPhrases(title + ' ' + content);
    return keyPhrases[0] || cleanTitle.substring(0, 47) + '...';
  }

  private findLinkingContext(content: string, targetTitle: string): string {
    const sentences = content.split(/[.!?]+/);
    const keywords = this.extractKeywordsFromText(targetTitle);
    
    // Find sentence with most keyword matches
    let bestMatch = '';
    let maxMatches = 0;
    
    sentences.forEach(sentence => {
      const sentenceWords = this.extractKeywordsFromText(sentence);
      const matches = keywords.filter(keyword => sentenceWords.includes(keyword)).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = sentence.trim();
      }
    });
    
    return bestMatch || sentences[0]?.trim() || '';
  }
}

export const seoOptimizationEngine = new SEOOptimizationEngine();