/**
 * Newsletter Analytics Unit Tests
 * Tests the core analytics functionality and data structures
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  newsletterAnalytics,
  trackNewsletterModalOpen,
  trackNewsletterModalClose,
  trackNewsletterFormSubmit,
  trackNewsletterSubscriptionSuccess,
  trackNewsletterFormError,
  trackNewsletterApiError,
  trackNewsletterValidationError,
  trackNewsletterPerformance,
  NewsletterAnalyticsEvent,
  NewsletterErrorEvent,
  NewsletterConversionEvent
} from '@/lib/newsletter-analytics';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window and document
const mockWindow = {
  navigator: { userAgent: 'test-user-agent' },
  location: { href: 'https://test.com/page' },
  gtag: vi.fn(),
};

const mockDocument = {
  referrer: 'https://referrer.com',
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

// Mock console methods
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();
const mockConsoleWarn = vi.fn();

vi.spyOn(console, 'log').mockImplementation(mockConsoleLog);
vi.spyOn(console, 'error').mockImplementation(mockConsoleError);
vi.spyOn(console, 'warn').mockImplementation(mockConsoleWarn);

describe('Newsletter Analytics Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
    
    // Reset analytics state
    (newsletterAnalytics as any).events = [];
    
    // Mock successful API responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    // Set NODE_ENV to development for testing
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Core Analytics Functionality', () => {
    it('should generate unique session IDs', () => {
      const analytics1 = new (newsletterAnalytics.constructor as any)();
      const analytics2 = new (newsletterAnalytics.constructor as any)();
      
      expect(analytics1.sessionId).toBeDefined();
      expect(analytics2.sessionId).toBeDefined();
      expect(analytics1.sessionId).not.toBe(analytics2.sessionId);
    });

    it('should create base events with required metadata', () => {
      const event = (newsletterAnalytics as any).createBaseEvent('test_event', { custom: 'data' });
      
      expect(event).toMatchObject({
        event: 'test_event',
        timestamp: expect.any(Number),
        sessionId: expect.any(String),
        metadata: expect.objectContaining({
          userAgent: 'test-user-agent',
          url: 'https://test.com/page',
          referrer: 'https://referrer.com',
          custom: 'data',
        }),
      });
    });

    it('should record events in memory', () => {
      trackNewsletterModalOpen('get-notified');
      
      const summary = newsletterAnalytics.getSessionSummary();
      expect(summary.totalEvents).toBe(1);
      expect(summary.modalOpens).toBe(1);
    });

    it('should limit stored events to prevent memory issues', () => {
      // Add more than 100 events
      for (let i = 0; i < 150; i++) {
        trackNewsletterPerformance(`test_metric_${i}`, i, 'count');
      }
      
      const summary = newsletterAnalytics.getSessionSummary();
      expect(summary.totalEvents).toBe(100); // Should be capped at 100
    });
  });

  describe('Modal Tracking', () => {
    it('should track modal open events', async () => {
      trackNewsletterModalOpen('get-notified');
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/analytics/newsletter',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('newsletter_modal_open'),
          })
        );
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        event: 'newsletter_modal_open',
        conversionType: 'modal_open',
        source: 'get-notified',
      });
    });

    it('should track modal close events with metrics', async () => {
      const timeOpen = 5000; // 5 seconds
      const wasSubmitted = true;
      
      trackNewsletterModalClose(timeOpen, wasSubmitted);
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/analytics/newsletter', expect.any(Object));
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        event: 'newsletter_modal_close',
        conversionType: 'modal_close',
        metadata: expect.objectContaining({
          timeOpen: 5000,
          wasSubmitted: true,
          bounceRate: false,
        }),
      });
    });

    it('should track bounce rate correctly', async () => {
      trackNewsletterModalClose(1000, false);
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.metadata.bounceRate).toBe(true);
    });
  });

  describe('Form Tracking', () => {
    it('should track form submissions with sanitized data', async () => {
      const formData = { name: 'John Doe', email: 'john@example.com' };
      const source = 'get-notified';
      
      trackNewsletterFormSubmit(formData, source);
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        event: 'newsletter_form_submit',
        conversionType: 'form_submit',
        source: 'get-notified',
        formData: {
          hasName: true,
          hasEmail: true,
          emailDomain: 'example.com',
        },
      });
    });

    it('should track successful subscriptions', async () => {
      const email = 'jane@company.com';
      const isExisting = false;
      
      trackNewsletterSubscriptionSuccess(email, isExisting);
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        event: 'newsletter_subscription_success',
        conversionType: 'subscription_success',
        metadata: expect.objectContaining({
          isExistingSubscriber: false,
          emailDomain: 'company.com',
        }),
      });
    });

    it('should handle existing subscribers', async () => {
      trackNewsletterSubscriptionSuccess('existing@test.com', true);
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.metadata.isExistingSubscriber).toBe(true);
    });
  });

  describe('Error Tracking', () => {
    it('should track form errors with context', async () => {
      const error = new Error('Validation failed');
      const context = { field: 'email', value: 'invalid' };
      
      trackNewsletterFormError(error, context);
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/monitoring/errors', expect.any(Object));
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        event: 'newsletter_form_error',
        error: {
          message: 'Validation failed',
          context: { field: 'email', value: 'invalid' },
        },
      });
    });

    it('should track API errors with request data', async () => {
      const endpoint = '/api/newsletter/subscribe';
      const error = new Error('Server error');
      (error as any).status = 500;
      const requestData = { name: 'Test', email: 'test@example.com' };
      
      trackNewsletterApiError(endpoint, error, requestData);
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/monitoring/errors', expect.any(Object));
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        event: 'newsletter_api_error',
        error: {
          message: 'Server error',
          code: 500,
          context: { endpoint },
        },
        metadata: expect.objectContaining({
          endpoint,
          requestData: expect.objectContaining({
            name: 'T***', // Should be sanitized
            email: 't***@example.com', // Should be sanitized
          }),
        }),
      });
    });

    it('should track validation errors', async () => {
      const field = 'email';
      const error = 'Invalid email format';
      const value = 'invalid-email';
      
      trackNewsletterValidationError(field, error, value);
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/monitoring/errors', expect.any(Object));
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        event: 'newsletter_validation_error',
        error: {
          message: 'Invalid email format',
          code: 'VALIDATION_ERROR',
          context: { field: 'email' },
        },
        metadata: expect.objectContaining({
          field: 'email',
          valueLength: 13,
          valueType: 'string',
        }),
      });
    });

    it('should sanitize sensitive data in request logs', () => {
      const requestData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'secret123',
      };
      
      const sanitized = (newsletterAnalytics as any).sanitizeRequestData(requestData);
      
      expect(sanitized).toEqual({
        name: 'J***',
        email: 'j***@example.com',
        password: 'secret123', // Non-email/name fields should remain
      });
    });
  });

  describe('Performance Tracking', () => {
    it('should track performance metrics', async () => {
      const metric = 'api_response_time';
      const value = 250;
      const unit = 'ms';
      
      trackNewsletterPerformance(metric, value, unit);
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/analytics/newsletter', expect.any(Object));
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        event: 'newsletter_performance',
        metadata: {
          metric: 'api_response_time',
          value: 250,
          unit: 'ms',
        },
      });
    });

    it('should track different performance units', async () => {
      trackNewsletterPerformance('bundle_size', 1024, 'bytes');
      trackNewsletterPerformance('error_count', 5, 'count');
      
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      const calls = mockFetch.mock.calls.map(call => JSON.parse(call[1].body));
      
      expect(calls[0].metadata.unit).toBe('bytes');
      expect(calls[1].metadata.unit).toBe('count');
    });
  });

  describe('Session Management', () => {
    it('should provide accurate session summary', () => {
      // Generate various events
      trackNewsletterModalOpen('get-notified');
      trackNewsletterModalOpen('subscribe-updates');
      trackNewsletterFormSubmit({ name: 'Test', email: 'test@example.com' }, 'test');
      trackNewsletterSubscriptionSuccess('test@example.com', false);
      trackNewsletterFormError(new Error('Test error'), {});
      
      const summary = newsletterAnalytics.getSessionSummary();
      
      expect(summary).toMatchObject({
        sessionId: expect.any(String),
        totalEvents: 5,
        errors: 1,
        conversions: 1,
        modalOpens: 2,
        subscriptions: 1,
      });
    });

    it('should maintain session consistency', () => {
      const initialSummary = newsletterAnalytics.getSessionSummary();
      
      trackNewsletterModalOpen('get-notified');
      
      const updatedSummary = newsletterAnalytics.getSessionSummary();
      
      expect(initialSummary.sessionId).toBe(updatedSummary.sessionId);
      expect(updatedSummary.totalEvents).toBe(initialSummary.totalEvents + 1);
    });
  });

  describe('External Service Integration', () => {
    it('should send events to Google Analytics when available', async () => {
      trackNewsletterModalOpen('get-notified');
      
      await vi.waitFor(() => {
        expect(mockWindow.gtag).toHaveBeenCalledWith(
          'event',
          'newsletter_modal_open',
          expect.objectContaining({
            event_category: 'newsletter',
            event_label: 'get-notified',
          })
        );
      });
    });

    it('should handle Google Analytics unavailability gracefully', async () => {
      // Remove gtag
      delete (mockWindow as any).gtag;
      
      trackNewsletterModalOpen('get-notified');
      
      // Should not throw error
      await vi.waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it('should handle analytics API failures silently', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Analytics service down'));
      
      trackNewsletterModalOpen('get-notified');
      
      // Should not throw error and should log warning
      await vi.waitFor(() => {
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Analytics tracking failed:',
          expect.any(Error)
        );
      });
    });

    it('should handle error monitoring failures silently', async () => {
      mockFetch.mockImplementation((url) => {
        if (url === '/api/monitoring/errors') {
          return Promise.reject(new Error('Error monitoring down'));
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
      });
      
      trackNewsletterFormError(new Error('Test error'), {});
      
      // Should not throw error and should log warning
      await vi.waitFor(() => {
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Error monitoring failed:',
          expect.any(Error)
        );
      });
    });
  });

  describe('Development vs Production Behavior', () => {
    it('should log events to console in development', () => {
      process.env.NODE_ENV = 'development';
      
      trackNewsletterModalOpen('get-notified');
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Newsletter Analytics]',
        'newsletter_modal_open',
        expect.any(Object)
      );
    });

    it('should not send analytics in non-production environments', async () => {
      process.env.NODE_ENV = 'development';
      
      // Reset analytics instance to pick up new NODE_ENV
      const devAnalytics = new (newsletterAnalytics.constructor as any)();
      expect((devAnalytics as any).isEnabled).toBe(false);
    });

    it('should enable analytics in production', () => {
      process.env.NODE_ENV = 'production';
      
      const prodAnalytics = new (newsletterAnalytics.constructor as any)();
      expect((prodAnalytics as any).isEnabled).toBe(true);
    });
  });

  describe('Data Privacy and Security', () => {
    it('should not log sensitive information', () => {
      const sensitiveData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        creditCard: '4111111111111111',
      };
      
      const sanitized = (newsletterAnalytics as any).sanitizeRequestData(sensitiveData);
      
      expect(sanitized.name).toBe('J***');
      expect(sanitized.email).toBe('j***@example.com');
      expect(sanitized.password).toBe('secret123'); // Should remain as is
      expect(sanitized.creditCard).toBe('4111111111111111'); // Should remain as is
    });

    it('should handle null and undefined data safely', () => {
      expect(() => {
        (newsletterAnalytics as any).sanitizeRequestData(null);
        (newsletterAnalytics as any).sanitizeRequestData(undefined);
        (newsletterAnalytics as any).sanitizeRequestData({});
      }).not.toThrow();
    });

    it('should generate unique session IDs', () => {
      const sessionIds = new Set();
      
      for (let i = 0; i < 100; i++) {
        const analytics = new (newsletterAnalytics.constructor as any)();
        sessionIds.add((analytics as any).sessionId);
      }
      
      expect(sessionIds.size).toBe(100); // All should be unique
    });
  });
});