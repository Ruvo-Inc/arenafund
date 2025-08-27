'use client';

import { useState, useCallback } from 'react';
import { 
  trackNewsletterFormSubmit, 
  trackNewsletterSubscriptionSuccess, 
  trackNewsletterFormError,
  trackNewsletterApiError,
  trackNewsletterValidationError,
  trackNewsletterPerformance
} from '@/lib/newsletter-analytics';

interface NewsletterFormData {
  name: string;
  email: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  general?: string;
}

interface SubmissionState {
  isLoading: boolean;
  isSuccess: boolean;
  error?: string;
}

interface UseNewsletterSubscriptionReturn {
  formData: NewsletterFormData;
  errors: ValidationErrors;
  submissionState: SubmissionState;
  handleInputChange: (field: keyof NewsletterFormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

interface SubscribeRequest {
  name: string;
  email: string;
  source?: string;
  metadata?: {
    userAgent: string;
    timestamp: string;
  };
  consent?: {
    gdprApplies: boolean;
    ccpaApplies: boolean;
    consentMethod: 'checkbox' | 'opt_in' | 'implied';
    dataProcessingPurposes: string[];
  };
}

interface SubscribeResponse {
  success: boolean;
  message: string;
  isExistingSubscriber?: boolean;
}

const ERROR_MESSAGES = {
  REQUIRED_NAME: 'Please enter your name',
  REQUIRED_EMAIL: 'Please enter your email address',
  INVALID_EMAIL: 'Please enter a valid email address',
  ALREADY_SUBSCRIBED: 'You\'re already subscribed! Thank you for your interest.',
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  RATE_LIMITED: 'Too many requests. Please wait a moment before trying again.'
};

// Enhanced email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Name validation patterns
const NAME_PATTERNS = {
  VALID_NAME: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'\.]+$/,
  SUSPICIOUS_CHARS: /[0-9@#$%^&*()_+={}[\]|\\:";?/<>~`]/,
  REPEATED_CHARS: /(.)\1{4,}/,
  HTML_TAGS: /<[^>]*>/g,
  SCRIPT_TAGS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
};

// Suspicious patterns for security
const SUSPICIOUS_PATTERNS = [
  /javascript:/i,
  /vbscript:/i,
  /data:/i,
  /on\w+\s*=/i,
  /<script/i,
  /<iframe/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
];

export function useNewsletterSubscription(source?: string): UseNewsletterSubscriptionReturn {
  const [formData, setFormData] = useState<NewsletterFormData>({
    name: '',
    email: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isLoading: false,
    isSuccess: false,
    error: undefined
  });

  // Enhanced input sanitization
  const sanitizeInput = useCallback((input: string): string => {
    return input
      .trim()
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .substring(0, 254); // Limit length
  }, []);

  // Check for suspicious patterns
  const containsSuspiciousPatterns = useCallback((input: string): boolean => {
    return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(input));
  }, []);

  const validateField = useCallback((field: keyof NewsletterFormData, value: string): string | undefined => {
    const sanitizedValue = sanitizeInput(value);
    
    // Check for suspicious patterns first
    if (containsSuspiciousPatterns(sanitizedValue)) {
      const errorMessage = 'Input contains invalid characters';
      trackNewsletterValidationError(field, errorMessage, value);
      return errorMessage;
    }

    switch (field) {
      case 'name':
        if (!sanitizedValue) {
          trackNewsletterValidationError(field, ERROR_MESSAGES.REQUIRED_NAME, value);
          return ERROR_MESSAGES.REQUIRED_NAME;
        }
        if (sanitizedValue.length < 2) {
          const errorMessage = 'Name must be at least 2 characters long';
          trackNewsletterValidationError(field, errorMessage, value);
          return errorMessage;
        }
        if (sanitizedValue.length > 100) {
          const errorMessage = 'Name must be less than 100 characters';
          trackNewsletterValidationError(field, errorMessage, value);
          return errorMessage;
        }
        if (NAME_PATTERNS.SUSPICIOUS_CHARS.test(sanitizedValue)) {
          const errorMessage = 'Name contains invalid characters';
          trackNewsletterValidationError(field, errorMessage, value);
          return errorMessage;
        }
        if (NAME_PATTERNS.REPEATED_CHARS.test(sanitizedValue)) {
          const errorMessage = 'Name contains suspicious patterns';
          trackNewsletterValidationError(field, errorMessage, value);
          return errorMessage;
        }
        if (!NAME_PATTERNS.VALID_NAME.test(sanitizedValue)) {
          const errorMessage = 'Name can only contain letters, spaces, hyphens, apostrophes, and dots';
          trackNewsletterValidationError(field, errorMessage, value);
          return errorMessage;
        }
        return undefined;
      
      case 'email':
        if (!sanitizedValue) {
          trackNewsletterValidationError(field, ERROR_MESSAGES.REQUIRED_EMAIL, value);
          return ERROR_MESSAGES.REQUIRED_EMAIL;
        }
        if (sanitizedValue.length > 254) {
          const errorMessage = 'Email address is too long';
          trackNewsletterValidationError(field, errorMessage, value);
          return errorMessage;
        }
        if (!EMAIL_REGEX.test(sanitizedValue)) {
          trackNewsletterValidationError(field, ERROR_MESSAGES.INVALID_EMAIL, value);
          return ERROR_MESSAGES.INVALID_EMAIL;
        }
        // Additional email validation
        if (sanitizedValue.includes('..')) {
          const errorMessage = 'Email cannot contain consecutive dots';
          trackNewsletterValidationError(field, errorMessage, value);
          return errorMessage;
        }
        const [localPart, domain] = sanitizedValue.split('@');
        if (localPart.length > 64) {
          const errorMessage = 'Email local part is too long';
          trackNewsletterValidationError(field, errorMessage, value);
          return errorMessage;
        }
        if (domain.length > 253) {
          const errorMessage = 'Email domain is too long';
          trackNewsletterValidationError(field, errorMessage, value);
          return errorMessage;
        }
        if (localPart.startsWith('.') || localPart.endsWith('.')) {
          const errorMessage = 'Email local part cannot start or end with a dot';
          trackNewsletterValidationError(field, errorMessage, value);
          return errorMessage;
        }
        return undefined;
      
      default:
        return undefined;
    }
  }, [sanitizeInput, containsSuspiciousPatterns]);

  const validateForm = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    const nameError = validateField('name', formData.name);
    if (nameError) newErrors.name = nameError;
    
    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;
    
    return newErrors;
  }, [formData, validateField]);

  const handleInputChange = useCallback((field: keyof NewsletterFormData, value: string) => {
    // Sanitize input before setting
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
    
    // Reset submission state if there was an error
    if (submissionState.error) {
      setSubmissionState(prev => ({ ...prev, error: undefined }));
    }
  }, [errors, submissionState.error, sanitizeInput]);

  const submitSubscription = useCallback(async (data: NewsletterFormData): Promise<SubscribeResponse> => {
    const startTime = performance.now();
    
    // Get CSRF token with enhanced error handling
    let csrfToken: string | undefined;
    try {
      const csrfResponse = await fetch('/api/newsletter/subscribe', {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();
        csrfToken = csrfData.csrfToken;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[Newsletter] CSRF token obtained successfully');
        }
      } else {
        console.warn('[Newsletter] Failed to get CSRF token:', csrfResponse.status, csrfResponse.statusText);
      }
    } catch (error) {
      console.warn('[Newsletter] CSRF token request failed:', error);
      trackNewsletterApiError('/api/newsletter/subscribe', error as Error, { method: 'OPTIONS' });
      // Continue without CSRF token - API will handle gracefully
    }

    const requestData: SubscribeRequest = {
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email.toLowerCase()),
      source: source || 'newsletter-form',
      metadata: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        timestamp: new Date().toISOString()
      },
      consent: {
        gdprApplies: true, // Assume GDPR applies for safety
        ccpaApplies: true, // Assume CCPA applies for safety
        consentMethod: 'opt_in', // User actively opted in via form
        dataProcessingPurposes: [
          'newsletter_delivery',
          'content_personalization',
          'service_improvement',
          'analytics'
        ]
      }
      // Skip CSRF token for now
      // ...(csrfToken && { csrfToken })
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Skip CSRF token header for now
    // if (csrfToken) {
    //   headers['X-CSRF-Token'] = csrfToken;
    // }

    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData),
    });

    // Track API performance
    const duration = performance.now() - startTime;
    trackNewsletterPerformance('api_subscription_request', Math.round(duration), 'ms');

    if (!response.ok) {
      const error = new Error();
      if (response.status === 429) {
        error.message = 'rate limit exceeded';
        (error as any).status = 429;
      } else if (response.status === 403) {
        error.message = 'security validation failed';
        (error as any).status = 403;
      } else if (response.status >= 500) {
        error.message = 'server error';
        (error as any).status = response.status;
      } else {
        const errorData = await response.json().catch(() => ({}));
        error.message = errorData.message || 'submission failed';
        (error as any).status = response.status;
      }
      
      trackNewsletterApiError('/api/newsletter/subscribe', error, requestData);
      throw error;
    }

    const result = await response.json();
    
    // Track successful API response
    trackNewsletterPerformance('api_subscription_success', Math.round(performance.now() - startTime), 'ms');
    
    return result;
  }, [source, sanitizeInput]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track form submission attempt
    trackNewsletterFormSubmit(formData, source || 'newsletter-form');
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      // Track validation failure
      const validationError = new Error('Form validation failed');
      trackNewsletterFormError(validationError, { 
        errors: formErrors, 
        formData: { hasName: !!formData.name, hasEmail: !!formData.email } 
      });
      return;
    }

    setSubmissionState({
      isLoading: true,
      isSuccess: false,
      error: undefined
    });

    try {
      const response = await submitSubscription(formData);
      
      if (response.success) {
        setSubmissionState({
          isLoading: false,
          isSuccess: true,
          error: undefined
        });
        
        // Track successful subscription
        trackNewsletterSubscriptionSuccess(formData.email, response.isExistingSubscriber || false);
        
        // Clear any existing errors
        setErrors({});
        
        if (response.isExistingSubscriber) {
          setErrors({ general: ERROR_MESSAGES.ALREADY_SUBSCRIBED });
        }
      } else {
        throw new Error(response.message || 'Subscription failed');
      }
    } catch (error: any) {
      let errorMessage = ERROR_MESSAGES.SERVER_ERROR;
      
      if (error.message?.includes('already subscribed')) {
        errorMessage = ERROR_MESSAGES.ALREADY_SUBSCRIBED;
      } else if (error.message?.includes('rate limit')) {
        errorMessage = ERROR_MESSAGES.RATE_LIMITED;
      } else if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
        errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      }
      
      // Track form submission error
      trackNewsletterFormError(error, {
        errorMessage,
        formData: { hasName: !!formData.name, hasEmail: !!formData.email },
        source: source || 'newsletter-form'
      });
      
      setSubmissionState({
        isLoading: false,
        isSuccess: false,
        error: errorMessage
      });
      
      setErrors({ general: errorMessage });
    }
  }, [formData, validateForm, submitSubscription, source]);

  const resetForm = useCallback(() => {
    setFormData({ name: '', email: '' });
    setErrors({});
    setSubmissionState({
      isLoading: false,
      isSuccess: false,
      error: undefined
    });
  }, []);

  return {
    formData,
    errors,
    submissionState,
    handleInputChange,
    handleSubmit,
    resetForm
  };
}