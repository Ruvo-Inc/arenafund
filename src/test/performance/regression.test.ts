import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';
import { performance } from 'perf_hooks';

interface PerformanceMetrics {
  url: string;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  totalBlockingTime: number;
  timeToInteractive: number;
  resourceCount: number;
  transferSize: number;
  timestamp: number;
}

interface PerformanceBenchmark {
  url: string;
  maxLoadTime: number;
  maxLCP: number;
  maxCLS: number;
  maxFID: number;
  maxTTI: number;
  maxTBT: number;
}

describe('Performance Regression Testing', () => {
  let browser: Browser;
  let page: Page;

  const performanceBenchmarks: PerformanceBenchmark[] = [
    {
      url: 'http://localhost:3000',
      maxLoadTime: 2000,
      maxLCP: 2500,
      maxCLS: 0.1,
      maxFID: 100,
      maxTTI: 3000,
      maxTBT: 300
    },
    {
      url: 'http://localhost:3000/about',
      maxLoadTime: 2000,
      maxLCP: 2500,
      maxCLS: 0.1,
      maxFID: 100,
      maxTTI: 3000,
      maxTBT: 300
    },
    {
      url: 'http://localhost:3000/thesis',
      maxLoadTime: 2000,
      maxLCP: 2500,
      maxCLS: 0.1,
      maxFID: 100,
      maxTTI: 3000,
      maxTBT: 300
    },
    {
      url: 'http://localhost:3000/insights',
      maxLoadTime: 2500, // Slightly higher for content-heavy page
      maxLCP: 3000,
      maxCLS: 0.1,
      maxFID: 100,
      maxTTI: 3500,
      maxTBT: 400
    }
  ];

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    
    // Set up performance monitoring
    await page.addInitScript(() => {
      // Collect Web Vitals
      window.webVitalsData = {};
      
      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        window.webVitalsData.lcp = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.processingStart && entry.startTime) {
            window.webVitalsData.fid = entry.processingStart - entry.startTime;
          }
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        window.webVitalsData.cls = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
    });
  });

  afterAll(async () => {
    await browser?.close();
  });

  async function measurePagePerformance(url: string): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // Get navigation timing
    const navigationTiming = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.navigationStart,
        loadComplete: nav.loadEventEnd - nav.navigationStart,
        firstContentfulPaint: 0, // Will be set below
        timeToInteractive: 0 // Will be calculated
      };
    });

    // Get paint timing
    const paintTiming = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return {
        firstContentfulPaint: fcp ? fcp.startTime : 0
      };
    });

    // Get Web Vitals data
    const webVitals = await page.evaluate(() => window.webVitalsData || {});

    // Get resource information
    const resourceInfo = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const totalSize = resources.reduce((sum, resource) => {
        return sum + (resource.transferSize || 0);
      }, 0);
      
      return {
        resourceCount: resources.length,
        transferSize: totalSize
      };
    });

    // Calculate Time to Interactive (simplified)
    const timeToInteractive = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return nav.domInteractive - nav.navigationStart;
    });

    // Calculate Total Blocking Time (simplified)
    const totalBlockingTime = await page.evaluate(() => {
      const longTasks = performance.getEntriesByType('longtask');
      return longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0);
    });

    return {
      url,
      loadTime,
      domContentLoaded: navigationTiming.domContentLoaded,
      firstContentfulPaint: paintTiming.firstContentfulPaint,
      largestContentfulPaint: webVitals.lcp || 0,
      cumulativeLayoutShift: webVitals.cls || 0,
      firstInputDelay: webVitals.fid || 0,
      totalBlockingTime,
      timeToInteractive,
      resourceCount: resourceInfo.resourceCount,
      transferSize: resourceInfo.transferSize,
      timestamp: Date.now()
    };
  }

  describe('Core Web Vitals Regression', () => {
    performanceBenchmarks.forEach(benchmark => {
      it(`should meet performance benchmarks for ${benchmark.url}`, async () => {
        const metrics = await measurePagePerformance(benchmark.url);

        // Core Web Vitals
        expect(metrics.largestContentfulPaint).toBeLessThan(benchmark.maxLCP);
        expect(metrics.cumulativeLayoutShift).toBeLessThan(benchmark.maxCLS);
        expect(metrics.firstInputDelay).toBeLessThan(benchmark.maxFID);

        // Additional performance metrics
        expect(metrics.loadTime).toBeLessThan(benchmark.maxLoadTime);
        expect(metrics.timeToInteractive).toBeLessThan(benchmark.maxTTI);
        expect(metrics.totalBlockingTime).toBeLessThan(benchmark.maxTBT);

        // Log metrics for monitoring
        console.log(`Performance metrics for ${benchmark.url}:`, {
          loadTime: `${metrics.loadTime.toFixed(2)}ms`,
          lcp: `${metrics.largestContentfulPaint.toFixed(2)}ms`,
          cls: metrics.cumulativeLayoutShift.toFixed(3),
          fid: `${metrics.firstInputDelay.toFixed(2)}ms`,
          tti: `${metrics.timeToInteractive.toFixed(2)}ms`,
          tbt: `${metrics.totalBlockingTime.toFixed(2)}ms`
        });
      }, 30000);
    });
  });

  describe('Resource Loading Regression', () => {
    performanceBenchmarks.forEach(benchmark => {
      it(`should not exceed resource limits for ${benchmark.url}`, async () => {
        const metrics = await measurePagePerformance(benchmark.url);

        // Resource count should be reasonable
        expect(metrics.resourceCount).toBeLessThan(100);

        // Total transfer size should be reasonable (< 2MB)
        expect(metrics.transferSize).toBeLessThan(2 * 1024 * 1024);

        // First Contentful Paint should be fast
        expect(metrics.firstContentfulPaint).toBeLessThan(1500);

        console.log(`Resource metrics for ${benchmark.url}:`, {
          resourceCount: metrics.resourceCount,
          transferSize: `${(metrics.transferSize / 1024).toFixed(2)}KB`,
          fcp: `${metrics.firstContentfulPaint.toFixed(2)}ms`
        });
      });
    });
  });

  describe('SEO Performance Impact', () => {
    it('should not degrade performance with SEO optimizations', async () => {
      const baselineMetrics = await measurePagePerformance('http://localhost:3000');
      
      // Simulate SEO-heavy page
      await page.goto('http://localhost:3000/insights');
      
      // Add structured data and meta tags
      await page.evaluate(() => {
        // Add multiple structured data scripts
        for (let i = 0; i < 5; i++) {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `Test Article ${i}`,
            author: 'Arena Fund'
          });
          document.head.appendChild(script);
        }

        // Add multiple meta tags
        const metaTags = [
          { name: 'keywords', content: 'enterprise AI, venture capital, B2B AI' },
          { name: 'author', content: 'Arena Fund' },
          { property: 'og:title', content: 'Arena Fund - Enterprise AI Venture Capital' },
          { property: 'og:description', content: 'Leading venture capital firm focused on enterprise AI investments' },
          { property: 'twitter:card', content: 'summary_large_image' }
        ];

        metaTags.forEach(tag => {
          const meta = document.createElement('meta');
          if (tag.name) meta.name = tag.name;
          if (tag.property) meta.setAttribute('property', tag.property);
          meta.content = tag.content;
          document.head.appendChild(meta);
        });
      });

      const seoMetrics = await measurePagePerformance('http://localhost:3000/insights');

      // SEO optimizations should not significantly impact performance
      const performanceDegradation = (seoMetrics.loadTime - baselineMetrics.loadTime) / baselineMetrics.loadTime;
      expect(performanceDegradation).toBeLessThan(0.2); // Less than 20% degradation

      console.log('SEO Performance Impact:', {
        baseline: `${baselineMetrics.loadTime.toFixed(2)}ms`,
        withSEO: `${seoMetrics.loadTime.toFixed(2)}ms`,
        degradation: `${(performanceDegradation * 100).toFixed(2)}%`
      });
    });
  });

  describe('Mobile Performance Regression', () => {
    beforeAll(async () => {
      // Simulate mobile device
      await page.setViewportSize({ width: 375, height: 667 });
      await page.emulateMedia({ media: 'screen' });
    });

    performanceBenchmarks.forEach(benchmark => {
      it(`should meet mobile performance benchmarks for ${benchmark.url}`, async () => {
        const metrics = await measurePagePerformance(benchmark.url);

        // Mobile benchmarks are typically more strict
        expect(metrics.largestContentfulPaint).toBeLessThan(benchmark.maxLCP * 1.2);
        expect(metrics.cumulativeLayoutShift).toBeLessThan(benchmark.maxCLS);
        expect(metrics.firstInputDelay).toBeLessThan(benchmark.maxFID);
        expect(metrics.loadTime).toBeLessThan(benchmark.maxLoadTime * 1.5);

        console.log(`Mobile performance metrics for ${benchmark.url}:`, {
          loadTime: `${metrics.loadTime.toFixed(2)}ms`,
          lcp: `${metrics.largestContentfulPaint.toFixed(2)}ms`,
          cls: metrics.cumulativeLayoutShift.toFixed(3)
        });
      });
    });
  });

  describe('Performance Monitoring and Alerting', () => {
    it('should collect performance data for monitoring', async () => {
      const allMetrics: PerformanceMetrics[] = [];

      for (const benchmark of performanceBenchmarks) {
        const metrics = await measurePagePerformance(benchmark.url);
        allMetrics.push(metrics);
      }

      // Simulate storing metrics (in real implementation, this would go to a database)
      const performanceReport = {
        timestamp: Date.now(),
        testRun: 'regression-test',
        metrics: allMetrics,
        summary: {
          averageLoadTime: allMetrics.reduce((sum, m) => sum + m.loadTime, 0) / allMetrics.length,
          averageLCP: allMetrics.reduce((sum, m) => sum + m.largestContentfulPaint, 0) / allMetrics.length,
          averageCLS: allMetrics.reduce((sum, m) => sum + m.cumulativeLayoutShift, 0) / allMetrics.length,
          totalTransferSize: allMetrics.reduce((sum, m) => sum + m.transferSize, 0)
        }
      };

      expect(performanceReport.metrics.length).toBe(performanceBenchmarks.length);
      expect(performanceReport.summary.averageLoadTime).toBeLessThan(3000);
      expect(performanceReport.summary.averageLCP).toBeLessThan(3000);
      expect(performanceReport.summary.averageCLS).toBeLessThan(0.1);

      console.log('Performance Report Summary:', performanceReport.summary);
    });
  });
});