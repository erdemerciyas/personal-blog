'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HTMLContent from '../components/HTMLContent';
import ContentSkeleton from '../components/ContentSkeleton';
import HomePortfolioSection from '../components/portfolio/HomePortfolioSection';
import { useSliderItems, usePortfolioItems, useServices } from '../hooks/useApi';
import { 
  ArrowRightIcon,
  CubeTransparentIcon,
  WrenchScrewdriverIcon,
  CheckBadgeIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

// Interfaces
interface SliderItem {
  _id: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  badge?: string;
  duration?: number;
}

interface PortfolioItem {
  _id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  category: {
    _id: string;
    name: string;
  };
}

interface ServiceItem {
  _id: string;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  image?: string;
  features?: string[];
}

// Default content - empty to avoid showing static content when dynamic content is not available
const defaultServices: ServiceItem[] = [];

const defaultSlider: SliderItem[] = [
  {
    _id: 'default-hero',
    title: 'Modern Mühendislik Çözümleri',
    subtitle: '3D Tarama, Modelleme ve Prototipleme',
    description: 'Yenilikçi teknolojilerle projelerinizi hayata geçirin. Profesyonel 3D tarama ve tersine mühendislik hizmetleri.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    buttonText: 'Projelerimi Görüntüle',
    buttonLink: '/portfolio',
    badge: 'Yenilikçi'
  }
];

export default function HomePage() {
  // Client-side mounting state to prevent hydration issues
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use optimized API hooks with caching
  const { data: sliderData, loading: sliderLoading } = useSliderItems();
  const { data: portfolioData, loading: portfolioLoading } = usePortfolioItems(6);
  const { data: servicesData, loading: servicesLoading } = useServices();

  // Process slider data
  const sliderItems = (sliderData as any[])?.filter((item: any) => item.isActive)?.map((item: any) => ({
    _id: item._id,
    title: item.title,
    subtitle: item.subtitle,
    description: item.description,
    image: item.imageUrl,
    buttonText: item.buttonText || 'Keşfet',
    buttonLink: item.buttonLink || '/portfolio',
    badge: item.badge || 'Yenilik',
    duration: item.duration || 5000
  })) || defaultSlider;

  // Process portfolio data
  const portfolioItems = (portfolioData as any[])?.slice(0, 6) || [];

  // Process services data
  const services = (servicesData as any[])?.length > 0 ? (servicesData as any[]).slice(-6) : defaultServices;

  // Slider states
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || sliderItems.length <= 1) return;
    
    const currentSlideDuration = sliderItems[currentSlideIndex]?.duration || 5000;
    
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % sliderItems.length);
    }, currentSlideDuration);
    
    return () => clearInterval(timer);
  }, [currentSlideIndex, isPlaying, sliderItems]);

  // Navigation functions
  const nextSlide = () => {
    if (isTransitioning || sliderItems.length <= 1) return;
    setIsTransitioning(true);
    setCurrentSlideIndex((prev) => (prev + 1) % sliderItems.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning || sliderItems.length <= 1) return;
    setIsTransitioning(true);
    setCurrentSlideIndex((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlideIndex) return;
    setIsTransitioning(true);
    setCurrentSlideIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const currentSlide = sliderItems[currentSlideIndex] || defaultSlider[0];

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Sayfa yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Slider Section */}
      <section className={`relative overflow-hidden min-h-screen flex items-center justify-center ${
        sliderLoading ? 'bg-gradient-to-br from-slate-900 to-blue-900' : ''
      }`}>
        {sliderLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg">Hero içeriği yükleniyor...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Background Images */}
            <div className="absolute inset-0">
              {sliderItems.map((slide, index) => (
                <div
                  key={slide._id}
                  className={`absolute inset-0 transition-all duration-1000 ease-out ${
                    index === currentSlideIndex 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-110'
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-blue-900/90"></div>
                </div>
              ))}
            </div>
            
            {/* Slider Controls */}
            {sliderItems.length > 1 && (
              <>
                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200"
                  disabled={isTransitioning}
                >
                  <ChevronLeftIcon className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200"
                  disabled={isTransitioning}
                >
                  <ChevronRightIcon className="w-6 h-6 text-white" />
                </button>
                
                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute bottom-20 right-4 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-5 h-5 text-white" />
                  ) : (
                    <PlayIcon className="w-5 h-5 text-white" />
                  )}
                </button>
                
                {/* Dots Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                  {sliderItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlideIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Content */}
            <div className="section-hero relative z-10">
              <div className="container-content text-center text-white">
                {/* Badge */}
                <div className="mb-8 animate-fade-in">
                  <span className="inline-flex items-center px-6 py-3 bg-glass rounded-2xl text-sm font-semibold">
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    {currentSlide.badge}
                  </span>
                </div>
                
                {/* Title */}
                <h1 className={`${
                  currentSlide.title.length > 30 ? 'hero-title-compact' : 
                  currentSlide.title.length > 20 ? 'hero-title-responsive' : 
                  'hero-title'
                } text-gradient-hero mb-6 animate-slide-in-left max-w-6xl mx-auto`}>
                  {currentSlide.title}
                </h1>
                
                {/* Subtitle */}
                {currentSlide.subtitle && (
                  <p className="text-2xl sm:text-3xl font-semibold text-teal-200 mb-8 animate-slide-in-right">
                    {currentSlide.subtitle}
                  </p>
                )}
                
                {/* Description */}
                <p className="text-xl leading-relaxed text-slate-200 max-w-4xl mx-auto mb-12 animate-fade-in">
                  {currentSlide.description}
                </p>
                
                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in">
                  <Link href={currentSlide.buttonLink || '/portfolio'} className="btn-primary">
                    <RocketLaunchIcon className="w-5 h-5 mr-2" />
                    {currentSlide.buttonText}
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                  <Link href="/contact" className="btn-secondary">
                    İletişime Geçin
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Services Section */}
      <section className="section bg-gradient-subtle">
        <div className="container-main">
          {/* Header */}
          <div className="text-center mb-20">
            <h2 className="section-title text-gradient mb-6">
              Sunduğumuz Hizmetler
            </h2>
            <p className="section-subtitle max-w-3xl mx-auto">
              Modern teknoloji ve uzman kadromuzla projelerinizi hayata geçirmek için 
              kapsamlı mühendislik çözümleri sunuyoruz.
            </p>
          </div>

          {/* Services Grid */}
          {servicesLoading ? (
            <ContentSkeleton type="card" count={3} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {services.map((service, index) => (
                <div key={service._id} className="card-modern group h-full flex flex-col">
                  {/* Icon or Image */}
                  <div className="mb-8 flex justify-center">
                    {service.image ? (
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden">
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          className="object-cover transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center transition-transform duration-300">
                        {service.icon && (
                          <service.icon className="w-8 h-8 text-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="text-center flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-teal-600 transition-colors duration-300">
                      {service.title}
                    </h3>
                    <div className="text-body mb-6 flex-1">
                      <HTMLContent 
                        content={service.description}
                        truncate={150}
                        className="line-clamp-3"
                      />
                    </div>
                    <Link
                      href={`/services#${service.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}`}
                      className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold transition-colors duration-200 mt-auto"
                    >
                      Detayları Gör
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Link */}
          <div className="text-center">
            <Link href="/services" className="btn-outline">
              Tüm Hizmetlerimizi Görüntüle
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <HomePortfolioSection 
        portfolioItems={portfolioItems}
        isLoading={portfolioLoading}
      />

      {/* CTA Section */}
      <section className="section bg-gradient-primary text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rotate-45"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-white rounded-full"></div>
        </div>

        <div className="container-content text-center relative z-10">
          <h2 className="section-title text-white mb-6">
            Projenizi Gerçeğe Dönüştürün
          </h2>
          <p className="section-subtitle text-teal-100 mb-12 max-w-2xl mx-auto">
            Uzman ekibimiz ve modern teknolojilerimizle fikirlerinizi hayata geçirmeye hazırız.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/contact" className="btn-secondary">
              <SparklesIcon className="w-5 h-5 mr-2" />
              İletişime Geçin
            </Link>
            <Link href="/portfolio" className="btn-secondary">
              Projelerimizi İnceleyin
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}