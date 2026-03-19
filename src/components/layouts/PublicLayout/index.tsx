import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const CONTAINER_SIZES = {
  sm:   'max-w-2xl',
  md:   'max-w-4xl',
  lg:   'max-w-5xl',
  xl:   'max-w-7xl',
  full: 'max-w-none',
} as const

interface PublicLayoutProps {
  children: ReactNode
  containerSize?: keyof typeof CONTAINER_SIZES
  noContainer?: boolean
}

/**
 * PublicLayout - Public sayfa icerik wrapper'i.
 * Header/Footer zaten app/[lang]/layout.tsx tarafindan saglaniyor.
 * Bu component sadece icerik alani icin container ve padding saglar.
 */
export function PublicLayout({
  children,
  containerSize = 'xl',
  noContainer = false,
}: PublicLayoutProps) {
  return (
    <div className="flex-1">
      {noContainer ? (
        children
      ) : (
        <div className={cn(
          'mx-auto w-full px-4 py-8 sm:px-6 lg:px-8',
          CONTAINER_SIZES[containerSize]
        )}>
          {children}
        </div>
      )}
    </div>
  )
}
