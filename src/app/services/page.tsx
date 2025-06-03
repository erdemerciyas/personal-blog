'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CubeTransparentIcon, WrenchScrewdriverIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Default fallback services
const defaultServices = [
  {
    title: '3D Tarama & Modelleme',
    icon: CubeTransparentIcon,
    description: 'Yüksek hassasiyetli 3D tarama teknolojileri ile fiziksel objelerinizin veya ortamlarınızın birebir dijital kopyalarını oluşturuyoruz. Bu veriler, kalite kontrol, analiz ve tasarım süreçlerinizde temel oluşturur.',
    features: [
      'Endüstriyel parça ve montaj tarama',
      'Mimari ve kültürel miras taraması',
      'Kalite kontrol ve boyutsal analiz raporlaması',
      'Nokta bulutu ve mesh veri işleme',
      'CAD model karşılaştırma ve sapma analizi',
    ],
    image: 'https://images.unsplash.com/photo-1581093450029-9dda7351f304?w=800&h=600&fit=crop&crop=center',
  },
  {
    title: 'Tersine Mühendislik',
    icon: WrenchScrewdriverIcon,
    description: 'Mevcut bir ürünün veya parçanın 3D tarama verilerinden yola çıkarak tasarım bilgilerini yeniden elde ediyoruz. Bu sayede yedek parça üretimi, ürün geliştirme veya rakip analizi gibi ihtiyaçlarınıza çözüm sunuyoruz.',
    features: [
      'Taranmış veriden parametrik CAD model oluşturma',
      'Teknik resim ve imalat dökümantasyonu hazırlama',
      'Malzeme analizi ve seçimi danışmanlığı',
      'Yüzey ve katı modelleme teknikleri',
      'Hasarlı veya üretimi durmuş parçaların yeniden üretimi',
    ],
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf0920?w=800&h=600&fit=crop&crop=center',
  },
  {
    title: '3D Baskı & Hızlı Prototipleme',
    icon: SparklesIcon,
    description: 'Fikirlerinizi ve tasarımlarınızı, çeşitli malzeme seçenekleri ve son teknoloji 3D baskı yöntemleriyle hızlıca elle tutulur prototiplere veya son kullanıma hazır parçalara dönüştürüyoruz.',
    features: [
      'FDM, SLA, SLS gibi farklı baskı teknolojileri',
      'Fonksiyonel prototip üretimi ve testleri',
      'Düşük adetli özel parça imalatı',
      'Geniş malzeme yelpazesi (PLA, ABS, Reçine, Naylon vb.)',
      'Tasarım optimizasyonu ve baskı öncesi hazırlık',
    ],
    image: 'https://images.unsplash.com/photo-1600717535275-0b319a00a8e3?w=800&h=600&fit=crop&crop=center',
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch services from admin panel
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const data = await response.json();
          
          // Convert API services to component format
          const formattedServices = data.map((service: any, index: number) => ({
            title: service.title,
            icon: index % 3 === 0 ? CubeTransparentIcon : index % 3 === 1 ? WrenchScrewdriverIcon : SparklesIcon, // Rotate icons
            description: service.description,
            features: service.features && service.features.length > 0 ? service.features : [
              'Profesyonel hizmet sunumu',
              'Deneyimli uzman kadro',
              'Modern teknoloji kullanımı',
              'Kaliteli malzeme seçimi',
              'Zamanlı teslimat garantisi',
            ], // Use API features or default fallback
            image: service.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
          }));
          setServices(formattedServices);
        } else {
          throw new Error('API hatası');
        }
      } catch (error) {
        console.error('Servisler yüklenirken hata:', error);
        // Use default services as fallback
        setServices(defaultServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white pt-32 pb-32 md:pt-40 md:pb-40 rounded-b-3xl shadow-xl relative">
        {/* Beautiful spacing for nav overlay */}
        <div className="absolute top-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 tracking-tight leading-tight">
            Sunduğumuz Hizmetler
          </h1>
          <p className="text-lg sm:text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">
            Modern teknoloji ve uzman kadromuzla, projelerinizi hayata geçirmek ve işletmenizi bir adım öne taşımak için kapsamlı mühendislik çözümleri sunuyoruz.
          </p>
        </div>
      </section>

      {/* Services Details Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20 md:mb-32">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
              Detaylı Hizmet Açıklamaları
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Her bir hizmetimizin detaylarını inceleyin ve ihtiyaçlarınıza en uygun çözümü keşfedin.
            </p>
          </div>

          {/* Services Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mb-6"></div>
              <p className="text-slate-500 text-xl">Hizmetler yükleniyor...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <WrenchScrewdriverIcon className="w-20 h-20 text-slate-300 mb-6" />
              <p className="text-slate-500 text-xl">Henüz hizmet eklenmemiş</p>
            </div>
          ) : (
            <div className="space-y-32 md:space-y-40">
              {services.map((service, index) => (
                <div
                  key={service.title + index}
                  className={`flex flex-col items-center gap-12 md:gap-16 lg:gap-20 ${ 
                    index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row' 
                  }`}
                >
                  {/* Image Section */}
                  <div className="w-full md:w-5/12 lg:w-1/2 flex-shrink-0">
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105 group">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="w-full md:w-7/12 lg:w-1/2 space-y-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="p-4 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl shadow-lg">
                        <service.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                          {service.title}
                        </h2>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-lg leading-relaxed mb-8">
                      {service.description}
                    </p>
                    
                    <div className="bg-slate-50 rounded-2xl p-8 shadow-lg border border-slate-100">
                      <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        <CheckCircleIcon className="w-6 h-6 text-teal-500 mr-3" />
                        Öne Çıkan Özellikler
                      </h4>
                      <ul className="space-y-4">
                        {service.features.map((feature: string, featureIndex: number) => (
                          <li
                            key={feature + featureIndex}
                            className="flex items-start text-slate-600 group hover:text-slate-800 transition-colors duration-200"
                            style={{ animationDelay: `${featureIndex * 100}ms` }}
                          >
                            <div className="w-2 h-2 bg-teal-500 rounded-full mr-4 mt-3 flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                            <span className="text-base leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl shadow-inner mx-4 sm:mx-6 lg:mx-8 mb-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-8 leading-tight">
            Projeniz İçin Çözüm Üretelim
          </h2>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            İhtiyaçlarınızı analiz edelim ve size en uygun mühendislik çözümlerini sunalım. 
            Fikirlerinizi gerçeğe dönüştürmek için buradayız!
          </p>
          <Link href="/contact" className="btn-primary px-12 py-5 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            Ücretsiz Teklif Alın
          </Link>
        </div>
      </section>
    </div>
  );
} 