'use client';

import { useState, useEffect, useRef } from 'react';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminEmptyState, AdminModal, AdminSpinner, AdminAlert, AdminBadge } from '@/components/admin/ui';
import { 
  PlusIcon, 
  PhotoIcon, 
  TrashIcon, 
  EyeIcon, 
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

interface Media {
  _id: string;
  url: string;
  filename: string;
  size: number;
  mimetype?: string;
  mimeType?: string;
  createdAt?: string;
  usedIn?: string[];
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<Media | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [usageFilter, setUsageFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    let filtered = media;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Usage filter
    if (usageFilter === 'used') {
      filtered = filtered.filter(item => item.usedIn && item.usedIn.length > 0);
    } else if (usageFilter === 'unused') {
      filtered = filtered.filter(item => !item.usedIn || item.usedIn.length === 0);
    }

    setFilteredMedia(filtered);
  }, [searchTerm, usageFilter, media]);

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/admin/media');
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
        setFilteredMedia(data);
      }
    } catch {
      setError('Medya dosyaları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess(`${files.length} dosya başarıyla yüklendi`);
        setTimeout(() => setSuccess(''), 3000);
        await fetchMedia();
        setShowUploadModal(false);
      } else {
        throw new Error('Yükleme başarısız');
      }
    } catch {
      setError('Dosyalar yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return;

    try {
      // Encode the ID for URL
      const encodedId = encodeURIComponent(id);
      const response = await fetch(`/api/admin/media/${encodedId}`, { method: 'DELETE' });
      
      if (response.ok) {
        setMedia(media.filter(m => m._id !== id));
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        setSuccess('Dosya silindi');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Silme başarısız');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dosya silinirken hata oluştu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`${selectedItems.size} dosyayı silmek istediğinizden emin misiniz?`)) return;

    const count = selectedItems.size;
    try {
      const results = await Promise.all(
        Array.from(selectedItems).map(id => {
          const encodedId = encodeURIComponent(id);
          return fetch(`/api/admin/media/${encodedId}`, { method: 'DELETE' });
        })
      );

      // Check if all deletions were successful
      const allSuccessful = results.every(r => r.ok);
      
      if (allSuccessful) {
        setMedia(media.filter(m => !selectedItems.has(m._id)));
        setSelectedItems(new Set());
        setSuccess(`${count} dosya silindi`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Bazı dosyalar silinemedi');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dosyalar silinirken hata oluştu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === filteredMedia.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredMedia.map(m => m._id)));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayoutNew
        title="Medya Kütüphanesi"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Medya' }]}
      >
        <div className="flex items-center justify-center py-12">
          <AdminSpinner size="lg" />
        </div>
      </AdminLayoutNew>
    );
  }

  return (
    <AdminLayoutNew
      title="Medya Kütüphanesi"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Medya' }]}
      actions={
        <AdminButton 
          variant="primary" 
          icon={PlusIcon}
          onClick={() => setShowUploadModal(true)}
        >
          Dosya Yükle
        </AdminButton>
      }
    >
      {success && (
        <AdminAlert variant="success" onClose={() => setSuccess('')}>
          {success}
        </AdminAlert>
      )}

      {error && (
        <AdminAlert variant="error" onClose={() => setError('')}>
          {error}
        </AdminAlert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <AdminCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Toplam Medya</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{media.length}</p>
            </div>
            <PhotoIcon className="w-10 h-10 text-blue-500" />
          </div>
        </AdminCard>

        <AdminCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Kullanılan</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {media.filter(m => m.usedIn && m.usedIn.length > 0).length}
              </p>
            </div>
            <EyeIcon className="w-10 h-10 text-green-500" />
          </div>
        </AdminCard>

        <AdminCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Kullanılmayan</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {media.filter(m => !m.usedIn || m.usedIn.length === 0).length}
              </p>
            </div>
            <PhotoIcon className="w-10 h-10 text-orange-500" />
          </div>
        </AdminCard>

        <AdminCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Seçili</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedItems.size}</p>
            </div>
            <Squares2X2Icon className="w-10 h-10 text-blue-500" />
          </div>
        </AdminCard>
      </div>

      <AdminCard padding="md">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Dosya ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Usage Filter */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setUsageFilter('all')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    usageFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setUsageFilter('used')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    usageFilter === 'used'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Kullanılan
                </button>
                <button
                  onClick={() => setUsageFilter('unused')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    usageFilter === 'unused'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Kullanılmayan
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title="Grid görünümü"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title="Liste görünümü"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedItems.size} seçili
              </span>
              <AdminButton
                variant="danger"
                size="sm"
                icon={TrashIcon}
                onClick={handleBulkDelete}
              >
                Seçilenleri Sil
              </AdminButton>
            </div>
          )}
        </div>

        {/* Select All */}
        {filteredMedia.length > 0 && (
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedItems.size === filteredMedia.length && filteredMedia.length > 0}
                onChange={selectAll}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Tümünü Seç ({filteredMedia.length} dosya)
              </span>
            </label>
          </div>
        )}

        {/* Media Grid/List */}
        {filteredMedia.length === 0 ? (
          <AdminEmptyState 
            icon={<PhotoIcon className="w-12 h-12" />} 
            title={searchTerm ? 'Sonuç bulunamadı' : 'Henüz medya yok'} 
            description={searchTerm ? 'Farklı bir arama terimi deneyin' : 'İlk medya dosyanızı yükleyin'} 
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.map(item => (
              <div 
                key={item._id} 
                className={`relative group rounded-lg border-2 transition-all ${
                  selectedItems.has(item._id)
                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item._id)}
                    onChange={() => toggleSelection(item._id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Thumbnail */}
                <div 
                  className="aspect-square relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                  onClick={() => setPreviewItem(item)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.url} 
                    alt={item.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewItem(item);
                    }}
                    className="p-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-lg"
                    title="Önizle"
                  >
                    <EyeIcon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item._id);
                    }}
                    className="p-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                    title="Sil"
                  >
                    <TrashIcon className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Info */}
                <div className="mt-2 px-1 space-y-1">
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {formatFileSize(item.size)}
                    </p>
                    {item.usedIn && item.usedIn.length > 0 && (
                      <AdminBadge variant="success" size="sm">
                        {item.usedIn.length} sayfa
                      </AdminBadge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMedia.map(item => (
              <div
                key={item._id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  selectedItems.has(item._id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.has(item._id)}
                  onChange={() => toggleSelection(item._id)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                
                <div className="w-16 h-16 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.url} 
                    alt={item.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                    {item.filename}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatFileSize(item.size)} • {formatDate(item.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    icon={EyeIcon}
                    onClick={() => setPreviewItem(item)}
                  >
                    Önizle
                  </AdminButton>
                  <AdminButton
                    variant="danger"
                    size="sm"
                    icon={TrashIcon}
                    onClick={() => handleDelete(item._id)}
                  >
                    Sil
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Upload Modal */}
      <AdminModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Dosya Yükle"
        size="md"
      >
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
            <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
              Dosyaları buraya sürükleyin veya tıklayın
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              PNG, JPG, GIF, SVG (Maks. 10MB)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />

          {uploading && (
            <div className="flex items-center justify-center gap-3 py-4">
              <AdminSpinner size="sm" />
              <span className="text-slate-600 dark:text-slate-400">Yükleniyor...</span>
            </div>
          )}
        </div>
      </AdminModal>

      {/* Preview Modal */}
      {previewItem && (
        <AdminModal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title="Önizleme"
          size="lg"
        >
          <div className="space-y-4">
            <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewItem.url}
                alt={previewItem.filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400">Dosya Adı</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{previewItem.filename}</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Boyut</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{formatFileSize(previewItem.size)}</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Tip</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{previewItem.mimetype || 'image/*'}</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Yüklenme Tarihi</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{formatDate(previewItem.createdAt)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-600 dark:text-slate-400 mb-2">URL</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={previewItem.url}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm"
                  />
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(previewItem.url);
                      setSuccess('URL kopyalandı');
                      setTimeout(() => setSuccess(''), 2000);
                    }}
                  >
                    Kopyala
                  </AdminButton>
                </div>
              </div>
            </div>
          </div>
        </AdminModal>
      )}
    </AdminLayoutNew>
  );
}
