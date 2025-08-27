'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
// import { Loader } from './ui'; // kaldırıldı
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
  EnvelopeIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import { useToast } from './ui/useToast';

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
  icon?: string;
  isExternal?: boolean;
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
    videos: FilmIcon,
  };
  return iconMap[pageId as keyof typeof iconMap] || HomeIcon;
};

// Resolve icon component by string name coming from API
const resolveIcon = (name?: string) => {
  const map: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    HomeIcon,
    UserIcon,
    WrenchScrewdriverIcon,
    FolderOpenIcon,
    PhoneIcon,
    SparklesIcon,
    FilmIcon,
  };
  if (!name) return undefined;
  return map[name] || undefined;
};

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<Array<{ href: string; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; isExternal?: boolean }>>([]);
  const [navLoaded, setNavLoaded] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [mounted, setMounted] = useState(false);

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
  const { show } = useToast();

  const pathname = usePathname();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GA4 güvenli çağrı yardımcıları (tipli)
  type GtagFn = (command: 'event', eventName: string, params?: Record<string, unknown>) => void;
  const getGtag = useCallback((): GtagFn | undefined => {
    if (typeof window === 'undefined') return undefined;
    const w = window as typeof window & { gtag?: GtagFn };
    return w.gtag;
  }, []);
  const trackEvent = useCallback((eventName: string, params?: Record<string, unknown>) => {
    const gtag = getGtag();
    if (gtag) gtag('event', eventName, params);
  }, [getGtag]);

  // Stable opener for Project Modal (used in effects and handlers)
  const openProjectModal = useCallback(() => {
    // GA4: Modal açılış niyeti
    trackEvent('open_project_modal', { location: 'header' });
    setIsProjectModalOpen(true);
    setIsMobileMenuOpen(false);
  }, [trackEvent]);

  // Mark as mounted for portal usage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch site settings
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        // Public endpoint: anyone can fetch basic site settings (including logo)
        const response = await fetch('/api/settings', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          // Map API response to component state shape
          setSiteSettings({
            siteName: data?.siteName || '',
            slogan: '',
            logo: {
              url: typeof data?.logo === 'string' ? data.logo : (data?.logo?.url || ''),
              alt: 'Logo',
              width: 200,
              height: 60,
            },
          });
        }
      } catch {
        // On error, keep null to avoid showing any placeholder
        setSiteSettings(null);
      }
    };

    fetchSiteSettings();
  }, []);

  // Fetch dynamic navigation from page settings with cache busting
  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        // Add cache busting parameter to force fresh data
        const timestamp = Date.now();
        const response = await fetch(`/api/admin/page-settings?t=${timestamp}&r=${Math.random()}`, {
          cache: 'no-store', // Prevent caching
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const pages = await response.json();

          // Only show pages that are explicitly active AND marked to be shown in navigation
          const navPages = pages
            .filter((page: PageSetting) => page.isActive && page.showInNavigation)
            .sort((a: PageSetting, b: PageSetting) => a.order - b.order)
            .map((page: PageSetting) => ({
              href: page.path,
              label: page.title,
              icon: resolveIcon(page.icon) || getIconForPage(page.pageId),
              isExternal: page.isExternal
            }));

          setNavLinks(navPages);
          setNavLoaded(true);
        } else {
          // Fallback to default navigation if API fails
          setNavLinks([
            { href: '/', label: 'Anasayfa', icon: HomeIcon },
            { href: '/about', label: 'Hakkımda', icon: UserIcon },
            { href: '/services', label: 'Hizmetler', icon: WrenchScrewdriverIcon },
            { href: '/portfolio', label: 'Portfolyo', icon: FolderOpenIcon },
            { href: '/videos', label: 'Videolar', icon: FilmIcon },
            { href: '/products', label: 'Ürünler', icon: FolderOpenIcon },
            { href: '/contact', label: 'İletişim', icon: PhoneIcon },
          ]);
          setNavLoaded(true);
        }
      } catch (error) {
        console.error('Navigation fetch error:', error);
        // Fallback to default navigation
        setNavLinks([
          { href: '/', label: 'Anasayfa', icon: HomeIcon },
          { href: '/about', label: 'Hakkımda', icon: UserIcon },
          { href: '/services', label: 'Hizmetler', icon: WrenchScrewdriverIcon },
          { href: '/portfolio', label: 'Portfolyo', icon: FolderOpenIcon },
          { href: '/videos', label: 'Videolar', icon: FilmIcon },
          { href: '/products', label: 'Ürünler', icon: FolderOpenIcon },
          { href: '/contact', label: 'İletişim', icon: PhoneIcon },
        ]);
        setNavLoaded(true);
      }
    };

    fetchNavigation();

    // Set up periodic refresh to catch page setting changes
    const refreshInterval = setInterval(fetchNavigation, 30000); // Refresh every 30 seconds
    
    // Listen for page settings changes from admin panel
    const handlePageSettingsChange = () => {
      fetchNavigation();
    };
    
    window.addEventListener('pageSettingsChanged', handlePageSettingsChange);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('pageSettingsChanged', handlePageSettingsChange);
    };
  }, []);

  // Listen for global openProjectModal event (from FloatingCta)
  useEffect(() => {
    const handleOpen: EventListener = () => openProjectModal();
    window.addEventListener('openProjectModal', handleOpen);
    return () => window.removeEventListener('openProjectModal', handleOpen);
  }, [openProjectModal]);

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

Proje Açıklaması: ${projectForm.description}
Ad Soyad: ${projectForm.name}
Telefon: ${projectForm.phone}
E-posta: ${projectForm.email}
          `.trim()
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        show({
          title: 'Başvurunuz alındı',
          description: 'Size en kısa sürede geri dönüş yapacağım.',
          variant: 'success',
          duration: 4000,
        });
        // GA4: Başarılı başvuru
        trackEvent('lead', {
          method: 'project_request_form',
          page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        });
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
        show({
          title: 'Gönderilemedi',
          description: 'Lütfen daha sonra tekrar deneyin.',
          variant: 'danger',
          duration: 4500,
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      show({
          title: 'Bir hata oluştu',
          description: 'Bağlantı sırasında bir sorun yaşandı.',
          variant: 'danger',
          duration: 4500,
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-md shadow border-b border-slate-200/60' 
        : 'bg-transparent'
    }`}>
      <div className="container-main">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0 -ml-2 sm:-ml-4 lg:-ml-6">
            {siteSettings?.logo?.url && (
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm p-1">
                <Image
                  src={siteSettings.logo.url}
                  alt={siteSettings.logo.alt}
                  fill
                  className="object-contain"
                  sizes="(min-width: 640px) 56px, 48px"
                  priority
                />
              </div>
            )}
            <div className="hidden sm:block">
              {siteSettings?.siteName && (
                <h1 className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
                  isScrolled ? 'text-slate-900' : 'text-white'
                }`}>
                  {siteSettings.siteName}
                </h1>
              )}
              {siteSettings?.slogan && (
                <p className={`text-sm opacity-80 transition-colors duration-300 ${
                  isScrolled ? 'text-slate-600' : 'text-white/80'
                }`}>
                  {siteSettings.slogan}
                </p>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav role="navigation" aria-label="Ana navigasyon" className="hidden md:flex items-center gap-2 flex-1 min-w-0 justify-center overflow-x-auto">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                (link.isExternal ? (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`relative overflow-hidden px-3 lg:px-4 py-2 rounded-xl font-medium transition-all duration-200 group flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 ${
                    isActive
                      ? isScrolled
                        ? 'bg-brand-primary-100 text-brand-primary-800'
                        : 'bg-white text-brand-primary-800 shadow'
                      : isScrolled
                      ? 'text-slate-700 hover:bg-slate-100 hover:text-brand-primary-700'
                      : 'text-white hover:text-white hover:bg-white/10'
                  }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute left-4 right-4 bottom-1 h-[2px] origin-left scale-x-0 transition-transform duration-300 ${
                        isScrolled
                          ? 'bg-brand-primary-700'
                          : 'bg-white/80'
                      } ${isActive ? 'scale-x-100' : 'group-hover:scale-x-100'}`}
                    />
                  </a>
                ) : (
                  <Link
                    key={index}
                    href={link.href}
                    className={`relative overflow-hidden px-3 lg:px-4 py-2 rounded-xl font-medium transition-all duration-200 group flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 ${
                      isActive
                        ? isScrolled
                          ? 'bg-brand-primary-100 text-brand-primary-800'
                          : 'bg-white text-brand-primary-800 shadow'
                        : isScrolled
                        ? 'text-slate-700 hover:bg-slate-100 hover:text-brand-primary-700'
                        : 'text-white hover:text-white hover:bg-white/10'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute left-4 right-4 bottom-1 h-[2px] origin-left scale-x-0 transition-transform duration-300 ${
                        isScrolled
                          ? 'bg-brand-primary-700'
                          : 'bg-white/80'
                      } ${isActive ? 'scale-x-100' : 'group-hover:scale-x-100'}`}
                    />
                  </Link>
                ))
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            aria-label="Mobil menüyü aç/kapat"
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
            className={`md:hidden p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 ${
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
          <nav id="mobile-menu" aria-label="Mobil navigasyon" className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-2xl border-t border-slate-200/50 max-h-[75vh] overflow-y-auto">
            <div className="py-4 px-6">
              {navLinks.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  (link.isExternal ? (
                    <a
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 py-3 px-4 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600/70 focus-visible:ring-offset-2 ${
                        isActive
                          ? 'bg-brand-primary-100 text-brand-primary-800'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-brand-primary-700'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <link.icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </a>
                  ) : (
                    <Link
                      key={index}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 py-3 px-4 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600/70 focus-visible:ring-offset-2 ${
                        isActive
                          ? 'bg-brand-primary-100 text-brand-primary-800'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-brand-primary-700'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <link.icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  ))
                );
              })}
              {navLoaded && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button
                    onClick={openProjectModal}
                    className="flex items-center justify-center space-x-2 py-3 px-6 bg-gradient-primary text-white rounded-xl font-semibold w-full"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                    <span>Proje Başvurusu</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Project Request Modal via Portal */}
      {mounted && isProjectModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <PaperAirplaneIcon className="w-6 h-6 text-brand-primary-700" />
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
                <div className="bg-brand-primary-50 border border-brand-primary-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-brand-primary-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-brand-primary-800 font-medium">Proje başvurunuz başarıyla gönderildi!</p>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent transition-all"
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
                <label htmlFor="description" className="block text sm font-medium text-gray-700 mb-2">
                  Proje Detayları *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={projectForm.description}
                  onChange={handleProjectFormChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent transition-all resize-none"
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
                    <span>Gönderiliyor...</span>
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
        </div>, document.body)
      }
    </header>
  );
};

export default Header; 
