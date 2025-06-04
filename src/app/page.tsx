'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  icon: string;
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

  // Fetch sliders from admin panel - sadece dinamik içerik
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
        setServices(data.slice(0, 4)); // İlk 4 servisi göster
      } catch (error) {
        console.error('Servisler yüklenirken hata:', error);
        // Use default services as fallback with proper structure
        const fallbackServices: ServiceItem[] = defaultServices.map((service, index) => ({
          _id: `fallback-${index}`,
          title: service.title,
          description: service.description,
          icon: service.icon.name || 'cube',
          features: []
        }));
        setServices(fallbackServices);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch portfolio projects
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      try {
        const response = await fetch('/api/portfolio');
        const data: PortfolioItem[] = await response.json();
        console.log('🎯 API den gelen portfolio verisi:', data);
        setPortfolioItems(data.slice(0, 6)); // İlk 6 öğeyi göster
      } catch (error) {
        console.error('Portfolio projeleri yüklenirken hata:', error);
        // Gerçekçi fallback projects - admin panelinden eklenen örnek projeler
        setPortfolioItems([
          {
            _id: '675b5a123456789abcdef001',
            title: '3D Otomotiv Tarama Projesi',
            description: 'Yüksek hassasiyetli 3D tarama teknolojisi ile otomotiv parçalarının dijital kopyalarının oluşturulması ve kalite kontrol süreçlerinin geliştirilmesi.',
            coverImage: '/images/projects/automotive-scan.jpg',
            images: ['/images/projects/automotive-scan.jpg'],
            technologies: ['3D Tarama', 'CAD Modelleme', 'Kalite Kontrol'],
            category: {
              _id: 'category-3d-scan',
              name: '3D Tarama',
            },
          },
          {
            _id: '675b5a123456789abcdef002',
            title: 'Endüstriyel Kalıp Tasarımı',
            description: 'Enjeksiyon kalıpları için tersine mühendislik ve optimizasyon çalışması. Üretim verimliliğini %30 artıran yenilikçi tasarım çözümleri.',
            coverImage: '/images/projects/industrial-mold.jpg',
            images: ['/images/projects/industrial-mold.jpg'],
            technologies: ['Tersine Mühendislik', 'CAD/CAM', 'Kalıp Tasarımı'],
            category: {
              _id: 'category-reverse-eng',
              name: 'Tersine Mühendislik',
            },
          },
          {
            _id: '675b5a123456789abcdef003',
            title: 'Medikal Prototip Üretimi',
            description: 'Biyouyumlu malzemeler kullanarak özelleştirilmiş medikal cihaz prototiplerinin 3D baskı teknolojisi ile üretimi.',
            coverImage: '/images/projects/medical-prototype.jpg',
            images: ['/images/projects/medical-prototype.jpg'],
            technologies: ['3D Baskı', 'Medikal Tasarım', 'Prototipleme'],
            category: {
              _id: 'category-3d-print',
              name: '3D Baskı',
            },
          },
        ]);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []);

  // Auto-play functionality with dynamic duration
  useEffect(() => {
    if (!isPlaying || sliderItems.length === 0) return;
    
    // Use current slide's duration or default 5000ms
    const currentSlideDuration = sliderItems[currentSlideIndex]?.duration || 5000;
    
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % sliderItems.length);
    }, currentSlideDuration);
    
    return () => clearInterval(timer);
  }, [currentSlideIndex, isPlaying, sliderItems]);

  const nextSlide = () => {
    if (isTransitioning || sliderItems.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlideIndex((prev) => (prev + 1) % sliderItems.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning || sliderItems.length === 0) return;
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

  const currentSlideItem = sliderItems[currentSlideIndex];

  return (
    <div className="min-h-screen">
      {/* Premium Hero Slider */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 lg:pt-32">
        
        {/* Dynamic Background Images */}
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
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
              />
              {/* Premium Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/70"></div>
              
              {/* Animated Particles */}
              <div className="absolute inset-0">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${3 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Floating Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 text-center py-20">
          
          {/* Floating Badge */}
          <div className="mb-8 inline-block">
            <div className="relative">
              <span className="inline-flex items-center px-8 py-4 rounded-2xl text-lg font-bold bg-white/10 text-white border border-white/20 backdrop-blur-2xl shadow-2xl shadow-black/20">
                {currentSlideItem.badge || 'Yenilik'}
              </span>
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/20 via-blue-500/20 to-purple-500/20 blur-xl scale-110"></div>
            </div>
          </div>
          
          {/* Main Title with Animation */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
            <span className="block bg-gradient-to-r from-white via-teal-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              {currentSlideItem.title}
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-2xl sm:text-3xl text-teal-200 font-semibold mb-8 drop-shadow-lg">
            {currentSlideItem.subtitle || ''}
          </p>
          
          {/* Description */}
          <p className="text-xl sm:text-2xl text-slate-200 mb-12 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
            {currentSlideItem.description}
          </p>
          
          {/* Premium CTA Button */}
          <div className="relative inline-block">
            <Link 
              href={currentSlideItem.buttonLink || '/contact'} 
              className="group relative overflow-hidden inline-flex items-center space-x-3 px-12 py-6 bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 text-white text-xl font-bold rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
            >
              <span className="relative z-10">{currentSlideItem.buttonText}</span>
              <ArrowRightIcon className="relative z-10 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Link>
            
            {/* Button Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/50 via-blue-600/50 to-purple-600/50 rounded-2xl blur-2xl scale-110 opacity-50"></div>
          </div>
        </div>

        {/* Floating Navigation System */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/20 backdrop-blur-2xl rounded-3xl border border-white/20 p-6 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-center space-x-8">
              
              {/* Play/Pause Control */}
              <button
                onClick={togglePlayPause}
                className="group relative p-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl text-white transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl"
                aria-label={isPlaying ? 'Duraklat' : 'Oynat'}
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
                
                {/* Button Pulse */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl animate-pulse opacity-30"></div>
              </button>
              
              {/* Elegant Slide Indicators */}
              <div className="flex items-center space-x-4">
                {sliderItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`relative transition-all duration-500 ${
                      index === currentSlideIndex 
                        ? 'w-16 h-4 bg-gradient-to-r from-teal-400 to-blue-400 shadow-lg shadow-teal-500/50' 
                        : 'w-4 h-4 bg-white/40 hover:bg-white/60 hover:scale-125'
                    } rounded-full`}
                    aria-label={`Slayt ${index + 1}`}
                  >
                    {/* Active Indicator Glow */}
                    {index === currentSlideIndex && (
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full blur-md scale-150 opacity-50"></div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Slide Counter */}
              <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl text-white font-semibold text-sm border border-white/20">
                {String(currentSlideIndex + 1).padStart(2, '0')} / {String(sliderItems.length).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Arrow Controls */}
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className="group absolute left-8 top-1/2 transform -translate-y-1/2 z-20 p-5 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 disabled:opacity-50 shadow-2xl shadow-black/20"
          aria-label="Önceki"
        >
          <ChevronLeftIcon className="h-8 w-8 group-hover:-translate-x-1 transition-transform duration-300" />
        </button>
        
        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className="group absolute right-8 top-1/2 transform -translate-y-1/2 z-20 p-5 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 disabled:opacity-50 shadow-2xl shadow-black/20"
          aria-label="Sonraki"
        >
          <ChevronRightIcon className="h-8 w-8 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
        
        {/* Floating Info Panel */}
        <div className="absolute top-8 right-8 z-20 opacity-0 hover:opacity-100 transition-all duration-500">
          <div className="bg-black/20 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 text-white shadow-2xl shadow-black/20 max-w-xs">
            <h3 className="font-bold text-xl mb-3 text-teal-200">{currentSlideItem.title}</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              {currentSlideItem.description.slice(0, 120)}...
            </p>
            <div className="mt-4 flex items-center space-x-2 text-xs text-white/60">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
              <span>Otomatik geçiş aktif</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 right-8 z-20 opacity-60 hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-col items-center space-y-2 text-white/60">
            <span className="text-xs font-medium">Kaydır</span>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
            <ChevronRightIcon className="h-4 w-4 rotate-90 animate-bounce" />
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

          {/* Services Grid with Loading State */}
          {servicesLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
              <p className="text-slate-500 text-lg">Hizmetler yükleniyor...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <WrenchScrewdriverIcon className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">Henüz hizmet eklenmemiş</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={service.title + index} className="card text-center group hover:scale-105 transition-transform duration-300">
                  <div className="p-4 bg-teal-50 rounded-full inline-block mb-6 group-hover:bg-teal-100 transition-colors duration-300">
                    <CubeTransparentIcon className="h-10 w-10 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-body">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Link to all services */}
          {!servicesLoading && services.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/services" className="btn-outline text-lg px-8 py-4">
                Tüm Hizmetlerimizi Gör
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
          
          {/* Projects Grid with Loading State */}
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
                <Link href="/portfolio" className="btn-outline text-lg px-8 py-4">
                  Tüm Projeleri Gör
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-teal-500 to-teal-600 text-white">
        <div className="container-content text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Projeniz İçin Hazırız!
          </h2>
          <p className="text-xl sm:text-2xl text-teal-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Fikirlerinizi gerçeğe dönüştürmek için bizimle iletişime geçin.
            Size özel çözümlerimizle yanınızdayız.
          </p>
          <Link href="/contact" className="bg-white text-teal-600 hover:bg-slate-50 px-10 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 focus-ring">
            İletişime Geçin
          </Link>
        </div>
      </section>
    </div>
  );
} 