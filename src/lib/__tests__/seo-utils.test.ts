/**
 * Tests for SEO utilities
 */

import { describe, it, expect } from 'vitest';
import {
  generateMetadata,
  generatePageTitle,
  truncateDescription,
  extractKeywords,
  DEFAULT_SEO,
  SITE_URL,
  SITE_NAME,
} from '../seo-utils';

describe('SEO Utils', () => {
  describe('generateMetadata', () => {
    it('should generate default metadata when no config provided', () => {
      const metadata = generateMetadata();
      
      expect(metadata.title).toBe(DEFAULT_SEO.title);
      expect(metadata.description).toBe(DEFAULT_SEO.description);
      expect(metadata.keywords).toBe(DEFAULT_SEO.keywords);
      expect(metadata.robots).toBe('index, follow');
    });

    it('should generate custom metadata when config provided', () => {
      const config = {
        title: 'Custom Title',
        description: 'Custom description',
        keywords: 'custom, keywords',
        url: '/custom-page',
        noIndex: true,
      };

      const metadata = generateMetadata(config);
      
      expect(metadata.title).toBe('Custom Title');
      expect(metadata.description).toBe('Custom description');
      expect(metadata.keywords).toBe('custom, keywords');
      expect(metadata.robots).toBe('noindex, nofollow');
      expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/custom-page`);
    });

    it('should generate proper Open Graph metadata', () => {
      const config = {
        title: 'Test Page',
        description: 'Test description',
        url: '/test',
        image: '/test-image.jpg',
        type: 'article' as const,
        publishedTime: '2024-01-01T00:00:00Z',
        author: 'Test Author',
      };

      const metadata = generateMetadata(config);
      
      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.title).toBe('Test Page');
      expect(metadata.openGraph?.description).toBe('Test description');
      expect(metadata.openGraph?.url).toBe(`${SITE_URL}/test`);
      expect(metadata.openGraph?.publishedTime).toBe('2024-01-01T00:00:00Z');
      expect(metadata.openGraph?.authors).toEqual(['Test Author']);
    });

    it('should generate proper Twitter Card metadata', () => {
      const config = {
        title: 'Test Page',
        description: 'Test description',
        image: '/test-image.jpg',
      };

      const metadata = generateMetadata(config);
      
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe('Test Page');
      expect(metadata.twitter?.description).toBe('Test description');
      expect(metadata.twitter?.images).toEqual([`${SITE_URL}/test-image.jpg`]);
    });
  });

  describe('generatePageTitle', () => {
    it('should generate page title with site name', () => {
      const title = generatePageTitle('About Us');
      expect(title).toBe(`About Us | ${SITE_NAME}`);
    });
  });

  describe('truncateDescription', () => {
    it('should not truncate short descriptions', () => {
      const description = 'This is a short description.';
      const result = truncateDescription(description);
      expect(result).toBe(description);
    });

    it('should truncate long descriptions at word boundary', () => {
      const longDescription = 'This is a very long description that exceeds the maximum length limit and should be truncated at a word boundary to maintain readability and proper formatting.';
      const result = truncateDescription(longDescription, 50);
      expect(result.length).toBeLessThanOrEqual(53); // 50 + '...'
      expect(result.endsWith('...')).toBe(true);
      expect(result).not.toMatch(/\s\.\.\.$/); // Should not end with space before ...
    });

    it('should handle custom max length', () => {
      const description = 'This is a test description that is longer than 30 characters.';
      const result = truncateDescription(description, 30);
      expect(result.length).toBeLessThanOrEqual(33); // 30 + '...'
      expect(result.endsWith('...')).toBe(true);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from content', () => {
      const content = 'This is about venture capital and startup funding for enterprise AI companies.';
      const keywords = extractKeywords(content);
      
      expect(keywords).toContain('venture');
      expect(keywords).toContain('capital');
      expect(keywords).toContain('startup');
      expect(keywords).toContain('funding');
      expect(keywords).toContain('enterprise');
      expect(keywords).toContain('companies');
    });

    it('should combine with existing keywords', () => {
      const content = 'This is about artificial intelligence and machine learning.';
      const existingKeywords = 'venture capital, startup funding';
      const keywords = extractKeywords(content, existingKeywords);
      
      expect(keywords).toContain('venture capital');
      expect(keywords).toContain('startup funding');
      expect(keywords).toContain('artificial');
      expect(keywords).toContain('intelligence');
    });

    it('should filter out common stop words', () => {
      const content = 'This is a test with many common words that should be filtered out.';
      const keywords = extractKeywords(content);
      
      expect(keywords).not.toContain('this');
      expect(keywords).not.toContain('that');
      expect(keywords).not.toContain('with');
      expect(keywords).not.toContain('many');
      expect(keywords).not.toContain('should');
    });

    it('should remove duplicates', () => {
      const content = 'venture capital venture capital startup funding startup funding';
      const keywords = extractKeywords(content);
      const keywordArray = keywords.split(', ');
      const uniqueKeywords = [...new Set(keywordArray)];
      
      expect(keywordArray.length).toBe(uniqueKeywords.length);
    });
  });
});