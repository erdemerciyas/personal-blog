'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Squares2X2Icon,
  ViewColumnsIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';
import { ProjectSummary } from '@/types/portfolio';
import ModernProjectCard from './ModernProjectCard';

interface ModernProjectGridProps {
  projects: (ProjectSummary & {
    client?: string;
    completionDate?: string;
    technologies?: string[];
    featured?: boolean;
  })[];
  isLoading?: boolean;
  layout?: 'grid' | 'masonry' | 'list';
  onLayoutChange?: (layout: 'grid' | 'masonry' | 'list') => void;
}

export default function ModernProjectGrid({ 
  projects, 
  isLoading = false,
  layout = 'grid',
  onLayoutChange
}: ModernProjectGridProps) {
  const [mounted, setMounted] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<'grid' | 'masonry' | 'list'>(layout);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout]);

  const handleLayoutChange = (newLayout: 'grid' | 'masonry' | 'list') => {
    setCurrentLayout(newLayout);
    onLayoutChange?.(newLayout);
  };

  if (!mounted) {
    return <ProjectGridSkeleton />;
  }

  if (isLoading) {
    return <ProjectGridSkeleton />;
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-20 min-h-[40vh] flex flex-col justify-center items-center" role="status" aria-live="polite">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Squares2X2Icon className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-800 mb-4">
          Proje Bulunamadı
        </h3>
        <p className="text-slate-600 max-w-md">
          Arama kriterlerinize uygun proje bulunamadı. Filtreleri değiştirmeyi deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Layout Controls */}
      {onLayoutChange && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-md rounded-full p-1.5 shadow border border-white/40">
            <button
              onClick={() => handleLayoutChange('grid')}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                currentLayout === 'grid'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-brand-primary-700'
              }`}
              title="Grid Görünümü"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleLayoutChange('masonry')}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                currentLayout === 'masonry'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-brand-primary-700'
              }`}
              title="Masonry Görünümü"
            >
              <ViewColumnsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleLayoutChange('list')}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                currentLayout === 'list'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-brand-primary-700'
              }`}
              title="Liste Görünümü"
            >
              <QueueListIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="text-sm text-slate-600 font-medium">
            {projects.length} proje gösteriliyor
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLayout}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className={getGridClassName(currentLayout)}
        >
          {projects.map((project, index) => (
            <ModernProjectCard
              key={project.id}
              project={project}
              index={index}
              layout={currentLayout}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function getGridClassName(layout: 'grid' | 'masonry' | 'list'): string {
  switch (layout) {
    case 'masonry':
      return 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-0';
    case 'list':
      return 'space-y-6';
    case 'grid':
    default:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
  }
}

function ProjectGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-3xl shadow-lg border border-slate-200/50 overflow-hidden animate-pulse"
        >
          {/* Image Skeleton */}
          <div className="aspect-[16/10] bg-slate-200"></div>
          
          {/* Content Skeleton */}
          <div className="p-6 space-y-4">
            {/* Title */}
            <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
            
            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
            
            {/* Meta */}
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            </div>
            
            {/* Technologies */}
            <div className="flex gap-2">
              <div className="h-6 bg-slate-200 rounded-lg w-16"></div>
              <div className="h-6 bg-slate-200 rounded-lg w-20"></div>
              <div className="h-6 bg-slate-200 rounded-lg w-14"></div>
            </div>
            
            {/* Button */}
            <div className="h-12 bg-slate-200 rounded-2xl w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}