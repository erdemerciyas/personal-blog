'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowRightIcon,
    RocketLaunchIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlayIcon,
    PauseIcon
} from '@heroicons/react/24/outline';

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

interface HeroSliderProps {
    items: SliderItem[];
}

const defaultSlider: SliderItem[] = [
    {
        _id: 'default-hero',
        title: 'Modern Mühendislik Çözümleri',
        subtitle: '3D Tarama, Modelleme ve Prototipleme',
        description: 'Yenilikçi teknolojilerle projelerinizi hayata geçirin. Profesyonel 3D tarama ve tersine mühendislik hizmetleri.',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        buttonText: 'Projelerimi Görüntüle',
        buttonLink: '/portfolio'
    }
];

export default function HeroSlider({ items = [] }: HeroSliderProps) {
    const sliderItems = items.length > 0 ? items : defaultSlider;

    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                </div>
            </div>
        );
    }

    return (
        <header className="relative overflow-hidden min-h-screen flex items-center justify-center pb-16 sm:pb-24" role="banner" aria-label="Ana hero bölümü">
            {/* Background Images */}
            <div className="absolute inset-0">
                {sliderItems.map((slide, index) => (
                    <div
                        key={slide._id}
                        className={`absolute inset-0 transition-all duration-1000 ease-out ${index === currentSlideIndex
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
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1e2d]/85 via-[#0f1b26]/85 to-[#0b1520]/90"></div>
                    </div>
                ))}
            </div>

            {/* Slider Controls */}
            {sliderItems.length > 1 && (
                <>
                    {/* Navigation Arrows (hidden on mobile) */}
                    <button
                        onClick={prevSlide}
                        className="hidden sm:block absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                        disabled={isTransitioning}
                        aria-label="Önceki slayt"
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="hidden sm:block absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                        disabled={isTransitioning}
                        aria-label="Sonraki slayt"
                    >
                        <ChevronRightIcon className="w-6 h-6 text-white" />
                    </button>

                    {/* Play/Pause Button (hidden on mobile) */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="hidden sm:block absolute bottom-20 right-4 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label={isPlaying ? 'Otomatik geçişi durdur' : 'Otomatik geçişi başlat'}
                    >
                        {isPlaying ? (
                            <PauseIcon className="w-5 h-5 text-white" />
                        ) : (
                            <PlayIcon className="w-5 h-5 text-white" />
                        )}
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                        {sliderItems.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${index === currentSlideIndex
                                    ? 'bg-white transform scale-125'
                                    : 'bg-white/50 hover:bg-white/75'
                                    }`}
                                aria-label={`Slayt ${index + 1}'e git`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Content */}
            <div className="section-hero relative z-10">
                <div className="container-content text-center text-white px-4 pb-24 sm:pb-0">
                    {/* Title */}
                    <h1 className={`${currentSlide.title.length > 30 ? 'hero-title-compact' :
                        currentSlide.title.length > 20 ? 'hero-title-responsive' :
                            'hero-title'
                        } text-gradient-hero mb-6 animate-slide-in-left max-w-6xl mx-auto leading-tight break-words`} style={{ animationDelay: '0.4s' }}>
                        {currentSlide.title}
                    </h1>

                    {/* Subtitle */}
                    {currentSlide.subtitle && (
                        <p className="text-2xl sm:text-3xl font-semibold text-brand-primary-200 mb-8 animate-slide-in-right px-2" style={{ animationDelay: '0.6s' }}>
                            {currentSlide.subtitle}
                        </p>
                    )}

                    {/* Description */}
                    <p className="text-lg sm:text-xl leading-relaxed text-slate-200/90 max-w-3xl sm:max-w-4xl mx-auto mb-12 animate-fade-in px-2" style={{ animationDelay: '0.8s' }}>
                        {currentSlide.description}
                    </p>

                    {/* CTAs */}
                    <nav className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in" style={{ animationDelay: '1s' }} aria-label="Hero eylem navigasyonu">
                        <Link href={currentSlide.buttonLink || '/portfolio'} className="btn-primary w-full sm:w-auto">
                            <RocketLaunchIcon className="w-5 h-5 mr-2" />
                            {currentSlide.buttonText}
                            <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </Link>
                        <Link href="/contact" className="btn-secondary w-full sm:w-auto">
                            İletişime Geçin
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
