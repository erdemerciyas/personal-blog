'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  FolderOpenIcon,
  WrenchScrewdriverIcon,
  EnvelopeIcon,
  UserIcon,
  ClockIcon,
  ArrowRightIcon,
  PlusIcon,
  EyeIcon,
  CogIcon,
  CubeTransparentIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PhotoIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
  CloudIcon
} from '@heroicons/react/24/outline';



export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    portfolioCount: 0,
    servicesCount: 0,
    messagesCount: 0,
    categoriesCount: 0,
    sliderCount: 0,
    mediaCount: 0,
    cloudinaryCount: 0,
    localCount: 0
  });


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch statistics and recent media
    const fetchData = async () => {
      try {
        // Fetch statistics
        const [portfolioRes, categoriesRes, servicesRes, messagesRes, sliderRes, mediaRes] = await Promise.all([
          fetch('/api/portfolio'),
          fetch('/api/categories'),
          fetch('/api/services'),
          fetch('/api/messages'),
          fetch('/api/admin/slider'),
          fetch('/api/admin/media')
        ]);

        const portfolioData = portfolioRes.ok ? await portfolioRes.json() : [];
        const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];
        const servicesData = servicesRes.ok ? await servicesRes.json() : [];
        const messagesData = messagesRes.ok ? await messagesRes.json() : [];
        const sliderData = sliderRes.ok ? await sliderRes.json() : [];
        const mediaData = mediaRes.ok ? await mediaRes.json() : [];

        // Calculate media stats
        const cloudinaryCount = mediaData.filter((item: any) => item.source === 'cloudinary').length;
        const localCount = mediaData.filter((item: any) => item.source === 'local').length;

        setStats({
          portfolioCount: portfolioData.length || 0,
          servicesCount: servicesData.length || 0,
          messagesCount: messagesData.length || 0,
          categoriesCount: categoriesData.length || 0,
          sliderCount: sliderData.length || 0,
          mediaCount: mediaData.length || 0,
          cloudinaryCount,
          localCount
        });


      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to default values if API fails
        setStats({
          portfolioCount: 0,
          servicesCount: 0,
          messagesCount: 0,
          categoriesCount: 0,
          sliderCount: 0,
          mediaCount: 0,
          cloudinaryCount: 0,
          localCount: 0
        });

      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };



  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-slate-300">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const menuItems = [
    {
      title: 'Portfolio Yönetimi',
      description: 'Projelerinizi görüntüleyin ve düzenleyin',
      icon: FolderOpenIcon,
      href: '/admin/portfolio',
      color: 'from-blue-500 to-blue-600',
      stats: stats.portfolioCount,
      badge: 'Projeler'
    },
    {
      title: 'Medya Kütüphanesi',
      description: 'Resim ve dosyalarınızı yönetin',
      icon: PhotoIcon,
      href: '/admin/media',
      color: 'from-violet-500 to-purple-600',
      stats: stats.mediaCount,
      badge: 'Dosyalar'
    },
    {
      title: 'Hakkımda Sayfası',
      description: 'Hakkımda sayfası içeriğini düzenle',
      icon: UserIcon,
      href: '/admin/about',
      color: 'from-indigo-500 to-indigo-600',
      stats: '1',
      badge: 'Aktif'
    },
    {
      title: 'Hizmet Yönetimi',
      description: 'Sunduğunuz hizmetleri yönetin',
      icon: WrenchScrewdriverIcon,
      href: '/admin/services',
      color: 'from-teal-500 to-teal-600',
      stats: stats.servicesCount,
      badge: 'Hizmetler'
    },
    {
      title: 'Slider Yönetimi',
      description: 'Ana sayfa slider içeriklerini yönetin',
      icon: PhotoIcon,
      href: '/admin/slider',
      color: 'from-pink-500 to-pink-600',
      stats: stats.sliderCount,
      badge: 'Slider'
    },
    {
      title: 'Sayfa Yönetimi',
      description: 'Sayfaları aktif/pasif yapın ve menü görünürlüğü ayarlayın',
      icon: DocumentTextIcon,
      href: '/admin/pages',
      color: 'from-amber-500 to-amber-600',
      stats: '5',
      badge: 'Sayfalar'
    },
    {
      title: 'Mesaj Yönetimi',
      description: 'Gelen mesajları görüntüleyin',
      icon: ChatBubbleLeftRightIcon,
      href: '/admin/messages',
      color: 'from-purple-500 to-purple-600',
      stats: stats.messagesCount,
      badge: 'Mesajlar'
    },
    {
      title: 'İletişim Bilgileri',
      description: 'İletişim sayfası ayarları',
      icon: PhoneIcon,
      href: '/admin/contact',
      color: 'from-emerald-500 to-emerald-600',
      stats: '1',
      badge: 'Aktif'
    },
    {
      title: 'Kategori Yönetimi',
      description: 'Proje kategorilerini düzenle',
      icon: TagIcon,
      href: '/admin/categories',
      color: 'from-orange-500 to-orange-600',
      stats: stats.categoriesCount,
      badge: 'Kategoriler'
    },
    {
      title: 'Footer Yönetimi',
      description: 'Site alt kısmı ayarları ve içeriği',
      icon: CogIcon,
      href: '/admin/footer',
      color: 'from-slate-500 to-slate-600',
      stats: '1',
      badge: 'Aktif'
    }
  ];

  const quickActions = [
    {
      title: 'Yeni Proje Ekle',
      icon: PlusIcon,
      href: '/admin/portfolio/new',
      color: 'bg-gradient-to-r from-teal-600 to-blue-600'
    },
    {
      title: 'Dosya Yükle',
      icon: CloudIcon,
      href: '/admin/media',
      color: 'bg-gradient-to-r from-violet-600 to-purple-700'
    },
    {
      title: 'Yeni Slider Ekle',
      icon: PhotoIcon,
      href: '/admin/slider',
      color: 'bg-gradient-to-r from-pink-600 to-pink-700'
    },
    {
      title: 'İletişim Düzenle',
      icon: EnvelopeIcon,
      href: '/admin/contact',
      color: 'bg-gradient-to-r from-emerald-600 to-emerald-700'
    },
    {
      title: 'Site Görüntüle',
      icon: EyeIcon,
      href: '/',
      color: 'bg-gradient-to-r from-slate-600 to-slate-700'
    },
    {
      title: 'Ayarlar',
      icon: CogIcon,
      href: '/admin/settings',
      color: 'bg-gradient-to-r from-purple-600 to-purple-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                <CubeTransparentIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-300">İçerik Yönetim Sistemi</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{session.user.name}</p>
                  <p className="text-xs text-slate-400">{session.user.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 text-sm font-medium border border-red-500/30"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Hoş Geldiniz, {session.user.name}! 👋
                </h2>
                <p className="text-slate-300 text-lg">
                  İçerik yönetim panelinize başarıyla giriş yaptınız.
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-2 text-sm text-slate-400">
                <ClockIcon className="w-4 h-4" />
                <span>Son giriş: Bugün {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Toplam Proje</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.portfolioCount}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">+12% bu ay</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FolderOpenIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Medya Dosyası</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.mediaCount}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <CloudIcon className="w-4 h-4 text-violet-400" />
                  <span className="text-violet-400 text-sm">{stats.cloudinaryCount} Cloud</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Aktif Hizmet</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.servicesCount}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">+3 yeni</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Ana Sayfa Slider</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.sliderCount}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <PhotoIcon className="w-4 h-4 text-pink-400" />
                  <span className="text-pink-400 text-sm">Aktif</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Yeni Mesaj</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.messagesCount}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <BellIcon className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm">Okunmadı</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <EnvelopeIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Kategori</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.categoriesCount}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <DocumentTextIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm">Düzenli</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link 
                key={action.title}
                href={action.href}
                className="group"
              >
                <div className={`${action.color} rounded-2xl p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                  <div className="flex items-center space-x-3">
                    <action.icon className="w-6 h-6" />
                    <span className="font-semibold">{action.title}</span>
                    <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ml-auto" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>



        {/* Main Menu Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Yönetim Paneli</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Link 
                key={item.title}
                href={item.href}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium">{item.badge}</span>
                      <p className="text-2xl font-bold text-white">{item.stats}</p>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors duration-300">
                    {item.title}
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-end mt-4">
                    <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-sm">Sistem durumu: Aktif</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <Link href="/" className="hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <CubeTransparentIcon className="w-4 h-4" />
                <span>Ana Sayfa</span>
              </Link>
              <span>Admin Panel v2.1</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 