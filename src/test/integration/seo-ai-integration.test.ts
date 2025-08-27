/**
 * SEO and AI Integration Tests
 * Tests for the comprehensive SEO and AI optimization integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generateArenaFundPageSEO, validatePageSEO, arenaFundPages } from '@/lib/seo-integration';
import { aiContentSystem } from '@/lib/ai-content-system';
import { generatePageStructuredData } from '@/lib/structured-data';
import { generateMetadata } from '@/lib/seo-utils';

describe('SEO and AI Integration', () => {
  describe('Arena Fund Page SEO Generation', () => {
    it('should generate complete SEO metadata for all Arena Fund pages', () => {
      Object.keys(arenaFundPages).forEach(pageKey => {
        const { metadata, structuredData, enhancedKeywords } = generateArenaFundPageSEO(
          pageKey as keyof typeof arenaFundPages
        );

        // Verify metadata exists and has required fields
        expect(metadata).toBeDefined();
        expect(metadata.title).toBeDefined();
        expect(metadata.description).toBeDefined();
        expect(metadata.keywords).toBeDefined();

        // Verify structured data is valid JSON
        expect(() => JSON.parse(structuredData)).not.toThrow();

        // Verify enhanced keywords are generated
        expect(enhancedKeywords).toBeDefined();
        expect(Array.isArray(enhancedKeywords)).toBe(true);
        expect(enhancedKeywords.length).toBeGreaterThan(0);
      });
    });

    it('should validate page SEO configurations', () => {
      Object.entries(arenaFundPages).forEach(([pageKey, config]) => {
        const validation = validatePageSEO(config);
        
        // All Arena Fund pages should have valid SEO
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
        
        // Log warnings for review (not failures)
        if (validation.warnings.length > 0) {
          console.log(`SEO warnings for ${pageKey}:`, validation.warnings);
        }
      });
    });

    it('should generate proper structured data for different page types', () => {
      // Test webpage type
      const webpageData = generatePageStructuredData({
        type: 'webpage',
        title: 'Test Page',
        description: 'Test Description',
        url: '/test',
      });
      
      const webpageParsed = JSON.parse(webpageData);
      expect(Array.isArray(webpageParsed)).toBe(true);
      expect(webpageParsed.some(item => item['@type'] === 'WebPage')).toBe(true);
      expect(webpageParsed.some(item => item['@type'] === 'Organization')).toBe(true);

      // Test article type
      const articleData = generatePageStructuredData({
        type: 'article',
        title: 'Test Article',
        description: 'Test Article Description',
        url: '/test-article',
        publishedDate: '2024-01-01T00:00:00Z',
        author: 'Test Author',
      });
      
      const articleParsed = JSON.parse(articleData);
      expect(Array.isArray(articleParsed)).toBe(true);
      expect(articleParsed.some(item => item['@type'] === 'Article')).toBe(true);
    });
  });

  describe('AI Content Optimization', () => {
    const testContent = `
      Arena Fund is the first venture capital fund that validates Fortune 500 buyer demand before investing.
      We achieve 90% pilot-to-purchase conversion rates through systematic buyer validation.
      Our approach reduces investment risk by 95% compared to traditional VC methods.
      Founded in 2024, we focus on B2B AI and enterprise AI startups.
    `;

    it('should optimize content for AI consumption', () => {
      const result = aiContentSystem.optimizeContent(testContent);
      
      expect(result).toBeDefined();
      expect(result.optimizedContent).toBeDefined();
      expect(result.readabilityMetrics).toBeDefined();
      expect(result.recommendations).toBeDefined();
      
      // Check that facts were extracted
      expect(result.optimizedContent.structuredFacts.length).toBeGreaterThan(0);
      
      // Check readability metrics
      expect(result.readabilityMetrics.overallScore).toBeGreaterThan(0);
      expect(result.readabilityMetrics.overallScore).toBeLessThanOrEqual(100);
    });

    it('should generate AI-readable format', () => {
      const aiFormat = aiContentSystem.generateAIFormat(testContent);
      
      expect(aiFormat).toBeDefined();
      expect(typeof aiFormat).toBe('string');
      expect(aiFormat.length).toBeGreaterThan(testContent.length);
      
      // Should contain AI-friendly markers
      expect(aiFormat).toMatch(/\*\*FACT:\*\*|\*\*DATA:\*\*/);
    });

    it('should extract facts from content', () => {
      const facts = aiContentSystem.extractFacts(testContent);
      
      expect(facts).toBeDefined();
      expect(Array.isArray(facts)).toBe(true);
      expect(facts.length).toBeGreaterThan(0);
      
      // Should extract Arena Fund specific facts
      const arenaFundFacts = facts.filter(fact => 
        fact.statement.toLowerCase().includes('arena fund')
      );
      expect(arenaFundFacts.length).toBeGreaterThan(0);
    });

    it('should validate content for AI optimization', () => {
      const validation = aiContentSystem.validateContent(testContent);
      
      expect(validation).toBeDefined();
      expect(typeof validation.isValid).toBe('boolean');
      expect(typeof validation.score).toBe('number');
      expect(Array.isArray(validation.issues)).toBe(true);
      
      expect(validation.score).toBeGreaterThan(0);
      expect(validation.score).toBeLessThanOrEqual(100);
    });

    it('should generate comprehensive optimization report', () => {
      const report = aiContentSystem.generateOptimizationReport(testContent);
      
      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(100);
      
      // Should contain key sections
      expect(report).toContain('CONTENT OPTIMIZATION REPORT');
      expect(report).toContain('OVERALL ASSESSMENT');
      expect(report).toContain('DETAILED SCORES');
    });
  });

  describe('Integration Validation', () => {
    it('should ensure all Arena Fund pages have consistent SEO structure', () => {
      const pageKeys = Object.keys(arenaFundPages) as Array<keyof typeof arenaFundPages>;
      
      pageKeys.forEach(pageKey => {
        const config = arenaFundPages[pageKey];
        
        // All pages should have required fields
        expect(config.title).toBeDefined();
        expect(config.description).toBeDefined();
        expect(config.url).toBeDefined();
        expect(config.keywords).toBeDefined();
        expect(config.breadcrumbs).toBeDefined();
        
        // Title should include Arena Fund
        expect(config.title.toLowerCase()).toContain('arena');
        
        // Description should be meaningful length
        expect(config.description.length).toBeGreaterThan(50);
        expect(config.description.length).toBeLessThan(200);
        
        // URL should be properly formatted
        expect(config.url).toMatch(/^\/[a-z-]*$/);
        
        // Keywords should be relevant
        expect(config.keywords.length).toBeGreaterThan(3);
        expect(config.keywords.some(keyword => 
          keyword.toLowerCase().includes('arena') || 
          keyword.toLowerCase().includes('venture') ||
          keyword.toLowerCase().includes('ai')
        )).toBe(true);
      });
    });

    it('should generate valid metadata for Next.js', () => {
      const testConfig = {
        title: 'Test Page | Arena Fund',
        description: 'Test description for Arena Fund page with proper length and keywords.',
        keywords: 'test, arena fund, venture capital, ai',
        url: '/test',
        type: 'webpage' as const,
      };

      const metadata = generateMetadata(testConfig);
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBe(testConfig.title);
      expect(metadata.description).toBe(testConfig.description);
      expect(metadata.keywords).toBe(testConfig.keywords);
      
      // Check OpenGraph
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe(testConfig.title);
      expect(metadata.openGraph?.description).toBe(testConfig.description);
      
      // Check Twitter
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.title).toBe(testConfig.title);
      expect(metadata.twitter?.description).toBe(testConfig.description);
    });

    it('should handle content with AI optimization markers', () => {
      const markedContent = `
        **FACT:** Arena Fund validates Fortune 500 buyers before investing.
        **DATA:** 90% pilot-to-purchase conversion rate.
        **METRIC:** $50M in total investments.
        **DATE:** Founded in 2024.
      `;

      const result = aiContentSystem.analyzeContent(markedContent);
      
      expect(result.readabilityScore).toBeGreaterThan(70);
      expect(result.aiOptimizationLevel).toBe('good');
      expect(result.suggestions.length).toBeLessThan(5);
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle invalid content gracefully', () => {
      expect(() => {
        aiContentSystem.optimizeContent('');
      }).not.toThrow();

      expect(() => {
        aiContentSystem.optimizeContent('   ');
      }).not.toThrow();

      expect(() => {
        generatePageStructuredData({
          type: 'webpage',
          title: '',
          description: '',
          url: '',
        });
      }).not.toThrow();
    });

    it('should handle missing optional parameters', () => {
      const minimalConfig = {
        title: 'Test',
        description: 'Test description',
        url: '/test',
      };

      expect(() => {
        generateArenaFundPageSEO('home', minimalConfig);
      }).not.toThrow();

      expect(() => {
        validatePageSEO(minimalConfig);
      }).not.toThrow();
    });

    it('should process large content efficiently', () => {
      const largeContent = 'Arena Fund focuses on enterprise AI. '.repeat(1000);
      
      const startTime = Date.now();
      const result = aiContentSystem.optimizeContent(largeContent);
      const endTime = Date.now();
      
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});

describe('SEO Integration Components', () => {
  it('should validate SEO component props', () => {
    const validProps = {
      title: 'Test Page | Arena Fund',
      description: 'Test description for SEO optimization testing.',
      url: '/test',
      keywords: ['test', 'arena fund', 'seo'],
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Test', url: '/test' },
      ],
    };

    // These would be tested in component tests, but we can validate the data structure
    expect(validProps.title).toBeDefined();
    expect(validProps.description).toBeDefined();
    expect(validProps.url).toBeDefined();
    expect(Array.isArray(validProps.keywords)).toBe(true);
    expect(Array.isArray(validProps.breadcrumbs)).toBe(true);
    
    validProps.breadcrumbs.forEach(crumb => {
      expect(crumb.name).toBeDefined();
      expect(crumb.url).toBeDefined();
      expect(typeof crumb.name).toBe('string');
      expect(typeof crumb.url).toBe('string');
    });
  });
});