'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { ProjectSummary, PortfolioItem, Category } from '@/types/portfolio';
import ModernProjectGrid from './ModernProjectGrid';

interface PortfolioShowcaseProps {
  projects: (ProjectSummary | PortfolioItem)[];
  categories?: Category[];
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showAnimation?: boolean;
  className?: string;
}

const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  projects,
  categories = [],
  title = "Portfolio",
  subtitle = "Gerçekleştirdiğim projeler ve çalışmalar",
  showSearch = true,
  showFilter = true,
  showAnimation = true,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filtrelenmiş projeler
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Arama filtresi
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        ('client' in project && project.client?.toLowerCase().includes(searchLower))
      );
    }

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => {
        // Yeni format kontrolü
        if ('categories' in project && project.categories) {
          return project.categories.some(cat => cat._id === selectedCategory);
        }
        // Eski format kontrolü
        if ('category' in project) {
          if (typeof project.category === 'object' && project.category?._id) {
            return project.category._id === selectedCategory;
          }
          if (typeof project.category === 'string') {
            return project.category === selectedCategory;
          }
        }
        return false;
      });
    }

    return filtered;
  }, [projects, searchTerm, selectedCategory]);

  // Kategori sayıları
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    
    categories.forEach(category => {
      counts[category._id] = projects.filter(project => {
        if ('categories' in project && project.categories) {
          return project.categories.some(cat => cat._id === category._id);
        }
        if ('category' in project && typeof project.category === 'object') {
          return project.category?._id === category._id;
        }
        return false;
      }).length;
    });

    return counts;
  }, [projects, categories]);

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  const filterVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <motion.div
        variants={showAnimation ? headerVariants : undefined}
        initial={showAnimation ? "hidden" : undefined}
        animate={showAnimation ? "visible" : undefined}
        transition={showAnimation ? { duration: 0.6, ease: "easeOut" } : undefined}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </motion.div>

      {/* Search and Filter */}
      {(showSearch || showFilter) && (
        <motion.div
          variants={showAnimation ? filterVariants : undefined}
          initial={showAnimation ? "hidden" : undefined}
          animate={showAnimation ? "visible" : undefined}
          transition={showAnimation ? { duration: 0.4, delay: 0.2 } : undefined}
          className="space-y-4"
        >
          {/* Search Bar */}
          {showSearch && (
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Proje ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          )}

          {/* Category Filter */}
          {showFilter && categories.length > 0 && (
            <div className="flex flex-col items-center space-y-4">
              {/* Mobile Filter Toggle */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <FunnelIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filtrele</span>
                </button>
              </div>

              {/* Filter Options */}
              <AnimatePresence>
                {(isFilterOpen || window.innerWidth >= 768) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap justify-center gap-2 md:gap-3"
                  >
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === 'all'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      Tümü ({categoryCounts.all})
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => setSelectedCategory(category._id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category._id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        {category.name} ({categoryCounts[category._id] || 0})
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {/* Results Count */}
      {(searchTerm || selectedCategory !== 'all') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600">
            {filteredProjects.length} proje bulundu
            {searchTerm && (
              <span className="ml-1">
                "<span className="font-medium">{searchTerm}</span>" için
              </span>
            )}
          </p>
        </motion.div>
      )}

      {/* Projects Grid */}
      <ModernProjectGrid 
        projects={filteredProjects}
        showAnimation={showAnimation}
        className="pt-4"
      />

      {/* No Results */}
      {filteredProjects.length === 0 && (searchTerm || selectedCategory !== 'all') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Sonuç bulunamadı
              </h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Arama kriterlerinize uygun proje bulunamadı. Farklı anahtar kelimeler deneyin.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PortfolioShowcase;