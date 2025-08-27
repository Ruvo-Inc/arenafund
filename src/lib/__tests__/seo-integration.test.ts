import { describe, it, expect } from 'vitest';
import { seoOptimizationEngine } from '../seo-optimization-engine';
import { seoPageOptimizer } from '../seo-page-optimizer';

describe('SEO Integration Tests', () => {
  const sampleContent = `
    <h1>AI Venture Capital: Enterprise Investment Focus</h1>
    <p>Arena Fund is a leading AI venture capital firm specializing in enterprise AI investment opportunities. We focus on B2B AI startup funding and help Fortune 500 companies adopt cutting-edge AI technologies.</p>
    <h2>Our Investment Approach</h2>
    <p>We invest in enterprise AI companies that demonstrate strong understanding of buyer psychology and can successfully scale from AI pilot projects to full production deployment.</p>
    <img src="/portfolio.jpg" alt="AI startup portfolio companies showcase" />
    <p>Learn more about our <a href="/thesis">investment thesis</a> and explore our <a href="/portfolio">portfolio companies</a>.</p>
    <h3>Key Investment Areas</h3>
    <ul>
      <li>Enterprise AI automation platforms</li>
      <li>B2B AI-powered analytics tools</li>
      <li>AI-driven business intelligence solutions</li>
    </ul>
  `;

  describe('SEO Optimization Engine', () => {
    it('should analyze content and generate comprehensive insights', () => {
      const analysis = seoOptimizationEngine.analyzeContent(sampleContent, '/test-page');
      
      // Basic analysis checks
      expect(analysis.wordCount).toBeGreaterThan(50);
      expect(analysis.readabilityScore).toBeGreaterThan(0);
      expect(analysis.headingStructure.length).toBeGreaterThan(0);
      expect(analysis.images.length).toBe(1);
      expect(analysis.internalLinks.length).toBe(2);
      
      // Meta tag suggestions
      expect(analysis.metaTagSuggestions.title).toBeTruthy();
      expect(analysis.metaTagSuggestions.description).toBeTruthy();
      expect(analysis.metaTagSuggestions.keywords.length).toBeGreaterThan(0);
    });

    it('should generate SEO score with actionable suggestions', () => {
      const analysis = seoOptimizationEngine.analyzeContent(sampleContent, '/test-page');
      const score = seoOptimizationEngine.generateSEOScore(analysis, '/test-page');
      
      expect(score.overall).toBeGreaterThan(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.breakdown.content).toBeGreaterThan(0);
      expect(score.breakdown.technical).toBeGreaterThan(0);
      expect(score.breakdown.keywords).toBeGreaterThan(0);
      expect(score.breakdown.structure).toBeGreaterThan(0);
      expect(Array.isArray(score.suggestions)).toBe(true);
    });

    it('should identify target keywords in content', () => {
      const analysis = seoOptimizationEngine.analyzeContent(sampleContent, '/test-page');
      
      // Should find AI venture capital related keywords
      const hasAIKeywords = Object.keys(analysis.keywordDensity).some(keyword => 
        keyword.toLowerCase().includes('ai') || 
        keyword.toLowerCase().includes('venture') ||
        keyword.toLowerCase().includes('enterprise')
      );
      
      expect(hasAIKeywords).toBe(true);
    });
  });

  describe('SEO Page Optimizer', () => {
    const pageData = {
      title: 'AI Venture Capital Investment',
      description: 'Leading AI venture capital firm focused on enterprise AI investment.',
      content: sampleContent,
      url: '/test-page',
      author: 'Arena Fund Team',
    };

    it('should generate optimized metadata', () => {
      const metadata = seoPageOptimizer.generateOptimizedMetadata(pageData);
      
      expect(metadata.title).toBeTruthy();
      expect(metadata.description).toBeTruthy();
      expect(metadata.keywords).toBeTruthy();
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.twitter).toBeDefined();
    });

    it('should generate structured data', () => {
      const structuredData = seoPageOptimizer.generateStructuredData(pageData);
      
      expect(structuredData['@context']).toBe('https://schema.org');
      expect(structuredData['@type']).toBeTruthy();
      expect(structuredData.headline).toBeTruthy();
      expect(structuredData.description).toBeTruthy();
    });

    it('should provide comprehensive page analysis', async () => {
      const analysis = await seoPageOptimizer.analyzePageSEO(pageData);
      
      expect(analysis.analysis).toBeDefined();
      expect(analysis.score).toBeDefined();
      expect(analysis.metadata).toBeDefined();
      expect(analysis.structuredData).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });
  });

  describe('Internal Linking Analysis', () => {
    const pages = [
      {
        url: '/about',
        title: 'About Arena Fund - AI Venture Capital',
        content: 'Arena Fund is an AI venture capital firm specializing in enterprise AI investment and B2B AI startup funding.'
      },
      {
        url: '/thesis',
        title: 'Investment Thesis - Enterprise AI Focus',
        content: 'Our investment thesis focuses on enterprise AI companies that can scale from pilot to production.'
      },
      {
        url: '/portfolio',
        title: 'Portfolio Companies - AI Startups',
        content: 'Our portfolio includes innovative AI startups transforming enterprise operations and Fortune 500 AI adoption.'
      }
    ];

    it('should analyze internal linking opportunities', () => {
      const strategy = seoOptimizationEngine.analyzeInternalLinking(pages);
      
      expect(strategy.suggestedLinks).toBeDefined();
      expect(strategy.orphanedPages).toBeDefined();
      expect(strategy.overLinkedPages).toBeDefined();
      expect(strategy.linkDistribution).toBeDefined();
      
      // Should suggest some links between related pages
      if (strategy.suggestedLinks.length > 0) {
        const suggestion = strategy.suggestedLinks[0];
        expect(suggestion.fromPage).toBeTruthy();
        expect(suggestion.toPage).toBeTruthy();
        expect(suggestion.anchorText).toBeTruthy();
        expect(suggestion.relevanceScore).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle empty content gracefully', () => {
      const analysis = seoOptimizationEngine.analyzeContent('', '/empty');
      
      expect(analysis.wordCount).toBe(0);
      expect(analysis.headingStructure).toHaveLength(0);
      expect(analysis.images).toHaveLength(0);
      expect(analysis.internalLinks).toHaveLength(0);
    });

    it('should handle plain text content', () => {
      const plainText = 'This is plain text about AI venture capital and enterprise AI investment opportunities.';
      const analysis = seoOptimizationEngine.analyzeContent(plainText, '/plain');
      
      expect(analysis.wordCount).toBeGreaterThan(0);
      expect(analysis.keywordDensity).toBeDefined();
    });

    it('should process large content efficiently', () => {
      const largeContent = sampleContent.repeat(50);
      const startTime = Date.now();
      
      const analysis = seoOptimizationEngine.analyzeContent(largeContent, '/large');
      const score = seoOptimizationEngine.generateSEOScore(analysis, '/large');
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(analysis.wordCount).toBeGreaterThan(1000);
      expect(score.overall).toBeGreaterThan(0);
    });
  });
});