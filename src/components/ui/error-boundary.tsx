'use client';

import React, { Component, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ============================================
// Error Boundary Class Component
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================
// Error Fallback UI
// ============================================

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo?: React.ErrorInfo | null;
  onReset?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function ErrorFallback({
  error,
  errorInfo,
  onReset,
  onGoHome,
  showDetails = false,
  className,
}: ErrorFallbackProps) {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] p-8 text-center',
        className
      )}
    >
      {/* Illustration */}
      <div className="relative mb-6">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/15 to-transparent rounded-full blur-3xl" />
        
        {/* Main icon */}
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/15 to-red-500/5 flex items-center justify-center border border-red-500/25 shadow-2xl shadow-red-500/10">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>
        
        {/* Decorative bug icon */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
          <Bug className="w-4 h-4 text-red-400" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-white mb-2">
        Oops! Something went wrong
      </h2>

      {/* Description */}
      <p className="text-slate-400 text-sm max-w-md mb-6">
        We encountered an unexpected error. Please try again, or contact support if the problem persists.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        {onReset && (
          <Button
            onClick={onReset}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button
            onClick={onGoHome}
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-400 hover:text-white"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        )}
      </div>

      {/* Error Details (collapsible) */}
      {(showDetails || process.env.NODE_ENV === 'development') && error && (
        <div className="w-full max-w-lg">
          <button
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-400 transition-colors mb-2"
          >
            {isDetailsOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {isDetailsOpen ? 'Hide' : 'Show'} Error Details
          </button>
          
          {isDetailsOpen && (
            <div className="rounded-xl bg-slate-900/80 border border-slate-700/50 p-4 text-left overflow-auto">
              <div className="mb-3">
                <p className="text-xs font-medium text-red-400 mb-1">Error Message:</p>
                <code className="text-xs text-slate-300 font-mono">
                  {error.message}
                </code>
              </div>
              {error.stack && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Stack Trace:</p>
                  <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap overflow-x-auto max-h-40">
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">Component Stack:</p>
                  <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap overflow-x-auto max-h-40">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Page Error (for error.tsx pages)
// ============================================

interface PageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function PageError({ error, reset }: PageErrorProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <ErrorFallback
        error={error}
        onReset={reset}
        onGoHome={() => window.location.href = '/'}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    </div>
  );
}

// ============================================
// Section Error (for smaller sections)
// ============================================

interface SectionErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function SectionError({
  title = 'Failed to load',
  message = 'Something went wrong loading this section.',
  onRetry,
  className,
}: SectionErrorProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 rounded-xl',
        'bg-red-500/5 border border-red-500/20',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 mb-4 text-center">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="sm"
          className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </Button>
      )}
    </div>
  );
}
