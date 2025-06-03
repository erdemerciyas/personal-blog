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
        const response = await fetch('/api/admin/site-settings');
        if (response.ok) {
          const settings: SiteSettings = await response.json();
          
          // Bakım modu kontrolü
          setIsMaintenanceMode(settings?.security?.maintenanceMode ?? false);
          
          // Sayfa aktif mi kontrolü
          const pageActive = settings?.pageSettings?.[pageName] ?? true;
          setIsPageActive(pageActive);
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