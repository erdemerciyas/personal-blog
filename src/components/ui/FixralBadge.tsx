import React from 'react';
import { clsx } from 'clsx';

export interface FixralBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  rounded?: 'sm' | 'md' | 'full';
  dot?: boolean;
  children: React.ReactNode;
}

const FixralBadge: React.FC<FixralBadgeProps> = ({
  variant = 'primary',
  size = 'md',
  rounded = 'md',
  dot = false,
  className,
  children,
  ...props
}) => {
  const base = 'inline-flex items-center gap-1 font-medium select-none align-middle';

  const radius = {
    sm: 'rounded-fixral',
    md: 'rounded-fixral-lg',
    full: 'rounded-full',
  }[rounded];

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }[size];

  const variants: Record<NonNullable<FixralBadgeProps['variant']>, string> = {
    primary: 'bg-brand-primary-100 text-brand-primary-800 border border-brand-primary-200',
    neutral: 'bg-slate-100 text-slate-800 border border-slate-200',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    outline: 'bg-transparent text-slate-800 border border-slate-300',
  };

  return (
    <span
      className={clsx(base, radius, sizes, variants[variant], 'transition-colors duration-200', className)}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className={clsx('h-1.5 w-1.5 rounded-full', {
            'bg-brand-primary-700': variant === 'primary',
            'bg-slate-500': variant === 'neutral' || variant === 'outline',
            'bg-emerald-600': variant === 'success',
            'bg-amber-600': variant === 'warning',
            'bg-red-600': variant === 'danger',
          })}
        />
      )}
      {children}
    </span>
  );
};

export default FixralBadge;
