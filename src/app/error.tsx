'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  HomeIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

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
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="container-narrow text-center">
        <div className="card-modern max-w-2xl mx-auto p-12">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <ExclamationTriangleIcon className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">
            Oops! Bir Hata Oluştu
          </h1>

          {/* Error Message */}
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Beklenmeyen bir hata meydana geldi. Lütfen sayfayı yeniden yüklemeyi deneyin 
            veya ana sayfaya geri dönün.
          </p>

          {/* Error Details */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Hata Detayları:</h3>
            <p className="text-sm text-slate-600 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-slate-500 mt-2">
                Hata Kodu: {error.digest}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={reset}
              className="btn-primary flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Sayfayı Yenile</span>
            </button>
            
            <Link href="/" className="btn-outline flex items-center space-x-2">
              <HomeIcon className="w-5 h-5" />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">
                Yardıma mı İhtiyacınız Var?
              </h3>
            </div>
            <p className="text-blue-700 mb-4">
              Sorun devam ederse, lütfen bizimle iletişime geçin. Size yardımcı olmaktan 
              memnuniyet duyarız.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
            >
              İletişime Geç
              <ArrowPathIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 