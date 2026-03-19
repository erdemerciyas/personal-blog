import Link from 'next/link'
import type { BreadcrumbItem } from './types'

export function AdminBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-xs text-gray-500">
        <li>
          <Link href="/admin" className="hover:text-gray-900 transition-colors">
            Admin
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-gray-900 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
