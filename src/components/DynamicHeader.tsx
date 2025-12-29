'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  FolderOpenIcon,
  FilmIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { resolveIcon, getIconForPage } from '../lib/icons';
import DynamicDesktopNav from './layout/DynamicDesktopNav';
import DynamicMobileNav from './layout/DynamicMobileNav';
import ProjectModal from './features/ProjectModal';

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

const DynamicHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<Array<{ href: string; label: string; icon: any; isExternal?: boolean }>>([]);
  const [navLoaded, setNavLoaded] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname() || '';

  // Transparent page detection
  const isTransparentPage = pathname === '/' ||
    pathname.includes('/haberler') ||
    pathname.includes('/noticias') ||
    pathname.includes('/portfolio') ||
    pathname.includes('/services') ||
    pathname.includes('/contact') ||
    pathname.includes('/videos') ||
    pathname.includes('/products');

  // Progressive scroll detection (0-100px = progressive, >100px = full)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / 100, 1); // 0 to 1
      setScrollProgress(progress);
      setIsScrolled(scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GA4 event tracking
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

  const openProjectModal = useCallback(() => {
    trackEvent('open_project_modal', { location: 'header' });
    setIsProjectModalOpen(true);
    setIsMobileMenuOpen(false);
  }, [trackEvent]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch site settings
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/settings', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
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
        setSiteSettings(null);
      }
    };

    fetchSiteSettings();
  }, []);

  // Fetch dynamic navigation
  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const timestamp = Date.now();
        const response = await fetch(`/api/admin/page-settings?t=${timestamp}&r=${Math.random()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (response.ok) {
          const pages = await response.json();

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
          setNavLinks([
            { href: '/', label: 'Anasayfa', icon: HomeIcon },
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
        setNavLinks([
          { href: '/', label: 'Anasayfa', icon: HomeIcon },
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

    const refreshInterval = setInterval(fetchNavigation, 30000);

    const handlePageSettingsChange = () => {
      fetchNavigation();
    };

    window.addEventListener('pageSettingsChanged', handlePageSettingsChange);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('pageSettingsChanged', handlePageSettingsChange);
    };
  }, []);

  // Listen for global openProjectModal event
  useEffect(() => {
    const handleOpen: EventListener = () => openProjectModal();
    window.addEventListener('openProjectModal', handleOpen);
    return () => window.removeEventListener('openProjectModal', handleOpen);
  }, [openProjectModal]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Calculate header background opacity based on scroll progress
  const bgOpacity = isTransparentPage ? scrollProgress : 1;
  const shadowOpacity = isScrolled ? 1 : 0;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[9999] focus:bg-brand-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-br-lg"
      >
        Ana içeriğe atla
      </a>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
        style={{
          backgroundColor: isTransparentPage
            ? `rgba(255, 255, 255, ${bgOpacity * 0.95})`
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          boxShadow: `0 ${4 * shadowOpacity}px ${12 * shadowOpacity}px rgba(0, 0, 0, ${0.1 * shadowOpacity})`,
          borderBottom: `1px solid rgba(226, 232, 240, ${0.4 + bgOpacity * 0.2})`
        }}
        role="banner"
      >
        {/* Accent line at bottom */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-brand-primary-600 via-brand-primary-500 to-transparent"
          style={{
            width: `${bgOpacity * 100}%`,
            opacity: isTransparentPage ? bgOpacity : 1,
            transition: 'width 0.3s ease-out'
          }}
        />

        <div className="container-main">
          <div className="flex items-center justify-between h-20 sm:h-24">
            {/* Logo - Home Link */}
            <Link
              href="/"
              className="flex items-center gap-3 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 rounded-xl transition-transform duration-200 hover:scale-105"
              aria-label="Anasayfaya git"
            >
              {siteSettings?.logo?.url && (
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-primary-600 to-brand-primary-900 p-2 shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                  <Image
                    src={siteSettings.logo.url}
                    alt={siteSettings.logo.alt}
                    fill
                    className="object-contain"
                    sizes="(min-width: 640px) 80px, 64px"
                    priority
                  />
                </div>
              )}
              <div className="hidden sm:block">
                {siteSettings?.siteName && (
                  <h1 className={`text-2xl sm:text-3xl font-black tracking-wide transition-all duration-300 bg-gradient-to-r from-brand-primary-700 to-brand-primary-900 bg-clip-text text-transparent`}>
                    {siteSettings.siteName}
                  </h1>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <DynamicDesktopNav
              navLinks={navLinks}
              pathname={pathname || ''}
              isScrolled={isScrolled}
              isTransparentPage={isTransparentPage}
              scrollProgress={scrollProgress}
              onOpenProjectModal={openProjectModal}
            />

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Mobil menüyü kapat" : "Mobil menüyü aç"}
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              className={`md:hidden p-3 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 hover:scale-110 ${isScrolled || !isTransparentPage
                  ? 'text-slate-700 hover:bg-brand-primary-100'
                  : 'text-white hover:bg-white/20 drop-shadow'
                }`}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-7 h-7 transition-transform duration-300 rotate-90" />
              ) : (
                <Bars3Icon className="w-7 h-7 transition-transform duration-300" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <DynamicMobileNav
            isOpen={isMobileMenuOpen}
            navLinks={navLinks}
            pathname={pathname || ''}
            onClose={closeMobileMenu}
            onOpenProjectModal={openProjectModal}
            navLoaded={navLoaded}
            isScrolled={isScrolled}
            isTransparentPage={isTransparentPage}
          />
        </div>

        {/* Project Request Modal */}
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
        />
      </header>
    </>
  );
};

export default DynamicHeader;
