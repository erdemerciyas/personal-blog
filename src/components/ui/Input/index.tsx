import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

const inputVariants = cva(
  'flex w-full rounded-md border bg-surface-primary px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      state: {
        default: 'border-border hover:border-border-strong',
        error:   'border-danger focus-visible:ring-danger',
        success: 'border-success focus-visible:ring-success',
      },
      inputSize: {
        sm: 'h-8  text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: { state: 'default', inputSize: 'md' },
  }
)

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, state, inputSize, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const resolvedState = error ? 'error' : state
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ state: resolvedState, inputSize }),
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p id={`${inputId}-error`} className="text-xs text-danger">{error}</p>}
        {hint && !error && <p id={`${inputId}-hint`} className="text-xs text-gray-500">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { inputVariants }
