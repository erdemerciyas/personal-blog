'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { ProjectSummary, PortfolioItem } from '@/types/portfolio';

interface ModernProjectCardProps {
  project: ProjectSummary | PortfolioItem;
  index?: number;
  priority?: boolean;
}

const ModernProjectCard: React.FC<ModernProjectCardProps> = ({ 
  project, 
  index = 0,
  priority = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Açıklama karakter sınırlaması (yaklaşık 2 satır için)
  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Fallback görsel
  const fallbackImage = 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop&crop=center';
  const imageUrl = project.coverImage || fallbackImage;

  // Kategori bilgisi - hem eski hem yeni format desteği
  const getCategory = () => {
    if ('categories' in project && project.categories && project.categories.length > 0) {
      return project.categories[0].name;
    }
    if ('category' in project && typeof project.category === 'object' && project.category?.name) {
      return project.category.name;
    }
    if ('category' in project && typeof project.category === 'string') {
      return project.category;
    }
    return 'Genel';
  };

  // Tarih formatı
  const getFormattedDate = () => {
    if ('completionDate' in project && project.completionDate) {
      return new Date(project.completionDate).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short'
      });
    }
    return null;
  };

  // Müşteri bilgisi
  const getClient = () => {
    if ('client' in project && project.client) {
      return project.client;
    }
    return null;
  };

  const category = getCategory();
  const formattedDate = getFormattedDate();
  const client = getClient();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="group"
    >
      <Link 
        href={`/portfolio/${project.slug}`}
        className="block"
      >
        <article className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 ease-out transform hover:-translate-y-2 overflow-hidden border border-gray-100 hover:border-gray-200">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            {/* Category Badge */}
            <div className="absolute top-4 left-4 z-20">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm border border-white/20">
                {category}
              </span>
            </div>

            {/* Image */}
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt={project.title}
                fill
                className={`object-cover transition-all duration-700 ease-out group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority || index < 3}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
              
              {/* Loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse">
                  <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-tight">
              {project.title}
            </h3>

            {/* Description */}
            {project.description && (
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
                {truncateDescription(project.description)}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                {client && (
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="truncate max-w-20">{client}</span>
                  </div>
                )}
                {formattedDate && (
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center space-x-1 text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-300">
                <span className="text-xs">Detay</span>
                <ArrowRightIcon className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

export default ModernProjectCard;