'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);

    // Could send to error tracking service here
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // In a real app, send to Sentry, LogRocket, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    // Store in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('qr-error-log') || '[]');
      errors.unshift(errorReport);
      localStorage.setItem('qr-error-log', JSON.stringify(errors.slice(0, 10)));
    } catch {
      // Ignore storage errors
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleClearData = (): void => {
    if (confirm('This will clear all saved QR codes, settings, and history. Continue?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  handleCopyError = async (): Promise<void> => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message}

Stack Trace:
${error?.stack}

Component Stack:
${errorInfo?.componentStack}

URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // Fallback for older browsers
      console.log(errorText);
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, copied } = this.state;

      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
                <p className="text-sm text-muted-foreground">
                  An unexpected error occurred
                </p>
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-6 rounded-lg bg-red-500/5 p-4">
              <div className="flex items-start justify-between gap-2">
                <code className="text-sm text-red-600 dark:text-red-400">
                  {error?.message || 'Unknown error'}
                </code>
                <button
                  onClick={this.handleCopyError}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Copy error details"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Recovery Options */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Try one of these options:</p>

              <div className="grid gap-2">
                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-muted"
                >
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Try Again</p>
                    <p className="text-xs text-muted-foreground">
                      Reset and try the last action again
                    </p>
                  </div>
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-muted"
                >
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-foreground">Reload Page</p>
                    <p className="text-xs text-muted-foreground">
                      Refresh the entire application
                    </p>
                  </div>
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-muted"
                >
                  <Home className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-foreground">Go to Home</p>
                    <p className="text-xs text-muted-foreground">
                      Return to the main page
                    </p>
                  </div>
                </button>

                <button
                  onClick={this.handleClearData}
                  className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-left transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:hover:bg-red-900"
                >
                  <Bug className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-300">Clear All Data</p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Reset everything if the problem persists
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 border-t border-border pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                If this problem continues, please{' '}
                <a
                  href="https://github.com/justinnewbold/QRcodegenerator/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  report it on GitHub
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger errors
export function useErrorHandler() {
  const [, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);

  return handleError;
}

// Simple fallback component for specific sections
interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
}

export function ErrorFallback({ error, resetError, message }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
      <AlertTriangle className="mb-3 h-8 w-8 text-red-500" />
      <h3 className="mb-1 font-semibold text-red-700 dark:text-red-300">
        {message || 'Something went wrong'}
      </h3>
      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
      {resetError && (
        <button
          onClick={resetError}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
