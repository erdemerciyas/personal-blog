import { getRequestConfig } from 'next-intl/server';

const locales = ['tr', 'es'] as const;
type Locale = (typeof locales)[number];

function isValidLocale(lang: string): lang is Locale {
  return locales.includes(lang as Locale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = isValidLocale(requested || '') ? (requested as Locale) : 'tr';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
