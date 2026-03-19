'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { NavItem } from './types'

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
  navItems: NavItem[]
  logo?: string
}

export function AdminSidebar({ collapsed, onToggle, navItems, logo = 'Admin' }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-sticky flex flex-col border-r border-border bg-surface-primary transition-all duration-base',
        collapsed ? 'w-16' : 'w-64',
        'hidden lg:flex'
      )}
      aria-label="Admin navigasyon"
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        {!collapsed && (
          <span className="text-lg font-semibold text-gray-900">{logo}</span>
        )}
        <button
          onClick={onToggle}
          className="ml-auto rounded-md p-1.5 text-gray-500 hover:bg-surface-secondary hover:text-gray-900 transition-colors"
          aria-label={collapsed ? 'Menuyu genislet' : 'Menuyu daralt'}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Ana admin menu">
        <ul className="space-y-0.5 px-2">
          {navItems.map(item => (
            <SidebarNavItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </ul>
      </nav>
    </aside>
  )
}

function SidebarNavItem({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem
  collapsed: boolean
  pathname: string
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  const hasChildren = item.children && item.children.length > 0
  const [open, setOpen] = useState(isActive)

  if (hasChildren && !collapsed) {
    return (
      <li>
        <button
          onClick={() => setOpen(prev => !prev)}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-brand-50 text-brand-700'
              : 'text-gray-600 hover:bg-surface-secondary hover:text-gray-900'
          )}
          aria-expanded={open}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <svg
            className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {open && (
          <ul className="mt-0.5 space-y-0.5 pl-9">
            {item.children!.map(child => (
              <li key={child.id}>
                <Link
                  href={child.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                    pathname === child.href
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-gray-600 hover:bg-surface-secondary hover:text-gray-900'
                  )}
                >
                  <child.icon className="h-3.5 w-3.5 shrink-0" />
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <li>
      <Link
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          collapsed && 'justify-center',
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-gray-600 hover:bg-surface-secondary hover:text-gray-900'
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto rounded-full bg-brand-500 px-2 py-0.5 text-xs text-white">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  )
}
