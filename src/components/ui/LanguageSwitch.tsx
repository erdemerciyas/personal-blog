'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

interface Language {
  code: string;
  label: string;
  flag?: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

interface LanguageSwitchProps {
  /** Geçerli dil kodu — params.lang'den gelir */
  currentLang: string;
  /** Compact modda yalnızca bayrak + kod gösterilir */
  compact?: boolean;
  className?: string;
}

export default function LanguageSwitch({
  currentLang,
  compact = false,
  className = '',
}: LanguageSwitchProps) {
  const pathname = usePathname() ?? '/';

  /**
   * /tr/haberler/my-post → /es/haberler/my-post
   * Sadece ilk segment (dil kodu) değiştirilir.
   */
  function buildHref(targetLang: string) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return `/${targetLang}`;
    // İlk segment dil kodu mu kontrol et
    if (SUPPORTED_LANGUAGES.some((l) => l.code === segments[0])) {
      segments[0] = targetLang;
    } else {
      segments.unshift(targetLang);
    }
    return `/${segments.join('/')}`;
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Link
            key={lang.code}
            href={buildHref(lang.code)}
            title={lang.label}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
              currentLang === lang.code
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            {lang.flag && <span>{lang.flag}</span>}
            <span className="uppercase">{lang.code}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative group inline-block ${className}`}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Dil seç"
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span>
          {SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.flag}{' '}
          {SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.label}
        </span>
        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-slate-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Link
            key={lang.code}
            href={buildHref(lang.code)}
            className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
              currentLang === lang.code
                ? 'bg-emerald-50 text-emerald-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {lang.flag && <span>{lang.flag}</span>}
            <span>{lang.label}</span>
            {currentLang === lang.code && (
              <svg className="ml-auto h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
