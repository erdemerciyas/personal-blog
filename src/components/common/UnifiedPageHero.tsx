'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface UnifiedPageHeroProps {
  title: string;
  description?: string;
  subtitle?: string;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundGradient?: string;
  showButton?: boolean;
  showSecondaryButton?: boolean;
  variant?: 'default' | 'compact';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

export default function UnifiedPageHero({
  title,
  description,
  subtitle,
  badge,
  buttonText = 'Keşfet',
  buttonLink = '#content',
  secondaryButtonText,
  secondaryButtonLink,
  backgroundGradient = 'bg-gradient-primary',
  showButton = true,
  showSecondaryButton = false,
  variant = 'default',
}: UnifiedPageHeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section
        className={`${backgroundGradient} text-white ${
          variant === 'compact'
            ? 'py-12 md:py-16'
            : 'py-32 md:py-48 lg:py-56 flex items-center justify-center'
        }`}
      >
        <div className="container-content">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Yükleniyor...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative overflow-hidden ${backgroundGradient} text-white ${
        variant === 'compact'
          ? 'py-12 md:py-16'
          : 'py-32 md:py-48 lg:py-56 flex items-center justify-center'
      }`}
      role="banner"
      aria-label={`${title} - Sayfa başlığı`}
    >
      <div className="container-content">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          {badge && (
            <motion.div
              variants={itemVariants}
              className="mb-6 inline-block"
            >
              <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-white/90">
                {badge}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className={`${
              variant === 'compact' ? 'hero-title-compact' : 'hero-title'
            } text-gradient-hero mb-6`}
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl font-semibold text-brand-primary-200 mb-8"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Description */}
          {description && (
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl leading-relaxed text-slate-200/90 max-w-3xl mx-auto mb-12"
            >
              {description}
            </motion.p>
          )}

          {/* CTA Buttons */}
          {(showButton || showSecondaryButton) && (
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
            >
              {showButton && (
                <Link
                  href={buttonLink}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-primary-900 font-semibold rounded-lg hover:bg-white/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary-900 shadow-lg hover:shadow-xl"
                >
                  {buttonText}
                  <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                </Link>
              )}

              {showSecondaryButton && secondaryButtonLink && (
                <Link
                  href={secondaryButtonLink}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary-900"
                >
                  {secondaryButtonText}
                  <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                </Link>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none" />
    </section>
  );
}
