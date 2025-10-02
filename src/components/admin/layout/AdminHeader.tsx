'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  Bars3Icon, 
  MoonIcon, 
  SunIcon, 
  GlobeAltIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useAdminTheme } from '@/hooks/useAdminTheme';
import { Breadcrumb } from './AdminLayoutNew';
import { NotificationBell } from '../NotificationBell';

interface AdminHeaderProps {
  title?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  onMenuClick: () => void;
}

export default function AdminHeader({
  title,
  breadcrumbs,
  actions,
  onMenuClick,
}: AdminHeaderProps) {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useAdminTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <header className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-lg border-b border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-3 rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Bars3Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Welcome Message */}
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {title || 'Admin Panel'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hoş geldiniz, {session?.user?.name || 'Admin'}
              </p>
            </div>
          </div>

          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="hidden lg:flex items-center space-x-2 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm rounded-lg px-3 py-2">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {index > 0 && (
                    <span className="text-slate-400 dark:text-slate-500 mx-1">•</span>
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-sm font-medium text-slate-600 hover:text-brand-primary-700 dark:text-slate-400 dark:hover:text-brand-primary-400 transition-colors px-2 py-1 rounded hover:bg-white/50 dark:hover:bg-slate-700/50"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 px-2 py-1 bg-brand-primary-50 dark:bg-brand-primary-900/30 text-brand-primary-800 dark:text-brand-primary-300 rounded">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Custom Actions */}
            {actions}

            {/* Notifications Bell */}
            <NotificationBell />

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md group"
              title={theme === 'dark' ? "Light Mode'a geç" : "Dark Mode'a geç"}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5 text-amber-500 group-hover:text-amber-600 transition-colors" />
              ) : (
                <MoonIcon className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              )}
            </button>

            {/* View Site */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-primary-600 to-cyan-600 hover:from-brand-primary-700 hover:to-cyan-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <GlobeAltIcon className="w-4 h-4" />
              <span>Siteyi Görüntüle</span>
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary-600 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {session?.user?.name || 'Admin'}
                </span>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 animate-slide-down">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {session?.user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {session?.user?.email || 'admin@example.com'}
                    </p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/admin/profile"
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      <span>Profil</span>
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Cog6ToothIcon className="w-5 h-5" />
                      <span>Ayarlar</span>
                    </Link>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 py-2">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
