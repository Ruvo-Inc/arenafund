/**
 * Integration tests for Local SEO API routes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '../../app/api/seo/local/route';

describe('Local SEO API Integration', () => {
  const baseUrl = 'http://localhost:3000/api/seo/local';

  describe('GET endpoints', () => {
    it('should return available locations', async () => {
      const request = new NextRequest(`${baseUrl}?action=locations`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data[0]).toHaveProperty('city');
      expect(data.data[0]).toHaveProperty('state');
      expect(data.data[0]).toHaveProperty('country');
    });

    it('should return available industry verticals', async () => {
      const request = new NextRequest(`${baseUrl}?action=verticals`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data[0]).toHaveProperty('name');
      expect(data.data[0]).toHaveProperty('keywords');
      expect(data.data[0]).toHaveProperty('description');
    });

    it('should generate location keywords', async () => {
      const keywords = 'venture capital,AI investment';
      const location = 'San Francisco, California';
      const request = new NextRequest(`${baseUrl}?action=location-keywords&keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data.some((k: string) => k.includes('San Francisco'))).toBe(true);
    });

    it('should return error for invalid location', async () => {
      const keywords = 'venture capital';
      const location = 'Invalid Location';
      const request = new NextRequest(`${baseUrl}?action=location-keywords&keywords=${keywords}&location=${encodeURIComponent(location)}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Location not found');
    });

    it('should generate industry keywords', async () => {
      const request = new NextRequest(`${baseUrl}?action=industry-keywords`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data.some((k: string) => k.includes('AI'))).toBe(true);
    });

    it('should generate local business schema', async () => {
      const location = 'San Francisco, California';
      const request = new NextRequest(`${baseUrl}?action=local-schema&location=${encodeURIComponent(location)}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('@context', 'https://schema.org');
      expect(data.data).toHaveProperty('@type', 'FinancialService');
      expect(data.data).toHaveProperty('name', 'Arena Fund');
      expect(data.data.address.addressLocality).toBe('San Francisco');
    });

    it('should generate industry-specific schema', async () => {
      const vertical = 'Enterprise AI Software';
      const request = new NextRequest(`${baseUrl}?action=industry-schema&vertical=${encodeURIComponent(vertical)}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('@context', 'https://schema.org');
      expect(data.data).toHaveProperty('@type', 'FinancialService');
      expect(data.data.name).toContain('Enterprise AI Software');
      expect(data.data.serviceType).toContain('Enterprise AI Software');
    });

    it('should generate performance rankings report', async () => {
      const request = new NextRequest(`${baseUrl}?action=rankings&timeframe=monthly`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('reportDate');
      expect(data.data).toHaveProperty('timeframe', 'monthly');
      expect(data.data).toHaveProperty('localMetrics');
      expect(data.data).toHaveProperty('industryMetrics');
      expect(data.data).toHaveProperty('recommendations');
    });

    it('should export performance data in JSON format', async () => {
      const request = new NextRequest(`${baseUrl}?action=export&format=json`);
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Content-Disposition')).toContain('local-seo-data.json');
    });

    it('should export performance data in CSV format', async () => {
      const request = new NextRequest(`${baseUrl}?action=export&format=csv`);
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/csv');
      expect(response.headers.get('Content-Disposition')).toContain('local-seo-data.csv');
    });

    it('should return error for invalid action', async () => {
      const request = new NextRequest(`${baseUrl}?action=invalid`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid action parameter');
    });
  });

  describe('POST endpoints', () => {
    it('should optimize content for location', async () => {
      const requestBody = {
        action: 'optimize-location',
        content: 'This is test content about venture capital and AI investment.',
        location: 'San Francisco, California',
        keywords: ['venture capital', 'AI investment']
      };

      const request = new NextRequest(baseUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('optimizedContent');
      expect(data.data).toHaveProperty('suggestions');
      expect(data.data).toHaveProperty('addedKeywords');
      expect(data.data).toHaveProperty('structuredData');
      expect(Array.isArray(data.data.suggestions)).toBe(true);
    });

    it('should return error for missing content in location optimization', async () => {
      const requestBody = {
        action: 'optimize-location',
        location: 'San Francisco, California'
        // Missing content
      };

      const request = new NextRequest(baseUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Content and location are required');
    });

    it('should optimize content for industry', async () => {
      const requestBody = {
        action: 'optimize-industry',
        content: 'This is test content about enterprise AI software solutions.',
        vertical: 'Enterprise AI Software'
      };

      const request = new NextRequest(baseUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('optimizedContent');
      expect(data.data).toHaveProperty('suggestions');
      expect(data.data).toHaveProperty('addedKeywords');
      expect(data.data).toHaveProperty('structuredData');
    });

    it('should return error for invalid industry vertical', async () => {
      const requestBody = {
        action: 'optimize-industry',
        content: 'Test content',
        vertical: 'Invalid Vertical'
      };

      const request = new NextRequest(baseUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Industry vertical not found');
    });

    it('should generate SEO metadata', async () => {
      const requestBody = {
        action: 'generate-metadata',
        title: 'Test Page Title',
        description: 'Test page description',
        url: '/test-page',
        location: 'San Francisco, California',
        vertical: 'Enterprise AI Software'
      };

      const request = new NextRequest(baseUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('title');
      expect(data.data).toHaveProperty('description');
      expect(data.data).toHaveProperty('keywords');
      expect(data.data).toHaveProperty('structuredData');
      expect(data.data.title).toContain('San Francisco');
      expect(data.data.title).toContain('Enterprise AI Software');
    });

    it('should return error for missing required metadata fields', async () => {
      const requestBody = {
        action: 'generate-metadata',
        title: 'Test Title'
        // Missing description and url
      };

      const request = new NextRequest(baseUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Title, description, and URL are required');
    });

    it('should track rankings for keywords and locations', async () => {
      const requestBody = {
        action: 'track-rankings',
        keywords: ['AI venture capital', 'startup funding'],
        locations: ['San Francisco, CA', 'New York, NY'],
        industries: ['Enterprise AI Software']
      };

      const request = new NextRequest(baseUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('localRankings');
      expect(data.data).toHaveProperty('industryRankings');
      expect(Array.isArray(data.data.localRankings)).toBe(true);
      expect(Array.isArray(data.data.industryRankings)).toBe(true);
    });

    it('should generate performance report', async () => {
      const requestBody = {
        action: 'generate-report',
        timeframe: 'weekly'
      };

      const request = new NextRequest(baseUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('reportDate');
      expect(data.data).toHaveProperty('timeframe');
      expect(data.data).toHaveProperty('localMetrics');
      expect(data.data).toHaveProperty('industryMetrics');
    });

    it('should return error for invalid POST action', async () => {
      const requestBody = {
        action: 'invalid-action'
      };

      const request = new NextRequest(baseUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid action parameter');
    });
  });

  describe('PUT endpoints', () => {
    it('should update location configuration', async () => {
      const requestBody = {
        action: 'update-location-config',
        locations: ['San Francisco, CA', 'New York, NY'],
        enabled: true
      };

      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Location configuration updated');
      expect(data.data.locations).toEqual(['San Francisco, CA', 'New York, NY']);
      expect(data.data.enabled).toBe(true);
    });

    it('should update industry configuration', async () => {
      const requestBody = {
        action: 'update-industry-config',
        verticals: ['Enterprise AI Software', 'AI-Powered Analytics'],
        enabled: true
      };

      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Industry configuration updated');
      expect(data.data.verticals).toEqual(['Enterprise AI Software', 'AI-Powered Analytics']);
      expect(data.data.enabled).toBe(true);
    });

    it('should return error for invalid PUT action', async () => {
      const requestBody = {
        action: 'invalid-action'
      };

      const request = new NextRequest(baseUrl, {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid action parameter');
    });
  });

  describe('DELETE endpoints', () => {
    it('should clear ranking data', async () => {
      const request = new NextRequest(`${baseUrl}?action=clear-rankings`, {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Ranking data cleared');
    });

    it('should clear report data', async () => {
      const request = new NextRequest(`${baseUrl}?action=clear-reports`, {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Report data cleared');
    });

    it('should return error for invalid DELETE action', async () => {
      const request = new NextRequest(`${baseUrl}?action=invalid`, {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid action parameter');
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const request = new NextRequest(baseUrl, {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle missing request body in POST requests', async () => {
      const request = new NextRequest(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });
  });
});