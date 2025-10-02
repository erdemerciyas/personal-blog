'use client';

import { useEffect, useState } from 'react';
import { AdminLayoutNew } from '@/components/admin/layout';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminEmptyState,
  AdminBadge
} from '@/components/admin/ui';
import { PlusIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';

type ProductCategory = {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
};

export default function AdminProductCategoriesPage() {
  const [items, setItems] = useState<ProductCategory[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  async function load() {
    const res = await fetch('/api/admin/product-categories');
    const data = res.ok ? await res.json() : { items: [] as ProductCategory[] };
    setItems((data.items as ProductCategory[]) || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!name.trim()) return;
    const res = await fetch('/api/admin/product-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc }),
    });
    if (res.ok) {
      setName('');
      setDesc('');
      load();
    }
  }

  async function update(id: string, body: Partial<ProductCategory>) {
    const res = await fetch(`/api/admin/product-categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) load();
  }

  async function remove(id: string) {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;
    const res = await fetch(`/api/admin/product-categories/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  }

  return (
    <AdminLayoutNew
      title="Ürün Kategorileri"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Ürün Yönetimi', href: '/admin/products' },
        { label: 'Kategoriler' },
      ]}
    >
      <div className="space-y-6">
        {/* Add Category Form */}
        <AdminCard title="Yeni Kategori Ekle" padding="md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminInput
              placeholder="Kategori adı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <AdminInput
              placeholder="Açıklama (opsiyonel)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <AdminButton variant="primary" onClick={add} icon={PlusIcon} disabled={!name.trim()}>
              Ekle
            </AdminButton>
          </div>
        </AdminCard>

        {/* Categories List */}
        <AdminCard title="Kategoriler" padding="none">
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {items.length === 0 ? (
              <AdminEmptyState
                icon={<TagIcon className="w-12 h-12" />}
                title="Kategori bulunamadı"
                description="İlk kategorinizi eklemek için yukarıdaki formu kullanın"
              />
            ) : (
              items.map((c) => (
                <div
                  key={c._id}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-slate-900 dark:text-white">{c.name}</h3>
                        <AdminBadge variant={c.isActive ? 'success' : 'neutral'} size="sm">
                          {c.isActive ? 'Aktif' : 'Pasif'}
                        </AdminBadge>
                      </div>
                      {c.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">{c.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <AdminButton
                        variant="secondary"
                        size="sm"
                        onClick={() => update(c._id, { isActive: !c.isActive })}
                      >
                        {c.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                      </AdminButton>
                      <AdminButton
                        variant="danger"
                        size="sm"
                        icon={TrashIcon}
                        onClick={() => remove(c._id)}
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
      </div>
    </AdminLayoutNew>
  );
}
