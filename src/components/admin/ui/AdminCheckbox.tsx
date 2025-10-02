'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon, MinusIcon } from '@heroicons/react/24/outline';

export interface AdminCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  indeterminate?: boolean;
}

const AdminCheckbox = forwardRef<HTMLInputElement, AdminCheckboxProps>(
  ({ label, indeterminate, className, disabled, ...props }, ref) => {
    return (
      <label className={cn(
        'flex items-center space-x-3 cursor-pointer group',
        disabled && 'cursor-not-allowed opacity-60'
      )}>
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div className={cn(
            'w-5 h-5 rounded border-2 transition-all duration-200',
            'peer-focus:ring-2 peer-focus:ring-brand-primary-500 peer-focus:ring-offset-2',
            'dark:peer-focus:ring-offset-slate-800',
            props.checked || indeterminate
              ? 'bg-brand-primary-600 border-brand-primary-600 dark:bg-brand-primary-500 dark:border-brand-primary-500'
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600',
            'group-hover:border-brand-primary-500 dark:group-hover:border-brand-primary-400',
            disabled && 'group-hover:border-slate-300 dark:group-hover:border-slate-600'
          )}>
            {props.checked && !indeterminate && (
              <CheckIcon className="w-4 h-4 text-white absolute inset-0 m-auto" strokeWidth={3} />
            )}
            {indeterminate && (
              <MinusIcon className="w-4 h-4 text-white absolute inset-0 m-auto" strokeWidth={3} />
            )}
          </div>
        </div>
        
        {label && (
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
            {label}
          </span>
        )}
      </label>
    );
  }
);

AdminCheckbox.displayName = 'AdminCheckbox';

export default AdminCheckbox;
