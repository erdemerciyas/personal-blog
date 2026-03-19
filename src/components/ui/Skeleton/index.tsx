import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rect'
  lines?: number
}

export function DSkeleton({ className, variant = 'rect', lines = 1, ...props }: SkeletonProps) {
  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 animate-pulse rounded bg-surface-tertiary',
              i === lines - 1 && lines > 1 && 'w-4/5',
              className
            )}
          />
        ))}
      </div>
    )
  }
  if (variant === 'circle') {
    return <div className={cn('animate-pulse rounded-full bg-surface-tertiary', className)} {...props} />
  }
  return <div className={cn('animate-pulse rounded-lg bg-surface-tertiary', className)} {...props} />
}
