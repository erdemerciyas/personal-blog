'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

type ProductCategory = { _id: string; name: string; description?: string; isActive: boolean };

export default function AdminProductCategoriesPage() {
  const [items, setItems] = useState<ProductCategory[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  async function load() {
    const res = await fetch('/api/admin/product-categories');
    const data = res.ok ? await res.json() : { items: [] as ProductCategory[] };
    setItems((data.items as ProductCategory[]) || []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    const res = await fetch('/api/admin/product-categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description: desc }) });
    if (res.ok) { setName(''); setDesc(''); load(); }
  }
  async function update(id: string, body: Partial<ProductCategory>) {
    const res = await fetch(`/api/admin/product-categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) load();
  }
  async function remove(id: string) {
    const res = await fetch(`/api/admin/product-categories/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  }

  return (
    <AdminLayout
      title="Ürün Kategorileri"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Ürün Yönetimi', href: '/admin/products' },
        { label: 'Ürün Kategorileri' }
      ]}
    >
    <div className="space-y-4">
      <div className="text-sm text-slate-500">Ürün Yönetimi / <span className="text-slate-700">Ürün Kategorileri</span></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input placeholder="Kategori adı" className="border px-3 py-2 rounded w-full" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Açıklama (opsiyonel)" className="border px-3 py-2 rounded w-full" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <button onClick={add} className="px-3 py-2 bg-emerald-600 text-white rounded">Ekle</button>
      </div>

      <div className="grid gap-2">
        {items.map((c) => (
          <div key={c._id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              {c.description && <div className="text-sm text-gray-500">{c.description}</div>}
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-gray-100 rounded" onClick={() => update(c._id, { isActive: !c.isActive })}>{c.isActive ? 'Pasif Yap' : 'Aktif Yap'}</button>
              <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={() => remove(c._id)}>Sil</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">Kategori yok</div>}
      </div>
    </div>
    </AdminLayout>
  );
}


