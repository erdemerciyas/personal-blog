'use client';

import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  (
    {
      label,
      error,
      required,
      disabled,
      options,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label}
            {required && <span className="text-admin-error-600 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            required={required}
            className={cn(
              'w-full bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 pr-10 text-slate-900 dark:text-slate-100 transition-colors appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent',
              error
                ? 'border-admin-error-600 focus:ring-admin-error-600'
                : 'border-slate-300 dark:border-slate-600',
              disabled && 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDownIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-admin-error-600 dark:text-admin-error-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AdminSelect.displayName = 'AdminSelect';

export default AdminSelect;
