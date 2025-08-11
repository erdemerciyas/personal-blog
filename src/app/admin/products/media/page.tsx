'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline';

type MediaItem = {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string | Date;
  source?: 'cloudinary' | 'local';
  publicId?: string;
};

export default function AdminProductMediaPage() {
  const { status } = useSession();
  const router = useRouter();

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'images'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  async function loadMedia() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media?pageContext=products');
      if (!res.ok) throw new Error('Medya yüklenemedi');
      const items: MediaItem[] = await res.json();
      setMediaItems(items);
    } catch (e) {
      setMessage({ type: 'error', text: 'Medya listelenirken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(mediaId: string) {
    if (!confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [mediaId] }),
      });
      if (!res.ok) throw new Error('Silme başarısız');
      setMessage({ type: 'success', text: 'Dosya silindi' });
      await loadMedia();
      setTimeout(() => setMessage(null), 2000);
    } catch (e) {
      setMessage({ type: 'error', text: 'Dosya silinirken hata oluştu.' });
    }
  }

  useEffect(() => {
    if (status === 'authenticated') loadMedia();
  }, [status]);

  const filtered = mediaItems.filter((item) => {
    const matchesType = filter === 'all' || item.mimeType.startsWith('image/');
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || item.originalName.toLowerCase().includes(term) || item.filename.toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return null;

  return (
    <AdminLayout
      title="Ürün Medya Kütüphanesi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Ürün Yönetimi', href: '/admin/products' },
        { label: 'Medya Kütüphanesi' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">
              Ürün Yönetimi / <span className="text-slate-700">Medya Kütüphanesi</span>
            </div>
            <h1 className="text-xl font-semibold mt-1">Ürün Medyası</h1>
          </div>
          <button
            disabled
            title="Ürün medyası, ilgili ürün sayfalarındaki yükleme alanlarından eklenmelidir"
            className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-sm bg-slate-300 text-slate-500 cursor-not-allowed"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Dosya Yükle</span>
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Dosya ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'images')}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
          >
            <option value="all">Tümü</option>
            <option value="images">Sadece Görseller</option>
          </select>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3">
            {filtered.map((item) => (
              <div key={item._id} className="relative bg-white border border-slate-200 rounded-lg overflow-hidden group">
                <div className="aspect-square bg-slate-50 flex items-center justify-center">
                  {item.mimeType.startsWith('image/') ? (
                    <Image src={item.url} alt={item.originalName} width={400} height={400} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 text-xs p-4">{item.mimeType}</div>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <div className="text-xs text-slate-900 truncate" title={item.originalName}>
                    {item.originalName}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-xs text-blue-700 hover:underline inline-flex items-center gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(item.url);
                        setMessage({ type: 'success', text: 'URL kopyalandı' });
                        setTimeout(() => setMessage(null), 1500);
                      }}
                    >
                      <LinkIcon className="w-4 h-4" /> Kopyala
                    </button>
                    <button
                      className="text-xs text-red-700 hover:underline inline-flex items-center gap-1"
                      onClick={() => deleteItem(item._id)}
                    >
                      <TrashIcon className="w-4 h-4" /> Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-sm text-slate-500 py-10">Kayıt bulunamadı</div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


