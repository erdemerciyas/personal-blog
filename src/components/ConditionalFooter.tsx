'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Version from './Version';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Logo from './Logo';

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

const ConditionalFooter: React.FC = () => {
  const pathname = usePathname();
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await fetch('/api/footer-settings');
        if (response.ok) {
          const data = await response.json();
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
          ],
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

  if (isAdminPage || loading || !settings) {
    return null;
  }

  // active social links (kept for potential future use)
  const activeSocialLinks = Object.entries(settings.socialLinks).filter(([, url]) => url.trim() !== '');

  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-32 h-32 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-white rotate-45"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-white rounded-full"></div>
      </div>

      <div className="container-main section-sm relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* About Section */}
          <div>
            <div className="mb-6">
              <Logo isDark={false} width={56} height={56} className="mb-6" />
            </div>
            <p className="text-slate-300 leading-relaxed text-lg mb-4">
              {settings.mainDescription}
            </p>
            <p className="text-slate-400 text-sm">
              Modern mühendislik çözümleri ile projelerinizi hayata geçiriyoruz.
            </p>
          </div>

          {/* Quick Links */}
          {settings.visibility.showQuickLinks && settings.quickLinks.length > 0 && (
            <nav aria-label="Footer navigation">
              <h3 className="text-xl font-bold mb-6 text-white border-b border-slate-700 pb-3">Hızlı Bağlantılar</h3>
              <ul className="space-y-4">
                {settings.quickLinks.map((link, index) => (
                  <li key={index}>
                    {link.isExternal ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 rounded-md px-2 py-1 inline-flex items-center group"
                      >
                        <span className="w-2 h-2 bg-brand-primary-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                        {link.title}
                      </a>
                    ) : (
                      <Link
                        href={link.url}
                        className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 rounded-md px-2 py-1 inline-flex items-center group"
                      >
                        <span className="w-2 h-2 bg-brand-primary-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
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
            <div>
              <h3 className="text-xl font-bold mb-6 text-white border-b border-slate-700 pb-3">İletişim</h3>
              <div className="space-y-5">
                <div className="flex items-center space-x-4 group">
                  <div className="w-10 h-10 bg-brand-primary-600/20 rounded-lg flex items-center justify-center group-hover:bg-brand-primary-600/30 transition-colors duration-200">
                    <EnvelopeIcon className="w-5 h-5 text-brand-primary-400" />
                  </div>
                  <a
                    href={`mailto:${settings.contactInfo.email}`}
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 rounded-md px-2 py-1"
                  >
                    {settings.contactInfo.email}
                  </a>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="w-10 h-10 bg-brand-primary-600/20 rounded-lg flex items-center justify-center group-hover:bg-brand-primary-600/30 transition-colors duration-200">
                    <PhoneIcon className="w-5 h-5 text-brand-primary-400" />
                  </div>
                  <a
                    href={`tel:${settings.contactInfo.phone.replace(/\s/g, '')}`}
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 rounded-md px-2 py-1"
                  >
                    {settings.contactInfo.phone}
                  </a>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-10 h-10 bg-brand-primary-600/20 rounded-lg flex items-center justify-center group-hover:bg-brand-primary-600/30 transition-colors duration-200 mt-1">
                    <MapPinIcon className="w-5 h-5 text-brand-primary-400" />
                  </div>
                  <span className="text-slate-300 text-base pt-2">
                    {settings.contactInfo.address}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-slate-400 text-sm">
              <p>
                © {settings.copyrightInfo.year} {settings.copyrightInfo.companyName}.
                {settings.copyrightInfo.additionalText}
              </p>
            </div>

            {/* Version & Developer Info */}
            <div className="flex items-center space-x-4">
              <Version variant="badge" />
              {settings.visibility.showDeveloperInfo && (
                <div className="flex items-center space-x-2 text-sm text-slate-400">
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
            <p className="text-slate-500 text-sm flex items-center justify-center space-x-2">
              <span>Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>in Turkey</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ConditionalFooter; 