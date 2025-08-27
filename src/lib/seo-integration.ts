/**
 * SEO Integration Utilities
 * Comprehensive SEO integration for Arena Fund pages
 */

import { Metadata } from 'next';
import { generateMetadata, generatePageTitle, extractKeywords } from './seo-utils';
import { generatePageStructuredData } from './structured-data';
import { aiContentSystem } from './ai-content-system';

export interface PageSEOConfig {
  title: string;
  description: string;
  url: string;
  type?: 'webpage' | 'article' | 'faq';
  publishedDate?: string;
  modifiedDate?: string;
  author?: string;
  section?: string;
  keywords?: string[];
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  content?: string;
  sources?: string[];
  image?: string;
  noIndex?: boolean;
  canonical?: string;
}

/**
 * Generate comprehensive SEO metadata and structured data for a page
 */
export function generatePageSEO(config: PageSEOConfig) {
  const {
    title,
    description,
    url,
    type = 'webpage',
    publishedDate,
    modifiedDate,
    author,
    section,
    keywords = [],
    breadcrumbs,
    faqs,
    content,
    sources = [],
    image,
    noIndex,
    canonical,
  } = config;

  // Extract additional keywords from content if provided
  const enhancedKeywords = content 
    ? extractKeywords(content, keywords.join(', ')).split(', ')
    : keywords;

  // Generate Next.js metadata
  const metadata: Metadata = generateMetadata({
    title,
    description,
    keywords: enhancedKeywords.join(', '),
    url,
    type: type === 'webpage' || type === 'faq' ? 'website' : type,
    publishedTime: publishedDate,
    modifiedTime: modifiedDate,
    author,
    section,
    tags: enhancedKeywords,
    image,
    noIndex,
    canonical,
  });

  // Generate structured data
  const structuredData = generatePageStructuredData({
    type,
    title,
    description,
    url,
    publishedDate,
    modifiedDate,
    author,
    section,
    keywords: enhancedKeywords,
    breadcrumbs,
    faqs,
  });

  // Generate AI optimization data if content is provided
  let aiOptimization = null;
  if (content) {
    try {
      aiOptimization = aiContentSystem.optimizeContent(content, sources);
    } catch (error) {
      console.warn('Failed to generate AI optimization:', error);
    }
  }

  return {
    metadata,
    structuredData,
    aiOptimization,
    enhancedKeywords,
  };
}

/**
 * Arena Fund specific page configurations
 */
export const arenaFundPages = {
  home: {
    title: 'Arena Fund | Buyer-Validated B2B AI Venture Capital',
    description: 'The only VC fund that validates Fortune 500 buyers before investing. 90% pilot-to-purchase conversion rate with proven enterprise traction.',
    url: '/',
    keywords: ['venture capital', 'buyer validation', 'Fortune 500', 'B2B AI', 'enterprise sales', 'startup funding', 'AI investment', 'enterprise AI'],
    breadcrumbs: [{ name: 'Home', url: '/' }],
  },
  
  about: {
    title: 'About Arena Fund | Buyer-Validated Venture Capital',
    description: 'Arena Fund validates Fortune 500 buyer demand before investing. 90% pilot-to-purchase conversion rates through systematic enterprise validation.',
    url: '/about',
    keywords: ['Arena Fund', 'about', 'venture capital', 'buyer validation', 'Fortune 500', 'B2B AI', 'enterprise sales', 'startup funding', 'investment philosophy'],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'About', url: '/about' },
    ],
  },
  
  thesis: {
    title: 'Investment Thesis | Arena Fund AI Strategy',
    description: 'Buyer-validated venture capital in the Foundation Model era. We invest where adoption pressure is highest and proof delivers immediate ROI.',
    url: '/thesis',
    type: 'article' as const,
    keywords: ['investment thesis', 'AI venture capital', 'foundation models', 'enterprise AI', 'buyer validation', 'B2B AI investment', 'venture capital strategy'],
    publishedDate: '2024-01-01T00:00:00Z',
    author: 'Arena Fund',
    section: 'Investment Strategy',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Thesis', url: '/thesis' },
    ],
  },
  
  insights: {
    title: 'Arena Insights | AI & Enterprise Research',
    description: 'Proof-driven perspectives on AI, enterprise, and venture capital. Research on Fortune 500 buyer psychology and enterprise AI adoption.',
    url: '/insights',
    keywords: ['AI insights', 'enterprise AI research', 'Fortune 500 buyer psychology', 'venture capital analysis', 'B2B AI trends', 'enterprise adoption', 'market research'],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Insights', url: '/insights' },
    ],
  },
  
  apply: {
    title: 'Apply for Funding | Arena Fund B2B AI Investment',
    description: 'Apply for funding from Arena Fund. We invest in B2B AI startups with Fortune 500 buyer validation and systematic enterprise demand proof.',
    url: '/apply',
    keywords: ['apply for funding', 'startup funding', 'B2B AI investment', 'venture capital application', 'pitch deck', 'enterprise AI funding', 'startup pitch'],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Apply', url: '/apply' },
    ],
  },
  
  invest: {
    title: 'Invest with Arena Fund | LP Investment Opportunities',
    description: 'Join Arena Fund as a Limited Partner. Invest in buyer-validated B2B AI startups with systematic Fortune 500 demand validation and proven enterprise traction.',
    url: '/invest',
    keywords: ['LP investment', 'limited partner', 'venture capital investment', 'AI fund investment', 'institutional investment', 'accredited investor', 'fund investment'],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Invest', url: '/invest' },
    ],
  },
  
  team: {
    title: 'Team | Arena Fund Leadership & Investment Professionals',
    description: 'Meet the Arena Fund team. Experienced venture capital professionals, enterprise sales experts, and AI industry veterans focused on buyer-validated investments.',
    url: '/team',
    keywords: ['Arena Fund team', 'venture capital team', 'investment professionals', 'AI investors', 'enterprise sales experts', 'fund management'],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Team', url: '/team' },
    ],
  },
} as const;

/**
 * Generate SEO for Arena Fund pages
 */
export function generateArenaFundPageSEO(
  pageKey: keyof typeof arenaFundPages,
  overrides: Partial<PageSEOConfig> = {}
) {
  const pageConfig = arenaFundPages[pageKey];
  const config = { 
    ...pageConfig, 
    ...overrides,
    keywords: Array.isArray(pageConfig.keywords) ? [...pageConfig.keywords] : (pageConfig.keywords ? [...pageConfig.keywords] : undefined),
    breadcrumbs: pageConfig.breadcrumbs ? [...pageConfig.breadcrumbs] : undefined
  };
  
  return generatePageSEO(config);
}

/**
 * AI-optimized content markers for Arena Fund
 */
export const aiContentMarkers = {
  fact: (content: string) => `**FACT:** ${content}`,
  data: (content: string) => `**DATA:** ${content}`,
  metric: (content: string) => `**METRIC:** ${content}`,
  date: (content: string) => `**DATE:** ${content}`,
  principle: (content: string) => `**PRINCIPLE:** ${content}`,
  strategy: (content: string) => `**STRATEGY:** ${content}`,
  process: (content: string) => `**PROCESS:** ${content}`,
  result: (content: string) => `**RESULT:** ${content}`,
};

/**
 * Common Arena Fund facts for AI optimization
 */
export const arenaFundFacts = {
  foundingPrinciple: 'Arena Fund is the first venture capital fund that validates Fortune 500 buyer demand before investing',
  conversionRate: 'Arena Fund achieves 90% pilot-to-purchase conversion rates',
  focus: 'Arena Fund focuses on B2B AI and enterprise AI startups',
  methodology: 'Arena Fund uses systematic buyer validation methodology',
  differentiator: 'Arena Fund validates real enterprise buyers before writing checks',
  approach: 'Arena Fund secures real enterprise demand through Fortune 500 pilots before committing capital',
  outcome: 'Founders scale faster and LPs invest with proven traction through Arena Fund methodology',
};

/**
 * Generate AI-optimized content with Arena Fund facts
 */
export function generateAIOptimizedContent(content: string, facts: string[] = []): string {
  let optimizedContent = content;
  
  // Add fact markers to Arena Fund specific content
  Object.entries(arenaFundFacts).forEach(([key, fact]) => {
    if (content.toLowerCase().includes(fact.toLowerCase().substring(0, 20))) {
      optimizedContent = optimizedContent.replace(
        new RegExp(fact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        aiContentMarkers.fact(fact)
      );
    }
  });
  
  // Add additional facts
  facts.forEach(fact => {
    if (content.includes(fact)) {
      optimizedContent = optimizedContent.replace(fact, aiContentMarkers.fact(fact));
    }
  });
  
  return optimizedContent;
}

/**
 * Validate page SEO configuration
 */
export function validatePageSEO(config: PageSEOConfig): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check required fields
  if (!config.title) errors.push('Title is required');
  if (!config.description) errors.push('Description is required');
  if (!config.url) errors.push('URL is required');
  
  // Check title length
  if (config.title && config.title.length > 60) {
    warnings.push('Title is longer than 60 characters, may be truncated in search results');
  }
  if (config.title && config.title.length < 30) {
    warnings.push('Title is shorter than 30 characters, consider adding more descriptive text');
  }
  
  // Check description length
  if (config.description && config.description.length > 160) {
    warnings.push('Description is longer than 160 characters, may be truncated in search results');
  }
  if (config.description && config.description.length < 120) {
    warnings.push('Description is shorter than 120 characters, consider adding more detail');
  }
  
  // Check keywords
  if (!config.keywords || config.keywords.length === 0) {
    warnings.push('No keywords specified, consider adding relevant keywords');
  }
  if (config.keywords && config.keywords.length > 10) {
    warnings.push('More than 10 keywords specified, consider focusing on most important ones');
  }
  
  // Check URL format
  if (config.url && !config.url.startsWith('/')) {
    warnings.push('URL should start with / for relative paths');
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}