/**
 * [lang]/layout.tsx
 *
 * Dil bazlı route segment layout'u.
 * NextIntlClientProvider'ı sarar — tüm [lang] alt sayfaları
 * useTranslations() hook'unu kullanabilir.
 */

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, isValidLocale, defaultLocale } from '@/i18n';

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;
  const locale = isValidLocale(lang) ? lang : defaultLocale;
  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
