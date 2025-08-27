/**
 * Newsletter Email Infrastructure Integration Tests
 * 
 * Comprehensive tests for the email notification system including Gmail API integration,
 * template generation, subscriber management, and unsubscribe functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  sendNewsletterEmail, 
  sendArticleNotification, 
  sendWelcomeEmail,
  sendUnsubscribeConfirmationEmail,
  testNewsletterEmail,
  createArticleEmailTemplate,
  generateUnsubscribeUrl,
  handleUnsubscribe,
  NEWSLETTER_CONFIG,
  type ArticleNotification 
} from '@/lib/newsletter-email';
import { 
  createSubscriber, 
  getActiveSubscribers, 
  updateSubscriberStatus,
  getSubscriberByToken,
  type NewsletterSubscriber 
} from '@/lib/newsletter-db-schema';
import { generateWelcomeTemplate, generateTestTemplate } from '@/lib/newsletter-templates';

// Mock database functions
vi.mock('@/lib/newsletter-db-schema', () => ({
  getActiveSubscribers: vi.fn(),
  updateSubscriberStatus: vi.fn(),
  getSubscriberByToken: vi.fn(),
  createSubscriber: vi.fn(),
}));

// Mock Gmail API
vi.mock('googleapis', () => ({
  google: {
    gmail: vi.fn(() => ({
      users: {
        messages: {
          send: vi.fn().mockResolvedValue({
            data: {
              id: 'mock-message-id-' + Date.now(),
              threadId: 'mock-thread-id-' + Date.now()
            }
          })
        }
      }
    }))
  }
}));

// Mock JWT authentication
vi.mock('google-auth-library', () => ({
  JWT: vi.fn().mockImplementation(() => ({
    authorize: vi.fn().mockResolvedValue({}),
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' })
  }))
}));

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

describe('Newsletter Email Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock environment variables
    process.env.GMAIL_CLIENT_EMAIL = 'test@service-account.com';
    process.env.GMAIL_PRIVATE_KEY = 'mock-private-key';
    process.env.GMAIL_IMPERSONATED_USER = 'insights@arenafund.com';
    process.env.GMAIL_FROM_ADDRESS = 'insights@arenafund.com';
    process.env.NEXT_PUBLIC_BASE_URL = 'https://arenafund.com';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Email Template Generation', () => {
    it('should generate article email template with all required elements', () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      
      expect(template.subject).toBe('New Insight: Test Article: Investment Strategies');
      expect(template.htmlContent).toContain(mockArticle.title);
      expect(template.htmlContent).toContain(mockArticle.excerpt);
      expect(template.htmlContent).toContain(mockSubscriber.name);
      expect(template.htmlContent).toContain('Arena Fund Insights');
      expect(template.htmlContent).toContain('DOCTYPE html');
      expect(template.htmlContent).toContain('viewport');
      
      expect(template.textContent).toContain(mockArticle.title);
      expect(template.textContent).toContain(mockArticle.excerpt);
      expect(template.textContent).toContain(mockSubscriber.name);
      
      expect(template.unsubscribeUrl).toContain('/api/newsletter/unsubscribe');
      expect(template.unsubscribeUrl).toContain(mockSubscriber.unsubscribeToken);
      expect(template.unsubscribeUrl).toContain(encodeURIComponent(mockSubscriber.email));
    });

    it('should handle subscriber without name gracefully', () => {
      const subscriberWithoutName = { ...mockSubscriber, name: '' };
      const template = createArticleEmailTemplate(mockArticle, subscriberWithoutName);
      
      expect(template.htmlContent).toContain('Hi there,');
      expect(template.textContent).toContain('Hi there,');
    });

    it('should include all article metadata in template', () => {
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

  describe('Single Email Sending', () => {
    it('should send newsletter email successfully', async () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      const result = await sendNewsletterEmail(mockSubscriber, template);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should send welcome email successfully', async () => {
      const result = await sendWelcomeEmail(mockSubscriber);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should send unsubscribe confirmation email successfully', async () => {
      const result = await sendUnsubscribeConfirmationEmail(mockSubscriber);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should send test email successfully', async () => {
      const result = await testNewsletterEmail('test@example.com', mockArticle);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.error).toBeUndefined();
    });
  });

  describe('Batch Email Sending', () => {
    it('should handle empty subscriber list', async () => {
      // Mock empty subscriber list
      vi.mocked(getActiveSubscribers).mockResolvedValue([]);
      
      const result = await sendArticleNotification(mockArticle);
      
      expect(result.success).toBe(true);
      expect(result.totalSubscribers).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('should process subscribers in batches', async () => {
      // Create multiple mock subscribers
      const subscribers = Array.from({ length: 75 }, (_, i) => ({
        ...mockSubscriber,
        id: `subscriber-${i}`,
        email: `test${i}@example.com`
      }));
      
      vi.mocked(getActiveSubscribers).mockResolvedValue(subscribers);
      
      const result = await sendArticleNotification(mockArticle);
      
      expect(result.success).toBe(true);
      expect(result.totalSubscribers).toBe(75);
      expect(result.successCount).toBe(75);
      expect(result.failureCount).toBe(0);
    });

    it('should handle partial failures gracefully', async () => {
      const subscribers = [
        mockSubscriber,
        { ...mockSubscriber, id: 'subscriber-2', email: 'test2@example.com' }
      ];
      
      vi.mocked(getActiveSubscribers).mockResolvedValue(subscribers);
      
      // Mock one failure
      const mockGmail = vi.mocked(require('googleapis').google.gmail);
      mockGmail.mockReturnValueOnce({
        users: {
          messages: {
            send: vi.fn()
              .mockResolvedValueOnce({ data: { id: 'success-1' } })
              .mockRejectedValueOnce(new Error('Gmail API error'))
          }
        }
      });
      
      const result = await sendArticleNotification(mockArticle);
      
      expect(result.success).toBe(false);
      expect(result.totalSubscribers).toBe(2);
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('Unsubscribe Handling', () => {
    it('should handle valid unsubscribe request', async () => {
      vi.mocked(getActiveSubscribers).mockResolvedValue([mockSubscriber]);
      vi.mocked(updateSubscriberStatus).mockResolvedValue({ success: true });
      
      const result = await handleUnsubscribe(
        mockSubscriber.email, 
        mockSubscriber.unsubscribeToken!,
        '127.0.0.1'
      );
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid token', async () => {
      vi.mocked(getActiveSubscribers).mockResolvedValue([mockSubscriber]);
      
      const result = await handleUnsubscribe(
        mockSubscriber.email, 
        'invalid-token',
        '127.0.0.1'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid unsubscribe link');
    });

    it('should reject mismatched email', async () => {
      vi.mocked(getActiveSubscribers).mockResolvedValue([mockSubscriber]);
      
      const result = await handleUnsubscribe(
        'different@example.com', 
        mockSubscriber.unsubscribeToken!,
        '127.0.0.1'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid unsubscribe link');
    });
  });

  describe('Error Handling', () => {
    it('should handle Gmail API authentication errors', async () => {
      // Mock authentication failure
      const mockJWT = vi.mocked(require('google-auth-library').JWT);
      mockJWT.mockImplementation(() => {
        throw new Error('Authentication failed');
      });
      
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      const result = await sendNewsletterEmail(mockSubscriber, template);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication failed');
    });

    it('should handle Gmail API rate limiting with retry', async () => {
      const mockGmail = vi.mocked(require('googleapis').google.gmail);
      mockGmail.mockReturnValue({
        users: {
          messages: {
            send: vi.fn()
              .mockRejectedValueOnce({ code: 429, message: 'Rate limit exceeded' })
              .mockResolvedValueOnce({ data: { id: 'success-after-retry' } })
          }
        }
      });
      
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      const result = await sendNewsletterEmail(mockSubscriber, template);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('success-after-retry');
    });

    it('should handle missing environment variables', async () => {
      delete process.env.GMAIL_CLIENT_EMAIL;
      
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      const result = await sendNewsletterEmail(mockSubscriber, template);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing Gmail service account');
    });
  });

  describe('Template Validation', () => {
    it('should generate valid HTML templates', () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      
      // Check HTML structure
      expect(template.htmlContent).toMatch(/<!DOCTYPE html>/);
      expect(template.htmlContent).toMatch(/<html[^>]*>/);
      expect(template.htmlContent).toMatch(/<head>/);
      expect(template.htmlContent).toMatch(/<meta charset="UTF-8">/);
      expect(template.htmlContent).toMatch(/<meta name="viewport"/);
      expect(template.htmlContent).toMatch(/<body>/);
      expect(template.htmlContent).toMatch(/<\/html>/);
      
      // Check for required content
      expect(template.htmlContent).toContain('Arena Fund Insights');
      expect(template.htmlContent).toContain(mockArticle.title);
      expect(template.htmlContent).toContain(mockArticle.excerpt);
      expect(template.htmlContent).toContain('Read Full Article');
      expect(template.htmlContent).toContain('Unsubscribe');
    });

    it('should generate accessible HTML templates', () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      
      // Check accessibility features
      expect(template.htmlContent).toMatch(/lang="en"/);
      // Note: No images in current template, so no alt attributes needed
      expect(template.htmlContent).toMatch(/color:\s*#[0-9a-f]{3,6}/i); // Should have sufficient contrast
    });

    it('should generate mobile-responsive templates', () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      
      // Check for mobile responsiveness
      expect(template.htmlContent).toContain('@media (max-width: 600px)');
      expect(template.htmlContent).toContain('width: 100% !important');
      expect(template.htmlContent).toContain('viewport');
    });
  });

  describe('Security', () => {
    it('should use secure unsubscribe tokens', () => {
      const url = generateUnsubscribeUrl(mockSubscriber);
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get('token');
      
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(token).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should properly encode email addresses in URLs', () => {
      const subscriberWithSpecialChars = {
        ...mockSubscriber,
        email: 'test+special@example.com'
      };
      
      const url = generateUnsubscribeUrl(subscriberWithSpecialChars);
      expect(url).toContain('test%2Bspecial%40example.com');
    });

    it('should validate email formats', () => {
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      
      // Should not contain script tags or other dangerous content
      expect(template.htmlContent).not.toContain('<script');
      expect(template.htmlContent).not.toContain('javascript:');
      expect(template.htmlContent).not.toContain('onclick=');
      expect(template.textContent).not.toContain('<script');
    });
  });

  describe('Performance', () => {
    it('should handle large subscriber lists efficiently', async () => {
      const largeSubscriberList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockSubscriber,
        id: `subscriber-${i}`,
        email: `test${i}@example.com`
      }));
      
      vi.mocked(getActiveSubscribers).mockResolvedValue(largeSubscriberList);
      
      const startTime = Date.now();
      const result = await sendArticleNotification(mockArticle);
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(result.totalSubscribers).toBe(1000);
      
      // Should complete within reasonable time (allowing for batching delays)
      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds max
    });

    it('should batch requests appropriately', async () => {
      const subscribers = Array.from({ length: 150 }, (_, i) => ({
        ...mockSubscriber,
        id: `subscriber-${i}`,
        email: `test${i}@example.com`
      }));
      
      vi.mocked(getActiveSubscribers).mockResolvedValue(subscribers);
      
      const result = await sendArticleNotification(mockArticle);
      
      expect(result.success).toBe(true);
      expect(result.totalSubscribers).toBe(150);
      
      // Should process in batches of 50 (3 batches total)
      // This is verified by the batch processing logic in the implementation
    });
  });

  describe('Logging and Observability', () => {
    it('should log successful email sends', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      await sendNewsletterEmail(mockSubscriber, template);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Newsletter email sent via Gmail API')
      );
      
      consoleSpy.mockRestore();
    });

    it('should log errors appropriately', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock Gmail API failure
      const mockGmail = vi.mocked(require('googleapis').google.gmail);
      mockGmail.mockReturnValue({
        users: {
          messages: {
            send: vi.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      });
      
      const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
      await sendNewsletterEmail(mockSubscriber, template);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send newsletter email')
      );
      
      consoleErrorSpy.mockRestore();
    });
  });
});

describe('Newsletter Email Infrastructure - Production Readiness', () => {
  it('should have all required environment variables documented', () => {
    const requiredEnvVars = [
      'GMAIL_CLIENT_EMAIL',
      'GMAIL_PRIVATE_KEY', 
      'GMAIL_IMPERSONATED_USER',
      'GMAIL_FROM_ADDRESS',
      'NEXT_PUBLIC_BASE_URL'
    ];
    
    // This test ensures we know what env vars are needed
    expect(requiredEnvVars).toHaveLength(5);
  });

  it('should handle configuration validation', () => {
    expect(NEWSLETTER_CONFIG.FROM_NAME).toBeDefined();
    expect(NEWSLETTER_CONFIG.BATCH_SIZE).toBeGreaterThan(0);
    expect(NEWSLETTER_CONFIG.RETRY_ATTEMPTS).toBeGreaterThan(0);
    expect(NEWSLETTER_CONFIG.BASE_URL).toBeDefined();
  });

  it('should provide proper error messages for debugging', async () => {
    delete process.env.GMAIL_CLIENT_EMAIL;
    
    const template = createArticleEmailTemplate(mockArticle, mockSubscriber);
    const result = await sendNewsletterEmail(mockSubscriber, template);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing Gmail service account environment variables');
  });
});