'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  CodeBracketIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { PortfolioItem } from '../../types/portfolio';

interface PortfolioDetailHeroProps {
  project: PortfolioItem;
}

export default function PortfolioDetailHero({ project }: PortfolioDetailHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-blue-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border-2 border-white rotate-45"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-white rotate-12"></div>
      </div>

      <div className="section-hero relative z-10">
        <div className="container-content">
          {/* Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <Link 
              href="/portfolio" 
              className="inline-flex items-center text-teal-100 hover:text-white text-sm group transition-all duration-300 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
              Tüm Projeler
            </Link>
            
            {project.featured && (
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-2xl">
                <StarIconSolid className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-yellow-100 font-semibold">Öne Çıkan Proje</span>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gradient-hero leading-tight"
              >
                {project.title}
              </motion.h1>

              {/* Description Preview */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl leading-relaxed text-slate-200 mb-8"
              >
                {project.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
              </motion.div>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mb-8"
                >
                  <div className="flex items-center mb-4">
                    <CodeBracketIcon className="w-6 h-6 mr-3 text-teal-400" />
                    <span className="text-lg font-semibold text-teal-100">Kullanılan Teknolojiler</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Project Info Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/20 pb-4">
                  Proje Bilgileri
                </h3>

                {/* Client */}
                <div className="flex items-start">
                  <div className="p-3 bg-teal-500/20 rounded-2xl mr-4 flex-shrink-0">
                    <UserIcon className="w-6 h-6 text-teal-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-teal-200 uppercase tracking-wide mb-1">
                      Müşteri
                    </h4>
                    <p className="text-lg font-semibold text-white">{project.client}</p>
                  </div>
                </div>

                {/* Completion Date */}
                <div className="flex items-start">
                  <div className="p-3 bg-blue-500/20 rounded-2xl mr-4 flex-shrink-0">
                    <CalendarIcon className="w-6 h-6 text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-200 uppercase tracking-wide mb-1">
                      Tamamlanma Tarihi
                    </h4>
                    <p className="text-lg font-semibold text-white">
                      {new Date(project.completionDate).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-start">
                  <div className="p-3 bg-purple-500/20 rounded-2xl mr-4 flex-shrink-0">
                    <TagIcon className="w-6 h-6 text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-purple-200 uppercase tracking-wide mb-1">
                      Kategori
                    </h4>
                    <p className="text-lg font-semibold text-white">
                      {project.categories && project.categories.length > 0
                        ? project.categories.map(cat => cat.name).join(', ')
                        : project.category?.name || 'Genel'
                      }
                    </p>
                  </div>
                </div>

                {/* Project Status */}
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Proje Durumu</span>
                    <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">
                      ✓ Tamamlandı
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}