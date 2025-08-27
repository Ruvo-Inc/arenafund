/**
 * SEO Page Optimizer - Integration utilities for Next.js pages
 * Provides automated SEO optimization for page content and metadata
 */

import { Metadata } from 'next';
import { seoOptimizationEngine, MetaTagSuggestions } from './seo-optimization-engine';

export interface PageSEOData {
  title: string;
  description: string;
  content: string;
  url: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface OptimizedMetadata extends Metadata {
  seoScore?: number;
  suggestions?: string[];
}

export class SEOPageOptimizer {
  private readonly baseUrl: string;
  private readonly siteName: string;
  private readonly defaultAuthor: string;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://arenafund.vc',
    siteName: string = 'Arena Fund',
    defaultAuthor: string = 'Arena Fund Team'
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.siteName = siteName;
    this.defaultAuthor = defaultAuthor;
  }

  /**
   * Generate optimized metadata for a Next.js page
   */
  generateOptimizedMetadata(pageData: PageSEOData): OptimizedMetadata {
    const analysis = seoOptimizationEngine.analyzeContent(pageData.content, pageData.url);
    const score = seoOptimizationEngine.generateSEOScore(analysis, pageData.url);
    const metaSuggestions = analysis.metaTagSuggestions;

    const fullUrl = `${this.baseUrl}${pageData.url}`;
    const optimizedTitle = this.optimizeTitle(metaSuggestions.title || pageData.title);
    const optimizedDescription = this.optimizeDescription(metaSuggestions.description || pageData.description);

    const metadata: OptimizedMetadata = {
      title: optimizedTitle,
      description: optimizedDescription,
      keywords: metaSuggestions.keywords.join(', '),
      authors: [{ name: pageData.author || this.defaultAuthor }],
      creator: pageData.author || this.defaultAuthor,
      publisher: this.siteName,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        type: 'article',
        title: metaSuggestions.openGraph.title,
        description: metaSuggestions.openGraph.description,
        url: fullUrl,
        siteName: this.siteName,
        locale: 'en_US',
        images: [
          {
            url: `${this.baseUrl}/logo.png`,
            width: 1200,
            height: 630,
            alt: `${this.siteName} - AI Venture Capital`,
          },
        ],
        ...(pageData.publishedTime && { publishedTime: pageData.publishedTime }),
        ...(pageData.modifiedTime && { modifiedTime: pageData.modifiedTime }),
        ...(pageData.section && { section: pageData.section }),
        ...(pageData.tags && { tags: pageData.tags }),
      },
      twitter: {
        card: 'summary_large_image',
        title: metaSuggestions.openGraph.title,
        description: metaSuggestions.openGraph.description,
        creator: '@arenafund',
        site: '@arenafund',
        images: [`${this.baseUrl}/logo.png`],
      },
      alternates: {
        canonical: fullUrl,
      },
      other: {
        'article:author': pageData.author || this.defaultAuthor,
        'article:publisher': this.siteName,
        ...(pageData.section && { 'article:section': pageData.section }),
        ...(pageData.tags && { 'article:tag': pageData.tags.join(', ') }),
      },
      // Custom properties for debugging
      seoScore: score.overall,
      suggestions: score.suggestions.filter(s => s.type === 'critical').map(s => s.message),
    };

    return metadata;
  }

  /**
   * Generate structured data (JSON-LD) for a page
   */
  generateStructuredData(pageData: PageSEOData): Record<string, any> {
    const fullUrl = `${this.baseUrl}${pageData.url}`;
    
    const baseStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: pageData.title,
      description: pageData.description,
      url: fullUrl,
      author: {
        '@type': 'Organization',
        name: this.siteName,
        url: this.baseUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
        url: this.baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${this.baseUrl}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullUrl,
      },
      ...(pageData.publishedTime && { datePublished: pageData.publishedTime }),
      ...(pageData.modifiedTime && { dateModified: pageData.modifiedTime }),
    };

    // Add organization-specific structured data for Arena Fund
    if (pageData.url === '/' || pageData.url.includes('about')) {
      return {
        ...baseStructuredData,
        '@type': 'Organization',
        name: this.siteName,
        alternateName: 'Arena Fund VC',
        url: this.baseUrl,
        logo: `${this.baseUrl}/logo.png`,
        description: 'AI-focused venture capital firm investing in enterprise AI companies and B2B AI startups.',
        foundingDate: '2020',
        industry: 'Venture Capital',
        investmentFocus: ['Artificial Intelligence', 'Enterprise Software', 'B2B Technology'],
        sameAs: [
          'https://twitter.com/arenafund',
          'https://linkedin.com/company/arena-fund',
        ],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'San Francisco',
          addressRegion: 'CA',
          addressCountry: 'US',
        },
      };
    }

    // Add investment-specific structured data
    if (pageData.url.includes('thesis') || pageData.url.includes('invest')) {
      return {
        ...baseStructuredData,
        '@type': 'Service',
        name: 'AI Venture Capital Investment',
        provider: {
          '@type': 'Organization',
          name: this.siteName,
        },
        serviceType: 'Venture Capital Investment',
        description: 'Enterprise AI investment services for B2B AI startups and Fortune 500 AI adoption.',
        areaServed: 'Global',
        audience: {
          '@type': 'Audience',
          audienceType: 'AI Startups, Enterprise Companies',
        },
      };
    }

    return baseStructuredData;
  }

  /**
   * Analyze page performance and provide optimization recommendations
   */
  async analyzePageSEO(pageData: PageSEOData) {
    const analysis = seoOptimizationEngine.analyzeContent(pageData.content, pageData.url);
    const score = seoOptimizationEngine.generateSEOScore(analysis, pageData.url);
    
    return {
      analysis,
      score,
      metadata: this.generateOptimizedMetadata(pageData),
      structuredData: this.generateStructuredData(pageData),
      recommendations: this.generatePageRecommendations(analysis, score),
    };
  }

  /**
   * Generate internal linking suggestions for multiple pages
   */
  async optimizeInternalLinking(pages: PageSEOData[]) {
    const pageData = pages.map(page => ({
      url: page.url,
      title: page.title,
      content: page.content,
    }));

    return seoOptimizationEngine.analyzeInternalLinking(pageData);
  }

  /**
   * Generate sitemap data with SEO priorities
   */
  generateSitemapData(pages: PageSEOData[]) {
    return pages.map(page => {
      const analysis = seoOptimizationEngine.analyzeContent(page.content, page.url);
      const score = seoOptimizationEngine.generateSEOScore(analysis, page.url);
      
      // Calculate priority based on SEO score and page importance
      let priority = 0.5;
      if (page.url === '/') priority = 1.0;
      else if (page.url.includes('about') || page.url.includes('thesis')) priority = 0.9;
      else if (page.url.includes('insights') || page.url.includes('portfolio')) priority = 0.8;
      else if (score.overall >= 80) priority = 0.7;
      else if (score.overall >= 60) priority = 0.6;

      return {
        url: `${this.baseUrl}${page.url}`,
        lastModified: page.modifiedTime || new Date().toISOString(),
        changeFrequency: this.getChangeFrequency(page.url),
        priority,
        seoScore: score.overall,
      };
    });
  }

  private optimizeTitle(title: string): string {
    // Ensure title includes brand and is within optimal length
    if (!title.toLowerCase().includes('arena fund')) {
      if (title.length <= 45) {
        title = `${title} | Arena Fund`;
      } else {
        title = `${title.substring(0, 45)}... | Arena Fund`;
      }
    }
    
    return title.length <= 60 ? title : title.substring(0, 57) + '...';
  }

  private optimizeDescription(description: string): string {
    // Ensure description is within optimal length and includes call-to-action
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    } else if (description.length < 120 && !description.includes('Learn more')) {
      description += ' Learn more about our AI investment approach.';
      if (description.length > 160) {
        description = description.substring(0, 157) + '...';
      }
    }
    
    return description;
  }

  private generatePageRecommendations(analysis: any, score: any): string[] {
    const recommendations: string[] = [];
    
    if (score.overall < 70) {
      recommendations.push('Overall SEO score needs improvement. Focus on critical issues first.');
    }
    
    if (analysis.wordCount < 300) {
      recommendations.push('Add more content to reach the optimal word count of 300-2000 words.');
    }
    
    if (analysis.internalLinks.length < 2) {
      recommendations.push('Add more internal links to improve site navigation and SEO.');
    }
    
    const imagesWithoutAlt = analysis.images.filter((img: any) => !img.hasAlt);
    if (imagesWithoutAlt.length > 0) {
      recommendations.push(`Add alt text to ${imagesWithoutAlt.length} images for better accessibility and SEO.`);
    }
    
    if (analysis.readabilityScore < 60) {
      recommendations.push('Improve content readability by using shorter sentences and simpler language.');
    }
    
    return recommendations;
  }

  private getChangeFrequency(url: string): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
    if (url === '/') return 'weekly';
    if (url.includes('insights') || url.includes('news')) return 'weekly';
    if (url.includes('portfolio')) return 'monthly';
    if (url.includes('about') || url.includes('thesis')) return 'yearly';
    return 'monthly';
  }
}

// Export singleton instance
export const seoPageOptimizer = new SEOPageOptimizer();

// Utility function for easy metadata generation
export function generatePageMetadata(pageData: PageSEOData): OptimizedMetadata {
  return seoPageOptimizer.generateOptimizedMetadata(pageData);
}

// Utility function for structured data generation
export function generatePageStructuredData(pageData: PageSEOData): Record<string, any> {
  return seoPageOptimizer.generateStructuredData(pageData);
}