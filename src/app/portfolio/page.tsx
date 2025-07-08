'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProjectGrid from '../../components/ProjectGrid';
import { PortfolioItem, Category } from '../../types/portfolio';
import { TagIcon, Squares2X2Icon, XMarkIcon } from '@heroicons/react/24/outline';

// Helper component to handle client-side logic dependent on Suspense
function PortfolioPageContent() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Çoklu kategori desteği
  const getSelectedCategories = (): string[] => {
    const categoriesParam = searchParams?.get('categories');
    const categoryParam = searchParams?.get('category'); // Geriye uyumluluk
    
    if (categoriesParam) {
      return categoriesParam.split(',').map(slug => slug.trim()).filter(Boolean);
    } else if (categoryParam) {
      return [categoryParam];
    }
    return [];
  };

  const selectedCategories = getSelectedCategories();

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
        let portfolioUrl = '/api/portfolio';
        if (selectedCategories.length > 0) {
          portfolioUrl = `/api/portfolio?categories=${selectedCategories.join(',')}`;
        }
          
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
  }, [selectedCategories.join(',')]);

  const handleCategoryFilter = (slug: string) => {
    const params = new URLSearchParams(window.location.search);
    const currentCategories = getSelectedCategories();
    
    let newCategories: string[];
    
    if (currentCategories.includes(slug)) {
      // Kategori zaten seçili, kaldır
      newCategories = currentCategories.filter(cat => cat !== slug);
    } else {
      // Kategori seçili değil, ekle
      newCategories = [...currentCategories, slug];
    }
    
    // URL parametrelerini güncelle
    params.delete('category'); // Eski tekli kategori parametresini kaldır
    if (newCategories.length > 0) {
      params.set('categories', newCategories.join(','));
    } else {
      params.delete('categories');
    }
    
    router.push(`/portfolio?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/portfolio');
  };

  const getSelectedCategoryNames = (): string[] => {
    return selectedCategories.map(slug => {
      const category = categories.find(cat => cat.slug === slug);
      return category ? category.name : slug;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Portfolyo yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Portfolyo
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            Tamamladığımız projeleri keşfedin. Kalite ve yenilik odaklı çalışmalarımızı inceleyin.
          </p>
        </div>
      </section>

      {/* Portfolio Content */}
      <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          
          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="mb-12">
              {/* Seçili Kategoriler */}
              {selectedCategories.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-slate-600">Seçili Kategoriler:</span>
                    {getSelectedCategoryNames().map((categoryName, index) => (
                      <span
                        key={selectedCategories[index]}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                      >
                        {categoryName}
                        <button
                          onClick={() => handleCategoryFilter(selectedCategories[index])}
                          className="ml-2 hover:text-teal-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-slate-500 hover:text-slate-700 underline"
                    >
                      Tümünü Temizle
                    </button>
                  </div>
                </div>
              )}
              
              {/* Kategori Butonları */}
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={clearAllFilters}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                              ${
                                selectedCategories.length === 0
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
                                  selectedCategories.includes(category.slug)
                                    ? 'bg-teal-500 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-teal-50 hover:text-teal-600 border border-slate-300'
                                }`}
                  >
                    <TagIcon className="h-5 w-5 inline-block mr-2 -mt-0.5" />
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Grid or Loading/Error State */}
          {portfolioItems.length > 0 ? (
            <ProjectGrid projects={portfolioItems.map(p => ({
              id: p._id,
              title: p.title,
              description: p.description,
              coverImage: p.coverImage,
              category: p.categories && p.categories.length > 0 
                ? p.categories.map(cat => cat.name).join(', ')
                : p.category?.name || ''
            }))} />
          ) : (
            <div className="text-center py-16 min-h-[40vh] flex flex-col justify-center items-center">
              <Squares2X2Icon className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Proje Bulunamadı
              </h3>
              <p className="text-slate-500">
                {selectedCategories.length > 0 
                  ? `Seçili kategorilerde henüz proje bulunmuyor.` 
                  : "Görüntülenecek proje bulunmuyor."}
              </p>
              {selectedCategories.length > 0 && (
                 <button
                  onClick={clearAllFilters}
                  className="btn-outline mt-6"
                >
                  Tüm Projeleri Göster
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Sayfa yükleniyor...</p>
        </div>
      </div>
    }>
      <PortfolioPageContent />
    </Suspense>
  );
} 