'use client'

import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'
import { cn } from '@/lib/utils'
import type { AdminLayoutProps, NavItem } from './types'

interface Props extends AdminLayoutProps {
  navItems: NavItem[]
  logo?: string
}

export function AdminLayout({
  children,
  title,
  description,
  breadcrumbs,
  actions,
  fullWidth = false,
  navItems,
  logo,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-tertiary">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(prev => !prev)}
        navItems={navItems}
        logo={logo}
      />

      {/* Main content area */}
      <div className={cn(
        'flex flex-1 flex-col overflow-hidden transition-all duration-base',
        collapsed ? 'lg:ml-16' : 'lg:ml-64'
      )}>
        {/* Topbar */}
        <AdminTopbar
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={actions}
          onMenuToggle={() => setCollapsed(prev => !prev)}
        />

        {/* Page content */}
        <main
          id="admin-main-content"
          className={cn(
            'flex-1 overflow-y-auto',
            fullWidth ? 'p-0' : 'p-6'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export type { AdminLayoutProps, NavItem, BreadcrumbItem } from './types'
