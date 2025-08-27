import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the dependencies first
vi.mock('../../lib/security-logging', () => ({
  logSecurityEvent: vi.fn()
}));

const mockRateLimitCheck = vi.fn();
vi.mock('../../lib/rate-limit', () => ({
  rateLimit: vi.fn(() => ({
    check: mockRateLimitCheck
  }))
}));

vi.mock('../../lib/email-validation', () => ({
  validateEmail: vi.fn(),
  validateName: vi.fn()
}));

vi.mock('../../lib/input-sanitization', () => ({
  InputSanitizer: {
    sanitizeName: vi.fn((name) => name.trim()),
    sanitizeEmail: vi.fn((email) => email.toLowerCase().trim()),
    sanitizeText: vi.fn((text) => text.trim()),
    containsSuspiciousPatterns: vi.fn(() => false)
  },
  containsSuspiciousPatterns: vi.fn(() => false)
}));

// Import after mocking
const { POST, GET, DELETE } = await import('../../app/api/newsletter/subscribe/route');
const { logSecurityEvent } = await import('../../lib/security-logging');
const { validateEmail, validateName } = await import('../../lib/email-validation');

const mockLogSecurityEvent = vi.mocked(logSecurityEvent);
const mockValidateEmail = vi.mocked(validateEmail);
const mockValidateName = vi.mocked(validateName);

describe('Newsletter API Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful rate limit
    mockRateLimitCheck.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000
    });
    // Default successful email validation
    mockValidateEmail.mockResolvedValue({
      isValid: true
    });
    // Default successful name validation
    mockValidateName.mockReturnValue({
      isValid: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST Endpoint Edge Cases', () => {
    it('handles missing Content-Type header', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      // Should still work without explicit Content-Type
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('handles empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: ''
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(mockLogSecurityEvent).toHaveBeenCalledWith('INVALID_REQUEST_BODY', expect.any(Object));
    });

    it('handles null values in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: null,
          email: null
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toBeDefined();
    });

    it('handles undefined values in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: undefined,
          email: undefined
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('handles non-string values for name and email', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 123,
          email: { invalid: 'object' }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('handles extremely large request bodies', async () => {
      const largeString = 'A'.repeat(10000);
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: largeString,
          email: largeString + '@example.com'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('handles special characters in email domains', async () => {
      const testEmails = [
        'test@münchen.de',
        'test@xn--mnchen-3ya.de', // Punycode
        'test@example.co.uk',
        'test@sub.domain.example.com'
      ];

      for (const email of testEmails) {
        const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            email: email
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      }
    });

    it('handles concurrent requests to same endpoint', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `User ${i}`,
            email: `user${i}@example.com`
          })
        })
      );

      const responses = await Promise.all(requests.map(req => POST(req)));
      const data = await Promise.all(responses.map(res => res.json()));

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      data.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('GET Endpoint Edge Cases', () => {
    it('handles malformed email parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe?email=invalid-email', {
        method: 'GET'
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.subscribed).toBe(false);
    });

    it('handles URL encoded email parameter', async () => {
      const email = 'test+tag@example.com';
      const encodedEmail = encodeURIComponent(email);
      
      const request = new NextRequest(`http://localhost:3000/api/newsletter/subscribe?email=${encodedEmail}`, {
        method: 'GET'
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('handles multiple email parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe?email=first@example.com&email=second@example.com', {
        method: 'GET'
      });

      const response = await GET(request);
      const data = await response.json();

      // Should use the first email parameter
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('handles empty email parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe?email=', {
        method: 'GET'
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE Endpoint Edge Cases', () => {
    it('handles unsubscribe for email with special characters', async () => {
      // First subscribe
      const subscribeRequest = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test+tag@example.com'
        })
      });

      await POST(subscribeRequest);

      // Then unsubscribe
      const unsubscribeRequest = new NextRequest('http://localhost:3000/api/newsletter/subscribe?email=test%2Btag%40example.com', {
        method: 'DELETE'
      });

      const response = await DELETE(unsubscribeRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('handles multiple unsubscribe attempts', async () => {
      // First subscribe
      const subscribeRequest = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'multiple@example.com'
        })
      });

      await POST(subscribeRequest);

      // First unsubscribe
      const unsubscribeRequest1 = new NextRequest('http://localhost:3000/api/newsletter/subscribe?email=multiple@example.com', {
        method: 'DELETE'
      });

      const response1 = await DELETE(unsubscribeRequest1);
      const data1 = await response1.json();

      expect(response1.status).toBe(200);
      expect(data1.success).toBe(true);

      // Second unsubscribe (should still succeed)
      const unsubscribeRequest2 = new NextRequest('http://localhost:3000/api/newsletter/subscribe?email=multiple@example.com', {
        method: 'DELETE'
      });

      const response2 = await DELETE(unsubscribeRequest2);
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.success).toBe(true);
    });
  });

  describe('Security and Validation', () => {
    it('logs appropriate security events', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Security Test',
          email: `security-${Date.now()}@example.com`
        })
      });

      await POST(request);

      expect(mockLogSecurityEvent).toHaveBeenCalledWith(
        'NEWSLETTER_SUBSCRIPTION_SUCCESS',
        expect.objectContaining({
          email: expect.stringContaining('security-'),
          source: 'newsletter-form'
        })
      );
    });

    it('handles potential XSS attempts in name field', async () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert("xss")</script>'
      ];

      for (const xssAttempt of xssAttempts) {
        const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: xssAttempt,
            email: 'test@example.com'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        // Should reject malicious input
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      }
    });

    it('handles SQL injection attempts in email field', async () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users --"
      ];

      for (const sqlAttempt of sqlInjectionAttempts) {
        const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            email: sqlAttempt
          })
        });

        const response = await POST(request);
        const data = await response.json();

        // Should reject malicious input
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      }
    });

    it('handles requests with suspicious user agents', async () => {
      const suspiciousUserAgents = [
        'curl/7.68.0',
        'python-requests/2.25.1',
        'Mozilla/5.0 (compatible; Baiduspider/2.0)',
        'bot/1.0'
      ];

      for (const userAgent of suspiciousUserAgents) {
        const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent
          },
          body: JSON.stringify({
            name: 'John Doe',
            email: `test-${Date.now()}@example.com`
          })
        });

        const response = await POST(request);
        
        // Should still process legitimate requests even with suspicious user agents
        // but may log security events
        expect(response.status).toBeLessThan(500);
      }
    });
  });

  describe('Performance and Load Testing', () => {
    it('handles rapid sequential requests', async () => {
      const startTime = Date.now();
      const requests = [];

      for (let i = 0; i < 10; i++) {
        const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `User ${i}`,
            email: `rapid-${i}-${Date.now()}@example.com`
          })
        });

        requests.push(POST(request));
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // All requests should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('handles large batch of concurrent requests', async () => {
      const batchSize = 20;
      const requests = Array.from({ length: batchSize }, (_, i) => 
        new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `Batch User ${i}`,
            email: `batch-${i}-${Date.now()}@example.com`
          })
        })
      );

      const startTime = Date.now();
      const responses = await Promise.allSettled(requests.map(req => POST(req)));
      const endTime = Date.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds

      // Most requests should succeed (some might be rate limited)
      const successfulResponses = responses.filter(result => 
        result.status === 'fulfilled'
      );

      expect(successfulResponses.length).toBeGreaterThan(batchSize * 0.5); // At least 50% success
    });
  });
});