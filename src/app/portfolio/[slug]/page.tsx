'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PortfolioItem } from '../../../types/portfolio';
import PortfolioDetailHero from '../../../components/portfolio/PortfolioDetailHero';
import PortfolioImageGallery from '../../../components/portfolio/PortfolioImageGallery';
import ModernProjectGrid from '../../../components/portfolio/ModernProjectGrid';
import HTMLContent from '../../../components/HTMLContent';
import ContentSkeleton from '../../../components/ContentSkeleton';
import { cachedFetch } from '../../../lib/client-cache';
import BreadcrumbsJsonLd from '../../../components/seo/BreadcrumbsJsonLd';
import PortfolioJsonLd from '../../../components/seo/PortfolioJsonLd';
import { config } from '../../../lib/config';
import Breadcrumbs from '../../../components/Breadcrumbs';

// removed unused Metadata import

// Helper component to handle client-side logic dependent on Suspense
function PortfolioDetailPageContent({ params }: { params: { slug: string } }) {
  const [portfolioItem, setPortfolioItem] = useState<PortfolioItem | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Retry logic ile API çağrısı
        let retryCount = 0;
        const maxRetries = 3;
        let data: PortfolioItem | null = null;
        
        while (retryCount < maxRetries) {
          try {
            // Timeout ile fetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 saniye timeout
            
            // Use cached fetch for better performance
            data = await cachedFetch(
              `/api/portfolio/slug/${encodeURIComponent(params.slug)}`,
              {
                signal: controller.signal,
                headers: {
                  'Cache-Control': 'no-cache',
                }
              },
              2 * 60 * 1000 // 2 minutes cache
            );
            
            clearTimeout(timeoutId);
            break; // Başarılı olursa döngüden çık
            
          } catch (fetchError) {
            console.error(`Portfolio fetch attempt ${retryCount + 1} failed:`, fetchError);
            
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
              if (retryCount < maxRetries - 1) {
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
                continue;
              } else {
                throw new Error('İstek zaman aşımına uğradı. Lütfen sayfayı yenileyin.');
              }
            }
            
            if (retryCount < maxRetries - 1) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              continue;
            } else {
              throw fetchError;
            }
          }
        }

        if (!data) {
          throw new Error('Proje verisi alınamadı');
        }

        setPortfolioItem(data);
        
        // Benzer projeleri getir - kategori bilgisi varsa
        if (data.category?.slug) {
          try {
            const relatedController = new AbortController();
            const relatedTimeoutId = setTimeout(() => relatedController.abort(), 10000);
            
            const relatedResponse = await fetch(`/api/portfolio?category=${data.category.slug}`, {
              signal: relatedController.signal
            });
            
            clearTimeout(relatedTimeoutId);
            
            if (relatedResponse.ok) {
              const relatedData: PortfolioItem[] = await relatedResponse.json();
              const filteredProjects = relatedData
                .filter((project) => project.slug !== params.slug)
                .slice(0, 3);
              setRelatedProjects(filteredProjects);
            }
          } catch (relatedError) {
            console.error('Benzer projeler yüklenirken hata:', relatedError);
            // Benzer proje hatası ana hatayı etkilemesin
          }
        } else {
          // Kategori bilgisi yoksa tüm projelerden rastgele 3 tane al
          try {
            const allProjectsController = new AbortController();
            const allProjectsTimeoutId = setTimeout(() => allProjectsController.abort(), 10000);
            
            const allProjectsResponse = await fetch('/api/portfolio', {
              signal: allProjectsController.signal
            });
            
            clearTimeout(allProjectsTimeoutId);
            
            if (allProjectsResponse.ok) {
              const allProjects: PortfolioItem[] = await allProjectsResponse.json();
              const filteredProjects = allProjects
                .filter((project) => project.slug !== params.slug)
                .sort(() => 0.5 - Math.random()) // Rastgele sırala
                .slice(0, 3);
              setRelatedProjects(filteredProjects);
            }
          } catch (relatedError) {
            console.error('Rastgele projeler yüklenirken hata:', relatedError);
            // Benzer proje hatası ana hatayı etkilemesin
          }
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
        console.error('Portfolio detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchPortfolioData();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Skeleton */}
        <section className="bg-gradient-primary py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Proje detayları yükleniyor...</p>
          </div>
        </section>
        
        {/* Content Skeleton */}
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
          <p className="text-slate-600 mb-6">{error || 'Aradığınız proje bulunamadı veya bir hata oluştu.'}</p>
          <Link href="/portfolio" className="btn-primary">
            Portfolyoya Dön
          </Link>
        </div>
      </div>
    );
  }

  // Combine cover image with other images, avoiding duplicates
  const allImages = portfolioItem.coverImage
    ? [portfolioItem.coverImage, ...(portfolioItem.images || []).filter(img => img !== portfolioItem.coverImage)]
    : (portfolioItem.images || []);

  const baseUrl = (config.app.url || (typeof window !== 'undefined' ? window.location.origin : '') || '').replace(/\/$/, '');
  const safeDescription = (portfolioItem.description || '').replace(/<[^>]*>/g, '').slice(0, 200);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PortfolioDetailHero project={portfolioItem} />

      {/* Breadcrumbs under Hero */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <Breadcrumbs />
        </div>
      </section>

      {/* JSON-LD: Breadcrumbs */}
      <BreadcrumbsJsonLd
        items={[
          { name: 'Anasayfa', item: '/' },
          { name: 'Portfolyo', item: '/portfolio' },
          { name: portfolioItem.title, item: `/portfolio/${params.slug}` },
        ]}
      />
      {/* JSON-LD: CreativeWork for portfolio/project */}
      <PortfolioJsonLd
        name={portfolioItem.title}
        description={safeDescription}
        url={`${baseUrl}/portfolio/${params.slug}`}
        images={allImages}
        baseUrl={baseUrl}
      />

      {/* Main Content */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          {/* Content Container */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 lg:p-16">
            <div className="max-w-6xl mx-auto">

              {/* Main Content Grid - 70/30 Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-12 mb-16">
                {/* Image Gallery - Takes up 70% on large screens */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="lg:col-span-7"
                >
                  <PortfolioImageGallery
                    images={portfolioItem.images || []}
                    title={portfolioItem.title}
                    coverImage={portfolioItem.coverImage}
                  />
                </motion.div>

                {/* Project Details Sidebar - Takes up 30% on large screens */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="lg:col-span-3 space-y-6"
                >
                  {/* Additional project info can go here */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 md:p-8 lg:sticky lg:top-24">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">
                      Proje Bilgileri
                    </h2>
                    
                    {/* Client */}
                    {portfolioItem.client && (
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-brand-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Müşteri</h3>
                        </div>
                        <p className="text-slate-900 font-medium">{portfolioItem.client}</p>
                      </div>
                    )}

                    {/* Completion Date */}
                    {portfolioItem.completionDate && (
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-brand-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Tamamlanma Tarihi</h3>
                        </div>
                        <p className="text-slate-900 font-medium">
                          {new Date(portfolioItem.completionDate).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}

                    {/* Category */}
                    {(portfolioItem.category || (portfolioItem.categories && portfolioItem.categories.length > 0)) && (
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-brand-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Kategori</h3>
                        </div>
                        <p className="text-slate-900 font-medium">
                          {portfolioItem.categories && portfolioItem.categories.length > 0 
                            ? portfolioItem.categories.map(cat => cat.name).join(', ')
                            : portfolioItem.category?.name || 'Genel'
                          }
                        </p>
                      </div>
                    )}

                    {/* Technologies */}
                    {portfolioItem.technologies && portfolioItem.technologies.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 text-brand-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Kullanılan Teknolojiler</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {portfolioItem.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-brand-primary-100 text-brand-primary-800 rounded-full text-sm font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Project Status */}
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-slate-600 text-sm">Proje Durumu</span>
                        <span className="text-green-600 font-semibold text-sm flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Tamamlandı
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Project Description Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-16"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 md:p-12 mx-auto">
                  <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Proje Açıklaması</h2>
                  <div className="prose prose-lg prose-slate max-w-none">
                    <HTMLContent 
                      content={portfolioItem.description}
                      className="text-lg leading-relaxed text-slate-700"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Related Projects Section */}
              {relatedProjects.length > 0 && (
                <motion.section 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="border-t border-slate-200/50 pt-16"
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
                  
                  <div className="text-center mt-12">
                    <Link href="/portfolio" className="btn-secondary rounded-full">
                      Tüm Projeleri Gör
                    </Link>
                  </div>
                </motion.section>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Wrap with Error Boundary for better error handling
import PortfolioErrorBoundary from '../../../components/portfolio/PortfolioErrorBoundary';

export default function PortfolioDetailPage({ params }: { params: { slug: string } }) {
  return (
    <PortfolioErrorBoundary>
      <PortfolioDetailPageContent params={params} />
    </PortfolioErrorBoundary>
  );
}