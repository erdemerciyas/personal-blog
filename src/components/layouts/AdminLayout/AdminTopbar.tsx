import { AdminBreadcrumb } from './AdminBreadcrumb'
import type { AdminLayoutProps } from './types'

type TopbarProps = Pick<AdminLayoutProps, 'title' | 'description' | 'breadcrumbs' | 'actions'> & {
  onMenuToggle: () => void
}

export function AdminTopbar({ title, description, breadcrumbs, actions, onMenuToggle }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border bg-surface-primary px-6">
      {/* Skip to main content */}
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-modal focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Ana iceriye gec
      </a>

      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="mr-4 rounded-md p-1.5 text-gray-500 hover:bg-surface-secondary hover:text-gray-900 transition-colors lg:hidden"
        aria-label="Menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Left: breadcrumb or title */}
      <div className="flex flex-1 flex-col justify-center">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <>
            <AdminBreadcrumb items={breadcrumbs} />
            <h1 className="text-sm font-semibold text-gray-900 leading-tight">{title}</h1>
          </>
        ) : (
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>

      {/* Right: actions */}
      {actions && (
        <div className="flex items-center gap-3" role="toolbar" aria-label="Sayfa aksiyonlari">
          {actions}
        </div>
      )}
    </header>
  )
}
