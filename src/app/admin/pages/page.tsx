'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminEmptyState, AdminBadge } from '@/components/admin/ui';
import { PlusIcon, DocumentTextIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Page {
  _id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

export default function PagesManagement() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/pages')
      .then(r => r.ok ? r.json() : [])
      .then(data => setPages(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayoutNew
      title="Sayfa Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Sayfalar' }
      ]}
      actions={
        <Link href="/admin/pages/new">
          <AdminButton variant="primary" icon={PlusIcon}>Yeni Sayfa</AdminButton>
        </Link>
      }
    >
      <AdminCard title="Sayfalar" padding="none">
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {pages.length === 0 ? (
            <AdminEmptyState
              icon={<DocumentTextIcon className="w-12 h-12" />}
              title="Henüz sayfa yok"
              description="İlk sayfanızı oluşturun"
            />
          ) : (
            pages.map(page => (
              <div key={page._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{page.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AdminBadge variant={page.isPublished ? 'success' : 'neutral'} size="sm">
                      {page.isPublished ? 'Yayında' : 'Taslak'}
                    </AdminBadge>
                    <Link href={`/admin/pages/edit/${page._id}`}>
                      <AdminButton variant="secondary" size="sm" icon={PencilIcon}>Düzenle</AdminButton>
                    </Link>
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
