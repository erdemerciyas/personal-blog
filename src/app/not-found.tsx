'use client';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  HomeIcon, 
  ArrowLeftIcon,
  SparklesIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="container-narrow text-center">
        <div className="card-modern max-w-2xl mx-auto p-12">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative">
              {/* Main 404 number */}
              <div className="text-8xl sm:text-9xl font-black text-gradient mb-4">
                404
              </div>
              
              {/* Floating icons */}
              <div className="absolute top-0 left-1/4 w-12 h-12 bg-gradient-to-br from-brand-primary-600 to-blue-500 rounded-2xl flex items-center justify-center animate-bounce">
                <ExclamationCircleIcon className="w-6 h-6 text-white" />
              </div>
              
              <div className="absolute top-8 right-1/4 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-pulse">
                <MagnifyingGlassIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">
            Sayfa Bulunamadı
          </h1>

          {/* Error Message */}
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir. 
            Ana sayfaya dönerek gezinmeye devam edebilirsiniz.
          </p>

          {/* Search Suggestions */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Bunları Deneyebilirsiniz:
            </h3>
            <ul className="text-slate-600 space-y-2 text-left">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-brand-primary-600 rounded-full"></span>
                <span>URL'yi kontrol edin</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Ana sayfaya geri dönün</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Navigasyon menüsünü kullanın</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                <span>Arama yapın</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/" className="btn-primary flex items-center space-x-2">
              <HomeIcon className="w-5 h-5" />
              <span>Ana Sayfaya Dön</span>
            </Link>
            
            <button 
              onClick={handleGoBack}
              className="btn-outline flex items-center space-x-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Geri Dön</span>
            </button>
          </div>

          {/* Popular Pages */}
          <div className="mt-12 p-6 bg-gradient-to-br from-brand-primary-50 to-blue-50 rounded-2xl border border-brand-primary-200">
            <div className="flex items-center space-x-3 mb-4">
              <SparklesIcon className="w-6 h-6 text-brand-primary-700" />
              <h3 className="text-lg font-semibold text-brand-primary-800">
                Popüler Sayfalar
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link 
                href="/services" 
                className="text-brand-primary-800 hover:text-brand-primary-900 font-medium p-2 rounded-lg hover:bg-brand-primary-100 transition-colors"
              >
                Hizmetlerimiz
              </Link>
              <Link 
                href="/portfolio" 
                className="text-brand-primary-800 hover:text-brand-primary-900 font-medium p-2 rounded-lg hover:bg-brand-primary-100 transition-colors"
              >
                Portfolyo
              </Link>
              <Link 
                href="/about" 
                className="text-brand-primary-800 hover:text-brand-primary-900 font-medium p-2 rounded-lg hover:bg-brand-primary-100 transition-colors"
              >
                Hakkımızda
              </Link>
              <Link 
                href="/contact" 
                className="text-brand-primary-800 hover:text-brand-primary-900 font-medium p-2 rounded-lg hover:bg-brand-primary-100 transition-colors"
              >
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 