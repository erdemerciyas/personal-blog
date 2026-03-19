import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <fieldset
      className={cn(
        'rounded-lg border border-border bg-surface-primary p-6 shadow-sm',
        className
      )}
    >
      <legend className="px-2 text-lg font-semibold text-gray-900">{title}</legend>
      {description && <p className="-mt-2 mb-4 text-sm text-gray-500">{description}</p>}
      <div className="space-y-4">{children}</div>
    </fieldset>
  )
}
