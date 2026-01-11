/**
 * Fixral Theme Configuration
 * Mevcut site temasının tema sistemine dahil edilmiş hali
 */

import { ITheme } from '../../models/Theme';

export const fixralThemeConfig: Partial<ITheme> = {
  name: 'Fixral Theme',
  slug: 'fixral',
  version: '1.0.0',
  author: 'Fixral',
  description: 'Fixral için özel tasarlanmış modern ve responsive tema',
  thumbnail: '/themes/fixral/thumbnail.png',
  isActive: false,
  config: {
    // Color Palette
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
    
    // Typography Settings
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
    
    // Hero Section Customization
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
    
    // Button Styles
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
    
    // Card Styles
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
    
    // Navigation Styles
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
    
    // Spacing System
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    
    // Border Radius
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px',
    },
    
    // Shadows
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
      xl: '0 20px 25px rgba(0,0,0,0.15)',
    },
    
    // Form Styles
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
    
    // Layout Settings
    layout: {
      maxWidth: '1280px',
      sidebar: false,
      headerStyle: 'fixed',
      footerStyle: 'simple',
      containerPadding: '1.5rem',
      sectionPadding: '5rem 0',
    },
    
    // Features Toggle
    features: {
      heroSlider: true,
      portfolioGrid: true,
      blogList: true,
      contactForm: true,
    },
    
    // Transitions & Animations
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
  },
  templates: [
    {
      id: 'home-fixral',
      name: 'Fixral Home',
      type: 'home',
      component: 'templates/HomeTemplate',
      screenshot: '/themes/fixral/screenshots/home.png',
      description: 'Fixral ana sayfa şablonu',
    },
    {
      id: 'page-fixral',
      name: 'Fixral Page',
      type: 'page',
      component: 'templates/PageTemplate',
      screenshot: '/themes/fixral/screenshots/page.png',
      description: 'Fixral standart sayfa şablonu',
    },
    {
      id: 'blog-fixral',
      name: 'Fixral Blog List',
      type: 'archive',
      component: 'templates/BlogTemplate',
      screenshot: '/themes/fixral/screenshots/blog.png',
      description: 'Fixral blog listesi şablonu',
    },
    {
      id: 'single-fixral',
      name: 'Fixral Single Post',
      type: 'single',
      component: 'templates/SingleTemplate',
      screenshot: '/themes/fixral/screenshots/single.png',
      description: 'Fixral tekil blog yazısı şablonu',
    },
    {
      id: 'portfolio-fixral',
      name: 'Fixral Portfolio Grid',
      type: 'archive',
      component: 'templates/PortfolioTemplate',
      screenshot: '/themes/fixral/screenshots/portfolio.png',
      description: 'Fixral portfolyo grid şablonu',
    },
  ],
};

export default fixralThemeConfig;
