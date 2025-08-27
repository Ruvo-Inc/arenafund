/**
 * Utilities for dynamic sitemap generation and SEO optimization
 */

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapConfig {
  siteUrl: string;
  defaultChangeFreq: SitemapEntry['changeFrequency'];
  defaultPriority: number;
}

/**
 * Generate XML sitemap content
 */
export function generateSitemapXML(entries: SitemapEntry[], config: SitemapConfig): string {
  const { siteUrl } = config;
  
  const urlEntries = entries.map(entry => {
    const url = entry.url.startsWith('http') ? entry.url : `${siteUrl}${entry.url}`;
    const lastmod = entry.lastModified ? entry.lastModified.toISOString() : new Date().toISOString();
    const changefreq = entry.changeFrequency || config.defaultChangeFreq;
    const priority = entry.priority !== undefined ? entry.priority : config.defaultPriority;
    
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(siteUrl: string, sitemapUrl?: string): string {
  const sitemap = sitemapUrl || `${siteUrl}/sitemap.xml`;
  
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /success

# AI Crawlers - Allow access for training and indexing
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

User-agent: PerplexityBot
Allow: /

User-agent: YouBot
Allow: /

# Search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

Sitemap: ${sitemap}`;
}

/**
 * Get static pages for sitemap generation
 */
export function getStaticPages(): SitemapEntry[] {
  return [
    {
      url: '/',
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: '/about',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: '/thesis',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: '/process',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: '/team',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: '/apply',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: '/invest',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: '/insights',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: '/insights/fortune-500-buyer-psychology',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: '/insights/proof-before-promises',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: '/contact',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: '/faq',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: '/privacy',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: '/terms',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: '/terms-of-use',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}

/**
 * Validate sitemap entry
 */
export function validateSitemapEntry(entry: SitemapEntry): boolean {
  if (!entry.url) return false;
  if (entry.priority !== undefined && (entry.priority < 0 || entry.priority > 1)) return false;
  return true;
}

/**
 * Sort sitemap entries by priority (highest first)
 */
export function sortSitemapEntries(entries: SitemapEntry[]): SitemapEntry[] {
  return entries.sort((a, b) => {
    const priorityA = a.priority || 0.5;
    const priorityB = b.priority || 0.5;
    return priorityB - priorityA;
  });
}

/**
 * Filter out invalid or excluded URLs
 */
export function filterSitemapEntries(entries: SitemapEntry[], excludePatterns: string[] = []): SitemapEntry[] {
  return entries.filter(entry => {
    // Validate entry
    if (!validateSitemapEntry(entry)) return false;
    
    // Check against exclude patterns
    for (const pattern of excludePatterns) {
      if (entry.url.includes(pattern)) return false;
    }
    
    return true;
  });
}

/**
 * Generate comprehensive sitemap with all pages
 */
export function generateComprehensiveSitemap(
  dynamicEntries: SitemapEntry[] = [],
  config: Partial<SitemapConfig> = {}
): string {
  const defaultConfig: SitemapConfig = {
    siteUrl: 'https://arenafund.vc',
    defaultChangeFreq: 'weekly',
    defaultPriority: 0.7,
    ...config,
  };

  const staticPages = getStaticPages();
  const allEntries = [...staticPages, ...dynamicEntries];
  
  const filteredEntries = filterSitemapEntries(allEntries, ['/api/', '/success']);
  const sortedEntries = sortSitemapEntries(filteredEntries);
  
  return generateSitemapXML(sortedEntries, defaultConfig);
}