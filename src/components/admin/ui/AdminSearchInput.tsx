'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AdminSpinner from './AdminSpinner';

export interface AdminSearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  loading?: boolean;
}

const AdminSearchInput = forwardRef<HTMLInputElement, AdminSearchInputProps>(
  ({ onClear, loading, className, value, ...props }, ref) => {
    const hasValue = value !== undefined && value !== '';

    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        </div>

        <input
          ref={ref}
          type="search"
          value={value}
          className={cn(
            'w-full pl-10 pr-10 py-2.5 rounded-lg border transition-all duration-200',
            'bg-white dark:bg-slate-800',
            'text-slate-900 dark:text-slate-100',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'border-slate-300 dark:border-slate-600',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500',
            'disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60',
            className
          )}
          {...props}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <AdminSpinner size="sm" />
          ) : hasValue && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>
          ) : null}
        </div>
      </div>
    );
  }
);

AdminSearchInput.displayName = 'AdminSearchInput';

export default AdminSearchInput;
