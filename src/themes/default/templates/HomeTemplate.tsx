/**
 * Default Home Template
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface HomeTemplateProps {
  sliderItems?: any[];
  portfolioItems?: any[];
  services?: any[];
}

export default function HomeTemplate({
  sliderItems: _sliderItems = [],
  portfolioItems = [],
  services = [],
}: HomeTemplateProps) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-brand-primary-900 to-brand-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border-4 border-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-white transform rotate-45 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        <div className="container-main relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Teknoloji ve Yazılım Çözümleri
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Modern teknolojilerle projelerinizi hayata geçiriyoruz
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link href="/portfolio" className="btn-primary inline-flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 mr-2" />
              Projelerimizi İnceleyin
            </Link>
            <Link href="/contact" className="btn-secondary inline-flex items-center justify-center text-white border-white hover:bg-white hover:text-brand-primary-900">
              İletişime Geçin
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section className="section bg-white">
          <div className="container-main">
            <div className="section-header">
              <h2>Sunduğumuz Hizmetler</h2>
              <p>
                Modern teknoloji ve uzman kadromuzla projelerinizi hayata geçirmek için
                kapsamlı mühendislik çözümleri sunuyoruz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/services" className="btn-secondary">
                Tüm Hizmetlerimizi Görüntüle
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Section */}
      {portfolioItems.length > 0 && (
        <section className="section bg-gray-50">
          <div className="container-main">
            <div className="section-header">
              <h2>Son Projelerimiz</h2>
              <p>
                Başarıyla tamamladığımız projelerden bazı örnekler
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioItems.slice(0, 6).map((item, index) => (
                <div key={index} className="card overflow-hidden group">
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/portfolio" className="btn-secondary">
                Tüm Projeleri Görüntüle
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section bg-gradient-primary text-white">
        <div className="container-main text-center">
          <h2 className="text-4xl font-bold mb-6">
            Projenizi Gerçeğe Dönüştürün
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
            Uzman ekibimiz ve modern teknolojilerimizle fikirlerinizi hayata geçirmeye hazırız.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/contact" className="btn-primary inline-flex items-center justify-center bg-white text-brand-primary-900 hover:bg-gray-100">
              <SparklesIcon className="w-5 h-5 mr-2" />
              İletişime Geçin
            </Link>
            <Link href="/portfolio" className="btn-secondary inline-flex items-center justify-center text-white border-white hover:bg-white hover:text-brand-primary-900">
              Projelerimizi İnceleyin
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
