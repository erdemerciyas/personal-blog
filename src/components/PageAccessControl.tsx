import { ReactNode } from 'react';
import { usePageAccess } from '@/hooks/usePageAccess';
import {
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface PageAccessControlProps {
  pageName: 'home' | 'about' | 'services' | 'portfolio' | 'contact' | 'blog';
  children: ReactNode;
  fallbackComponent?: ReactNode;
}

const PageAccessControl = ({ 
  pageName, 
  children, 
  fallbackComponent 
}: PageAccessControlProps) => {
  const { isPageActive, isMaintenanceMode, loading, canAccess } = usePageAccess(pageName);

  // Loading durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Sayfa yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Bakım modu aktifse
  if (isMaintenanceMode) {
    return fallbackComponent || (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-xl border border-white/20">
            <WrenchScrewdriverIcon className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Bakım Modunda</h1>
            <p className="text-yellow-100 mb-6">
              Site şu anda bakım çalışmaları nedeniyle geçici olarak kapalıdır. 
              Lütfen daha sonra tekrar ziyaret edin.
            </p>
            <div className="flex items-center justify-center space-x-2 text-yellow-300">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="text-sm">Site yöneticisi tarafından bakım modu etkinleştirildi</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sayfa pasif durumda ise
  if (!isPageActive) {
    return fallbackComponent || (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-xl border border-white/20">
            <EyeSlashIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Sayfa Kullanılamıyor</h1>
            <p className="text-gray-300 mb-6">
              Bu sayfa şu anda ziyaretçilere kapalıdır. 
              Ana sayfaya dönmek için aşağıdaki bağlantıyı kullanabilirsiniz.
            </p>
            <a 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Sayfa erişilebilir durumda ise normal içeriği göster
  return <>{children}</>;
};

export default PageAccessControl; 