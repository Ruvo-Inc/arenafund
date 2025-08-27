import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSEOOptimization } from '../useSEOOptimization';

// Mock the SEO optimization engine
vi.mock('../../lib/seo-optimization-engine', () => ({
  seoOptimizationEngine: {
    analyzeContent: vi.fn(),
    generateSEOScore: vi.fn(),
    analyzeInternalLinking: vi.fn(),
    generateMetaTagSuggestions: vi.fn(),
  },
}));

describe('useSEOOptimization', () => {
  const mockAnalysis = {
    wordCount: 500,
    readabilityScore: 65,
    keywordDensity: { 'AI venture capital': 2.5 },
    headingStructure: [{ level: 1, text: 'Test Title', keywords: ['AI'] }],
    internalLinks: ['/about'],
    externalLinks: ['https://example.com'],
    images: [{ src: '/test.jpg', alt: 'Test image', hasAlt: true, isOptimized: true }],
    metaTagSuggestions: {
      title: 'Test Title | Arena Fund',
      description: 'Test description for SEO optimization.',
      keywords: ['AI venture capital', 'enterprise AI'],
      openGraph: {
        title: 'Test Title',
        description: 'Test description',
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
      {
        type: 'critical' as const,
        category: 'meta' as const,
        message: 'Meta description too long',
        fix: 'Shorten to under 160 characters',
      },
    ],
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { seoOptimizationEngine } = await import('../../lib/seo-optimization-engine');
    vi.mocked(seoOptimizationEngine.analyzeContent).mockReturnValue(mockAnalysis);
    vi.mocked(seoOptimizationEngine.generateSEOScore).mockReturnValue(mockScore);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSEOOptimization());

    expect(result.current.analysis).toBeNull();
    expect(result.current.score).toBeNull();
    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasAnalysis).toBe(false);
    expect(result.current.hasScore).toBe(false);
  });

  it('should analyze content successfully', async () => {
    const { result } = renderHook(() => useSEOOptimization());

    await act(async () => {
      await result.current.analyzeContent('Test content', '/test');
    });

    expect(result.current.analysis).toEqual(mockAnalysis);
    expect(result.current.score).toEqual(mockScore);
    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasAnalysis).toBe(true);
    expect(result.current.hasScore).toBe(true);
  });

  it('should handle analysis errors', async () => {
    const { seoOptimizationEngine } = await import('../../lib/seo-optimization-engine');
    vi.mocked(seoOptimizationEngine.analyzeContent).mockImplementation(() => {
      throw new Error('Analysis failed');
    });

    const { result } = renderHook(() => useSEOOptimization());

    await act(async () => {
      try {
        await result.current.analyzeContent('Test content', '/test');
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Analysis failed');
    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.hasAnalysis).toBe(false);
  });

  it('should provide computed suggestions', async () => {
    const { result } = renderHook(() => useSEOOptimization());

    await act(async () => {
      await result.current.analyzeContent('Test content', '/test');
    });

    expect(result.current.suggestions).toHaveLength(2);
    expect(result.current.criticalSuggestions).toHaveLength(1);
    expect(result.current.importantSuggestions).toHaveLength(1);
    expect(result.current.minorSuggestions).toHaveLength(0);
  });

  it('should provide score breakdown', async () => {
    const { result } = renderHook(() => useSEOOptimization());

    await act(async () => {
      await result.current.analyzeContent('Test content', '/test');
    });

    expect(result.current.scoreByCategory).toEqual({
      content: 80,
      technical: 90,
      keywords: 85,
      structure: 85,
    });
    expect(result.current.overallGrade).toBe('B');
  });

  it('should provide content insights', async () => {
    const { result } = renderHook(() => useSEOOptimization());

    await act(async () => {
      await result.current.analyzeContent('Test content', '/test');
    });

    expect(result.current.contentInsights).toEqual({
      wordCount: 500,
      readabilityScore: 65,
      headingCount: 1,
      imageCount: 1,
      imagesWithAlt: 1,
      internalLinkCount: 1,
      externalLinkCount: 1,
    });
  });

  it('should provide keyword insights', async () => {
    const { result } = renderHook(() => useSEOOptimization());

    await act(async () => {
      await result.current.analyzeContent('Test content', '/test');
    });

    expect(result.current.keywordInsights).toEqual({
      totalKeywords: 1,
      targetKeywords: 1,
      overOptimized: 0,
      underOptimized: 0,
      topKeywords: [{ keyword: 'AI venture capital', density: 2.5 }],
    });
  });

  it('should provide utility flags', async () => {
    const { result } = renderHook(() => useSEOOptimization());

    await act(async () => {
      await result.current.analyzeContent('Test content', '/test');
    });

    expect(result.current.hasCriticalIssues).toBe(true);
    expect(result.current.needsImprovement).toBe(false); // Score is 85
    expect(result.current.isGoodScore).toBe(true); // Score >= 80
  });

  it('should clear analysis', async () => {
    const { result } = renderHook(() => useSEOOptimization());

    await act(async () => {
      await result.current.analyzeContent('Test content', '/test');
    });

    expect(result.current.hasAnalysis).toBe(true);

    act(() => {
      result.current.clearAnalysis();
    });

    expect(result.current.analysis).toBeNull();
    expect(result.current.score).toBeNull();
    expect(result.current.hasAnalysis).toBe(false);
    expect(result.current.hasScore).toBe(false);
  });

  it('should generate meta tags', async () => {
    const mockMetaTags = {
      title: 'Test Title',
      description: 'Test description',
      keywords: ['test', 'seo'],
    };
    const { seoOptimizationEngine } = await import('../../lib/seo-optimization-engine');
    vi.mocked(seoOptimizationEngine.generateMetaTagSuggestions).mockReturnValue(mockMetaTags);

    const { result } = renderHook(() => useSEOOptimization());

    const metaTags = result.current.generateMetaTags('Test content', '/test');
    expect(metaTags).toEqual(mockMetaTags);
  });

  it('should analyze internal linking', async () => {
    const mockLinkingStrategy = {
      suggestedLinks: [],
      orphanedPages: [],
      overLinkedPages: [],
      linkDistribution: {},
    };
    const { seoOptimizationEngine } = await import('../../lib/seo-optimization-engine');
    vi.mocked(seoOptimizationEngine.analyzeInternalLinking).mockReturnValue(mockLinkingStrategy);

    const { result } = renderHook(() => useSEOOptimization());

    const pages = [
      { url: '/page1', content: 'Content 1', title: 'Page 1' },
      { url: '/page2', content: 'Content 2', title: 'Page 2' },
    ];

    const strategy = await result.current.analyzeInternalLinking(pages);
    expect(strategy).toEqual(mockLinkingStrategy);
  });

  it('should handle different grade calculations', async () => {
    const { result } = renderHook(() => useSEOOptimization());

    // Test different score ranges
    const testCases = [
      { score: 95, expectedGrade: 'A' },
      { score: 85, expectedGrade: 'B' },
      { score: 75, expectedGrade: 'C' },
      { score: 65, expectedGrade: 'D' },
      { score: 45, expectedGrade: 'F' },
    ];

    for (const testCase of testCases) {
      const { seoOptimizationEngine } = await import('../../lib/seo-optimization-engine');
      vi.mocked(seoOptimizationEngine.generateSEOScore).mockReturnValue({
        ...mockScore,
        overall: testCase.score,
      });

      await act(async () => {
        await result.current.analyzeContent('Test content', '/test');
      });

      expect(result.current.overallGrade).toBe(testCase.expectedGrade);
    }
  });
});