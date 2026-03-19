'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PortfolioItem } from '@/types/portfolio';
import PortfolioDetailHero from '@/components/portfolio/PortfolioDetailHero';
import PortfolioMediaGallery from '@/components/portfolio/PortfolioMediaGallery';
import Portfolio3DFiles from '@/components/portfolio/Portfolio3DFiles';
import ModernProjectGrid from '@/components/portfolio/ModernProjectGrid';
import HTMLContent from '@/components/HTMLContent';
import BreadcrumbsJsonLd from '@/components/seo/BreadcrumbsJsonLd';
import PortfolioJsonLd from '@/components/seo/PortfolioJsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE_URL } from '@/lib/seo-utils';

interface Props {
  portfolioItem: PortfolioItem;
  relatedProjects: PortfolioItem[];
  slug: string;
}

export default function PortfolioDetailClient({ portfolioItem, relatedProjects, slug }: Props) {
  const allImages = portfolioItem.coverImage
    ? [portfolioItem.coverImage, ...(portfolioItem.images || []).filter(img => img !== portfolioItem.coverImage)]
    : (portfolioItem.images || []);

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
          { name: portfolioItem.title, item: `/portfolio/${slug}` },
        ]}
      />
      <PortfolioJsonLd
        name={portfolioItem.title}
        description={safeDescription}
        url={`${SITE_URL}/tr/portfolio/${slug}`}
        images={allImages}
        baseUrl={SITE_URL}
      />

      <section className="relative z-10 py-12 md:py-2">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8 space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                <PortfolioMediaGallery
                  images={portfolioItem.images || []}
                  models3D={portfolioItem.models3D || []}
                  title={portfolioItem.title}
                  coverImage={portfolioItem.coverImage}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-1 flex-1 bg-gradient-to-r from-gray-200 to-transparent rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-800 shrink-0">Proje Detayları</h2>
                  <div className="h-1 flex-1 bg-gradient-to-l from-gray-200 to-transparent rounded-full"></div>
                </div>
                <div className="card-glass p-6 md:p-8 lg:p-10">
                  <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-brand-primary-600 hover:prose-a:text-brand-primary-700">
                    <HTMLContent content={portfolioItem.description} className="leading-relaxed" />
                  </div>
                </div>
              </motion.div>

              {portfolioItem.models3D && portfolioItem.models3D.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="card p-6"
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-4">3D Modeller</h3>
                  <Portfolio3DFiles models3D={portfolioItem.models3D} />
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="lg:sticky lg:top-24 space-y-6"
              >
                <div className="card-glass p-6 md:p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <h3 className="relative text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-gray-100">Proje Bilgileri</h3>
                  <dl className="relative space-y-6">
                    {portfolioItem.client && (
                      <div>
                        <dt className="text-sm font-medium text-slate-500 mb-1">Müşteri</dt>
                        <dd className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-primary-500"></span>
                          {portfolioItem.client}
                        </dd>
                      </div>
                    )}
                    {portfolioItem.completionDate && (
                      <div>
                        <dt className="text-sm font-medium text-slate-500 mb-1">Tarih</dt>
                        <dd className="text-base font-semibold text-slate-900 font-mono">
                          {new Date(portfolioItem.completionDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </dd>
                      </div>
                    )}
                    {(portfolioItem.category || (portfolioItem.categories && portfolioItem.categories.length > 0)) && (
                      <div>
                        <dt className="text-sm font-medium text-slate-500 mb-1">Kategori</dt>
                        <dd className="text-base font-semibold text-slate-900">
                          {portfolioItem.categories && portfolioItem.categories.length > 0
                            ? portfolioItem.categories.map(cat => cat.name).join(', ')
                            : portfolioItem.category?.name || 'Genel'}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-slate-500 mb-1">Durum</dt>
                      <dd>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Tamamlandı
                        </span>
                      </dd>
                    </div>
                    {portfolioItem.technologies && portfolioItem.technologies.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <dt className="text-sm font-medium text-slate-500 mb-3">Kullanılan Teknolojiler</dt>
                        <dd className="flex flex-wrap gap-2">
                          {portfolioItem.technologies.map((tech, index) => (
                            <span key={index} className="px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-white hover:border-brand-primary-200 hover:text-brand-primary-700 transition-colors duration-200 cursor-default">
                              {tech}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="bg-brand-primary-900 rounded-2xl p-6 md:p-8 text-center text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="relative z-10">
                    <h4 className="text-xl font-bold mb-3 text-white">Benzer Bir Projeniz mi Var?</h4>
                    <p className="text-brand-primary-100 text-sm mb-6 leading-relaxed text-white">
                      Sizin için de benzer bir çözüm üretebiliriz. Detayları konuşmak için iletişime geçin.
                    </p>
                    <Link href="/contact" className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-brand-primary-900 text-sm font-bold rounded-xl hover:bg-brand-primary-50 transition-colors duration-200">
                      Teklif Alın
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {relatedProjects.length > 0 && (
            <div className="mt-20 md:mt-32 pt-16 border-t border-gray-100">
              <div className="section-header">
                <h2 className="section-title">Benzer Projeler</h2>
                <p className="section-subtitle">Aynı kategoriden ilginizi çekebilecek diğer çalışmalarımız</p>
              </div>
              <div className="mb-12">
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
              </div>
              <div className="text-center">
                <Link href="/portfolio" className="btn-outline">Tüm Portfolyoyu Görüntüle</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-0 w-[500px] h-[500px] bg-brand-primary-50/40 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-0 w-[600px] h-[600px] bg-slate-50/60 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}
