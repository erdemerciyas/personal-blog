'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

interface MediaItem {
  _id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
  source: 'upload' | 'cloudinary';
}

export default function AdminMediaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'images' | 'videos' | 'documents'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadMedia();
  }, [status, router]);

  const [error, setError] = useState<string | null>(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching media...');
      const response = await fetch('/api/admin/media');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Media API Response:', data);

      if (!Array.isArray(data)) {
        console.error('API response is not an array:', data);
        if (data.error) {
          throw new Error(data.error);
        }
        throw new Error('Veri formatı hatalı (Liste bekleniyordu)');
      }

      const mappedData = data.map((item: any) => {
        return {
          ...item,
          name: item.name || item.filename || 'İsimsiz',
          type: item.mimeType || item.type || (item.resource_type === 'image' ? ('image/' + item.format) : 'application/octet-stream'),
          url: item.url || '',
          size: item.size || 0,
          source: item.source || 'upload'
        };
      });

      mappedData.sort((a: MediaItem, b: MediaItem) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setMediaItems(mappedData);
    } catch (error: any) {
      console.error('Medya yüklenirken hata:', error);
      setError(error.message || 'Medya yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
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

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item._id)));
    }
  };

  const handleDelete = async (itemIds: string[]) => {
    if (!confirm(`${itemIds.length} öğeyi silmek istediğinizden emin misiniz?`)) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaIds: itemIds }),
      });

      if (response.ok) {
        setMediaItems(mediaItems.filter(item => !itemIds.includes(item._id)));
        setSelectedItems(new Set());
        if (previewItem && itemIds.includes(previewItem._id)) {
          setShowPreviewModal(false);
          setPreviewItem(null);
        }
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        alert('Silme işlemi başarısız oldu: ' + (errorData.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Medya silinirken hata:', error);
      alert('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (item: MediaItem) => {
    setPreviewItem(item);
    setShowPreviewModal(true);
  };

  const filteredItems = useMemo(() => {
    return mediaItems.filter(item => {
      const itemName = item.name || '';
      const itemType = item.type || '';
      const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'images' && itemType.startsWith('image/')) ||
        (filter === 'videos' && itemType.startsWith('video/')) ||
        (filter === 'documents' && !itemType.startsWith('image/') && !itemType.startsWith('video/'));
      return matchesSearch && matchesFilter;
    });
  }, [mediaItems, searchQuery, filter]);

  const formatFileSize = (bytes: number) => {
    if (!bytes && bytes !== 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Tarih yok';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Medya yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medya Kütüphanesi</h1>
          <p className="text-slate-500 mt-1">
            Toplam {mediaItems.length} dosya, {formatFileSize(mediaItems.reduce((acc, item) => acc + item.size, 0))}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedItems.size > 0 && (
            <button
              onClick={() => handleDelete(Array.from(selectedItems))}
              className="hidden sm:inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
            >
              <TrashIcon className="w-5 h-5 mr-2" />
              {selectedItems.size} Sil
            </button>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
          >
            <CloudArrowUpIcon className="w-5 h-5 mr-2" />
            Dosya Yükle
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 sticky top-4 z-20 backdrop-blur-xl bg-white/90">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          {/* Left: Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
            <div className="relative flex-1 min-w-[240px]">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Dosya ara..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full">
              {(['all', 'images', 'videos', 'documents'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === f
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                >
                  {f === 'all' ? 'Tümü' : f === 'images' ? 'Görseller' : f === 'videos' ? 'Videolar' : 'Belgeler'}
                </button>
              ))}
            </div>
          </div>

          {/* Right: View & Actions */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="Izgara Görünümü"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="Liste Görünümü"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 transition-all"
              />
              <span className="text-sm font-medium text-slate-700 hidden sm:inline">Tümünü Seç</span>
            </label>
          </div>
        </div>

        {/* Mobile Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="sm:hidden mt-4 pt-4 border-t border-slate-200 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-slate-600">{selectedItems.size} seçildi</span>
            <button
              onClick={() => handleDelete(Array.from(selectedItems))}
              className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Sil
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {filteredItems.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`group relative w-full bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer transition-all duration-200 ${selectedItems.has(item._id)
                  ? 'ring-2 ring-indigo-500 border-transparent shadow-indigo-100'
                  : 'border-slate-200 hover:shadow-md hover:border-indigo-300'
                  }`}
                onClick={() => handleSelectItem(item._id)}
              >
                {/* Aspect Ratio Maintainer - Manual Padding Hack */}
                <div className="pb-[100%]" />

                {/* Content Container - Absolute fill */}
                <div className="absolute inset-0 w-full h-full">
                  {/* Main Content */}
                  <div className="w-full h-full relative">
                    {item.type.startsWith('image/') ? (
                      <div className="w-full h-full relative">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-4 text-slate-400">
                        {item.type.startsWith('video/') ? (
                          <VideoIcon className="w-12 h-12 mb-2" />
                        ) : (
                          <DocumentIcon className="w-12 h-12 mb-2" />
                        )}
                        <span className="text-xs text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 truncate w-full px-2">
                          {item.type.split('/')[1] || 'File'}
                        </span>
                      </div>
                    )}

                    {/* Overlay for Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 z-20">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(item);
                          }}
                          className="p-1.5 bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-slate-900 rounded-lg transition-all"
                          title="Önizle"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete([item._id]);
                          }}
                          className="p-1.5 bg-white/10 backdrop-blur-md hover:bg-red-500 text-white rounded-lg transition-all"
                          title="Sil"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox - Absolute Top Left */}
                  <div className={`absolute top-2 left-2 z-30 transition-all duration-200 ${selectedItems.has(item._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="bg-white rounded-md shadow-sm p-0.5">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer block"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Cloudinary Badge - Absolute Top Right */}
                  {item.source === 'cloudinary' && (
                    <div className="absolute top-2 right-2 z-20 opacity-75 group-hover:opacity-100 transition-opacity">
                      <CloudArrowUpIcon className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-4 py-3">Dosya</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Boyut</th>
                    <th className="px-4 py-3 hidden md:table-cell">Tür</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Tarih</th>
                    <th className="px-4 py-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedItems.has(item._id) ? 'bg-indigo-50/50' : ''}`}
                      onClick={() => handleSelectItem(item._id)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item._id)}
                          onChange={() => handleSelectItem(item._id)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0 overflow-hidden relative border border-slate-200">
                            {item.type.startsWith('image/') ? (
                              <Image src={item.url} alt={item.name} fill className="object-cover" />
                            ) : (
                              <DocumentIcon className="w-6 h-6 m-2 text-slate-400" />
                            )}
                          </div>
                          <div className="flex flex-col max-w-[200px] sm:max-w-xs">
                            <span className="font-medium text-slate-900 truncate" title={item.name}>{item.name}</span>
                            <span className="text-xs text-slate-500 sm:hidden">{formatFileSize(item.size)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">{formatFileSize(item.size)}</td>
                      <td className="px-4 py-3 hidden md:table-cell font-mono text-xs">{item.type}</td>
                      <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePreview(item); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete([item._id]); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <PhotoIcon className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Medya bulunamadı</h3>
          <p className="text-slate-500 mb-6 text-center max-w-md">
            {searchQuery || filter !== 'all'
              ? 'Arama kriterlerinize uygun dosya bulunamadı. Filtreleri temizlemeyi deneyin.'
              : 'Görsellerinizi ve dosyalarınızı buraya yükleyerek <br/> kütüphanenizi oluşturmaya başlayın.'
            }
          </p>
          {(!searchQuery && filter === 'all') && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <CloudArrowUpIcon className="w-5 h-5 mr-2" />
              Dosya Yükle
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Dosya Yükle</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <label
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CloudArrowUpIcon className="w-8 h-8" />
                  </div>
                  <p className="mb-2 text-lg font-medium text-slate-700">Tıklayın veya sürükleyin</p>
                  <p className="text-sm text-slate-500">PNG, JPG, GIF veya PDF (Maks. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setLoading(true);
                      setShowUploadModal(false);
                      const formData = new FormData();
                      Array.from(e.target.files).forEach(file => {
                        formData.append('file', file);
                      });

                      try {
                        const res = await fetch('/api/admin/upload', {
                          method: 'POST',
                          body: formData
                        });
                        if (res.ok) {
                          await loadMedia();
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewItem && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200" onClick={() => setShowPreviewModal(false)}>
          <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row gap-6 bg-transparent" onClick={e => e.stopPropagation()}>
            {/* Image Container */}
            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center bg-black/40 rounded-2xl overflow-hidden relative group min-h-[300px]">
              {previewItem.type.startsWith('image/') ? (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={previewItem.url}
                    alt={previewItem.name}
                    className="max-w-full max-h-[80vh] w-auto h-auto object-contain drop-shadow-2xl"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center text-white/80">
                  <DocumentIcon className="w-24 h-24 mb-4" />
                  <p className="text-xl font-medium">Önizleme yok</p>
                </div>
              )}
            </div>

            {/* Sidebar Details */}
            <div className="w-full md:w-80 bg-white rounded-2xl shadow-2xl overflow-hidden shrink-0 flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900 truncate pr-4" title={previewItem.name}>{previewItem.name}</h3>
                <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-slate-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dosya Türü</label>
                    <p className="text-sm font-medium text-slate-700 mt-1 font-mono bg-slate-100 px-2 py-1 rounded w-fit">{previewItem.type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Boyut</label>
                    <p className="text-sm font-medium text-slate-700 mt-1">{formatFileSize(previewItem.size)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Yükleme Tarihi</label>
                    <p className="text-sm font-medium text-slate-700 mt-1">{formatDate(previewItem.createdAt)}</p>
                  </div>
                  {previewItem.width && previewItem.height && (
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Boyutlar</label>
                      <p className="text-sm font-medium text-slate-700 mt-1">{previewItem.width} × {previewItem.height} px</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">URL</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        readOnly
                        value={previewItem.url}
                        className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1.5 w-full text-slate-600"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(previewItem.url);
                          // Toast could go here
                        }}
                        className="p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                        title="Kopyala"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (confirm('Silmek istediğinize emin misiniz?')) {
                      handleDelete([previewItem._id]);
                    }
                  }}
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
                >
                  <TrashIcon className="w-5 h-5 mr-2" />
                  Dosyayı Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 2.25v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
