import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, OPTIONS } from '@/app/api/newsletter/subscribe/route';
import { validateEmail, validateName, sanitizeInput } from '@/lib/email-validation';
import { InputSanitizer, containsSuspiciousPatterns } from '@/lib/input-sanitization';
import { verifyCSRFToken, generateCSRFToken } from '@/lib/csrf-protection';

// Mock Firebase Admin
const mockFirestore = {
  collection: () => ({
    where: () => ({
      limit: () => ({
        get: () => Promise.resolve({ empty: true, docs: [] })
      })
    }),
    add: () => Promise.resolve({ id: 'test-doc-id' })
  })
};

vi.mock('@/lib/firebase-admin', () => ({
  getAdminDb: () => mockFirestore
}));

// Mock security logging
vi.mock('@/lib/security-logging', () => ({
  logSecurityEvent: vi.fn()
}));

// Mock consent tracking
vi.mock('@/lib/consent-tracking', () => ({
  recordConsent: vi.fn().mockResolvedValue(true)
}));

describe('Newsletter Security Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Input Sanitization', () => {
    it('should sanitize basic input correctly', () => {
      const input = '  John Doe  ';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('John Doe');
    });

    it('should remove control characters', () => {
      const input = 'John\x00\x01Doe\x7f';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('JohnDoe');
    });

    it('should remove zero-width characters', () => {
      const input = 'John\u200BDoe\uFEFF';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('JohnDoe');
    });

    it('should limit input length', () => {
      const input = 'a'.repeat(300);
      const sanitized = sanitizeInput(input);
      expect(sanitized.length).toBe(254);
    });
  });

  describe('Name Validation', () => {
    it('should validate correct names', () => {
      const validNames = [
        'John Doe',
        'Mary-Jane Smith',
        "O'Connor",
        'José García',
        'Dr. Smith Jr.'
      ];

      validNames.forEach(name => {
        const result = validateName(name);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject names with suspicious characters', () => {
      const invalidNames = [
        'John<script>alert(1)</script>',
        'user@domain.com',
        'John123',
        'SELECT * FROM users',
        'javascript:alert(1)',
        'John$$$$$$'
      ];

      invalidNames.forEach(name => {
        const result = validateName(name);
        expect(result.isValid).toBe(false);
      });
    });

    it('should reject names that are too short or too long', () => {
      expect(validateName('J').isValid).toBe(false);
      expect(validateName('a'.repeat(101)).isValid).toBe(false);
    });

    it('should reject names with repeated characters', () => {
      const result = validateName('Johnnnnnn');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct emails', async () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com'
      ];

      for (const email of validEmails) {
        const result = await validateEmail(email);
        expect(result.isValid).toBe(true);
      }
    });

    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        'user@.domain.com',
        'user@domain.com.',
        'a'.repeat(65) + '@domain.com', // Local part too long
        'user@' + 'a'.repeat(254) + '.com' // Domain too long
      ];

      for (const email of invalidEmails) {
        const result = await validateEmail(email);
        expect(result.isValid).toBe(false);
      }
    });

    it('should reject disposable email domains', async () => {
      const disposableEmails = [
        'user@10minutemail.com',
        'test@tempmail.org',
        'spam@guerrillamail.com'
      ];

      for (const email of disposableEmails) {
        const result = await validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('Disposable email addresses are not allowed');
      }
    });

    it('should suggest corrections for common typos', async () => {
      const typoEmails = [
        'user@gmial.com', // Should suggest gmail.com
        'test@yahooo.com', // Should suggest yahoo.com
        'user@hotmial.com' // Should suggest hotmail.com
      ];

      for (const email of typoEmails) {
        const result = await validateEmail(email);
        expect(result.suggestions).toBeDefined();
        expect(result.suggestions!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Suspicious Pattern Detection', () => {
    it('should detect XSS attempts', () => {
      const xssInputs = [
        '<script>alert(1)</script>',
        'javascript:alert(1)',
        'vbscript:msgbox(1)',
        'data:text/html,<script>alert(1)</script>',
        'onload=alert(1)',
        '<iframe src="javascript:alert(1)"></iframe>'
      ];

      xssInputs.forEach(input => {
        expect(containsSuspiciousPatterns(input)).toBe(true);
      });
    });

    it('should detect SQL injection attempts', () => {
      const sqlInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "UNION SELECT * FROM users",
        "'; INSERT INTO users VALUES ('hacker'); --",
        "admin'--",
        "' OR 1=1 --"
      ];

      sqlInputs.forEach(input => {
        expect(containsSuspiciousPatterns(input)).toBe(true);
      });
    });

    it('should allow safe input', () => {
      const safeInputs = [
        'John Doe',
        'user@example.com',
        'This is a normal message',
        'Company Name Inc.',
        'Phone: (555) 123-4567'
      ];

      safeInputs.forEach(input => {
        expect(containsSuspiciousPatterns(input)).toBe(false);
      });
    });
  });

  describe('InputSanitizer Class', () => {
    it('should sanitize text with HTML removal', () => {
      const input = '<p>Hello <script>alert(1)</script> World</p>';
      const sanitized = InputSanitizer.sanitizeText(input, { allowHTML: false });
      expect(sanitized).toBe('Hello  World');
    });

    it('should sanitize text with safe HTML allowed', () => {
      const input = '<p>Hello <strong>World</strong></p><script>alert(1)</script>';
      const sanitized = InputSanitizer.sanitizeText(input, { allowHTML: true });
      expect(sanitized).toContain('<strong>World</strong>');
      expect(sanitized).not.toContain('<script>');
    });

    it('should sanitize email input', () => {
      const input = '  USER@EXAMPLE.COM<script>alert(1)</script>  ';
      const sanitized = InputSanitizer.sanitizeEmail(input);
      expect(sanitized).toBe('user@example.com');
    });

    it('should sanitize name input', () => {
      const input = '  John <script>alert(1)</script> Doe  ';
      const sanitized = InputSanitizer.sanitizeName(input);
      expect(sanitized).toBe('John  Doe');
    });
  });

  describe('CSRF Protection', () => {
    it('should generate valid CSRF tokens', () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'user-agent': 'test-agent',
          'x-forwarded-for': '127.0.0.1'
        }
      });

      const token = generateCSRFToken(mockRequest);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should verify valid CSRF tokens', () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'user-agent': 'test-agent',
          'x-forwarded-for': '127.0.0.1'
        }
      });

      const token = generateCSRFToken(mockRequest);
      const isValid = verifyCSRFToken(token, mockRequest);
      expect(isValid).toBe(true);
    });

    it('should reject invalid CSRF tokens', () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'user-agent': 'test-agent',
          'x-forwarded-for': '127.0.0.1'
        }
      });

      const invalidTokens = [
        'invalid-token',
        '',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
        generateCSRFToken(mockRequest) + 'tampered'
      ];

      invalidTokens.forEach(token => {
        const isValid = verifyCSRFToken(token, mockRequest);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('API Security Integration', () => {
    it('should handle OPTIONS request for CSRF token', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'OPTIONS',
        headers: {
          'user-agent': 'test-agent',
          'x-forwarded-for': '127.0.0.1'
        }
      });

      const response = await OPTIONS(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.csrfToken).toBeDefined();
    });

    it('should reject requests with suspicious input', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-agent',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          name: '<script>alert(1)</script>',
          email: 'user@example.com'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('SUSPICIOUS_INPUT');
    });

    it('should reject requests with invalid email', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-agent',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'invalid-email'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('INVALID_EMAIL');
    });

    it('should reject requests with invalid name', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-agent',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          name: 'J',
          email: 'user@example.com'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('INVALID_NAME');
    });

    it('should handle oversized requests', async () => {
      const largeBody = JSON.stringify({
        name: 'a'.repeat(5000),
        email: 'user@example.com'
      });

      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-agent',
          'x-forwarded-for': '127.0.0.1'
        },
        body: largeBody
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('INVALID_REQUEST');
    });

    it('should accept valid subscription request', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-agent',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john.doe@example.com',
          source: 'newsletter-form'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.subscriptionId).toBeDefined();
    });
  });

  describe('Rate Limiting Security', () => {
    it('should apply rate limiting after multiple requests', async () => {
      const requests = Array.from({ length: 6 }, (_, i) => 
        new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'user-agent': 'test-agent',
            'x-forwarded-for': '127.0.0.1'
          },
          body: JSON.stringify({
            name: `User ${i}`,
            email: `user${i}@example.com`
          })
        })
      );

      // First 5 requests should succeed or fail for other reasons
      for (let i = 0; i < 5; i++) {
        const response = await POST(requests[i]);
        expect(response.status).not.toBe(429);
      }

      // 6th request should be rate limited
      const response = await POST(requests[5]);
      expect(response.status).toBe(429);
      
      const data = await response.json();
      expect(data.error).toBe('RATE_LIMITED');
    });
  });
});