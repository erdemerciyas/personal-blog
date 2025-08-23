import { useEffect, useState, useCallback } from 'react';

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface PWAState {
  isSupported: boolean;
  isInstalled: boolean;
  isInstallPromptAvailable: boolean;
  isOnline: boolean;
  swRegistration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [pwaState, setPWAState] = useState<PWAState>({
    isSupported: false,
    isInstalled: false,
    isInstallPromptAvailable: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    swRegistration: null,
    updateAvailable: false
  });

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Check if PWA is supported
  const checkPWASupport = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }, []);

  // Check if PWA is installed
  const checkInstallationStatus = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    // Check if running in standalone mode
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as NavigatorWithStandalone).standalone ||
           document.referrer.includes('android-app://');
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!checkPWASupport()) {
      console.warn('PWA features not supported');
      return null;
    }

    try {
      console.log('Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service worker registered successfully');

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setPWAState(prev => ({ ...prev, updateAvailable: true }));
            }
          });
        }
      });

      setPWAState(prev => ({ ...prev, swRegistration: registration }));
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }, [checkPWASupport]);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (!installPrompt) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
        setInstallPrompt(null);
        setPWAState(prev => ({ 
          ...prev, 
          isInstallPromptAvailable: false,
          isInstalled: true 
        }));
        return true;
      } else {
        console.log('PWA installation dismissed');
        return false;
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }, [installPrompt]);

  // Update service worker
  const updateServiceWorker = useCallback(async () => {
    if (!pwaState.swRegistration) {
      console.warn('No service worker registration found');
      return false;
    }

    try {
      await pwaState.swRegistration.update();
      
      // Skip waiting and reload
      if (pwaState.swRegistration.waiting) {
        pwaState.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
      
      setPWAState(prev => ({ ...prev, updateAvailable: false }));
      return true;
    } catch (error) {
      console.error('Service worker update failed:', error);
      return false;
    }
  }, [pwaState.swRegistration]);

  // Clear cache
  const clearCache = useCallback(async () => {
    if (!pwaState.swRegistration) {
      console.warn('No service worker registration found');
      return false;
    }

    try {
      const messageChannel = new MessageChannel();
      const promise = new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success);
        };
      });

      pwaState.swRegistration.active?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );

      const success = await promise;
      console.log('Cache cleared:', success);
      return success as boolean;
    } catch (error) {
      console.error('Cache clear failed:', error);
      return false;
    }
  }, [pwaState.swRegistration]);

  // Get service worker version
  const getServiceWorkerVersion = useCallback(async () => {
    if (!pwaState.swRegistration) {
      return null;
    }

    try {
      const messageChannel = new MessageChannel();
      const promise = new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
      });

      pwaState.swRegistration.active?.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );

      return await promise;
    } catch (error) {
      console.error('Failed to get service worker version:', error);
      return null;
    }
  }, [pwaState.swRegistration]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return false;
    }
  }, []);

  // Show local notification
  const showNotification = useCallback(async (
    title: string, 
    options?: NotificationOptions
  ) => {
    if (!pwaState.swRegistration) {
      console.warn('No service worker registration found');
      return false;
    }

    if (Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.warn('Notification permission not granted');
        return false;
      }
    }

    try {
      await pwaState.swRegistration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });
      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }, [pwaState.swRegistration, requestNotificationPermission]);

  // Initialize PWA
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializePWA = async () => {
      const isSupported = checkPWASupport();
      const isInstalled = checkInstallationStatus();

      setPWAState(prev => ({
        ...prev,
        isSupported,
        isInstalled
      }));

      if (isSupported) {
        await registerServiceWorker();
      }
    };

    initializePWA();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(installEvent);
      setPWAState(prev => ({ ...prev, isInstallPromptAvailable: true }));
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setPWAState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setPWAState(prev => ({ ...prev, isOnline: false }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setPWAState(prev => ({ 
        ...prev, 
        isInstalled: true,
        isInstallPromptAvailable: false 
      }));
      setInstallPrompt(null);
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkPWASupport, checkInstallationStatus, registerServiceWorker]);

  // Listen for service worker messages
  useEffect(() => {
    if (typeof window === 'undefined' || !pwaState.swRegistration) return;

    const handleMessage = (event: MessageEvent) => {
      console.log('Message from service worker:', event.data);
      
      if (event.data.type === 'BACKGROUND_SYNC_COMPLETE') {
        console.log('Background sync completed');
        // Handle sync completion
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [pwaState.swRegistration]);

  return {
    ...pwaState,
    installPWA,
    updateServiceWorker,
    clearCache,
    getServiceWorkerVersion,
    requestNotificationPermission,
    showNotification
  };
}

// PWA install prompt component hook
export function usePWAInstallPrompt() {
  const { isInstallPromptAvailable, installPWA } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt after a delay if available
    if (isInstallPromptAvailable) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallPromptAvailable]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success || !success) { // Hide prompt regardless of outcome
      setShowPrompt(false);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
  };

  return {
    showPrompt: showPrompt && isInstallPromptAvailable,
    handleInstall,
    dismissPrompt
  };
}

export default usePWA;