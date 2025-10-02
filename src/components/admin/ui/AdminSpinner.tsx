'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type AdminSpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type AdminSpinnerColor = 'primary' | 'white' | 'slate';

export interface AdminSpinnerProps {
  size?: AdminSpinnerSize;
  color?: AdminSpinnerColor;
  className?: string;
}

export default function AdminSpinner({ 
  size = 'md', 
  color = 'primary',
  className 
}: AdminSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    primary: 'border-brand-primary-600 border-t-transparent dark:border-brand-primary-400',
    white: 'border-white border-t-transparent',
    slate: 'border-slate-600 border-t-transparent dark:border-slate-400',
  };

  return (
    <div
      className={cn(
        'inline-block rounded-full animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
