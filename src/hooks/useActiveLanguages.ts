'use client';

import { useState, useEffect } from 'react';
import type { Language } from '@/types/language';

interface UseActiveLanguagesReturn {
  languages: Language[];
  defaultLanguage: Language | null;
  loading: boolean;
  error: string | null;
}

export function useActiveLanguages(): UseActiveLanguagesReturn {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLanguages() {
      try {
        const res = await fetch('/api/admin/languages');
        if (!res.ok) throw new Error('Diller yüklenemedi');
        const data = await res.json();

        if (cancelled) return;

        const raw = data.data || data.languages || data || [];
        const allLangs = Array.isArray(raw) ? raw : [];
        const active = allLangs
          .filter((lang: any) => lang && lang.isActive && lang.code)
          .sort((a: any, b: any) => {
            if (a.isDefault) return -1;
            if (b.isDefault) return 1;
            return (a.label || a.code || '').localeCompare(b.label || b.code || '');
          });

        setLanguages(active);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLanguages();
    return () => { cancelled = true; };
  }, []);

  const defaultLanguage = languages.find((l) => l.isDefault) || languages[0] || null;

  return { languages, defaultLanguage, loading, error };
}
