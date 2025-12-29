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
  PhoneIcon,
  UserIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import { resolveIcon, getIconForPage } from '../lib/icons';
import DesktopNav from './layout/DesktopNav';
import MobileNav from './layout/MobileNav';
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

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<Array<{ href: string; label: string; icon: any; isExternal?: boolean }>>([]);
  const [navLoaded, setNavLoaded] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname() || '';

  // Define pages with transparent header (Hero sections)
  // Expanded to include all pages with hero sections
  const isTransparentPage = pathname === '/' ||
    pathname.includes('/haberler') ||
    pathname.includes('/noticias') ||
    pathname.includes('/portfolio') ||
    pathname.includes('/services') ||
    pathname.includes('/contact') ||
    pathname.includes('/videos') ||
    pathname.includes('/products');

  // Scroll detection with improved threshold (100px for better UX)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
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

  // Stable opener for Project Modal
  const openProjectModal = useCallback(() => {
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
          // Fallback
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Listen for global openProjectModal event
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

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[9999] focus:bg-brand-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-br-lg"
      >
        Ana içeriğe atla
      </a>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200/40'
        : isTransparentPage
          ? 'bg-gradient-to-b from-black/20 to-transparent backdrop-blur-sm'
          : 'bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200/40'
        }`} role="banner">
        <div className="container-main">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo - Home Link */}
            <Link href="/" className="flex items-center space-x-3 group shrink-0 -ml-2 sm:-ml-4 lg:-ml-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 rounded-xl" aria-label="Anasayfaya git">
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
                  <h1 className={`text-xl font-bold tracking-tight transition-colors duration-300 ${isScrolled
                    ? 'text-slate-900'
                    : isTransparentPage
                      ? 'text-white drop-shadow-lg'
                      : 'text-slate-900'
                    }`}>
                    {siteSettings.siteName}
                  </h1>
                )}
                {siteSettings?.slogan && (
                  <p className={`text-sm opacity-90 transition-colors duration-300 ${isScrolled
                    ? 'text-slate-600'
                    : isTransparentPage
                      ? 'text-white/90 drop-shadow'
                      : 'text-slate-600'
                    }`}>
                    {siteSettings.slogan}
                  </p>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <DesktopNav
              navLinks={navLinks}
              pathname={pathname || ''}
              isScrolled={isScrolled}
              isTransparentPage={isTransparentPage}
              onOpenProjectModal={openProjectModal}
            />

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Mobil menüyü kapat" : "Mobil menüyü aç"}
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              className={`md:hidden p-2 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 ${isScrolled
                ? 'text-slate-700 hover:bg-slate-100'
                : isTransparentPage
                  ? 'text-white hover:bg-white/15 drop-shadow'
                  : 'text-slate-700 hover:bg-slate-100'
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
          <MobileNav
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
      </header >
    </>
  );
};

export default Header;
