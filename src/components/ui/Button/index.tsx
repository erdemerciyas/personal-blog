import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:   'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700',
        secondary: 'bg-surface-secondary text-gray-900 border border-border hover:bg-surface-tertiary',
        ghost:     'hover:bg-surface-secondary text-gray-700 hover:text-gray-900',
        danger:    'bg-danger text-white hover:bg-danger-dark',
        outline:   'border border-brand-600 text-brand-600 hover:bg-brand-50',
        link:      'text-brand-600 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs:   'h-7  px-2.5 text-xs',
        sm:   'h-8  px-3   text-sm',
        md:   'h-10 px-4   text-sm',
        lg:   'h-11 px-5   text-base',
        xl:   'h-12 px-6   text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export { buttonVariants }
