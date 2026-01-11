import React from 'react';
import { clsx } from 'clsx';

interface FixralCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
}

const FixralCard: React.FC<FixralCardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md'
}) => {
  const baseClasses = 'rounded-fixral-lg transition-all duration-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-primary-600 focus-within:ring-offset-2';

  const variantClasses = {
    default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-fixral hover:shadow-fixral-lg dark:shadow-none',
    glass: 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/30 dark:border-white/10 shadow-fixral hover:bg-white/95 dark:hover:bg-slate-800/95',
    elevated: 'bg-white dark:bg-slate-800 shadow-fixral-lg hover:shadow-xl dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={clsx(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

export default FixralCard;