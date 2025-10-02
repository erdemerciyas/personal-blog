'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AdminBadge from './AdminBadge';
import AdminButton from './AdminButton';

export interface FilterOption {
  label: string;
  value: string;
  checked: boolean;
}

export interface AdminFilterDropdownProps {
  filters: FilterOption[];
  onFilterChange: (filters: FilterOption[]) => void;
  onClearAll?: () => void;
  label?: string;
  className?: string;
}

export default function AdminFilterDropdown({
  filters,
  onFilterChange,
  onClearAll,
  label = 'Filtrele',
  className,
}: AdminFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeFiltersCount = filters.filter(f => f.checked).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleFilterToggle = (index: number) => {
    const newFilters = [...filters];
    newFilters[index].checked = !newFilters[index].checked;
    onFilterChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = filters.map(f => ({ ...f, checked: false }));
    onFilterChange(clearedFilters);
    onClearAll?.();
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <FunnelIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
        {activeFiltersCount > 0 && (
          <AdminBadge variant="info" size="sm">
            {activeFiltersCount}
          </AdminBadge>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 animate-slide-down">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Filtreler
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-brand-primary-600 dark:text-brand-primary-400 hover:text-brand-primary-700 dark:hover:text-brand-primary-300 font-medium"
              >
                Temizle
              </button>
            )}
          </div>

          <div className="p-2 max-h-80 overflow-y-auto">
            {filters.map((filter, index) => (
              <label
                key={index}
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filter.checked}
                  onChange={() => handleFilterToggle(index)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-primary-600 focus:ring-brand-primary-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {filter.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
