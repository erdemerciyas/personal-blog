/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Fixral Design System Colors - Updated to match brand primary
        fixral: {
          'night-blue': '#003450', // Updated to match brand primary
          'primary': '#003450', // Main brand color
          'light-gray': '#F8F9FA',
          'charcoal': '#3D3D3D',
          'gray-blue': '#3A506B',
          // Extended palette for better design flexibility
          'deep-blue': '#002235',
          'ocean-blue': '#0369a1',
          'sky-blue': '#7dd3fc',
          'mint': '#38bdf8',
          'slate': '#2F4F4F',
          'pearl': '#F5F5F5',
          'graphite': '#2C2C2C',
        },
        // Backward compatibility
        primary: '#003450', // Ana Brand Rengi
        secondary: '#3A506B', // Gri Mavi
        accent: '#003450', // Brand Primary
        // Primary brand colors based on #003450
        'brand-primary': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#003450', // Main brand color
          950: '#002235',
        },
        // Accessibility-focused colors
        'accessible-brand': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1', // WCAG AA compliant
          800: '#075985', // WCAG AAA compliant
          900: '#003450',
        },
        // Admin Design System - Semantic Colors
        'admin-success': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'admin-error': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        'admin-warning': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'admin-info': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['Inter', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'fixral-xs': ['0.75rem', { lineHeight: '1rem' }],
        'fixral-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'fixral-base': ['1rem', { lineHeight: '1.5rem' }],
        'fixral-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'fixral-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'fixral-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'fixral-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'fixral-4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        'fixral-5xl': ['3rem', { lineHeight: '1' }],
        'fixral-6xl': ['3.75rem', { lineHeight: '1' }],
        // Atlas section heading sizes (daha tutarlı başlık ritmi)
        'atlas-2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        'atlas-3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.01em' }],
        'atlas-4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        'atlas-5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        'fixral': '8px',
        'fixral-lg': '12px',
        'fixral-xl': '16px',
        'fixral-2xl': '20px',
      },
      boxShadow: {
        'fixral': '0 2px 6px rgba(0, 0, 0, 0.05)',
        'fixral-lg': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'fixral-xl': '0 8px 24px rgba(0, 0, 0, 0.15)',
        'fixral-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        'fixral-glow': '0 0 20px rgba(0, 180, 216, 0.3)',
      },
      spacing: {
        'fixral-xs': '0.5rem',
        'fixral-sm': '1rem',
        'fixral-md': '1.5rem',
        'fixral-lg': '2rem',
        'fixral-xl': '3rem',
        'fixral-2xl': '4rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale': 'scale 0.3s ease-in-out',
        'fixral-fade-in': 'fadeIn 0.5s ease-in-out',
        'fixral-slide-up': 'slideUp 0.6s ease-out',
        'fixral-slide-down': 'slideDown 0.6s ease-out',
        'fixral-scale': 'scale 0.3s ease-in-out',
        'fixral-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'smooth-bounce': 'bounce 1s ease-in-out infinite',
      },
      transitionProperty: {
        'transform-opacity': 'transform, opacity',
        'colors-transform': 'color, background-color, border-color, transform',
      },
      backgroundImage: {
        'fixral-gradient': 'linear-gradient(135deg, #0D1B2A 0%, #3A506B 100%)',
        'fixral-gradient-light': 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
        'fixral-gradient-turquoise': 'linear-gradient(135deg, #00B4D8 0%, #0077BE 100%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
} 