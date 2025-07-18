'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ProjectSummary, PortfolioItem } from '@/types/portfolio';
import ModernProjectCard from './ModernProjectCard';

interface ModernProjectGridProps {
  projects: (ProjectSummary | PortfolioItem)[];
  limit?: number;
  showAnimation?: boolean;
  className?: string;
}

const ModernProjectGrid: React.FC<ModernProjectGridProps> = ({ 
  projects, 
  limit,
  showAnimation = true,
  className = ""
}) => {
  const displayedProjects = limit ? projects.slice(0, limit) : projects;

  if (!displayedProjects || displayedProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Henüz proje bulunmuyor
            </h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Yakında burada harika projeler göreceksiniz. Şu anda içerik hazırlanıyor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <motion.div
      variants={showAnimation ? containerVariants : undefined}
      initial={showAnimation ? "hidden" : undefined}
      animate={showAnimation ? "visible" : undefined}
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 ${className}`}
    >
      {displayedProjects.map((project, index) => (
        <ModernProjectCard
          key={('id' in project ? project.id : project._id) || project.slug}
          project={project}
          index={index}
          priority={index < 3} // İlk 3 görsel için priority
        />
      ))}
    </motion.div>
  );
};

export default ModernProjectGrid;