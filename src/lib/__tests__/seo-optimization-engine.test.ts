import { describe, it, expect } from 'vitest';
import { SEOOptimizationEngine } from '../seo-optimization-engine';

describe('SEOOptimizationEngine', () => {
  const engine = new SEOOptimizationEngine();

  const sampleContent = `
    <h1>AI Venture Capital: The Future of Enterprise Investment</h1>
    <p>Arena Fund is a leading AI venture capital firm focused on enterprise AI investment opportunities. We specialize in B2B AI startup funding and help Fortune 500 companies adopt AI technologies.</p>
    <h2>Our Investment Approach</h2>
    <p>We focus on enterprise AI companies that demonstrate strong buyer psychology understanding and can scale from AI pilot to production. Our portfolio includes innovative startups that are transforming how businesses operate.</p>
    <img src="/portfolio.jpg" alt="AI startup portfolio companies" />
    <p>Learn more about our <a href="/thesis">investment thesis</a> and <a href="/portfolio">portfolio companies</a>.</p>
    <h3>Key Investment Areas</h3>
    <ul>
      <li>Enterprise AI automation</li>
      <li>B2B AI platforms</li>
      <li>AI-powered business intelligence</li>
    </ul>
  `;

  describe('analyzeContent', () => {
    it('should analyze content comprehensively', () => {
      const analysis = engine.analyzeContent(sampleContent, '/test-page');

      expect(analysis.wordCount).toBeGreaterThan(0);
      expect(analysis.readabilityScore).toBeGreaterThan(0);
      expect(analysis.keywordDensity).toBeDefined();
      expect(analysis.headingStructure).toHaveLength(3);
      expect(analysis.internalLinks).toHaveLength(2);
      expect(analysis.images).toHaveLength(1);
      expect(analysis.metaTagSuggestions).toBeDefined();
    });

    it('should correctly identify heading structure', () => {
      const analysis = engine.analyzeContent(sampleContent, '/test-page');
      
      expect(analysis.headingStructure[0].level).toBe(1);
      expect(analysis.headingStructure[0].text).toContain('AI Venture Capital');
      expect(analysis.headingStructure[1].level).toBe(2);
      expect(analysis.headingStructure[2].level).toBe(3);
    });

    it('should calculate keyword density for target keywords', () => {
      const analysis = engine.analyzeContent(sampleContent, '/test-page');
      
      expect(analysis.keywordDensity['AI venture capital']).toBeGreaterThan(0);
      expect(analysis.keywordDensity['enterprise AI investment']).toBeGreaterThan(0);
    });

    it('should identify internal and external links', () => {
      const analysis = engine.analyzeContent(sampleContent, '/test-page');
      
      expect(analysis.internalLinks).toContain('/thesis');
      expect(analysis.internalLinks).toContain('/portfolio');
    });

    it('should analyze images for SEO optimization', () => {
      const analysis = engine.analyzeContent(sampleContent, '/test-page');
      
      expect(analysis.images[0].src).toBe('/portfolio.jpg');
      expect(analysis.images[0].hasAlt).toBe(true);
      expect(analysis.images[0].isOptimized).toBe(true);
    });
  });

  describe('generateSEOScore', () => {
    it('should generate comprehensive SEO score', () => {
      const analysis = engine.analyzeContent(sampleContent, '/test-page');
      const score = engine.generateSEOScore(analysis, '/test-page');

      expect(score.overall).toBeGreaterThan(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.breakdown.content).toBeGreaterThan(0);
      expect(score.breakdown.technical).toBeGreaterThan(0);
      expect(score.breakdown.keywords).toBeGreaterThan(0);
      expect(score.breakdown.structure).toBeGreaterThan(0);
      expect(Array.isArray(score.suggestions)).toBe(true);
    });

    it('should provide optimization suggestions', () => {
      const analysis = engine.analyzeContent(sampleContent, '/test-page');
      const score = engine.generateSEOScore(analysis, '/test-page');

      expect(score.suggestions.length).toBeGreaterThan(0);
      score.suggestions.forEach(suggestion => {
        expect(['critical', 'important', 'minor']).toContain(suggestion.type);
        expect(['meta', 'content', 'structure', 'links', 'images']).toContain(suggestion.category);
        expect(suggestion.message).toBeTruthy();
      });
    });
  });

  describe('generateMetaTagSuggestions', () => {
    it('should generate optimized meta tags', () => {
      const suggestions = engine.generateMetaTagSuggestions(sampleContent, '/test-page');

      expect(suggestions.title).toBeTruthy();
      expect(suggestions.title.length).toBeLessThanOrEqual(60);
      expect(suggestions.description).toBeTruthy();
      expect(suggestions.description.length).toBeLessThanOrEqual(160);
      expect(Array.isArray(suggestions.keywords)).toBe(true);
      expect(suggestions.openGraph.title).toBeTruthy();
      expect(suggestions.openGraph.description).toBeTruthy();
      expect(suggestions.openGraph.type).toBe('article');
    });

    it('should include brand name in title', () => {
      const suggestions = engine.generateMetaTagSuggestions(sampleContent, '/test-page');
      
      // Should contain "arena" even if truncated
      expect(suggestions.title.toLowerCase()).toContain('arena');
    });

    it('should include target keywords in suggestions', () => {
      const suggestions = engine.generateMetaTagSuggestions(sampleContent, '/test-page');
      
      const hasTargetKeywords = suggestions.keywords.some(keyword => 
        keyword.toLowerCase().includes('ai') || 
        keyword.toLowerCase().includes('venture') ||
        keyword.toLowerCase().includes('enterprise')
      );
      expect(hasTargetKeywords).toBe(true);
    });
  });

  describe('analyzeInternalLinking', () => {
    const pages = [
      {
        url: '/about',
        title: 'About Arena Fund - AI Venture Capital',
        content: 'Arena Fund is an AI venture capital firm specializing in enterprise AI investment.'
      },
      {
        url: '/thesis',
        title: 'Investment Thesis - Enterprise AI Focus',
        content: 'Our investment thesis focuses on B2B AI startup funding and enterprise AI companies.'
      },
      {
        url: '/portfolio',
        title: 'Portfolio Companies - AI Startups',
        content: 'Our portfolio includes innovative AI startups transforming enterprise operations.'
      }
    ];

    it('should analyze internal linking opportunities', () => {
      const strategy = engine.analyzeInternalLinking(pages);

      expect(Array.isArray(strategy.suggestedLinks)).toBe(true);
      expect(Array.isArray(strategy.orphanedPages)).toBe(true);
      expect(Array.isArray(strategy.overLinkedPages)).toBe(true);
      expect(typeof strategy.linkDistribution).toBe('object');
    });

    it('should suggest relevant internal links', () => {
      const strategy = engine.analyzeInternalLinking(pages);

      if (strategy.suggestedLinks.length > 0) {
        const suggestion = strategy.suggestedLinks[0];
        expect(suggestion.fromPage).toBeTruthy();
        expect(suggestion.toPage).toBeTruthy();
        expect(suggestion.anchorText).toBeTruthy();
        expect(suggestion.relevanceScore).toBeGreaterThan(0);
        expect(suggestion.relevanceScore).toBeLessThanOrEqual(1);
        expect(suggestion.context).toBeTruthy();
      }
    });

    it('should identify orphaned pages', () => {
      const pagesWithOrphan = [
        ...pages,
        {
          url: '/orphan',
          title: 'Orphaned Page',
          content: 'This page has no internal links pointing to it.'
        }
      ];

      const strategy = engine.analyzeInternalLinking(pagesWithOrphan);
      expect(strategy.orphanedPages).toContain('/orphan');
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const analysis = engine.analyzeContent('', '/empty');
      
      expect(analysis.wordCount).toBe(0);
      expect(analysis.headingStructure).toHaveLength(0);
      expect(analysis.internalLinks).toHaveLength(0);
      expect(analysis.images).toHaveLength(0);
    });

    it('should handle content without HTML tags', () => {
      const plainText = 'This is plain text content about AI venture capital and enterprise AI investment.';
      const analysis = engine.analyzeContent(plainText, '/plain');
      
      expect(analysis.wordCount).toBeGreaterThan(0);
      expect(analysis.keywordDensity).toBeDefined();
    });

    it('should handle malformed HTML', () => {
      const malformedHTML = '<h1>Title<p>Content without closing h1 tag</p>';
      const analysis = engine.analyzeContent(malformedHTML, '/malformed');
      
      expect(analysis.wordCount).toBeGreaterThan(0);
      expect(analysis.headingStructure.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle very long content', () => {
      const longContent = 'AI venture capital '.repeat(1000);
      const analysis = engine.analyzeContent(longContent, '/long');
      
      expect(analysis.wordCount).toBe(3000);
      expect(analysis.keywordDensity['AI venture capital']).toBeGreaterThan(0);
    });

    it('should handle content with no target keywords', () => {
      const irrelevantContent = '<h1>Cooking Recipes</h1><p>This is about cooking, not AI or venture capital.</p>';
      const analysis = engine.analyzeContent(irrelevantContent, '/cooking');
      const score = engine.generateSEOScore(analysis, '/cooking');
      
      expect(score.breakdown.keywords).toBeLessThan(50);
      expect(score.suggestions.some(s => s.category === 'content')).toBe(true);
    });
  });

  describe('performance', () => {
    it('should analyze large content efficiently', () => {
      const largeContent = sampleContent.repeat(100);
      const startTime = Date.now();
      
      const analysis = engine.analyzeContent(largeContent, '/large');
      const score = engine.generateSEOScore(analysis, '/large');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(analysis.wordCount).toBeGreaterThan(1000);
      expect(score.overall).toBeGreaterThan(0);
    });
  });
});