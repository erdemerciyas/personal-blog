import React from 'react';
import { clsx } from 'clsx';

interface FixralButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-fixral transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-80 disabled:cursor-not-allowed disabled:!bg-slate-200 disabled:!text-slate-600 disabled:border disabled:border-slate-300 disabled:shadow-none';
  
  const variantClasses = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300',
    secondary: 'bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-300',
    outline: 'bg-transparent border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white focus:ring-emerald-300',
    ghost: 'bg-transparent text-slate-700 hover:text-emerald-700 hover:bg-slate-100 focus:ring-emerald-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
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
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default FixralButton;