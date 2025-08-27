/**
 * Newsletter Analytics and Error Monitoring
 * Tracks user interactions, errors, and conversion metrics for the newsletter subscription system
 */

export interface NewsletterAnalyticsEvent {
  event: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface NewsletterErrorEvent extends NewsletterAnalyticsEvent {
  error: {
    message: string;
    code?: string;
    stack?: string;
    context?: Record<string, any>;
  };
}

export interface NewsletterConversionEvent extends NewsletterAnalyticsEvent {
  conversionType: 'modal_open' | 'form_submit' | 'subscription_success' | 'modal_close';
  source: 'get-notified' | 'subscribe-updates' | 'direct';
  formData?: {
    hasName: boolean;
    hasEmail: boolean;
    emailDomain?: string;
  };
}

class NewsletterAnalytics {
  private sessionId: string;
  private events: NewsletterAnalyticsEvent[] = [];
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = typeof window !== 'undefined' && process.env.NODE_ENV === 'production';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createBaseEvent(event: string, metadata?: Record<string, any>): NewsletterAnalyticsEvent {
    return {
      event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      metadata: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        referrer: typeof window !== 'undefined' ? document.referrer : 'unknown',
        ...metadata,
      },
    };
  }

  /**
   * Track modal interactions
   */
  trackModalOpen(source: 'get-notified' | 'subscribe-updates' | 'direct'): void {
    const event: NewsletterConversionEvent = {
      ...this.createBaseEvent('newsletter_modal_open'),
      conversionType: 'modal_open',
      source,
    };

    this.recordEvent(event);
    this.sendToAnalytics(event);
  }

  trackModalClose(timeOpen: number, wasSubmitted: boolean): void {
    const event: NewsletterConversionEvent = {
      ...this.createBaseEvent('newsletter_modal_close', {
        timeOpen,
        wasSubmitted,
        bounceRate: !wasSubmitted,
      }),
      conversionType: 'modal_close',
      source: 'direct',
    };

    this.recordEvent(event);
    this.sendToAnalytics(event);
  }

  /**
   * Track form interactions
   */
  trackFormSubmit(formData: { name: string; email: string }, source: string): void {
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();
    
    const event: NewsletterConversionEvent = {
      ...this.createBaseEvent('newsletter_form_submit'),
      conversionType: 'form_submit',
      source: source as any,
      formData: {
        hasName: !!formData.name.trim(),
        hasEmail: !!formData.email.trim(),
        emailDomain,
      },
    };

    this.recordEvent(event);
    this.sendToAnalytics(event);
  }

  trackSubscriptionSuccess(email: string, isExisting: boolean): void {
    const event: NewsletterConversionEvent = {
      ...this.createBaseEvent('newsletter_subscription_success', {
        isExistingSubscriber: isExisting,
        emailDomain: email.split('@')[1]?.toLowerCase(),
      }),
      conversionType: 'subscription_success',
      source: 'direct',
    };

    this.recordEvent(event);
    this.sendToAnalytics(event);
  }

  /**
   * Track errors
   */
  trackFormError(error: Error, context: Record<string, any>): void {
    const errorEvent: NewsletterErrorEvent = {
      ...this.createBaseEvent('newsletter_form_error'),
      error: {
        message: error.message,
        code: (error as any).code,
        stack: error.stack,
        context,
      },
    };

    this.recordEvent(errorEvent);
    this.sendErrorToMonitoring(errorEvent);
  }

  trackApiError(endpoint: string, error: Error, requestData?: any): void {
    const errorEvent: NewsletterErrorEvent = {
      ...this.createBaseEvent('newsletter_api_error', {
        endpoint,
        requestData: requestData ? this.sanitizeRequestData(requestData) : undefined,
      }),
      error: {
        message: error.message,
        code: (error as any).code || (error as any).status,
        stack: error.stack,
        context: { endpoint },
      },
    };

    this.recordEvent(errorEvent);
    this.sendErrorToMonitoring(errorEvent);
  }

  trackValidationError(field: string, error: string, value?: string): void {
    const errorEvent: NewsletterErrorEvent = {
      ...this.createBaseEvent('newsletter_validation_error', {
        field,
        valueLength: value?.length || 0,
        valueType: typeof value,
      }),
      error: {
        message: error,
        code: 'VALIDATION_ERROR',
        context: { field },
      },
    };

    this.recordEvent(errorEvent);
  }

  /**
   * Performance tracking
   */
  trackPerformance(metric: string, value: number, unit: 'ms' | 'bytes' | 'count'): void {
    const event = this.createBaseEvent('newsletter_performance', {
      metric,
      value,
      unit,
    });

    this.recordEvent(event);
  }

  /**
   * Get analytics summary
   */
  getSessionSummary(): {
    sessionId: string;
    totalEvents: number;
    errors: number;
    conversions: number;
    modalOpens: number;
    subscriptions: number;
  } {
    const errors = this.events.filter(e => e.event.includes('error')).length;
    const conversions = this.events.filter(e => e.event.includes('success')).length;
    const modalOpens = this.events.filter(e => e.event === 'newsletter_modal_open').length;
    const subscriptions = this.events.filter(e => e.event === 'newsletter_subscription_success').length;

    return {
      sessionId: this.sessionId,
      totalEvents: this.events.length,
      errors,
      conversions,
      modalOpens,
      subscriptions,
    };
  }

  /**
   * Private methods
   */
  private recordEvent(event: NewsletterAnalyticsEvent): void {
    this.events.push(event);
    
    // Keep only last 100 events to prevent memory issues
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Newsletter Analytics]', event.event, event);
    }
  }

  private async sendToAnalytics(event: NewsletterAnalyticsEvent): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Send to analytics service (Google Analytics, Mixpanel, etc.)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.event, {
          event_category: 'newsletter',
          event_label: event.metadata?.source || 'unknown',
          custom_map: event.metadata,
        });
      }

      // Send to custom analytics endpoint
      await fetch('/api/analytics/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {
        // Silently fail analytics to not impact user experience
      });
    } catch (error) {
      // Silently fail analytics
      console.warn('Analytics tracking failed:', error);
    }
  }

  private async sendErrorToMonitoring(errorEvent: NewsletterErrorEvent): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Send to error monitoring service (Sentry, LogRocket, etc.)
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorEvent),
      }).catch(() => {
        // Silently fail error reporting
      });

      // Log to console for immediate debugging
      console.error('[Newsletter Error]', errorEvent.error.message, errorEvent);
    } catch (error) {
      console.warn('Error monitoring failed:', error);
    }
  }

  private sanitizeRequestData(data: any): any {
    if (!data) return data;
    
    const sanitized = { ...data };
    
    // Remove sensitive information
    if (sanitized.email) {
      const [local, domain] = sanitized.email.split('@');
      sanitized.email = `${local.charAt(0)}***@${domain}`;
    }
    
    if (sanitized.name) {
      sanitized.name = sanitized.name.charAt(0) + '***';
    }

    return sanitized;
  }
}

// Singleton instance
export const newsletterAnalytics = new NewsletterAnalytics();

// Convenience functions
export const trackNewsletterModalOpen = (source: 'get-notified' | 'subscribe-updates' | 'direct') => 
  newsletterAnalytics.trackModalOpen(source);

export const trackNewsletterModalClose = (timeOpen: number, wasSubmitted: boolean) => 
  newsletterAnalytics.trackModalClose(timeOpen, wasSubmitted);

export const trackNewsletterFormSubmit = (formData: { name: string; email: string }, source: string) => 
  newsletterAnalytics.trackFormSubmit(formData, source);

export const trackNewsletterSubscriptionSuccess = (email: string, isExisting: boolean) => 
  newsletterAnalytics.trackSubscriptionSuccess(email, isExisting);

export const trackNewsletterFormError = (error: Error, context: Record<string, any>) => 
  newsletterAnalytics.trackFormError(error, context);

export const trackNewsletterApiError = (endpoint: string, error: Error, requestData?: any) => 
  newsletterAnalytics.trackApiError(endpoint, error, requestData);

export const trackNewsletterValidationError = (field: string, error: string, value?: string) => 
  newsletterAnalytics.trackValidationError(field, error, value);

export const trackNewsletterPerformance = (metric: string, value: number, unit: 'ms' | 'bytes' | 'count') => 
  newsletterAnalytics.trackPerformance(metric, value, unit);