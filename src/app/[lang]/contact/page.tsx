import type { Metadata } from 'next';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';
import ContactClient from './ContactClient';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const canonical = lang === 'es' ? `${SITE_URL}/es/contact` : `${SITE_URL}/tr/contact`;

  return {
    title: 'İletişim | Fixral',
    description: 'Bizimle iletişime geçin. Proje teklifleriniz ve sorularınız için form doldurun veya doğrudan ulaşın.',
    alternates: generateAlternates('/tr/contact', '/es/contact'),
    openGraph: {
      title: 'İletişim | Fixral',
      description: 'Bizimle iletişime geçin. Proje teklifleriniz ve sorularınız için form doldurun veya doğrudan ulaşın.',
      url: canonical,
      type: 'website',
      images: generateOgImages(undefined, 'İletişim | Fixral'),
    },
  };
}

export default function ContactPage() {
  return <ContactClient />;
}
