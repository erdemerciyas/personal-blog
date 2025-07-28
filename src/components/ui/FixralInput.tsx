import React from 'react';
import { clsx } from 'clsx';

interface FixralInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const FixralInput: React.FC<FixralInputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label-text">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'input-field',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/25',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 font-sans">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-fixral-charcoal/70 font-sans">{helperText}</p>
      )}
    </div>
  );
};

export default FixralInput;