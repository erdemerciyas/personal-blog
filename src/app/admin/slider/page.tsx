'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminEmptyState, AdminBadge, AdminSpinner } from '@/components/admin/ui';
import { PlusIcon, PhotoIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Slider {
  _id: string;
  title: string;
  subtitle: string;
  description?: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

export default function SliderPage() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/slider')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setSliders(data.sort((a: Slider, b: Slider) => a.order - b.order));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch(`/api/admin/slider/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSliders(sliders.filter(s => s._id !== id));
      }
    } catch {
      alert('Silme işlemi başarısız oldu');
    }
  };

  if (loading) {
    return (
      <AdminLayoutNew
        title="Slider Yönetimi"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Slider' }]}
      >
        <div className="flex items-center justify-center py-12">
          <AdminSpinner size="lg" />
        </div>
      </AdminLayoutNew>
    );
  }

  return (
    <AdminLayoutNew
      title="Slider Yönetimi"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Slider' }]}
      actions={<Link href="/admin/slider/new"><AdminButton variant="primary" icon={PlusIcon}>Yeni Slide</AdminButton></Link>}
    >
      <AdminCard title={`Slider (${sliders.length})`} padding="none">
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {sliders.length === 0 ? (
            <div className="p-12">
              <AdminEmptyState 
                icon={<PhotoIcon className="w-12 h-12" />} 
                title="Henüz slide yok" 
                description="İlk slide'ınızı oluşturun" 
              />
            </div>
          ) : (
            sliders.map(slider => (
              <div key={slider._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {slider.imageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={slider.imageUrl} 
                          alt={slider.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {slider.title}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        #{slider.order}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {slider.subtitle}
                    </p>
                    {slider.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 line-clamp-1">
                        {slider.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <AdminBadge variant={slider.isActive ? 'success' : 'neutral'} size="sm">
                      {slider.isActive ? 'Aktif' : 'Pasif'}
                    </AdminBadge>
                    <Link href={`/admin/slider/edit/${slider._id}`}>
                      <AdminButton variant="secondary" size="sm" icon={PencilIcon}>
                        Düzenle
                      </AdminButton>
                    </Link>
                    <AdminButton 
                      variant="danger" 
                      size="sm" 
                      icon={TrashIcon} 
                      onClick={() => handleDelete(slider._id)}
                    >
                      Sil
                    </AdminButton>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </AdminCard>
    </AdminLayoutNew>
  );
}
