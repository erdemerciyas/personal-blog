'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useActiveTheme } from '../providers/ActiveThemeProvider';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  HeartIcon
} from '@heroicons/react/24/outline'; // Removed static logo usage

const Version = dynamic(() => import('./Version'), {
  ssr: false,
  loading: () => <span aria-hidden className="inline-block h-5" />
});

interface FooterSettings {
  mainDescription: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  quickLinks: Array<{
    title: string;
    url: string;
    isExternal: boolean;
  }>;
  socialLinks: {
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
    github: string;
    youtube: string;
  };
  copyrightInfo: {
    companyName: string;
    year: number;
    additionalText: string;
  };
  developerInfo: {
    name: string;
    website: string;
    companyName: string;
  };
  visibility: {
    showQuickLinks: boolean;
    showSocialLinks: boolean;
    showContactInfo: boolean;
    showDeveloperInfo: boolean;
  };
}

interface SiteSettingsMinimal {
  siteName: string;
  logo?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
}

const ConditionalFooter: React.FC = () => {
  const pathname = usePathname();
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<SiteSettingsMinimal | null>(null);
  const { theme } = useActiveTheme();

  // Footer config from theme
  const footerConfig = theme?.footer;

  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await fetch('/api/footer-settings');
        if (response.ok) {
          const data = await response.json();
          // Sanitize links to ensure absolute paths
          if (data && data.quickLinks) {
            data.quickLinks = data.quickLinks.map((link: any) => ({
              ...link,
              url: link.isExternal || link.url.startsWith('http') || link.url.startsWith('/')
                ? link.url
                : `/${link.url}`
            }));
          }
          setSettings(data);
        }
      } catch (error) {
        console.error('Footer settings fetch error:', error);
        setSettings({
          mainDescription: 'Mühendislik ve teknoloji alanında yenilikçi çözümler sunarak projelerinizi hayata geçiriyoruz.',
          contactInfo: {
            email: 'erdem.erciyas@gmail.com',
            phone: '+90 (500) 123 45 67',
            address: 'Teknoloji Vadisi, Ankara, Türkiye'
          },
          quickLinks: [
            { title: 'Anasayfa', url: '/', isExternal: false },
            { title: 'Hizmetler', url: '/services', isExternal: false },
            { title: 'Projeler', url: '/portfolio', isExternal: false },
            { title: 'İletişim', url: '/contact', isExternal: false }
          ].map(link => ({
            ...link,
            url: link.isExternal || link.url.startsWith('/') ? link.url : `/${link.url}`
          })),
          socialLinks: {
            linkedin: '',
            twitter: '',
            instagram: '',
            facebook: '',
            github: '',
            youtube: ''
          },
          copyrightInfo: {
            companyName: 'FIXRAL',
            year: new Date().getFullYear(),
            additionalText: 'Tüm Hakları Saklıdır.'
          },
          developerInfo: {
            name: 'Erdem Erciyas',
            website: 'https://www.erdemerciyas.com.tr',
            companyName: 'Erciyas Engineering'
          },
          visibility: {
            showQuickLinks: true,
            showSocialLinks: true,
            showContactInfo: true,
            showDeveloperInfo: true
          }
        });
      } finally {
        setLoading(false);
      }
    };

    if (!isAdminPage) {
      fetchFooterSettings();
    } else {
      setLoading(false);
    }
  }, [isAdminPage]);

  // Fetch public site settings for dynamic logo and name
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setSite({
            siteName: data?.siteName || '',
            logo: {
              url: typeof data?.logo === 'string' ? data.logo : (data?.logo?.url || ''),
              alt: 'Logo',
              width: 200,
              height: 60,
            },
          });
        }
      } catch {
        setSite(null);
      }
    };

    if (!isAdminPage) fetchSiteSettings();
  }, [isAdminPage]);

  if (isAdminPage || loading || !settings) {
    return null;
  }

  // Sosyal bağlantıları aktif olanlarıyla hazırla
  const socialEntries = [
    { key: 'linkedin', label: 'LinkedIn', url: settings.socialLinks.linkedin },
    { key: 'twitter', label: 'Twitter', url: settings.socialLinks.twitter },
    { key: 'instagram', label: 'Instagram', url: settings.socialLinks.instagram },
    { key: 'facebook', label: 'Facebook', url: settings.socialLinks.facebook },
    { key: 'github', label: 'GitHub', url: settings.socialLinks.github },
    { key: 'youtube', label: 'YouTube', url: settings.socialLinks.youtube },
  ].filter(item => item.url && item.url.trim().length > 0);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  // Dynamic Styles
  const footerStyle = {
    backgroundColor: footerConfig?.backgroundColor || '#0f1b26',
    color: footerConfig?.textColor || '#94a3b8',
  };

  const headingStyle = {
    color: footerConfig?.headingColor || '#FFFFFF',
  };

  const descStyle = {
    color: footerConfig?.descriptionColor || '#cbd5e1',
  };

  const linkStyle = {
    color: footerConfig?.linkColor || '#cbd5e1',
  };

  const borderStyle = {
    borderColor: footerConfig?.borderColor || 'rgba(255,255,255,0.1)',
  };

  const accentStyle = {
    color: footerConfig?.accentColor || '#3B82F6',
  };

  const dotStyle = {
    backgroundColor: footerConfig?.accentColor || '#3B82F6',
  };

  const bottomStyle = {
    backgroundColor: footerConfig?.bottomBackgroundColor || 'transparent',
    color: footerConfig?.bottomTextColor || footerConfig?.textColor || '#94a3b8',
    borderColor: footerConfig?.borderColor || 'rgba(255,255,255,0.1)',
  };

  return (
    <footer style={footerStyle} className="relative overflow-hidden transition-colors duration-300" role="contentinfo">
      <div className="container-main section-sm relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* About Section */}
          <section aria-labelledby="footer-about">
            <div className="mb-6 flex items-center space-x-3 min-h-[56px]">
              {site?.logo?.url && (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm p-1">
                  <Image
                    src={site.logo.url}
                    alt={site.logo.alt}
                    fill
                    className="object-contain"
                    sizes="56px"
                    priority={false}
                  />
                </div>
              )}
              {site?.siteName && (
                <h2 style={headingStyle} className="text-2xl font-bold transition-colors duration-300">{site.siteName}</h2>
              )}
            </div>
            <h2 id="footer-about" className="sr-only">Hakkında</h2>
            <p style={descStyle} className="leading-relaxed text-lg mb-4 transition-colors duration-300">
              {settings.mainDescription}
            </p>
            <p style={{ color: footerConfig?.textColor || '#94a3b8' }} className="text-sm transition-colors duration-300">
              Modern mühendislik çözümleri ile projelerinizi hayata geçiriyoruz.
            </p>

            {/* Social Links */}
            {settings.visibility.showSocialLinks && socialEntries.length > 0 && (
              <nav aria-label="Sosyal medya" className="mt-6">
                <ul className="flex flex-wrap gap-3">
                  {socialEntries.map(item => (
                    <li key={item.key}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${item.label} sayfamız`}
                        className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 transition-colors duration-200"
                        style={{ color: footerConfig?.linkColor || '#cbd5e1' }}
                      >
                        <span className="sr-only">{item.label}</span>
                        <span aria-hidden className="font-medium">{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </section>

          {/* Quick Links */}
          {settings.visibility.showQuickLinks && settings.quickLinks.length > 0 && (
            <nav aria-label="Footer navigation" role="navigation">
              <h3 style={{ ...headingStyle, ...borderStyle }} className="text-xl font-bold mb-6 border-b pb-3 transition-colors duration-300">Hızlı Bağlantılar</h3>
              <ul className="space-y-4">
                {settings.quickLinks.map((link, index) => (
                  <li key={index}>
                    {link.isExternal ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:translate-x-1 transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 rounded-md px-2 py-1 inline-flex items-center group"
                        style={linkStyle}
                      >
                        <span style={dotStyle} className="w-2 h-2 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                        {link.title}
                      </a>
                    ) : (
                      <Link
                        href={link.url}
                        className="hover:translate-x-1 transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 rounded-md px-2 py-1 inline-flex items-center group"
                        style={linkStyle}
                      >
                        <span style={dotStyle} className="w-2 h-2 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Contact Info */}
          {settings.visibility.showContactInfo && (
            <section aria-labelledby="footer-contact">
              <h3 style={{ ...headingStyle, ...borderStyle }} className="text-xl font-bold mb-6 border-b pb-3 transition-colors duration-300">İletişim</h3>
              <div className="space-y-5">
                <div className="flex items-center space-x-4 group">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors duration-200">
                    <EnvelopeIcon style={accentStyle} className="w-5 h-5 transition-colors duration-200" />
                  </div>
                  <a
                    href={`mailto:${settings.contactInfo.email}`}
                    className="hover:text-white transition-colors duration-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 rounded-md px-2 py-1"
                    style={linkStyle}
                  >
                    {settings.contactInfo.email}
                  </a>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors duration-200">
                    <PhoneIcon style={accentStyle} className="w-5 h-5 transition-colors duration-200" />
                  </div>
                  <a
                    href={`tel:${settings.contactInfo.phone.replace(/\s/g, '')}`}
                    className="hover:text-white transition-colors duration-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 rounded-md px-2 py-1"
                    style={linkStyle}
                  >
                    {settings.contactInfo.phone}
                  </a>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors duration-200 mt-1">
                    <MapPinIcon style={accentStyle} className="w-5 h-5 transition-colors duration-200" />
                  </div>
                  <span className="text-base pt-2 transition-colors duration-300" style={linkStyle}>
                    {settings.contactInfo.address}
                  </span>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Bottom Section */}
        <article className="pt-8 border-t transition-colors duration-300" style={{ ...bottomStyle, borderTopColor: footerConfig?.borderColor || 'rgba(255,255,255,0.1)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm transition-colors duration-300" style={{ color: footerConfig?.bottomTextColor || footerConfig?.textColor || '#94a3b8' }}>
              <p>
                &copy; {settings.copyrightInfo.year} {settings.copyrightInfo.companyName}.
                {settings.copyrightInfo.additionalText}
              </p>
            </div>

            {/* Version & Developer Info */}
            <div className="flex items-center space-x-4">
              <Version variant="badge" />
              {settings.visibility.showDeveloperInfo && (
                <div className="flex items-center space-x-2 text-sm" style={{ color: footerConfig?.bottomTextColor || footerConfig?.textColor || '#94a3b8' }}>
                  <span>Geliştiren:</span>
                  <a
                    href={settings.developerInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary-400 hover:text-brand-primary-300 transition-colors duration-200 font-medium"
                  >
                    {settings.developerInfo.name}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Made with love */}
          <div className="mt-6 text-center">
            <p className="text-sm flex items-center justify-center space-x-2 transition-colors duration-300" style={{ color: footerConfig?.bottomTextColor || footerConfig?.textColor || '#94a3b8' }}>
              <span>Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>in Turkey</span>
            </p>
          </div>

          {/* Back to top */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl bg-brand-primary-600 text-white hover:bg-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 transition-colors duration-200"
              aria-label="Sayfa başına dön"
            >
              Yukarı Çık
            </button>
          </div>
        </article>
      </div>
    </footer>
  );
};

export default ConditionalFooter;