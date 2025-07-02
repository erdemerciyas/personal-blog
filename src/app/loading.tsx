'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SiteSettings {
  siteName: string;
  logo: {
    url: string;
    alt: string;
    width: number;
    height: number;
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-20 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
        {/* Logo */}
        {siteSettings?.logo?.url ? (
          <div className="mb-6">
            <Image
              src={siteSettings.logo.url}
              alt={siteSettings.logo.alt || siteSettings.siteName || 'Logo'}
              width={120}
              height={60}
              className="mx-auto object-contain"
              priority
            />
          </div>
        ) : (
          <div className="mb-6">
            <div className="w-24 h-12 mx-auto bg-teal-100 rounded-lg flex items-center justify-center">
              <span className="text-teal-700 font-bold text-lg">
                {siteSettings?.siteName?.charAt(0) || 'L'}
              </span>
            </div>
          </div>
        )}

        {/* Spinner */}
        <div className="relative mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 border-l-2 border-r-2 border-l-transparent border-r-transparent mx-auto"></div>
          <div className="absolute inset-0 rounded-full h-12 w-12 border-2 border-slate-200 mx-auto"></div>
        </div>
        
        {/* Loading text */}
        <p className="text-slate-800 font-medium">Yükleniyor...</p>
        <p className="text-slate-600 text-sm mt-2">
          {siteSettings?.siteName || 'Site'} hazırlanıyor
        </p>
      </div>
    </div>
  );
} 