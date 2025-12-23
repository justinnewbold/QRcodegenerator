/**
 * Centralized Error Logging Utility
 * Provides structured logging with environment awareness
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: string;
  error?: Error;
}

// Log storage for debugging (keeps last 100 entries)
const logBuffer: LogEntry[] = [];
const MAX_LOG_BUFFER = 100;

/**
 * Check if we're in development mode
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if we're in browser
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const contextStr = entry.context ? `[${entry.context}]` : '';
  return `${entry.timestamp} ${contextStr} ${entry.message}`;
}

/**
 * Add entry to log buffer
 */
function addToBuffer(entry: LogEntry): void {
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG_BUFFER) {
    logBuffer.shift();
  }
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: unknown,
  error?: Error
): LogEntry {
  return {
    level,
    message,
    context,
    data,
    error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Main logger object
 */
export const logger = {
  /**
   * Debug level logging (only in development)
   */
  debug(message: string, data?: unknown, context?: string): void {
    const entry = createLogEntry('debug', message, context, data);
    addToBuffer(entry);

    if (isDevelopment() && isBrowser()) {
      console.debug(formatLogEntry(entry), data !== undefined ? data : '');
    }
  },

  /**
   * Info level logging
   */
  info(message: string, data?: unknown, context?: string): void {
    const entry = createLogEntry('info', message, context, data);
    addToBuffer(entry);

    if (isDevelopment() && isBrowser()) {
      console.info(formatLogEntry(entry), data !== undefined ? data : '');
    }
  },

  /**
   * Warning level logging
   */
  warn(message: string, data?: unknown, context?: string): void {
    const entry = createLogEntry('warn', message, context, data);
    addToBuffer(entry);

    if (isBrowser()) {
      if (isDevelopment()) {
        console.warn(formatLogEntry(entry), data !== undefined ? data : '');
      }
    }
  },

  /**
   * Error level logging
   */
  error(message: string, error?: Error | unknown, context?: string): void {
    const err = error instanceof Error ? error : undefined;
    const entry = createLogEntry('error', message, context, error, err);
    addToBuffer(entry);

    if (isBrowser()) {
      if (isDevelopment()) {
        console.error(formatLogEntry(entry), error !== undefined ? error : '');
      }
      // In production, you might want to send errors to an error tracking service
      // Example: sendToErrorTracker(entry);
    }
  },

  /**
   * Get log buffer for debugging
   */
  getLogBuffer(): LogEntry[] {
    return [...logBuffer];
  },

  /**
   * Clear log buffer
   */
  clearLogBuffer(): void {
    logBuffer.length = 0;
  },

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(logBuffer, null, 2);
  },

  /**
   * Create a scoped logger with a fixed context
   */
  createScoped(context: string) {
    return {
      debug: (message: string, data?: unknown) => logger.debug(message, data, context),
      info: (message: string, data?: unknown) => logger.info(message, data, context),
      warn: (message: string, data?: unknown) => logger.warn(message, data, context),
      error: (message: string, error?: Error | unknown) => logger.error(message, error, context),
    };
  },
};

// Create scoped loggers for common modules
export const qrLogger = logger.createScoped('QR');
export const storageLogger = logger.createScoped('Storage');
export const securityLogger = logger.createScoped('Security');
export const validationLogger = logger.createScoped('Validation');
export const webhookLogger = logger.createScoped('Webhook');

/**
 * Wrap an async function with error logging
 */
export function withErrorLogging<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(`Error in ${fn.name || 'anonymous function'}`, error, context);
      throw error;
    }
  }) as T;
}

/**
 * Safe execution wrapper - logs errors but doesn't throw
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  context?: string
): T {
  try {
    return fn();
  } catch (error) {
    logger.error('Error in safe execution', error, context);
    return fallback;
  }
}

/**
 * Safe async execution wrapper
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logger.error('Error in safe async execution', error, context);
    return fallback;
  }
}

export default logger;
