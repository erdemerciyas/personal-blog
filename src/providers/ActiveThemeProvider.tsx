'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { IThemeConfig } from '../models/Theme';

interface ActiveThemeContextType {
  theme: IThemeConfig | null;
  loading: boolean;
  refreshTheme: () => Promise<void>;
}

const ActiveThemeContext = createContext<ActiveThemeContextType | undefined>(undefined);

// Helper function to generate color variations
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 52, b: 80 };
}

function generateColorScale(baseColor: string) {
  const { r, g, b } = hexToRgb(baseColor);

  return {
    50: `rgba(${r}, ${g}, ${b}, 0.05)`,
    100: `rgba(${r}, ${g}, ${b}, 0.1)`,
    200: `rgba(${r}, ${g}, ${b}, 0.2)`,
    300: `rgba(${r}, ${g}, ${b}, 0.3)`,
    400: `rgba(${r}, ${g}, ${b}, 0.4)`,
    500: `rgba(${r}, ${g}, ${b}, 0.5)`,
    600: `rgba(${r}, ${g}, ${b}, 0.6)`,
    700: `rgba(${r}, ${g}, ${b}, 0.7)`,
    800: `rgba(${r}, ${g}, ${b}, 0.8)`,
  };
}

// Default theme configuration
const defaultTheme: IThemeConfig = {
  colors: {
    primary: '#003450',
    secondary: '#3A506B',
    accent: '#003450',
    background: '#F8F9FA',
    text: '#3D3D3D',
    textLight: '#6B7280',
    white: '#FFFFFF',
    black: '#000000',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  typography: {
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      button: 'Inter',
      nav: 'Inter',
    },
    sizes: {
      h1: '3rem',
      h2: '2.5rem',
      h3: '2rem',
      h4: '1.5rem',
      h5: '1.25rem',
      h6: '1rem',
      body: '1rem',
      small: '0.875rem',
      tiny: '0.75rem',
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
      loose: '2',
    },
  },
  hero: {
    enabled: true,
    height: '80vh',
    minHeight: '600px',
    backgroundColor: 'linear-gradient(135deg, #003450 0%, #3A506B 100%)',
    backgroundImage: '',
    overlay: {
      enabled: true,
      color: '#000000',
      opacity: 0.4,
    },
    title: {
      text: 'Welcome to Fixral',
      color: '#FFFFFF',
      fontSize: '3.5rem',
      fontWeight: '700',
      lineHeight: '1.2',
      marginBottom: '1.5rem',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    subtitle: {
      text: 'Innovative solutions for your business',
      color: '#F3F4F6',
      fontSize: '1.25rem',
      fontWeight: '400',
      lineHeight: '1.6',
      marginBottom: '2rem',
    },
    buttons: {
      primary: {
        text: 'Get Started',
        backgroundColor: '#FFFFFF',
        textColor: '#003450',
        fontSize: '1rem',
        fontWeight: '600',
        padding: '0.75rem 2rem',
        borderRadius: '0.5rem',
        hoverBackgroundColor: '#F3F4F6',
        hoverTextColor: '#003450',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      },
      secondary: {
        text: 'Learn More',
        backgroundColor: 'transparent',
        textColor: '#FFFFFF',
        fontSize: '1rem',
        fontWeight: '600',
        padding: '0.75rem 2rem',
        borderRadius: '0.5rem',
        borderColor: '#FFFFFF',
        borderWidth: '2px',
        hoverBackgroundColor: 'rgba(255,255,255,0.1)',
        hoverTextColor: '#FFFFFF',
      },
    },
    alignment: 'center',
    animation: {
      enabled: true,
      type: 'fade-up',
      duration: '0.8s',
    },
  },
  buttons: {
    primary: {
      backgroundColor: '#003450',
      textColor: '#FFFFFF',
      fontSize: '1rem',
      fontWeight: '600',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      hoverBackgroundColor: '#002538',
      hoverTextColor: '#FFFFFF',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
    },
    secondary: {
      backgroundColor: 'transparent',
      textColor: '#003450',
      fontSize: '1rem',
      fontWeight: '600',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      borderColor: '#003450',
      borderWidth: '2px',
      hoverBackgroundColor: '#003450',
      hoverTextColor: '#FFFFFF',
      transition: 'all 0.3s ease',
    },
    tertiary: {
      backgroundColor: '#3A506B',
      textColor: '#FFFFFF',
      fontSize: '0.875rem',
      fontWeight: '500',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      hoverBackgroundColor: '#2D3F52',
      hoverTextColor: '#FFFFFF',
      transition: 'all 0.3s ease',
    },
  },
  cards: {
    backgroundColor: '#FFFFFF',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    hoverShadow: '0 10px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    title: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#003450',
      marginBottom: '0.75rem',
    },
    description: {
      fontSize: '0.875rem',
      color: '#6B7280',
      lineHeight: '1.6',
    },
  },
  navigation: {
    backgroundColor: '#FFFFFF',
    textColor: '#003450',
    hoverColor: '#3A506B',
    activeColor: '#003450',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '1rem 1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    sticky: true,
    height: '70px',
    logo: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#003450',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
  },
  forms: {
    input: {
      backgroundColor: '#FFFFFF',
      borderColor: '#D1D5DB',
      borderWidth: '1px',
      borderRadius: '0.375rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      color: '#3D3D3D',
      focusBorderColor: '#003450',
      focusRingColor: 'rgba(0,52,80,0.2)',
      placeholderColor: '#9CA3AF',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#3D3D3D',
      marginBottom: '0.5rem',
    },
    button: {
      backgroundColor: '#003450',
      textColor: '#FFFFFF',
      fontSize: '1rem',
      fontWeight: '600',
      padding: '0.75rem 2rem',
      borderRadius: '0.5rem',
      hoverBackgroundColor: '#002538',
      transition: 'all 0.3s ease',
    },
  },
  layout: {
    maxWidth: 1280,
    sidebar: false,
    headerStyle: 'fixed',
    footerStyle: 'simple',
    containerPadding: '1.5rem',
    sectionPadding: '5rem 0',
  },
  footer: {
    backgroundColor: '#0f1b26',
    textColor: '#94a3b8',
    headingColor: '#FFFFFF',
    linkColor: '#cbd5e1',
    linkHoverColor: '#FFFFFF',
    accentColor: '#3B82F6',
    borderColor: 'rgba(255,255,255,0.1)',
    bottomBackgroundColor: 'transparent',
    bottomTextColor: '#94a3b8',
  },
  features: {
    heroSlider: true,
    portfolioGrid: true,
    blogList: true,
    contactForm: true,
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
};

export function ActiveThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<IThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveTheme = async () => {
    try {
      const response = await fetch('/api/themes/active', { cache: 'no-store' });
      const data = await response.json();

      if (data.success && data.data?.config) {
        setTheme(data.data.config);
      } else {
        // Fallback to default theme
        setTheme(defaultTheme);
      }
    } catch (error) {
      console.error('Error fetching active theme:', error);
      // Fallback to default theme
      setTheme(defaultTheme);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  useEffect(() => {
    if (theme) {
      const root = document.documentElement;
      const colorScale = generateColorScale(theme.colors.primary);

      // Apply color palette
      root.style.setProperty('--theme-primary', theme.colors.primary);
      root.style.setProperty('--theme-secondary', theme.colors.secondary);
      root.style.setProperty('--theme-accent', theme.colors.accent);
      root.style.setProperty('--theme-background', theme.colors.background);
      root.style.setProperty('--theme-text', theme.colors.text);
      root.style.setProperty('--theme-text-light', theme.colors.textLight || '#6B7280');
      root.style.setProperty('--theme-white', theme.colors.white || '#FFFFFF');
      root.style.setProperty('--theme-black', theme.colors.black || '#000000');
      root.style.setProperty('--theme-success', theme.colors.success || '#10B981');
      root.style.setProperty('--theme-warning', theme.colors.warning || '#F59E0B');
      root.style.setProperty('--theme-error', theme.colors.error || '#EF4444');
      root.style.setProperty('--theme-info', theme.colors.info || '#3B82F6');

      // Update brand-primary color scale
      root.style.setProperty('--brand-primary-50', colorScale[50]);
      root.style.setProperty('--brand-primary-100', colorScale[100]);
      root.style.setProperty('--brand-primary-200', colorScale[200]);
      root.style.setProperty('--brand-primary-300', colorScale[300]);
      root.style.setProperty('--brand-primary-400', colorScale[400]);
      root.style.setProperty('--brand-primary-500', colorScale[500]);
      root.style.setProperty('--brand-primary-600', colorScale[600]);
      root.style.setProperty('--brand-primary-700', colorScale[700]);
      root.style.setProperty('--brand-primary-800', colorScale[800]);

      // Apply typography
      if (theme.typography?.fonts) {
        root.style.setProperty('--font-heading', theme.typography.fonts.heading);
        root.style.setProperty('--font-body', theme.typography.fonts.body);
        root.style.setProperty('--font-button', theme.typography.fonts.button || theme.typography.fonts.body);
        root.style.setProperty('--font-nav', theme.typography.fonts.nav || theme.typography.fonts.body);
      }

      if (theme.typography?.sizes) {
        root.style.setProperty('--text-h1', theme.typography.sizes.h1 || '3rem');
        root.style.setProperty('--text-h2', theme.typography.sizes.h2 || '2.5rem');
        root.style.setProperty('--text-h3', theme.typography.sizes.h3 || '2rem');
        root.style.setProperty('--text-h4', theme.typography.sizes.h4 || '1.5rem');
        root.style.setProperty('--text-h5', theme.typography.sizes.h5 || '1.25rem');
        root.style.setProperty('--text-h6', theme.typography.sizes.h6 || '1rem');
        root.style.setProperty('--text-body', theme.typography.sizes.body || '1rem');
        root.style.setProperty('--text-small', theme.typography.sizes.small || '0.875rem');
        root.style.setProperty('--text-tiny', theme.typography.sizes.tiny || '0.75rem');
      }

      if (theme.typography?.weights) {
        root.style.setProperty('--font-light', theme.typography.weights.light || '300');
        root.style.setProperty('--font-normal', theme.typography.weights.normal || '400');
        root.style.setProperty('--font-medium', theme.typography.weights.medium || '500');
        root.style.setProperty('--font-semibold', theme.typography.weights.semibold || '600');
        root.style.setProperty('--font-bold', theme.typography.weights.bold || '700');
        root.style.setProperty('--font-extrabold', theme.typography.weights.extrabold || '800');
      }

      if (theme.typography?.lineHeights) {
        root.style.setProperty('--leading-tight', theme.typography.lineHeights.tight || '1.25');
        root.style.setProperty('--leading-normal', theme.typography.lineHeights.normal || '1.5');
        root.style.setProperty('--leading-relaxed', theme.typography.lineHeights.relaxed || '1.75');
        root.style.setProperty('--leading-loose', theme.typography.lineHeights.loose || '2');
      }

      // Apply hero section styles
      if (theme.hero) {
        root.style.setProperty('--hero-enabled', theme.hero.enabled ? '1' : '0');
        root.style.setProperty('--hero-height', theme.hero.height || '80vh');
        root.style.setProperty('--hero-min-height', theme.hero.minHeight || '600px');
        root.style.setProperty('--hero-background', theme.hero.backgroundColor || 'linear-gradient(135deg, #003450 0%, #3A506B 100%)');
        root.style.setProperty('--hero-background-image', theme.hero.backgroundImage || '');
        root.style.setProperty('--hero-overlay-enabled', theme.hero.overlay?.enabled ? '1' : '0');
        root.style.setProperty('--hero-overlay-color', theme.hero.overlay?.color || '#000000');
        root.style.setProperty('--hero-overlay-opacity', String(theme.hero.overlay?.opacity || 0.4));

        if (theme.hero.title) {
          root.style.setProperty('--hero-title-text', theme.hero.title.text || 'Welcome to Fixral');
          root.style.setProperty('--hero-title-color', theme.hero.title.color || '#FFFFFF');
          root.style.setProperty('--hero-title-font-size', theme.hero.title.fontSize || '3.5rem');
          root.style.setProperty('--hero-title-font-weight', theme.hero.title.fontWeight || '700');
          root.style.setProperty('--hero-title-line-height', theme.hero.title.lineHeight || '1.2');
          root.style.setProperty('--hero-title-margin-bottom', theme.hero.title.marginBottom || '1.5rem');
          root.style.setProperty('--hero-title-text-shadow', theme.hero.title.textShadow || '0 2px 4px rgba(0,0,0,0.3)');
        }

        if (theme.hero.subtitle) {
          root.style.setProperty('--hero-subtitle-text', theme.hero.subtitle.text || 'Innovative solutions for your business');
          root.style.setProperty('--hero-subtitle-color', theme.hero.subtitle.color || '#F3F4F6');
          root.style.setProperty('--hero-subtitle-font-size', theme.hero.subtitle.fontSize || '1.25rem');
          root.style.setProperty('--hero-subtitle-font-weight', theme.hero.subtitle.fontWeight || '400');
          root.style.setProperty('--hero-subtitle-line-height', theme.hero.subtitle.lineHeight || '1.6');
          root.style.setProperty('--hero-subtitle-margin-bottom', theme.hero.subtitle.marginBottom || '2rem');
        }

        if (theme.hero.buttons?.primary) {
          root.style.setProperty('--hero-button-primary-text', theme.hero.buttons.primary.text || 'Get Started');
          root.style.setProperty('--hero-button-primary-bg', theme.hero.buttons.primary.backgroundColor || '#FFFFFF');
          root.style.setProperty('--hero-button-primary-color', theme.hero.buttons.primary.textColor || '#003450');
          root.style.setProperty('--hero-button-primary-font-size', theme.hero.buttons.primary.fontSize || '1rem');
          root.style.setProperty('--hero-button-primary-font-weight', theme.hero.buttons.primary.fontWeight || '600');
          root.style.setProperty('--hero-button-primary-padding', theme.hero.buttons.primary.padding || '0.75rem 2rem');
          root.style.setProperty('--hero-button-primary-radius', theme.hero.buttons.primary.borderRadius || '0.5rem');
          root.style.setProperty('--hero-button-primary-hover-bg', theme.hero.buttons.primary.hoverBackgroundColor || '#F3F4F6');
          root.style.setProperty('--hero-button-primary-hover-color', theme.hero.buttons.primary.hoverTextColor || '#003450');
          root.style.setProperty('--hero-button-primary-shadow', theme.hero.buttons.primary.boxShadow || '0 4px 6px rgba(0,0,0,0.1)');
        }

        if (theme.hero.buttons?.secondary) {
          root.style.setProperty('--hero-button-secondary-text', theme.hero.buttons.secondary.text || 'Learn More');
          root.style.setProperty('--hero-button-secondary-bg', theme.hero.buttons.secondary.backgroundColor || 'transparent');
          root.style.setProperty('--hero-button-secondary-color', theme.hero.buttons.secondary.textColor || '#FFFFFF');
          root.style.setProperty('--hero-button-secondary-font-size', theme.hero.buttons.secondary.fontSize || '1rem');
          root.style.setProperty('--hero-button-secondary-font-weight', theme.hero.buttons.secondary.fontWeight || '600');
          root.style.setProperty('--hero-button-secondary-padding', theme.hero.buttons.secondary.padding || '0.75rem 2rem');
          root.style.setProperty('--hero-button-secondary-radius', theme.hero.buttons.secondary.borderRadius || '0.5rem');
          root.style.setProperty('--hero-button-secondary-border', theme.hero.buttons.secondary.borderColor || '#FFFFFF');
          root.style.setProperty('--hero-button-secondary-border-width', theme.hero.buttons.secondary.borderWidth || '2px');
          root.style.setProperty('--hero-button-secondary-hover-bg', theme.hero.buttons.secondary.hoverBackgroundColor || 'rgba(255,255,255,0.1)');
          root.style.setProperty('--hero-button-secondary-hover-color', theme.hero.buttons.secondary.hoverTextColor || '#FFFFFF');
        }

        root.style.setProperty('--hero-alignment', theme.hero.alignment || 'center');
        root.style.setProperty('--hero-animation-enabled', theme.hero.animation?.enabled ? '1' : '0');
        root.style.setProperty('--hero-animation-type', theme.hero.animation?.type || 'fade-up');
        root.style.setProperty('--hero-animation-duration', theme.hero.animation?.duration || '0.8s');
      }

      // Apply button styles
      if (theme.buttons?.primary) {
        root.style.setProperty('--btn-primary-bg', theme.buttons.primary.backgroundColor || '#003450');
        root.style.setProperty('--btn-primary-color', theme.buttons.primary.textColor || '#FFFFFF');
        root.style.setProperty('--btn-primary-font-size', theme.buttons.primary.fontSize || '1rem');
        root.style.setProperty('--btn-primary-font-weight', theme.buttons.primary.fontWeight || '600');
        root.style.setProperty('--btn-primary-padding', theme.buttons.primary.padding || '0.75rem 1.5rem');
        root.style.setProperty('--btn-primary-radius', theme.buttons.primary.borderRadius || '0.5rem');
        root.style.setProperty('--btn-primary-hover-bg', theme.buttons.primary.hoverBackgroundColor || '#002538');
        root.style.setProperty('--btn-primary-hover-color', theme.buttons.primary.hoverTextColor || '#FFFFFF');
        root.style.setProperty('--btn-primary-shadow', theme.buttons.primary.boxShadow || '0 2px 4px rgba(0,0,0,0.1)');
        root.style.setProperty('--btn-primary-transition', theme.buttons.primary.transition || 'all 0.3s ease');
      }

      if (theme.buttons?.secondary) {
        root.style.setProperty('--btn-secondary-bg', theme.buttons.secondary.backgroundColor || 'transparent');
        root.style.setProperty('--btn-secondary-color', theme.buttons.secondary.textColor || '#003450');
        root.style.setProperty('--btn-secondary-font-size', theme.buttons.secondary.fontSize || '1rem');
        root.style.setProperty('--btn-secondary-font-weight', theme.buttons.secondary.fontWeight || '600');
        root.style.setProperty('--btn-secondary-padding', theme.buttons.secondary.padding || '0.75rem 1.5rem');
        root.style.setProperty('--btn-secondary-radius', theme.buttons.secondary.borderRadius || '0.5rem');
        root.style.setProperty('--btn-secondary-border', theme.buttons.secondary.borderColor || '#003450');
        root.style.setProperty('--btn-secondary-border-width', theme.buttons.secondary.borderWidth || '2px');
        root.style.setProperty('--btn-secondary-hover-bg', theme.buttons.secondary.hoverBackgroundColor || '#003450');
        root.style.setProperty('--btn-secondary-hover-color', theme.buttons.secondary.hoverTextColor || '#FFFFFF');
        root.style.setProperty('--btn-secondary-transition', theme.buttons.secondary.transition || 'all 0.3s ease');
      }

      if (theme.buttons?.tertiary) {
        root.style.setProperty('--btn-tertiary-bg', theme.buttons.tertiary.backgroundColor || '#3A506B');
        root.style.setProperty('--btn-tertiary-color', theme.buttons.tertiary.textColor || '#FFFFFF');
        root.style.setProperty('--btn-tertiary-font-size', theme.buttons.tertiary.fontSize || '0.875rem');
        root.style.setProperty('--btn-tertiary-font-weight', theme.buttons.tertiary.fontWeight || '500');
        root.style.setProperty('--btn-tertiary-padding', theme.buttons.tertiary.padding || '0.5rem 1rem');
        root.style.setProperty('--btn-tertiary-radius', theme.buttons.tertiary.borderRadius || '0.375rem');
        root.style.setProperty('--btn-tertiary-hover-bg', theme.buttons.tertiary.hoverBackgroundColor || '#2D3F52');
        root.style.setProperty('--btn-tertiary-hover-color', theme.buttons.tertiary.hoverTextColor || '#FFFFFF');
        root.style.setProperty('--btn-tertiary-transition', theme.buttons.tertiary.transition || 'all 0.3s ease');
      }

      // Apply card styles
      if (theme.cards) {
        root.style.setProperty('--card-bg', theme.cards.backgroundColor || '#FFFFFF');
        root.style.setProperty('--card-padding', theme.cards.padding || '1.5rem');
        root.style.setProperty('--card-radius', theme.cards.borderRadius || '0.75rem');
        root.style.setProperty('--card-shadow', theme.cards.boxShadow || '0 1px 3px rgba(0,0,0,0.1)');
        root.style.setProperty('--card-hover-shadow', theme.cards.hoverShadow || '0 10px 15px rgba(0,0,0,0.1)');
        root.style.setProperty('--card-transition', theme.cards.transition || 'all 0.3s ease');

        if (theme.cards.title) {
          root.style.setProperty('--card-title-font-size', theme.cards.title.fontSize || '1.25rem');
          root.style.setProperty('--card-title-font-weight', theme.cards.title.fontWeight || '600');
          root.style.setProperty('--card-title-color', theme.cards.title.color || '#003450');
          root.style.setProperty('--card-title-margin-bottom', theme.cards.title.marginBottom || '0.75rem');
        }

        if (theme.cards.description) {
          root.style.setProperty('--card-desc-font-size', theme.cards.description.fontSize || '0.875rem');
          root.style.setProperty('--card-desc-color', theme.cards.description.color || '#6B7280');
          root.style.setProperty('--card-desc-line-height', theme.cards.description.lineHeight || '1.6');
        }
      }

      // Apply navigation styles
      if (theme.navigation) {
        root.style.setProperty('--nav-bg', theme.navigation.backgroundColor || '#FFFFFF');
        root.style.setProperty('--nav-color', theme.navigation.textColor || '#003450');
        root.style.setProperty('--nav-hover-color', theme.navigation.hoverColor || '#3A506B');
        root.style.setProperty('--nav-active-color', theme.navigation.activeColor || '#003450');
        root.style.setProperty('--nav-font-size', theme.navigation.fontSize || '1rem');
        root.style.setProperty('--nav-font-weight', theme.navigation.fontWeight || '500');
        root.style.setProperty('--nav-padding', theme.navigation.padding || '1rem 1.5rem');
        root.style.setProperty('--nav-shadow', theme.navigation.boxShadow || '0 2px 4px rgba(0,0,0,0.05)');
        root.style.setProperty('--nav-height', theme.navigation.height || '70px');

        if (theme.navigation.logo) {
          root.style.setProperty('--nav-logo-font-size', theme.navigation.logo.fontSize || '1.5rem');
          root.style.setProperty('--nav-logo-font-weight', theme.navigation.logo.fontWeight || '700');
          root.style.setProperty('--nav-logo-color', theme.navigation.logo.color || '#003450');
        }
      }

      // Apply spacing
      if (theme.spacing) {
        root.style.setProperty('--spacing-xs', theme.spacing.xs || '0.25rem');
        root.style.setProperty('--spacing-sm', theme.spacing.sm || '0.5rem');
        root.style.setProperty('--spacing-md', theme.spacing.md || '1rem');
        root.style.setProperty('--spacing-lg', theme.spacing.lg || '1.5rem');
        root.style.setProperty('--spacing-xl', theme.spacing.xl || '2rem');
        root.style.setProperty('--spacing-2xl', theme.spacing['2xl'] || '3rem');
        root.style.setProperty('--spacing-3xl', theme.spacing['3xl'] || '4rem');
      }

      // Apply border radius
      if (theme.borderRadius) {
        root.style.setProperty('--radius-none', theme.borderRadius.none || '0');
        root.style.setProperty('--radius-sm', theme.borderRadius.sm || '0.125rem');
        root.style.setProperty('--radius-md', theme.borderRadius.md || '0.375rem');
        root.style.setProperty('--radius-lg', theme.borderRadius.lg || '0.5rem');
        root.style.setProperty('--radius-xl', theme.borderRadius.xl || '0.75rem');
        root.style.setProperty('--radius-2xl', theme.borderRadius['2xl'] || '1rem');
        root.style.setProperty('--radius-full', theme.borderRadius.full || '9999px');
      }

      // Apply shadows
      if (theme.shadows) {
        root.style.setProperty('--shadow-sm', theme.shadows.sm || '0 1px 2px rgba(0,0,0,0.05)');
        root.style.setProperty('--shadow-md', theme.shadows.md || '0 4px 6px rgba(0,0,0,0.1)');
        root.style.setProperty('--shadow-lg', theme.shadows.lg || '0 10px 15px rgba(0,0,0,0.1)');
        root.style.setProperty('--shadow-xl', theme.shadows.xl || '0 20px 25px rgba(0,0,0,0.15)');
      }

      // Apply form styles
      if (theme.forms?.input) {
        root.style.setProperty('--input-bg', theme.forms.input.backgroundColor || '#FFFFFF');
        root.style.setProperty('--input-border', theme.forms.input.borderColor || '#D1D5DB');
        root.style.setProperty('--input-border-width', theme.forms.input.borderWidth || '1px');
        root.style.setProperty('--input-radius', theme.forms.input.borderRadius || '0.375rem');
        root.style.setProperty('--input-padding', theme.forms.input.padding || '0.75rem 1rem');
        root.style.setProperty('--input-font-size', theme.forms.input.fontSize || '1rem');
        root.style.setProperty('--input-color', theme.forms.input.color || '#3D3D3D');
        root.style.setProperty('--input-focus-border', theme.forms.input.focusBorderColor || '#003450');
        root.style.setProperty('--input-focus-ring', theme.forms.input.focusRingColor || 'rgba(0,52,80,0.2)');
        root.style.setProperty('--input-placeholder', theme.forms.input.placeholderColor || '#9CA3AF');
      }

      if (theme.forms?.label) {
        root.style.setProperty('--label-font-size', theme.forms.label.fontSize || '0.875rem');
        root.style.setProperty('--label-font-weight', theme.forms.label.fontWeight || '500');
        root.style.setProperty('--label-color', theme.forms.label.color || '#3D3D3D');
        root.style.setProperty('--label-margin-bottom', theme.forms.label.marginBottom || '0.5rem');
      }

      if (theme.forms?.button) {
        root.style.setProperty('--form-btn-bg', theme.forms.button.backgroundColor || '#003450');
        root.style.setProperty('--form-btn-color', theme.forms.button.textColor || '#FFFFFF');
        root.style.setProperty('--form-btn-font-size', theme.forms.button.fontSize || '1rem');
        root.style.setProperty('--form-btn-font-weight', theme.forms.button.fontWeight || '600');
        root.style.setProperty('--form-btn-padding', theme.forms.button.padding || '0.75rem 2rem');
        root.style.setProperty('--form-btn-radius', theme.forms.button.borderRadius || '0.5rem');
        root.style.setProperty('--form-btn-hover-bg', theme.forms.button.hoverBackgroundColor || '#002538');
        root.style.setProperty('--form-btn-transition', theme.forms.button.transition || 'all 0.3s ease');
      }

      // Apply layout
      if (theme.layout) {
        root.style.setProperty('--layout-max-width', typeof theme.layout.maxWidth === 'number' ? `${theme.layout.maxWidth}px` : theme.layout.maxWidth);
        root.style.setProperty('--layout-container-padding', theme.layout.containerPadding || '1.5rem');
        root.style.setProperty('--layout-section-padding', theme.layout.sectionPadding || '5rem 0');
      }

      // Apply transitions
      if (theme.transitions?.duration) {
        root.style.setProperty('--transition-fast', theme.transitions.duration.fast || '150ms');
        root.style.setProperty('--transition-normal', theme.transitions.duration.normal || '300ms');
        root.style.setProperty('--transition-slow', theme.transitions.duration.slow || '500ms');
      }

      if (theme.transitions?.easing) {
        root.style.setProperty('--ease', theme.transitions.easing.ease || 'cubic-bezier(0.4, 0, 0.2, 1)');
        root.style.setProperty('--ease-in', theme.transitions.easing.easeIn || 'cubic-bezier(0.4, 0, 1, 1)');
        root.style.setProperty('--ease-out', theme.transitions.easing.easeOut || 'cubic-bezier(0, 0, 0.2, 1)');
        root.style.setProperty('--ease-in-out', theme.transitions.easing.easeInOut || 'cubic-bezier(0.4, 0, 0.2, 1)');
      }
    }
  }, [theme]);

  const refreshTheme = async () => {
    setLoading(true);
    await fetchActiveTheme();
  };

  return (
    <ActiveThemeContext.Provider value={{ theme, loading, refreshTheme }}>
      {children}
    </ActiveThemeContext.Provider>
  );
}

export function useActiveTheme() {
  const context = useContext(ActiveThemeContext);
  if (context === undefined) {
    throw new Error('useActiveTheme must be used within an ActiveThemeProvider');
  }
  return context;
}
