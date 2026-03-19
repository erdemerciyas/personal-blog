'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PhotoIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  TagIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { PageHeader, Card, Badge, Button } from '@/components/ui';

interface PortfolioItem {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  status: 'published' | 'draft';
  category?: string;
  coverImage?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminPortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadPortfolio();
  }, [status, router]);

  const loadPortfolio = async () => {
    try {
      const response = await fetch('/api/admin/portfolio');
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          ...item,
          title: item.title || item.name || item.translations?.tr?.title || item.translations?.en?.title || 'İsimsiz Proje',
          status: item.isActive === true ? 'published' : (item.isActive === false ? 'draft' : 'published'),
          description: item.description || item.translations?.tr?.description || '',
          category: item.category || (item.categoryId ? 'Bağlı Kategori' : 'Kategorisiz'),
          coverImage: item.coverImage || item.image || item.thumbnail || ''
        }));
        setPortfolioItems(mappedData);
      }
    } catch (error) {
      console.error('Portfolyo yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/portfolio/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPortfolioItems(portfolioItems.filter(item => item._id !== itemId));
        if (selectedItems.has(itemId)) {
          const newSelected = new Set(selectedItems);
          newSelected.delete(itemId);
          setSelectedItems(newSelected);
        }
      }
    } catch (error) {
      console.error('Proje silinirken hata:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedItems.size} öğeyi silmek istediğinizden emin misiniz?`)) return;

    try {
      await Promise.all(
        Array.from(selectedItems).map(id =>
          fetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' })
        )
      );
      setPortfolioItems(portfolioItems.filter(item => !selectedItems.has(item._id)));
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Projeler silinirken hata:', error);
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const filteredItems = portfolioItems.filter(item => {
    const title = item.title || '';
    const description = item.description || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-brand-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-brand-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-600">Portfolyo yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Portfolyo"
        description="Projelerinizi yönetin ve düzenleyin"
        actions={
          <div className="flex items-center gap-3">
            {selectedItems.size > 0 && (
              <Button variant="danger" size="sm" onClick={handleBulkDelete} className="hidden sm:inline-flex">
                <TrashIcon className="w-4 h-4" />
                {selectedItems.size} Sil
              </Button>
            )}
            <Button variant="primary" size="lg" onClick={() => router.push('/admin/portfolio/new')}>
              <PlusIcon className="w-5 h-5" />
              Yeni Proje
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <Card padding="sm" className="sticky top-24 z-10">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full lg:w-auto relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Proje ara..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <div className="flex bg-surface-tertiary p-1 rounded-xl shrink-0">
              {(['all', 'published', 'draft'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === s
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {s === 'all' ? 'Tümü' : s === 'published' ? 'Yayında' : 'Taslak'}
                </button>
              ))}
            </div>

            <div className="w-px h-8 bg-border mx-1 shrink-0 hidden sm:block"></div>

            <div className="flex bg-surface-tertiary p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                title="Izgara Görünümü"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                title="Liste Görünümü"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Bulk Delete */}
        {selectedItems.size > 0 && (
          <div className="mt-3 pt-3 border-t border-border-subtle flex sm:hidden justify-between items-center px-1">
            <span className="text-sm font-medium text-gray-600">{selectedItems.size} seçildi</span>
            <button
              onClick={handleBulkDelete}
              className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg"
            >
              Sil
            </button>
          </div>
        )}
      </Card>

      {/* Content Area */}
      {filteredItems.length === 0 ? (
        <Card className="border-dashed py-20 text-center">
          <div className="flex flex-col items-center justify-center">
            <PhotoIcon className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Proje Bulunamadı</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md px-4">
              Aradığınız kriterlere uygun proje bulunamadı veya henüz hiç proje eklemediniz.
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link
                href="/admin/portfolio/new"
                className="inline-flex items-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                İlk Projeyi Ekle
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <li
                  key={item._id}
                  className={`group relative bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden hover:shadow-xl hover:-translate-y-1 ${selectedItems.has(item._id)
                      ? 'ring-2 ring-brand-500 border-transparent'
                      : 'border-border'
                    }`}
                  onClick={() => handleSelectItem(item._id)}
                >
                  {/* Selection Checkbox */}
                  <div className={`absolute top-3 left-3 z-10 p-1 bg-white/90 backdrop-blur rounded-lg shadow-sm transition-opacity duration-200 ${selectedItems.has(item._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item._id)}
                      onChange={(e) => { e.stopPropagation(); handleSelectItem(item._id); }}
                      className="w-5 h-5 text-brand-600 border-gray-300 rounded focus:ring-brand-500 cursor-pointer block"
                    />
                  </div>

                  {/* Image Container */}
                  <div className="aspect-[4/3] bg-surface-tertiary relative overflow-hidden">
                    {item.coverImage || (item.images && item.images.length > 0) ? (
                      <img
                        src={item.coverImage || item.images![0]}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <PhotoIcon className="w-16 h-16" />
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end gap-2">
                      <Link
                        href={`/admin/portfolio/edit/${item._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white hover:text-gray-900 transition-colors"
                        title="Düzenle"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                        className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                        title="Sil"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 shadow-sm ${item.status === 'published'
                          ? 'bg-success/90 text-white'
                          : 'bg-warning/90 text-white'
                        }`}>
                        {item.status === 'published' ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2 text-xs font-medium text-brand-600">
                      <TagIcon className="w-3.5 h-3.5" />
                      <span className="uppercase tracking-wider truncate">{item.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
                      {item.description ? item.description.replace(/<[^>]+>/g, '') : 'Açıklama yok'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle text-xs text-gray-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Card padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-surface-secondary border-b border-border font-semibold text-gray-700 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                          onChange={() => {
                            if (selectedItems.size === filteredItems.length) setSelectedItems(new Set());
                            else setSelectedItems(new Set(filteredItems.map(i => i._id)));
                          }}
                          className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 rounded cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-4">Proje Detayları</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Durum</th>
                      <th className="px-6 py-4 text-right">Tarih</th>
                      <th className="px-6 py-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {filteredItems.map(item => (
                      <tr
                        key={item._id}
                        className={`group hover:bg-surface-secondary/80 transition-colors ${selectedItems.has(item._id) ? 'bg-brand-50/30' : ''}`}
                        onClick={() => handleSelectItem(item._id)}
                      >
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item._id)}
                            onChange={() => handleSelectItem(item._id)}
                            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 bg-surface-tertiary rounded-lg overflow-hidden shrink-0 border border-border">
                              {item.coverImage || (item.images && item.images.length > 0) ? (
                                <img
                                  src={item.coverImage || item.images![0]}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <PhotoIcon className="w-6 h-6 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{item.title}</div>
                              <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{item.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-tertiary text-gray-600 text-xs font-medium">
                            <TagIcon className="w-3 h-3 mr-1.5" />
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={item.status === 'published' ? 'success' : 'warning'}>
                            {item.status === 'published' ? 'Yayında' : 'Taslak'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-mono text-gray-500">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/admin/portfolio/edit/${item._id}`}
                              onClick={e => e.stopPropagation()}
                              className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
