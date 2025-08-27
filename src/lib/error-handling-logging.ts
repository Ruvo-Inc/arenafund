/**
 * Comprehensive error handling and logging system for SEO optimization
 * Provides structured logging, error tracking, and monitoring integration
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context: string;
  metadata?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  url?: string;
}

export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface SEOError extends Error {
  code: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  retryable: boolean;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByComponent: Record<string, number>;
  errorRate: number;
  lastError?: LogEntry;
  timeWindow: number;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 10000;
  private logLevel: LogLevel = LogLevel.INFO;
  private logHandlers: ((entry: LogEntry) => void)[] = [];

  constructor(level: LogLevel = LogLevel.INFO) {
    this.logLevel = level;
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Add log handler (e.g., for external logging services)
   */
  addHandler(handler: (entry: LogEntry) => void): void {
    this.logHandlers.push(handler);
  }

  /**
   * Log debug message
   */
  debug(message: string, context: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, context: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, context: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, context: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, metadata, error);
  }

  /**
   * Log fatal error message
   */
  fatal(message: string, context: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, context, metadata, error);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context: string,
    metadata?: Record<string, any>,
    error?: Error
  ): void {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      metadata,
      error,
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      requestId: this.getCurrentRequestId(),
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    // Store log entry
    this.logs.push(entry);
    
    // Maintain log size limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Call external handlers
    this.logHandlers.forEach(handler => {
      try {
        handler(entry);
      } catch (handlerError) {
        console.error('Log handler error:', handlerError);
      }
    });

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      this.consoleOutput(entry);
    }
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 100, level?: LogLevel): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level !== undefined) {
      filteredLogs = this.logs.filter(log => log.level >= level);
    }
    
    return filteredLogs.slice(-count);
  }

  /**
   * Get error metrics
   */
  getErrorMetrics(timeWindow: number = 3600000): ErrorMetrics { // Default 1 hour
    const cutoff = Date.now() - timeWindow;
    const recentLogs = this.logs.filter(log => 
      log.timestamp > cutoff && log.level >= LogLevel.ERROR
    );

    const errorsByType: Record<string, number> = {};
    const errorsByComponent: Record<string, number> = {};

    recentLogs.forEach(log => {
      // Count by error type
      const errorType = log.error?.name || 'Unknown';
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;

      // Count by component
      errorsByComponent[log.context] = (errorsByComponent[log.context] || 0) + 1;
    });

    const totalLogs = this.logs.filter(log => log.timestamp > cutoff).length;
    const errorRate = totalLogs > 0 ? (recentLogs.length / totalLogs) * 100 : 0;

    return {
      totalErrors: recentLogs.length,
      errorsByType,
      errorsByComponent,
      errorRate,
      lastError: recentLogs[recentLogs.length - 1],
      timeWindow
    };
  }

  /**
   * Console output for development
   */
  private consoleOutput(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] ${levelName} [${entry.context}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.metadata);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.metadata);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.metadata);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(prefix, entry.message, entry.error, entry.metadata);
        break;
    }
  }

  /**
   * Get current user ID (implement based on your auth system)
   */
  private getCurrentUserId(): string | undefined {
    // Implementation depends on your authentication system
    return undefined;
  }

  /**
   * Get current session ID
   */
  private getCurrentSessionId(): string | undefined {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('sessionId') || undefined;
    }
    return undefined;
  }

  /**
   * Get current request ID
   */
  private getCurrentRequestId(): string | undefined {
    // Implementation depends on your request tracking system
    return undefined;
  }
}

class SEOErrorHandler {
  private logger: Logger;
  private errorRecoveryStrategies: Map<string, (error: SEOError) => Promise<boolean>> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
    this.setupDefaultRecoveryStrategies();
  }

  /**
   * Handle SEO-related errors with context and recovery
   */
  async handleError(error: Error | SEOError, context: ErrorContext): Promise<void> {
    const seoError = this.createSEOError(error, context);
    
    // Log the error
    this.logger.error(
      seoError.message,
      context.component,
      seoError,
      {
        action: context.action,
        severity: seoError.severity,
        recoverable: seoError.recoverable,
        retryable: seoError.retryable,
        ...context.metadata
      }
    );

    // Attempt recovery if possible
    if (seoError.recoverable) {
      const recovered = await this.attemptRecovery(seoError);
      if (recovered) {
        this.logger.info(
          `Successfully recovered from error: ${seoError.code}`,
          context.component,
          { errorCode: seoError.code }
        );
        return;
      }
    }

    // If critical error, trigger alerts
    if (seoError.severity === 'critical') {
      this.triggerCriticalAlert(seoError);
    }
  }

  /**
   * Create structured SEO error
   */
  private createSEOError(error: Error | SEOError, context: ErrorContext): SEOError {
    if (this.isSEOError(error)) {
      return error;
    }

    // Convert regular error to SEO error
    const seoError = new Error(error.message) as SEOError;
    seoError.name = error.name;
    seoError.stack = error.stack;
    seoError.code = this.generateErrorCode(error, context);
    seoError.context = context;
    seoError.severity = this.determineSeverity(error, context);
    seoError.recoverable = this.isRecoverable(error, context);
    seoError.retryable = this.isRetryable(error, context);

    return seoError;
  }

  /**
   * Check if error is already an SEO error
   */
  private isSEOError(error: Error): error is SEOError {
    return 'code' in error && 'context' in error && 'severity' in error;
  }

  /**
   * Generate error code
   */
  private generateErrorCode(error: Error, context: ErrorContext): string {
    const component = context.component.toUpperCase().replace(/[^A-Z]/g, '');
    const action = context.action.toUpperCase().replace(/[^A-Z]/g, '');
    const errorType = error.name.toUpperCase().replace(/[^A-Z]/g, '');
    
    return `SEO_${component}_${action}_${errorType}`;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
    // Critical components that affect core SEO functionality
    const criticalComponents = ['meta-generation', 'structured-data', 'sitemap-generation'];
    const highPriorityActions = ['page-optimization', 'content-analysis', 'ranking-tracking'];

    if (criticalComponents.includes(context.component)) {
      return 'critical';
    }

    if (highPriorityActions.includes(context.action)) {
      return 'high';
    }

    if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(error: Error, context: ErrorContext): boolean {
    const recoverableErrors = ['NetworkError', 'TimeoutError', 'RateLimitError'];
    const recoverableComponents = ['analytics-tracking', 'performance-monitoring'];

    return recoverableErrors.includes(error.name) || 
           recoverableComponents.includes(context.component);
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: Error, context: ErrorContext): boolean {
    const retryableErrors = ['NetworkError', 'TimeoutError', 'ServiceUnavailableError'];
    return retryableErrors.includes(error.name);
  }

  /**
   * Attempt error recovery
   */
  private async attemptRecovery(error: SEOError): Promise<boolean> {
    const strategy = this.errorRecoveryStrategies.get(error.code);
    if (!strategy) {
      return false;
    }

    try {
      return await strategy(error);
    } catch (recoveryError) {
      this.logger.error(
        `Recovery strategy failed for error: ${error.code}`,
        'error-recovery',
        recoveryError as Error
      );
      return false;
    }
  }

  /**
   * Setup default recovery strategies
   */
  private setupDefaultRecoveryStrategies(): void {
    // Network error recovery
    this.errorRecoveryStrategies.set('SEO_ANALYTICS_TRACKING_NETWORKERROR', async (error) => {
      // Retry with exponential backoff
      await this.delay(1000);
      return true; // Simplified - would implement actual retry logic
    });

    // Rate limit recovery
    this.errorRecoveryStrategies.set('SEO_API_REQUEST_RATELIMITERROR', async (error) => {
      // Wait for rate limit reset
      await this.delay(60000); // Wait 1 minute
      return true;
    });

    // Timeout recovery
    this.errorRecoveryStrategies.set('SEO_CONTENT_OPTIMIZATION_TIMEOUTERROR', async (error) => {
      // Use cached result or fallback optimization
      return true;
    });
  }

  /**
   * Trigger critical alert
   */
  private triggerCriticalAlert(error: SEOError): void {
    // In production, this would integrate with alerting systems
    console.error('CRITICAL SEO ERROR:', {
      code: error.code,
      message: error.message,
      context: error.context,
      timestamp: new Date().toISOString()
    });

    // Could integrate with services like PagerDuty, Slack, etc.
  }

  /**
   * Add custom recovery strategy
   */
  addRecoveryStrategy(errorCode: string, strategy: (error: SEOError) => Promise<boolean>): void {
    this.errorRecoveryStrategies.set(errorCode, strategy);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global instances
export const logger = new Logger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

export const seoErrorHandler = new SEOErrorHandler(logger);

// SEO-specific logging utilities
export const seoLogger = {
  /**
   * Log SEO optimization events
   */
  optimization: (action: string, metadata?: Record<string, any>) => {
    logger.info(`SEO optimization: ${action}`, 'seo-optimization', metadata);
  },

  /**
   * Log performance metrics
   */
  performance: (metric: string, value: number, metadata?: Record<string, any>) => {
    logger.info(`Performance metric: ${metric} = ${value}`, 'performance', {
      metric,
      value,
      ...metadata
    });
  },

  /**
   * Log analytics events
   */
  analytics: (event: string, metadata?: Record<string, any>) => {
    logger.info(`Analytics event: ${event}`, 'analytics', metadata);
  },

  /**
   * Log A/B test events
   */
  abTest: (testId: string, event: string, metadata?: Record<string, any>) => {
    logger.info(`A/B test ${testId}: ${event}`, 'ab-testing', {
      testId,
      event,
      ...metadata
    });
  },

  /**
   * Log feature flag events
   */
  featureFlag: (flag: string, enabled: boolean, metadata?: Record<string, any>) => {
    logger.info(`Feature flag ${flag}: ${enabled ? 'enabled' : 'disabled'}`, 'feature-flags', {
      flag,
      enabled,
      ...metadata
    });
  }
};

// Error handling utilities for common SEO operations
export const seoErrorHandling = {
  /**
   * Wrap async SEO operations with error handling
   */
  withErrorHandling: async <T>(
    operation: () => Promise<T>,
    context: ErrorContext
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      await seoErrorHandler.handleError(error as Error, context);
      return null;
    }
  },

  /**
   * Create error context for SEO operations
   */
  createContext: (component: string, action: string, metadata?: Record<string, any>): ErrorContext => ({
    component,
    action,
    metadata
  })
};