'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminSpinner, AdminButton } from '@/components/admin/ui';
import { 
  DocumentTextIcon, 
  UserIcon, 
  WrenchScrewdriverIcon, 
  RectangleStackIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface ContentStats {
  aboutContent: boolean;
  servicesCount: number;
  pagesCount: number;
  sliderCount: number;
}

export default function ContentManagement() {
  const [stats, setStats] = useState<ContentStats>({
    aboutContent: false,
    servicesCount: 0,
    pagesCount: 0,
    sliderCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [aboutRes, servicesRes, pagesRes, sliderRes] = await Promise.all([
          fetch('/api/admin/about'),
          fetch('/api/services'),
          fetch('/api/admin/pages'),
          fetch('/api/admin/slider')
        ]);

        const aboutData = aboutRes.ok ? await aboutRes.json() : null;
        const servicesData = servicesRes.ok ? await servicesRes.json() : [];
        const pagesData = pagesRes.ok ? await pagesRes.json() : [];
        const sliderData = sliderRes.ok ? await sliderRes.json() : [];

        setStats({
          aboutContent: !!aboutData,
          servicesCount: Array.isArray(servicesData) ? servicesData.length : 0,
          pagesCount: Array.isArray(pagesData) ? pagesData.length : 0,
          sliderCount: Array.isArray(sliderData) ? sliderData.length : 0
        });
      } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const contentSections = [
    {
      id: 'about',
      title: 'Hakkımda',
      description: 'Kişisel bilgiler ve hakkımda bölümü',
      icon: UserIcon,
      href: '/admin/about',
      stat: stats.aboutContent ? 'Mevcut' : 'Henüz eklenmedi',
      color: 'bg-blue-500',
      actions: [
        { label: 'Görüntüle', href: '/admin/about', icon: EyeIcon },
        { label: 'Düzenle', href: '/admin/about', icon: PencilIcon }
      ]
    },
    {
      id: 'services',
      title: 'Hizmetler',
      description: 'Sunulan hizmetler ve yetenekler',
      icon: WrenchScrewdriverIcon,
      href: '/admin/services',
      stat: `${stats.servicesCount} hizmet`,
      color: 'bg-brand-primary-600',
      actions: [
        { label: 'Listele', href: '/admin/services', icon: EyeIcon },
        { label: 'Yeni Ekle', href: '/admin/services/new', icon: PlusIcon }
      ]
    },
    {
      id: 'pages',
      title: 'Sayfa Yönetimi',
      description: 'Özel sayfalar ve içerik yönetimi',
      icon: DocumentTextIcon,
      href: '/admin/pages',
      stat: `${stats.pagesCount} sayfa`,
      color: 'bg-purple-500',
      actions: [
        { label: 'Listele', href: '/admin/pages', icon: EyeIcon },
        { label: 'Yeni Ekle', href: '/admin/pages/new', icon: PlusIcon }
      ]
    },
    {
      id: 'slider',
      title: 'Slider',
      description: 'Ana sayfa slider ve banner yönetimi',
      icon: RectangleStackIcon,
      href: '/admin/slider',
      stat: `${stats.sliderCount} slide`,
      color: 'bg-orange-500',
      actions: [
        { label: 'Listele', href: '/admin/slider', icon: EyeIcon },
        { label: 'Yeni Ekle', href: '/admin/slider/new', icon: PlusIcon }
      ]
    }
  ];

  if (loading) {
    return (
      <AdminLayoutNew
        title="İçerik Yönetimi"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'İçerik Yönetimi' }
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <AdminSpinner size="lg" />
        </div>
      </AdminLayoutNew>
    );
  }

  return (
    <AdminLayoutNew
      title="İçerik Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'İçerik Yönetimi' }
      ]}
    >
      <div className="space-y-6">
        {/* Header Info */}
        <AdminCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">İçerik Yönetimi</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Site içeriklerini yönetin ve düzenleyin
              </p>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
            </div>
          </div>
        </AdminCard>

        {/* Content Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contentSections.map((section) => {
            const Icon = section.icon;
            return (
              <AdminCard key={section.id} padding="md" hover>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${section.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {section.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Durum</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {section.stat}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {section.actions.map((action, index) => {
                    const ActionIcon = action.icon;
                    return (
                      <Link key={index} href={action.href}>
                        <AdminButton variant="secondary" size="sm" icon={ActionIcon}>
                          {action.label}
                        </AdminButton>
                      </Link>
                    );
                  })}
                </div>
              </AdminCard>
            );
          })}
        </div>

        {/* Quick Actions */}
        <AdminCard title="Hızlı İşlemler" padding="md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/admin/about"
              className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <UserIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Hakkımda Düzenle</span>
            </Link>
            <Link
              href="/admin/services/new"
              className="flex items-center space-x-2 p-3 bg-brand-primary-50 dark:bg-brand-primary-900/20 rounded-lg hover:bg-brand-primary-100 dark:hover:bg-brand-primary-900/30 transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-brand-primary-600 dark:text-brand-primary-400" />
              <span className="text-sm font-medium text-brand-primary-800 dark:text-brand-primary-300">Yeni Hizmet Ekle</span>
            </Link>
            <Link
              href="/admin/pages/new"
              className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Yeni Sayfa Ekle</span>
            </Link>
            <Link
              href="/admin/slider"
              className="flex items-center space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <RectangleStackIcon className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Slider Düzenle</span>
            </Link>
          </div>
        </AdminCard>
      </div>
    </AdminLayoutNew>
  );
}
