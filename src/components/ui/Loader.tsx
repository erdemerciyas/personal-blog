import React from 'react';
import clsx from 'clsx';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  className?: string;
  children?: React.ReactNode; // Add children prop
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', color = 'primary', className, children }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-2',
    lg: 'h-8 w-8 border-2',
    xl: 'h-12 w-12 border-4',
  };

  const colorClasses = {
    primary: 'border-teal-500 border-t-transparent',
    secondary: 'border-blue-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    current: 'border-current border-t-transparent',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full',
          sizeClasses[size],
          colorClasses[color],
        )}
      ></div>
      {children && <div className="mt-2 text-slate-600 text-sm">{children}</div>}
    </div>
  );
};

export default Loader;