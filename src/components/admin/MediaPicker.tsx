'use client';

import { useState, useEffect, useRef } from 'react';
import { AdminModal, AdminButton, AdminSpinner, AdminEmptyState, AdminAlert } from './ui';
import { PhotoIcon, CheckIcon, MagnifyingGlassIcon, ArrowUpTrayIcon, Squares2X2Icon, ListBulletIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Media {
  _id: string;
  url: string;
  filename: string;
  size: number;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  selectedUrl?: string;
  context?: 'slider' | 'portfolio' | 'products' | 'services' | 'all';
}

export default function MediaPicker({ isOpen, onClose, onSelect, selectedUrl, context = 'all' }: MediaPickerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string>(selectedUrl || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pageFilter, setPageFilter] = useState<string>(context === 'all' ? 'all' : context);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect category from selected URL
  const detectCategory = (url: string): string => {
    if (!url) return context === 'all' ? 'all' : context;
    
    const urlLower = url.toLowerCase();
    const filenameLower = url.split('/').pop()?.toLowerCase() || '';
    
    if (urlLower.includes('/slider/') || filenameLower.includes('slider')) {
      return 'slider';
    } else if (urlLower.includes('/portfolio/') || filenameLower.includes('portfolio')) {
      return 'portfolio';
    } else if (urlLower.includes('/products/') || filenameLower.includes('product')) {
      return 'products';
    } else if (urlLower.includes('/services/') || filenameLower.includes('service')) {
      return 'services';
    }
    
    return context === 'all' ? 'all' : context;
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      // Set selected URL when modal opens
      setSelected(selectedUrl || '');
      // Auto-detect and set category filter based on selected URL
      if (selectedUrl) {
        const detectedCategory = detectCategory(selectedUrl);
        setPageFilter(detectedCategory);
      } else {
        setPageFilter(context === 'all' ? 'all' : context);
      }
    }
  }, [isOpen, selectedUrl]);

  useEffect(() => {
    let filtered = media;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Page filter
    if (pageFilter !== 'all') {
      filtered = filtered.filter(item => {
        const filename = item.filename.toLowerCase();
        const url = item.url.toLowerCase();
        
        // Check if image belongs to the selected context
        if (pageFilter === 'slider') {
          return url.includes('/slider/') || filename.includes('slider');
        } else if (pageFilter === 'portfolio') {
          return url.includes('/portfolio/') || filename.includes('portfolio');
        } else if (pageFilter === 'products') {
          return url.includes('/products/') || filename.includes('product');
        } else if (pageFilter === 'services') {
          return url.includes('/services/') || filename.includes('service');
        }
        return true;
      });
    }

    setFilteredMedia(filtered);
  }, [searchTerm, pageFilter, media]);

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/admin/media');
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
        setFilteredMedia(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selected) {
      onSelect(selected);
      onClose();
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
      // Add context to determine upload folder
      formData.append('context', context);

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess(`${files.length} dosya yüklendi`);
        setTimeout(() => setSuccess(''), 3000);
        await fetchMedia();
      } else {
        throw new Error('Yükleme başarısız');
      }
    } catch {
      setError('Dosyalar yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) {
      return;
    }

    setDeleting(mediaId);
    setError('');

    try {
      const response = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [mediaId] }),
      });

      if (response.ok) {
        setSuccess('Görsel silindi');
        setTimeout(() => setSuccess(''), 3000);
        // Remove from local state
        setMedia(prev => prev.filter(item => item._id !== mediaId));
        setFilteredMedia(prev => prev.filter(item => item._id !== mediaId));
        // Clear selection if deleted item was selected
        if (selected === media.find(m => m._id === mediaId)?.url) {
          setSelected('');
        }
      } else {
        throw new Error('Silme başarısız');
      }
    } catch {
      setError('Görsel silinirken hata oluştu');
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Medya Kütüphanesi"
      size="xl"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {selected ? 'Görsel seçildi' : `${filteredMedia.length} medya dosyası`}
          </div>
          <div className="flex gap-3">
            <AdminButton variant="secondary" onClick={onClose}>
              İptal
            </AdminButton>
            <AdminButton
              variant="primary"
              icon={CheckIcon}
              onClick={handleSelect}
              disabled={!selected}
            >
              Seç ve Kullan
            </AdminButton>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Alerts */}
        {error && (
          <AdminAlert variant="error" onClose={() => setError('')}>
            {error}
          </AdminAlert>
        )}

        {success && (
          <AdminAlert variant="success" onClose={() => setSuccess('')}>
            {success}
          </AdminAlert>
        )}

        {/* Toolbar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
              />
              <AdminButton
                variant="primary"
                icon={ArrowUpTrayIcon}
                onClick={() => fileInputRef.current?.click()}
                loading={uploading}
              >
                Yükle
              </AdminButton>
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Medya ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Grid görünümü"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Liste görünümü"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Page Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Filtre:
            </span>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Tümü' },
                { value: 'slider', label: 'Slider' },
                { value: 'portfolio', label: 'Portfolio' },
                { value: 'products', label: 'Ürünler' },
                { value: 'services', label: 'Hizmetler' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setPageFilter(filter.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pageFilter === filter.value
                      ? 'bg-blue-500 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Media Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <AdminSpinner size="lg" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="py-12">
            <AdminEmptyState
              icon={<PhotoIcon className="w-12 h-12" />}
              title={searchTerm ? 'Sonuç bulunamadı' : 'Henüz medya yok'}
              description={searchTerm ? 'Farklı bir arama terimi deneyin' : '"Yükle" butonuna tıklayarak dosya ekleyin'}
            />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto p-1">
            {filteredMedia.map((item) => (
              <div key={item._id} className="relative">
                <button
                  onClick={() => setSelected(item.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group w-full ${
                    selected === item.url
                      ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                  disabled={deleting === item._id}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {selected === item.url && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                  {/* Filename on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {item.filename}
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(item._id, e)}
                    disabled={deleting === item._id}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg disabled:opacity-50"
                    title="Sil"
                  >
                    {deleting === item._id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredMedia.map((item) => (
              <div key={item._id} className="relative group">
                <button
                  onClick={() => setSelected(item.url)}
                  disabled={deleting === item._id}
                  className={`w-full flex items-center gap-4 p-3 rounded-lg border-2 transition-all text-left ${
                    selected === item.url
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {item.filename}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {formatFileSize(item.size)}
                    </p>
                  </div>

                  {/* Check Icon */}
                  {selected === item.url && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </button>
                
                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(item._id, e)}
                  disabled={deleting === item._id}
                  className="absolute top-1/2 -translate-y-1/2 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg disabled:opacity-50"
                  title="Sil"
                >
                  {deleting === item._id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <TrashIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminModal>
  );
}
