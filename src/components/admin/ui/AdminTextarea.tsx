'use client';

import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ label, error, helperText, showCharCount, maxLength, className, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(props.value?.toString().length || 0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          maxLength={maxLength}
          className={cn(
            'w-full px-4 py-3 rounded-lg border transition-all duration-200',
            'bg-white dark:bg-slate-800',
            'text-slate-900 dark:text-slate-100',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300 dark:border-slate-600 focus:ring-brand-primary-500 focus:border-brand-primary-500',
            'disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60',
            'resize-y min-h-[100px]',
            className
          )}
          onChange={handleChange}
          {...props}
        />

        <div className="flex items-center justify-between mt-1.5">
          <div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {!error && helperText && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
            )}
          </div>
          
          {showCharCount && maxLength && (
            <p className={cn(
              'text-xs',
              charCount > maxLength * 0.9
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-500 dark:text-slate-400'
            )}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

AdminTextarea.displayName = 'AdminTextarea';

export default AdminTextarea;
