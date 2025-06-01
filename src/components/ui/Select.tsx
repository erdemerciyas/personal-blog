'use client';

import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dark';
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seçiniz...',
  className = '',
  disabled = false,
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm', 
    lg: 'px-4 py-3 text-base'
  };

  const variantClasses = {
    default: 'bg-white border-slate-300 text-slate-700 focus:border-teal-500 focus:ring-teal-500',
    dark: 'bg-slate-800 border-slate-600 text-white focus:border-teal-500 focus:ring-teal-500'
  };

  const baseClasses = `
    relative w-full rounded-xl border appearance-none cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    transition-all duration-200
    disabled:cursor-not-allowed disabled:opacity-50
    pr-10
  `;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        style={{
          backgroundImage: 'none' // Remove default arrow
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Custom arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDownIcon 
          className={`w-4 h-4 ${
            variant === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`} 
        />
      </div>
    </div>
  );
};

export default Select; 