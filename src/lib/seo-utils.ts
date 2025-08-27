/**
 * SEO utilities for dynamic meta tag generation and structured data
 */

import type { Metadata } from 'next';

// Base URL for the site
export const SITE_URL = 'https://arenafund.vc';
export const SITE_NAME = 'Arena Fund';

// Default SEO configuration
export const DEFAULT_SEO = {
  title: 'Arena Fund | Buyer-Validated Venture Capital for B2B AI Startups',
  description: 'The only VC fund that validates Fortune 500 buyers before investing. Systematic enterprise demand validation reduces risk for investors and accelerates revenue for founders.',
  keywords: 'venture capital, buyer validation, Fortune 500, B2B AI, enterprise sales, startup funding',
  image: '/logo.png',
  type: 'website' as const,
};

// SEO configuration interface
export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  canonical?: string;
}

/**
 * Generate dynamic meta tags for Next.js pages
 */
export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title = DEFAULT_SEO.title,
    description = DEFAULT_SEO.description,
    keywords = DEFAULT_SEO.keywords,
    image = DEFAULT_SEO.image,
    url,
    type = DEFAULT_SEO.type,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    noIndex = false,
    canonical,
  } = config;

  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    authors: author ? [{ name: author }] : [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: canonical || fullUrl,
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: fullUrl,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
      ...(tags && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@arenafund',
      site: '@arenafund',
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };

  return metadata;
}

/**
 * Generate page-specific title with site name
 */
export function generatePageTitle(pageTitle: string): string {
  return `${pageTitle} | ${SITE_NAME}`;
}

/**
 * Truncate description to optimal length for meta tags
 */
export function truncateDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) return description;
  
  const truncated = description.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Extract keywords from content
 */
export function extractKeywords(content: string, existingKeywords: string = ''): string {
  // Simple keyword extraction - in production, you might want to use a more sophisticated approach
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'more', 'very', 'what', 'know', 'just', 'first', 'into', 'over', 'think', 'also', 'your', 'work', 'life', 'only', 'can', 'still', 'should', 'after', 'being', 'now', 'made', 'before', 'here', 'through', 'when', 'where', 'much', 'some', 'these', 'many', 'would', 'there'].includes(word));

  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  const existingKeywordsList = existingKeywords.split(',').map(k => k.trim()).filter(Boolean);
  const combinedKeywords = [...existingKeywordsList, ...topWords];
  
  return [...new Set(combinedKeywords)].join(', ');
}