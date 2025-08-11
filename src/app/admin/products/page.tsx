'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FixralButton, FixralInput, FixralSelect, FixralCard } from '@/components/ui';

type AdminListProduct = { _id: string; title: string; condition: 'new'|'used'; stock: number; coverImage?: string };

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminListProduct[]>([]);
  const [q, setQ] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('created');
  const [cats, setCats] = useState<Array<{ _id: string; name: string }>>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/product-categories').then(r=>r.json()).then(d=>setCats((d.items as Array<{_id:string; name:string}>)||[])).catch(()=>setCats([]));
  }, []);

  async function reload() {
    const sp = new URLSearchParams({ q, condition, category, sort, page: String(page), limit: String(limit) });
    setLoading(true);
    try {
      const d = await fetch(`/api/admin/products?${sp.toString()}`).then((r) => r.json());
      setItems(d.items || []);
      setTotal(d.total || 0);
      setSelected({});
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [q, condition, category, sort, page, limit]);

  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  const conditionOptions = [
    { value: '', label: 'Durum (hepsi)' },
    { value: 'new', label: 'Sıfır' },
    { value: 'used', label: 'İkinci El' },
  ];
  const sortOptions = [
    { value: 'created', label: 'Yeni Eklenen' },
    { value: 'priceAsc', label: 'Fiyat Artan' },
    { value: 'priceDesc', label: 'Fiyat Azalan' },
  ];
  const categoryOptions = [
    { value: '', label: 'Kategori (hepsi)' },
    ...cats.map((c) => ({ value: c._id, label: c.name }))
  ];
  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminLayout 
      title="Ürünler"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Ürün Yönetimi', href: '/admin/products' },
        { label: 'Tüm Ürünler' }
      ]}
    >
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">Ürün Yönetimi / <span className="text-slate-700">Tüm Ürünler</span></div>
          <h1 className="text-xl font-semibold mt-1">Ürünler</h1>
        </div>
        {/* Header sağdaki hızlı aksiyon kaldırıldı */}
      </div>

      {/* Filters Bar */}
      <FixralCard>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <FixralInput placeholder="Ara..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <FixralSelect value={condition} onChange={(e)=>{ setCondition((e.target as HTMLSelectElement).value); setPage(1); }} options={conditionOptions} />
          <FixralSelect value={category} onChange={(e)=>{ setCategory((e.target as HTMLSelectElement).value); setPage(1); }} options={categoryOptions} />
          <FixralSelect value={sort} onChange={(e)=>{ setSort((e.target as HTMLSelectElement).value); setPage(1); }} options={sortOptions} />
          <FixralSelect value={String(limit)} onChange={(e)=>{ setLimit(Number((e.target as HTMLSelectElement).value)); setPage(1); }} options={[
            { value: '10', label: '10 / sayfa' },
            { value: '20', label: '20 / sayfa' },
            { value: '50', label: '50 / sayfa' },
          ]} />
          <div className="flex items-center justify-end">
            <Link href="/admin/products/new">
              <FixralButton size="sm" variant="secondary">Yeni Ürün</FixralButton>
            </Link>
          </div>
        </div>
      </FixralCard>

      {/* Bulk actions */}
      <div className="flex items-center gap-2">
        <FixralButton
          disabled={selectedIds.length === 0}
          onClick={async ()=>{
            const ids = selectedIds;
            await fetch('/api/admin/products/batch', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'activate', ids }) });
            await reload();
          }}
          variant="primary"
          size="sm"
        >Aktif Yap</FixralButton>
        <FixralButton
          disabled={selectedIds.length === 0}
          onClick={async ()=>{
            const ids = selectedIds;
            await fetch('/api/admin/products/batch', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'deactivate', ids }) });
            await reload();
          }}
          variant="secondary"
          size="sm"
        >Pasif Yap</FixralButton>
        <FixralButton
          disabled={selectedIds.length === 0}
          onClick={async ()=>{
            const ids = selectedIds;
            await fetch('/api/admin/products/batch', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'delete', ids }) });
            await reload();
          }}
          variant="danger"
          size="sm"
        >Seçileni Sil</FixralButton>
      </div>

      {/* List */}
      <FixralCard className="p-0 overflow-hidden">
        <div className="hidden md:grid grid-cols-[40px_70px_1.6fr_1fr_1fr_160px] gap-4 px-4 py-3 bg-slate-50 text-xs font-medium text-slate-500">
          <div>
            <input type="checkbox" aria-label="Tümünü seç" onChange={(e)=>{
              const checked = e.target.checked;
              const map: Record<string, boolean> = {};
              items.forEach(it=>{ map[it._id] = checked; });
              setSelected(map);
            }} />
          </div>
          <div>Görsel</div>
          <div>Başlık</div>
          <div>Durum</div>
          <div>Stok</div>
          <div>Aksiyon</div>
        </div>
        <div className="divide-y">
          {loading && (
            <div className="px-4 py-6 text-sm text-slate-500">Yükleniyor...</div>
          )}
          {!loading && items.map((p: AdminListProduct) => (
            <div key={p._id} className="grid grid-cols-1 md:grid-cols-[40px_70px_1.6fr_1fr_1fr_160px] items-center gap-4 px-4 py-3">
              <div>
                <input type="checkbox" checked={!!selected[p._id]} onChange={(e)=>setSelected(prev=>({ ...prev, [p._id]: e.target.checked }))} />
              </div>
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.coverImage || '/placeholder.png'} alt={p.title} className="w-14 h-10 object-cover rounded border" />
              </div>
              <div>
                <div className="font-medium text-slate-900">{p.title}</div>
              </div>
              <div>
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${p.condition === 'new' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {p.condition === 'new' ? 'Sıfır' : 'İkinci El'}
                </span>
              </div>
              <div className="text-slate-700">{p.stock}</div>
              <div className="flex gap-2">
                <Link href={`/admin/products/edit/${p._id}`}>
                  <FixralButton size="sm" variant="outline">Düzenle</FixralButton>
                </Link>
                <FixralButton size="sm" variant="danger" onClick={async()=>{
                  if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
                  await fetch(`/api/admin/products/${p._id}`, { method:'DELETE' });
                  await reload();
                }}>Sil</FixralButton>
              </div>
            </div>
          ))}
          {items.length === 0 && !loading && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">Kayıt bulunamadı</div>
          )}
        </div>
      </FixralCard>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <div>
          Toplam {total} kayıt • Sayfa {page} / {pageCount}
        </div>
        <div className="flex items-center gap-2">
          <FixralButton size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Önceki</FixralButton>
          <FixralButton size="sm" variant="ghost" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>Sonraki</FixralButton>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}


