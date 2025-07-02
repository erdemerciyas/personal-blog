'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProjectGrid from '../components/ProjectGrid';
import { 
  CheckBadgeIcon, 
  WrenchScrewdriverIcon, 
  CubeTransparentIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface SliderItem {
  _id: string;
  id?: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonLink?: string;
  badge?: string;
  duration?: number;
}

interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  technologies: string[];
  category: {
    _id: string;
    name: string;
  };
}

interface ServiceItem {
  _id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  features: string[];
}

interface SliderData {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  badge: string;
  imageUrl: string;
  isActive: boolean;
  duration: number;
}

// Default fallback services
const defaultServices = [
  {
    icon: CubeTransparentIcon,
    title: '3D Tarama & Modelleme',
    description: 'Yüksek çözünürlüklü 3D tarama ile fiziksel objeleri dijital dünyaya aktarıyoruz.',
  },
  {
    icon: WrenchScrewdriverIcon,
    title: 'Tersine Mühendislik',
    description: 'Mevcut parçaları analiz ederek tasarımlarını yeniden oluşturuyor ve iyileştiriyoruz.',
  },
  {
    icon: CheckBadgeIcon,
    title: '3D Baskı & Prototipleme',
    description: 'Fikirlerinizi hızlı ve uygun maliyetli bir şekilde elle tutulur prototiplere dönüştürüyoruz.',
  },
  {
    icon: CubeTransparentIcon,
    title: 'CAD Tasarım',
    description: 'Profesyonel CAD yazılımları ile endüstriyel tasarım ve mühendislik çözümleri sunuyoruz.',
  },
  {
    icon: WrenchScrewdriverIcon,
    title: 'Kalite Kontrol',
    description: 'Üretim süreçlerinde hassas ölçüm ve kalite kontrol hizmetleri ile standartları sağlıyoruz.',
  },
  {
    icon: CheckBadgeIcon,
    title: 'Danışmanlık',
    description: 'Mühendislik projelerinizde teknik danışmanlık ve çözüm ortaklığı hizmetleri veriyoruz.',
  },
];

export default function Home() {
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [slidesLoading, setSlidesLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  
  // Service carousel states
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [isServiceAutoPlaying, setIsServiceAutoPlaying] = useState(true);

  // Default fallback slider
  const defaultSlider: SliderItem[] = [
    {
      _id: 'default-1',
      title: 'Mühendislik Çözümleri',
      subtitle: '3D Tarama & Modelleme',
      description: 'Profesyonel 3D tarama ve tersine mühendislik hizmetleri ile projelerinizi hayata geçiriyoruz.',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      buttonText: 'İletişime Geçin',
      buttonLink: '/contact',
      badge: 'Profesyonel',
      duration: 5000
    }
  ];

  // Loading timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (slidesLoading) {
        console.log('⏰ Loading timeout - Using fallback slider');
        setSlidesLoading(false);
        if (sliderItems.length === 0) {
          setSliderItems(defaultSlider);
        }
      }
    }, 8000); // 8 saniye timeout

    return () => clearTimeout(timeout);
  }, [slidesLoading, sliderItems.length]);

  // Fetch sliders from admin panel
  useEffect(() => {
    const fetchSliderItems = async () => {
      try {
        console.log('🔄 Admin panelinden sliderlar yükleniyor...');
        const response = await fetch('/api/slider');
        
        console.log('📡 API Response status:', response.status);
        
        if (response.ok) {
          const data: SliderData[] = await response.json();
          console.log('📦 API den gelen slider verisi:', data);
          
          if (Array.isArray(data) && data.length > 0) {
            // Sadece aktif sliderları filtrele
            const activeSliders = data.filter((slider: SliderData) => slider.isActive);
            console.log('✅ Aktif slider sayısı:', activeSliders.length);
            
            if (activeSliders.length > 0) {
              // API verilerini component formatına çevir
              const formattedSliders: SliderItem[] = activeSliders.map((slider: SliderData) => ({
                _id: slider._id,
                id: slider._id,
                image: slider.imageUrl,
                title: slider.title,
                subtitle: slider.subtitle,
                description: slider.description,
                buttonText: slider.buttonText || 'Daha Fazla',
                buttonLink: slider.buttonLink || '/contact',
                badge: slider.badge || 'Yenilik',
                duration: slider.duration || 5000
              }));
              
              console.log('🎯 Formatlanmış sliderlar:', formattedSliders);
              setSliderItems(formattedSliders);
              console.log('✨ Slider state güncellendi');
            } else {
              console.log('⚠️ Aktif slider bulunamadı - Using fallback');
              setSliderItems(defaultSlider);
            }
          } else {
            console.log('⚠️ Slider verisi bulunamadı - Using fallback');
            setSliderItems(defaultSlider);
          }
        } else {
          console.error('❌ API hatası:', response.status, response.statusText);
          setSliderItems(defaultSlider);
        }
      } catch (error) {
        console.error('❌ Slider yükleme hatası:', error);
        setSliderItems(defaultSlider);
      } finally {
        setSlidesLoading(false);
        console.log('✨ Slider yükleme tamamlandı');
      }
    };

    fetchSliderItems();
  }, []);

  // Fetch services from admin panel
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        const data: ServiceItem[] = await response.json();
        setServices(data.slice(0, 6)); // İlk 6 servisi göster
      } catch (error) {
        console.error('Servisler yüklenirken hata:', error);
        // Use default services as fallback
        setServices(defaultServices.map((service, index) => ({
          ...service,
          _id: `default-${index}`,
          icon: service.icon.name,
          features: []
        })));
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch portfolio items
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      try {
        const response = await fetch('/api/portfolio?limit=3');
        if (response.ok) {
          const data: PortfolioItem[] = await response.json();
          setPortfolioItems(data);
        }
      } catch (error) {
        console.error('Portfolio items fetch error:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!isPlaying || sliderItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % sliderItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, sliderItems.length]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlideIndex((prev) => (prev + 1) % sliderItems.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlideIndex((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlideIndex || sliderItems.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlideIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Service carousel functions
  const nextService = useCallback(() => {
    if (services.length <= 1) return;
    setCurrentServiceIndex((prev) => (prev + 1) % services.length);
  }, [services.length]);

  const prevService = useCallback(() => {
    if (services.length <= 1) return;
    setCurrentServiceIndex((prev) => (prev - 1 + services.length) % services.length);
  }, [services.length]);

  const goToService = useCallback((index: number) => {
    setCurrentServiceIndex(index);
  }, []);

  const handleServiceInteraction = useCallback(() => {
    setIsServiceAutoPlaying(false);
    setTimeout(() => setIsServiceAutoPlaying(true), 8000);
  }, []);

  // Service carousel auto-play
  useEffect(() => {
    if (!isServiceAutoPlaying || services.length <= 1) return;
    
    const interval = setInterval(nextService, 4000);
    return () => clearInterval(interval);
  }, [isServiceAutoPlaying, nextService, services.length]);

  // Show enhanced loading state while sliders are loading
  if (slidesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
            <div className="animate-ping absolute inset-0 rounded-full h-16 w-16 border border-teal-400 opacity-20"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-white">Sayfa Yükleniyor</p>
            <p className="text-sm text-slate-400">Admin panelinden slider verilerini getiriyoruz...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no slides available
  if (!sliderItems || sliderItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <ExclamationTriangleIcon className="w-10 h-10 text-red-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Slider Bulunamadı</h2>
            <p className="text-slate-400">Admin panelinden slider ekleyiniz.</p>
          </div>
          <Link 
            href="/admin/slider" 
            className="inline-flex items-center space-x-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Slider Ekle</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Basic Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 lg:pt-32">
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${sliderItems[currentSlideIndex]?.image})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/70"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 text-center py-20">
          <div className="mb-8">
            <span className="inline-flex items-center px-8 py-4 rounded-2xl text-lg font-bold bg-white/10 text-white border border-white/20 backdrop-blur-2xl shadow-2xl shadow-black/20">
              {sliderItems[currentSlideIndex]?.badge || 'Yenilik'}
            </span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
            <span className="block bg-gradient-to-r from-white via-teal-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              {sliderItems[currentSlideIndex]?.title}
            </span>
          </h1>
          
          <p className="text-2xl sm:text-3xl text-teal-200 font-semibold mb-8 drop-shadow-lg">
            {sliderItems[currentSlideIndex]?.subtitle || ''}
          </p>
          
          <p className="text-xl sm:text-2xl text-slate-200 mb-12 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
            {sliderItems[currentSlideIndex]?.description}
          </p>
          
          <div className="relative inline-block">
            <Link 
              href={sliderItems[currentSlideIndex]?.buttonLink || '/contact'} 
              className="group relative overflow-hidden inline-flex items-center space-x-3 px-12 py-6 bg-gradient-to-r from-teal-600 via-teal-500 to-blue-600 text-white text-xl font-bold rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
            >
              <span className="relative z-10">{sliderItems[currentSlideIndex]?.buttonText}</span>
              <ArrowRightIcon className="relative z-10 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="section-title">Sunduğumuz Hizmetler</h2>
            <p className="section-subtitle max-w-3xl mx-auto">
              Projelerinizi hayata geçirmek için kapsamlı mühendislik ve teknoloji hizmetleri sunuyoruz.
            </p>
          </div>
          
                    {servicesLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(services.length > 0 ? services : defaultServices).map((service, index) => (
                <div key={service._id || index} className="card text-center group h-full flex flex-col">
                  <div className="mb-6 group-hover:scale-105 transition-transform duration-300">
                    {service.image ? (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          sizes="320px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-full inline-block group-hover:from-teal-100 group-hover:to-blue-100 transition-all duration-300">
                        <CubeTransparentIcon className="h-12 w-12 text-teal-600 group-hover:text-teal-700 transition-colors duration-300" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-teal-700 transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-6 flex-grow" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '6rem'
                  }}>
                    {service.description}
                  </p>
                  
                  <div className="mt-auto">
                    <Link
                      href={`/contact?service=${encodeURIComponent(service.title)}`}
                      className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold group-hover:underline transition-all duration-200"
                    >
                      <span>Detaylı Bilgi</span>
                      <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Link to all services */}
          {!servicesLoading && (services.length > 0 || defaultServices.length > 0) && (
            <div className="text-center mt-12">
              <Link href="/services" className="btn-primary inline-flex items-center space-x-2 text-lg">
                <span>Tüm Hizmetlerimizi Gör</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="section-title">Öne Çıkan Projelerimiz</h2>
            <p className="section-subtitle max-w-3xl mx-auto">
              Tamamladığımız çalışmalardan bazı örnekler. Daha fazlası için portfolyo sayfamızı ziyaret edin.
            </p>
          </div>
          
          {projectsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
              <p className="text-slate-500 text-lg">Projeler yükleniyor...</p>
            </div>
          ) : (
            <>
              <ProjectGrid projects={portfolioItems.map((item) => ({
                id: item._id,
                title: item.title,
                description: item.description,
                coverImage: item.coverImage,
                category: item.category.name,
              }))} limit={3} />
              <div className="text-center mt-12">
                <Link href="/portfolio" className="btn-secondary inline-flex items-center space-x-2 text-lg">
                  <span>Tüm Projeleri Gör</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-teal-500 to-blue-600 text-white">
        <div className="container-content text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Projeniz İçin Hazırız!
          </h2>
          <p className="text-xl sm:text-2xl text-teal-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Fikirlerinizi gerçeğe dönüştürmek için bizimle iletişime geçin.
            Size özel çözümlerimizle yanınızdayız.
          </p>
          <Link href="/contact" className="inline-flex items-center space-x-2 bg-white text-teal-600 hover:bg-slate-50 px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 focus-ring">
            <span>İletişime Geçin</span>
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
} 