import { describe, it, expect, vi } from 'vitest';
import { SEOPageOptimizer, generatePageMetadata, generatePageStructuredData } from '../seo-page-optimizer';

// Mock the SEO optimization engine
vi.mock('../seo-optimization-engine', () => ({
  seoOptimizationEngine: {
    analyzeContent: vi.fn(),
    generateSEOScore: vi.fn(),
    analyzeInternalLinking: vi.fn(),
  },
}));

describe('SEOPageOptimizer', () => {
  const optimizer = new SEOPageOptimizer('https://test.com', 'Test Site', 'Test Author');

  const mockPageData = {
    title: 'AI Venture Capital Investment',
    description: 'Leading AI venture capital firm focused on enterprise AI investment.',
    content: '<h1>AI Venture Capital</h1><p>We invest in enterprise AI companies.</p>',
    url: '/test-page',
    keywords: ['AI', 'venture capital'],
    author: 'Arena Fund Team',
    publishedTime: '2024-01-01T00:00:00Z',
    modifiedTime: '2024-01-02T00:00:00Z',
    section: 'Investment',
    tags: ['AI', 'VC', 'Enterprise'],
  };

  const mockAnalysis = {
    wordCount: 500,
    readabilityScore: 65,
    keywordDensity: { 'AI venture capital': 2.5 },
    headingStructure: [{ level: 1, text: 'AI Venture Capital', keywords: ['AI'] }],
    internalLinks: ['/about'],
    externalLinks: ['https://example.com'],
    images: [{ src: '/test.jpg', alt: 'Test image', hasAlt: true, isOptimized: true }],
    metaTagSuggestions: {
      title: 'AI Venture Capital Investment | Test Site',
      description: 'Leading AI venture capital firm focused on enterprise AI investment.',
      keywords: ['AI venture capital', 'enterprise AI investment'],
      openGraph: {
        title: 'AI Venture Capital Investment',
        description: 'Leading AI venture capital firm focused on enterprise AI investment.',
        type: 'article',
      },
    },
  };

  const mockScore = {
    overall: 85,
    breakdown: {
      content: 80,
      technical: 90,
      keywords: 85,
      structure: 85,
    },
    suggestions: [
      {
        type: 'important' as const,
        category: 'content' as const,
        message: 'Add more internal links',
        fix: 'Include 2-3 relevant internal links',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { seoOptimizationEngine } = require('../seo-optimization-engine');
    seoOptimizationEngine.analyzeContent.mockReturnValue(mockAnalysis);
    seoOptimizationEngine.generateSEOScore.mockReturnValue(mockScore);
  });

  describe('generateOptimizedMetadata', () => {
    it('should generate comprehensive metadata', () => {
      const metadata = optimizer.generateOptimizedMetadata(mockPageData);

      expect(metadata.title).toBe('AI Venture Capital Investment | Test Site');
      expect(metadata.description).toBe('Leading AI venture capital firm focused on enterprise AI investment.');
      expect(metadata.keywords).toBe('AI venture capital, enterprise AI investment');
      expect(metadata.authors).toEqual([{ name: 'Arena Fund Team' }]);
      expect(metadata.creator).toBe('Arena Fund Team');
      expect(metadata.publisher).toBe('Test Site');
    });

    it('should generate OpenGraph metadata', () => {
      const metadata = optimizer.generateOptimizedMetadata(mockPageData);

      expect(metadata.openGraph).toEqual({
        type: 'article',
        title: 'AI Venture Capital Investment',
        description: 'Leading AI venture capital firm focused on enterprise AI investment.',
        url: 'https://test.com/test-page',
        siteName: 'Test Site',
        locale: 'en_US',
        images: [
          {
            url: 'https://test.com/logo.png',
            width: 1200,
            height: 630,
            alt: 'Test Site - AI Venture Capital',
          },
        ],
        publishedTime: '2024-01-01T00:00:00Z',
        modifiedTime: '2024-01-02T00:00:00Z',
        section: 'Investment',
        tags: ['AI', 'VC', 'Enterprise'],
      });
    });

    it('should generate Twitter metadata', () => {
      const metadata = optimizer.generateOptimizedMetadata(mockPageData);

      expect(metadata.twitter).toEqual({
        card: 'summary_large_image',
        title: 'AI Venture Capital Investment',
        description: 'Leading AI venture capital firm focused on enterprise AI investment.',
        creator: '@arenafund',
        site: '@arenafund',
        images: ['https://test.com/logo.png'],
      });
    });

    it('should include SEO score and suggestions', () => {
      const metadata = optimizer.generateOptimizedMetadata(mockPageData);

      expect(metadata.seoScore).toBe(85);
      expect(metadata.suggestions).toEqual([]);
    });

    it('should handle missing optional fields', () => {
      const minimalPageData = {
        title: 'Test Title',
        description: 'Test description',
        content: '<p>Test content</p>',
        url: '/test',
      };

      const metadata = optimizer.generateOptimizedMetadata(minimalPageData);

      expect(metadata.title).toBeTruthy();
      expect(metadata.description).toBeTruthy();
      expect(metadata.authors).toEqual([{ name: 'Test Author' }]);
    });
  });

  describe('generateStructuredData', () => {
    it('should generate basic article structured data', () => {
      const structuredData = optimizer.generateStructuredData(mockPageData);

      expect(structuredData['@context']).toBe('https://schema.org');
      expect(structuredData['@type']).toBe('Article');
      expect(structuredData.headline).toBe('AI Venture Capital Investment');
      expect(structuredData.description).toBe('Leading AI venture capital firm focused on enterprise AI investment.');
      expect(structuredData.url).toBe('https://test.com/test-page');
      expect(structuredData.datePublished).toBe('2024-01-01T00:00:00Z');
      expect(structuredData.dateModified).toBe('2024-01-02T00:00:00Z');
    });

    it('should generate organization structured data for home page', () => {
      const homePageData = { ...mockPageData, url: '/' };
      const structuredData = optimizer.generateStructuredData(homePageData);

      expect(structuredData['@type']).toBe('Organization');
      expect(structuredData.name).toBe('Test Site');
      expect(structuredData.industry).toBe('Venture Capital');
      expect(structuredData.investmentFocus).toEqual(['Artificial Intelligence', 'Enterprise Software', 'B2B Technology']);
    });

    it('should generate organization structured data for about page', () => {
      const aboutPageData = { ...mockPageData, url: '/about' };
      const structuredData = optimizer.generateStructuredData(aboutPageData);

      expect(structuredData['@type']).toBe('Organization');
      expect(structuredData.foundingDate).toBe('2020');
      expect(structuredData.address).toEqual({
        '@type': 'PostalAddress',
        addressLocality: 'San Francisco',
        addressRegion: 'CA',
        addressCountry: 'US',
      });
    });

    it('should generate service structured data for investment pages', () => {
      const investPageData = { ...mockPageData, url: '/invest' };
      const structuredData = optimizer.generateStructuredData(investPageData);

      expect(structuredData['@type']).toBe('Service');
      expect(structuredData.name).toBe('AI Venture Capital Investment');
      expect(structuredData.serviceType).toBe('Venture Capital Investment');
      expect(structuredData.areaServed).toBe('Global');
    });
  });

  describe('analyzePageSEO', () => {
    it('should provide comprehensive page analysis', async () => {
      const analysis = await optimizer.analyzePageSEO(mockPageData);

      expect(analysis.analysis).toEqual(mockAnalysis);
      expect(analysis.score).toEqual(mockScore);
      expect(analysis.metadata).toBeDefined();
      expect(analysis.structuredData).toBeDefined();
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });

    it('should generate relevant recommendations', async () => {
      const lowScoreAnalysis = {
        ...mockAnalysis,
        wordCount: 100,
        internalLinks: [],
        images: [{ src: '/test.jpg', alt: '', hasAlt: false, isOptimized: false }],
        readabilityScore: 40,
      };

      const lowScore = { ...mockScore, overall: 50 };

      const { seoOptimizationEngine } = require('../seo-optimization-engine');
      seoOptimizationEngine.analyzeContent.mockReturnValue(lowScoreAnalysis);
      seoOptimizationEngine.generateSEOScore.mockReturnValue(lowScore);

      const analysis = await optimizer.analyzePageSEO(mockPageData);

      expect(analysis.recommendations).toContain('Overall SEO score needs improvement. Focus on critical issues first.');
      expect(analysis.recommendations).toContain('Add more content to reach the optimal word count of 300-2000 words.');
      expect(analysis.recommendations).toContain('Add more internal links to improve site navigation and SEO.');
      expect(analysis.recommendations).toContain('Add alt text to 1 images for better accessibility and SEO.');
      expect(analysis.recommendations).toContain('Improve content readability by using shorter sentences and simpler language.');
    });
  });

  describe('optimizeInternalLinking', () => {
    it('should analyze internal linking for multiple pages', async () => {
      const pages = [
        {
          title: 'Page 1',
          description: 'Description 1',
          content: 'Content about AI venture capital',
          url: '/page1',
        },
        {
          title: 'Page 2',
          description: 'Description 2',
          content: 'Content about enterprise AI',
          url: '/page2',
        },
      ];

      const mockLinkingStrategy = {
        suggestedLinks: [
          {
            fromPage: '/page1',
            toPage: '/page2',
            anchorText: 'enterprise AI',
            relevanceScore: 0.8,
            context: 'Learn more about enterprise AI solutions',
          },
        ],
        orphanedPages: [],
        overLinkedPages: [],
        linkDistribution: { '/page1': 1, '/page2': 0 },
      };

      const { seoOptimizationEngine } = require('../seo-optimization-engine');
      seoOptimizationEngine.analyzeInternalLinking.mockReturnValue(mockLinkingStrategy);

      const result = await optimizer.optimizeInternalLinking(pages);

      expect(result).toEqual(mockLinkingStrategy);
      expect(seoOptimizationEngine.analyzeInternalLinking).toHaveBeenCalledWith([
        { url: '/page1', title: 'Page 1', content: 'Content about AI venture capital' },
        { url: '/page2', title: 'Page 2', content: 'Content about enterprise AI' },
      ]);
    });
  });

  describe('generateSitemapData', () => {
    it('should generate sitemap data with priorities', () => {
      const pages = [
        { ...mockPageData, url: '/' },
        { ...mockPageData, url: '/about' },
        { ...mockPageData, url: '/insights/article' },
        { ...mockPageData, url: '/contact' },
      ];

      const sitemapData = optimizer.generateSitemapData(pages);

      expect(sitemapData).toHaveLength(4);
      
      // Home page should have highest priority
      const homePage = sitemapData.find(item => item.url === 'https://test.com/');
      expect(homePage?.priority).toBe(1.0);
      
      // About page should have high priority
      const aboutPage = sitemapData.find(item => item.url === 'https://test.com/about');
      expect(aboutPage?.priority).toBe(0.9);
      
      // Insights should have medium-high priority
      const insightsPage = sitemapData.find(item => item.url === 'https://test.com/insights/article');
      expect(insightsPage?.priority).toBe(0.8);
      
      // Other pages should have score-based priority
      const contactPage = sitemapData.find(item => item.url === 'https://test.com/contact');
      expect(contactPage?.priority).toBe(0.7); // Score is 85, so 0.7
    });

    it('should include change frequencies', () => {
      const pages = [
        { ...mockPageData, url: '/' },
        { ...mockPageData, url: '/insights/article' },
        { ...mockPageData, url: '/about' },
      ];

      const sitemapData = optimizer.generateSitemapData(pages);

      const homePage = sitemapData.find(item => item.url === 'https://test.com/');
      expect(homePage?.changeFrequency).toBe('weekly');
      
      const insightsPage = sitemapData.find(item => item.url === 'https://test.com/insights/article');
      expect(insightsPage?.changeFrequency).toBe('weekly');
      
      const aboutPage = sitemapData.find(item => item.url === 'https://test.com/about');
      expect(aboutPage?.changeFrequency).toBe('yearly');
    });
  });

  describe('utility functions', () => {
    it('should export generatePageMetadata utility', () => {
      const metadata = generatePageMetadata(mockPageData);
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeTruthy();
    });

    it('should export generatePageStructuredData utility', () => {
      const structuredData = generatePageStructuredData(mockPageData);
      expect(structuredData).toBeDefined();
      expect(structuredData['@context']).toBe('https://schema.org');
    });
  });

  describe('title and description optimization', () => {
    it('should optimize long titles', () => {
      const longTitleData = {
        ...mockPageData,
        title: 'This is a very long title that exceeds the optimal length for SEO and should be truncated properly',
      };

      const metadata = optimizer.generateOptimizedMetadata(longTitleData);
      expect(metadata.title!.length).toBeLessThanOrEqual(60);
      expect(metadata.title).toContain('...');
    });

    it('should optimize long descriptions', () => {
      const longDescData = {
        ...mockPageData,
        description: 'This is a very long description that exceeds the optimal length for meta descriptions and should be truncated properly to ensure it displays correctly in search results without being cut off.',
      };

      const { seoOptimizationEngine } = require('../seo-optimization-engine');
      seoOptimizationEngine.analyzeContent.mockReturnValue({
        ...mockAnalysis,
        metaTagSuggestions: {
          ...mockAnalysis.metaTagSuggestions,
          description: longDescData.description,
        },
      });

      const metadata = optimizer.generateOptimizedMetadata(longDescData);
      expect(metadata.description!.length).toBeLessThanOrEqual(160);
    });

    it('should add call-to-action to short descriptions', () => {
      const shortDescData = {
        ...mockPageData,
        description: 'Short description.',
      };

      const { seoOptimizationEngine } = require('../seo-optimization-engine');
      seoOptimizationEngine.analyzeContent.mockReturnValue({
        ...mockAnalysis,
        metaTagSuggestions: {
          ...mockAnalysis.metaTagSuggestions,
          description: shortDescData.description,
        },
      });

      const metadata = optimizer.generateOptimizedMetadata(shortDescData);
      expect(metadata.description).toContain('Learn more');
    });
  });
});