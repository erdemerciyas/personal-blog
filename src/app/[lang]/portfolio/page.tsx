import { ThemeRegistry } from '@/themes/ThemeRegistry';
import connectDB from '@/lib/mongoose';
import { getPortfolioItems } from '@/lib/data';
import Theme from '@/models/Theme';
import PageSettings from '@/models/PageSettings';
import Category from '@/models/Category';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SITE_URL, generateAlternates, generateOgImages } from '@/lib/seo-utils';

export const revalidate = 3600; // ISR for 1 hour

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const canonical = lang === 'es' ? `${SITE_URL}/es/portfolio` : `${SITE_URL}/tr/portfolio`;
  return {
    title: 'Portfolyo | Fixral',
    description: 'Tamamladığımız projeleri ve çalışmalarımızı keşfedin.',
    alternates: generateAlternates('/tr/portfolio', '/es/portfolio'),
    openGraph: {
      title: 'Portfolyo | Fixral',
      description: 'Tamamladığımız projeleri ve çalışmalarımızı keşfedin.',
      url: canonical,
      type: 'website',
      images: generateOgImages(undefined, 'Portfolyo | Fixral'),
    },
  };
}

export default async function PortfolioPage() {
  await connectDB();
  const activeThemeRecord = await Theme.findOne({ isActive: true }).lean() as any;
  const activeThemeFolder = activeThemeRecord?.slug || 'default';

  try {
    const portfolioItems = await getPortfolioItems(100);

    // Server-side fetch category items and hero settings to prevent client-side delays
    const categoriesResult = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
    const categories = JSON.parse(JSON.stringify(categoriesResult));

    const pageSettingsRecord = await PageSettings.findOne({ pageId: 'portfolio' }).lean();
    const heroData = pageSettingsRecord ? JSON.parse(JSON.stringify(pageSettingsRecord)) : null;

    const TemplateComponent = ThemeRegistry.getTemplate(activeThemeFolder, 'PortfolioTemplate');

    return (
      <TemplateComponent
        title="Portfolyo"
        items={portfolioItems}
        categories={categories}
        heroData={heroData}
      />
    );
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Bir Hata Oluştu</h3>
          <p className="text-slate-600 mb-6">Portfolyo projeleri yüklenirken geçici bir sorun oluştu.</p>
        </div>
      </div>
    );
  }
}
