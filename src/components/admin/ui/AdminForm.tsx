'use client';

import React, { FormHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import AdminButton from './AdminButton';

export interface FormError {
  [key: string]: string;
}

export interface AdminFormProps extends FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  subtitle?: string;
  errors?: FormError;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  showButtons?: boolean;
}

export default function AdminForm({
  title,
  subtitle,
  errors,
  loading = false,
  submitLabel = 'Kaydet',
  cancelLabel = 'İptal',
  onCancel,
  showButtons = true,
  className,
  children,
  ...props
}: AdminFormProps) {
  return (
    <form
      className={cn('space-y-6', className)}
      {...props}
    >
      {(title || subtitle) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
      
      {showButtons && (
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          {onCancel && (
            <AdminButton
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </AdminButton>
          )}
          <AdminButton
            type="submit"
            variant="primary"
            loading={loading}
          >
            {submitLabel}
          </AdminButton>
        </div>
      )}
    </form>
  );
}
