'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import AdminButton from './AdminButton';

export interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function AdminEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      {icon && (
        <div className="mb-4 text-slate-400 dark:text-slate-600">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <AdminButton onClick={action.onClick} variant="primary">
          {action.label}
        </AdminButton>
      )}
    </div>
  );
}
