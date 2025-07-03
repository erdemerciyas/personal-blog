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
  UserIcon,
  SparklesIcon
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
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gradient-primary p-1">
                <Image
                  src={siteSettings.logo.url}
                  alt={siteSettings.logo.alt}
                  fill
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                  sizes="48px"
                  priority
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
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
            <Link
              href="/contact"
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                isScrolled
                  ? 'bg-gradient-primary text-white shadow-lg hover:shadow-xl'
                  : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              İletişim
            </Link>
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
                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center space-x-2 py-3 px-6 bg-gradient-primary text-white rounded-xl font-semibold"
                >
                  <PhoneIcon className="w-5 h-5" />
                  <span>İletişime Geçin</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 