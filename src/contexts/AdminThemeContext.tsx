'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * Theme type definition
 */
export type Theme = 'light' | 'dark';

/**
 * Theme preference with auto-detect option
 */
export interface ThemePreference {
  theme: Theme;
  autoDetect: boolean;
}

/**
 * Admin Theme Context value interface
 */
export interface AdminThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  autoDetect: boolean;
  setAutoDetect: (autoDetect: boolean) => void;
}

/**
 * Admin Theme Context
 */
const AdminThemeContext = createContext<AdminThemeContextValue | undefined>(undefined);

/**
 * Local storage key for theme preference
 */
const THEME_STORAGE_KEY = 'admin-theme-preference';

/**
 * Get system theme preference
 */
const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Get stored theme preference
 */
const getStoredTheme = (): ThemePreference | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading theme preference:', error);
  }
  
  return null;
};

/**
 * Store theme preference
 */
const storeTheme = (preference: ThemePreference): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
  } catch (error) {
    console.error('Error storing theme preference:', error);
  }
};

/**
 * Apply theme to document
 */
const applyTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

/**
 * Admin Theme Provider Props
 */
export interface AdminThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

/**
 * Admin Theme Provider Component
 * 
 * Provides theme management for admin panel with:
 * - Light/Dark mode support
 * - System preference detection
 * - LocalStorage persistence
 * - Cross-tab synchronization
 * - Smooth transitions
 */
export function AdminThemeProvider({ 
  children, 
  defaultTheme = 'light' 
}: AdminThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [autoDetect, setAutoDetectState] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const stored = getStoredTheme();
    
    if (stored) {
      setThemeState(stored.theme);
      setAutoDetectState(stored.autoDetect);
      applyTheme(stored.theme);
    } else {
      // First time - use system preference
      const systemTheme = getSystemTheme();
      setThemeState(systemTheme);
      setAutoDetectState(true);
      applyTheme(systemTheme);
      storeTheme({ theme: systemTheme, autoDetect: true });
    }
    
    setMounted(true);
  }, []);

  // Listen to system theme changes when auto-detect is enabled
  useEffect(() => {
    if (!autoDetect || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setThemeState(newTheme);
      applyTheme(newTheme);
      storeTheme({ theme: newTheme, autoDetect: true });
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [autoDetect]);

  // Listen to storage events for cross-tab synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        try {
          const preference: ThemePreference = JSON.parse(e.newValue);
          setThemeState(preference.theme);
          setAutoDetectState(preference.autoDetect);
          applyTheme(preference.theme);
        } catch (error) {
          console.error('Error parsing theme from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Set theme function
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setAutoDetectState(false);
    applyTheme(newTheme);
    storeTheme({ theme: newTheme, autoDetect: false });
  }, []);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Set auto-detect function
  const setAutoDetect = useCallback((enabled: boolean) => {
    setAutoDetectState(enabled);
    
    if (enabled) {
      const systemTheme = getSystemTheme();
      setThemeState(systemTheme);
      applyTheme(systemTheme);
      storeTheme({ theme: systemTheme, autoDetect: true });
    } else {
      storeTheme({ theme, autoDetect: false });
    }
  }, [theme]);

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  const value: AdminThemeContextValue = {
    theme,
    setTheme,
    toggleTheme,
    autoDetect,
    setAutoDetect,
  };

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
}

/**
 * useAdminTheme Hook
 * 
 * Custom hook to access admin theme context
 * 
 * @example
 * ```tsx
 * const { theme, toggleTheme } = useAdminTheme();
 * 
 * return (
 *   <button onClick={toggleTheme}>
 *     {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
 *   </button>
 * );
 * ```
 * 
 * @throws {Error} If used outside of AdminThemeProvider
 */
export function useAdminTheme(): AdminThemeContextValue {
  const context = useContext(AdminThemeContext);
  
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  
  return context;
}

/**
 * Export context for advanced use cases
 */
export { AdminThemeContext };
