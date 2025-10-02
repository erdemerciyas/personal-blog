'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminEmptyState, AdminBadge } from '@/components/admin/ui';
import { PlusIcon, PhotoIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Slider {
  _id: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  order: number;
}

export default function SliderPage() {
  const [sliders, setSliders] = useState<Slider[]>([]);

  useEffect(() => {
    fetch('/api/admin/slider')
      .then(r => r.ok ? r.json() : [])
      .then(data => setSliders(data));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return;
    await fetch(`/api/admin/slider/${id}`, { method: 'DELETE' });
    setSliders(sliders.filter(s => s._id !== id));
  };

  return (
    <AdminLayoutNew
      title="Slider Yönetimi"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Slider' }]}
      actions={<Link href="/admin/slider/new"><AdminButton variant="primary" icon={PlusIcon}>Yeni Slide</AdminButton></Link>}
    >
      <AdminCard title="Slider" padding="none">
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {sliders.length === 0 ? (
            <AdminEmptyState icon={<PhotoIcon className="w-12 h-12" />} title="Henüz slide yok" description="İlk slide'ınızı oluşturun" />
          ) : (
            sliders.map(slider => (
              <div key={slider._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{slider.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{slider.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AdminBadge variant={slider.isActive ? 'success' : 'neutral'} size="sm">
                      {slider.isActive ? 'Aktif' : 'Pasif'}
                    </AdminBadge>
                    <Link href={`/admin/slider/edit/${slider._id}`}>
                      <AdminButton variant="secondary" size="sm" icon={PencilIcon}>Düzenle</AdminButton>
                    </Link>
                    <AdminButton variant="danger" size="sm" icon={TrashIcon} onClick={() => handleDelete(slider._id)}>Sil</AdminButton>
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
