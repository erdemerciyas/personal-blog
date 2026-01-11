'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DocumentTextIcon,
  PhotoIcon,
  CubeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface StatCard {
  title: string;
  value: number;
  change: string;
  icon: any;
  color: string;
  href: string;
}

interface RecentItem {
  id: string;
  title: string;
  type: 'news' | 'portfolio' | 'service' | 'product';
  status: 'published' | 'draft';
  date: string;
  views: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    newsCount: 0,
    portfolioCount: 0,
    servicesCount: 0,
    productsCount: 0,
    usersCount: 0,
    videosCount: 0,
    messagesCount: 0,
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadDashboardData();
  }, [status, router]);

  const loadDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard-stats');

      if (!res.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await res.json();

      // Update stats
      setDashboardStats({
        newsCount: data.newsCount || 0,
        portfolioCount: data.portfolioCount || 0,
        servicesCount: data.servicesCount || 0,
        productsCount: data.productsCount || 0,
        usersCount: data.usersCount || 0,
        videosCount: data.mediaCount || 0, // Mapping mediaCount to videosCount for now, or assume checking media folder
        messagesCount: data.messagesCount || 0,
      });

      // Update recent items
      if (data.recentContent) {
        setRecentItems(data.recentContent.map((item: any) => ({
          id: item._id,
          title: item.title,
          type: item.type,
          status: item.status || 'published',
          date: formatDate(item.createdAt),
          views: item.views || 0,
        })));
      }

    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const stats: StatCard[] = [
    { title: 'Toplam Haber', value: dashboardStats.newsCount, change: '+12%', icon: DocumentTextIcon, color: 'from-indigo-500 to-violet-600', href: '/admin/news' },
    { title: 'Portfolyo', value: dashboardStats.portfolioCount, change: '+8%', icon: PhotoIcon, color: 'from-emerald-500 to-teal-600', href: '/admin/portfolio' },
    { title: 'Hizmetler', value: dashboardStats.servicesCount, change: '+5%', icon: CubeIcon, color: 'from-amber-500 to-orange-600', href: '/admin/services' },
    { title: 'Ürünler', value: dashboardStats.productsCount, change: '+15%', icon: CubeIcon, color: 'from-rose-500 to-pink-600', href: '/admin/products' },
    { title: 'Kullanıcılar', value: dashboardStats.usersCount, change: '+20%', icon: UserGroupIcon, color: 'from-cyan-500 to-blue-600', href: '/admin/users' },
    { title: 'Medya', value: dashboardStats.videosCount, change: '+10%', icon: PhotoIcon, color: 'from-purple-500 to-indigo-600', href: '/admin/media' },
  ];

  const quickActions = [
    { name: 'Haber Ekle', href: '/admin/news/create', icon: DocumentTextIcon, color: 'bg-indigo-500' },
    { name: 'Portfolyo Ekle', href: '/admin/portfolio/new', icon: PhotoIcon, color: 'bg-emerald-500' },
    { name: 'Hizmet Ekle', href: '/admin/services/new', icon: CubeIcon, color: 'bg-amber-500' },
    { name: 'Ürün Ekle', href: '/admin/products/new', icon: CubeIcon, color: 'bg-rose-500' },
  ];

  const activities = [
    // These might be dynamic eventually, translating static ones for now
    { id: 1, action: 'Yeni makale yayınlandı', item: 'Yeni Ürün Lansmanı', time: '2 saat önce', type: 'success' },
    { id: 2, action: 'Portfolyo güncellendi', item: 'Web Geliştirme Projesi', time: '5 saat önce', type: 'info' },
    { id: 3, action: 'Yeni mesaj alındı', item: 'İletişim Formu #123', time: '1 gün önce', type: 'message' },
    { id: 4, action: 'Yeni kullanıcı eklendi', item: 'John Doe', time: '2 gün önce', type: 'success' },
  ];

  const systemStatus = [
    { name: 'Sunucu Durumu', status: 'operational', uptime: '%99.9' },
    { name: 'Veritabanı', status: 'operational', uptime: '%99.8' },
    { name: 'Depolama', status: 'warning', uptime: '%75' },
    { name: 'API', status: 'operational', uptime: '%99.9' },
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-500/30">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Hoş geldin, {session?.user?.name || 'Yönetici'}!
            </h1>
            <p className="text-indigo-100 text-lg">
              Bugün sitenizde olan bitenler.
            </p>
          </div>
          <div className="hidden md:block">
            <Link
              href="/admin/news/create"
              className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Yeni İçerik Oluştur
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200/60"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</h3>
                <p className="text-sm font-medium text-emerald-600 flex items-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Hızlı İşlemler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="group flex flex-col items-center p-6 rounded-xl bg-slate-50 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-violet-600 transition-all duration-300 border-2 border-slate-200 hover:border-transparent"
            >
              <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:bg-white transition-colors`}>
                <action.icon className="w-6 h-6 text-white group-hover:text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-white transition-colors">
                {action.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Content & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Content */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Son İçerikler</h2>
            <Link href="/admin/news" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Tümünü Gör →
            </Link>
          </div>
          <div className="space-y-4">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors group"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'news' ? 'bg-indigo-100 text-indigo-600' :
                    item.type === 'portfolio' ? 'bg-emerald-100 text-emerald-600' :
                      item.type === 'service' ? 'bg-amber-100 text-amber-600' :
                        'bg-rose-100 text-rose-600'
                    }`}>
                    {item.type === 'news' && <DocumentTextIcon className="w-5 h-5" />}
                    {item.type === 'portfolio' && <PhotoIcon className="w-5 h-5" />}
                    {item.type === 'service' && <CubeIcon className="w-5 h-5" />}
                    {item.type === 'product' && <CubeIcon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status === 'published'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                        }`}>
                        {item.status === 'published' ? 'yayında' : 'taslak'}
                      </span>
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-slate-400">
                  <div className="flex items-center space-x-1 text-xs text-slate-500">
                    <EyeIcon className="w-4 h-4" />
                    <span>{item.views}</span>
                  </div>
                  <Link
                    href={`/admin/${item.type}/${item.id}/edit`}
                    className="p-2 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Son Aktiviteler</h2>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  activity.type === 'info' ? 'bg-indigo-100 text-indigo-600' :
                    activity.type === 'message' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                  }`}>
                  {activity.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
                  {activity.type === 'info' && <ClockIcon className="w-5 h-5" />}
                  {activity.type === 'message' && <ChatBubbleLeftRightIcon className="w-5 h-5" />}
                  {activity.type === 'warning' && <ExclamationCircleIcon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-900">{activity.action}</span>
                  </p>
                  <p className="text-sm text-slate-500 truncate">{activity.item}</p>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Sistem Durumu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStatus.map((system) => (
            <div
              key={system.name}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{system.name}</p>
                <p className="text-xs text-slate-500 mt-1">Uptime: {system.uptime}</p>
              </div>
              <div className={`flex items-center space-x-2 ${system.status === 'operational' ? 'text-emerald-600' :
                system.status === 'warning' ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                <div className={`w-2 h-2 rounded-full ${system.status === 'operational' ? 'bg-emerald-600' :
                  system.status === 'warning' ? 'bg-amber-600' :
                    'bg-red-600'
                  } animate-pulse`}></div>
                <span className="text-sm font-medium capitalize">
                  {system.status === 'operational' ? 'Çalışıyor' : system.status === 'warning' ? 'Uyarı' : 'Hata'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Preview */}
      <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Yeni Mesajlar</h3>
              <p className="text-indigo-100">
                {dashboardStats.messagesCount > 0
                  ? `${dashboardStats.messagesCount} yeni mesajınız var`
                  : 'Yeni mesaj yok'
                }
              </p>
            </div>
          </div>
          <Link
            href="/admin/messages"
            className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
          >
            Mesajları Görüntüle
          </Link>
        </div>
      </div>
    </div>
  );
}
