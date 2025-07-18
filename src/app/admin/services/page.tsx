'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PageLoader } from '../../../components/AdminLoader';
import AdminLayout from '../../../components/admin/AdminLayout';
import HTMLContent from '../../../components/HTMLContent';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  FolderOpenIcon
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
      } catch {
        setError('Servisler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchServices();
    }
  }, [status]);

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
    } catch {
      setError('Servis silinirken bir hata oluştu');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <PageLoader text="Hizmetler yükleniyor..." />
      </AdminLayout>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AdminLayout 
      title="Servis Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Servis Yönetimi' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600">Sunduğunuz hizmetleri yönetin</p>
            <div className="flex items-center space-x-4 text-sm text-slate-500 mt-2">
              <span>Toplam: {services.length} servis</span>
              <span>•</span>
              <span>Aktif servisler</span>
            </div>
          </div>
          <Link
            href="/admin/services/new"
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Yeni Servis</span>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/services/new"
            className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <PlusIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Yeni Servis Ekle</span>
            </div>
          </Link>
          
          <Link
            href="/admin/portfolio"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <FolderOpenIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Portfolio Yönetimi</span>
            </div>
          </Link>
          
          <div className="bg-slate-100 p-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <WrenchScrewdriverIcon className="w-6 h-6 text-slate-600" />
              <span className="font-semibold text-slate-900">Servis İstatistikleri</span>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Servisler</h3>
          </div>
          
          <div className="divide-y divide-slate-200">
            {services.length === 0 ? (
              <div className="p-12 text-center">
                <WrenchScrewdriverIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">Henüz servis eklenmemiş</p>
                <p className="text-slate-500 mt-2">İlk servisinizi eklemek için "Yeni Servis" butonuna tıklayın</p>
              </div>
            ) : (
              services.map((service) => (
                <div key={service._id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={80}
                        height={80}
                        className="rounded-xl object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-900 mb-2">
                            {service.title}
                          </h4>
                          <div className="text-slate-600 mb-3">
                            <HTMLContent 
                              content={service.description}
                              truncate={150}
                              className="line-clamp-3"
                            />
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>Aktif servis</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            href="/services"
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Görüntüle"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/services/edit/${service._id}`}
                            className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(service._id)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}