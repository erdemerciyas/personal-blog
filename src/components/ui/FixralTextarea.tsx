import React from 'react';
import { clsx } from 'clsx';

interface FixralTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const FixralTextarea: React.FC<FixralTextareaProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="label-text">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={clsx(
          'textarea-field',
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

export default FixralTextarea;