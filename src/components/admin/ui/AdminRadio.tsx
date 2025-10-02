'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AdminRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const AdminRadio = forwardRef<HTMLInputElement, AdminRadioProps>(
  ({ label, className, disabled, ...props }, ref) => {
    return (
      <label className={cn(
        'flex items-center space-x-3 cursor-pointer group',
        disabled && 'cursor-not-allowed opacity-60'
      )}>
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="radio"
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div className={cn(
            'w-5 h-5 rounded-full border-2 transition-all duration-200',
            'peer-focus:ring-2 peer-focus:ring-brand-primary-500 peer-focus:ring-offset-2',
            'dark:peer-focus:ring-offset-slate-800',
            props.checked
              ? 'border-brand-primary-600 dark:border-brand-primary-500'
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600',
            'group-hover:border-brand-primary-500 dark:group-hover:border-brand-primary-400',
            disabled && 'group-hover:border-slate-300 dark:group-hover:border-slate-600'
          )}>
            {props.checked && (
              <div className="w-2.5 h-2.5 rounded-full bg-brand-primary-600 dark:bg-brand-primary-500 absolute inset-0 m-auto" />
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

AdminRadio.displayName = 'AdminRadio';

export default AdminRadio;
