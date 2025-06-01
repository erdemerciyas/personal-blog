'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', error);
    }
    
    // In production, you might want to send to error tracking service
    // e.g., Sentry, LogRocket, etc.
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-20">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-xl border border-white/20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Bir şeyler yanlış gitti
        </h2>
        <p className="text-gray-200 mb-6">
          Üzgünüz, bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="text-red-300 cursor-pointer mb-2">
              Geliştirici Detayları
            </summary>
            <pre className="text-xs text-red-200 bg-red-900/20 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        <button
          onClick={reset}
          className="bg-blue-600/80 hover:bg-blue-700/80 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 backdrop-blur-lg transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
} 