'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon,
  EyeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { ProjectSummary } from '@/types/portfolio';
import HTMLContent from '../HTMLContent';

interface ModernProjectCardProps {
  project: ProjectSummary & {
    client?: string;
    completionDate?: string;
    technologies?: string[];
    featured?: boolean;
  };
  index: number;
  layout?: 'grid' | 'masonry' | 'list';
}

export default function ModernProjectCard({ 
  project, 
  index, 
  layout = 'grid' 
}: ModernProjectCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1
      }
    }
  };

  const imageVariants = {
    hidden: { scale: 1.2, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-slate-200/50 overflow-hidden transition-all duration-500 flex flex-col h-full hover:-translate-y-2 ${
        layout === 'masonry' ? 'break-inside-avoid mb-6' : ''
      }`}
    >
      {/* Featured Badge */}
      {project.featured && (
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
            ⭐ Öne Çıkan
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
        {!imageError ? (
          <>
            <motion.div
              variants={imageVariants}
              initial="hidden"
              animate={imageLoaded ? "visible" : "hidden"}
            >
              <Image
                src={project.coverImage || '/images/projects/default-project.jpg'}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                onLoad={() => setImageLoaded(true)}
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
            
            {/* Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PhotoIcon className="w-12 h-12 text-slate-400" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-100 to-blue-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-brand-primary-200 rounded-full flex items-center justify-center">
              <PhotoIcon className="w-8 h-8 text-brand-primary-700" />
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>

        {/* Quick View Button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Link
            href={`/portfolio/${project.slug}`}
            className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
          >
            <EyeIcon className="w-5 h-5 text-slate-700" />
          </Link>
        </div>


      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-brand-primary-700 transition-colors duration-300 line-clamp-2">
          {project.title}
        </h3>

        {/* Description */}
        {project.description && (
          <div className="text-slate-600 mb-4 line-clamp-3">
            <HTMLContent 
              content={project.description} 
              className="text-sm leading-relaxed"
              truncate={120}
            />
          </div>
        )}



        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/portfolio/${project.slug}`;
          }}
          className="btn-primary w-full group/btn mt-auto relative z-50 cursor-pointer"
          type="button"
        >
          <span>Detayları Görüntüle</span>
          <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-brand-primary-600/20 transition-colors duration-500 pointer-events-none"></div>
    </motion.div>
  );
}