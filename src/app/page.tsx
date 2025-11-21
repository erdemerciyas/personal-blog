import Link from 'next/link';
import {
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import HeroSlider from '../components/home/HeroSlider';
import ServicesGrid from '../components/home/ServicesGrid';
import HomePortfolioSection from '../components/portfolio/HomePortfolioSection';
import { getSliderItems, getPortfolioItems, getServices } from '../lib/data';

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Fetch data in parallel
  const [sliderItems, portfolioItems, services] = await Promise.all([
    getSliderItems(),
    getPortfolioItems(6),
    getServices(6)
  ]);

  return (
    <>
      {/* Hero Slider Section */}
      <HeroSlider items={sliderItems} />

      <main className="min-h-screen">
        {/* Services Section */}
        <section className="section bg-gradient-subtle" aria-label="Hizmetlerimiz">
          <div className="container-main">
            {/* Header */}
            <div className="section-header">
              <h2>Sunduğumuz Hizmetler</h2>
              <p>
                Modern teknoloji ve uzman kadromuzla projelerinizi hayata geçirmek için
                kapsamlı mühendislik çözümleri sunuyoruz.
              </p>
            </div>

            {/* Services Grid */}
            <ServicesGrid services={services} />

            {/* View All Link */}
            <nav className="text-center" aria-label="Hizmetler navigasyonu">
              <Link href="/services" className="btn-secondary">
                Tüm Hizmetlerimizi Görüntüle
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </nav>
          </div>
        </section>

        {/* Portfolio Section */}
        <HomePortfolioSection
          portfolioItems={portfolioItems}
          isLoading={false}
        />

        {/* CTA Section */}
        <footer className="section bg-gradient-primary text-white relative overflow-hidden" role="contentinfo" aria-label="Proje çağrısı bölümü">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white transform rotate-45 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 right-10 w-12 h-12 border-2 border-white transform rotate-12 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>

          <div className="container-content text-center relative z-10">
            <h2 className="section-title text-white mb-6 animate-fade-in">
              Projenizi Gerçeğe Dönüştürün
            </h2>
            <p className="section-subtitle text-brand-primary-100 mb-12 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Uzman ekibimiz ve modern teknolojilerimizle fikirlerinizi hayata geçirmeye hazırız.
            </p>
            <nav className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }} aria-label="Ana eylem navigasyonu">
              <Link href="/contact" className="btn-primary transform-gpu hover:scale-105 active:scale-95">
                <SparklesIcon className="w-5 h-5 mr-2" />
                İletişime Geçin
              </Link>
              <Link href="/portfolio" className="btn-secondary transform-gpu hover:scale-105 active:scale-95">
                Projelerimizi İnceleyin
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </nav>
          </div>
        </footer>
      </main>
    </>
  );
}
