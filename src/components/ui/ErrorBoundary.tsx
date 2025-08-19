'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

/**
 * Production-grade error boundary for enhanced components
 * Provides graceful fallbacks and error reporting
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = this.logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      eventId,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo): string => {
    // In production, you would send this to your error reporting service
    // (Sentry, LogRocket, Bugsnag, etc.)
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorReport = {
      eventId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Component Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Full Report:', errorReport);
      console.groupEnd();
    }

    // In production, send to error reporting service
    // Example: Sentry.captureException(error, { contexts: { errorInfo } });

    return eventId;
  };

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
    
    // Add a small delay to prevent immediate re-error
    this.resetTimeoutId = window.setTimeout(() => {
      // Force a re-render by updating state
      this.forceUpdate();
    }, 100);
  };

  render() {
    const { hasError, error, eventId } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-red-900">
              Something went wrong
            </h3>
          </div>
          
          <p className="text-sm text-red-700 text-center mb-4 max-w-md">
            {error?.message || 'An unexpected error occurred while rendering this component.'}
          </p>

          {eventId && (
            <p className="text-xs text-red-600 mb-4 font-mono">
              Error ID: {eventId}
            </p>
          )}

          <button
            onClick={this.handleRetry}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 w-full">
              <summary className="cursor-pointer text-sm text-red-700 hover:text-red-900">
                Show Error Details
              </summary>
              <pre className="mt-2 p-4 bg-red-100 border border-red-200 rounded text-xs text-red-800 overflow-auto max-h-40">
                {error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return children;
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }

  return { captureError, resetError };
}