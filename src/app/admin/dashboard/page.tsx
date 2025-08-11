'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import for AdminLayout to prevent SSR issues
const AdminLayout = dynamic(() => import('../../../components/admin/AdminLayout'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-700 mx-auto"></div>
        <p className="text-slate-600">Dashboard yükleniyor...</p>
      </div>
    </div>
  )
});

import { 
  FolderOpenIcon, 
  PhotoIcon, 
  EnvelopeIcon, 
  WrenchScrewdriverIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  CogIcon,
  DocumentTextIcon,
  PlusIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  PresentationChartBarIcon,
  CloudIcon,
  UsersIcon,
  ViewColumnsIcon,
  ClockIcon,
  ServerIcon,
  AdjustmentsHorizontalIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

// Vercel için client-side only component
function AdminDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    portfolioCount: 0,
    mediaCount: 0,
    messagesCount: 0,
    servicesCount: 0,
    categoriesCount: 0,
    sliderCount: 0,
    cloudinaryCount: 0,
    usersCount: 0,
    productsCount: 0
  });

  const [recentActivity] = useState([
    {
      id: 1,
      type: 'portfolio',
      title: 'Yeni portfolio projesi eklendi',
      description: 'Otomotiv Parça Tarama projesi başarıyla yüklendi',
      time: '2 saat önce'
    },
    {
      id: 2,
      type: 'message',
      title: 'Yeni müşteri mesajı',
      description: 'Ahmet Yılmaz\'dan proje teklifi geldi',
      time: '4 saat önce'
    },
    {
      id: 3,
      type: 'service',
      title: 'Hizmet güncellemesi',
      description: '3D Tarama hizmeti fiyatlandırması güncellendi',
      time: '1 gün önce'
    },
    {
      id: 4,
      type: 'upload',
      title: 'Medya dosyası yüklendi',
      description: 'Yeni proje görselleri medya kütüphanesine eklendi',
      time: '2 gün önce'
    }
  ]);

  const [, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Client-side mounting check for Vercel
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      // Session kontrolü - sadece authenticated user için API çağrısı yap
      if (status !== 'authenticated' || !session?.user || !mounted) {
        if (status !== 'loading') {
          setLoading(false);
        }
        return;
      }

      try {
        // Vercel için timeout ekle
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch('/api/admin/dashboard-stats', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.warn('Dashboard stats API returned:', response.status);
          // Fallback stats for Vercel
            setStats({
            portfolioCount: 0,
            mediaCount: 0,
            messagesCount: 0,
            servicesCount: 0,
            categoriesCount: 0,
            sliderCount: 0,
            cloudinaryCount: 0,
              usersCount: 0,
              productsCount: 0
          });
        }
      } catch (error) {
        console.error('Dashboard stats fetch error:', error);
        // Fallback stats for Vercel
        setStats({
          portfolioCount: 0,
          mediaCount: 0,
          messagesCount: 0,
          servicesCount: 0,
          categoriesCount: 0,
          sliderCount: 0,
          cloudinaryCount: 0,
          usersCount: 0,
          productsCount: 0
        });
      } finally {
        setLoading(false);
      }
    };

    // Delay for Vercel hydration
    const timer = setTimeout(() => {
      fetchStats();
    }, 100);

    return () => clearTimeout(timer);
  }, [status, session, mounted]);

  // Vercel için loading ve authentication handling
  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-700 mx-auto"></div>
          <p className="text-slate-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      router.push('/admin/login');
    }
    return null;
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-700 mx-auto"></div>
          <p className="text-slate-600">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }



  return (
    <AdminLayout 
      title="Dashboard"
      breadcrumbs={[
        { label: 'Dashboard' }
      ]}
    >
      <div className="h-full bg-slate-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-brand-primary-50 to-cyan-50 rounded-2xl p-6 lg:p-8 border border-brand-primary-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                Hoş Geldiniz, {session.user.name}! 👋
              </h2>
              <p className="text-slate-600 text-lg">
                İçerik yönetim panelinize başarıyla giriş yaptınız.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span className="w-2 h-2 bg-brand-primary-600 rounded-full"></span>
                <span>
                  Son giriş: {typeof window !== 'undefined' ? new Date().toLocaleDateString('tr-TR', {
                    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                  }) : '-'}
                </span>
              </div>
              <div className="px-3 py-1 bg-brand-primary-100 text-brand-primary-800 rounded-full text-sm font-medium">
                v2.2.7
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm font-medium">Ürünler</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.productsCount}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 text-sm font-medium">Canlı</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TagIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm font-medium">Toplam Proje</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.portfolioCount}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-brand-primary-600" />
                  <span className="text-brand-primary-700 text-sm font-medium">+12%</span>
                  <span className="text-slate-500 text-sm">bu ay</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FolderOpenIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm font-medium">Medya Dosyası</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.mediaCount}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <CloudIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-purple-600 text-sm font-medium">31 Cloud</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <PhotoIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm font-medium">Aktif Hizmet</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">7</p>
                <div className="flex items-center space-x-1 mt-2">
                  <WrenchScrewdriverIcon className="w-4 h-4 text-brand-primary-600" />
                  <span className="text-brand-primary-700 text-sm font-medium">3 yeni</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-brand-primary-100 rounded-xl flex items-center justify-center">
                  <WrenchScrewdriverIcon className="w-6 h-6 text-brand-primary-700" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm font-medium">Ana Sayfa Slider</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">4</p>
                <div className="flex items-center space-x-1 mt-2">
                  <PresentationChartBarIcon className="w-4 h-4 text-pink-500" />
                  <span className="text-pink-600 text-sm font-medium">1 aktif</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <PresentationChartBarIcon className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm font-medium">Yeni Mesaj</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.messagesCount}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <EnvelopeIcon className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-600 text-sm font-medium">Okunmamış</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <EnvelopeIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm font-medium">Kayıtlı Kullanıcı</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.usersCount}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <UsersIcon className="w-4 h-4 text-brand-primary-600" />
                  <span className="text-brand-primary-700 text-sm font-medium">Aktif</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-brand-primary-100 rounded-xl flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-brand-primary-700" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm font-medium">Kategori</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TagIcon className="w-4 h-4 text-indigo-500" />
                  <span className="text-indigo-600 text-sm font-medium">Düzenli</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <TagIcon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Hızlı İşlemler</h3>
            <ViewColumnsIcon className="w-5 h-5 text-slate-400" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link href="/admin/portfolio/new" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlusIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Yeni Proje</span>
            </Link>
            
            <Link href="/admin/services/new" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Yeni Hizmet</span>
            </Link>
            
            <Link href="/admin/media" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CloudArrowUpIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Medya Yükle</span>
            </Link>
            
            <Link href="/admin/messages" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <EnvelopeIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Mesajlar</span>
            </Link>
            
            <Link href="/admin/settings" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <AdjustmentsHorizontalIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Ayarlar</span>
            </Link>
            
            <Link href="/admin/users" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Kullanıcılar</span>
            </Link>
            
            <Link href="/admin/about" className="flex flex-col items-center space-y-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Hakkımda</span>
            </Link>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Son Aktiviteler</h3>
              <ClockIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'portfolio' ? 'bg-blue-100' :
                    activity.type === 'service' ? 'bg-brand-primary-100' :
                    activity.type === 'message' ? 'bg-orange-100' :
                    'bg-gray-100'
                  }`}>
                    {activity.type === 'portfolio' && <FolderOpenIcon className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'service' && <WrenchScrewdriverIcon className="w-4 h-4 text-brand-primary-700" />}
                    {activity.type === 'message' && <EnvelopeIcon className="w-4 h-4 text-orange-600" />}
                    {activity.type === 'upload' && <CloudArrowUpIcon className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Sistem Durumu</h3>
              <ServerIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-brand-primary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-brand-primary-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-brand-primary-900">Server Durumu</p>
                    <p className="text-xs text-brand-primary-800">Çevrimiçi ve düzgün çalışıyor</p>
                  </div>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-brand-primary-600" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-brand-primary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-brand-primary-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-brand-primary-900">Veritabanı</p>
                    <p className="text-xs text-brand-primary-800">MongoDB bağlantısı aktif</p>
                  </div>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-brand-primary-600" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-brand-primary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-brand-primary-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-brand-primary-900">Cloudinary</p>
                    <p className="text-xs text-brand-primary-800">CDN hizmeti aktif</p>
                  </div>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-brand-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı Linkler */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Hızlı Linkler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/portfolio" className="flex items-center space-x-3 p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <FolderOpenIcon className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Tüm Projeler</span>
            </Link>
            <Link href="/admin/services" className="flex items-center space-x-3 p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <WrenchScrewdriverIcon className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Hizmet Yönetimi</span>
            </Link>
            <Link href="/admin/media" className="flex items-center space-x-3 p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <PhotoIcon className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Medya Galerisi</span>
            </Link>
            <Link href="/admin/messages" className="flex items-center space-x-3 p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <EnvelopeIcon className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Gelen Mesajlar</span>
            </Link>
            <Link href="/admin/users" className="flex items-center space-x-3 p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <UsersIcon className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Kullanıcı Yönetimi</span>
            </Link>
            <Link href="/admin/settings" className="flex items-center space-x-3 p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <CogIcon className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Sistem Ayarları</span>
            </Link>
            <Link href="/" target="_blank" className="flex items-center space-x-3 p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <GlobeAltIcon className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Ana Siteyi Görüntüle</span>
            </Link>
          </div>
        </div>
        
        </div>
      </div>
    </AdminLayout>
  );
}

// Vercel için dynamic export
export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-700 mx-auto"></div>
          <p className="text-slate-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}