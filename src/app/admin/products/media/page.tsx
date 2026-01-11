'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  LinkIcon,
  PhotoIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

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
    } catch {
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
    } catch {
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return null;

  return (
          <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ürün Medya Kütüphanesi</h1>
            <p className="text-sm text-slate-500 mt-1">Ürün görsellerini ve dosyalarını yönetin</p>
          </div>
          <button
            disabled
            title="Ürün medyası, ilgili ürün sayfalarındaki yükleme alanlarından eklenmelidir"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm bg-slate-200 text-slate-500 cursor-not-allowed"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Dosya Yükle</span>
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-4 rounded-2xl flex items-center space-x-3 ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckIcon className="w-5 h-5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Dosya ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'images')}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="all">Tümü</option>
            <option value="images">Sadece Görseller</option>
          </select>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map((item) => (
              <div key={item._id} className="relative bg-white border border-slate-200/60 rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200">
                <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                  {item.mimeType.startsWith('image/') ? (
                    <Image
                      src={item.url}
                      alt={item.originalName}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-slate-400">
                      <DocumentIcon className="w-12 h-12 mb-2" />
                      <div className="text-xs font-medium">{item.mimeType}</div>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <div className="text-xs font-medium text-slate-900 truncate" title={item.originalName}>
                    {item.originalName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatFileSize(item.size)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg transition-all"
                      onClick={() => {
                        navigator.clipboard.writeText(item.url);
                        setMessage({ type: 'success', text: 'URL kopyalandı' });
                        setTimeout(() => setMessage(null), 1500);
                      }}
                    >
                      <LinkIcon className="w-4 h-4" /> Kopyala
                    </button>
                    <button
                      className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg transition-all"
                      onClick={() => deleteItem(item._id)}
                    >
                      <TrashIcon className="w-4 h-4" /> Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <PhotoIcon className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Kayıt bulunamadı</p>
                <p className="text-sm text-slate-400 mt-1">Arama kriterlerinize uygun medya dosyası yok</p>
              </div>
            )}
          </div>
        )}
      </div>
      );
}
