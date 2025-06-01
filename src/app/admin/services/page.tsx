'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  CubeTransparentIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  ArrowLeftIcon,
  HomeIcon,
  FolderOpenIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface Service {
  _id: string;
  title: string;
  description: string;
  image: string;
}

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          throw new Error('Servisler yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        setServices(data);
      } catch (error) {
        setError('Servisler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu servisi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Servis silinirken bir hata oluştu');
      }

      setServices(services.filter(service => service._id !== id));
    } catch (error) {
      setError('Servis silinirken bir hata oluştu');
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-slate-300">Servisler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const quickActions = [
    {
      title: 'Yeni Servis Ekle',
      icon: PlusIcon,
      href: '/admin/services/new',
      color: 'bg-gradient-to-r from-teal-600 to-blue-600'
    },
    {
      title: 'Portfolio Yönetimi',
      icon: FolderOpenIcon,
      href: '/admin/portfolio',
      color: 'bg-gradient-to-r from-blue-600 to-blue-700'
    },
    {
      title: 'Dashboard',
      icon: HomeIcon,
      href: '/admin/dashboard',
      color: 'bg-gradient-to-r from-slate-600 to-slate-700'
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
              <Link 
                href="/admin/dashboard"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <CubeTransparentIcon className="w-6 h-6 text-white" />
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Servis Yönetimi</h1>
                <p className="text-sm text-slate-300">Hizmetlerinizi yönetin</p>
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
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                  <WrenchScrewdriverIcon className="w-8 h-8 text-teal-400" />
                  <span>Servis Yönetimi</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  Sunduğunuz hizmetleri ekleyin, düzenleyin ve yönetin.
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-2 text-sm text-slate-400">
                <ClockIcon className="w-4 h-4" />
                <span>Toplam {services.length} servis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-300 p-4 rounded-2xl">
              {error}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link 
                key={action.title}
                href={action.href}
                className="group"
              >
                <div className={`${action.color} rounded-2xl p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                  <div className="flex items-center space-x-3">
                    <action.icon className="w-6 h-6" />
                    <span className="font-semibold">{action.title}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Servisler</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span>{services.length} servis bulundu</span>
            </div>
          </div>

          {services.length === 0 && !loading ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
              <WrenchScrewdriverIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">Henüz servis yok</h4>
              <p className="text-slate-400 mb-6">İlk servisinizi ekleyerek başlayın</p>
              <Link 
                href="/admin/services/new"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Yeni Servis Ekle</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-105 group"
                >
                  <div className="relative h-48">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors duration-300 mb-3 line-clamp-1">
                      {service.title}
                    </h4>
                    
                    <p className="text-slate-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <Link
                        href={`/admin/services/edit/${service._id}`}
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors group/btn"
                      >
                        <PencilIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Düzenle</span>
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors group/btn"
                      >
                        <TrashIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Sil</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-sm">Servis Yönetimi Aktif</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <Link href="/admin/dashboard" className="hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <HomeIcon className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/" className="hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <EyeIcon className="w-4 h-4" />
                <span>Site Görünümü</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 