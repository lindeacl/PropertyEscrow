import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import logger from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
  eventId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const eventId = Math.random().toString(36).substr(2, 9);
    
    // Log the error with full stack trace and component info
    logger.uiError(error, 'ErrorBoundary', 'Component rendering');
    
    console.error('Error Boundary caught an error:', {
      eventId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    this.setState({ 
      hasError: true, 
      error, 
      errorInfo,
      eventId
    });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportIssue = () => {
    const subject = encodeURIComponent('PropertyEscrow Platform Error Report');
    const body = encodeURIComponent(`
Error ID: ${this.state.eventId}
Error: ${this.state.error?.message}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}

Please describe what you were doing when this error occurred:
[Your description here]
    `);
    window.open(`mailto:support@propertyescrow.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div 
          className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="bg-red-500/20 p-4 rounded-full">
                <AlertTriangle 
                  className="w-8 h-8 text-red-400" 
                  aria-hidden="true"
                />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-4" id="error-title">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-300 mb-6" id="error-description">
              We encountered an unexpected error. Don't worry - your data is safe. 
              Please try refreshing the page or return to the homepage.
            </p>

            {this.state.eventId && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-6">
                <p className="text-xs text-grey-400 mb-1">Error ID for support:</p>
                <code className="text-sm font-mono text-blue-300">{this.state.eventId}</code>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.handleRefresh}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-2"
                aria-describedby="error-description"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Refresh Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-colors border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Go to Homepage
              </button>
              
              <button
                onClick={this.handleReportIssue}
                className="w-full bg-transparent hover:bg-white/5 text-gray-300 font-medium py-2 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Report Issue
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer font-semibold text-sm text-yellow-400 hover:text-yellow-300 focus:outline-none focus:text-yellow-300">
                  Technical Details (Development)
                </summary>
                <div className="mt-3 bg-black/20 border border-white/10 rounded-xl p-3 overflow-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs font-semibold text-yellow-400 mb-2">Component Stack:</p>
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;