'use client';

import React from 'react';
import Link from 'next/link';
import type { Language } from '@/types/language';
import { ExclamationTriangleIcon, LanguageIcon } from '@heroicons/react/24/outline';

interface LanguageTabsProps {
  languages: Language[];
  activeLanguage: string;
  onLanguageChange: (code: string) => void;
  translations?: Record<string, any>;
  error?: string | null;
}

export default function LanguageTabs({
  languages,
  activeLanguage,
  onLanguageChange,
  translations,
  error,
}: LanguageTabsProps) {
  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-800">Diller yüklenemedi</p>
          <p className="text-xs text-red-600 mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state with link to language settings
  if (languages.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
        <LanguageIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Henüz dil tanımlanmamış</p>
          <p className="text-xs text-amber-700 mt-1">
            Çoklu dil desteği için önce dil ayarlarından en az bir dil eklemeniz gerekiyor.
          </p>
          <Link
            href="/admin/languages"
            className="inline-flex items-center mt-2 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Dil Ayarlarına Git →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-hidden">
      <div className="flex border-b border-slate-200/60">
        {languages.map((lang) => {
          const isActive = activeLanguage === lang.code;
          const hasContent = translations?.[lang.code]?.title?.trim();

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageChange(lang.code)}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeLabel}</span>
              {lang.isDefault && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  }`}
                >
                  Varsayılan
                </span>
              )}
              {translations && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    hasContent
                      ? 'bg-emerald-400'
                      : isActive
                        ? 'bg-white/40'
                        : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
