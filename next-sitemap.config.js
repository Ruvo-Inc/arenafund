/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://arenafund.vc',
  generateRobotsTxt: true,
  generateIndexSitemap: false, // Generate a single sitemap.xml instead of index
  
  // Exclude API routes and other non-public pages
  exclude: [
    '/api/*',
    '/success',
    '/server-sitemap-index.xml',
  ],
  
  // Additional paths to include
  additionalPaths: async (config) => {
    const result = [];
    
    // Add dynamic insight articles
    const insightPaths = [
      '/insights/fortune-500-buyer-psychology',
      '/insights/proof-before-promises',
    ];
    
    insightPaths.forEach(path => {
      result.push({
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      });
    });
    
    return result;
  },
  
  // Custom transformation for specific pages
  transform: async (config, path) => {
    // Set custom priorities and change frequencies for different page types
    const customConfig = {
      loc: path,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    };
    
    // Homepage gets highest priority
    if (path === '/') {
      customConfig.priority = 1.0;
      customConfig.changefreq = 'daily';
    }
    
    // Core pages get high priority
    if (['/about', '/thesis', '/process', '/team'].includes(path)) {
      customConfig.priority = 0.9;
      customConfig.changefreq = 'weekly';
    }
    
    // Application and investment pages
    if (['/apply', '/invest'].includes(path)) {
      customConfig.priority = 0.8;
      customConfig.changefreq = 'weekly';
    }
    
    // Insights pages
    if (path.startsWith('/insights')) {
      customConfig.priority = 0.8;
      customConfig.changefreq = 'weekly';
    }
    
    // Legal pages get lower priority
    if (['/privacy', '/terms', '/terms-of-use'].includes(path)) {
      customConfig.priority = 0.3;
      customConfig.changefreq = 'monthly';
    }
    
    // Contact and FAQ pages
    if (['/contact', '/faq'].includes(path)) {
      customConfig.priority = 0.6;
      customConfig.changefreq = 'monthly';
    }
    
    return customConfig;
  },
  
  // Robots.txt configuration
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/success'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'CCBot',
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://arenafund.vc/sitemap.xml',
    ],
  },
};