/**
 * SEO Optimized Page Component
 * Wrapper component that provides comprehensive SEO optimization for all pages
 */

import { ReactNode } from 'react';
import { StructuredData } from './StructuredData';
import { generatePageStructuredData } from '@/lib/structured-data';

interface SEOOptimizedPageProps {
  children: ReactNode;
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
  className?: string;
}

/**
 * SEO Optimized Page wrapper component
 * Automatically adds structured data and other SEO optimizations
 */
export function SEOOptimizedPage({
  children,
  title,
  description,
  url,
  type = 'webpage',
  publishedDate,
  modifiedDate,
  author,
  section,
  keywords,
  breadcrumbs,
  faqs,
  className = 'min-h-screen bg-white',
}: SEOOptimizedPageProps) {
  // Generate structured data for the page
  const structuredData = generatePageStructuredData({
    type,
    title,
    description,
    url,
    publishedDate,
    modifiedDate,
    author,
    section,
    keywords,
    breadcrumbs,
    faqs,
  });

  return (
    <div className={className}>
      <StructuredData data={structuredData} />
      {children}
    </div>
  );
}

export default SEOOptimizedPage;