'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Breadcrumb } from './AdminLayoutNew';

interface AdminBreadcrumbsProps {
  items: Breadcrumb[];
}

export default function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && (
            <ChevronRightIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-sm font-medium text-slate-600 hover:text-brand-primary-700 dark:text-slate-400 dark:hover:text-brand-primary-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
