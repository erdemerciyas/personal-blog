'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import HTMLContent from '../HTMLContent';

interface PageHeroProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundGradient?: string;
  showButton?: boolean;
  variant?: 'default' | 'compact';
  minHeightVh?: number; // Only applied when variant is compact
}

export default function PageHero({ 
  title = "Sayfa Başlığı", 
  description = "Sayfa açıklaması",
  buttonText = "Keşfet",
  buttonLink = "#content",
  backgroundGradient = "bg-gradient-primary",
  showButton = true,
  variant = 'default',
  minHeightVh
}: PageHeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className={`bg-gradient-to-br ${backgroundGradient} ${variant === 'compact' ? 'py-12 md:py-16' : 'py-28'}`} style={variant === 'compact' && minHeightVh ? { minHeight: `${minHeightVh}vh` } : undefined}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Yükleniyor...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden ${backgroundGradient} text-white ${variant === 'compact' ? 'py-12 md:py-16' : ''}`} style={variant === 'compact' && minHeightVh ? { minHeight: `${minHeightVh}vh` } : undefined}>


      <div className={`${variant === 'compact' ? '' : 'section-hero'} relative z-10`}>
        <div className="container-content text-center">
          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-title text-gradient-hero mb-6 max-w-6xl mx-auto prevent-font-clipping"
            style={{ 
              overflow: 'visible',
              lineHeight: '1.1',
              padding: '0.15em 0',
              margin: '0.1em 0'
            }}
          >
            {title}
          </motion.h1>

          {/* Description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl leading-relaxed text-slate-200/90 max-w-4xl mx-auto mb-12"
          >
            <HTMLContent 
              content={description}
              className="text-xl leading-relaxed text-slate-200"
            />
          </motion.div>

          {/* CTA Button */}
          {showButton && buttonText && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {buttonLink.startsWith('#') ? (
                <a href={buttonLink} className="btn-primary group inline-flex items-center rounded-full">
                  {buttonText}
                  <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              ) : (
                <Link href={buttonLink} className="btn-primary group inline-flex items-center rounded-full">
                  {buttonText}
                  <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}