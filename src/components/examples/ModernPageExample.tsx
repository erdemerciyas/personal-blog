'use client';

import React, { useState, useEffect } from 'react';
import ContentSkeleton from '../ContentSkeleton';
import PrefetchLink from '../PrefetchLinks';

// Modern sayfa örneği - Skeleton sadece dinamik içerikler için
export default function ModernPageExample() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API'den veri çekme simülasyonu
    const fetchServices = async () => {
      setLoading(true);
      try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setServices([
          { id: 1, title: '3D Modelleme', description: 'Profesyonel 3D tasarım hizmetleri' },
          { id: 2, title: 'Yapısal Analiz', description: 'Sonlu elemanlar analizi' },
          { id: 3, title: 'Otomasyon', description: 'Endüstriyel otomasyon çözümleri' }
        ]);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        {/* Static content - No skeleton needed */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Modern Sayfa Örneği
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Bu sayfa modern loading yaklaşımını gösterir. Sayfa geçişlerinde loading bar,
            dinamik içeriklerde skeleton loader kullanılır.
          </p>
        </div>

        {/* Navigation with prefetch */}
        <div className="flex justify-center space-x-4 mb-12">
          <PrefetchLink 
            href="/" 
            className="bg-brand-primary-700 text-white px-6 py-3 rounded-lg hover:bg-brand-primary-800 transition-colors"
          >
            Ana Sayfa
          </PrefetchLink>
          <PrefetchLink 
            href="/about" 
            className="bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Hakkımda
          </PrefetchLink>
          <PrefetchLink 
            href="/services" 
            className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Hizmetler
          </PrefetchLink>
        </div>

        {/* Dynamic content with skeleton */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Dinamik İçerik (API'den Yükleniyor)
          </h2>
          
          {loading ? (
            // Skeleton sadece dinamik içerik yüklenirken
            <ContentSkeleton type="card" count={3} />
          ) : (
            // Gerçek içerik
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-slate-600">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* More examples */}
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Diğer Skeleton Türleri
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Liste Skeleton</h3>
              <ContentSkeleton type="list" count={3} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Profil Skeleton</h3>
              <ContentSkeleton type="profile" count={1} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Makale Skeleton</h3>
              <ContentSkeleton type="article" count={2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}