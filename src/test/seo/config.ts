export const SEO_TEST_CONFIG = {
  // Performance benchmarks
  performance: {
    maxLoadTime: 2000, // 2 seconds
    maxLCP: 2500, // Largest Contentful Paint
    maxFID: 100, // First Input Delay
    maxCLS: 0.1, // Cumulative Layout Shift
    maxTTI: 3000, // Time to Interactive
    maxTBT: 300, // Total Blocking Time
  },

  // SEO requirements
  seo: {
    minTitleLength: 30,
    maxTitleLength: 60,
    minDescriptionLength: 120,
    maxDescriptionLength: 160,
    minKeywordDensity: 0.01, // 1%
    maxKeywordDensity: 0.05, // 5%
    requiredMetaTags: [
      'title',
      'description',
      'canonical',
      'og:title',
      'og:description',
      'og:image',
      'twitter:card'
    ]
  },

  // AI optimization requirements
  aiOptimization: {
    minReadabilityScore: 70,
    minFactStatements: 3,
    requiredStructuredData: true,
    maxAmbiguousLanguage: 0.1, // 10% of content
  },

  // Test pages to validate
  testPages: [
    { url: '/', name: 'Homepage', priority: 'high' },
    { url: '/about', name: 'About', priority: 'high' },
    { url: '/thesis', name: 'Thesis', priority: 'high' },
    { url: '/insights', name: 'Insights', priority: 'medium' },
    { url: '/team', name: 'Team', priority: 'medium' },
    { url: '/apply', name: 'Apply', priority: 'high' },
    { url: '/invest', name: 'Invest', priority: 'high' }
  ],

  // Browser and device configurations
  browsers: [
    { name: 'chromium', type: 'desktop' },
    { name: 'firefox', type: 'desktop' },
    { name: 'webkit', type: 'desktop' },
    { name: 'mobile-chrome', type: 'mobile' },
    { name: 'mobile-safari', type: 'mobile' }
  ],

  // Viewport configurations
  viewports: [
    { width: 375, height: 667, name: 'Mobile Portrait' },
    { width: 768, height: 1024, name: 'Tablet Portrait' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ],

  // Lighthouse configuration
  lighthouse: {
    categories: ['performance', 'accessibility', 'best-practices', 'seo'],
    minScores: {
      performance: 0.9,
      accessibility: 0.9,
      'best-practices': 0.9,
      seo: 0.9
    },
    audits: {
      'meta-description': 'error',
      'document-title': 'error',
      'html-has-lang': 'error',
      'meta-viewport': 'error',
      'canonical': 'error',
      'largest-contentful-paint': { maxNumericValue: 2500 },
      'cumulative-layout-shift': { maxNumericValue: 0.1 },
      'first-input-delay': { maxNumericValue: 100 }
    }
  },

  // Test timeouts
  timeouts: {
    pageLoad: 30000, // 30 seconds
    testSuite: 300000, // 5 minutes
    lighthouse: 60000, // 1 minute
    crossBrowser: 120000 // 2 minutes
  },

  // Reporting configuration
  reporting: {
    outputDir: 'test-results',
    formats: ['json', 'html', 'junit'],
    includeScreenshots: true,
    includeVideos: false,
    retainOnFailure: true
  }
};

export type SEOTestConfig = typeof SEO_TEST_CONFIG;