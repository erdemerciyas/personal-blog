'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PortfolioItem } from '../../../types/portfolio';
import PortfolioDetailHero from '../../../components/portfolio/PortfolioDetailHero';
import PortfolioMediaGallery from '../../../components/portfolio/PortfolioMediaGallery';
import Portfolio3DFiles from '../../../components/portfolio/Portfolio3DFiles';
import ModernProjectGrid from '../../../components/portfolio/ModernProjectGrid';
import HTMLContent from '../../../components/HTMLContent';
import ContentSkeleton from '../../../components/ContentSkeleton';
import BreadcrumbsJsonLd from '../../../components/seo/BreadcrumbsJsonLd';
import PortfolioJsonLd from '../../../components/seo/PortfolioJsonLd';
import { config } from '@/core/lib/config';
import Breadcrumbs from '../../../components/Breadcrumbs';

export default function PortfolioDetailPage({ params }: { params: { slug: string } }) {
  const [portfolioItem, setPortfolioItem] = useState<PortfolioItem | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.slug) {
      setError('Slug bulunamadı');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/portfolio/slug/${encodeURIComponent(params.slug)}`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error('Portfolio yüklenemedi');
        }

        const data: PortfolioItem = await response.json();
        setPortfolioItem(data);

        // Fetch related projects
        try {
          const relatedRes = await fetch('/api/portfolio', { cache: 'no-store' });
          if (relatedRes.ok) {
            const allProjects: PortfolioItem[] = await relatedRes.json();
            const related = allProjects
              .filter(p => p.slug !== params.slug)
              .slice(0, 3);
            setRelatedProjects(related);
          }
        } catch (err) {
          console.error('Related projects error:', err);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-primary py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Proje detayları yükleniyor...</p>
          </div>
        </section>
        <div className="container mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <ContentSkeleton type="article" count={1} className="mb-8" />
            <ContentSkeleton type="gallery" count={1} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !portfolioItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Proje Yüklenemedi</h3>
          <p className="text-slate-600 mb-6">{error || 'Aradığınız proje bulunamadı.'}</p>
          <Link href="/portfolio" className="btn-primary">
            Portfolyoya Dön
          </Link>
        </div>
      </div>
    );
  }

  const allImages = portfolioItem.coverImage
    ? [portfolioItem.coverImage, ...(portfolioItem.images || []).filter(img => img !== portfolioItem.coverImage)]
    : (portfolioItem.images || []);

  const baseUrl = config.app.url
    ? config.app.url.replace(/\/$/, '')
    : (typeof window !== 'undefined' ? window.location.origin : '');
  const safeDescription = (portfolioItem.description || '').replace(/<[^>]*>/g, '').slice(0, 200);

  return (
    <div className="min-h-screen bg-gray-50">
      <PortfolioDetailHero project={portfolioItem} />

      <section className="py-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <Breadcrumbs />
        </div>
      </section>

      <BreadcrumbsJsonLd
        items={[
          { name: 'Anasayfa', item: '/' },
          { name: 'Portfolyo', item: '/portfolio' },
          { name: portfolioItem.title, item: `/portfolio/${params.slug}` },
        ]}
      />
      <PortfolioJsonLd
        name={portfolioItem.title}
        description={safeDescription}
        url={`${baseUrl}/portfolio/${params.slug}`}
        images={allImages}
        baseUrl={baseUrl}
      />

      <section className="py-1 md:py-2 lg:py-3 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 md:p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 lg:gap-3 mb-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-7"
              >
                <PortfolioMediaGallery
                  images={portfolioItem.images || []}
                  models3D={portfolioItem.models3D || []}
                  title={portfolioItem.title}
                  coverImage={portfolioItem.coverImage}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-3 space-y-4"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-3 lg:sticky lg:top-24">
                  <h2 className="text-base font-bold text-slate-800 mb-3 text-center">
                    Proje Bilgileri
                  </h2>

                  <div className="space-y-3">
                    {portfolioItem.client && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-slate-600">Müşteri</span>
                        <span className="text-sm font-medium text-slate-900">{portfolioItem.client}</span>
                      </div>
                    )}

                    {portfolioItem.completionDate && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-slate-600">Tarih</span>
                        <span className="text-sm font-medium text-slate-900">
                          {new Date(portfolioItem.completionDate).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    {(portfolioItem.category || (portfolioItem.categories && portfolioItem.categories.length > 0)) && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-slate-600">Kategori</span>
                        <span className="text-sm font-medium text-slate-900">
                          {portfolioItem.categories && portfolioItem.categories.length > 0
                            ? portfolioItem.categories.map(cat => cat.name).join(', ')
                            : portfolioItem.category?.name || 'Genel'
                          }
                        </span>
                      </div>
                    )}

                    {portfolioItem.technologies && portfolioItem.technologies.length > 0 && (
                      <div className="py-1">
                        <span className="text-sm text-slate-600 block mb-2">Teknolojiler</span>
                        <div className="flex flex-wrap gap-1">
                          {portfolioItem.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {portfolioItem.models3D && portfolioItem.models3D.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <Portfolio3DFiles
                          models3D={portfolioItem.models3D}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between py-1 pt-2 border-t border-gray-100">
                      <span className="text-sm text-slate-600">Durum</span>
                      <span className="text-sm text-green-600 font-medium">✓ Tamamlandı</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-4"
            >
              <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-2 md:p-3">
                <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">Proje Açıklaması</h2>
                <div className="prose prose-lg prose-slate max-w-none">
                  <HTMLContent
                    content={portfolioItem.description}
                    className="text-lg leading-relaxed text-slate-700"
                  />
                </div>
              </div>
            </motion.div>

            {relatedProjects.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="border-t border-slate-200/50 pt-4"
              >
                <div className="section-header">
                  <h2 className="text-gradient">Benzer Projeler</h2>
                  <p>Aynı kategoriden diğer projelerimizi inceleyin</p>
                </div>

                <ModernProjectGrid
                  projects={relatedProjects.map(p => ({
                    id: p._id,
                    slug: p.slug,
                    title: p.title || '',
                    description: p.description || '',
                    coverImage: p.coverImage || '',
                    category: p.categories && p.categories.length > 0
                      ? p.categories.map(cat => cat.name).join(', ')
                      : p.category?.name || 'Genel',
                    client: p.client,
                    completionDate: p.completionDate,
                    technologies: p.technologies,
                    featured: p.featured
                  }))}
                  layout="grid"
                />

                <div className="text-center mt-3">
                  <Link href="/portfolio" className="btn-secondary rounded-full">
                    Tüm Projeleri Gör
                  </Link>
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
