'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  DocumentTextIcon,
  PhotoIcon,
  CubeIcon,
  CogIcon,
  PaintBrushIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  UserGroupIcon,
  VideoCameraIcon,
  TagIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  ArchiveBoxIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
  UserCircleIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';

const navigation = [
  { name: 'Kontrol Paneli', href: '/admin/dashboard', icon: HomeIcon },
  {
    name: 'İçerik Yönetimi',
    icon: DocumentTextIcon,
    children: [
      { name: 'Haberler', href: '/admin/news' },
      { name: 'Sayfalar', href: '/admin/pages' },
      { name: 'Hizmetler', href: '/admin/services' },
    ]
  },
  {
    name: 'Ürün Yönetimi',
    icon: ShoppingBagIcon,
    children: [
      { name: 'Tüm Ürünler', href: '/admin/products' },
      { name: 'Yeni Ekle', href: '/admin/products/new' },
      { name: 'Kategoriler', href: '/admin/product-categories' },
      { name: 'Yorumlar', href: '/admin/product-reviews' },
      { name: 'Ürün Medyası', href: '/admin/product-media' },
      { name: 'Ürün Mesajları', href: '/admin/products/questions' },
      { name: 'Siparişler', href: '/admin/orders' },
    ]
  },
  {
    name: 'Portfolyo',
    icon: CubeIcon,
    children: [
      { name: 'Tüm Projeler', href: '/admin/portfolio' },
      { name: 'Yeni Ekle', href: '/admin/portfolio/new' },
      { name: 'Kategoriler', href: '/admin/categories' },
      { name: '3D Modeller', href: '/admin/models' },
    ]
  },
  {
    name: 'Medya',
    icon: PhotoIcon,
    children: [
      { name: 'Kütüphane', href: '/admin/media' },
      { name: 'Videolar', href: '/admin/videos' },
    ]
  },
  {
    name: 'Görünüm',
    icon: PaintBrushIcon,
    children: [
      { name: 'Temalar', href: '/admin/themes' },
      { name: 'Slider', href: '/admin/slider' },
      { name: 'Alt Bilgi (Footer)', href: '/admin/footer' },
    ]
  },
  {
    name: 'Sistem',
    icon: CogIcon,
    children: [
      { name: 'Eklentiler', href: '/admin/plugins' },
      { name: 'Kullanıcılar', href: '/admin/users' },
      { name: 'Site Ayarları', href: '/admin/site-settings' },
      { name: 'Sitemap', href: '/admin/sitemap' },
      { name: 'Güncellemeler', href: '/admin/updates' },
    ]
  },
  { name: 'Mesajlar', href: '/admin/messages', icon: ChatBubbleLeftRightIcon },
];

const secondaryNavigation = [
  { name: 'Profilim', href: '/admin/profile', icon: UserCircleIcon },
];

const ThemeToggle = dynamic(() => import('@/components/admin/ThemeToggle'), { ssr: false, loading: () => null });
import { AdminThemeProvider } from '@/components/providers/AdminThemeProvider';
import dynamic from 'next/dynamic';

// ... interactions omitted for brevity

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // ... existing hooks
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Default expanded submenus translated
  const [openSubmenus, setOpenSubmenus] = useState<string[]>(['İçerik Yönetimi', 'Portfolyo', 'Ürün Yönetimi', 'Medya', 'Görünüm', 'Sistem']);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);

    // Skip fetching stats on login or reset password pages
    if (pathname === '/admin/login' || pathname === '/admin/reset-password') return;

    // Fetch counts for sidebar badges
    fetch('/api/admin/dashboard-stats')
      .then(res => res.json())
      .then(data => {
        setCounts({
          'Haberler': data.newsCount || 0,
          'Portfolyo': data.portfolioCount || 0,
          'Hizmetler': data.servicesCount || 0,
          'Ürünler': data.productsCount || 0,
          'Kullanıcılar': data.usersCount || 0,
          'Mesajlar': data.messagesCount || 0,
          'Kütüphane': data.mediaCount || 0,
          'Ürün Medyası': data.productMediaCount || 0,
          'Ürün Mesajları': data.productQuestionsCount || 0,
        });
      })
      .catch(err => console.error('Failed to load sidebar counts', err));
  }, []);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  // Redirect to login if not authenticated and not on login or reset password page
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' && pathname !== '/admin/login' && pathname !== '/admin/reset-password') {
      router.push('/admin/login');
    }
  }, [status, pathname, router]);

  // Don't render admin layout for login or reset password page
  if (pathname === '/admin/login' || pathname === '/admin/reset-password') {
    return <>{children}</>;
  }

  if (!mounted || status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isGroupActive = (children: { href: string }[]) => {
    return children.some(child => isActive(child.href));
  };

  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text-primary)] font-sans transition-colors duration-300">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-72 bg-[var(--admin-surface)] dark:bg-slate-900 border-r border-[var(--admin-border)] shadow-2xl shadow-indigo-500/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-[var(--admin-border)]">
              <Link href="/admin/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[var(--admin-text-primary)]">
                    Yönetim Paneli
                  </h1>
                  <p className="text-xs text-[var(--admin-text-secondary)] font-medium">Yönetim Sistemi</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* User Info */}
            {session?.user && (
              <div className="px-6 py-6 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-md flex items-center justify-center text-indigo-600 font-bold text-lg overflow-hidden">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name || 'Kullanıcı'} className="w-full h-full object-cover" />
                    ) : (
                      session.user.name?.charAt(0).toUpperCase() || 'K'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--admin-text-primary)] truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-[var(--admin-text-secondary)] truncate font-medium">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {navigation.map((item) => {
                // Handle Item with Children (Submenu)
                if (item.children) {
                  const isOpen = openSubmenus.includes(item.name);
                  const groupActive = isGroupActive(item.children);

                  return (
                    <div key={item.name} className="py-1">
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${groupActive
                          ? 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 dark:text-indigo-400'
                          : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text-primary)] dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                          }`}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={`flex-shrink-0 w-5 h-5 mr-3 transition-colors ${groupActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                              }`}
                          />
                          {item.name}
                        </div>
                        <ChevronRightIcon
                          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90 text-slate-500 dark:text-slate-400' : 'text-slate-300 dark:text-slate-600'
                            }`}
                        />
                      </button>

                      {/* Submenu Items */}
                      {isOpen && (
                        <div className="mt-1 ml-4 pl-4 border-l-2 border-[var(--admin-border)] space-y-1">
                          {item.children.map((child) => {
                            const active = isActive(child.href);
                            const count = counts[child.name];
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active
                                  ? 'text-indigo-600 bg-[var(--admin-surface)] shadow-sm ring-1 ring-[var(--admin-border)] dark:bg-slate-800 dark:text-indigo-400 dark:ring-slate-700'
                                  : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg)] dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                                  }`}
                              >
                                <span>{child.name}</span>
                                {count !== undefined && (
                                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${active
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                    : 'bg-[var(--admin-bg)] text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                    {count}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Handle Single Item
                const active = isActive(item.href || '');
                const count = counts[item.name];
                return (
                  <Link
                    key={item.name}
                    href={item.href || '#'}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 mb-1 ${active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text-primary)] dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                      }`}
                  >
                    <item.icon
                      className={`flex-shrink-0 w-5 h-5 mr-3 transition-colors ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {count !== undefined && (
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${active
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--admin-bg)] text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700'
                        }`}>
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>


            {/* Secondary Navigation (Profile) */}
            <div className="px-4 py-2 mt-auto">
              <nav className="space-y-1">
                {secondaryNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${isActive(item.href)
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text-primary)] dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                      }`}
                  >
                    <item.icon
                      className={`flex-shrink-0 w-5 h-5 mr-3 transition-colors ${isActive(item.href) ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-[var(--admin-border)]">
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-xl transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:pl-72 transition-all duration-300">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-30 bg-[var(--admin-surface)]/80 backdrop-blur-xl border-b border-[var(--admin-border)] shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-[var(--admin-bg)] transition-colors dark:hover:bg-slate-800"
                >
                  <Bars3Icon className="w-6 h-6 text-[var(--admin-text-secondary)] dark:text-slate-400" />
                </button>
                <div className="hidden sm:block">
                  <h2 className="text-lg font-semibold text-[var(--admin-text-primary)]">
                    {
                      navigation.find(n => n.href && isActive(n.href))?.name ||
                      navigation.flatMap(n => n.children || []).find(c => isActive(c.href))?.name ||
                      secondaryNavigation.find(n => isActive(n.href))?.name ||
                      'Admin'
                    }
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Quick Actions */}
                <div className="hidden md:flex items-center space-x-2">
                  <Link
                    href="/admin/news/create"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
                  >
                    + Yeni İçerik
                  </Link>
                </div>

                {/* User Menu */}
                {session?.user && (
                  <Link href="/admin/profile" className="flex items-center space-x-3 pl-4 border-l border-[var(--admin-border)] hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-[var(--admin-text-primary)]">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-[var(--admin-text-secondary)]">
                        {session.user.role === 'admin' ? 'Yönetici' : 'Editör'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-indigo-500/30 overflow-hidden">
                      {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        session.user.name?.charAt(0).toUpperCase() || 'K'
                      )}
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
