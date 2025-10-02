'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  FolderOpenIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  DocumentTextIcon,
  UserIcon,
  UsersIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import AdminBadge from '../ui/AdminBadge';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
  subItems?: Array<{ label: string; href: string }>;
}

interface AdminSidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      href: '/admin/dashboard',
    },
    {
      id: 'content',
      label: 'İçerik Yönetimi',
      icon: DocumentTextIcon,
      href: '/admin/content',
      subItems: [
        { label: 'Hakkımda', href: '/admin/about' },
        { label: 'Hizmetler', href: '/admin/services' },
        { label: 'Sayfa Yönetimi', href: '/admin/pages' },
        { label: 'Slider', href: '/admin/slider' },
      ],
    },
    {
      id: 'products',
      label: 'Ürün Yönetimi',
      icon: FolderOpenIcon,
      href: '/admin/products',
      subItems: [
        { label: 'Tüm Ürünler', href: '/admin/products' },
        { label: 'Yeni Ürün Ekle', href: '/admin/products/new' },
        { label: 'Ürün Kategorileri', href: '/admin/product-categories' },
      ],
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: FolderOpenIcon,
      href: '/admin/portfolio',
    },
    {
      id: 'videos',
      label: 'Video Yönetimi',
      icon: PhotoIcon,
      href: '/admin/videos',
    },
    {
      id: 'media',
      label: 'Medya Kütüphanesi',
      icon: PhotoIcon,
      href: '/admin/media',
    },
    {
      id: 'messages',
      label: 'Mesajlar',
      icon: ChatBubbleLeftRightIcon,
      href: '/admin/messages',
    },
    {
      id: 'users',
      label: 'Kullanıcı Yönetimi',
      icon: UsersIcon,
      href: '/admin/users',
    },
    {
      id: 'contact',
      label: 'İletişim',
      icon: PhoneIcon,
      href: '/admin/contact',
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: CogIcon,
      href: '/admin/settings',
      subItems: [
        { label: 'Genel Ayarlar', href: '/admin/settings' },
        { label: 'Footer Ayarları', href: '/admin/footer' },
      ],
    },
  ];

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const hasActiveSubItem = (subItems?: Array<{ href: string }>) => {
    if (!subItems) return false;
    return subItems.some((item) => isActiveRoute(item.href));
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 ${
        isCollapsed ? 'w-20' : 'w-72'
      } bg-white dark:bg-slate-800 shadow-2xl transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center px-4' : 'justify-between px-6'
          } py-4 border-b border-slate-200 dark:border-slate-700`}
        >
          {!isCollapsed && (
            <Link href="/admin/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Admin Panel
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Yönetim Paneli</p>
              </div>
            </Link>
          )}

          {/* Collapse Button (Desktop) */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            )}
          </button>

          {/* Close Button (Mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            const hasActiveSub = hasActiveSubItem(item.subItems);

            return (
              <div key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } px-3 py-2 rounded-xl transition-all duration-200 group ${
                    isActive || hasActiveSub
                      ? 'bg-brand-primary-50 text-brand-primary-800 shadow-sm dark:bg-brand-primary-900/50 dark:text-brand-primary-300'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive || hasActiveSub
                          ? 'text-brand-primary-700 dark:text-brand-primary-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <AdminBadge variant="info" size="sm">
                      {item.badge}
                    </AdminBadge>
                  )}
                </Link>

                {/* Sub Items */}
                {!isCollapsed && item.subItems && (hasActiveSub || isActive) && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                          isActiveRoute(subItem.href)
                            ? 'bg-brand-primary-50 text-brand-primary-800 dark:bg-brand-primary-900/50 dark:text-brand-primary-300'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="relative">
            <div
              className={`flex items-center w-full ${
                isCollapsed ? 'justify-center' : 'space-x-3'
              } p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-brand-primary-600 to-cyan-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {session?.user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Yönetici</p>
                  </div>
                  <button
                    onClick={() => signOut({ redirect: false }).then(() => window.location.href = '/admin/login')}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    title="Çıkış Yap"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
