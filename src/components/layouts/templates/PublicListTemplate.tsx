import type { ReactNode } from 'react'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { cn } from '@/lib/utils'

interface PublicListTemplateProps {
  title: string
  description?: string
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  filters?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Public Liste Şeması
 * PublicLayout container + başlık + grid (<ul> + Card as="article")
 * Kullanım: Haberler, portfolio, ürünler liste sayfaları
 */
export function PublicListTemplate({
  title,
  description,
  containerSize = 'xl',
  filters,
  children,
  className,
}: PublicListTemplateProps) {
  return (
    <PublicLayout containerSize={containerSize}>
      <div className={cn('space-y-8', className)}>
        <header>
          <hgroup>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-2 text-lg text-gray-600">{description}</p>
            )}
          </hgroup>
        </header>

        {filters && (
          <section aria-label="Filtreler" className="flex flex-wrap items-center gap-3">
            {filters}
          </section>
        )}

        <section aria-label={`${title} listesi`}>
          {children}
        </section>
      </div>
    </PublicLayout>
  )
}
