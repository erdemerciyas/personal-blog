import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'article' | 'section' | 'li'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
  shadow?: 'none' | 'sm' | 'md'
}

export function Card({ as: Component = 'div', className, padding = 'md', border = true, shadow = 'sm', children, ...props }: CardProps) {
  return (
    <Component
      className={cn(
        'rounded-lg bg-surface-primary',
        border && 'border border-border',
        shadow === 'sm' && 'shadow-sm',
        shadow === 'md' && 'shadow-md',
        padding === 'sm' && 'p-4',
        padding === 'md' && 'p-6',
        padding === 'lg' && 'p-8',
        padding === 'none' && 'p-0',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex items-center justify-between', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props} />
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-4 flex items-center justify-end gap-3 border-t border-border pt-4', className)}
      {...props}
    />
  )
}
