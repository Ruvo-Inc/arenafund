/**
 * Newsletter Analytics Integration Tests
 * Tests the complete analytics and error monitoring system for newsletter functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import NewsletterModal from '@/components/NewsletterModal';
import { NewsletterForm } from '@/components/NewsletterForm';
import { useNewsletterAnalytics, useNewsletterFormAnalytics } from '@/hooks/useNewsletterAnalytics';
import { newsletterAnalytics } from '@/lib/newsletter-analytics';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
};
global.performance = mockPerformance as any;

// Mock console methods
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();
const mockConsoleWarn = vi.fn();

vi.spyOn(console, 'log').mockImplementation(mockConsoleLog);
vi.spyOn(console, 'error').mockImplementation(mockConsoleError);
vi.spyOn(console, 'warn').mockImplementation(mockConsoleWarn);

describe('Newsletter Analytics Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
    
    // Reset analytics state
    (newsletterAnalytics as any).events = [];
    
    // Mock successful API responses by default
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Modal Analytics Tracking', () => {
    it('should track modal open event', async () => {
      const onClose = vi.fn();
      
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="get-notified" 
        />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/analytics/newsletter',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('newsletter_modal_open'),
          })
        );
      });

      // Verify analytics data structure
      const analyticsCall = mockFetch.mock.calls.find(call => 
        call[0] === '/api/analytics/newsletter'
      );
      expect(analyticsCall).toBeDefined();
      
      const requestBody = JSON.parse(analyticsCall![1].body);
      expect(requestBody).toMatchObject({
        event: 'newsletter_modal_open',
        conversionType: 'modal_open',
        source: 'get-notified',
        timestamp: expect.any(Number),
        sessionId: expect.any(String),
      });
    });

    it('should track modal close event with time metrics', async () => {
      const onClose = vi.fn();
      let modalOpenTime = 1000;
      let modalCloseTime = 3000;
      
      mockPerformance.now
        .mockReturnValueOnce(modalOpenTime)
        .mockReturnValueOnce(modalCloseTime);

      const { rerender } = render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="subscribe-updates" 
        />
      );

      // Wait for modal open tracking
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/analytics/newsletter', expect.any(Object));
      });

      // Close modal
      rerender(
        <NewsletterModal 
          isOpen={false} 
          onClose={onClose} 
          triggerSource="subscribe-updates" 
        />
      );

      await waitFor(() => {
        const closeAnalyticsCall = mockFetch.mock.calls.find(call => {
          if (call[0] !== '/api/analytics/newsletter') return false;
          const body = JSON.parse(call[1].body);
          return body.event === 'newsletter_modal_close';
        });
        
        expect(closeAnalyticsCall).toBeDefined();
        const requestBody = JSON.parse(closeAnalyticsCall![1].body);
        expect(requestBody).toMatchObject({
          event: 'newsletter_modal_close',
          conversionType: 'modal_close',
          metadata: expect.objectContaining({
            timeOpen: expect.any(Number),
            wasSubmitted: false,
            bounceRate: true,
          }),
        });
      });
    });

    it('should track modal close via escape key', async () => {
      const onClose = vi.fn();
      
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="get-notified" 
        />
      );

      // Press escape key
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
      
      await waitFor(() => {
        const closeAnalyticsCall = mockFetch.mock.calls.find(call => {
          if (call[0] !== '/api/analytics/newsletter') return false;
          const body = JSON.parse(call[1].body);
          return body.event === 'newsletter_modal_close';
        });
        
        expect(closeAnalyticsCall).toBeDefined();
      });
    });
  });

  describe('Form Analytics Tracking', () => {
    it('should track form submission attempt', async () => {
      const onSuccess = vi.fn();
      
      render(
        <NewsletterForm 
          triggerSource="get-notified" 
          onSuccess={onSuccess} 
        />
      );

      // Fill out form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      // Mock successful subscription
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Subscribed successfully' }),
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        const formSubmitCall = mockFetch.mock.calls.find(call => {
          if (call[0] !== '/api/analytics/newsletter') return false;
          const body = JSON.parse(call[1].body);
          return body.event === 'newsletter_form_submit';
        });
        
        expect(formSubmitCall).toBeDefined();
        const requestBody = JSON.parse(formSubmitCall![1].body);
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
    });

    it('should track successful subscription', async () => {
      const onSuccess = vi.fn();
      
      render(
        <NewsletterForm 
          triggerSource="subscribe-updates" 
          onSuccess={onSuccess} 
        />
      );

      // Fill out form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
      fireEvent.change(emailInput, { target: { value: 'jane@company.com' } });

      // Mock successful subscription
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          message: 'Subscribed successfully',
          isExistingSubscriber: false 
        }),
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        const successCall = mockFetch.mock.calls.find(call => {
          if (call[0] !== '/api/analytics/newsletter') return false;
          const body = JSON.parse(call[1].body);
          return body.event === 'newsletter_subscription_success';
        });
        
        expect(successCall).toBeDefined();
        const requestBody = JSON.parse(successCall![1].body);
        expect(requestBody).toMatchObject({
          event: 'newsletter_subscription_success',
          conversionType: 'subscription_success',
          metadata: expect.objectContaining({
            isExistingSubscriber: false,
            emailDomain: 'company.com',
          }),
        });
      });
    });

    it('should track form validation errors', async () => {
      render(
        <NewsletterForm triggerSource="get-notified" />
      );

      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      // Submit empty form to trigger validation errors
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter your name/i)).toBeInTheDocument();
        expect(screen.getByText(/please enter your email/i)).toBeInTheDocument();
      });

      // Check if validation errors were tracked
      await waitFor(() => {
        const validationErrorCalls = mockFetch.mock.calls.filter(call => {
          if (call[0] !== '/api/analytics/newsletter') return false;
          const body = JSON.parse(call[1].body);
          return body.event === 'newsletter_validation_error';
        });
        
        expect(validationErrorCalls.length).toBeGreaterThan(0);
      });
    });

    it('should track field interaction metrics', async () => {
      render(
        <NewsletterForm triggerSource="get-notified" />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);

      // Simulate field interactions
      fireEvent.focus(nameInput);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.blur(nameInput);

      fireEvent.focus(emailInput);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        const performanceCalls = mockFetch.mock.calls.filter(call => {
          if (call[0] !== '/api/analytics/newsletter') return false;
          const body = JSON.parse(call[1].body);
          return body.event === 'newsletter_performance' && 
                 body.metadata?.metric?.includes('field_interaction');
        });
        
        expect(performanceCalls.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Tracking', () => {
    it('should track API errors', async () => {
      const onSuccess = vi.fn();
      
      render(
        <NewsletterForm 
          triggerSource="get-notified" 
          onSuccess={onSuccess} 
        />
      );

      // Fill out form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      // Mock API error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorCall = mockFetch.mock.calls.find(call => {
          return call[0] === '/api/monitoring/errors';
        });
        
        expect(errorCall).toBeDefined();
        const requestBody = JSON.parse(errorCall![1].body);
        expect(requestBody).toMatchObject({
          event: 'newsletter_form_error',
          error: {
            message: 'Network error',
            context: expect.any(Object),
          },
        });
      });
    });

    it('should track rate limit errors', async () => {
      const onSuccess = vi.fn();
      
      render(
        <NewsletterForm 
          triggerSource="get-notified" 
          onSuccess={onSuccess} 
        />
      );

      // Fill out form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      // Mock rate limit error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ message: 'Rate limit exceeded' }),
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        const errorCall = mockFetch.mock.calls.find(call => {
          return call[0] === '/api/monitoring/errors';
        });
        
        expect(errorCall).toBeDefined();
      });
    });

    it('should track server errors', async () => {
      const onSuccess = vi.fn();
      
      render(
        <NewsletterForm 
          triggerSource="get-notified" 
          onSuccess={onSuccess} 
        />
      );

      // Fill out form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      // Mock server error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        const errorCall = mockFetch.mock.calls.find(call => {
          return call[0] === '/api/monitoring/errors';
        });
        
        expect(errorCall).toBeDefined();
      });
    });
  });

  describe('Performance Tracking', () => {
    it('should track modal lifecycle performance', async () => {
      const onClose = vi.fn();
      
      const { rerender } = render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="get-notified" 
        />
      );

      // Close modal
      rerender(
        <NewsletterModal 
          isOpen={false} 
          onClose={onClose} 
          triggerSource="get-notified" 
        />
      );

      await waitFor(() => {
        const performanceCall = mockFetch.mock.calls.find(call => {
          if (call[0] !== '/api/analytics/newsletter') return false;
          const body = JSON.parse(call[1].body);
          return body.event === 'newsletter_performance' && 
                 body.metadata?.metric === 'modal_lifecycle';
        });
        
        expect(performanceCall).toBeDefined();
      });
    });

    it('should track API response times', async () => {
      const onSuccess = vi.fn();
      
      render(
        <NewsletterForm 
          triggerSource="get-notified" 
          onSuccess={onSuccess} 
        />
      );

      // Fill out form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      // Mock successful subscription with delay
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          }), 100)
        )
      );

      fireEvent.click(submitButton);

      await waitFor(() => {
        const performanceCall = mockFetch.mock.calls.find(call => {
          if (call[0] !== '/api/analytics/newsletter') return false;
          const body = JSON.parse(call[1].body);
          return body.event === 'newsletter_performance' && 
                 body.metadata?.metric === 'api_subscription_request';
        });
        
        expect(performanceCall).toBeDefined();
        const requestBody = JSON.parse(performanceCall![1].body);
        expect(requestBody.metadata.value).toBeGreaterThan(0);
        expect(requestBody.metadata.unit).toBe('ms');
      });
    });
  });

  describe('Analytics Session Management', () => {
    it('should maintain consistent session ID across events', async () => {
      const onClose = vi.fn();
      
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="get-notified" 
        />
      );

      // Wait for modal open event
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/analytics/newsletter', expect.any(Object));
      });

      // Fill out form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const analyticsCalls = mockFetch.mock.calls.filter(call => 
          call[0] === '/api/analytics/newsletter'
        );
        
        expect(analyticsCalls.length).toBeGreaterThan(1);
        
        // Extract session IDs from all calls
        const sessionIds = analyticsCalls.map(call => {
          const body = JSON.parse(call[1].body);
          return body.sessionId;
        });
        
        // All session IDs should be the same
        const uniqueSessionIds = [...new Set(sessionIds)];
        expect(uniqueSessionIds).toHaveLength(1);
      });
    });

    it('should provide session summary', () => {
      const summary = newsletterAnalytics.getSessionSummary();
      
      expect(summary).toMatchObject({
        sessionId: expect.any(String),
        totalEvents: expect.any(Number),
        errors: expect.any(Number),
        conversions: expect.any(Number),
        modalOpens: expect.any(Number),
        subscriptions: expect.any(Number),
      });
    });
  });

  describe('Analytics API Endpoints', () => {
    it('should handle analytics endpoint failures gracefully', async () => {
      // Mock analytics endpoint failure
      mockFetch.mockImplementation((url) => {
        if (url === '/api/analytics/newsletter') {
          return Promise.reject(new Error('Analytics service unavailable'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });

      const onClose = vi.fn();
      
      render(
        <NewsletterModal 
          isOpen={true} 
          onClose={onClose} 
          triggerSource="get-notified" 
        />
      );

      // Analytics failure should not prevent modal from working
      await waitFor(() => {
        expect(screen.getByText(/stay updated/i)).toBeInTheDocument();
      });

      // Should log warning about analytics failure
      await waitFor(() => {
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Analytics tracking failed:',
          expect.any(Error)
        );
      });
    });

    it('should handle error monitoring endpoint failures gracefully', async () => {
      // Mock error monitoring endpoint failure
      mockFetch.mockImplementation((url) => {
        if (url === '/api/monitoring/errors') {
          return Promise.reject(new Error('Error monitoring service unavailable'));
        }
        if (url === '/api/newsletter/subscribe') {
          return Promise.reject(new Error('Subscription failed'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });

      const onSuccess = vi.fn();
      
      render(
        <NewsletterForm 
          triggerSource="get-notified" 
          onSuccess={onSuccess} 
        />
      );

      // Fill out form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.click(submitButton);

      // Form should still show error message even if error monitoring fails
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Should log warning about error monitoring failure
      await waitFor(() => {
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Error monitoring failed:',
          expect.any(Error)
        );
      });
    });
  });
});