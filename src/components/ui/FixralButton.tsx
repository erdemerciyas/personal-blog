import React from 'react';
import { clsx } from 'clsx';

interface FixralButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  loading?: boolean;
}

const FixralButton: React.FC<FixralButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-fixral transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-80 disabled:cursor-not-allowed disabled:!bg-slate-200 disabled:!text-slate-600 disabled:border disabled:border-slate-300 disabled:shadow-none';
  
  // Aria label for loading state
  const ariaLabel = loading ? `${props['aria-label'] || 'İşlem'} yükleniyor` : props['aria-label'];
  
  const variantClasses = {
    primary: 'bg-brand-primary-900 text-white hover:bg-brand-primary-800 focus-visible:ring-brand-primary-600',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900 focus-visible:ring-slate-500',
    outline: 'bg-transparent border-2 border-brand-primary-700 text-brand-primary-800 hover:bg-brand-primary-700 hover:text-white focus-visible:ring-brand-primary-600',
    ghost: 'bg-transparent text-slate-700 hover:text-brand-primary-800 hover:bg-slate-100 focus-visible:ring-brand-primary-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-label={ariaLabel}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default FixralButton;