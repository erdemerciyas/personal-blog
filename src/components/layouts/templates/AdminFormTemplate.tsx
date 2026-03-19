import type { ReactNode } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'

interface AdminFormTemplateProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  sidebar?: ReactNode
  className?: string
}

/**
 * Admin Form Şeması
 * PageHeader + 2-sütun grid (ana form + sidebar)
 * Kullanım: Admin yeni/düzenle sayfaları
 */
export function AdminFormTemplate({
  title,
  description,
  actions,
  children,
  sidebar,
  className,
}: AdminFormTemplateProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <PageHeader title={title} description={description} actions={actions} />

      {sidebar ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {children}
          </div>
          <aside className="space-y-6" aria-label="Ek ayarlar">
            {sidebar}
          </aside>
        </div>
      ) : (
        <div className="space-y-6">
          {children}
        </div>
      )}
    </div>
  )
}
