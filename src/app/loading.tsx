'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader } from '../components/ui';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface SiteSettings {
  siteName: string;
  logo: {
    url: string;
    alt: string;
  };
}

export default function Loading() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/admin/site-settings');
        if (response.ok) {
          const data = await response.json();
          setSiteSettings(data);
        }
      } catch (error) {
        console.error('Site settings fetch error:', error);
      }
    };

    fetchSiteSettings();
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center z-50">
      <div className="card-modern max-w-md w-full mx-6 p-8 text-center">
        {/* Logo */}
        <div className="mb-8">
          {siteSettings?.logo?.url ? (
            <div className="relative w-20 h-20 mx-auto rounded-3xl overflow-hidden bg-slate-200 p-2">
              <Image
                src={siteSettings.logo.url}
                alt={siteSettings.logo.alt || 'Logo'}
                fill
                className="object-contain"
                sizes="80px"
                priority
              />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto bg-slate-200 rounded-3xl flex items-center justify-center">
              <SparklesIcon className="w-10 h-10 text-slate-500" />
            </div>
          )}
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          {/* Main spinner */}
          <Loader size="xl" color="primary" className="border-t-teal-500 border-b-teal-500">
            Yükleniyor...
          </Loader>
          {/* Pulse ring */}
          <div className="absolute inset-0 w-12 h-12 mx-auto border-2 border-teal-200 rounded-full animate-ping opacity-75"></div>
          {/* Glow effect */}
          <div className="absolute inset-0 w-12 h-12 mx-auto bg-teal-500/20 rounded-full animate-pulse"></div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-800">
            {siteSettings?.siteName || 'Yükleniyor...'}
          </h2>
          <p className="text-slate-600">
            Sayfa hazırlanıyor, lütfen bekleyin...
          </p>
        </div>

        {/* Progress bars */}
        <div className="mt-8 space-y-2">
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full animate-pulse" 
                 style={{ width: '75%' }}></div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full animate-pulse" 
                 style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
} 