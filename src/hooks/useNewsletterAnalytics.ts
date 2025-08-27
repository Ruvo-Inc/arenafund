import { useCallback, useEffect, useRef } from 'react';
import {
  trackNewsletterModalOpen,
  trackNewsletterModalClose,
  trackNewsletterFormSubmit,
  trackNewsletterSubscriptionSuccess,
  trackNewsletterFormError,
  trackNewsletterValidationError,
  trackNewsletterPerformance,
} from '@/lib/newsletter-analytics';

interface UseNewsletterAnalyticsProps {
  source?: 'get-notified' | 'subscribe-updates' | 'direct';
}

export function useNewsletterAnalytics({ source = 'direct' }: UseNewsletterAnalyticsProps = {}) {
  const modalOpenTimeRef = useRef<number | null>(null);
  const wasSubmittedRef = useRef<boolean>(false);

  // Track modal open
  const trackModalOpen = useCallback(() => {
    modalOpenTimeRef.current = Date.now();
    wasSubmittedRef.current = false;
    trackNewsletterModalOpen(source);
  }, [source]);

  // Track modal close
  const trackModalClose = useCallback(() => {
    if (modalOpenTimeRef.current) {
      const timeOpen = Date.now() - modalOpenTimeRef.current;
      trackNewsletterModalClose(timeOpen, wasSubmittedRef.current);
      modalOpenTimeRef.current = null;
    }
  }, []);

  // Track form submission
  const trackFormSubmit = useCallback((formData: { name: string; email: string }) => {
    wasSubmittedRef.current = true;
    trackNewsletterFormSubmit(formData, source);
  }, [source]);

  // Track successful subscription
  const trackSubscriptionSuccess = useCallback((email: string, isExisting: boolean) => {
    trackNewsletterSubscriptionSuccess(email, isExisting);
  }, []);

  // Track form errors
  const trackFormError = useCallback((error: Error, context: Record<string, any> = {}) => {
    trackNewsletterFormError(error, { source, ...context });
  }, [source]);

  // Track validation errors
  const trackValidationError = useCallback((field: string, error: string, value?: string) => {
    trackNewsletterValidationError(field, error, value);
  }, []);

  // Track performance metrics
  const trackPerformance = useCallback((metric: string, value: number, unit: 'ms' | 'bytes' | 'count') => {
    trackNewsletterPerformance(metric, value, unit);
  }, []);

  // Performance tracking utilities
  const startPerformanceTimer = useCallback((metric: string) => {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      trackPerformance(metric, Math.round(duration), 'ms');
    };
  }, [trackPerformance]);

  // Track component mount performance
  useEffect(() => {
    const endTimer = startPerformanceTimer('newsletter_analytics_hook_mount');
    return endTimer;
  }, [startPerformanceTimer]);

  return {
    trackModalOpen,
    trackModalClose,
    trackFormSubmit,
    trackSubscriptionSuccess,
    trackFormError,
    trackValidationError,
    trackPerformance,
    startPerformanceTimer,
  };
}

// Hook for tracking form field interactions
export function useNewsletterFormAnalytics() {
  const fieldInteractionTimers = useRef<Record<string, number>>({});

  const trackFieldFocus = useCallback((fieldName: string) => {
    fieldInteractionTimers.current[fieldName] = Date.now();
  }, []);

  const trackFieldBlur = useCallback((fieldName: string, value: string, hasError: boolean) => {
    const startTime = fieldInteractionTimers.current[fieldName];
    if (startTime) {
      const interactionTime = Date.now() - startTime;
      trackNewsletterPerformance(`field_interaction_${fieldName}`, interactionTime, 'ms');
      
      // Track field completion metrics
      trackNewsletterPerformance(`field_completion_${fieldName}`, value.length > 0 ? 1 : 0, 'count');
      trackNewsletterPerformance(`field_error_${fieldName}`, hasError ? 1 : 0, 'count');
    }
  }, []);

  const trackFieldError = useCallback((fieldName: string, errorMessage: string, value: string) => {
    trackNewsletterValidationError(fieldName, errorMessage, value);
  }, []);

  return {
    trackFieldFocus,
    trackFieldBlur,
    trackFieldError,
  };
}