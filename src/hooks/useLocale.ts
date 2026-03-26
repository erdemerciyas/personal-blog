'use client';

import { usePathname } from 'next/navigation';
import { locales, defaultLocale } from '@/i18n';

export function useLocale(): string {
  const pathname = usePathname();
  const segments = pathname?.split('/') || [];
  if (segments.length >= 2 && locales.includes(segments[1] as any)) {
    return segments[1];
  }
  return defaultLocale;
}
