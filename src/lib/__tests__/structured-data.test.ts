/**
 * Tests for structured data utilities
 */

import { describe, it, expect } from 'vitest';
import {
  generateOrganizationData,
  generateWebSiteData,
  generateArticleData,
  generateWebPageData,
  generateFAQData,
  generatePageStructuredData,
  generateJSONLD,
  combineStructuredData,
} from '../structured-data';
import { SITE_URL, SITE_NAME } from '../seo-utils';

describe('Structured Data Utils', () => {
  describe('generateOrganizationData', () => {
    it('should generate valid organization structured data', () => {
      const orgData = generateOrganizationData();
      
      expect(orgData['@context']).toBe('https://schema.org');
      expect(orgData['@type']).toBe('Organization');
      expect(orgData.name).toBe(SITE_NAME);
      expect(orgData.url).toBe(SITE_URL);
      expect(orgData.logo).toBe(`${SITE_URL}/logo.png`);
      expect(orgData.description).toContain('VC fund');
      expect(orgData.foundingDate).toBe('2024');
      expect(orgData.address?.['@type']).toBe('PostalAddress');
      expect(orgData.contactPoint).toHaveLength(1);
    });
  });

  describe('generateWebSiteData', () => {
    it('should generate valid website structured data', () => {
      const websiteData = generateWebSiteData();
      
      expect(websiteData['@context']).toBe('https://schema.org');
      expect(websiteData['@type']).toBe('WebSite');
      expect(websiteData.name).toBe(SITE_NAME);
      expect(websiteData.url).toBe(SITE_URL);
      expect(websiteData.publisher).toBeDefined();
      expect(websiteData.potentialAction?.['@type']).toBe('SearchAction');
    });
  });

  describe('generateArticleData', () => {
    it('should generate valid article structured data', () => {
      const config = {
        title: 'Test Article',
        description: 'Test article description',
        url: '/test-article',
        publishedDate: '2024-01-01T00:00:00Z',
        author: 'Test Author',
        section: 'Insights',
        keywords: ['test', 'article'],
      };

      const articleData = generateArticleData(config);
      
      expect(articleData['@context']).toBe('https://schema.org');
      expect(articleData['@type']).toBe('Article');
      expect(articleData.headline).toBe('Test Article');
      expect(articleData.description).toBe('Test article description');
      expect(articleData.url).toBe(`${SITE_URL}/test-article`);
      expect(articleData.datePublished).toBe('2024-01-01T00:00:00Z');
      expect(articleData.author.name).toBe('Test Author');
      expect(articleData.articleSection).toBe('Insights');
      expect(articleData.keywords).toEqual(['test', 'article']);
    });

    it('should use default values when optional fields not provided', () => {
      const config = {
        title: 'Test Article',
        description: 'Test article description',
        url: '/test-article',
        publishedDate: '2024-01-01T00:00:00Z',
      };

      const articleData = generateArticleData(config);
      
      expect(articleData.author.name).toBe('Arena Fund');
      expect(articleData.image).toBe(`${SITE_URL}/logo.png`);
      expect(articleData.dateModified).toBe('2024-01-01T00:00:00Z');
    });
  });

  describe('generateWebPageData', () => {
    it('should generate valid webpage structured data', () => {
      const config = {
        name: 'Test Page',
        description: 'Test page description',
        url: '/test-page',
      };

      const webPageData = generateWebPageData(config);
      
      expect(webPageData['@context']).toBe('https://schema.org');
      expect(webPageData['@type']).toBe('WebPage');
      expect(webPageData.name).toBe('Test Page');
      expect(webPageData.description).toBe('Test page description');
      expect(webPageData.url).toBe(`${SITE_URL}/test-page`);
      expect(webPageData.isPartOf).toBeDefined();
    });

    it('should include breadcrumbs when provided', () => {
      const config = {
        name: 'Test Page',
        description: 'Test page description',
        url: '/test-page',
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Test', url: '/test-page' },
        ],
      };

      const webPageData = generateWebPageData(config);
      
      expect(webPageData.breadcrumb).toBeDefined();
      expect(webPageData.breadcrumb?.['@type']).toBe('BreadcrumbList');
      expect(webPageData.breadcrumb?.itemListElement).toHaveLength(2);
      expect(webPageData.breadcrumb?.itemListElement[0].name).toBe('Home');
      expect(webPageData.breadcrumb?.itemListElement[1].name).toBe('Test');
    });
  });

  describe('generateFAQData', () => {
    it('should generate valid FAQ structured data', () => {
      const faqs = [
        { question: 'What is Arena Fund?', answer: 'Arena Fund is a venture capital fund.' },
        { question: 'How do we invest?', answer: 'We validate buyers before investing.' },
      ];

      const faqData = generateFAQData(faqs);
      
      expect(faqData['@context']).toBe('https://schema.org');
      expect(faqData['@type']).toBe('FAQPage');
      expect(faqData.mainEntity).toHaveLength(2);
      expect(faqData.mainEntity[0]['@type']).toBe('Question');
      expect(faqData.mainEntity[0].name).toBe('What is Arena Fund?');
      expect(faqData.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
      expect(faqData.mainEntity[0].acceptedAnswer.text).toBe('Arena Fund is a venture capital fund.');
    });
  });

  describe('generateJSONLD', () => {
    it('should generate valid JSON-LD string', () => {
      const data = { '@type': 'Organization', name: 'Test' };
      const jsonLD = generateJSONLD(data);
      
      expect(jsonLD).toBe('{"@type":"Organization","name":"Test"}');
      expect(() => JSON.parse(jsonLD)).not.toThrow();
    });
  });

  describe('combineStructuredData', () => {
    it('should return single object as JSON-LD', () => {
      const data = { '@type': 'Organization', name: 'Test' };
      const result = combineStructuredData(data);
      
      expect(result).toBe(generateJSONLD(data));
    });

    it('should combine multiple objects into array', () => {
      const data1 = { '@type': 'Organization', name: 'Test1' };
      const data2 = { '@type': 'WebSite', name: 'Test2' };
      const result = combineStructuredData(data1, data2);
      
      const parsed = JSON.parse(result);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]['@type']).toBe('Organization');
      expect(parsed[1]['@type']).toBe('WebSite');
    });
  });

  describe('generatePageStructuredData', () => {
    it('should generate comprehensive structured data for webpage', () => {
      const config = {
        type: 'webpage' as const,
        title: 'Test Page',
        description: 'Test description',
        url: '/test',
      };

      const result = generatePageStructuredData(config);
      const parsed = JSON.parse(result);
      
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThanOrEqual(3); // Organization, WebSite, WebPage
      
      const types = parsed.map((item: any) => item['@type']);
      expect(types).toContain('Organization');
      expect(types).toContain('WebSite');
      expect(types).toContain('WebPage');
    });

    it('should generate comprehensive structured data for article', () => {
      const config = {
        type: 'article' as const,
        title: 'Test Article',
        description: 'Test description',
        url: '/test-article',
        publishedDate: '2024-01-01T00:00:00Z',
      };

      const result = generatePageStructuredData(config);
      const parsed = JSON.parse(result);
      
      expect(Array.isArray(parsed)).toBe(true);
      
      const types = parsed.map((item: any) => item['@type']);
      expect(types).toContain('Organization');
      expect(types).toContain('WebSite');
      expect(types).toContain('Article');
    });

    it('should generate comprehensive structured data for FAQ page', () => {
      const config = {
        type: 'faq' as const,
        title: 'FAQ Page',
        description: 'Frequently asked questions',
        url: '/faq',
        faqs: [
          { question: 'What is this?', answer: 'This is a test.' },
        ],
      };

      const result = generatePageStructuredData(config);
      const parsed = JSON.parse(result);
      
      expect(Array.isArray(parsed)).toBe(true);
      
      const types = parsed.map((item: any) => item['@type']);
      expect(types).toContain('Organization');
      expect(types).toContain('WebSite');
      expect(types).toContain('FAQPage');
    });
  });
});