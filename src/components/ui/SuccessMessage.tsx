'use client';

import React from 'react';

interface SuccessMessageProps {
  title: string;
  message: string;
  onClose?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
  variant?: 'modal' | 'inline' | 'toast';
  showIcon?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function SuccessMessage({
  title,
  message,
  onClose,
  onAction,
  actionLabel = 'Close',
  className = '',
  variant = 'modal',
  showIcon = true,
  autoClose = false,
  autoCloseDelay = 3000
}: SuccessMessageProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  // Auto-close functionality
  React.useEffect(() => {
    if (autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  const baseClasses = 'success-message';
  const variantClasses = {
    modal: 'text-center p-6',
    inline: 'p-4 border border-green-200 bg-green-50 rounded-md',
    toast: 'fixed top-4 right-4 z-50 p-4 bg-white border border-green-200 rounded-lg shadow-lg max-w-sm'
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {showIcon && (
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
          <svg 
            className="w-6 h-6 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
      
      <h3 
        className="text-lg font-semibold text-arena-hunter-green mb-2"
        id="success-title"
      >
        {title}
      </h3>
      
      <p 
        className="text-gray-600 mb-4"
        id="success-description"
      >
        {message}
      </p>
      
      {(onClose || onAction) && (
        <button
          onClick={handleAction}
          className="w-full bg-arena-hunter-green hover:bg-arena-hunter-green/90 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 btn-mobile touch-target"
          aria-describedby="success-title success-description"
        >
          {actionLabel}
        </button>
      )}
      
      {variant === 'toast' && onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
          aria-label="Close success message"
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
  );
}

// Specific success message for newsletter subscription
export function NewsletterSuccessMessage({ 
  onClose, 
  className = '' 
}: { 
  onClose?: () => void; 
  className?: string; 
}) {
  return (
    <SuccessMessage
      title="Successfully Subscribed!"
      message="Thank you for subscribing to Arena Fund insights. You'll receive notifications when we publish new articles."
      onClose={onClose}
      actionLabel="Close"
      className={className}
      variant="modal"
    />
  );
}