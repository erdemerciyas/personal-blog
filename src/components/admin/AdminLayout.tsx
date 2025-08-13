'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
// Simple loading placeholder component (kept for potential future use)
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  FolderOpenIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  DocumentTextIcon,
  // TagIcon,
  UserIcon,
  UsersIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  ChevronDownIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
  subItems?: Array<{ label: string; href: string }>;
}

interface SiteSettings {
  siteName: string;
  logo: {
    url: string;
    alt: string;
  };
}

export default function AdminLayout({ children, title, breadcrumbs }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [stats, setStats] = useState({
    messagesCount: 0,
    portfolioCount: 0,
    mediaCount: 0,
    usersCount: 0,
    productsCount: 0
  });
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; time: string; type: string }>>([]);

  // Menu items
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      href: '/admin/dashboard'
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
        { label: 'Slider', href: '/admin/slider' }
      ]
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
        { label: 'Ürün Yorumları', href: '/admin/products/reviews' },
        { label: 'Ürün Medyası', href: '/admin/products/media' }
      ]
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: FolderOpenIcon,
      href: '/admin/portfolio',
      badge: stats.portfolioCount,
      subItems: [
        { label: 'Tüm Projeler', href: '/admin/portfolio' },
        { label: 'Yeni Proje Ekle', href: '/admin/portfolio/new' },
        { label: 'Kategoriler', href: '/admin/portfolio?tab=categories' }
      ]
    },
    {
      id: 'media',
      label: 'Medya Kütüphanesi',
      icon: PhotoIcon,
      href: '/admin/media',
      badge: stats.mediaCount
    },
    {
      id: 'messages',
      label: 'Mesajlar',
      icon: ChatBubbleLeftRightIcon,
      href: '/admin/messages',
      badge: stats.messagesCount
    },
    {
      id: 'users',
      label: 'Kullanıcı Yönetimi',
      icon: UsersIcon,
      href: '/admin/users',
      badge: (stats as { usersCount: number }).usersCount
    },
    {
      id: 'contact',
      label: 'İletişim',
      icon: PhoneIcon,
      href: '/admin/contact'
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: CogIcon,
      href: '/admin/settings',
      subItems: [
        { label: 'Genel Ayarlar', href: '/admin/settings' },
        { label: 'Footer Ayarları', href: '/admin/footer' }
      ]
    },
    {
      id: 'editor',
      label: 'Universal Editor',
      icon: WrenchScrewdriverIcon,
      href: '/admin/editor'
    }
  ];

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Dark mode initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Dark mode toggle handler
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  };

  // Fetch site settings
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/admin/site-settings');
        if (response.ok) {
          const data = await response.json();
          setSiteSettings(data);
        }
      } catch (error) {
        console.error('Site settings fetch error:', error);
      }
    };

    if (status === 'authenticated') {
      fetchSiteSettings();
    }
  }, [status]);

  // Fetch stats and notifications
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await fetch('/api/admin/dashboard-stats');

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            messagesCount: statsData.messagesCount || 0,
            portfolioCount: statsData.portfolioCount || 0,
            mediaCount: statsData.mediaCount || 0,
            usersCount: statsData.usersCount || 0,
            productsCount: statsData.productsCount || 0
          });

          // Convert recent messages to notifications
          const recentMessages = statsData.recentMessages || [];
          const unreadMessages = recentMessages.filter((message: { status?: string }) => message.status === 'pending' || message.status === 'new');

          setStats(prev => ({
            ...prev,
            messagesCount: unreadMessages.length
          }));
        } else {
          // Fallback to old method if dashboard-stats fails
          const [messagesRes, portfolioRes, mediaRes] = await Promise.all([
            fetch('/api/messages'),
            fetch('/api/portfolio'),
            fetch('/api/admin/media')
          ]);

          const messagesData = messagesRes.ok ? await messagesRes.json() : [];
          const portfolioData = portfolioRes.ok ? await portfolioRes.json() : [];
          const mediaData = mediaRes.ok ? await mediaRes.json() : [];

          const unreadMessages = Array.isArray(messagesData) && messagesData.length > 0
            ? messagesData.filter((message: { isRead?: boolean; status?: string }) => !message.isRead || message.status === 'new')
            : [];

          setStats({
            messagesCount: unreadMessages.length || 0,
            portfolioCount: portfolioData.length || 0,
            mediaCount: mediaData.length || 0,
            usersCount: 0,
            productsCount: 0
          });

          const recentNotifications = messagesData && messagesData.length > 0
            ? messagesData.filter((msg: { status?: string }) => msg.status === 'pending' || !msg.status).slice(0, 5).map((message: { _id: string; name?: string; message?: string; createdAt: string }) => ({
              title: `${message.name || 'Anonim'} adlı kişiden yeni mesaj`,
              message: message.message ? message.message.substring(0, 50) + '...' : 'Mesaj içeriği yok',
              time: new Date(message.createdAt || Date.now()).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }),
              type: 'message',
              id: message._id || Math.random().toString(),
              isUnread: true
            }))
            : [];

          setNotifications(recentNotifications);
          console.log('📊 Notifications loaded:', recentNotifications.length, 'total messages:', messagesData?.length || 0);
        }


      } catch (error) {
        console.error('Stats fetch error:', error);
      }
    };

    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown') && notificationDropdownOpen) {
        setNotificationDropdownOpen(false);
      }
      if (!target.closest('.profile-dropdown') && profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationDropdownOpen, profileDropdownOpen]);

  // Mark message as read and refresh notifications
  const markMessageAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isRead: true,
          status: 'read'
        }),
      });

      if (response.ok) {
        // Notifications'ı yenile
        const updatedNotifications = notifications.filter(n => n.id !== messageId);
        setNotifications(updatedNotifications);

        // Stats'ı güncelle
        setStats(prev => ({
          ...prev,
          messagesCount: Math.max(0, prev.messagesCount - 1)
        }));
      }
    } catch (error) {
      console.error('Mesaj okundu işaretlenirken hata:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  const isActiveRoute = (href: string) => {
    const safePathname = pathname || '';
    // Query parametreli linkler için özel kontrol
    if (href.includes('?')) {
      const [basePath, queryString] = href.split('?');
      const currentUrl = typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : safePathname;
      return currentUrl === href || (safePathname === basePath && (currentUrl || '').includes(queryString));
    }
    return safePathname === href || safePathname.startsWith(href + '/');
  };

  const hasActiveSubItem = (subItems?: Array<{ href: string }>) => {
    if (!subItems) return false;
    return subItems.some(item => isActiveRoute(item.href));
  };

  if (status === 'loading') {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-slate-800 shadow-2xl transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex h-full flex-col">
          {/* Logo only (no text) */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-4' : 'justify-between px-6'} py-4 border-b border-slate-200 dark:border-slate-700`}>
            <Link href="/admin/dashboard" className="flex items-center">
              {siteSettings?.logo?.url ? (
                <Image
                  src={siteSettings.logo.url}
                  alt={siteSettings.logo.alt || 'Logo'}
                  width={sidebarCollapsed ? 36 : 120}
                  height={sidebarCollapsed ? 36 : 36}
                  className={`${sidebarCollapsed ? 'h-9 w-auto' : 'h-9 w-auto'} object-contain`}
                  priority
                />
              ) : (
                <div className="w-9 h-9 bg-slate-200 dark:bg-slate-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
              )}
              <span className="sr-only">Admin Panel</span>
            </Link>

            {/* Collapse Button (Desktop) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              )}
            </button>

            {/* Close Button (Mobile) */}
            <button
              onClick={() => setSidebarOpen(false)}
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
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-xl transition-all duration-200 group ${isActive || hasActiveSub
                      ? 'bg-brand-primary-50 text-brand-primary-800 shadow-sm dark:bg-brand-primary-900/50 dark:text-brand-primary-300'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className={`w-5 h-5 ${isActive || hasActiveSub ? 'text-brand-primary-700 dark:text-brand-primary-400' : 'text-slate-500 dark:text-slate-400'}`} />
                      {!sidebarCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </div>

                    {!sidebarCollapsed && item.badge && (
                      <span className="px-2 py-1 text-xs bg-brand-primary-100 text-brand-primary-800 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Sub Items */}
                  {!sidebarCollapsed && item.subItems && (hasActiveSub || isActive) && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${isActiveRoute(subItem.href)
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
            <div className="relative profile-dropdown">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-brand-primary-600 to-cyan-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {session?.user?.name || 'Admin'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Yönetici</p>
                    </div>
                    <ChevronDownIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </>
                )}
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && !sidebarCollapsed && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-[99999] ring-1 ring-black ring-opacity-5">
                  <Link
                    href="/admin/settings"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <CogIcon className="w-4 h-4" />
                    <span>Ayarlar</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 w-full text-left"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Top Bar */}
        <header className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-lg border-b border-slate-200/60 dark:border-slate-700/60 flex-shrink-0 backdrop-blur-sm relative z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Mobile Menu Button & Left Section */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-3 rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Bars3Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>

                {/* Hide topbar welcome text to emphasize logo-only look */}
                <div className="hidden md:block" aria-hidden="true"></div>
              </div>

              {/* Breadcrumbs */}
              <div className="flex items-center space-x-4">
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav className="flex items-center space-x-2 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm rounded-lg px-3 py-2">
                    {breadcrumbs.map((crumb, index) => (
                      <div key={`${crumb.label}-${crumb.href || index}`} className="flex items-center space-x-2">
                        {index > 0 && <span key={`separator-${index}`} className="text-slate-400 dark:text-slate-500 mx-1">•</span>}
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
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-3">
                {/* Notification Button */}
                <div className="relative notification-dropdown">
                  <button
                    onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                    className="relative p-3 rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    <BellIcon className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-brand-primary-700 dark:group-hover:text-brand-primary-400 transition-colors" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-md animate-pulse">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notificationDropdownOpen && typeof window !== 'undefined' &&
                    createPortal(
                      <div
                        className="fixed top-16 right-4 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 ring-1 ring-black ring-opacity-5"
                        style={{ zIndex: 999999 }}
                      >
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Bildirimler
                          </h3>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Yeni mesaj yok
                              </p>
                            </div>
                          ) : (
                            notifications.map((notification, index) => (
                              <div
                                key={index}
                                className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                                onClick={() => {
                                  if (notification.type === 'message') {
                                    // Dropdown'ı kapat
                                    setNotificationDropdownOpen(false);
                                    // Mesaj sayfasına git
                                    router.push(`/admin/messages?id=${notification.id}`);
                                    // Mesajı okundu olarak işaretle (arka planda)
                                    markMessageAsRead(notification.id);
                                  }
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-2 h-2 bg-brand-primary-600 rounded-full mt-2"></div>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                      {notification.time}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => {
                              router.push('/admin/messages');
                              setNotificationDropdownOpen(false);
                            }}
                            className="w-full text-sm text-brand-primary-700 dark:text-brand-primary-400 hover:text-brand-primary-800 dark:hover:text-brand-primary-300 font-medium"
                          >
                            Tüm Mesajları Görüntüle
                          </button>
                        </div>
                      </div>,
                      document.body
                    )
                  }
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-3 rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md group"
                  title={darkMode ? 'Light Mode\'a geç' : 'Dark Mode\'a geç'}
                >
                  {darkMode ? (
                    <SunIcon className="w-5 h-5 text-amber-500 group-hover:text-amber-600 transition-colors" />
                  ) : (
                    <MoonIcon className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  )}
                </button>

                {/* View Site Button */}
                <Link
                  href="/"
                  target="_blank"
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-primary-600 to-cyan-600 hover:from-brand-primary-700 hover:to-cyan-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <span className="flex items-center space-x-2">
                    <span>Siteyi Görüntüle</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          {title && (
            <div className="px-4 sm:px-6 lg:px-8 py-8 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-white via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {title}
                  </h1>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    {new Date().toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="hidden lg:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-primary-700 dark:text-brand-primary-400">
                      {stats.portfolioCount}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Projeler</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.productsCount}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Ürünler</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.mediaCount}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Medya</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {stats.messagesCount}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Mesajlar</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
