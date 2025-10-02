'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import AdminButton from './AdminButton';

export interface AdminErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  showTimeout?: boolean;
  className?: string;
}

export default function AdminErrorState({
  title = 'Bir hata oluştu',
  message,
  onRetry,
  retryLabel = 'Tekrar Dene',
  showTimeout = false,
  className,
}: AdminErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="mb-4 p-4 rounded-full bg-red-100 dark:bg-red-900/20">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md mb-2">
        {message}
      </p>
      
      {showTimeout && (
        <p className="text-xs text-slate-500 dark:text-slate-500 mb-6">
          İstek zaman aşımına uğradı. Lütfen tekrar deneyin.
        </p>
      )}
      
      {onRetry && (
        <AdminButton onClick={onRetry} variant="primary" className="mt-4">
          {retryLabel}
        </AdminButton>
      )}
    </div>
  );
}
