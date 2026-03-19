import type { ReactNode } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'

interface AdminListTemplateProps {
  title: string
  description?: string
  actions?: ReactNode
  filters?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Admin Liste Şeması
 * PageHeader + opsiyonel filtre alanı + DataTable/içerik
 * Kullanım: Admin haberler, portfolio, ürünler liste sayfaları
 */
export function AdminListTemplate({
  title,
  description,
  actions,
  filters,
  children,
  className,
}: AdminListTemplateProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <PageHeader title={title} description={description} actions={actions} />

      {filters && (
        <section aria-label="Filtreler" className="flex flex-wrap items-center gap-3">
          {filters}
        </section>
      )}

      <section aria-label={`${title} listesi`}>
        {children}
      </section>
    </div>
  )
}
