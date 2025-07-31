'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Yüklenemedi</h2>
          <p className="text-slate-600 mb-4">
            Dashboard yüklenirken bir hata oluştu. Bu genellikle geçici bir sorundur.
          </p>
          <p className="text-sm text-slate-500">
            Hata: {error.message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-brand-primary-700 text-white rounded-lg hover:bg-brand-primary-800 transition-colors font-medium"
          >
            Tekrar Dene
          </button>
          
          <Link
            href="/admin/login"
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Giriş Sayfasına Dön
          </Link>
        </div>

        <div className="text-xs text-slate-400">
          <p>Sorun devam ederse:</p>
          <p>1. Sayfayı yenileyin (F5)</p>
          <p>2. Çıkış yapıp tekrar giriş yapın</p>
          <p>3. Browser cache'ini temizleyin</p>
        </div>
      </div>
    </div>
  );
}