'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminEmptyState } from '@/components/admin/ui';
import { PlusIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Media {
  _id: string;
  url: string;
  filename: string;
  size: number;
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/media')
      .then(r => r.ok ? r.json() : [])
      .then(data => setMedia(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return;
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    setMedia(media.filter(m => m._id !== id));
  };

  return (
    <AdminLayoutNew
      title="Medya Yönetimi"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Medya' }]}
      actions={<AdminButton variant="primary" icon={PlusIcon}>Yükle</AdminButton>}
    >
      <AdminCard title="Medya Dosyaları" padding="md">
        {media.length === 0 ? (
          <AdminEmptyState icon={<PhotoIcon className="w-12 h-12" />} title="Henüz medya yok" description="İlk medya dosyanızı yükleyin" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map(item => (
              <div key={item._id} className="relative group">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image src={item.url} alt={item.filename} fill className="object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <AdminButton variant="danger" size="sm" icon={TrashIcon} onClick={() => handleDelete(item._id)}>Sil</AdminButton>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">{item.filename}</p>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </AdminLayoutNew>
  );
}
