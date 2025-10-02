'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AdminLayoutNew } from '@/components/admin/layout';
import {
  AdminButton,
  AdminCard,
  AdminSpinner,
  AdminAlert,
  AdminEmptyState
} from '@/components/admin/ui';
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
  const { status } = useSession();
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
      <AdminLayoutNew
        title="Servis Yönetimi"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Servisler' }
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <AdminSpinner size="lg" />
        </div>
      </AdminLayoutNew>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AdminLayoutNew
      title="Servis Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Servisler' }
      ]}
      actions={
        <Link href="/admin/services/new">
          <AdminButton variant="primary" icon={PlusIcon}>
            Yeni Servis
          </AdminButton>
        </Link>
      }
    >
      <div className="space-y-6">

        {/* Header Info */}
        <div>
          <p className="text-slate-600 dark:text-slate-400">Sunduğunuz hizmetleri yönetin</p>
          <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
            <span>Toplam: {services.length} servis</span>
            <span>•</span>
            <span>Aktif servisler</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <AdminAlert variant="error" onClose={() => setError(null)}>
            {error}
          </AdminAlert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/services/new">
            <AdminCard padding="md" hover className="h-full cursor-pointer bg-gradient-to-r from-brand-primary-700 to-blue-600 text-white border-0">
              <div className="flex items-center space-x-3">
                <PlusIcon className="w-6 h-6" />
                <span className="font-semibold">Yeni Servis Ekle</span>
              </div>
            </AdminCard>
          </Link>

          <Link href="/admin/portfolio">
            <AdminCard padding="md" hover className="h-full cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
              <div className="flex items-center space-x-3">
                <FolderOpenIcon className="w-6 h-6" />
                <span className="font-semibold">Portfolio Yönetimi</span>
              </div>
            </AdminCard>
          </Link>

          <AdminCard padding="md" className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <WrenchScrewdriverIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              <span className="font-semibold text-slate-900 dark:text-white">Servis İstatistikleri</span>
            </div>
          </AdminCard>
        </div>

        {/* Services List */}
        <AdminCard title="Servisler" padding="none">
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {services.length === 0 ? (
              <AdminEmptyState
                icon={<WrenchScrewdriverIcon className="w-12 h-12" />}
                title="Henüz servis eklenmemiş"
                description="İlk servisinizi eklemek için 'Yeni Servis' butonuna tıklayın"
              />
            ) : (
              services.map((service) => (
                <div key={service._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Image */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      <div className="w-full h-48 sm:w-20 sm:h-20 relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-700">
                        {service.image ? (
                          <Image
                            src={service.image}
                            alt={service.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-slate-400 dark:text-slate-500 text-xs">Görsel Yok</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {service.title}
                          </h4>
                          <div className="text-slate-600 dark:text-slate-300 mb-3">
                            <HTMLContent
                              content={service.description}
                              truncate={150}
                              className="line-clamp-3"
                            />
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>Aktif servis</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Link
                            href="/services"
                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Görüntüle"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/services/edit/${service._id}`}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-brand-primary-700 dark:hover:text-brand-primary-400 hover:bg-brand-primary-50 dark:hover:bg-brand-primary-900/20 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(service._id)}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
        </AdminCard>
      </div>
    </AdminLayoutNew>
  );
}