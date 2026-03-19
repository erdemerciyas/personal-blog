import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 text-sm',
  {
    variants: {
      variant: {
        default: 'bg-surface-secondary border-border text-gray-700',
        success: 'bg-success-light border-success/30 text-success-dark',
        warning: 'bg-warning-light border-warning/30 text-warning-dark',
        danger:  'bg-danger-light  border-danger/30  text-danger-dark',
        info:    'bg-info-light    border-info/30    text-info-dark',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  icon?: ReactNode
}

export function Alert({ className, variant, title, icon, children, ...props }: AlertProps) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <div className="flex gap-3">
        {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
        <div className="space-y-1">
          {title && <p className="font-medium">{title}</p>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  )
}

export { alertVariants }
