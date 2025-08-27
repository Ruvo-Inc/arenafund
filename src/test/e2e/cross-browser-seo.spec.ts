import { test, expect, Page, BrowserContext } from '@playwright/test';

const testPages = [
  { url: '/', name: 'Homepage' },
  { url: '/about', name: 'About' },
  { url: '/thesis', name: 'Thesis' },
  { url: '/insights', name: 'Insights' },
  { url: '/team', name: 'Team' },
  { url: '/apply', name: 'Apply' },
  { url: '/invest', name: 'Invest' }
];

test.describe('Cross-Browser SEO Compatibility', () => {
  testPages.forEach(({ url, name }) => {
    test(`${name} page should have consistent SEO elements across browsers`, async ({ page }) => {
      await page.goto(url);

      // Check title consistency
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(60);

      // Check meta description
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
      expect(metaDescription).toBeTruthy();
      expect(metaDescription!.length).toBeGreaterThan(100);
      expect(metaDescription!.length).toBeLessThan(160);

      // Check canonical URL
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBeTruthy();

      // Check Open Graph tags
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      
      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
      expect(ogImage).toBeTruthy();

      // Check structured data
      const structuredDataScripts = await page.locator('script[type="application/ld+json"]').count();
      expect(structuredDataScripts).toBeGreaterThan(0);

      // Validate structured data JSON
      const structuredDataContent = await page.locator('script[type="application/ld+json"]').first().textContent();
      expect(() => JSON.parse(structuredDataContent!)).not.toThrow();
    });

    test(`${name} page should be accessible across browsers`, async ({ page }) => {
      await page.goto(url);

      // Check for proper heading hierarchy
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      // Check for alt text on images
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        if (src && !src.includes('data:')) {
          expect(alt).toBeTruthy();
        }
      }

      // Check for proper form labels
      const inputs = await page.locator('input[type="text"], input[type="email"], textarea').all();
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          const label = await page.locator(`label[for="${id}"]`).count();
          expect(label > 0 || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }

      // Check color contrast (basic check)
      const bodyStyles = await page.locator('body').evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      expect(bodyStyles.color).toBeTruthy();
      expect(bodyStyles.backgroundColor).toBeTruthy();
    });
  });
});

test.describe('Cross-Device Responsive Design', () => {
  const viewports = [
    { width: 375, height: 667, name: 'Mobile Portrait' },
    { width: 667, height: 375, name: 'Mobile Landscape' },
    { width: 768, height: 1024, name: 'Tablet Portrait' },
    { width: 1024, height: 768, name: 'Tablet Landscape' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ];

  testPages.forEach(({ url, name }) => {
    viewports.forEach(viewport => {
      test(`${name} page should be responsive on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(url);

        // Check that content is visible and not overflowing
        const body = await page.locator('body').boundingBox();
        expect(body).toBeTruthy();
        expect(body!.width).toBeLessThanOrEqual(viewport.width);

        // Check that navigation is accessible
        const nav = await page.locator('nav').first();
        if (await nav.count() > 0) {
          const navBox = await nav.boundingBox();
          expect(navBox).toBeTruthy();
          expect(navBox!.width).toBeLessThanOrEqual(viewport.width);
        }

        // Check that main content is visible
        const main = await page.locator('main').first();
        if (await main.count() > 0) {
          const mainBox = await main.boundingBox();
          expect(mainBox).toBeTruthy();
          expect(mainBox!.width).toBeLessThanOrEqual(viewport.width);
        }

        // Check that buttons are touch-friendly on mobile
        if (viewport.width <= 768) {
          const buttons = await page.locator('button, a[role="button"]').all();
          for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
            const buttonBox = await button.boundingBox();
            if (buttonBox) {
              expect(buttonBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
              expect(buttonBox.width).toBeGreaterThanOrEqual(44);
            }
          }
        }
      });
    });
  });
});

test.describe('Performance Across Browsers and Devices', () => {
  test('should load quickly on all browsers', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000); // 5 seconds max
  });

  test('should handle slow network conditions', async ({ page, context }) => {
    // Simulate slow 3G network
    await context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Should still load within reasonable time even on slow network
    expect(loadTime).toBeLessThan(10000); // 10 seconds max for slow network
  });
});

test.describe('SEO Functionality Across Browsers', () => {
  test('should generate proper sitemaps', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    
    const content = await page.textContent('body');
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(content).toContain('<urlset');
    expect(content).toContain('<url>');
    expect(content).toContain('<loc>');
  });

  test('should have proper robots.txt', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    
    const content = await page.textContent('body');
    expect(content).toContain('User-agent:');
    expect(content).toContain('Sitemap:');
  });

  test('should handle social media sharing', async ({ page }) => {
    await page.goto('/');

    // Check for social sharing meta tags
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
    const twitterDescription = await page.locator('meta[name="twitter:description"]').getAttribute('content');

    expect(twitterCard).toBeTruthy();
    expect(twitterTitle).toBeTruthy();
    expect(twitterDescription).toBeTruthy();

    // Check Open Graph tags
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    const ogSiteName = await page.locator('meta[property="og:site_name"]').getAttribute('content');

    expect(ogUrl).toBeTruthy();
    expect(ogType).toBeTruthy();
    expect(ogSiteName).toBeTruthy();
  });
});

test.describe('AI-Optimized Content Rendering', () => {
  testPages.forEach(({ url, name }) => {
    test(`${name} page should render AI-optimized content consistently`, async ({ page }) => {
      await page.goto(url);

      // Check for structured content that AI can parse
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      expect(headings.length).toBeGreaterThan(0);

      // Check for lists (good for AI parsing)
      const lists = await page.locator('ul, ol').count();
      expect(lists).toBeGreaterThan(0);

      // Check for clear, factual content
      const paragraphs = await page.locator('p').allTextContents();
      const hasFactualContent = paragraphs.some(p => 
        p.includes('Arena Fund') || 
        p.includes('enterprise AI') || 
        p.includes('venture capital') ||
        /\d+/.test(p) // Contains numbers/facts
      );
      expect(hasFactualContent).toBe(true);

      // Check that structured data is valid JSON
      const structuredDataElements = await page.locator('script[type="application/ld+json"]').all();
      for (const element of structuredDataElements) {
        const content = await element.textContent();
        expect(() => JSON.parse(content!)).not.toThrow();
        
        const data = JSON.parse(content!);
        expect(data).toHaveProperty('@context');
        expect(data).toHaveProperty('@type');
      }
    });
  });
});