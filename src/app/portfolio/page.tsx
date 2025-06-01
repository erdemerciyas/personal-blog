'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProjectGrid from '@/components/ProjectGrid';
import { PortfolioItem, Category } from '@/types/portfolio'; // Assuming types are defined here
import { TagIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

// Helper component to handle client-side logic dependent on Suspense
function PortfolioPageContent() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategorySlug = searchParams.get('category');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Categories fetch
        const catResponse = await fetch('/api/categories');
        if (!catResponse.ok) {
          throw new Error('Kategoriler yüklenemedi.');
        }
        const catData = await catResponse.json();
        setCategories(catData);

        // Portfolio fetch
        const portfolioUrl = currentCategorySlug 
          ? `/api/portfolio?category=${currentCategorySlug}`
          : '/api/portfolio';
          
        const portfolioResponse = await fetch(portfolioUrl);
        if (!portfolioResponse.ok) {
          throw new Error('Portfolyo projeleri yüklenemedi.');
        }
        const portfolioData = await portfolioResponse.json();
        setPortfolioItems(portfolioData);
      
    } catch (err) {
        console.error('Portfolio fetch error:', err);
        setError(err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
    fetchInitialData();
  }, [currentCategorySlug]);

  const handleCategoryFilter = (slug: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    router.push(`/portfolio?${params.toString()}`);
  };

    return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white pt-32 pb-20 md:pt-40 md:pb-32 rounded-b-3xl shadow-xl relative">
        {/* Beautiful spacing for nav overlay */}
        <div className="absolute top-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 tracking-tight leading-tight">
            Portfolyo Projelerimiz
          </h1>
          <p className="text-lg sm:text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">
            Tamamladığımız çeşitli projeleri ve mühendislik çözümlerimizi inceleyin. Her proje, uzman ekibimizin deneyimi ve modern teknolojilerimizin bir yansımasıdır.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="section-padding">
        <div className="container-main">
          
          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                            ${
                              !currentCategorySlug
                                ? 'bg-teal-500 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-teal-50 hover:text-teal-600 border border-slate-300'
                            }`}
              >
                <Squares2X2Icon className="h-5 w-5 inline-block mr-2 -mt-0.5" />
                Tüm Projeler
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryFilter(category.slug)}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                              ${
                                currentCategorySlug === category.slug
                                  ? 'bg-teal-500 text-white shadow-md'
                                  : 'bg-white text-slate-600 hover:bg-teal-50 hover:text-teal-600 border border-slate-300'
                              }`}
                >
                  <TagIcon className="h-5 w-5 inline-block mr-2 -mt-0.5" />
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Portfolio Grid or Loading/Error State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
              <p className="text-slate-500">Projeler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-8 rounded-xl shadow border border-red-200 text-center min-h-[40vh] flex flex-col justify-center items-center">
              <h3 className="text-xl font-semibold mb-2">Bir Hata Oluştu</h3>
              <p>{error}</p>
              <button 
                onClick={() => { router.refresh(); }}
                className="btn-primary mt-6"
              >
                Tekrar Dene
              </button>
            </div>
          ) : portfolioItems.length > 0 ? (
            <ProjectGrid projects={portfolioItems.map(p => ({
              id: p._id,
              title: p.title,
              description: p.description,
              coverImage: p.coverImage,
              category: p.category?.name || ''
            }))} />
          ) : (
            <div className="text-center py-16 min-h-[40vh] flex flex-col justify-center items-center">
              <Squares2X2Icon className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Proje Bulunamadı
              </h3>
              <p className="text-slate-500">
                {currentCategorySlug 
                  ? `"${categories.find(c=>c.slug === currentCategorySlug)?.name || currentCategorySlug}" kategorisinde henüz proje bulunmuyor.` 
                  : "Görüntülenecek proje bulunmuyor."}
              </p>
              {currentCategorySlug && (
                 <button
                  onClick={() => handleCategoryFilter(null)}
                  className="btn-outline mt-6"
                >
                  Tüm Projeleri Göster
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function PortfolioPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-slate-500">Sayfa yükleniyor...</p>
      </div>
    }>
      <PortfolioPageContent />
    </Suspense>
  );
} 