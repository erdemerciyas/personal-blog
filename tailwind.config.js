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
        // Fixral Design System Colors
        fixral: {
          'night-blue': '#0D1B2A',
          'turquoise': '#00B4D8',
          'light-gray': '#F8F9FA',
          'charcoal': '#3D3D3D',
          'gray-blue': '#3A506B',
          // Extended palette for better design flexibility
          'deep-blue': '#041E42',
          'ocean-blue': '#0077BE',
          'sky-blue': '#87CEEB',
          'mint': '#40E0D0',
          'slate': '#2F4F4F',
          'pearl': '#F5F5F5',
          'graphite': '#2C2C2C',
        },
        // Backward compatibility
        primary: '#0D1B2A', // Ana Gece Mavisi
        secondary: '#3A506B', // Gri Mavi
        accent: '#00B4D8', // Canlı Turkuaz
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
        'fixral-fade-in': 'fadeIn 0.5s ease-in-out',
        'fixral-slide-up': 'slideUp 0.6s ease-out',
        'fixral-slide-down': 'slideDown 0.6s ease-out',
        'fixral-scale': 'scale 0.3s ease-in-out',
        'fixral-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
      backgroundImage: {
        'fixral-gradient': 'linear-gradient(135deg, #0D1B2A 0%, #3A506B 100%)',
        'fixral-gradient-light': 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
        'fixral-gradient-turquoise': 'linear-gradient(135deg, #00B4D8 0%, #0077BE 100%)',
      },
    },
  },
  plugins: [],
} 