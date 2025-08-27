/**
 * Newsletter Email Core Functionality Tests
 * 
 * Focused tests for the core email notification functionality without complex mocking.
 */

import { describe, it, expect } from 'vitest';
import { 
  createArticleEmailTemplate,
  generateUnsubscribeUrl,
  NEWSLETTER_CONFIG,
  type ArticleNotification 
} from '@/lib/newsletter-email';
import { 
  validateSubscriberData,
  hashIPAddress,
  generateUnsubscribeToken,
  NEWSLETTER_SCHEMA_RULES,
  type NewsletterSubscriber 
} from '@/lib/newsletter-db-schema';
import { 
  generateWelcomeTemplate, 
  generateTestTemplate,
  generateUnsubscribeConfirmationTemplate,
  validateTemplate 
} from '@/lib/newsletter-templates';

// Test data
const mockSubscriber: NewsletterSubscriber = {
  id: 'test-subscriber-123',
  name: 'Test User',
  email: 'test@example.com',
  status: 'active',
  subscribedAt: new Date() as any,
  source: 'test',
  metadata: {
    lastUpdated: new Date() as any,
    userAgent: 'Test Agent',
    ipAddress: '127.0.0.1'
  },
  unsubscribeToken: 'a'.repeat(64) // 64 character hex string
};

const mockArticle: ArticleNotification = {
  articleId: 'test-article-123',
  title: 'Test Article: Investment Strategies',
  excerpt: 'This is a comprehensive guide to modern investment strategies that every investor should know.',
  slug: 'test-investment-strategies',
  publishDate: '2024-01-15',
  category: 'Investment Strategy',
  author: 'Arena Fund Team',
  readTimeMinutes: 5
};

describe('Newsletter Email Core Functionality', () => {
  describe('Configuration', () => {
    it('should have valid newsletter configuration', () => {
      expect(NEWSLETTER_CONFIG.FROM_NAME).toBe('Arena Fund Insights');
      expect(NEWSLETTER_CONFIG.BATCH_SIZE).toBeGreaterThan(0);
      expect(NEWSLETTER_CONFIG.RETRY_ATTEMPTS).toBeGreaterThan(0);
      expect(NEWSLETTER_CONFIG.BASE_URL).toBeDefined();
    });
  });

  describe('Email Template Generation', () => {
    it('should generate complete article email template', () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      
      // Subject validation
      expect(template.subject).toBe('New Insight: Test Article: Investment Strategies');
      
      // HTML content validation
      expect(template.htmlContent).toContain('<!DOCTYPE html>');
      expect(template.htmlContent).toContain('<html lang="en">');
      expect(template.htmlContent).toContain('<meta name="viewport"');
      expect(template.htmlContent).toContain(mockArticle.title);
      expect(template.htmlContent).toContain(mockArticle.excerpt);
      expect(template.htmlContent).toContain(mockSubscriber.name);
      expect(template.htmlContent).toContain('Arena Fund Insights');
      expect(template.htmlContent).toContain('Read Full Article');
      expect(template.htmlContent).toContain('Unsubscribe');
      
      // Text content validation
      expect(template.textContent).toContain(mockArticle.title);
      expect(template.textContent).toContain(mockArticle.excerpt);
      expect(template.textContent).toContain(mockSubscriber.name);
      expect(template.textContent).toContain('Arena Fund Insights');
      
      // Unsubscribe URL validation
      expect(template.unsubscribeUrl).toContain('/api/newsletter/unsubscribe');
      expect(template.unsubscribeUrl).toContain(mockSubscriber.unsubscribeToken);
      expect(template.unsubscribeUrl).toContain(encodeURIComponent(mockSubscriber.email));
    });

    it('should handle subscriber without name', () => {
      const subscriberWithoutName = { ...mockSubscriber, name: '' };
      const template = createArticleEmailTemplate(mockArticle, subscriberWithoutName);
      
      expect(template.htmlContent).toContain('Hi there,');
      expect(template.textContent).toContain('Hi there,');
    });

    it('should include all article metadata', () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      
      expect(template.htmlContent).toContain(mockArticle.category);
      expect(template.htmlContent).toContain(mockArticle.publishDate);
      expect(template.htmlContent).toContain(`${mockArticle.readTimeMinutes} min read`);
      expect(template.htmlContent).toContain(`/insights/${mockArticle.slug}`);
    });
  });

  describe('Unsubscribe URL Generation', () => {
    it('should generate secure unsubscribe URL', () => {
      const url = generateUnsubscribeUrl(mockSubscriber);
      
      expect(url).toContain(NEWSLETTER_CONFIG.BASE_URL);
      expect(url).toContain('/api/newsletter/unsubscribe');
      expect(url).toContain(`token=${mockSubscriber.unsubscribeToken}`);
      expect(url).toContain(`email=${encodeURIComponent(mockSubscriber.email)}`);
    });

    it('should handle special characters in email addresses', () => {
      const subscriberWithSpecialEmail = {
        ...mockSubscriber,
        email: 'test+newsletter@example.com'
      };
      
      const url = generateUnsubscribeUrl(subscriberWithSpecialEmail);
      expect(url).toContain(encodeURIComponent('test+newsletter@example.com'));
    });
  });

  describe('Template Validation', () => {
    it('should generate valid HTML structure', () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      
      // Check HTML structure
      expect(template.htmlContent).toMatch(/<!DOCTYPE html>/);
      expect(template.htmlContent).toMatch(/<html[^>]*>/);
      expect(template.htmlContent).toMatch(/<head>/);
      expect(template.htmlContent).toMatch(/<meta charset="UTF-8">/);
      expect(template.htmlContent).toMatch(/<meta name="viewport"/);
      expect(template.htmlContent).toMatch(/<body>/);
      expect(template.htmlContent).toMatch(/<\/html>/);
    });

    it('should be mobile responsive', () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      
      expect(template.htmlContent).toContain('@media (max-width: 600px)');
      expect(template.htmlContent).toContain('width: 100% !important');
    });

    it('should be accessible', () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      
      expect(template.htmlContent).toMatch(/lang="en"/);
      expect(template.htmlContent).toMatch(/color:\s*#[0-9a-f]{3,6}/i);
    });

    it('should be secure', () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      
      // Should not contain dangerous content
      expect(template.htmlContent).not.toContain('<script');
      expect(template.htmlContent).not.toContain('javascript:');
      expect(template.htmlContent).not.toContain('onclick=');
      expect(template.textContent).not.toContain('<script');
    });
  });

  describe('Welcome Email Template', () => {
    it('should generate welcome email template', () => {
      const unsubscribeUrl = generateUnsubscribeUrl(mockSubscriber);
      const template = generateWelcomeTemplate(mockSubscriber, unsubscribeUrl);
      
      expect(template.subject).toContain('Welcome to Arena Fund Insights');
      expect(template.html).toContain(mockSubscriber.name);
      expect(template.html).toContain('Welcome to Arena Fund Insights');
      expect(template.html).toContain('Browse Our Latest Insights');
      expect(template.text).toContain(mockSubscriber.name);
      expect(template.text).toContain('Welcome to Arena Fund Insights');
    });
  });

  describe('Test Email Template', () => {
    it('should generate test email template', () => {
      const template = generateTestTemplate('test@example.com', 'Test message');
      
      expect(template.subject).toContain('Newsletter Test Email');
      expect(template.html).toContain('Newsletter System Test');
      expect(template.html).toContain('test@example.com');
      expect(template.html).toContain('Test message');
      expect(template.text).toContain('Newsletter System Test');
      expect(template.text).toContain('test@example.com');
    });
  });

  describe('Unsubscribe Confirmation Template', () => {
    it('should generate unsubscribe confirmation template', () => {
      const template = generateUnsubscribeConfirmationTemplate(mockSubscriber);
      
      expect(template.subject).toContain('unsubscribed');
      expect(template.html).toContain(mockSubscriber.name);
      expect(template.html).toContain('unsubscribed');
      expect(template.text).toContain(mockSubscriber.name);
      expect(template.text).toContain('unsubscribed');
    });
  });

  describe('Template Validation Function', () => {
    it('should validate complete templates', () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      
      // Convert to the format expected by validateTemplate
      const templateForValidation = {
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent
      };
      
      const validation = validateTemplate(templateForValidation);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const incompleteTemplate = {
        subject: '',
        html: 'test',
        text: 'test'
      };
      
      const validation = validateTemplate(incompleteTemplate);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Subject is required');
    });
  });

  describe('Database Schema Validation', () => {
    it('should validate valid subscriber data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active' as const,
        source: 'newsletter-form'
      };
      
      const validation = validateSubscriberData(validData);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid email formats', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        status: 'active' as const,
        source: 'newsletter-form'
      };
      
      const validation = validateSubscriberData(invalidData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid email format');
    });

    it('should reject invalid names', () => {
      const invalidData = {
        name: '', // Empty name
        email: 'john@example.com',
        status: 'active' as const,
        source: 'newsletter-form'
      };
      
      const validation = validateSubscriberData(invalidData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Name is required');
    });

    it('should validate schema rules', () => {
      expect(NEWSLETTER_SCHEMA_RULES.name.required).toBe(true);
      expect(NEWSLETTER_SCHEMA_RULES.email.unique).toBe(true);
      expect(NEWSLETTER_SCHEMA_RULES.status.enum).toContain('active');
      expect(NEWSLETTER_SCHEMA_RULES.status.enum).toContain('unsubscribed');
      expect(NEWSLETTER_SCHEMA_RULES.status.enum).toContain('bounced');
    });
  });

  describe('Security Functions', () => {
    it('should hash IP addresses securely', () => {
      const ip = '192.168.1.1';
      const hash1 = hashIPAddress(ip);
      const hash2 = hashIPAddress(ip);
      
      expect(hash1).toBe(hash2); // Should be consistent
      expect(hash1).toHaveLength(16); // Should be truncated to 16 chars
      expect(hash1).toMatch(/^[a-f0-9]{16}$/); // Should be hex
      expect(hash1).not.toBe(ip); // Should be different from original
    });

    it('should generate secure unsubscribe tokens', () => {
      const token1 = generateUnsubscribeToken();
      const token2 = generateUnsubscribeToken();
      
      expect(token1).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2); // Should be unique
      expect(token1).toMatch(/^[a-f0-9]{64}$/i); // Should be hex
    });
  });

  describe('Production Readiness', () => {
    it('should have proper error handling structure', () => {
      // Test that functions return proper error structures
      const validation = validateSubscriberData({});
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(Array.isArray(validation.errors)).toBe(true);
    });

    it('should have consistent configuration', () => {
      expect(typeof NEWSLETTER_CONFIG.FROM_NAME).toBe('string');
      expect(typeof NEWSLETTER_CONFIG.BATCH_SIZE).toBe('number');
      expect(typeof NEWSLETTER_CONFIG.RETRY_ATTEMPTS).toBe('number');
      expect(typeof NEWSLETTER_CONFIG.BASE_URL).toBe('string');
    });

    it('should handle edge cases in template generation', () => {
      // Test with minimal article data
      const minimalArticle: ArticleNotification = {
        articleId: 'test',
        title: 'Test',
        excerpt: 'Test excerpt',
        slug: 'test',
        publishDate: '2024-01-01',
        category: 'Test'
      };
      
      const template = createArticleEmailTemplate(minimalArticle, mockSubscriber);
      
      expect(template.subject).toBeDefined();
      expect(template.htmlContent).toBeDefined();
      expect(template.textContent).toBeDefined();
      expect(template.unsubscribeUrl).toBeDefined();
    });
  });
});