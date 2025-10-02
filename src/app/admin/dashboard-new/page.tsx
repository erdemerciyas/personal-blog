'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminBadge } from '@/components/admin/ui';
import {
  FolderOpenIcon,
  PhotoIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  PlusIcon,
  CloudArrowUpIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ServerIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function DashboardNewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    portfolioCount: 0,
    mediaCount: 0,
    messagesCount: 0,
    servicesCount: 0,
    usersCount: 0,
    productsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return null;
  }

  return (
    <AdminLayoutNew
      title="Dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      <div className="space-y-6">
        {/* Welcome Card */}
        <AdminCard padding="lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Hoş Geldiniz, {session?.user?.name}! 👋
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                İçerik yönetim panelinize başarıyla giriş yaptınız.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 bg-brand-primary-600 rounded-full"></span>
                <span>Son giriş: {new Date().toLocaleDateString('tr-TR')}</span>
              </div>
              <AdminBadge variant="info">v2.6.0</AdminBadge>
            </div>
          </div>
        </AdminCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AdminCard hover padding="md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Ürünler</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.productsCount}
                </p>
                <div className="flex items-center space-x-1 mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-admin-success-600" />
                  <span className="text-admin-success-700 dark:text-admin-success-400 text-sm font-medium">
                    Canlı
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-admin-success-100 dark:bg-admin-success-900/50 rounded-xl flex items-center justify-center">
                  <TagIcon className="w-6 h-6 text-admin-success-600 dark:text-admin-success-400" />
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard hover padding="md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Toplam Proje</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.portfolioCount}
                </p>
                <div className="flex items-center space-x-1 mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-brand-primary-600" />
                  <span className="text-brand-primary-700 dark:text-brand-primary-400 text-sm font-medium">
                    +12%
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                  <FolderOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard hover padding="md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Medya Dosyası</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.mediaCount}
                </p>
                <div className="flex items-center space-x-1 mt-2">
                  <PhotoIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                    Cloud
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                  <PhotoIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard hover padding="md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Yeni Mesaj</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.messagesCount}
                </p>
                <div className="flex items-center space-x-1 mt-2">
                  <EnvelopeIcon className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                    Okunmamış
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                  <EnvelopeIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Quick Actions */}
        <AdminCard title="Hızlı İşlemler" padding="md">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link href="/admin/portfolio/new" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlusIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                Yeni Proje
              </span>
            </Link>

            <Link href="/admin/services/new" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                Yeni Hizmet
              </span>
            </Link>

            <Link href="/admin/media" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CloudArrowUpIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                Medya Yükle
              </span>
            </Link>

            <Link href="/admin/messages" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <EnvelopeIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                Mesajlar
              </span>
            </Link>

            <Link href="/admin/settings" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <AdjustmentsHorizontalIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                Ayarlar
              </span>
            </Link>

            <Link href="/admin/users" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                Kullanıcılar
              </span>
            </Link>
          </div>
        </AdminCard>

        {/* System Status */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AdminCard title="Son Aktiviteler" padding="md">
            <div className="space-y-4">
              {[
                {
                  title: 'Yeni portfolio projesi eklendi',
                  description: 'Otomotiv Parça Tarama projesi',
                  time: '2 saat önce',
                  icon: FolderOpenIcon,
                  color: 'blue',
                },
                {
                  title: 'Yeni müşteri mesajı',
                  description: 'Proje teklifi geldi',
                  time: '4 saat önce',
                  icon: EnvelopeIcon,
                  color: 'orange',
                },
                {
                  title: 'Hizmet güncellemesi',
                  description: '3D Tarama hizmeti güncellendi',
                  time: '1 gün önce',
                  icon: WrenchScrewdriverIcon,
                  color: 'brand-primary',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.color === 'blue'
                        ? 'bg-blue-100 dark:bg-blue-900/50'
                        : activity.color === 'orange'
                        ? 'bg-orange-100 dark:bg-orange-900/50'
                        : 'bg-brand-primary-100 dark:bg-brand-primary-900/50'
                    }`}
                  >
                    <activity.icon
                      className={`w-4 h-4 ${
                        activity.color === 'blue'
                          ? 'text-blue-600 dark:text-blue-400'
                          : activity.color === 'orange'
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-brand-primary-700 dark:text-brand-primary-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard title="Sistem Durumu" padding="md">
            <div className="space-y-4">
              {[
                { label: 'Server Durumu', status: 'Çevrimiçi ve düzgün çalışıyor', icon: ServerIcon },
                { label: 'Veritabanı', status: 'MongoDB bağlantısı aktif', icon: CheckCircleIcon },
                { label: 'Cloudinary', status: 'CDN hizmeti aktif', icon: CloudArrowUpIcon },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-brand-primary-50 dark:bg-brand-primary-900/20 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-brand-primary-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-brand-primary-900 dark:text-brand-primary-100">
                        {item.label}
                      </p>
                      <p className="text-xs text-brand-primary-800 dark:text-brand-primary-300">
                        {item.status}
                      </p>
                    </div>
                  </div>
                  <item.icon className="w-5 h-5 text-brand-primary-600 dark:text-brand-primary-400" />
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminLayoutNew>
  );
}
