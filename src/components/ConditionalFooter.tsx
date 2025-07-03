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
            companyName: 'Erdem Erciyas',
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

  const activeSocialLinks = Object.entries(settings.socialLinks).filter(([_, url]) => url.trim() !== '');

  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-32 h-32 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-white rotate-45"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-white rounded-full"></div>
      </div>

      <div className="container-main section-sm relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">Hakkımızda</h3>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg">
              {settings.mainDescription}
            </p>
          </div>
          
          {/* Quick Links */}
          {settings.visibility.showQuickLinks && settings.quickLinks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Hızlı Bağlantılar</h3>
              <ul className="space-y-3">
                {settings.quickLinks.map((link, index) => (
                  <li key={index}>
                    {link.isExternal ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-teal-400 transition-colors duration-200 text-base"
                      >
                        {link.title}
                      </a>
                    ) : (
                      <Link
                        href={link.url}
                        className="text-slate-400 hover:text-teal-400 transition-colors duration-200 text-base"
                      >
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Contact Info */}
          {settings.visibility.showContactInfo && (
            <div>
              <h3 className="text-lg font-semibold mb-6">İletişim</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-teal-400" />
                  <a 
                    href={`mailto:${settings.contactInfo.email}`} 
                    className="text-slate-400 hover:text-teal-400 transition-colors duration-200 text-base"
                  >
                    {settings.contactInfo.email}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-teal-400" />
                  <a 
                    href={`tel:${settings.contactInfo.phone.replace(/\s/g, '')}`} 
                    className="text-slate-400 hover:text-teal-400 transition-colors duration-200 text-base"
                  >
                    {settings.contactInfo.phone}
                  </a>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 text-teal-400 mt-1" />
                  <span className="text-slate-400 text-base">
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
                    className="text-teal-400 hover:text-teal-300 transition-colors duration-200 font-medium"
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