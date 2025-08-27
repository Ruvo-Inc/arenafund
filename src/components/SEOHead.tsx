/**
 * SEOHead component for comprehensive SEO optimization
 * Combines meta tags, structured data, and other SEO elements
 */

import Head from 'next/head';
import { generatePageStructuredData } from '@/lib/structured-data';
import { StructuredData } from './StructuredData';

interface SEOHeadProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'webpage' | 'article' | 'faq';
  publishedDate?: string;
  modifiedDate?: string;
  author?: string;
  section?: string;
  keywords?: string[];
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  noIndex?: boolean;
  canonical?: string;
  additionalMeta?: Array<{ name?: string; property?: string; content: string }>;
}

/**
 * Comprehensive SEO head component that handles meta tags and structured data
 * Note: This component is for use with pages router. For app router, use generateMetadata instead.
 */
export function SEOHead({
  title,
  description,
  url,
  image = '/logo.png',
  type = 'webpage',
  publishedDate,
  modifiedDate,
  author,
  section,
  keywords,
  breadcrumbs,
  faqs,
  noIndex = false,
  canonical,
  additionalMeta = [],
}: SEOHeadProps) {
  const siteUrl = 'https://arenafund.vc';
  const fullUrl = `${siteUrl}${url}`;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const canonicalUrl = canonical || fullUrl;

  // Generate structured data
  const structuredData = generatePageStructuredData({
    type,
    title,
    description,
    url,
    image,
    publishedDate,
    modifiedDate,
    author,
    section,
    keywords,
    breadcrumbs,
    faqs,
  });

  return (
    <>
      <Head>
        {/* Basic meta tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords.join(', ')} />}
        <meta name="author" content={author || 'Arena Fund'} />
        <meta name="creator" content="Arena Fund" />
        <meta name="publisher" content="Arena Fund" />
        
        {/* Robots */}
        <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:site_name" content="Arena Fund" />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={title} />
        <meta property="og:locale" content="en_US" />
        
        {/* Article-specific Open Graph tags */}
        {type === 'article' && publishedDate && (
          <meta property="article:published_time" content={publishedDate} />
        )}
        {type === 'article' && modifiedDate && (
          <meta property="article:modified_time" content={modifiedDate} />
        )}
        {type === 'article' && author && (
          <meta property="article:author" content={author} />
        )}
        {type === 'article' && section && (
          <meta property="article:section" content={section} />
        )}
        {type === 'article' && keywords && keywords.map((keyword, index) => (
          <meta key={index} property="article:tag" content={keyword} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:creator" content="@arenafund" />
        <meta name="twitter:site" content="@arenafund" />
        
        {/* Additional meta tags */}
        {additionalMeta.map((meta, index) => (
          <meta
            key={index}
            {...(meta.name && { name: meta.name })}
            {...(meta.property && { property: meta.property })}
            content={meta.content}
          />
        ))}
        
        {/* Favicon and icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </Head>
      
      {/* Structured Data */}
      <StructuredData data={structuredData} />
    </>
  );
}

export default SEOHead;