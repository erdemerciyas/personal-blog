'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import HTMLContent from '../HTMLContent';

interface PageHeroProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  badge?: string;
  backgroundGradient?: string;
  showButton?: boolean;
}

export default function PageHero({ 
  title = "Sayfa Başlığı", 
  description = "Sayfa açıklaması",
  buttonText = "Keşfet",
  buttonLink = "#content",
  badge = "Yaratıcı Çözümler",
  backgroundGradient = "from-slate-900 via-teal-900 to-blue-900",
  showButton = true
}: PageHeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className={`bg-gradient-to-br ${backgroundGradient} py-28`}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Yükleniyor...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${backgroundGradient} text-white`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border-2 border-white rotate-45 animate-bounce"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-white rotate-12 animate-bounce"></div>
      </div>

      <div className="section-hero relative z-10">
        <div className="container-content text-center">
          {/* Badge */}
          {badge && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-sm font-semibold">
                <SparklesIcon className="w-4 h-4 mr-2" />
                {badge}
              </span>
            </motion.div>
          )}

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
            className="text-xl leading-relaxed text-slate-200 max-w-4xl mx-auto mb-12"
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
                <a
                  href={buttonLink}
                  className="btn-primary group inline-flex items-center"
                >
                  {buttonText}
                  <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              ) : (
                <Link
                  href={buttonLink}
                  className="btn-primary group inline-flex items-center"
                >
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