'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type AdminBadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type AdminBadgeSize = 'sm' | 'md' | 'lg';

export interface AdminBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: AdminBadgeVariant;
  size?: AdminBadgeSize;
}

const AdminBadge = forwardRef<HTMLSpanElement, AdminBadgeProps>(
  (
    {
      variant = 'neutral',
      size = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';
    
    const variantStyles = {
      success: 'bg-admin-success-100 text-admin-success-800 dark:bg-admin-success-900/50 dark:text-admin-success-300',
      error: 'bg-admin-error-100 text-admin-error-800 dark:bg-admin-error-900/50 dark:text-admin-error-300',
      warning: 'bg-admin-warning-100 text-admin-warning-800 dark:bg-admin-warning-900/50 dark:text-admin-warning-300',
      info: 'bg-admin-info-100 text-admin-info-800 dark:bg-admin-info-900/50 dark:text-admin-info-300',
      neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    };
    
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base',
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

AdminBadge.displayName = 'AdminBadge';

export default AdminBadge;
