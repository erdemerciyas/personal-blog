/**
 * i18n config — next-intl v4
 *
 * Mevcut [lang] routing'iyle uyumlu minimal entegrasyon.
 * next.config.js değiştirilmeden çalışır.
 *
 * Server bileşenlerinde:
 *   import { getMessages } from '@/i18n';
 *   const messages = await getMessages(lang);
 *
 * Client bileşenlerinde (NextIntlClientProvider altında):
 *   import { useTranslations } from 'next-intl';
 *   const t = useTranslations('nav');
 */

export const locales = ['tr', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'tr';

export function isValidLocale(lang: string): lang is Locale {
  return locales.includes(lang as Locale);
}

/**
 * Verilen dil koduna ait mesaj dosyasını yükler.
 * Geçersiz kod verilirse varsayılan dil (tr) mesajları döner.
 */
export async function getMessages(lang: string): Promise<Record<string, unknown>> {
  const locale = isValidLocale(lang) ? lang : defaultLocale;
  try {
    const module = await import(`../messages/${locale}.json`);
    return module.default as Record<string, unknown>;
  } catch {
    const fallback = await import('../messages/tr.json');
    return fallback.default as Record<string, unknown>;
  }
}
