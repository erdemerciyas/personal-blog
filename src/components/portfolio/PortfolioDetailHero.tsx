'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useActiveTheme } from '../../providers/ActiveThemeProvider';
import type { PortfolioItem } from '../../types/portfolio';

interface PortfolioDetailHeroProps {
  project: PortfolioItem;
}

export default function PortfolioDetailHero({ project }: PortfolioDetailHeroProps) {
  const { theme } = useActiveTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const heroConfig = theme?.hero;

  // Defaults
  const bgStyle = heroConfig?.backgroundColor || 'bg-gradient-primary';
  const isCustomBg = bgStyle.includes('gradient') || bgStyle.startsWith('#') || bgStyle.startsWith('rgb');
  const alignment = heroConfig?.alignment || 'center';
  const titleColor = heroConfig?.title?.color;

  if (!mounted) {
    return (
      <section className="relative overflow-hidden bg-gradient-primary text-white">
        <div className="relative z-10 pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20 flex items-center justify-center min-h-[200px]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
              {project.title}
            </h1>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={`relative overflow-hidden text-white ${!isCustomBg ? bgStyle : ''}`}
      style={isCustomBg ? { background: bgStyle } : undefined}
    >
      {/* Overlay */}
      {heroConfig?.overlay?.enabled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: heroConfig.overlay.color || '#000000',
            opacity: heroConfig.overlay.opacity ?? 0.4
          }}
        />
      )}

      <div className="relative z-10 pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20 flex items-center min-h-[200px]">
        <div className={`max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full ${alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center'
          }`}>

          {/* Title */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-4"
              style={titleColor ? { color: titleColor } : undefined}
            >
              {project.title}
            </h1>
          </motion.div>


          {project.featured && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`flex items-center mt-4 ${alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center'
                }`}
            >
              <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <StarIconSolid className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-white/90 font-semibold text-sm">Öne Çıkan Proje</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}