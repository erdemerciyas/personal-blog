'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRightIcon, 
  CheckBadgeIcon,
  ClockIcon,
  StarIcon 
} from '@heroicons/react/24/outline';

interface Service {
  _id: string;
  title: string;
  description: string;
  image?: string;
  features?: string[];
  price?: string;
  duration?: string;
  rating?: number;
  createdAt: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set page metadata
    document.title = 'Hizmetlerimiz | Kişisel Blog';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Modern teknoloji çözümleri ve profesyonel hizmetlerimizi keşfedin. Web geliştirme, mobil uygulama ve daha fazlası.');
    }

    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          throw new Error('Servisler yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        setServices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Hizmetler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-3">Bir Hata Oluştu</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white pt-32 pb-20 md:pt-40 md:pb-32 rounded-b-3xl shadow-xl relative">
        {/* Beautiful spacing for nav overlay */}
        <div className="absolute top-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 tracking-tight leading-tight">
            Sunduğumuz Hizmetler
          </h1>
          <p className="text-lg sm:text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">
            Modern teknoloji ve uzman kadromuzla, projelerinizi hayata geçirmek ve 
            işletmenizi bir adım öne taşımak için kapsamlı mühendislik çözümleri sunuyoruz.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Detaylı Hizmet Açıklamaları
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Her bir hizmetimizin detaylarını inceleyin ve ihtiyaçlarınıza en uygun çözümü keşfedin.
            </p>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <StarIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Henüz hizmet bulunmuyor
              </h2>
              <p className="text-gray-600">
                Yakında sizlere hizmet sunmaya başlayacağız.
              </p>
            </div>
          ) : (
            <div className="space-y-12 md:space-y-16 lg:space-y-20">
              {services.map((service, index) => (
                <div key={service._id} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
                  {/* Service Image */}
                  <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="relative h-64 md:h-72 lg:h-80 rounded-xl overflow-hidden shadow-lg">
                      {service.image ? (
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-teal-500 to-blue-600 h-full flex items-center justify-center">
                          <div className="text-white text-6xl md:text-7xl lg:text-8xl font-bold opacity-30">
                            {service.title.charAt(0)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
                      {/* Service Badge */}
                      <div className="inline-flex items-center bg-teal-100 text-teal-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                          {service.title.charAt(0)}
                        </div>
                        {service.title}
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                        {service.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">
                        {service.description}
                      </p>

                      {/* Features Section */}
                      {service.features && service.features.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <CheckBadgeIcon className="w-5 h-5 text-teal-500 mr-2" />
                            Öne Çıkan Özellikler
                          </h4>
                          <ul className="space-y-2">
                            {service.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start text-gray-700 text-sm md:text-base">
                                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Service Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        {service.duration && (
                          <div className="flex items-center text-gray-600">
                            <ClockIcon className="w-4 h-4 mr-2" />
                            <span className="text-sm">Süre: {service.duration}</span>
                          </div>
                        )}
                        
                        {service.rating && (
                          <div className="flex items-center text-gray-600">
                            <StarIcon className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{service.rating}/5</span>
                          </div>
                        )}

                        {service.price && (
                          <div className="text-teal-600 font-semibold text-sm md:text-base">
                            {service.price}
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Link
                        href={`/contact?service=${encodeURIComponent(service.title)}`}
                        className="btn-primary inline-flex items-center group text-sm md:text-base"
                      >
                        <span>Detaylı Bilgi Al</span>
                        <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-gray-900 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
            Özel Bir Projeniz mi Var?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Size özel çözümler geliştirmek için buradayız. Projenizi birlikte değerlendirelim.
          </p>
          <Link
            href="/contact"
            className="btn-primary inline-flex items-center text-base md:text-lg"
          >
            <span>Proje Teklifi Al</span>
            <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
} 