'use client';

import React from 'react';
// Simple button component for the form
import { Input } from './ui/Input';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { PrivacyNotice } from './PrivacyNotice';
import { useNewsletterSubscription } from '../hooks/useNewsletterSubscription';
import { useNewsletterFormAnalytics } from '@/hooks/useNewsletterAnalytics';
import { 
  NetworkErrorMessage, 
  ServerErrorMessage, 
  RateLimitErrorMessage, 
  AlreadySubscribedMessage,
  ErrorMessage 
} from './ui/ErrorMessage';

interface NewsletterFormProps {
  triggerSource?: 'get-notified' | 'subscribe-updates';
  className?: string;
  onSuccess?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function NewsletterForm({ triggerSource, className = '', onSuccess, onLoadingChange }: NewsletterFormProps) {
  const {
    formData,
    errors,
    submissionState,
    handleInputChange,
    handleSubmit,
    resetForm
  } = useNewsletterSubscription(triggerSource);

  // Analytics tracking for form interactions
  const { trackFieldFocus, trackFieldBlur, trackFieldError } = useNewsletterFormAnalytics();

  const handleFieldChange = (field: 'name' | 'email') => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(field, e.target.value);
  };

  const handleFocus = (field: 'name' | 'email') => () => {
    trackFieldFocus(field);
  };

  const handleBlur = (field: 'name' | 'email') => () => {
    const value = formData[field];
    const hasError = !!errors[field];
    trackFieldBlur(field, value, hasError);
    
    if (hasError) {
      trackFieldError(field, errors[field] || '', value);
    }
  };

  // Call onSuccess when submission is successful
  React.useEffect(() => {
    if (submissionState.isSuccess && onSuccess) {
      onSuccess();
    }
  }, [submissionState.isSuccess, onSuccess]);

  // Notify parent about loading state changes
  React.useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(submissionState.isLoading);
    }
  }, [submissionState.isLoading, onLoadingChange]);

  // Retry mechanism
  const handleRetry = React.useCallback(() => {
    // Reset form errors and retry submission
    resetForm();
  }, [resetForm]);

  // Render appropriate error component based on error type
  const renderErrorMessage = () => {
    if (!errors.general) return null;

    const errorMessage = errors.general.toLowerCase();

    if (errorMessage.includes('network') || errorMessage.includes('connect')) {
      return (
        <NetworkErrorMessage
          onRetry={handleRetry}
          onDismiss={() => handleInputChange('name', formData.name)} // Clear error
          className="mb-4"
        />
      );
    } else if (errorMessage.includes('server') || errorMessage.includes('wrong')) {
      return (
        <ServerErrorMessage
          onRetry={handleRetry}
          onDismiss={() => handleInputChange('name', formData.name)} // Clear error
          className="mb-4"
        />
      );
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
      return (
        <RateLimitErrorMessage
          onDismiss={() => handleInputChange('name', formData.name)} // Clear error
          className="mb-4"
        />
      );
    } else if (errorMessage.includes('already subscribed')) {
      return (
        <AlreadySubscribedMessage
          onDismiss={() => handleInputChange('name', formData.name)} // Clear error
          className="mb-4"
        />
      );
    } else {
      return (
        <ErrorMessage
          message={errors.general}
          onRetry={handleRetry}
          onDismiss={() => handleInputChange('name', formData.name)} // Clear error
          className="mb-4"
          variant="inline"
          severity="error"
        />
      );
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`
        space-y-4 transition-all duration-300 ease-in-out
        ${submissionState.isLoading ? 'opacity-90 scale-[0.99]' : 'opacity-100 scale-100'}
        ${className}
      `}
      aria-busy={submissionState.isLoading}
    >
      {/* Progress indicator during loading */}
      {submissionState.isLoading && (
        <div className="form-progress-container" role="progressbar" aria-label="Submitting form">
          <div className="form-progress animate-pulse" style={{ width: '100%' }}></div>
        </div>
      )}

      {/* Enhanced error message with recovery */}
      {renderErrorMessage()}

      {/* Name field */}
      <div className="space-y-2">
        <label 
          htmlFor="newsletter-name" 
          className={`
            block text-sm font-medium transition-colors duration-200
            ${submissionState.isLoading ? 'text-gray-400' : 'text-arena-hunter-green'}
          `}
        >
          Name *
        </label>
        <Input
          id="newsletter-name"
          type="text"
          value={formData.name}
          onChange={handleFieldChange('name')}
          onFocus={handleFocus('name')}
          onBlur={handleBlur('name')}
          placeholder="Enter your full name"
          className={`
            w-full form-input-mobile transition-all duration-200 ease-in-out
            ${errors.name ? 'border-arena-bright-umber bg-arena-sunrise animate-shake' : ''}
            ${submissionState.isLoading ? 'bg-gray-50 text-gray-500 cursor-not-allowed opacity-75' : 'hover:border-arena-hunter-green/50'}
          `}
          disabled={submissionState.isLoading}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error name-help' : 'name-help'}
          aria-required="true"
          autoComplete="name"
        />
        <div id="name-help" className="sr-only">
          Enter your full name for newsletter subscription
        </div>
        {errors.name && !submissionState.isLoading && (
          <p id="name-error" className="text-arena-bright-umber text-sm font-medium animate-fade-in" role="alert" aria-live="polite">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email field */}
      <div className="space-y-2">
        <label 
          htmlFor="newsletter-email" 
          className={`
            block text-sm font-medium transition-colors duration-200
            ${submissionState.isLoading ? 'text-gray-400' : 'text-arena-hunter-green'}
          `}
        >
          Email Address *
        </label>
        <Input
          id="newsletter-email"
          type="email"
          value={formData.email}
          onChange={handleFieldChange('email')}
          onFocus={handleFocus('email')}
          onBlur={handleBlur('email')}
          placeholder="Enter your email address"
          className={`
            w-full form-input-mobile transition-all duration-200 ease-in-out
            ${errors.email ? 'border-arena-bright-umber bg-arena-sunrise animate-shake' : ''}
            ${submissionState.isLoading ? 'bg-gray-50 text-gray-500 cursor-not-allowed opacity-75' : 'hover:border-arena-hunter-green/50'}
          `}
          disabled={submissionState.isLoading}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error email-help' : 'email-help'}
          aria-required="true"
          autoComplete="email"
          inputMode="email"
        />
        <div id="email-help" className="sr-only">
          Enter your email address to receive newsletter updates
        </div>
        {errors.email && !submissionState.isLoading && (
          <p id="email-error" className="text-arena-bright-umber text-sm font-medium animate-fade-in" role="alert" aria-live="polite">
            {errors.email}
          </p>
        )}
      </div>

      {/* Privacy notice */}
      <PrivacyNotice 
        variant="modal"
        className="mt-4"
      />

      {/* Submit button with enhanced loading states */}
      <button
        type="submit"
        disabled={submissionState.isLoading}
        className={`
          w-full font-medium py-3 px-4 rounded-md flex items-center justify-center gap-2 btn-mobile touch-target
          transition-all duration-300 ease-in-out
          ${submissionState.isLoading 
            ? 'bg-arena-hunter-green/70 text-white/80 cursor-not-allowed transform scale-[0.98]' 
            : 'bg-arena-hunter-green hover:bg-arena-hunter-green/90 text-white hover:transform hover:scale-[1.02] hover:shadow-lg'
          }
          ${submissionState.isLoading ? 'animate-pulse' : ''}
          focus:outline-none focus:ring-2 focus:ring-arena-gold focus:ring-offset-2
        `}
        aria-describedby="submit-help"
        aria-live="polite"
      >
        {submissionState.isLoading ? (
          <>
            <LoadingSpinner size="sm" className="border-white border-t-white/30" />
            <span className="animate-fade-in">Subscribing...</span>
            <span className="sr-only">Please wait while we process your subscription</span>
          </>
        ) : (
          <span className="transition-all duration-200">Subscribe to Newsletter</span>
        )}
      </button>
      <div id="submit-help" className="sr-only">
        Click to subscribe to Arena Fund newsletter updates
      </div>
    </form>
  );
}