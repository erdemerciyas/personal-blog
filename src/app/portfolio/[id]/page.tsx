'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { PortfolioItem } from '@/types/portfolio'; // Assuming PortfolioItem type is correctly defined
import ProjectGrid from '@/components/ProjectGrid'; // Ensuring this import is correct

// Helper component to handle client-side logic dependent on Suspense
function PortfolioDetailPageContent({ params }: { params: { id: string } }) {
  const [portfolioItem, setPortfolioItem] = useState<PortfolioItem | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      setError(null);
    try {
      const response = await fetch(`/api/portfolio/${params.id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Proje detayları getirilemedi.');
        }
        const data: PortfolioItem = await response.json();
      setPortfolioItem(data);
        setSelectedImage(data.coverImage || (data.images && data.images[0]) || 'https://via.placeholder.com/1200x800?text=Görsel+Yok');
      
      if (data.category?.slug) {
        const relatedResponse = await fetch(`/api/portfolio?category=${data.category.slug}`);
        if (relatedResponse.ok) {
            const relatedData: PortfolioItem[] = await relatedResponse.json();
          setRelatedProjects(
            relatedData
                .filter((project) => project._id !== params.id)
              .slice(0, 3)
          );
        }
      }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    if (params.id) {
      fetchPortfolioData();
    }
  }, [params.id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox('prev');
      } else if (e.key === 'ArrowRight') {
        navigateLightbox('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen, lightboxImageIndex]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-slate-500">Proje detayları yükleniyor...</p>
      </div>
    );
  }

  if (error || !portfolioItem) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center text-center px-4">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg shadow border border-red-200 max-w-lg w-full">
          <h3 className="text-xl font-semibold mb-2">Proje Yüklenemedi</h3>
          <p>{error || 'Aradığınız proje bulunamadı veya bir hata oluştu.'}</p>
          <Link href="/portfolio" legacyBehavior>
            <a className="btn-primary mt-6">
              Portfolyoya Dön
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [portfolioItem.coverImage, ...(portfolioItem.images || [])].filter(Boolean) as string[];

  const openLightbox = (imageIndex: number) => {
    setLightboxImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
    } else {
      setLightboxImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="section-padding bg-gradient-to-br from-slate-100 via-slate-50 to-white min-h-screen">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-teal-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-60 right-32 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-cyan-100/30 rounded-full blur-3xl"></div>
      </div>
      
      {/* Main Content Container */}
      <div className="relative z-10">
        <div className="container-main">
          {/* Content Container with distinctive background */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-12 xl:p-16">
            {/* Back Button and Header */}
            <div className="mb-8">
              <Link href="/portfolio" className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 mb-6 group focus-ring rounded px-2 py-1">
                <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
                Tüm Projelere Dön
              </Link>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 leading-tight">
                    {portfolioItem.title}
                  </h1>
                  {portfolioItem.category && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-teal-100 text-teal-700 border border-teal-200">
                      <TagIcon className="h-4 w-4 mr-2" />
                      {portfolioItem.category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12 mb-16">
              {/* Image Gallery - Takes up 2/3 on large screens */}
              <div className="xl:col-span-2 space-y-6">
                {/* Main Image */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white group cursor-pointer"
                     onClick={() => openLightbox(allImages.findIndex(img => img === selectedImage))}>
                  {selectedImage ? (
                    <>
                      <Image
                        src={selectedImage}
                        alt={`${portfolioItem.title} - Seçili Görsel`}
                        fill
                        className="object-cover transition-all duration-300 ease-in-out group-hover:scale-105"
                        priority
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                            <MagnifyingGlassIcon className="w-6 h-6 text-slate-700" />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-slate-100 flex items-center justify-center h-full">
                      <div className="text-center">
                        <PhotoIcon className="h-16 w-16 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">Görsel yükleniyor...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Gallery */}
                {allImages.length > 1 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/60">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Proje Görselleri</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(image)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 focus-ring hover:scale-105 ${
                            selectedImage === image
                              ? 'border-teal-500 shadow-lg ring-2 ring-teal-200'
                              : 'border-slate-200 hover:border-teal-300'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`Proje görseli ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {selectedImage === image && (
                            <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Details Sidebar - Takes up 1/3 on large screens */}
              <div className="xl:col-span-1 space-y-6">
                {/* Project Information Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/60 p-6 md:p-8 sticky top-24">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3">
                    Proje Bilgileri
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="p-2 bg-teal-50 rounded-lg mr-4 flex-shrink-0">
                        <UserIcon className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">Müşteri</h3>
                        <p className="text-lg font-semibold text-slate-800">{portfolioItem.client}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 bg-teal-50 rounded-lg mr-4 flex-shrink-0">
                        <CalendarIcon className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">Tamamlanma Tarihi</h3>
                        <p className="text-lg font-semibold text-slate-800">
                          {new Date(portfolioItem.completionDate).toLocaleDateString('tr-TR', {
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Description Section */}
            <div className="mb-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/60 p-6 md:p-8 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Proje Açıklaması</h2>
                <div className="prose prose-lg prose-slate max-w-none">
                  <p className="text-lg leading-relaxed text-slate-700">
                    {portfolioItem.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Related Projects Section */}
            {relatedProjects.length > 0 && (
              <section className="border-t border-slate-200/50 pt-16">
                <div className="text-center mb-12">
                  <h2 className="section-title">Benzer Projeler</h2>
                  <p className="section-subtitle max-w-2xl mx-auto">
                    Aynı kategoriden diğer projelerimizi inceleyin
                  </p>
                </div>
                <ProjectGrid projects={relatedProjects.map(p => ({
                  id: p._id,
                  title: p.title || '',
                  description: p.description || '',
                  coverImage: p.coverImage || '',
                  category: p.category?.name || '' 
                }))} />
                <div className="text-center mt-8">
                  <Link href="/portfolio" className="btn-outline">
                    Tüm Projeleri Gör
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
              title="Kapat (ESC)"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
              {lightboxImageIndex + 1} / {allImages.length}
            </div>
            
            {/* Previous Button */}
            {allImages.length > 1 && (
              <button
                onClick={() => navigateLightbox('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
                title="Önceki (←)"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
            )}
            
            {/* Main Image Container */}
            <div className="relative w-full h-full max-w-7xl max-h-full">
              <Image
                src={allImages[lightboxImageIndex]}
                alt={`${portfolioItem?.title} - Görsel ${lightboxImageIndex + 1}`}
                fill
                className="object-contain"
                quality={100}
                sizes="100vw"
                priority
              />
            </div>
            
            {/* Next Button */}
            {allImages.length > 1 && (
              <button
                onClick={() => navigateLightbox('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
                title="Sonraki (→)"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            )}
            
            {/* Image Title */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 text-white px-6 py-3 rounded-full text-center max-w-lg">
              <h3 className="font-semibold text-lg">{portfolioItem?.title}</h3>
              <p className="text-sm text-gray-300">Görsel {lightboxImageIndex + 1}</p>
            </div>
            
            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 backdrop-blur-sm rounded-2xl p-4 max-w-4xl overflow-x-auto">
                <div className="flex space-x-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setLightboxImageIndex(index)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                        lightboxImageIndex === index
                          ? 'border-teal-400 shadow-lg shadow-teal-400/50'
                          : 'border-white/30 hover:border-white/60'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Küçük görsel ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {lightboxImageIndex === index && (
                        <div className="absolute inset-0 bg-teal-400/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Click outside to close */}
            <div 
              className="absolute inset-0 -z-10" 
              onClick={() => setLightboxOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with Suspense for useSearchParams if it were used, not strictly needed here but good practice if params were dynamic from client
export default function PortfolioDetailPage({ params }: { params: { id: string } }) {
  return <PortfolioDetailPageContent params={params} />;
} 