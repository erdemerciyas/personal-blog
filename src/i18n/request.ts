import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, isValidLocale } from '../i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isValidLocale(requested || '') ? (requested as typeof locales[number]) : defaultLocale;

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../../messages/${defaultLocale}.json`)).default;
  }

  return { locale, messages };
});
