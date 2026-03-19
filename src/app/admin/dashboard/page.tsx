'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
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
  PlusIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardBody, Badge, Button } from '@/components/ui';

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

interface ActivityItem {
  id: string;
  action: string;
  item: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'message';
  sortKey?: number;
}

const fetcher = (url: string) =>
  fetch(url).then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); });

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return date.toLocaleDateString('tr-TR');
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: rawData, isLoading } = useSWR(
    status === 'authenticated' ? '/api/admin/dashboard-stats' : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  const loading = status === 'loading' || (status === 'authenticated' && isLoading);

  const dashboardStats = {
    newsCount: rawData?.newsCount || 0,
    portfolioCount: rawData?.portfolioCount || 0,
    servicesCount: rawData?.servicesCount || 0,
    productsCount: rawData?.productsCount || 0,
    usersCount: rawData?.usersCount || 0,
    videosCount: rawData?.mediaCount || 0,
    messagesCount: rawData?.messagesCount || 0,
  };

  const recentItems: RecentItem[] = (rawData?.recentContent || []).map((item: any) => ({
    id: item._id,
    title: item.title,
    type: item.type,
    status: item.status || 'published',
    date: formatDate(item.createdAt),
    views: item.views || 0,
  }));

  const allActivities: ActivityItem[] = [];
  (rawData?.recentMessages || []).forEach((msg: any) => {
    allActivities.push({ id: `msg-${msg._id}`, action: 'Yeni mesaj alındı', item: msg.subject || 'Konu yok', time: formatDate(msg.createdAt), type: 'message', sortKey: new Date(msg.createdAt).getTime() });
  });
  (rawData?.recentContent || []).forEach((content: any) => {
    let actionText = 'İçerik güncellendi';
    let type: ActivityItem['type'] = 'success';
    switch (content.type) {
      case 'news': actionText = 'Yeni haber eklendi'; break;
      case 'portfolio': actionText = 'Portfolyo güncellendi'; type = 'info'; break;
      case 'service': actionText = 'Yeni hizmet eklendi'; break;
      case 'product': actionText = 'Yeni ürün eklendi'; break;
    }
    allActivities.push({ id: `content-${content._id}`, action: actionText, item: content.title || content.name, time: formatDate(content.createdAt), type, sortKey: new Date(content.createdAt).getTime() });
  });
  (rawData?.recentUsers || []).forEach((user: any) => {
    allActivities.push({ id: `user-${user._id}`, action: 'Yeni kullanıcı', item: user.name || user.email, time: formatDate(user.createdAt), type: 'warning', sortKey: new Date(user.createdAt).getTime() });
  });
  const activities = allActivities.sort((a, b) => (b.sortKey ?? 0) - (a.sortKey ?? 0)).slice(0, 8);

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
            <div className="w-16 h-16 border-4 border-brand-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-brand-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card padding="lg" border={false} shadow="none" className="bg-gradient-to-r from-brand-600 via-brand-700 to-brand-900 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              Hos geldin, {session?.user?.name || 'Yönetici'}!
            </h1>
            <p className="text-brand-100 text-lg">
              Bugün sitenizde olan bitenler.
            </p>
          </div>
          <div className="hidden md:block">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-brand-600 hover:bg-brand-50 border-0 shadow-lg"
              onClick={() => router.push('/admin/news/create')}
            >
              <PlusIcon className="w-5 h-5" />
              Yeni Icerik Olustur
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <section aria-label="İstatistikler">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <li key={stat.title}>
              <Link href={stat.href}>
                <Card className="group hover:shadow-lg transition-all duration-base border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                      <Badge variant="success">
                        <ArrowTrendingUpIcon className="w-3.5 h-3.5 mr-1" />
                        {stat.change}
                      </Badge>
                    </div>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-base`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hizli Islemler</CardTitle>
        </CardHeader>
        <CardBody>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <li key={action.name}>
                <Link
                  href={action.href}
                  className="group flex flex-col items-center p-6 rounded-xl bg-surface-secondary hover:bg-brand-600 transition-all duration-base border-2 border-border hover:border-transparent"
                >
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:bg-white transition-colors`}>
                    <action.icon className="w-6 h-6 text-white group-hover:text-brand-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-white transition-colors">
                    {action.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {/* Recent Content & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Content */}
        <Card>
          <CardHeader>
            <CardTitle>Son Icerikler</CardTitle>
            <Link href="/admin/news" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Tumunu Gor →
            </Link>
          </CardHeader>
          <CardBody>
            <ul className="space-y-4">
              {recentItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary hover:bg-brand-50 transition-colors group"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'news' ? 'bg-info-light text-info' :
                      item.type === 'portfolio' ? 'bg-success-light text-success' :
                        item.type === 'service' ? 'bg-warning-light text-warning' :
                          'bg-danger-light text-danger'
                      }`}>
                      {item.type === 'news' && <DocumentTextIcon className="w-5 h-5" />}
                      {item.type === 'portfolio' && <PhotoIcon className="w-5 h-5" />}
                      {item.type === 'service' && <CubeIcon className="w-5 h-5" />}
                      {item.type === 'product' && <CubeIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={item.status === 'published' ? 'success' : 'warning'}>
                          {item.status === 'published' ? 'yayında' : 'taslak'}
                        </Badge>
                        <span className="text-xs text-gray-500">{item.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <EyeIcon className="w-4 h-4" />
                      <span>{item.views}</span>
                    </div>
                    <Link
                      href={`/admin/${item.type}/${item.id}/edit`}
                      className="p-2 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </li>
              ))}
              {recentItems.length === 0 && (
                <li className="text-center text-gray-500 py-4">Henüz içerik bulunmuyor.</li>
              )}
            </ul>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <li key={activity.id} className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'success' ? 'bg-success-light text-success' :
                      activity.type === 'info' ? 'bg-info-light text-info' :
                        activity.type === 'message' ? 'bg-warning-light text-warning' :
                          activity.type === 'warning' ? 'bg-warning-light text-warning-dark' :
                            'bg-surface-tertiary text-gray-600'
                      }`}>
                      {activity.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
                      {activity.type === 'info' && <ClockIcon className="w-5 h-5" />}
                      {activity.type === 'message' && <ChatBubbleLeftRightIcon className="w-5 h-5" />}
                      {activity.type === 'warning' && <UserGroupIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{activity.action}</span>
                      </p>
                      <p className="text-sm text-gray-500 truncate">{activity.item}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-500 py-4">Henüz aktivite bulunmuyor.</li>
              )}
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Sistem Durumu</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemStatus.map((system) => (
              <div
                key={system.name}
                className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{system.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Uptime: {system.uptime}</p>
                </div>
                <div className={`flex items-center space-x-2 ${system.status === 'operational' ? 'text-success' :
                  system.status === 'warning' ? 'text-warning' :
                    'text-danger'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${system.status === 'operational' ? 'bg-success' :
                    system.status === 'warning' ? 'bg-warning' :
                      'bg-danger'
                    } animate-pulse`}></div>
                  <span className="text-sm font-medium capitalize">
                    {system.status === 'operational' ? 'Çalışıyor' : system.status === 'warning' ? 'Uyarı' : 'Hata'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Messages Preview */}
      <Card padding="md" border={false} shadow="none" className="bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Yeni Mesajlar</h3>
              <p className="text-brand-100">
                {dashboardStats.messagesCount > 0
                  ? `${dashboardStats.messagesCount} yeni mesajınız var`
                  : 'Yeni mesaj yok'
                }
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="bg-white text-brand-600 hover:bg-brand-50 border-0"
            onClick={() => router.push('/admin/messages')}
          >
            Mesajlari Goruntule
          </Button>
        </div>
      </Card>
    </div>
  );
}
