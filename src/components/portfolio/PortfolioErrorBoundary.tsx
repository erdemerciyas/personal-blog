'use client';

import React from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface PortfolioErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface PortfolioErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

class PortfolioErrorBoundary extends React.Component<
  PortfolioErrorBoundaryProps,
  PortfolioErrorBoundaryState
> {
  constructor(props: PortfolioErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PortfolioErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Portfolio Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Proje Yüklenemedi
            </h2>
            
            <p className="text-slate-600 mb-6">
              Proje detayları yüklenirken bir hata oluştu. Bu geçici bir sorun olabilir.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.retry}
                className="btn-primary w-full"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Tekrar Dene
              </button>
              
              <Link href="/portfolio" className="btn-secondary w-full">
                Portfolyoya Dön
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                  Hata Detayları (Geliştirici)
                </summary>
                <pre className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PortfolioErrorBoundary;