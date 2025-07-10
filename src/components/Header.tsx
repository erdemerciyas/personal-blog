'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader } from './ui';
import { usePathname } from 'next/navigation';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon,
  WrenchScrewdriverIcon,
  FolderOpenIcon,
  PhoneIcon,
  UserIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

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
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
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

  // Project form state
  const [projectForm, setProjectForm] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    description: '',
    budget: '',
    timeline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const pathname = usePathname();

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
        // Fallback navigation
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
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openProjectModal = () => {
    setIsProjectModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setSubmitStatus('idle');
  };

  const handleProjectFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProjectFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectForm.name,
          email: projectForm.email,
          phone: projectForm.phone,
          subject: `Proje Başvurusu: ${projectForm.projectType}`,
          message: `
Proje Türü: ${projectForm.projectType}
Bütçe: ${projectForm.budget}
Zaman Planı: ${projectForm.timeline}

Proje Detayları:
${projectForm.description}

İletişim Bilgileri:
Telefon: ${projectForm.phone}
E-posta: ${projectForm.email}
          `.trim()
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setProjectForm({
          name: '',
          email: '',
          phone: '',
          projectType: '',
          description: '',
          budget: '',
          timeline: ''
        });
        setTimeout(() => {
          closeProjectModal();
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-200/50' 
        : 'bg-transparent'
    }`}>
      <div className="container-main">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            {siteSettings?.logo?.url ? (
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm p-1">
                <Image
                  src={siteSettings.logo.url}
                  alt={siteSettings.logo.alt}
                  fill
                  className="object-contain"
                  sizes="48px"
                  priority
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className={`text-xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-slate-900' : 'text-white'
              }`}>
                {siteSettings?.siteName || 'Erdem Erciyas'}
              </h1>
              {siteSettings?.slogan && (
                <p className={`text-sm transition-colors duration-300 ${
                  isScrolled ? 'text-slate-600' : 'text-white/80'
                }`}>
                  {siteSettings.slogan}
                </p>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={index}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 group flex items-center space-x-2 ${
                    isActive
                      ? isScrolled
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-white/20 text-white backdrop-blur-sm'
                      : isScrolled
                      ? 'text-slate-700 hover:bg-slate-100 hover:text-teal-600'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={openProjectModal}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                isScrolled
                  ? 'bg-gradient-primary text-white shadow-lg hover:shadow-xl'
                  : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              <span>Proje Başvurusu</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={`md:hidden p-2 rounded-xl transition-all duration-200 ${
              isScrolled
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-white hover:bg-white/10'
            }`}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-2xl border-t border-slate-200/50">
            <div className="py-4 px-6">
              {navLinks.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={index}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-teal-100 text-teal-700'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-teal-600'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <button
                  onClick={openProjectModal}
                  className="flex items-center justify-center space-x-2 py-3 px-6 bg-gradient-primary text-white rounded-xl font-semibold w-full"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span>Proje Başvurusu</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Request Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <PaperAirplaneIcon className="w-6 h-6 text-teal-600" />
                <span>Proje Başvurusu</span>
              </h2>
              <button
                onClick={closeProjectModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleProjectFormSubmit} className="p-6 space-y-6">
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-800 font-medium">Proje başvurunuz başarıyla gönderildi!</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-800">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={projectForm.name}
                    onChange={handleProjectFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={projectForm.email}
                    onChange={handleProjectFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={projectForm.phone}
                    onChange={handleProjectFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="05XX XXX XX XX"
                  />
                </div>

                <div>
                  <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
                    Proje Türü *
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={projectForm.projectType}
                    onChange={handleProjectFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seçiniz</option>
                    <option value="3d-scanning">3D Tarama</option>
                    <option value="reverse-engineering">Tersine Mühendislik</option>
                    <option value="3d-modeling">3D Modelleme</option>
                    <option value="cad-design">CAD Tasarım</option>
                    <option value="prototype">Prototip Geliştirme</option>
                    <option value="consulting">Danışmanlık</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                    Bütçe Aralığı
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={projectForm.budget}
                    onChange={handleProjectFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seçiniz</option>
                    <option value="under-5k">5.000 TL altı</option>
                    <option value="5k-15k">5.000 - 15.000 TL</option>
                    <option value="15k-50k">15.000 - 50.000 TL</option>
                    <option value="50k-plus">50.000 TL üzeri</option>
                    <option value="discuss">Görüşmeli</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                    Zaman Planı
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={projectForm.timeline}
                    onChange={handleProjectFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seçiniz</option>
                    <option value="asap">Mümkün olan en kısa sürede</option>
                    <option value="1-week">1 hafta içinde</option>
                    <option value="1-month">1 ay içinde</option>
                    <option value="3-months">3 ay içinde</option>
                    <option value="flexible">Esnek</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Proje Detayları *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={projectForm.description}
                  onChange={handleProjectFormChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  placeholder="Projenizin detaylarını, hedeflerinizi ve özel gereksinimlerinizi açıklayın..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeProjectModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <Loader size="md" color="white">
                      Gönderiliyor...
                    </Loader>
                  ) : (
                    <>
                      <EnvelopeIcon className="w-5 h-5" />
                      <span>Başvuruyu Gönder</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 