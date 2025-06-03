import { useState, useEffect } from 'react';

interface PageSettings {
  home: boolean;
  about: boolean;
  services: boolean;
  portfolio: boolean;
  contact: boolean;
  blog: boolean;
}

interface SiteSettings {
  security?: {
    enableSecurityQuestion: boolean;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  pageSettings?: PageSettings;
}

export const usePageAccess = (pageName: keyof PageSettings) => {
  const [isPageActive, setIsPageActive] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPageAccess = async () => {
      try {
        console.log(`🔍 Sayfa erişim kontrolü: ${pageName}`);
        
        const response = await fetch('/api/admin/site-settings');
        if (response.ok) {
          const settings: SiteSettings = await response.json();
          
          console.log('📋 Site ayarları:', settings);
          
          // Bakım modu kontrolü
          const maintenanceMode = settings?.security?.maintenanceMode ?? false;
          setIsMaintenanceMode(maintenanceMode);
          console.log(`🛠️ Bakım modu: ${maintenanceMode}`);
          
          // Sayfa aktif mi kontrolü
          const pageActive = settings?.pageSettings?.[pageName] ?? true;
          setIsPageActive(pageActive);
          console.log(`📄 ${pageName} sayfası aktif: ${pageActive}`);
        } else {
          console.error('Site ayarları getirilemedi:', response.status);
          // Hata durumunda varsayılan olarak erişime izin ver
          setIsPageActive(true);
          setIsMaintenanceMode(false);
        }
      } catch (error) {
        console.error('Sayfa erişim kontrolü hatası:', error);
        // Hata durumunda varsayılan olarak erişime izin ver
        setIsPageActive(true);
        setIsMaintenanceMode(false);
      } finally {
        setLoading(false);
      }
    };

    checkPageAccess();
  }, [pageName]);

  return {
    isPageActive,
    isMaintenanceMode,
    loading,
    // Sayfa erişilebilir mi? (aktif ve bakım modunda değil)
    canAccess: isPageActive && !isMaintenanceMode
  };
}; 