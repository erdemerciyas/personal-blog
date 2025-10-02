'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import AdminButton from './AdminButton';

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxPageNumbers = 5,
}: AdminPaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const halfMax = Math.floor(maxPageNumbers / 2);

    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, currentPage + halfMax);

    if (currentPage <= halfMax) {
      endPage = Math.min(totalPages, maxPageNumbers);
    }

    if (currentPage + halfMax >= totalPages) {
      startPage = Math.max(1, totalPages - maxPageNumbers + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center space-x-2">
        <AdminButton
          size="sm"
          variant="secondary"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={ChevronLeftIcon}
          iconPosition="left"
        >
          Previous
        </AdminButton>

        {showPageNumbers && (
          <div className="hidden sm:flex items-center space-x-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...' || page === currentPage}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                  page === currentPage
                    ? 'bg-brand-primary-600 text-white'
                    : page === '...'
                    ? 'cursor-default text-slate-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        <AdminButton
          size="sm"
          variant="secondary"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          icon={ChevronRightIcon}
          iconPosition="right"
        >
          Next
        </AdminButton>
      </div>
    </div>
  );
}
