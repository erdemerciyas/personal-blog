import type { ReactNode, ComponentType } from 'react'

export interface NavItem {
  id: string
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  badge?: string | number
  children?: NavItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface AdminLayoutProps {
  children: ReactNode
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  fullWidth?: boolean
}
