# SEO Infrastructure Documentation

This directory contains the core SEO infrastructure for Arena Fund, implementing comprehensive search engine optimization and AI-discovery optimization features.

## Overview

The SEO infrastructure provides:

1. **Dynamic Meta Tag Generation** - Automated meta tag creation for all pages
2. **Structured Data (JSON-LD)** - Rich snippets and AI-readable content markup
3. **Automated Sitemap Generation** - Dynamic sitemap creation with next-sitemap
4. **AI-Optimized Robots.txt** - Configured for both traditional search engines and AI crawlers

## Core Components

### SEO Utils (`seo-utils.ts`)

Provides utilities for generating Next.js metadata and SEO optimization:

```typescript
import { generateMetadata } from '@/lib/seo-utils';

// Generate metadata for a page
export const metadata = generateMetadata({
  title: 'Custom Page Title',
  description: 'Page description optimized for search engines',
  keywords: 'relevant, keywords, for, seo',
  url: '/custom-page',
  type: 'webpage',
});
```

**Key Functions:**
- `generateMetadata()` - Creates Next.js Metadata objects
- `generatePageTitle()` - Formats page titles with site name
- `truncateDescription()` - Optimizes description length
- `extractKeywords()` - Extracts keywords from content

### Structured Data (`structured-data.ts`)

Generates JSON-LD structured data for search engines and AI models:

```typescript
import { generatePageStructuredData } from '@/lib/structured-data';

// Generate comprehensive structured data
const structuredData = generatePageStructuredData({
  type: 'article',
  title: 'Article Title',
  description: 'Article description',
  url: '/article-url',
  publishedDate: '2024-01-01T00:00:00Z',
  author: 'Author Name',
});
```

**Supported Schema Types:**
- Organization
- WebSite
- WebPage
- Article
- FAQPage
- BreadcrumbList

### React Components

#### StructuredData Component

Injects JSON-LD structured data into pages:

```typescript
import { StructuredData } from '@/components/StructuredData';

export default function MyPage() {
  const structuredData = generatePageStructuredData({...});
  
  return (
    <div>
      <StructuredData data={structuredData} />
      {/* Page content */}
    </div>
  );
}
```

#### SEOHead Component (Pages Router)

Comprehensive SEO head component for pages router:

```typescript
import { SEOHead } from '@/components/SEOHead';

export default function MyPage() {
  return (
    <>
      <SEOHead
        title="Page Title"
        description="Page description"
        url="/page-url"
        type="webpage"
      />
      {/* Page content */}
    </>
  );
}
```

## Sitemap Configuration

### Automated Generation

Sitemaps are automatically generated during build using `next-sitemap`:

```bash
npm run build  # Automatically generates sitemap
# or
npx next-sitemap  # Generate sitemap manually
```

### Configuration (`next-sitemap.config.js`)

The sitemap configuration includes:

- **Static Pages** - All main site pages with appropriate priorities
- **Dynamic Content** - Insight articles and other dynamic content
- **AI-Friendly Robots.txt** - Allows access for AI crawlers (GPTBot, Claude, etc.)
- **Custom Priorities** - Homepage (1.0), core pages (0.9), content (0.8)

### Generated Files

- `public/sitemap.xml` - Main sitemap with all URLs
- `public/robots.txt` - Robots.txt with AI crawler permissions

## Usage Examples

### App Router Page with SEO

```typescript
// src/app/example/page.tsx
import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo-utils';
import { StructuredData } from '@/components/StructuredData';
import { generatePageStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Example Page | Arena Fund',
  description: 'This is an example page showing SEO implementation.',
  keywords: 'example, seo, arena fund',
  url: '/example',
  type: 'webpage',
});

export default function ExamplePage() {
  const structuredData = generatePageStructuredData({
    type: 'webpage',
    title: 'Example Page',
    description: 'This is an example page showing SEO implementation.',
    url: '/example',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Example', url: '/example' },
    ],
  });

  return (
    <div>
      <StructuredData data={structuredData} />
      <h1>Example Page</h1>
      <p>Page content here...</p>
    </div>
  );
}
```

### Article Page with Rich Metadata

```typescript
// src/app/insights/my-article/page.tsx
import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo-utils';
import { StructuredData } from '@/components/StructuredData';
import { generatePageStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = generateSEOMetadata({
  title: 'My Article | Arena Fund Insights',
  description: 'Deep insights into venture capital and AI startups.',
  keywords: 'venture capital, AI, startups, insights',
  url: '/insights/my-article',
  type: 'article',
  publishedTime: '2024-01-01T00:00:00Z',
  author: 'Arena Fund',
});

export default function ArticlePage() {
  const structuredData = generatePageStructuredData({
    type: 'article',
    title: 'My Article',
    description: 'Deep insights into venture capital and AI startups.',
    url: '/insights/my-article',
    publishedDate: '2024-01-01T00:00:00Z',
    author: 'Arena Fund',
    section: 'Insights',
    keywords: ['venture capital', 'AI', 'startups'],
  });

  return (
    <div>
      <StructuredData data={structuredData} />
      <article>
        <h1>My Article</h1>
        <p>Article content here...</p>
      </article>
    </div>
  );
}
```

### FAQ Page with Structured Data

```typescript
// src/app/faq/page.tsx
export default function FAQPage() {
  const faqs = [
    {
      question: 'What is Arena Fund?',
      answer: 'Arena Fund is a venture capital fund that validates Fortune 500 buyer demand before investing.',
    },
    {
      question: 'How do you validate buyers?',
      answer: 'We orchestrate enterprise pilots with Fortune 500 companies to prove demand before investment.',
    },
  ];

  const structuredData = generatePageStructuredData({
    type: 'faq',
    title: 'Frequently Asked Questions',
    description: 'Common questions about Arena Fund and our investment approach.',
    url: '/faq',
    faqs,
  });

  return (
    <div>
      <StructuredData data={structuredData} />
      <h1>FAQ</h1>
      {faqs.map((faq, index) => (
        <div key={index}>
          <h2>{faq.question}</h2>
          <p>{faq.answer}</p>
        </div>
      ))}
    </div>
  );
}
```

## AI Optimization Features

### AI-Friendly Content Structure

The structured data is optimized for AI model consumption:

- **Clear Fact Statements** - Structured for easy AI extraction
- **Proper Citations** - Formatted for AI model reference
- **Consistent Markup** - Uses standard Schema.org vocabulary
- **Training Data Optimization** - Content formatted for AI training datasets

### AI Crawler Support

The robots.txt explicitly allows AI crawlers:

```
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /
```

## Performance Considerations

### Build-Time Generation

- Sitemaps are generated at build time for optimal performance
- Structured data is pre-computed where possible
- Meta tags are generated server-side for better SEO

### Caching Strategy

- Static assets are optimized and cached
- Structured data is cached in memory where appropriate
- Sitemap generation is optimized for large sites

## Testing

The SEO infrastructure includes comprehensive tests:

```bash
# Run SEO-specific tests
npm test -- src/lib/__tests__/seo-utils.test.ts
npm test -- src/lib/__tests__/structured-data.test.ts
```

Tests cover:
- Metadata generation
- Structured data creation
- Content optimization utilities
- Edge cases and error handling

## Monitoring and Analytics

### Search Console Integration

The infrastructure is designed to work with Google Search Console:

- Proper sitemap submission
- Rich results monitoring
- Core Web Vitals tracking
- Search performance analysis

### AI Discovery Monitoring

Track AI model mentions and citations:

- Monitor AI-generated content for Arena Fund mentions
- Track accuracy of AI-provided information
- Analyze citation patterns and sources

## Best Practices

### Content Creation

1. **Use Semantic HTML** - Proper heading hierarchy and semantic elements
2. **Optimize Images** - Include alt text and proper sizing
3. **Internal Linking** - Create logical link structures
4. **Content Quality** - Focus on original, valuable content

### Technical SEO

1. **Page Speed** - Optimize Core Web Vitals
2. **Mobile-First** - Ensure mobile responsiveness
3. **Accessibility** - Follow WCAG guidelines
4. **Security** - Use HTTPS and security headers

### AI Optimization

1. **Clear Structure** - Use consistent formatting and hierarchies
2. **Factual Content** - Include specific, measurable claims
3. **Proper Citations** - Reference sources and data
4. **Avoid Ambiguity** - Use clear, unambiguous language

## Troubleshooting

### Common Issues

1. **Missing Structured Data** - Ensure StructuredData component is included
2. **Sitemap Not Updating** - Run `npx next-sitemap` after content changes
3. **Meta Tags Not Appearing** - Check metadata export in page files
4. **Build Errors** - Verify all imports and type definitions

### Debug Tools

- Use Google's Rich Results Test for structured data validation
- Check Search Console for indexing issues
- Use Lighthouse for SEO audits
- Validate sitemaps with online tools

## Future Enhancements

Planned improvements include:

1. **Dynamic Content Integration** - CMS-driven content optimization
2. **Advanced Analytics** - Custom SEO performance dashboards
3. **A/B Testing** - SEO optimization testing framework
4. **Automated Optimization** - AI-powered content optimization suggestions