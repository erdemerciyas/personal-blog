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
  const baseClasses = 'rounded-fixral-lg transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-fixral hover:shadow-fixral-lg',
    glass: 'bg-white/90 backdrop-blur-sm border border-white/20 shadow-fixral hover:bg-white/95',
    elevated: 'bg-white shadow-fixral-lg hover:shadow-xl border border-gray-100'
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