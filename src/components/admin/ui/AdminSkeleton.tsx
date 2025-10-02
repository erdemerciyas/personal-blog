'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type AdminSkeletonVariant = 'text' | 'card' | 'table' | 'circle';

export interface AdminSkeletonProps {
  variant?: AdminSkeletonVariant;
  count?: number;
  className?: string;
}

export default function AdminSkeleton({
  variant = 'text',
  count = 1,
  className,
}: AdminSkeletonProps) {
  const baseStyles = 'animate-pulse bg-slate-200 dark:bg-slate-700 rounded';

  const variantStyles = {
    text: 'h-4 w-full',
    card: 'h-32 w-full',
    table: 'h-12 w-full',
    circle: 'h-12 w-12 rounded-full',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(baseStyles, variantStyles[variant], className)}
        />
      ))}
    </>
  );
}
