'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Breadcrumbs from '@/components/Breadcrumbs';

import PageHero from '@/components/common/PageHero';
import PortfolioFilters from '@/components/portfolio/PortfolioFilters';
import ModernProjectGrid from '@/components/portfolio/ModernProjectGrid';
import { usePortfolioFilters } from '@/hooks/usePortfolioFilters';
import { useLocale } from '@/hooks/useLocale';

export default function PortfolioTemplate(props: any) {
  // If items are passed as props, we can initialize with them. But let's keep the dynamic fetching
  // logic here just in case, to maintain the rich client-side experience.
  // Use props directly to ensure soft-navigation updates the component
  const lang = useLocale();
  const portfolioItems = props.items || [];
  const categories = props.categories || [];
  const loading = false;
  const error = null;
  const hero = {
    title: props.heroData?.title || props.title || 'Portfolyo',
    description: props.heroData?.description || 'Tamamladığımız başarılı projeler ve yaratıcı çözümler',
    buttonText: props.heroData?.buttonText || 'Projeleri İncele',
    buttonLink: props.heroData?.buttonLink || '#projects'
  };

  const [layout, setLayout] = useState<'grid' | 'masonry' | 'list'>('grid');

  const {
    filters,
    setFilters,
    filteredProjects,
    totalResults,
    availableTechnologies
  } = usePortfolioFilters(portfolioItems, categories, loading);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Bir Hata Oluştu</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title={hero.title}
        description={hero.description}
        buttonText={hero.buttonText}
        buttonLink={hero.buttonLink}
        showButton={true}
      />
      <section className="py-1">
        <div className="container mx-auto px-4">
          <Breadcrumbs />
        </div>
      </section>

      <section id="projects" className="py-1 md:py-2 lg:py-3">
        <div className="container mx-auto px-4">
          <PortfolioFilters
            categories={categories}
            technologies={availableTechnologies}
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={totalResults}
            isLoading={loading}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ModernProjectGrid
              projects={filteredProjects.map((item: any) => ({
                id: item._id,
                slug: item.slug,
                title: item.title,
                description: item.description,
                coverImage: item.coverImage,
                category: (() => {
                  if (item.categoryIds && Array.isArray(item.categoryIds) && item.categoryIds.length > 0) {
                    return item.categoryIds.map((cat: any) => (typeof cat === 'object' ? cat.name : cat) || cat).join(', ');
                  }
                  if (item.categoryId && typeof item.categoryId === 'object' && 'name' in item.categoryId) {
                    return item.categoryId.name;
                  }
                  if (item.categoryId && typeof item.categoryId === 'string') {
                    const foundCategory = categories.find((cat: any) => cat._id === item.categoryId);
                    return foundCategory?.name || 'Genel';
                  }
                  const legacyCategories = item.categories;
                  if (legacyCategories && Array.isArray(legacyCategories) && legacyCategories.length > 0) {
                    return legacyCategories.map((cat: any) => (typeof cat === 'object' ? cat.name : cat) || cat).join(', ');
                  }
                  const legacyCategory = item.category;
                  if (legacyCategory?.name) {
                    return legacyCategory.name;
                  }
                  return 'Genel';
                })(),
                client: item.client,
                completionDate: item.completionDate,
                technologies: item.technologies,
                featured: item.featured,
                models3D: item.models3D
              }))}
              isLoading={loading}
              layout={layout}
              onLayoutChange={setLayout}
            />
          </motion.div>

          {!loading && filteredProjects.length === 0 && portfolioItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                Arama Sonucu Bulunamadı
              </h3>
              <p className="text-slate-600 max-w-md mx-auto mb-6">
                Arama kriterlerinize uygun proje bulunamadı. Filtreleri değiştirmeyi veya temizlemeyi deneyin.
              </p>
              <button
                onClick={() => setFilters({
                  search: '',
                  categories: [],
                  technologies: [],
                  dateRange: { start: '', end: '' },
                  sortBy: 'newest',
                  sortOrder: 'desc'
                })}
                className="btn-secondary"
              >
                Filtreleri Temizle
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <section className="section bg-gradient-primary text-white relative overflow-hidden" aria-labelledby="portfolio-cta-title">
        <div className="container-content text-center relative z-10">
          <div className="section-header">
            <h2 id="portfolio-cta-title" className="text-white">Projenizi Birlikte Gerçekleştirelim</h2>
            <p className="text-brand-primary-100">
              Portföyümüzdeki projeler gibi sizin de fikirlerinizi hayata geçirmeye hazırız.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href={`/${lang}/contact`} className="btn-primary">
              <SparklesIcon className="w-5 h-5 mr-2" />
              Proje Başlatalım
            </Link>
            <Link href={`/${lang}/services`} className="btn-secondary">
              Hizmetlerimizi İnceleyin
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
