'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
}

const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      disabled,
      icon: Icon,
      iconPosition = 'left',
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
          {Icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
          )}
          
          <input
            ref={ref}
            disabled={disabled}
            required={required}
            className={cn(
              'w-full bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent',
              error
                ? 'border-admin-error-600 focus:ring-admin-error-600'
                : 'border-slate-300 dark:border-slate-600',
              disabled && 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900',
              Icon && iconPosition === 'left' && 'pl-10',
              Icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            {...props}
          />
          
          {Icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-admin-error-600 dark:text-admin-error-400">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AdminInput.displayName = 'AdminInput';

export default AdminInput;
