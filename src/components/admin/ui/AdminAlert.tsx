'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type AdminAlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AdminAlertProps {
  variant?: AdminAlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export default function AdminAlert({
  variant = 'info',
  title,
  children,
  onClose,
}: AdminAlertProps) {
  const variantStyles = {
    success: {
      container: 'bg-admin-success-50 border-admin-success-200 dark:bg-admin-success-900/20 dark:border-admin-success-800',
      icon: 'text-admin-success-600 dark:text-admin-success-400',
      title: 'text-admin-success-900 dark:text-admin-success-100',
      text: 'text-admin-success-800 dark:text-admin-success-200',
      Icon: CheckCircleIcon,
    },
    error: {
      container: 'bg-admin-error-50 border-admin-error-200 dark:bg-admin-error-900/20 dark:border-admin-error-800',
      icon: 'text-admin-error-600 dark:text-admin-error-400',
      title: 'text-admin-error-900 dark:text-admin-error-100',
      text: 'text-admin-error-800 dark:text-admin-error-200',
      Icon: XCircleIcon,
    },
    warning: {
      container: 'bg-admin-warning-50 border-admin-warning-200 dark:bg-admin-warning-900/20 dark:border-admin-warning-800',
      icon: 'text-admin-warning-600 dark:text-admin-warning-400',
      title: 'text-admin-warning-900 dark:text-admin-warning-100',
      text: 'text-admin-warning-800 dark:text-admin-warning-200',
      Icon: ExclamationTriangleIcon,
    },
    info: {
      container: 'bg-admin-info-50 border-admin-info-200 dark:bg-admin-info-900/20 dark:border-admin-info-800',
      icon: 'text-admin-info-600 dark:text-admin-info-400',
      title: 'text-admin-info-900 dark:text-admin-info-100',
      text: 'text-admin-info-800 dark:text-admin-info-200',
      Icon: InformationCircleIcon,
    },
  };

  const styles = variantStyles[variant];
  const { Icon } = styles;

  return (
    <div className={cn('rounded-lg border p-4', styles.container)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', styles.icon)} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={cn('text-sm font-medium', styles.title)}>{title}</h3>
          )}
          <div className={cn('text-sm', title && 'mt-2', styles.text)}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={cn(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                styles.icon
              )}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
