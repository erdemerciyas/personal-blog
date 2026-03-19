import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-surface-tertiary text-gray-700',
        primary:  'bg-brand-50 text-brand-700 border border-brand-200',
        success:  'bg-success-light text-success-dark border border-success/20',
        warning:  'bg-warning-light text-warning-dark border border-warning/20',
        danger:   'bg-danger-light text-danger-dark border border-danger/20',
        info:     'bg-info-light text-info-dark border border-info/20',
        outline:  'border border-border text-gray-700 bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
