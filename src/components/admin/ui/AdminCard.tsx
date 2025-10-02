'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type AdminCardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface AdminCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: AdminCardPadding;
  hover?: boolean;
}

const AdminCard = forwardRef<HTMLDivElement, AdminCardProps>(
  (
    {
      title,
      subtitle,
      actions,
      footer,
      padding = 'md',
      hover = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-shadow duration-200';
    const hoverStyles = hover ? 'hover:shadow-md' : '';
    
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, hoverStyles, className)}
        {...props}
      >
        {(title || subtitle || actions) && (
          <div className={cn('flex items-start justify-between border-b border-slate-200 dark:border-slate-700', paddingStyles[padding], padding === 'none' && 'p-6')}>
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="ml-4">{actions}</div>}
          </div>
        )}
        
        <div className={cn(paddingStyles[padding])}>
          {children}
        </div>
        
        {footer && (
          <div className={cn('border-t border-slate-200 dark:border-slate-700', paddingStyles[padding], padding === 'none' && 'p-6')}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

AdminCard.displayName = 'AdminCard';

export default AdminCard;
