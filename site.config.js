/**
 * Site Configuration
 * This file is the central source of truth for the site's identity and theme.
 * It is used by both the frontend application and build tools (Tailwind).
 */

module.exports = {
    name: "Fixral",
    description: "Fixral - Teknoloji ve Yazılım Çözümleri",

    // Theme Configuration
    theme: {
        colors: {
            // Main brand colors
            primary: '#003450',
            secondary: '#3A506B',
            accent: '#003450',

            // Brand Palette
            brand: {
                'night-blue': '#003450',
                'light-gray': '#F8F9FA',
                'charcoal': '#3D3D3D',
                'gray-blue': '#3A506B',
                'deep-blue': '#002235',
                'ocean-blue': '#0369a1',
                'sky-blue': '#7dd3fc',
                'mint': '#38bdf8',
                'slate': '#2F4F4F',
                'pearl': '#F5F5F5',
                'graphite': '#2C2C2C',
            },

            // Extended scale for UI components
            primaryScale: {
                50: '#f0f9ff',
                100: '#e0f2fe',
                200: '#bae6fd',
                300: '#7dd3fc',
                400: '#38bdf8',
                500: '#0ea5e9',
                600: '#0284c7',
                700: '#0369a1',
                800: '#075985',
                900: '#003450',
                950: '#002235',
            }
        },

        // Feature flags can be added here
        features: {
            blog: true,
            portfolio: true,
            services: true,
        }
    }
};
