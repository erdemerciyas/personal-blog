'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon,
  WrenchScrewdriverIcon,
  FolderOpenIcon,
  PhoneIcon,
  ArrowRightIcon,
  SparklesIcon,
  CubeTransparentIcon,
  EnvelopeIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  projectType: string;
  budget: string;
  urgency: string;
}

interface SiteSettings {
  siteName: string;
  slogan: string;
  logo: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
}

interface PageSetting {
  pageId: string;
  title: string;
  path: string;
  isActive: boolean;
  showInNavigation: boolean;
  order: number;
}

// Icon mapping for dynamic navigation
const getIconForPage = (pageId: string) => {
  const iconMap = {
    home: HomeIcon,
    about: UserIcon,
    services: WrenchScrewdriverIcon,
    portfolio: FolderOpenIcon,
    contact: PhoneIcon,
  };
  return iconMap[pageId as keyof typeof iconMap] || HomeIcon;
};

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [navLinks, setNavLinks] = useState<Array<{ href: string; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }>>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>({
    siteName: '',
    slogan: '',
    logo: {
      url: '',
      alt: 'Logo',
      width: 200,
      height: 60
    }
  });
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    projectType: 'other',
    budget: 'not-specified',
    urgency: 'medium'
  });

  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch site settings
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/admin/site-settings');
        if (response.ok) {
          const data = await response.json();
          setSiteSettings(data);
        }
      } catch (error) {
        console.error('Site settings fetch error:', error);
        // Set fallback values on error
        setSiteSettings({
          siteName: '',
          slogan: '',
          logo: {
            url: '',
            alt: 'Logo',
            width: 200,
            height: 60
          }
        });
      }
    };

    fetchSiteSettings();
  }, []);

  // Fetch page settings for navigation
  useEffect(() => {
    const fetchPageSettings = async () => {
      try {
        const response = await fetch('/api/admin/page-settings');
        if (response.ok) {
          const pageSettings: PageSetting[] = await response.json();
          
          // Filter active pages that should show in navigation and sort by order
          const activeNavPages = pageSettings
            .filter(page => page.isActive && page.showInNavigation)
            .sort((a, b) => a.order - b.order)
            .map(page => ({
              href: page.path,
              label: page.title,
              icon: getIconForPage(page.pageId)
            }));
          
          setNavLinks(activeNavPages);
        }
      } catch (error) {
        console.error('Page settings fetch error:', error);
        // Fallback to default navigation if API fails
        setNavLinks([
          { href: "/", label: "Anasayfa", icon: HomeIcon },
          { href: "/about", label: "Hakkımda", icon: UserIcon },
          { href: "/services", label: "Hizmetler", icon: WrenchScrewdriverIcon },
          { href: "/portfolio", label: "Portfolyo", icon: FolderOpenIcon },
          { href: "/contact", label: "İletişim", icon: PhoneIcon },
        ]);
      }
    };

    fetchPageSettings();
  }, []);

  // Hide header on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Mesaj gönderilirken hata oluştu');
      }

      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        projectType: 'other',
        budget: 'not-specified',
        urgency: 'medium'
      });
      
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Clean Navbar */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-slate-200' 
          : isHomePage 
            ? 'bg-slate-900/70 backdrop-blur-md shadow-lg shadow-black/25' 
            : 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-slate-200'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 lg:h-20">
            
            {/* Left Section - Logo & Brand */}
            <div className="flex items-center space-x-3 group">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative w-12 h-12 lg:w-16 lg:h-16">
                  {siteSettings?.logo?.url ? (
                    <Image
                      src={siteSettings.logo.url}
                      alt={siteSettings.logo.alt}
                      fill
                      sizes="(max-width: 768px) 48px, 64px"
                      className="object-contain rounded-xl group-hover:shadow-md transition-all duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                      <CubeTransparentIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  {siteSettings?.siteName && (
                    <div className={`text-xl lg:text-2xl font-bold group-hover:text-teal-400 transition-colors duration-200 ${
                      isScrolled || !isHomePage ? 'text-slate-800' : 'text-white'
                    }`}>
                      {siteSettings.siteName}
                    </div>
                  )}
                  {siteSettings?.slogan && (
                    <div className={`text-xs lg:text-sm -mt-1 ${
                      isScrolled || !isHomePage ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      {siteSettings.slogan}
                    </div>
                  )}
                </div>
              </Link>
            </div>

            {/* Center Section - Navigation Links */}
            <div className="flex-1 flex justify-center">
              <nav className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link 
                      key={link.href}
                      href={link.href} 
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        isActive 
                          ? 'text-white bg-teal-600 shadow-md' 
                          : isScrolled || !isHomePage
                            ? 'text-slate-700 hover:text-teal-600 hover:bg-slate-100'
                            : 'text-white hover:text-teal-300 hover:bg-white/10'
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      <span className="hidden lg:block">{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Section - CTA & Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* CTA Button - Desktop */}
              <button 
                onClick={() => setShowModal(true)}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>Proje Başlat</span>
                <ArrowRightIcon className="h-3 w-3" />
              </button>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors duration-200 ${
                  isScrolled || !isHomePage
                    ? 'text-slate-700 hover:text-teal-600 hover:bg-slate-100'
                    : 'text-white hover:text-teal-300 hover:bg-white/10'
                }`}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg">
            <div className="w-full px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-white bg-teal-600' 
                        : 'text-slate-700 hover:text-teal-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile CTA */}
              <button
                onClick={() => {
                  setShowModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-semibold"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>Proje Başlat</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Project Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center">
                    <ChatBubbleLeftIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Proje Talebi</h3>
                    <p className="text-slate-600">Projenizie başlamak için bilgilerinizi paylaşın</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Success Message */}
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center space-x-3">
                  <CheckIcon className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-800">Başarılı!</p>
                    <p className="text-green-700">Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center space-x-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-800">Hata!</p>
                    <p className="text-red-700">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <UserIcon className="w-5 h-5 text-teal-600" />
                  <span>İletişim Bilgileri</span>
                </h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ad Soyad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="Adınız ve soyadınız"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      E-posta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="ornek@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="+90 555 123 45 67"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Şirket/Kurum
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="Şirket adı"
                    />
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                  <CubeTransparentIcon className="w-5 h-5 text-teal-600" />
                  <span>Proje Detayları</span>
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Konu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="Proje konusu"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Proje Türü
                      </label>
                      <select
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="3d-design">3D Tasarım</option>
                        <option value="reverse-engineering">Tersine Mühendislik</option>
                        <option value="3d-printing">3D Baskı</option>
                        <option value="cad-design">CAD Tasarım</option>
                        <option value="consulting">Danışmanlık</option>
                        <option value="other">Diğer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Bütçe Aralığı
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="under-5k">5.000 TL altı</option>
                        <option value="5k-15k">5.000 - 15.000 TL</option>
                        <option value="15k-50k">15.000 - 50.000 TL</option>
                        <option value="50k-100k">50.000 - 100.000 TL</option>
                        <option value="above-100k">100.000 TL üzeri</option>
                        <option value="not-specified">Belirtmek istemiyorum</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Öncelik
                      </label>
                      <select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="low">Düşük</option>
                        <option value="medium">Orta</option>
                        <option value="high">Yüksek</option>
                        <option value="urgent">Acil</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Proje Açıklaması <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Projenizi detaylı bir şekilde açıklayın..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                >
                  İptal
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || submitSuccess}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    isSubmitting || submitSuccess
                      ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                      : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                      <span>Gönderiliyor...</span>
                    </>
                  ) : submitSuccess ? (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span>Gönderildi</span>
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="w-5 h-5" />
                      <span>Talebi Gönder</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header; 