import type { Metadata } from 'next';
import connectDB from '@/lib/mongoose';
import Service from '@/models/Service';
import PageSettings from '@/models/PageSettings';
import ServicesClient from './ServicesClient';
import PageHero from '../../components/common/PageHero';
import Breadcrumbs from '../../components/Breadcrumbs';
import BreadcrumbsJsonLd from '../../components/seo/BreadcrumbsJsonLd';
import ServicesListJsonLd from '../../components/seo/ServicesListJsonLd';

export const dynamic = 'force-dynamic';

async function getData() {
  await connectDB();

  const [services, pageSettings] = await Promise.all([
    Service.find({}).sort({ createdAt: -1 }).lean(),
    PageSettings.findOne({ pageId: 'services' }).lean() as unknown as { title?: string; description?: string }
  ]);

  return {
    services: JSON.parse(JSON.stringify(services)),
    hero: {
      title: pageSettings?.title || 'Sunduğumuz Hizmetler',
      description: pageSettings?.description || 'Modern teknoloji çözümleri ve profesyonel hizmetlerimizi keşfedin'
    }
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { hero } = await getData();

  return {
    title: `${hero.title} | Fixral`,
    description: hero.description,
    openGraph: {
      title: `${hero.title} | Fixral`,
      description: hero.description,
      type: 'website',
    },
  };
}

export default async function ServicesPage() {
  const { services, hero } = await getData();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <PageHero
        title={hero.title}
        description={hero.description}
        buttonText="Hizmetleri İncele"
        buttonLink="#services"
        showButton={true}
      />

      {/* Breadcrumbs under Hero */}
      <section className="py-1">
        <div className="container mx-auto px-4">
          <Breadcrumbs />
        </div>
      </section>

      {/* JSON-LD: Breadcrumbs */}
      <BreadcrumbsJsonLd
        items={[
          { name: 'Anasayfa', item: '/' },
          { name: 'Hizmetler', item: '/services' },
        ]}
      />

      {/* JSON-LD: Services ItemList */}
      <ServicesListJsonLd
        items={services.map((s: any) => {
          const anchor = s.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
          return {
            name: s.title,
            url: `/services#${anchor}`,
            description: s.description,
            image: s.image,
          };
        })}
      />

      {/* Client Content */}
      <ServicesClient services={services} hero={hero} />
    </div>
  );
}