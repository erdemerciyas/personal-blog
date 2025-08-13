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
        // Fixral Design System Colors - Re-aligned to Extreme brand (red/black/white)
        fixral: {
          'night-blue': '#0B0B0B', // used as near-black base for headings/backgrounds
          'primary': '#B91C1C', // brand red
          'light-gray': '#F8F9FA',
          'charcoal': '#1F2937', // slate-800-ish for robust contrast
          'gray-blue': '#374151', // slate-700 as neutral text
          // Extended palette (kept for compatibility, tuned to brand)
          'deep-blue': '#0B0B0B',
          'ocean-blue': '#B91C1C',
          'sky-blue': '#EF4444',
          'mint': '#DC2626',
          'slate': '#111827',
          'pearl': '#F5F5F5',
          'graphite': '#0F172A',
        },
        // Backward compatibility semantic aliases
        primary: '#B91C1C', // Brand Red
        secondary: '#111827', // Near-black
        accent: '#B91C1C', // Brand accent = red
        // Primary brand colors (red scale)
        'brand-primary': {
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
          950: '#450a0a',
        },
        // Accessibility-focused colors (ensure contrast on light/dark)
        'accessible-brand': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#991b1b', // WCAG AA compliant on white
          800: '#7f1d1d', // WCAG AAA compliant on white
          900: '#111111',
        }
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'Inter', 'var(--font-inter)', 'system-ui', 'sans-serif'],
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
        'fixral-glow': '0 0 20px rgba(185, 28, 28, 0.35)',
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
        'fixral-gradient': 'linear-gradient(135deg, #0b0b0b 0%, #1f2937 100%)',
        'fixral-gradient-light': 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
        'fixral-gradient-turquoise': 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
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