import type { ReactNode } from 'react'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { cn } from '@/lib/utils'

interface PublicDetailTemplateProps {
  title: string
  meta?: ReactNode
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  sidebar?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Public Detay Şeması
 * PublicLayout container + <article> + prose content + opsiyonel sidebar
 * Kullanım: Haber detay, portfolio detay, ürün detay
 */
export function PublicDetailTemplate({
  title,
  meta,
  containerSize = 'lg',
  sidebar,
  children,
  className,
}: PublicDetailTemplateProps) {
  return (
    <PublicLayout containerSize={containerSize}>
      {sidebar ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <article className={cn('lg:col-span-2', className)}>
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">{title}</h1>
              {meta && <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">{meta}</div>}
            </header>
            <div className="prose prose-lg max-w-none">
              {children}
            </div>
          </article>
          <aside className="space-y-6" aria-label="İlgili içerik">
            {sidebar}
          </aside>
        </div>
      ) : (
        <article className={className}>
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">{title}</h1>
            {meta && <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">{meta}</div>}
          </header>
          <div className="prose prose-lg max-w-none">
            {children}
          </div>
        </article>
      )}
    </PublicLayout>
  )
}
