'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type AdminButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
export type AdminButtonSize = 'sm' | 'md' | 'lg';

export interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: 'bg-brand-primary-600 text-white hover:bg-brand-primary-700 focus-visible:ring-brand-primary-600 dark:bg-brand-primary-500 dark:hover:bg-brand-primary-600',
      secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus-visible:ring-slate-500 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
      danger: 'bg-admin-error-600 text-white hover:bg-admin-error-700 focus-visible:ring-admin-error-600 dark:bg-admin-error-500 dark:hover:bg-admin-error-600',
      success: 'bg-admin-success-600 text-white hover:bg-admin-success-700 focus-visible:ring-admin-success-600 dark:bg-admin-success-500 dark:hover:bg-admin-success-600',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-500 dark:text-slate-200 dark:hover:bg-slate-800',
    };
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    };
    
    const widthStyles = fullWidth ? 'w-full' : '';
    
    const iconSize = {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className={cn('animate-spin', iconSize[size])}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && Icon && iconPosition === 'left' && (
          <Icon className={iconSize[size]} />
        )}
        {children}
        {!loading && Icon && iconPosition === 'right' && (
          <Icon className={iconSize[size]} />
        )}
      </button>
    );
  }
);

AdminButton.displayName = 'AdminButton';

export default AdminButton;
