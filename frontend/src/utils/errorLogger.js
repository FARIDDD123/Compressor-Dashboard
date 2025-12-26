// src/utils/errorLogger.js

/**
 * Error Logging Service
 * Centralized error logging with support for external services
 */

// Configuration
const ERROR_LOGGING_CONFIG = {
  enabled: import.meta.env.VITE_ERROR_LOGGING_ENABLED !== 'false',
  logToConsole: import.meta.env.NODE_ENV === 'development',
  logToService: import.meta.env.VITE_ERROR_LOGGING_SERVICE_URL || null,
  maxRetries: 3,
  retryDelay: 1000,
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Error categories
 */
export const ErrorCategory = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NETWORK: 'network',
  VALIDATION: 'validation',
  RUNTIME: 'runtime',
  API: 'api',
  WEBSOCKET: 'websocket',
  UNKNOWN: 'unknown',
};

/**
 * Enhanced error information
 */
class ErrorInfo {
  constructor(error, context = {}) {
    this.timestamp = new Date().toISOString();
    this.message = error?.message || String(error);
    this.stack = error?.stack || null;
    this.name = error?.name || 'Error';
    this.severity = context.severity || ErrorSeverity.MEDIUM;
    this.category = context.category || ErrorCategory.UNKNOWN;
    this.userAgent = navigator.userAgent;
    this.url = window.location.href;
    this.userId = context.userId || null;
    this.sessionId = context.sessionId || this.generateSessionId();
    this.additionalData = context.additionalData || {};
    this.errorType = this.determineErrorType(error);
  }

  determineErrorType(error) {
    if (error instanceof TypeError) return 'TypeError';
    if (error instanceof ReferenceError) return 'ReferenceError';
    if (error instanceof SyntaxError) return 'SyntaxError';
    if (error instanceof RangeError) return 'RangeError';
    if (error instanceof Error) return 'Error';
    return 'Unknown';
  }

  generateSessionId() {
    return sessionStorage.getItem('session_id') || 
           (() => {
             const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
             sessionStorage.setItem('session_id', id);
             return id;
           })();
  }

  toJSON() {
    return {
      timestamp: this.timestamp,
      message: this.message,
      stack: this.stack,
      name: this.name,
      severity: this.severity,
      category: this.category,
      errorType: this.errorType,
      userAgent: this.userAgent,
      url: this.url,
      userId: this.userId,
      sessionId: this.sessionId,
      additionalData: this.additionalData,
    };
  }
}

/**
 * Log error to console (development only)
 */
const logToConsole = (errorInfo) => {
  if (ERROR_LOGGING_CONFIG.logToConsole) {
    const style = {
      critical: 'color: red; font-weight: bold;',
      high: 'color: orange; font-weight: bold;',
      medium: 'color: yellow;',
      low: 'color: gray;',
    };

    console.group(`%c🚨 Error [${errorInfo.severity.toUpperCase()}]`, style[errorInfo.severity] || '');
    console.error('Message:', errorInfo.message);
    console.error('Category:', errorInfo.category);
    console.error('Type:', errorInfo.errorType);
    console.error('Timestamp:', errorInfo.timestamp);
    if (errorInfo.stack) {
      console.error('Stack:', errorInfo.stack);
    }
    if (Object.keys(errorInfo.additionalData).length > 0) {
      console.error('Additional Data:', errorInfo.additionalData);
    }
    console.groupEnd();
  }
};

/**
 * Log error to external service
 */
const logToService = async (errorInfo, retryCount = 0) => {
  if (!ERROR_LOGGING_CONFIG.logToService) {
    return;
  }

  try {
    const response = await fetch(ERROR_LOGGING_CONFIG.logToService, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorInfo.toJSON()),
    });

    if (!response.ok) {
      throw new Error(`Error logging service returned ${response.status}`);
    }
  } catch (error) {
    if (retryCount < ERROR_LOGGING_CONFIG.maxRetries) {
      // Exponential backoff retry
      const delay = ERROR_LOGGING_CONFIG.retryDelay * Math.pow(2, retryCount);
      setTimeout(() => {
        logToService(errorInfo, retryCount + 1);
      }, delay);
    } else {
      console.error('Failed to log error to service after retries:', error);
    }
  }
};

/**
 * Main error logging function
 * @param {Error} error - Error object
 * @param {Object} context - Additional context information
 */
export const logError = (error, context = {}) => {
  if (!ERROR_LOGGING_CONFIG.enabled) {
    return;
  }

  try {
    const errorInfo = new ErrorInfo(error, context);
    
    // Log to console (development)
    logToConsole(errorInfo);
    
    // Log to external service (if configured)
    if (ERROR_LOGGING_CONFIG.logToService) {
      logToService(errorInfo).catch(err => {
        console.error('Error in error logging service:', err);
      });
    }
  } catch (loggingError) {
    // Fallback: at least log to console
    console.error('Error in error logger:', loggingError);
    console.error('Original error:', error);
  }
};

/**
 * Log authentication errors
 */
export const logAuthError = (error, action = 'unknown') => {
  logError(error, {
    severity: ErrorSeverity.HIGH,
    category: ErrorCategory.AUTHENTICATION,
    additionalData: { action },
  });
};

/**
 * Log API errors
 */
export const logApiError = (error, endpoint = 'unknown', statusCode = null) => {
  logError(error, {
    severity: statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
    category: ErrorCategory.API,
    additionalData: { endpoint, statusCode },
  });
};

/**
 * Log WebSocket errors
 */
export const logWebSocketError = (error, event = 'unknown') => {
  logError(error, {
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.WEBSOCKET,
    additionalData: { event },
  });
};

/**
 * Log network errors
 */
export const logNetworkError = (error, url = 'unknown') => {
  logError(error, {
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.NETWORK,
    additionalData: { url },
  });
};

/**
 * Log unhandled promise rejections
 */
export const logUnhandledRejection = (reason, promise) => {
  const error = reason instanceof Error 
    ? reason 
    : new Error(`Unhandled Promise Rejection: ${String(reason)}`);
  
  logError(error, {
    severity: ErrorSeverity.HIGH,
    category: ErrorCategory.RUNTIME,
    additionalData: { 
      type: 'unhandled_rejection',
      promise: promise?.toString() || 'unknown',
    },
  });
};

/**
 * Initialize error logging (set up global handlers)
 */
export const initializeErrorLogging = () => {
  // Global error handler
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.RUNTIME,
      additionalData: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    logUnhandledRejection(event.reason, event.promise);
  });
};

