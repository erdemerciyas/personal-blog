'use client';

import { motion } from 'framer-motion';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { PortfolioItem } from '../../types/portfolio';

interface PortfolioDetailHeroProps {
  project: PortfolioItem;
}

export default function PortfolioDetailHero({ project }: PortfolioDetailHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-primary text-white">

      <div className="relative z-10 pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20 flex items-center justify-center min-h-[200px]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full">

          {/* Centered Title */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gradient-hero leading-tight"
            >
              {project.title}
            </motion.h1>

            {project.featured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center justify-center mt-4"
              >
                <div className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-md border border-yellow-400/30 rounded-full">
                  <StarIconSolid className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-yellow-100 font-semibold">Öne Çıkan Proje</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}