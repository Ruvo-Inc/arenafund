'use client';

import React from 'react';
import { ErrorMessage } from './ErrorMessage';

interface ErrorRecoveryProps {
  error: Error | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  className?: string;
  variant?: 'modal' | 'inline' | 'toast';
  showRetryCount?: boolean;
  autoRetry?: boolean;
}

interface ErrorRecoveryState {
  retryCount: number;
  isRetrying: boolean;
  lastRetryTime: number | null;
}

export function ErrorRecovery({
  error,
  onRetry,
  onDismiss,
  maxRetries = 3,
  retryDelay = 1000,
  className = '',
  variant = 'inline',
  showRetryCount = true,
  autoRetry = false
}: ErrorRecoveryProps) {
  const [state, setState] = React.useState<ErrorRecoveryState>({
    retryCount: 0,
    isRetrying: false,
    lastRetryTime: null
  });

  const [countdown, setCountdown] = React.useState<number>(0);

  // Auto-retry functionality
  React.useEffect(() => {
    if (autoRetry && error && state.retryCount < maxRetries && onRetry && !state.isRetrying) {
      const timer = setTimeout(() => {
        handleRetry();
      }, retryDelay);

      return () => clearTimeout(timer);
    }
  }, [error, autoRetry, state.retryCount, maxRetries, retryDelay, onRetry, state.isRetrying]);

  // Countdown timer for retry delay
  React.useEffect(() => {
    if (state.isRetrying && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (state.isRetrying && countdown === 0) {
      setState(prev => ({ ...prev, isRetrying: false }));
      onRetry?.();
    }
  }, [state.isRetrying, countdown, onRetry]);

  const handleRetry = React.useCallback(() => {
    if (state.retryCount >= maxRetries || state.isRetrying) {
      return;
    }

    setState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      isRetrying: true,
      lastRetryTime: Date.now()
    }));

    setCountdown(Math.ceil(retryDelay / 1000));
  }, [state.retryCount, maxRetries, retryDelay, state.isRetrying]);

  const handleDismiss = React.useCallback(() => {
    setState({
      retryCount: 0,
      isRetrying: false,
      lastRetryTime: null
    });
    setCountdown(0);
    onDismiss?.();
  }, [onDismiss]);

  const resetRetryCount = React.useCallback(() => {
    setState(prev => ({ ...prev, retryCount: 0 }));
  }, []);

  // Reset retry count when error changes or is cleared
  React.useEffect(() => {
    if (!error) {
      resetRetryCount();
    }
  }, [error, resetRetryCount]);

  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const canRetry = onRetry && state.retryCount < maxRetries;
  const isMaxRetriesReached = state.retryCount >= maxRetries;

  // Determine error type and customize message
  const getErrorDetails = (message: string) => {
    if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect. Please check your internet connection.',
        severity: 'error' as const
      };
    } else if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('too many')) {
      return {
        title: 'Too Many Requests',
        message: 'Please wait a moment before trying again.',
        severity: 'warning' as const
      };
    } else if (message.toLowerCase().includes('server') || message.toLowerCase().includes('500')) {
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again.',
        severity: 'error' as const
      };
    } else if (message.toLowerCase().includes('already subscribed')) {
      return {
        title: 'Already Subscribed',
        message: 'You\'re already subscribed! Thank you for your interest.',
        severity: 'info' as const
      };
    } else {
      return {
        title: 'Error',
        message: errorMessage,
        severity: 'error' as const
      };
    }
  };

  const errorDetails = getErrorDetails(errorMessage);

  // Enhance message with retry information
  let enhancedMessage = errorDetails.message;
  if (showRetryCount && state.retryCount > 0) {
    enhancedMessage += ` (Attempt ${state.retryCount}/${maxRetries})`;
  }
  if (isMaxRetriesReached && onRetry) {
    enhancedMessage += ' Maximum retry attempts reached.';
  }

  const retryLabel = state.isRetrying 
    ? `Retrying in ${countdown}s...` 
    : canRetry 
      ? `Try Again${showRetryCount && state.retryCount > 0 ? ` (${maxRetries - state.retryCount} left)` : ''}` 
      : 'Try Again';

  return (
    <ErrorMessage
      title={errorDetails.title}
      message={enhancedMessage}
      onRetry={canRetry && !state.isRetrying ? handleRetry : undefined}
      onDismiss={handleDismiss}
      retryLabel={retryLabel}
      dismissLabel={isMaxRetriesReached ? 'Close' : 'Dismiss'}
      className={className}
      variant={variant}
      severity={errorDetails.severity}
    />
  );
}

// Simplified hook for managing error recovery state
export function useErrorRecovery(maxRetries: number = 3) {
  const [error, setError] = React.useState<Error | string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleError = React.useCallback((err: Error | string) => {
    setError(err);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  const retry = React.useCallback(async (retryFn: () => void | Promise<void>) => {
    if (retryCount >= maxRetries) {
      return;
    }

    setRetryCount(prev => prev + 1);
    
    try {
      const result = retryFn();
      if (result instanceof Promise) {
        await result;
      }
      // Clear error on successful retry
      setError(null);
    } catch (err) {
      handleError(err as Error);
    }
  }, [retryCount, maxRetries, handleError]);

  const canRetry = retryCount < maxRetries;

  return {
    error,
    retryCount,
    canRetry,
    handleError,
    clearError,
    retry
  };
}