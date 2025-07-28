'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  EyeIcon,
  CodeBracketIcon,
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
  layout?: 'grid' | 'masonry';
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
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const imageVariants = {
    hidden: { scale: 1.2, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-slate-200/50 overflow-hidden transition-all duration-500 flex flex-col h-full ${
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
          <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-blue-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-teal-200 rounded-full flex items-center justify-center mb-4">
              <PhotoIcon className="w-8 h-8 text-teal-600" />
            </div>
            <span className="text-sm font-medium text-teal-700">{project.category}</span>
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

        {/* Category Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="inline-flex items-center px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-sm font-semibold rounded-full shadow-lg">
            <TagIcon className="w-4 h-4 mr-1" />
            {project.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-teal-600 transition-colors duration-300 line-clamp-2">
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

        {/* Meta Information */}
        <div className="space-y-2 mb-4">
          {project.client && (
            <div className="flex items-center text-sm text-slate-500">
              <UserIcon className="w-4 h-4 mr-2 text-slate-400" />
              <span className="font-medium">{project.client}</span>
            </div>
          )}
          
          {project.completionDate && (
            <div className="flex items-center text-sm text-slate-500">
              <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
              <span>
                {new Date(project.completionDate).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <CodeBracketIcon className="w-4 h-4 mr-2 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">Teknolojiler</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-lg">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Action Button */}
        <Link
          href={`/portfolio/${project.slug}`}
          className="btn-primary w-full group/btn mt-auto"
        >
          <span>Detayları Görüntüle</span>
          <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Link>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-teal-500/20 transition-colors duration-500 pointer-events-none"></div>
    </motion.div>
  );
}