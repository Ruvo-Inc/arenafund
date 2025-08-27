'use client';

import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  className?: string;
  variant?: 'modal' | 'inline' | 'toast' | 'field';
  showIcon?: boolean;
  severity?: 'error' | 'warning' | 'info';
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function ErrorMessage({
  title,
  message,
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  dismissLabel = 'Dismiss',
  className = '',
  variant = 'inline',
  showIcon = true,
  severity = 'error',
  autoClose = false,
  autoCloseDelay = 5000
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  // Auto-close functionality
  React.useEffect(() => {
    if (autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const severityConfig = {
    error: {
      bgColor: 'bg-arena-sunrise',
      borderColor: 'border-arena-bright-umber',
      textColor: 'text-arena-bright-umber',
      iconColor: 'text-arena-bright-umber',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const config = severityConfig[severity];

  const baseClasses = 'error-message';
  const variantClasses = {
    modal: 'text-center p-6',
    inline: `p-4 border ${config.borderColor} ${config.bgColor} rounded-md`,
    toast: `fixed top-4 right-4 z-50 p-4 bg-white border ${config.borderColor} rounded-lg shadow-lg max-w-sm`,
    field: `p-3 ${config.bgColor} border ${config.borderColor} rounded-md`
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start">
        {showIcon && (
          <div className={`flex-shrink-0 ${config.iconColor} mr-3`}>
            {config.icon}
          </div>
        )}
        
        <div className="flex-1">
          {title && (
            <h3 
              className={`text-sm font-medium ${config.textColor} mb-1`}
              id="error-title"
            >
              {title}
            </h3>
          )}
          
          <p 
            className={`text-sm ${config.textColor}`}
            id="error-description"
          >
            {message}
          </p>
          
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-arena-hunter-green hover:bg-arena-hunter-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-arena-hunter-green transition-colors duration-200"
                  aria-describedby={title ? "error-title error-description" : "error-description"}
                >
                  {retryLabel}
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md ${config.textColor} bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-arena-hunter-green transition-colors duration-200`}
                  aria-describedby={title ? "error-title error-description" : "error-description"}
                >
                  {dismissLabel}
                </button>
              )}
            </div>
          )}
        </div>
        
        {variant === 'toast' && onDismiss && (
          <button
            onClick={handleDismiss}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close error message"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Specific error messages for common newsletter subscription errors
export function NetworkErrorMessage({ 
  onRetry, 
  onDismiss, 
  className = '' 
}: { 
  onRetry?: () => void; 
  onDismiss?: () => void; 
  className?: string; 
}) {
  return (
    <ErrorMessage
      title="Connection Error"
      message="Unable to connect. Please check your internet connection and try again."
      onRetry={onRetry}
      onDismiss={onDismiss}
      className={className}
      variant="inline"
      severity="error"
    />
  );
}

export function ServerErrorMessage({ 
  onRetry, 
  onDismiss, 
  className = '' 
}: { 
  onRetry?: () => void; 
  onDismiss?: () => void; 
  className?: string; 
}) {
  return (
    <ErrorMessage
      title="Server Error"
      message="Something went wrong on our end. Please try again in a moment."
      onRetry={onRetry}
      onDismiss={onDismiss}
      className={className}
      variant="inline"
      severity="error"
    />
  );
}

export function RateLimitErrorMessage({ 
  onDismiss, 
  className = '' 
}: { 
  onDismiss?: () => void; 
  className?: string; 
}) {
  return (
    <ErrorMessage
      title="Too Many Requests"
      message="You're sending requests too quickly. Please wait a moment before trying again."
      onDismiss={onDismiss}
      dismissLabel="OK"
      className={className}
      variant="inline"
      severity="warning"
      autoClose={true}
      autoCloseDelay={5000}
    />
  );
}

export function AlreadySubscribedMessage({ 
  onDismiss, 
  className = '' 
}: { 
  onDismiss?: () => void; 
  className?: string; 
}) {
  return (
    <ErrorMessage
      title="Already Subscribed"
      message="You're already subscribed! Thank you for your interest in Arena Fund insights."
      onDismiss={onDismiss}
      dismissLabel="OK"
      className={className}
      variant="inline"
      severity="info"
    />
  );
}