'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

type AdminReview = { _id: string; rating: number; comment?: string; createdAt: string; product?: { title: string } };

export default function AdminProductReviewsPage() {
  const [items, setItems] = useState<AdminReview[]>([]);
  const [status, setStatus] = useState<'pending'|'approved'|'rejected'>('pending');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/product-reviews?status=${status}`);
    const data = res.ok ? await res.json() : { items: [] };
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function update(reviewId: string, next: 'approved'|'rejected'|'pending') {
    const res = await fetch('/api/admin/product-reviews', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reviewId, status: next }) });
    if (res.ok) load();
  }

  return (
    <AdminLayout
      title="Ürün Yorumları"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Ürün Yönetimi', href: '/admin/products' },
        { label: 'Ürün Yorumları' }
      ]}
    >
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">Ürün Yönetimi / <span className="text-slate-700">Ürün Yorumları</span></div>
          <h1 className="text-xl font-semibold mt-1">Ürün Yorumları</h1>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as 'pending'|'approved'|'rejected')} className="border px-3 py-2 rounded">
          <option value="pending">Beklemede</option>
          <option value="approved">Onaylı</option>
          <option value="rejected">Reddedilen</option>
        </select>
      </div>
      {loading ? <div>Yükleniyor...</div> : (
        <div className="space-y-3">
          {items.map((r: AdminReview) => (
            <div key={r._id} className="border rounded p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.product?.title || 'Ürün'}</div>
                <div className="text-sm text-gray-500">Puan: {r.rating} • {new Date(r.createdAt).toLocaleString('tr-TR')}</div>
                {r.comment && <div className="text-sm mt-1">{r.comment}</div>}
              </div>
              <div className="flex gap-2">
                {status !== 'approved' && <button className="px-3 py-2 bg-emerald-600 text-white rounded" onClick={() => update(r._id, 'approved')}>Onayla</button>}
                {status !== 'rejected' && <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={() => update(r._id, 'rejected')}>Reddet</button>}
                {status !== 'pending' && <button className="px-3 py-2 bg-gray-100 rounded" onClick={() => update(r._id, 'pending')}>Beklemeye Al</button>}
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-gray-500">Kayıt bulunamadı</div>}
        </div>
      )}
    </div>
    </AdminLayout>
  );
}


