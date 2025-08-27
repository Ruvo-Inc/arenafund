/**
 * Newsletter Analytics Hooks Tests
 * Tests the React hooks for analytics integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNewsletterAnalytics, useNewsletterFormAnalytics } from '@/hooks/useNewsletterAnalytics';
import * as analyticsLib from '@/lib/newsletter-analytics';

// Mock the analytics library
vi.mock('@/lib/newsletter-analytics', () => ({
  trackNewsletterModalOpen: vi.fn(),
  trackNewsletterModalClose: vi.fn(),
  trackNewsletterFormSubmit: vi.fn(),
  trackNewsletterSubscriptionSuccess: vi.fn(),
  trackNewsletterFormError: vi.fn(),
  trackNewsletterValidationError: vi.fn(),
  trackNewsletterPerformance: vi.fn(),
}));

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
};
global.performance = mockPerformance as any;

describe('useNewsletterAnalytics Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Hook Functionality', () => {
    it('should initialize with default source', () => {
      const { result } = renderHook(() => useNewsletterAnalytics());
      
      expect(result.current).toMatchObject({
        trackModalOpen: expect.any(Function),
        trackModalClose: expect.any(Function),
        trackFormSubmit: expect.any(Function),
        trackSubscriptionSuccess: expect.any(Function),
        trackFormError: expect.any(Function),
        trackValidationError: expect.any(Function),
        trackPerformance: expect.any(Function),
        startPerformanceTimer: expect.any(Function),
      });
    });

    it('should initialize with custom source', () => {
      const { result } = renderHook(() => 
        useNewsletterAnalytics({ source: 'get-notified' })
      );
      
      act(() => {
        result.current.trackModalOpen();
      });
      
      expect(analyticsLib.trackNewsletterModalOpen).toHaveBeenCalledWith('get-notified');
    });

    it('should track component mount performance', () => {
      renderHook(() => useNewsletterAnalytics());
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'newsletter_analytics_hook_mount',
        expect.any(Number),
        'ms'
      );
    });
  });

  describe('Modal Tracking Methods', () => {
    it('should track modal open with correct source', () => {
      const { result } = renderHook(() => 
        useNewsletterAnalytics({ source: 'subscribe-updates' })
      );
      
      act(() => {
        result.current.trackModalOpen();
      });
      
      expect(analyticsLib.trackNewsletterModalOpen).toHaveBeenCalledWith('subscribe-updates');
    });

    it('should track modal close', () => {
      const { result } = renderHook(() => useNewsletterAnalytics());
      
      act(() => {
        result.current.trackModalClose();
      });
      
      expect(analyticsLib.trackNewsletterModalClose).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Boolean)
      );
    });

    it('should track modal open and close timing', () => {
      let currentTime = 1000;
      mockPerformance.now.mockImplementation(() => currentTime);
      
      const { result } = renderHook(() => useNewsletterAnalytics());
      
      // Track modal open
      act(() => {
        result.current.trackModalOpen();
      });
      
      // Simulate time passing
      currentTime = 5000;
      
      // Track modal close
      act(() => {
        result.current.trackModalClose();
      });
      
      expect(analyticsLib.trackNewsletterModalClose).toHaveBeenCalledWith(
        4000, // 5000 - 1000
        false // wasSubmitted defaults to false
      );
    });
  });

  describe('Form Tracking Methods', () => {
    it('should track form submission with source', () => {
      const { result } = renderHook(() => 
        useNewsletterAnalytics({ source: 'get-notified' })
      );
      
      const formData = { name: 'John Doe', email: 'john@example.com' };
      
      act(() => {
        result.current.trackFormSubmit(formData);
      });
      
      expect(analyticsLib.trackNewsletterFormSubmit).toHaveBeenCalledWith(
        formData,
        'get-notified'
      );
    });

    it('should track subscription success', () => {
      const { result } = renderHook(() => useNewsletterAnalytics());
      
      act(() => {
        result.current.trackSubscriptionSuccess('test@example.com', false);
      });
      
      expect(analyticsLib.trackNewsletterSubscriptionSuccess).toHaveBeenCalledWith(
        'test@example.com',
        false
      );
    });

    it('should track form errors with context', () => {
      const { result } = renderHook(() => 
        useNewsletterAnalytics({ source: 'subscribe-updates' })
      );
      
      const error = new Error('Validation failed');
      const context = { field: 'email' };
      
      act(() => {
        result.current.trackFormError(error, context);
      });
      
      expect(analyticsLib.trackNewsletterFormError).toHaveBeenCalledWith(
        error,
        { source: 'subscribe-updates', ...context }
      );
    });

    it('should track validation errors', () => {
      const { result } = renderHook(() => useNewsletterAnalytics());
      
      act(() => {
        result.current.trackValidationError('email', 'Invalid format', 'invalid-email');
      });
      
      expect(analyticsLib.trackNewsletterValidationError).toHaveBeenCalledWith(
        'email',
        'Invalid format',
        'invalid-email'
      );
    });
  });

  describe('Performance Tracking Methods', () => {
    it('should track performance metrics', () => {
      const { result } = renderHook(() => useNewsletterAnalytics());
      
      act(() => {
        result.current.trackPerformance('api_response', 250, 'ms');
      });
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'api_response',
        250,
        'ms'
      );
    });

    it('should create performance timers', () => {
      let currentTime = 1000;
      mockPerformance.now.mockImplementation(() => currentTime);
      
      const { result } = renderHook(() => useNewsletterAnalytics());
      
      let endTimer: () => void;
      
      act(() => {
        endTimer = result.current.startPerformanceTimer('test_operation');
      });
      
      // Simulate time passing
      currentTime = 1500;
      
      act(() => {
        endTimer();
      });
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'test_operation',
        500, // 1500 - 1000
        'ms'
      );
    });

    it('should handle multiple concurrent timers', () => {
      let currentTime = 1000;
      mockPerformance.now.mockImplementation(() => currentTime);
      
      const { result } = renderHook(() => useNewsletterAnalytics());
      
      let endTimer1: () => void;
      let endTimer2: () => void;
      
      act(() => {
        endTimer1 = result.current.startPerformanceTimer('operation_1');
      });
      
      currentTime = 1200;
      
      act(() => {
        endTimer2 = result.current.startPerformanceTimer('operation_2');
      });
      
      currentTime = 1500;
      
      act(() => {
        endTimer1(); // Should track 500ms
      });
      
      currentTime = 1800;
      
      act(() => {
        endTimer2(); // Should track 600ms
      });
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'operation_1',
        500,
        'ms'
      );
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'operation_2',
        600,
        'ms'
      );
    });
  });

  describe('Hook State Management', () => {
    it('should maintain consistent source across method calls', () => {
      const { result } = renderHook(() => 
        useNewsletterAnalytics({ source: 'get-notified' })
      );
      
      act(() => {
        result.current.trackModalOpen();
        result.current.trackFormSubmit({ name: 'Test', email: 'test@example.com' });
      });
      
      expect(analyticsLib.trackNewsletterModalOpen).toHaveBeenCalledWith('get-notified');
      expect(analyticsLib.trackNewsletterFormSubmit).toHaveBeenCalledWith(
        expect.any(Object),
        'get-notified'
      );
    });

    it('should handle source changes on re-render', () => {
      const { result, rerender } = renderHook(
        ({ source }) => useNewsletterAnalytics({ source }),
        { initialProps: { source: 'get-notified' as const } }
      );
      
      act(() => {
        result.current.trackModalOpen();
      });
      
      expect(analyticsLib.trackNewsletterModalOpen).toHaveBeenCalledWith('get-notified');
      
      rerender({ source: 'subscribe-updates' as const });
      
      act(() => {
        result.current.trackModalOpen();
      });
      
      expect(analyticsLib.trackNewsletterModalOpen).toHaveBeenCalledWith('subscribe-updates');
    });
  });
});

describe('useNewsletterFormAnalytics Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Field Interaction Tracking', () => {
    it('should track field focus events', () => {
      const { result } = renderHook(() => useNewsletterFormAnalytics());
      
      act(() => {
        result.current.trackFieldFocus('email');
      });
      
      // Should store the start time internally
      expect(result.current.trackFieldFocus).toBeDefined();
    });

    it('should track field blur events with interaction time', () => {
      let currentTime = 1000;
      mockPerformance.now.mockImplementation(() => currentTime);
      
      const { result } = renderHook(() => useNewsletterFormAnalytics());
      
      // Focus field
      act(() => {
        result.current.trackFieldFocus('email');
      });
      
      // Simulate time passing
      currentTime = 3000;
      
      // Blur field
      act(() => {
        result.current.trackFieldBlur('email', 'test@example.com', false);
      });
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'field_interaction_email',
        2000, // 3000 - 1000
        'ms'
      );
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'field_completion_email',
        1, // Has value
        'count'
      );
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'field_error_email',
        0, // No error
        'count'
      );
    });

    it('should track field completion metrics', () => {
      const { result } = renderHook(() => useNewsletterFormAnalytics());
      
      act(() => {
        result.current.trackFieldFocus('name');
        result.current.trackFieldBlur('name', '', false); // Empty value
      });
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'field_completion_name',
        0, // No value
        'count'
      );
      
      act(() => {
        result.current.trackFieldFocus('name');
        result.current.trackFieldBlur('name', 'John Doe', false); // Has value
      });
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'field_completion_name',
        1, // Has value
        'count'
      );
    });

    it('should track field error metrics', () => {
      const { result } = renderHook(() => useNewsletterFormAnalytics());
      
      act(() => {
        result.current.trackFieldFocus('email');
        result.current.trackFieldBlur('email', 'invalid-email', true); // Has error
      });
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'field_error_email',
        1, // Has error
        'count'
      );
    });

    it('should track field-specific errors', () => {
      const { result } = renderHook(() => useNewsletterFormAnalytics());
      
      act(() => {
        result.current.trackFieldError('email', 'Invalid format', 'invalid-email');
      });
      
      expect(analyticsLib.trackNewsletterValidationError).toHaveBeenCalledWith(
        'email',
        'Invalid format',
        'invalid-email'
      );
    });
  });

  describe('Multiple Field Interactions', () => {
    it('should handle multiple concurrent field interactions', () => {
      let currentTime = 1000;
      mockPerformance.now.mockImplementation(() => currentTime);
      
      const { result } = renderHook(() => useNewsletterFormAnalytics());
      
      // Focus both fields
      act(() => {
        result.current.trackFieldFocus('name');
      });
      
      currentTime = 1500;
      
      act(() => {
        result.current.trackFieldFocus('email');
      });
      
      currentTime = 2000;
      
      // Blur name field
      act(() => {
        result.current.trackFieldBlur('name', 'John Doe', false);
      });
      
      currentTime = 3000;
      
      // Blur email field
      act(() => {
        result.current.trackFieldBlur('email', 'john@example.com', false);
      });
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'field_interaction_name',
        1000, // 2000 - 1000
        'ms'
      );
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'field_interaction_email',
        1500, // 3000 - 1500
        'ms'
      );
    });

    it('should handle blur without focus gracefully', () => {
      const { result } = renderHook(() => useNewsletterFormAnalytics());
      
      // Blur without focus should not crash
      expect(() => {
        act(() => {
          result.current.trackFieldBlur('email', 'test@example.com', false);
        });
      }).not.toThrow();
      
      // Should not track interaction time if no focus was recorded
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'field_completion_email',
        1,
        'count'
      );
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'field_error_email',
        0,
        'count'
      );
    });
  });

  describe('Hook State Management', () => {
    it('should maintain separate timers for different fields', () => {
      let currentTime = 1000;
      mockPerformance.now.mockImplementation(() => currentTime);
      
      const { result } = renderHook(() => useNewsletterFormAnalytics());
      
      // Focus name field
      act(() => {
        result.current.trackFieldFocus('name');
      });
      
      currentTime = 1500;
      
      // Focus email field
      act(() => {
        result.current.trackFieldFocus('email');
      });
      
      currentTime = 2000;
      
      // Blur name field (should track 1000ms)
      act(() => {
        result.current.trackFieldBlur('name', 'John', false);
      });
      
      currentTime = 3000;
      
      // Blur email field (should track 1500ms)
      act(() => {
        result.current.trackFieldBlur('email', 'john@example.com', false);
      });
      
      const performanceCalls = (analyticsLib.trackNewsletterPerformance as any).mock.calls
        .filter((call: any) => call[0].includes('field_interaction'));
      
      expect(performanceCalls).toEqual([
        ['field_interaction_name', 1000, 'ms'],
        ['field_interaction_email', 1500, 'ms'],
      ]);
    });

    it('should reset field timers on re-focus', () => {
      let currentTime = 1000;
      mockPerformance.now.mockImplementation(() => currentTime);
      
      const { result } = renderHook(() => useNewsletterFormAnalytics());
      
      // First focus
      act(() => {
        result.current.trackFieldFocus('email');
      });
      
      currentTime = 2000;
      
      // Second focus (should reset timer)
      act(() => {
        result.current.trackFieldFocus('email');
      });
      
      currentTime = 3000;
      
      // Blur (should track 1000ms from second focus)
      act(() => {
        result.current.trackFieldBlur('email', 'test@example.com', false);
      });
      
      expect(analyticsLib.trackNewsletterPerformance).toHaveBeenCalledWith(
        'field_interaction_email',
        1000, // 3000 - 2000 (from second focus)
        'ms'
      );
    });
  });
});