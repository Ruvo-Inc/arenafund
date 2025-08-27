/**
 * Structured Data (JSON-LD) generation utilities for SEO and AI optimization
 */

import { SITE_URL, SITE_NAME } from './seo-utils';

// Base structured data interfaces
export interface StructuredDataBase {
  '@context': string;
  '@type': string;
}

export interface OrganizationData extends StructuredDataBase {
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  foundingDate?: string;
  founders?: Person[];
  address?: PostalAddress;
  contactPoint?: ContactPoint[];
  sameAs?: string[];
}

export interface Person {
  '@type': 'Person';
  name: string;
  jobTitle?: string;
  url?: string;
  image?: string;
  sameAs?: string[];
}

export interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

export interface ContactPoint {
  '@type': 'ContactPoint';
  telephone?: string;
  contactType: string;
  email?: string;
  url?: string;
}

export interface ArticleData extends StructuredDataBase {
  '@type': 'Article';
  headline: string;
  description: string;
  image: string;
  author: Person;
  publisher: OrganizationData;
  datePublished: string;
  dateModified?: string;
  url: string;
  mainEntityOfPage: string;
  articleSection?: string;
  keywords?: string[];
}

export interface WebPageData extends StructuredDataBase {
  '@type': 'WebPage';
  name: string;
  description: string;
  url: string;
  mainEntity?: any;
  breadcrumb?: BreadcrumbList;
  isPartOf?: WebSite;
}

export interface WebSite extends StructuredDataBase {
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  publisher: OrganizationData;
  potentialAction?: SearchAction;
}

export interface SearchAction {
  '@type': 'SearchAction';
  target: string;
  'query-input': string;
}

export interface BreadcrumbList extends StructuredDataBase {
  '@type': 'BreadcrumbList';
  itemListElement: ListItem[];
}

export interface ListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface FAQPageData extends StructuredDataBase {
  '@type': 'FAQPage';
  mainEntity: Question[];
}

export interface Question {
  '@type': 'Question';
  name: string;
  acceptedAnswer: Answer;
}

export interface Answer {
  '@type': 'Answer';
  text: string;
}

/**
 * Generate organization structured data for Arena Fund
 */
export function generateOrganizationData(): OrganizationData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'The only VC fund that validates Fortune 500 buyers before investing. Systematic enterprise demand validation reduces risk for investors and accelerates revenue for founders.',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      addressCountry: 'US',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        url: `${SITE_URL}/contact`,
      },
    ],
    sameAs: [
      // Add social media URLs when available
    ],
  };
}

/**
 * Generate website structured data
 */
export function generateWebSiteData(): WebSite {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Buyer-validated venture capital for B2B AI startups. Systematic Fortune 500 buyer validation methodology.',
    publisher: generateOrganizationData(),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate article structured data
 */
export function generateArticleData(config: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedDate: string;
  modifiedDate?: string;
  author?: string;
  section?: string;
  keywords?: string[];
}): ArticleData {
  const {
    title,
    description,
    url,
    image = '/logo.png',
    publishedDate,
    modifiedDate,
    author = 'Arena Fund',
    section,
    keywords,
  } = config;

  const fullUrl = `${SITE_URL}${url}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: imageUrl,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: generateOrganizationData(),
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    url: fullUrl,
    mainEntityOfPage: fullUrl,
    ...(section && { articleSection: section }),
    ...(keywords && { keywords }),
  };
}

/**
 * Generate webpage structured data
 */
export function generateWebPageData(config: {
  name: string;
  description: string;
  url: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}): WebPageData {
  const { name, description, url, breadcrumbs } = config;
  const fullUrl = `${SITE_URL}${url}`;

  const webPageData: WebPageData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: fullUrl,
    isPartOf: generateWebSiteData(),
  };

  if (breadcrumbs && breadcrumbs.length > 0) {
    webPageData.breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${SITE_URL}${crumb.url}`,
      })),
    };
  }

  return webPageData;
}

/**
 * Generate FAQ page structured data
 */
export function generateFAQData(faqs: Array<{ question: string; answer: string }>): FAQPageData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate JSON-LD script tag content
 */
export function generateJSONLD(data: any): string {
  return JSON.stringify(data, null, 0);
}

/**
 * Combine multiple structured data objects
 */
export function combineStructuredData(...dataObjects: any[]): string {
  if (dataObjects.length === 1) {
    return generateJSONLD(dataObjects[0]);
  }
  
  return generateJSONLD(dataObjects);
}

/**
 * Generate comprehensive structured data for a page
 */
export function generatePageStructuredData(config: {
  type: 'webpage' | 'article' | 'faq';
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedDate?: string;
  modifiedDate?: string;
  author?: string;
  section?: string;
  keywords?: string[];
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: Array<{ question: string; answer: string }>;
}): string {
  const structuredDataObjects = [];

  // Always include organization and website data
  structuredDataObjects.push(generateOrganizationData());
  structuredDataObjects.push(generateWebSiteData());

  // Add page-specific structured data
  switch (config.type) {
    case 'article':
      if (config.publishedDate) {
        structuredDataObjects.push(generateArticleData({
          title: config.title,
          description: config.description,
          url: config.url,
          image: config.image,
          publishedDate: config.publishedDate,
          modifiedDate: config.modifiedDate,
          author: config.author,
          section: config.section,
          keywords: config.keywords,
        }));
      }
      break;
    
    case 'faq':
      if (config.faqs && config.faqs.length > 0) {
        structuredDataObjects.push(generateFAQData(config.faqs));
      }
      break;
    
    case 'webpage':
    default:
      structuredDataObjects.push(generateWebPageData({
        name: config.title,
        description: config.description,
        url: config.url,
        breadcrumbs: config.breadcrumbs,
      }));
      break;
  }

  return combineStructuredData(...structuredDataObjects);
}