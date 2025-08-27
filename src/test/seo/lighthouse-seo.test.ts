import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

describe('SEO Lighthouse Testing', () => {
  let browser: Browser;
  let page: Page;
  let chrome: any;

  beforeAll(async () => {
    // Launch Chrome for Lighthouse
    chrome = await launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
    });

    // Launch Playwright browser for additional testing
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser?.close();
    await chrome?.kill();
  });

  const testPages = [
    { url: 'http://localhost:3000', name: 'Homepage' },
    { url: 'http://localhost:3000/about', name: 'About Page' },
    { url: 'http://localhost:3000/thesis', name: 'Thesis Page' },
    { url: 'http://localhost:3000/insights', name: 'Insights Page' },
    { url: 'http://localhost:3000/team', name: 'Team Page' },
    { url: 'http://localhost:3000/apply', name: 'Apply Page' },
    { url: 'http://localhost:3000/invest', name: 'Invest Page' }
  ];

  describe('Core SEO Elements', () => {
    testPages.forEach(({ url, name }) => {
      it(`should have proper SEO elements on ${name}`, async () => {
        await page.goto(url);

        // Check title tag
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);
        expect(title.length).toBeLessThan(60);

        // Check meta description
        const metaDescription = await page.getAttribute('meta[name="description"]', 'content');
        expect(metaDescription).toBeTruthy();
        expect(metaDescription!.length).toBeGreaterThan(120);
        expect(metaDescription!.length).toBeLessThan(160);

        // Check canonical URL
        const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
        expect(canonical).toBeTruthy();

        // Check Open Graph tags
        const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
        const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');
        const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
        
        expect(ogTitle).toBeTruthy();
        expect(ogDescription).toBeTruthy();
        expect(ogImage).toBeTruthy();

        // Check structured data
        const structuredData = await page.locator('script[type="application/ld+json"]').count();
        expect(structuredData).toBeGreaterThan(0);
      });
    });
  });

  describe('Lighthouse SEO Scores', () => {
    testPages.forEach(({ url, name }) => {
      it(`should achieve high SEO score on ${name}`, async () => {
        const options = {
          logLevel: 'info' as const,
          output: 'json' as const,
          onlyCategories: ['seo'],
          port: chrome.port,
        };

        const runnerResult = await lighthouse(url, options);
        const seoScore = runnerResult?.lhr.categories.seo.score;
        
        expect(seoScore).toBeGreaterThanOrEqual(0.9);

        // Check specific SEO audits
        const audits = runnerResult?.lhr.audits;
        expect(audits?.['meta-description'].score).toBe(1);
        expect(audits?.['document-title'].score).toBe(1);
        expect(audits?.['html-has-lang'].score).toBe(1);
        expect(audits?.['meta-viewport'].score).toBe(1);
      }, 30000);
    });
  });

  describe('AI-Optimized Content Structure', () => {
    testPages.forEach(({ url, name }) => {
      it(`should have AI-readable content structure on ${name}`, async () => {
        await page.goto(url);

        // Check for proper heading hierarchy
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);

        const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
        expect(headings.length).toBeGreaterThan(1);

        // Check for structured content with clear facts
        const paragraphs = await page.locator('p').allTextContents();
        const hasFactualContent = paragraphs.some(p => 
          p.includes('Arena Fund') || 
          p.includes('enterprise AI') || 
          p.includes('venture capital')
        );
        expect(hasFactualContent).toBe(true);

        // Check for lists (good for AI parsing)
        const lists = await page.locator('ul, ol').count();
        expect(lists).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance Impact on SEO', () => {
    testPages.forEach(({ url, name }) => {
      it(`should have good Core Web Vitals on ${name}`, async () => {
        const options = {
          logLevel: 'info' as const,
          output: 'json' as const,
          onlyCategories: ['performance'],
          port: chrome.port,
        };

        const runnerResult = await lighthouse(url, options);
        const performanceScore = runnerResult?.lhr.categories.performance.score;
        
        expect(performanceScore).toBeGreaterThanOrEqual(0.8);

        // Check Core Web Vitals
        const audits = runnerResult?.lhr.audits;
        const lcp = audits?.['largest-contentful-paint'].numericValue;
        const fid = audits?.['max-potential-fid']?.numericValue || 0;
        const cls = audits?.['cumulative-layout-shift'].numericValue;

        expect(lcp).toBeLessThan(2500);
        expect(fid).toBeLessThan(100);
        expect(cls).toBeLessThan(0.1);
      }, 30000);
    });
  });
});