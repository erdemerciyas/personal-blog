import { getSliderItems, getPortfolioItems, getServices } from '@/lib/data';
import { ThemeRegistry } from '@/themes/ThemeRegistry';
import connectDB from '@/lib/mongoose';
import Theme from '@/models/Theme';
import type { Metadata } from 'next';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';

export const revalidate = 3600; // ISR for 1 hour

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const canonical = lang === 'es' ? `${SITE_URL}/es` : `${SITE_URL}/tr`;
  return {
    title: 'Fixral — Dijital Çözümler ve Hizmetler',
    description: 'Modern web teknolojileri, yazılım geliştirme ve dijital dönüşüm hizmetleri.',
    alternates: {
      canonical,
      languages: {
        'tr-TR': `${SITE_URL}/tr`,
        'es-ES': `${SITE_URL}/es`,
        'x-default': `${SITE_URL}/tr`,
      },
    },
    openGraph: {
      title: 'Fixral — Dijital Çözümler ve Hizmetler',
      description: 'Modern web teknolojileri, yazılım geliştirme ve dijital dönüşüm hizmetleri.',
      url: canonical,
      type: 'website',
      images: generateOgImages(undefined, 'Fixral'),
    },
  };
}

export default async function HomePage() {
  await connectDB();
  const activeThemeRecord = await Theme.findOne({ isActive: true }).lean() as any;
  const activeThemeFolder = activeThemeRecord?.slug || 'default';

  // Fetch data in parallel
  const [sliderItems, portfolioItems, services] = await Promise.all([
    getSliderItems(),
    getPortfolioItems(6),
    getServices(6)
  ]);

  const TemplateComponent = ThemeRegistry.getTemplate(activeThemeFolder, 'HomeTemplate');

  return (
    <TemplateComponent
      sliderItems={sliderItems}
      portfolioItems={portfolioItems}
      services={services}
    />
  );
}
