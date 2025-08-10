'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PortfolioItem, Category } from '../types/portfolio';

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

interface UsePortfolioFiltersReturn {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  filteredProjects: PortfolioItem[];
  isLoading: boolean;
  totalResults: number;
  availableTechnologies: string[];
}

export function usePortfolioFilters(
  projects: PortfolioItem[],
  categories: Category[],
  isLoading: boolean = false
): UsePortfolioFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const [filters, setFiltersState] = useState<FilterState>(() => {
    const categoriesParam = searchParams?.get('categories');
    const categoryParam = searchParams?.get('category'); // Backward compatibility
    const searchParam = searchParams?.get('search') || '';
    const technologiesParam = searchParams?.get('technologies');
    const sortParam = searchParams?.get('sort') || 'newest-desc';
    const startDateParam = searchParams?.get('startDate') || '';
    const endDateParam = searchParams?.get('endDate') || '';

    let selectedCategories: string[] = [];
    if (categoriesParam) {
      selectedCategories = categoriesParam.split(',').map(slug => slug.trim()).filter(Boolean);
    } else if (categoryParam) {
      selectedCategories = [categoryParam];
    }

    const selectedTechnologies = technologiesParam 
      ? technologiesParam.split(',').map(tech => tech.trim()).filter(Boolean)
      : [];

    const [sortBy, sortOrder] = sortParam.split('-') as [FilterState['sortBy'], FilterState['sortOrder']];

    return {
      search: searchParam,
      categories: selectedCategories,
      technologies: selectedTechnologies,
      dateRange: {
        start: startDateParam,
        end: endDateParam
      },
      sortBy: sortBy || 'newest',
      sortOrder: sortOrder || 'desc'
    };
  });

  // Update URL when filters change
  const updateURL = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    
    if (newFilters.categories.length > 0) {
      params.set('categories', newFilters.categories.join(','));
    }
    
    if (newFilters.technologies.length > 0) {
      params.set('technologies', newFilters.technologies.join(','));
    }
    
    if (newFilters.dateRange.start) {
      params.set('startDate', newFilters.dateRange.start);
    }
    
    if (newFilters.dateRange.end) {
      params.set('endDate', newFilters.dateRange.end);
    }
    
    if (newFilters.sortBy !== 'newest' || newFilters.sortOrder !== 'desc') {
      params.set('sort', `${newFilters.sortBy}-${newFilters.sortOrder}`);
    }

    const newURL = params.toString() ? `/portfolio?${params.toString()}` : '/portfolio';
    router.push(newURL, { scroll: false });
  }, [router]);

  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(newFilters);
    updateURL(newFilters);
  }, [updateURL]);

  // Extract available technologies from all projects
  const availableTechnologies = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach(project => {
      if (project.technologies) {
        project.technologies.forEach(tech => techSet.add(tech));
      }
    });
    return Array.from(techSet).sort();
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    if (isLoading || !projects) return [];

    let filtered = [...projects];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.client?.toLowerCase().includes(searchLower) ||
        project.technologies?.some(tech => tech.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      // console.debug('Filtering by categories:', filters.categories);
      filtered = filtered.filter(project => {
        // debug helper removed for production cleanliness
        
        // Support both old single category and new multiple categories
        if (project.categories && project.categories.length > 0) {
          const match = project.categories.some(cat => 
            filters.categories.includes(cat.slug) || filters.categories.includes(cat.name)
          );
           // console.debug('Categories match:', match);
          return match;
        } else if (project.category) {
           const match = filters.categories.includes(project.category.slug) || filters.categories.includes(project.category.name);
           // console.debug('Category match:', match);
          return match;
        } else if (project.categoryId && typeof project.categoryId === 'object' && 'slug' in project.categoryId) {
          const categoryObj = project.categoryId as { slug: string; name: string };
          const match = filters.categories.includes(categoryObj.slug) || filters.categories.includes(categoryObj.name);
           // console.debug('CategoryId match:', match);
          return match;
        }
        // console.debug('No category match found');
        return false;
      });
    }

    // Technology filter
    if (filters.technologies.length > 0) {
      filtered = filtered.filter(project =>
        project.technologies?.some(tech => filters.technologies.includes(tech))
      );
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(project => {
        const projectDate = new Date(project.completionDate);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        if (startDate && projectDate < startDate) return false;
        if (endDate && projectDate > endDate) return false;
        return true;
      });
    }

    // Sort projects
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title, 'tr');
          break;
        case 'category':
          const aCategoryName = a.categories?.[0]?.name || a.category?.name || '';
          const bCategoryName = b.categories?.[0]?.name || b.category?.name || '';
          comparison = aCategoryName.localeCompare(bCategoryName, 'tr');
          break;
        case 'oldest':
          comparison = new Date(a.completionDate).getTime() - new Date(b.completionDate).getTime();
          break;
        case 'newest':
        default:
          comparison = new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime();
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [projects, filters, isLoading]);

  return {
    filters,
    setFilters,
    filteredProjects,
    isLoading,
    totalResults: filteredProjects.length,
    availableTechnologies
  };
}