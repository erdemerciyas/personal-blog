'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AdminThemeProvider } from '@/contexts/AdminThemeContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface AdminLayoutNewProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export default function AdminLayoutNew({
  children,
  title,
  breadcrumbs,
  actions,
}: AdminLayoutNewProps) {
  const { status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-700 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
          }`}
        >
          {/* Header */}
          <AdminHeader
            title={title}
            breadcrumbs={breadcrumbs}
            actions={actions}
            onMenuClick={() => setSidebarOpen(true)}
          />

          {/* Content */}
          <main className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </AdminThemeProvider>
  );
}
