'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { InlineLoader } from './AdminLoader';
import {
  XMarkIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  CheckCircleIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface MediaItem {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploader?: string;
  source?: 'cloudinary' | 'local';
  publicId?: string;
}

interface MediaBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string | string[]) => void;
  onUploadNew: () => void;
  title?: string;
  allowedTypes?: string[];
  theme?: 'dark' | 'light'; // Kept for compatibility, but we will enforce a specific style
  pageContext?: string;
  allowMultipleSelect?: boolean;
  variant?: 'fullscreen' | 'dialog';
  enableInlineUpload?: boolean;
}

const MediaBrowser: React.FC<MediaBrowserProps> = ({
  isOpen,
  onClose,
  onSelect,
  onUploadNew,
  title = 'Medya Seç',
  allowedTypes = ['image/'],
  pageContext = 'general',
  allowMultipleSelect = false,
  variant = 'fullscreen',
  enableInlineUpload = false
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [pageFilter, setPageFilter] = useState(pageContext || 'all');
  const [isMounted, setIsMounted] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mount flag
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Modal dışı tıklama ile kapatma
  useEffect(() => {
    if (!isOpen) return;
    if (previewItem) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // "Yeni Yükle" butonuna tıklandıysa kapatma
      if (target.closest('.upload-btn')) {
        return;
      }

      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, previewItem]);

  // Seçim işlemi
  const handleConfirmSelection = useCallback(() => {
    if (allowMultipleSelect && selectedItems.length > 0) {
      const urls = selectedItems
        .map(id => mediaItems.find(item => item._id === id)?.url)
        .filter((url): url is string => url !== undefined && isValidUrl(url));

      if (urls.length > 0) {
        onSelect(urls);
        onClose();
      }
    } else if (selectedItem) {
      const item = mediaItems.find(item => item._id === selectedItem);
      if (item && isValidUrl(item.url)) {
        onSelect(item.url);
        onClose();
      }
    }
  }, [allowMultipleSelect, selectedItems, mediaItems, selectedItem, onSelect, onClose]);

  // Klavye kısayolları
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewItem) setPreviewItem(null);
        else onClose();
      } else if (e.key === 'Enter' && !previewItem) {
        e.preventDefault();
        handleConfirmSelection();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, handleConfirmSelection, onClose, previewItem]);

  const isValidUrl = (url: string): boolean => {
    return Boolean(url && (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')));
  };

  const fetchMediaItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pageFilter !== 'all') {
        params.append('pageContext', pageFilter);
      }

      const response = await fetch(`/api/admin/media?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setMediaItems(data);
      }
    } catch (error) {
      console.error('Media fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [pageFilter]);

  useEffect(() => {
    if (isOpen) {
      fetchMediaItems();
    }
  }, [isOpen, pageFilter, fetchMediaItems]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    // Use current page filter as context if specific, else 'general'
    const uploadContext = (pageFilter !== 'all' && pageFilter) ? pageFilter : 'general';
    formData.append('pageContext', uploadContext);

    setLoading(true);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        const newItem: MediaItem = {
          _id: data.publicId || data.fileName,
          filename: data.fileName,
          originalName: data.originalName,
          url: data.url,
          size: data.size,
          mimeType: data.type,
          uploadedAt: new Date(data.uploadedAt),
          source: 'cloudinary',
          publicId: data.publicId
        };

        setMediaItems(prev => [newItem, ...prev]);

        // Auto select
        if (!allowMultipleSelect) {
          setSelectedItem(newItem._id);
        }
      } else {
        alert(data.error || 'Dosya yüklenemedi.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Dosya yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getFilteredItems = () => {
    let filtered = mediaItems.filter(item => {
      if (!isValidUrl(item.url)) return false;
      const typeAllowed = allowedTypes.some(type => item.mimeType.startsWith(type));
      if (!typeAllowed) return false;
      if (searchTerm) {
        return item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.filename.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });

    if (filter === 'images') {
      filtered = filtered.filter(item => item.mimeType.startsWith('image/'));
    }

    return filtered.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleItemClick = (itemId: string) => {
    if (allowMultipleSelect) {
      setSelectedItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setSelectedItem(prev => prev === itemId ? null : itemId);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Bu görseli kalıcı olarak silmek istediğinize emin misiniz?')) return;

    try {
      setLoading(true);
      const encodedId = encodeURIComponent(itemId);
      const response = await fetch(`/api/admin/media/${encodedId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMediaItems(items => items.filter(item => item._id !== itemId));
        if (selectedItem === itemId) setSelectedItem(null);
        setSelectedItems(items => items.filter(id => id !== itemId));
        if (previewItem?._id === itemId) setPreviewItem(null);
      } else {
        alert(data.error || 'Silme işlemi başarısız oldu.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme işlemi sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !isMounted) return null;

  const filteredItems = getFilteredItems();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept={allowedTypes.map(t => t.endsWith('/') ? t + '*' : t).join(',')}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`
          relative w-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5
          ${variant === 'fullscreen' ? 'h-[90vh] max-w-[1400px]' : 'h-[80vh] max-w-5xl'}
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur z-10 sticky top-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
              <PhotoIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">{title}</h3>
              <p className="text-sm text-slate-500">Kütüphaneden seçim yapın</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 md:flex-initial md:min-w-[400px]">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Görsel ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Filters */}
            <div className="relative group">
              <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                <FunnelIcon className="w-5 h-5 text-slate-500" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 hidden group-hover:block z-20">
                <label className="block text-xs font-semibold text-slate-400 px-2 py-1">DOSYA TİPİ</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full text-sm p-2 rounded-lg bg-slate-50 border-transparent focus:bg-white focus:ring-0 cursor-pointer hover:bg-slate-100 mb-2"
                >
                  <option value="all">Tümü</option>
                  <option value="images">Sadece Görseller</option>
                </select>

                <div className="h-px bg-slate-100 my-1" />

                <label className="block text-xs font-semibold text-slate-400 px-2 py-1">BAĞLAM</label>
                <select
                  value={pageFilter}
                  onChange={(e) => setPageFilter(e.target.value)}
                  className="w-full text-sm p-2 rounded-lg bg-slate-50 border-transparent focus:bg-white focus:ring-0 cursor-pointer hover:bg-slate-100"
                >
                  <option value="all">Tüm Sayfalar</option>
                  <option value="profile">Profil</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="service">Hizmetler</option>
                  <option value="about">Hakkımda</option>
                  <option value="general">Genel</option>
                </select>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-200 mx-1 hidden md:block" />

            {/* Actions */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (enableInlineUpload) {
                  fileInputRef.current?.click();
                } else {
                  onUploadNew();
                }
              }}
              className="upload-btn flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Yükle</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <InlineLoader text="Medya kütüphanesi yükleniyor..." />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <PhotoIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Dosya bulunamadı</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-1 mb-6">
                "{searchTerm}" aramasına uygun sonuç yok veya kütüphane boş.
              </p>
              <button
                onClick={() => enableInlineUpload ? fileInputRef.current?.click() : onUploadNew()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                İlk Dosyayı Yükle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
              {filteredItems.map((item) => {
                const isSelected = allowMultipleSelect
                  ? selectedItems.includes(item._id)
                  : selectedItem === item._id;

                return (
                  <div
                    key={item._id}
                    onClick={() => handleItemClick(item._id)}
                    className={`
                            group relative aspect-square bg-white rounded-xl overflow-hidden cursor-pointer border transition-all duration-200
                            ${isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2'
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}
                         `}
                  >
                    {/* Selection Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-20 bg-white rounded-full text-indigo-600 shadow-sm animate-in zoom-in duration-200">
                        <CheckCircleIconSolid className="w-6 h-6" />
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                        className="p-2 bg-white/90 rounded-full text-slate-700 hover:text-indigo-600 transiton-colors shadow-sm hover:scale-110"
                        title="Önizle"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                        className="p-2 bg-white/90 rounded-full text-slate-700 hover:text-red-600 transiton-colors shadow-sm hover:scale-110"
                        title="Sil"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Image/File Preview */}
                    <div className="w-full h-full p-2">
                      <div className="w-full h-full relative rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                        {item.mimeType.startsWith('image/') && item.url ? (
                          <img
                            src={item.url}
                            alt={item.originalName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-2xl">📄</span>
                        )}
                      </div>
                    </div>

                    {/* Info Overlay (Bottom) */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-xs font-medium truncate drop-shadow-sm">
                        {item.originalName}
                      </p>
                      <p className="text-white/80 text-[10px] truncate">
                        {formatFileSize(item.size)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-4">
          <div className="text-sm">
            <span className="text-slate-500">{filteredItems.length} dosya gösteriliyor</span>
            {allowMultipleSelect && selectedItems.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md font-medium">
                {selectedItems.length} seçildi
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={allowMultipleSelect ? selectedItems.length === 0 : !selectedItem}
              className={`
                    px-6 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all
                    ${(allowMultipleSelect ? selectedItems.length > 0 : selectedItem)
                  ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20'
                  : 'bg-slate-300 cursor-not-allowed'}
                 `}
            >
              Seçimi Onayla
            </button>
          </div>
        </div>

        {/* Preview Modal */}
        {previewItem && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur flex flex-col items-center justify-center p-8 animate-in fade-in duration-200">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-slate-600" />
            </button>

            <div className="w-full max-w-4xl h-[70vh] flex items-center justify-center mb-6">
              {previewItem.mimeType.startsWith('image/') ? (
                <img
                  src={previewItem.url}
                  alt={previewItem.originalName}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-64 h-64 bg-slate-100 rounded-2xl flex items-center justify-center text-6xl">
                  📄
                </div>
              )}
            </div>

            <div className="text-center">
              <h4 className="text-xl font-bold text-slate-900 mb-1">{previewItem.originalName}</h4>
              <p className="text-slate-500">
                {formatFileSize(previewItem.size)} • {new Date(previewItem.uploadedAt).toLocaleDateString()}
              </p>

              <button
                onClick={() => {
                  handleItemClick(previewItem._id);
                  setPreviewItem(null);
                }}
                className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
              >
                Bu Görseli Seç
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaBrowser;