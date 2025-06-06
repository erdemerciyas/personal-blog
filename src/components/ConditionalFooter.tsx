'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const ConditionalFooter: React.FC = () => {
  const pathname = usePathname();
  
  // Admin sayfalarında footer'ı gizle
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Eğer admin sayfasındaysak footer'ı render etme
  if (isAdminPage) {
    return null;
  }

  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="container-main section-padding-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">İletişim</h3>
            <p className="text-slate-400 leading-relaxed">
              Mühendislik ve teknoloji alanında yenilikçi çözümler sunarak projelerinizi hayata geçiriyoruz.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-slate-400 hover:text-teal-400 transition-colors text-sm focus-ring rounded px-1 py-0.5">
                  Anasayfa
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-400 hover:text-teal-400 transition-colors text-sm focus-ring rounded px-1 py-0.5">
                  Hizmetler
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-slate-400 hover:text-teal-400 transition-colors text-sm focus-ring rounded px-1 py-0.5">
                  Projeler
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-teal-400 transition-colors text-sm focus-ring rounded px-1 py-0.5">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">İletişim</h3>
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">
                <a href="mailto:info@example.com" className="hover:text-teal-400 transition-colors focus-ring rounded px-1 py-0.5">
                  info@example.com
                </a>
              </p>
              <p className="text-slate-400 text-sm">
                <a href="tel:+905001234567" className="hover:text-teal-400 transition-colors focus-ring rounded px-1 py-0.5">
                  +90 (500) 123 45 67
                </a>
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 text-center">
          <p className="text-sm text-slate-400 mb-2">
            &copy; {new Date().getFullYear()} Tüm Hakları Saklıdır.
          </p>
          <p className="text-xs text-slate-500">
            Geliştirici: <span className="text-teal-400 font-medium">Erdem Erciyas</span>
            {' • '}
            <a 
              href="https://www.erciyasengineering.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              Erciyas Engineering
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ConditionalFooter; 