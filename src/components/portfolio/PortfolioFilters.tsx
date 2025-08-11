'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  TagIcon,
  Squares2X2Icon,
  CalendarIcon,
  CodeBracketIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import type { Category } from '../../types/portfolio';

interface FilterState {
  search: string;
  categories: string[];
  technologies: string[];
  dateRange: {
    start: string;
    end: string;
  };
  sortBy: 'newest' | 'oldest' | 'title' | 'category';
  sortOrder: 'asc' | 'desc';
}

interface PortfolioFiltersProps {
  categories: Category[];
  technologies: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
  isLoading?: boolean;
}

export default function PortfolioFilters({
  categories,
  technologies,
  filters,
  onFiltersChange,
  totalResults,
  isLoading = false
}: PortfolioFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Debounced search
  const [searchValue, setSearchValue] = useState(filters.search);
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchValue });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, filters, onFiltersChange]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.technologies.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  const handleCategoryToggle = (categorySlug: string) => {
    const newCategories = filters.categories.includes(categorySlug)
      ? filters.categories.filter(c => c !== categorySlug)
      : [...filters.categories, categorySlug];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleTechnologyToggle = (tech: string) => {
    const newTechnologies = filters.technologies.includes(tech)
      ? filters.technologies.filter(t => t !== tech)
      : [...filters.technologies, tech];
    
    onFiltersChange({ ...filters, technologies: newTechnologies });
  };

  const clearAllFilters = () => {
    setSearchValue('');
    onFiltersChange({
      search: '',
      categories: [],
      technologies: [],
      dateRange: { start: '', end: '' },
      sortBy: 'newest',
      sortOrder: 'desc'
    });
  };

  const clearFilter = (type: string, value?: string) => {
    switch (type) {
      case 'search':
        setSearchValue('');
        break;
      case 'category':
        if (value) {
          onFiltersChange({
            ...filters,
            categories: filters.categories.filter(c => c !== value)
          });
        }
        break;
      case 'technology':
        if (value) {
          onFiltersChange({
            ...filters,
            technologies: filters.technologies.filter(t => t !== value)
          });
        }
        break;
      case 'dateRange':
        onFiltersChange({
          ...filters,
          dateRange: { start: '', end: '' }
        });
        break;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 md:p-8 mb-8">
      {/* Search and Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className={`relative transition-all duration-300 ${
            searchFocused ? 'transform scale-[1.02]' : ''
          }`}>
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Proje ara..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:border-brand-primary-600 focus:ring-4 focus:ring-brand-primary-600/20 outline-none transition-all duration-300 shadow-sm focus:shadow-lg"
            />
            {searchValue && (
              <button
                onClick={() => clearFilter('search')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors duration-200"
              >
                <XMarkIcon className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Sort and Advanced Toggle */}
        <div className="flex gap-3">
          {/* Sort Dropdown */}
          <div className="relative" role="group" aria-label="Sıralama">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [FilterState['sortBy'], FilterState['sortOrder']];
                onFiltersChange({ ...filters, sortBy, sortOrder });
              }}
              className="appearance-none bg-white border-2 border-slate-200 rounded-2xl px-4 py-4 pr-10 text-slate-700 focus:border-brand-primary-600 focus:ring-4 focus:ring-brand-primary-600/20 outline-none transition-all duration-300 shadow-sm focus:shadow-lg cursor-pointer"
              aria-label="Sırala"
            >
              <option value="newest-desc">En Yeni</option>
              <option value="oldest-asc">En Eski</option>
              <option value="title-asc">A-Z</option>
              <option value="title-desc">Z-A</option>
              <option value="category-asc">Kategoriye Göre</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-sm hover:shadow-lg ${
              showAdvanced || activeFiltersCount > 0
                ? 'bg-brand-primary-600 text-white'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-brand-primary-300'
            }`}
            aria-expanded={showAdvanced}
            aria-controls="advanced-filters"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
            Filtreler
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm font-medium text-slate-600">Aktif Filtreler:</span>
              
              {/* Search Filter */}
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 bg-brand-primary-100 text-brand-primary-800 rounded-full text-sm font-medium">
                  <MagnifyingGlassIcon className="w-4 h-4 mr-1" />
                  &quot;{filters.search}&quot;
                  <button
                    onClick={() => clearFilter('search')}
                    className="ml-2 hover:text-brand-primary-700"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Category Filters */}
              {filters.categories.map(categorySlug => {
                const category = categories.find(c => c.slug === categorySlug);
                return category ? (
                  <span
                    key={categorySlug}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    <TagIcon className="w-4 h-4 mr-1" />
                    {category.name}
                    <button
                      onClick={() => clearFilter('category', categorySlug)}
                      className="ml-2 hover:text-blue-600"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}

              {/* Technology Filters */}
              {filters.technologies.map(tech => (
                <span
                  key={tech}
                  className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  <CodeBracketIcon className="w-4 h-4 mr-1" />
                  {tech}
                  <button
                    onClick={() => clearFilter('technology', tech)}
                    className="ml-2 hover:text-purple-600"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Date Range Filter */}
              {(filters.dateRange.start || filters.dateRange.end) && (
                <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {filters.dateRange.start && filters.dateRange.end
                    ? `${filters.dateRange.start} - ${filters.dateRange.end}`
                    : filters.dateRange.start
                    ? `${filters.dateRange.start} sonrası`
                    : `${filters.dateRange.end} öncesi`
                  }
                  <button
                    onClick={() => clearFilter('dateRange')}
                    className="ml-2 hover:text-orange-600"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-sm text-slate-500 hover:text-slate-700 underline ml-2"
              >
                Tümünü Temizle
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 pt-6"
            id="advanced-filters"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <TagIcon className="w-5 h-5 mr-2 text-brand-primary-700" />
                  Kategoriler
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                  {categories.map(category => (
                    <label
                      key={category._id}
                      className="flex items-center p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.slug)}
                        onChange={() => handleCategoryToggle(category.slug)}
                        className="w-4 h-4 text-brand-primary-700 border-slate-300 rounded focus:ring-brand-primary-600 focus:ring-2"
                      />
                      <span className="ml-3 text-slate-700 font-medium">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <CodeBracketIcon className="w-5 h-5 mr-2 text-purple-600" />
                  Teknolojiler
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                  {technologies.map(tech => (
                    <label
                      key={tech}
                      className="flex items-center p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={filters.technologies.includes(tech)}
                        onChange={() => handleTechnologyToggle(tech)}
                        className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="ml-3 text-slate-700 font-medium">{tech}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-orange-600" />
                  Tarih Aralığı
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Başlangıç Tarihi
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, start: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, end: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center text-slate-600" role="status" aria-live="polite">
          <Squares2X2Icon className="w-5 h-5 mr-2" />
          <span className="font-medium">
            {isLoading ? (
              <span className="inline-flex items-center">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mr-2"></div>
                Yükleniyor...
              </span>
            ) : (
              `${totalResults} proje bulundu`
            )}
          </span>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-brand-primary-700 hover:text-brand-primary-800 font-semibold transition-colors duration-200"
          >
            Filtreleri Temizle
          </button>
        )}
      </div>
    </div>
  );
}