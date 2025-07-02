'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Version from './Version';

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
  theme: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
}

const ConditionalFooter: React.FC = () => {
  const pathname = usePathname();
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Admin sayfalarında footer'ı gizle
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
        // Hata durumunda varsayılan ayarları kullan
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
          },
          theme: {
            backgroundColor: 'bg-slate-800',
            textColor: 'text-slate-300',
            accentColor: 'text-teal-400'
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
  
  // Eğer admin sayfasındaysak footer'ı render etme
  if (isAdminPage) {
    return null;
  }

  // Loading durumu
  if (loading) {
    return null;
  }

  // Ayarlar yüklenmemişse gösterme
  if (!settings) {
    return null;
  }

  // Sosyal medya linklerini filtrele (boş olmayanlar)
  const activeSocialLinks = Object.entries(settings.socialLinks).filter(([_, url]) => url.trim() !== '');

  return (
    <footer className={`${settings.theme.backgroundColor} ${settings.theme.textColor}`}>
      <div className="container-main section-padding-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Ana Açıklama */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Hakkımızda</h3>
            <p className="text-slate-400 leading-relaxed">
              {settings.mainDescription}
            </p>
          </div>
          
          {/* Hızlı Bağlantılar */}
          {settings.visibility.showQuickLinks && settings.quickLinks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Hızlı Bağlantılar</h3>
              <ul className="space-y-3">
                {settings.quickLinks.map((link, index) => (
                  <li key={index}>
                    {link.isExternal ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-slate-400 hover:${settings.theme.accentColor} transition-colors text-sm focus-ring rounded px-1 py-0.5`}
                      >
                        {link.title}
                      </a>
                    ) : (
                      <Link
                        href={link.url}
                        className={`text-slate-400 hover:${settings.theme.accentColor} transition-colors text-sm focus-ring rounded px-1 py-0.5`}
                      >
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* İletişim Bilgileri */}
          {settings.visibility.showContactInfo && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">İletişim</h3>
              <div className="space-y-2">
                <p className="text-slate-400 text-sm">
                  <a 
                    href={`mailto:${settings.contactInfo.email}`} 
                    className={`hover:${settings.theme.accentColor} transition-colors focus-ring rounded px-1 py-0.5`}
                  >
                    {settings.contactInfo.email}
                  </a>
                </p>
                <p className="text-slate-400 text-sm">
                  <a 
                    href={`tel:${settings.contactInfo.phone.replace(/\s/g, '')}`} 
                    className={`hover:${settings.theme.accentColor} transition-colors focus-ring rounded px-1 py-0.5`}
                  >
                    {settings.contactInfo.phone}
                  </a>
                </p>
                {settings.contactInfo.address && (
                  <p className="text-slate-400 text-sm">
                    {settings.contactInfo.address}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sosyal Medya Linkleri */}
        {settings.visibility.showSocialLinks && activeSocialLinks.length > 0 && (
          <div className="border-t border-slate-700 pt-6 mb-6">
            <div className="flex justify-center space-x-6">
              {activeSocialLinks.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${settings.theme.accentColor} hover:text-white transition-colors capitalize`}
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Copyright ve Geliştirici Bilgileri */}
        <div className="border-t border-slate-700 pt-8 text-center">
          <p className="text-sm text-slate-400 mb-2">
            &copy; {settings.copyrightInfo.year} {settings.copyrightInfo.companyName}. {settings.copyrightInfo.additionalText}
          </p>
          
          {/* Version Bilgisi */}
          <div className="mb-2">
            <Version variant="badge" size="sm" />
          </div>
          
          {settings.visibility.showDeveloperInfo && (
            <p className="text-xs text-slate-500">
              Geliştirici: <span className={`${settings.theme.accentColor} font-medium`}>{settings.developerInfo.name}</span>
              {settings.developerInfo.website && (
                <>
                  {' • '}
                  <a 
                    href={settings.developerInfo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${settings.theme.accentColor} hover:text-teal-300 transition-colors`}
                  >
                    {settings.developerInfo.companyName}
                  </a>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
};

export default ConditionalFooter; 