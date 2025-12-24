'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { logger } from '@/lib/logger';

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
  fallbackMessage?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

/**
 * Error boundary for individual feature components
 * Provides graceful degradation without crashing the entire app
 */
export class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<FeatureErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { featureName, onError } = this.props;

    // Log the error
    logger.error(
      `Error in ${featureName}`,
      error,
      `FeatureErrorBoundary:${featureName}`
    );

    // Call optional error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      showDetails: false,
    });
  };

  toggleDetails = (): void => {
    this.setState(prev => ({
      showDetails: !prev.showDetails,
    }));
  };

  render(): ReactNode {
    const { hasError, error, showDetails } = this.state;
    const { children, featureName, fallbackMessage } = this.props;

    if (hasError) {
      return (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {featureName} temporarily unavailable
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                {fallbackMessage || 'This feature encountered an error. You can try again or continue using other features.'}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center gap-1.5 rounded-md bg-yellow-100 dark:bg-yellow-800 px-3 py-1.5 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again
                </button>
                <button
                  onClick={this.toggleDetails}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors"
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      Show Details
                    </>
                  )}
                </button>
              </div>

              {showDetails && error && (
                <div className="mt-3 rounded-md bg-yellow-100 dark:bg-yellow-800/50 p-3">
                  <p className="text-xs font-mono text-yellow-800 dark:text-yellow-200 break-all">
                    {error.name}: {error.message}
                  </p>
                  {error.stack && (
                    <pre className="mt-2 text-xs font-mono text-yellow-700 dark:text-yellow-300 overflow-x-auto whitespace-pre-wrap">
                      {error.stack.split('\n').slice(1, 4).join('\n')}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * HOC to wrap a component with feature error boundary
 */
export function withFeatureErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureName: string,
  fallbackMessage?: string
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <FeatureErrorBoundary featureName={featureName} fallbackMessage={fallbackMessage}>
      <WrappedComponent {...props} />
    </FeatureErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithFeatureErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorBoundary;
}

export default FeatureErrorBoundary;
