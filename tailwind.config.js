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
        },
        // Backward compatibility
        primary: '#0D1B2A', // Ana Gece Mavisi
        secondary: '#3A506B', // Gri Mavi
        accent: '#00B4D8', // Canlı Turkuaz
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'fixral': '8px',
        'fixral-lg': '12px',
      },
      boxShadow: {
        'fixral': '0 2px 6px rgba(0, 0, 0, 0.05)',
        'fixral-lg': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
} 