import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  header: string
  width?: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T extends { _id?: string; id?: string }> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyText?: string
  onRowClick?: (row: T) => void
  className?: string
}

export function DataTable<T extends { _id?: string; id?: string }>({
  columns, data, loading, emptyText = 'Kayit bulunamadi', onRowClick, className
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-surface-tertiary" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border', className)}>
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-secondary">
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface-primary">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || row.id || i}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-surface-secondary'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(col => (
                  <td key={String(col.key)} className="px-4 py-3 text-sm text-gray-700">
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
