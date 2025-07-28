import React from 'react';
import { clsx } from 'clsx';

interface FixralSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

const FixralSelect: React.FC<FixralSelectProps> = ({
  label,
  error,
  helperText,
  options,
  className,
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label-text">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'select-field',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/25',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 font-sans">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-fixral-charcoal/70 font-sans">{helperText}</p>
      )}
    </div>
  );
};

export default FixralSelect;