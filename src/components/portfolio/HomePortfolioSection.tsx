'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon,
  SparklesIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import ModernProjectCard from './ModernProjectCard';
import type { PortfolioItem } from '../../types/portfolio';

interface HomePortfolioSectionProps {
  portfolioItems: PortfolioItem[];
  isLoading?: boolean;
}

export default function HomePortfolioSection({ 
  portfolioItems, 
  isLoading = false 
}: HomePortfolioSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Featured projects (first 6 or all if less than 6)
  const featuredProjects = portfolioItems.slice(0, 6);
  const projectsPerSlide = 3;
  const totalSlides = Math.ceil(featuredProjects.length / projectsPerSlide);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [currentSlide, isAutoPlaying, totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (isLoading) {
    return (
      <section className="section bg-white">
        <div className="container-main">
          <div className="text-center mb-20">
            <div className="w-16 h-16 bg-slate-200 rounded-full animate-pulse mx-auto mb-6"></div>
            <div className="h-12 bg-slate-200 rounded-lg w-96 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded w-2/3 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-lg border border-slate-200/50 overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-slate-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-12 bg-slate-200 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredProjects.length) {
    return (
      <section className="section bg-white">
        <div className="container-main">
          <div className="text-center mb-20">
            <h2 className="section-title text-gradient mb-6">
              Öne Çıkan Projelerimiz
            </h2>
            <p className="section-subtitle max-w-3xl mx-auto">
              Tamamladığımız başarılı projelerden örnekler. Kalite ve yenilik odaklı 
              çalışmalarımızı keşfedin.
            </p>
          </div>
          
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-4">
              Projeler Yükleniyor
            </h3>
            <p className="text-slate-600">
              Yakında burada örnek projelerimizi görebileceksiniz.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-brand-primary-600 rounded-full"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 border-2 border-blue-500 rotate-45"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 border-2 border-purple-500 rounded-full"></div>
      </div>

      <div className="container-main relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary-100 to-blue-100 rounded-2xl text-brand-primary-800 font-semibold mb-6">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Başarılı Projeler
          </div>
          <h2 className="section-title text-gradient mb-6">
            Öne Çıkan Projelerimiz
          </h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            Tamamladığımız başarılı projelerden örnekler. Kalite ve yenilik odaklı 
            çalışmalarımızı keşfedin.
          </p>
        </motion.div>

        {/* Projects Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/90 backdrop-blur-sm hover:bg-white shadow-xl rounded-full transition-all duration-300 hover:scale-110 -ml-6"
              >
                <ChevronLeftIcon className="w-6 h-6 text-slate-700" />
              </button>
              
              <button
                onClick={nextSlide}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/90 backdrop-blur-sm hover:bg-white shadow-xl rounded-full transition-all duration-300 hover:scale-110 -mr-6"
              >
                <ChevronRightIcon className="w-6 h-6 text-slate-700" />
              </button>
            </>
          )}

          {/* Projects Grid */}
          <div className="overflow-hidden rounded-3xl">
            <motion.div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-1 sm:px-2">
                    {featuredProjects
                      .slice(slideIndex * projectsPerSlide, (slideIndex + 1) * projectsPerSlide)
                      .map((item, index) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.6, 
                            delay: index * 0.1,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }}
                          viewport={{ once: true }}
                        >
                          <ModernProjectCard
                            project={{
                              id: item._id,
                              slug: item.slug,
                              title: item.title,
                              description: item.description,
                              coverImage: item.coverImage,
                              category: item.categories && item.categories.length > 0 
                                ? item.categories.map(cat => cat.name).join(', ')
                                : item.category?.name || 'Genel',
                              client: item.client,
                              completionDate: item.completionDate,
                              technologies: item.technologies,
                              featured: item.featured
                            }}
                            index={index}
                            layout="grid"
                          />
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-12 space-x-3">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-brand-primary-600 scale-125' 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="/portfolio" className="btn-secondary group">
            <EyeIcon className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
            Tüm Projeleri Görüntüle
            <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 pt-16 border-t border-slate-200"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-primary-700 mb-2">
              {portfolioItems.length}+
            </div>
            <div className="text-slate-600 font-medium">Tamamlanan Proje</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              100%
            </div>
            <div className="text-slate-600 font-medium">Müşteri Memnuniyeti</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {new Date().getFullYear() - 2020}+
            </div>
            <div className="text-slate-600 font-medium">Yıllık Deneyim</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}