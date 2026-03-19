import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6 flex items-start justify-between gap-4', className)}>
      <hgroup>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </hgroup>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </header>
  )
}
