/**
 * Tests for Local SEO Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  GeographicTarget,
  IndustryVertical,
  DEFAULT_GEOGRAPHIC_TARGETS,
  AI_INDUSTRY_VERTICALS,
  generateLocalBusinessSchema,
  generateIndustrySpecificSchema,
  generateLocationKeywords,
  generateIndustryKeywords,
  optimizeContentForLocation,
  optimizeContentForIndustry,
  generateLocalIndustrySEOData
} from '../local-seo-utils';

describe('Local SEO Utils', () => {
  const testLocation: GeographicTarget = {
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    region: 'Bay Area',
    coordinates: { latitude: 37.7749, longitude: -122.4194 }
  };

  const testVertical: IndustryVertical = {
    name: 'Enterprise AI Software',
    keywords: ['enterprise AI', 'business AI', 'corporate AI'],
    description: 'AI software for enterprises',
    useCases: ['Automation', 'Analytics'],
    challenges: ['Integration', 'Scalability']
  };

  describe('generateLocalBusinessSchema', () => {
    it('should generate valid local business schema', () => {
      const schema = generateLocalBusinessSchema(testLocation);
      const parsed = JSON.parse(schema);

      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('FinancialService');
      expect(parsed.name).toBe('Arena Fund');
      expect(parsed.address.addressLocality).toBe('San Francisco');
      expect(parsed.address.addressRegion).toBe('California');
      expect(parsed.geo.latitude).toBe(37.7749);
      expect(parsed.geo.longitude).toBe(-122.4194);
    });

    it('should generate schema without coordinates when not provided', () => {
      const locationWithoutCoords = { ...testLocation };
      delete locationWithoutCoords.coordinates;
      
      const schema = generateLocalBusinessSchema(locationWithoutCoords);
      const parsed = JSON.parse(schema);

      expect(parsed.geo).toBeUndefined();
      expect(parsed.address.addressLocality).toBe('San Francisco');
    });

    it('should use default location when none provided', () => {
      const schema = generateLocalBusinessSchema();
      const parsed = JSON.parse(schema);

      expect(parsed.address.addressLocality).toBe(DEFAULT_GEOGRAPHIC_TARGETS[0].city);
    });
  });

  describe('generateIndustrySpecificSchema', () => {
    it('should generate valid industry-specific schema', () => {
      const schema = generateIndustrySpecificSchema(testVertical);
      const parsed = JSON.parse(schema);

      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('FinancialService');
      expect(parsed.name).toContain('Enterprise AI Software');
      expect(parsed.serviceType).toContain('Venture Capital');
      expect(parsed.serviceType).toContain('Enterprise AI Software');
      expect(parsed.knowsAbout).toEqual(testVertical.keywords);
      expect(parsed.expertise).toEqual(testVertical.useCases);
    });

    it('should include offer catalog with investment services', () => {
      const schema = generateIndustrySpecificSchema(testVertical);
      const parsed = JSON.parse(schema);

      expect(parsed.hasOfferCatalog).toBeDefined();
      expect(parsed.hasOfferCatalog.itemListElement).toHaveLength(3);
      expect(parsed.hasOfferCatalog.itemListElement[0].itemOffered.name).toBe('Seed Funding');
      expect(parsed.hasOfferCatalog.itemListElement[1].itemOffered.name).toBe('Series A Funding');
      expect(parsed.hasOfferCatalog.itemListElement[2].itemOffered.name).toBe('Buyer Validation');
    });
  });

  describe('generateLocationKeywords', () => {
    it('should generate location-specific keywords', () => {
      const baseKeywords = ['venture capital', 'AI investment'];
      const keywords = generateLocationKeywords(baseKeywords, [testLocation]);

      expect(keywords).toContain('venture capital San Francisco');
      expect(keywords).toContain('venture capital in San Francisco');
      expect(keywords).toContain('San Francisco venture capital');
      expect(keywords).toContain('AI investment California');
      expect(keywords).toContain('AI investment in California');
      expect(keywords).toContain('venture capital Bay Area');
    });

    it('should handle multiple locations', () => {
      const baseKeywords = ['startup funding'];
      const locations = [testLocation, DEFAULT_GEOGRAPHIC_TARGETS[1]];
      const keywords = generateLocationKeywords(baseKeywords, locations);

      expect(keywords.length).toBeGreaterThan(6); // Should have keywords for both locations
      expect(keywords).toContain('startup funding San Francisco');
      expect(keywords).toContain(`startup funding ${DEFAULT_GEOGRAPHIC_TARGETS[1].city}`);
    });

    it('should remove duplicates', () => {
      const baseKeywords = ['funding', 'funding']; // Duplicate base keywords
      const keywords = generateLocationKeywords(baseKeywords, [testLocation]);
      const uniqueKeywords = [...new Set(keywords)];

      expect(keywords.length).toBe(uniqueKeywords.length);
    });
  });

  describe('generateIndustryKeywords', () => {
    it('should generate industry-specific keywords', () => {
      const keywords = generateIndustryKeywords([testVertical]);

      expect(keywords).toContain('enterprise AI');
      expect(keywords).toContain('business AI');
      expect(keywords).toContain('automation AI');
      expect(keywords).toContain('AI for automation');
      expect(keywords).toContain('automation automation');
    });

    it('should handle multiple verticals', () => {
      const keywords = generateIndustryKeywords(AI_INDUSTRY_VERTICALS);

      expect(keywords.length).toBeGreaterThan(20);
      expect(keywords).toContain('enterprise AI software');
      expect(keywords).toContain('AI analytics platform');
    });

    it('should remove duplicates', () => {
      const keywords = generateIndustryKeywords(AI_INDUSTRY_VERTICALS);
      const uniqueKeywords = [...new Set(keywords)];

      expect(keywords.length).toBe(uniqueKeywords.length);
    });
  });

  describe('optimizeContentForLocation', () => {
    it('should provide suggestions when location is not mentioned', () => {
      const content = 'This is content about venture capital and AI investment.';
      const baseKeywords = ['venture capital'];
      
      const result = optimizeContentForLocation(content, testLocation, baseKeywords);

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.includes('San Francisco'))).toBe(true);
    });

    it('should provide fewer suggestions when location is already mentioned', () => {
      const content = 'This is content about venture capital in San Francisco and AI investment.';
      const baseKeywords = ['venture capital'];
      
      const result = optimizeContentForLocation(content, testLocation, baseKeywords);

      // Should still provide keyword suggestions but not location mention suggestions
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should suggest relevant location keywords', () => {
      const content = 'Content about AI startups.';
      const baseKeywords = ['AI startups'];
      
      const result = optimizeContentForLocation(content, testLocation, baseKeywords);

      expect(result.suggestions.some(s => s.includes('AI startups San Francisco'))).toBe(true);
    });
  });

  describe('optimizeContentForIndustry', () => {
    it('should suggest missing industry keywords', () => {
      const content = 'This is general content about technology.';
      
      const result = optimizeContentForIndustry(content, testVertical);

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.includes('enterprise AI'))).toBe(true);
    });

    it('should suggest use cases when not mentioned', () => {
      const content = 'Content about enterprise AI software.';
      
      const result = optimizeContentForIndustry(content, testVertical);

      expect(result.suggestions.some(s => s.includes('Automation'))).toBe(true);
    });

    it('should suggest challenges when not addressed', () => {
      const content = 'Content about enterprise AI software and automation.';
      
      const result = optimizeContentForIndustry(content, testVertical);

      expect(result.suggestions.some(s => s.includes('Integration'))).toBe(true);
    });

    it('should provide fewer suggestions when content is well-optimized', () => {
      const content = 'Content about enterprise AI software for automation and analytics, addressing integration and scalability challenges.';
      
      const result = optimizeContentForIndustry(content, testVertical);

      expect(result.suggestions.length).toBeLessThan(3);
    });
  });

  describe('generateLocalIndustrySEOData', () => {
    it('should generate comprehensive SEO data with location and industry', () => {
      const config = {
        baseTitle: 'AI Venture Capital',
        baseDescription: 'Investment in AI startups',
        location: testLocation,
        vertical: testVertical,
        url: '/test-page'
      };

      const result = generateLocalIndustrySEOData(config);

      // Title might be truncated, so check if it contains the key parts
      expect(result.title).toContain('Enterprise AI Software');
      expect(result.title.length).toBeLessThanOrEqual(60);
      expect(result.description).toContain('San Francisco');
      expect(result.description).toContain('enterprise ai software');
      expect(result.keywords.length).toBeGreaterThan(5);
      expect(result.structuredData.length).toBe(2); // Local + Industry schemas
    });

    it('should generate SEO data with only location', () => {
      const config = {
        baseTitle: 'AI Venture Capital',
        baseDescription: 'Investment in AI startups',
        location: testLocation,
        url: '/test-page'
      };

      const result = generateLocalIndustrySEOData(config);

      expect(result.title).toContain('San Francisco');
      expect(result.description).toContain('San Francisco');
      expect(result.structuredData.length).toBe(1); // Only local schema
    });

    it('should generate SEO data with only industry', () => {
      const config = {
        baseTitle: 'AI Venture Capital',
        baseDescription: 'Investment in AI startups',
        vertical: testVertical,
        url: '/test-page'
      };

      const result = generateLocalIndustrySEOData(config);

      expect(result.title).toContain('Enterprise AI Software');
      expect(result.description).toContain('enterprise ai software');
      expect(result.structuredData.length).toBe(1); // Only industry schema
    });

    it('should truncate title and description if too long', () => {
      const config = {
        baseTitle: 'This is a very long title that exceeds the recommended length for SEO optimization and should be truncated',
        baseDescription: 'This is a very long description that exceeds the recommended length for meta descriptions in search engines and should be truncated to maintain optimal SEO performance and user experience',
        location: testLocation,
        vertical: testVertical,
        url: '/test-page'
      };

      const result = generateLocalIndustrySEOData(config);

      expect(result.title.length).toBeLessThanOrEqual(60);
      expect(result.description.length).toBeLessThanOrEqual(160);
      expect(result.title).toMatch(/\.\.\.$/);
      expect(result.description).toMatch(/\.\.\.$/);
    });
  });

  describe('DEFAULT_GEOGRAPHIC_TARGETS', () => {
    it('should contain major US tech hubs', () => {
      const cities = DEFAULT_GEOGRAPHIC_TARGETS.map(target => target.city);
      
      expect(cities).toContain('San Francisco');
      expect(cities).toContain('New York');
      expect(cities).toContain('Austin');
      expect(cities).toContain('Boston');
      expect(cities).toContain('Seattle');
    });

    it('should have coordinates for all locations', () => {
      DEFAULT_GEOGRAPHIC_TARGETS.forEach(target => {
        expect(target.coordinates).toBeDefined();
        expect(target.coordinates!.latitude).toBeTypeOf('number');
        expect(target.coordinates!.longitude).toBeTypeOf('number');
      });
    });
  });

  describe('AI_INDUSTRY_VERTICALS', () => {
    it('should contain key AI industry verticals', () => {
      const verticalNames = AI_INDUSTRY_VERTICALS.map(v => v.name);
      
      expect(verticalNames).toContain('Enterprise AI Software');
      expect(verticalNames).toContain('AI-Powered Analytics');
      expect(verticalNames).toContain('AI Customer Experience');
      expect(verticalNames).toContain('AI Operations & DevOps');
      expect(verticalNames).toContain('AI Security & Compliance');
    });

    it('should have keywords for all verticals', () => {
      AI_INDUSTRY_VERTICALS.forEach(vertical => {
        expect(vertical.keywords).toBeDefined();
        expect(vertical.keywords.length).toBeGreaterThan(0);
        expect(vertical.description).toBeDefined();
        expect(vertical.description.length).toBeGreaterThan(0);
      });
    });

    it('should have use cases and challenges for all verticals', () => {
      AI_INDUSTRY_VERTICALS.forEach(vertical => {
        expect(vertical.useCases).toBeDefined();
        expect(vertical.useCases!.length).toBeGreaterThan(0);
        expect(vertical.challenges).toBeDefined();
        expect(vertical.challenges!.length).toBeGreaterThan(0);
      });
    });
  });
});