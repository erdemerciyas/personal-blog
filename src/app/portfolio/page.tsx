'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import ContentSkeleton from '../../components/ContentSkeleton';
import { useSearchParams, useRouter } from 'next/navigation';
import ModernProjectGrid from '../../components/ModernProjectGrid';
import PortfolioShowcase from '../../components/PortfolioShowcase';
import { ButtonLink } from '../../components/SmartLink';
import { PrefetchLinks } from '../../components/PrefetchLinks';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Squares2X2Icon,
  TagIcon
} from '@heroicons/react/24/outline';
import type { PortfolioItem, Category } from '../../types/portfolio';

// Helper component to handle client-side logic dependent on Suspense
function PortfolioPageContent() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hero, setHero] = useState<{ title: string; description: string }>({ title: '', description: '' });
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Çoklu kategori desteği
  const selectedCategories = useMemo(() => {
    const categoriesParam = searchParams?.get('categories');
    const categoryParam = searchParams?.get('category'); // Geriye uyumluluk
    
    if (categoriesParam) {
      return categoriesParam.split(',').map(slug => slug.trim()).filter(Boolean);
    } else if (categoryParam) {
      return [categoryParam];
    }
    return [];
  }, [searchParams]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Hero başlık ve açıklama fetch
        const heroRes = await fetch('/api/admin/page-settings/portfolio');
        if (heroRes.ok) {
          const heroData = await heroRes.json();
          setHero({
            title: heroData.title || 'Portfolyo',
            description: heroData.description || ''
          });
        } else {
          setHero({ title: 'Portfolyo', description: '' });
        }
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
  }, [selectedCategories]);

  const handleCategoryFilter = (slug: string) => {
    const params = new URLSearchParams(window.location.search);
    const currentCategories = selectedCategories;
    
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
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 py-28">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Portfolio yükleniyor...</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-20">
          <ContentSkeleton type="card" count={6} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Prefetch portfolio detail pages */}
      <PrefetchLinks 
        links={portfolioItems.map(item => `/portfolio/${item.slug}`)}
        priority="low"
        portfolioData={portfolioItems}
        strategy="portfolio"
      />
      
      {/* Modern Portfolio Showcase */}
      <div className="container-main py-16">
        <PortfolioShowcase
          projects={portfolioItems}
          categories={categories}
          title={hero.title || "Portfolio"}
          subtitle={hero.description || "Gerçekleştirdiğim projeler ve çalışmalar"}
          showSearch={true}
          showFilter={true}
          showAnimation={true}
        />
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 py-28">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Portfolio yükleniyor...</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-20">
          <ContentSkeleton type="card" count={6} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" />
        </div>
      </div>
    }>
      <PortfolioPageContent />
    </Suspense>
  );
} 