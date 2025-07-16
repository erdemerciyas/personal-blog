'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
// Simple loading placeholder component
const Skeleton = ({ className = '', width = '', height = '' }: { className?: string; width?: string; height?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${height} ${width} ${className}`} />
);
import {
  XMarkIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

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
  theme?: 'dark' | 'light';
  pageContext?: string;
  allowMultipleSelect?: boolean;
}

const MediaBrowser: React.FC<MediaBrowserProps> = ({
  isOpen,
  onClose,
  onSelect,
  onUploadNew,
  title = 'Medya Seç',
  allowedTypes = ['image/'],
  theme = 'dark',
  pageContext = 'general',
  allowMultipleSelect = false
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [pageFilter, setPageFilter] = useState('all');
  const [windowSize, setWindowSize] = useState({
    width: 1024,
    height: 768
  });
  const [isMounted, setIsMounted] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Mount and window size setup
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Modal dışı tıklama ile kapatma
  useEffect(() => {
    if (!isOpen) return;
    if (previewItem) return; // Önizleme modalı açıkken ana modal dışı tıklama kapatmasın
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Eğer tıklanan element bir button ise ve "Yeni Yükle" metni içeriyorsa, modal kapatma
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const buttonElement = target.tagName === 'BUTTON' ? target : target.closest('button');
        if (buttonElement?.textContent?.includes('Yeni Yükle')) {
          return; // Modal kapatma
        }
      }
      
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, previewItem]);

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    return Boolean(url && (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')));
  };

  // Fetch media items
  useEffect(() => {
    if (isOpen) {
      fetchMediaItems();
    }
  }, [isOpen, pageFilter]);

  const fetchMediaItems = async () => {
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
  };

  // Filter media items
  const getFilteredItems = () => {
    let filtered = mediaItems.filter(item => {
      // Filter by valid URL first
      if (!isValidUrl(item.url)) return false;
      
      // Filter by allowed types
      const typeAllowed = allowedTypes.some(type => item.mimeType.startsWith(type));
      if (!typeAllowed) return false;

      // Filter by search term
      if (searchTerm) {
        return item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.filename.toLowerCase().includes(searchTerm.toLowerCase());
      }
      
      return true;
    });

    // Additional filters
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
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSelect = () => {
    if (allowMultipleSelect && selectedItems.length > 0) {
      const urls = selectedItems.map(id => {
        const item = mediaItems.find(item => item._id === id);
        return item?.url;
      }).filter((url): url is string => url !== undefined && isValidUrl(url));
      
      if (urls.length > 0) {
        onSelect(urls);
        onClose();
        setSelectedItems([]);
      }
    } else if (selectedItem) {
      const item = mediaItems.find(item => item._id === selectedItem);
      if (item && isValidUrl(item.url)) {
        onSelect(item.url);
        onClose();
        setSelectedItem(null);
      } else {
        console.error('Invalid URL selected:', item?.url);
      }
    }
  };

  const handleItemClick = (itemId: string) => {
    if (allowMultipleSelect) {
      setSelectedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setSelectedItem(itemId);
    }
  };

  const handleUploadNew = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log('Yeni Yükle butonuna tıklandı - MediaBrowser');
    onUploadNew();
  };

  // Resim silme
  const handleDelete = async (itemId: string) => {
    if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/media/${itemId}`, { method: 'DELETE' });
      if (response.ok) {
        setMediaItems(items => items.filter(item => item._id !== itemId));
        setSelectedItem(null);
        setSelectedItems(items => items.filter(id => id !== itemId));
      } else {
        alert('Silme işlemi başarısız oldu.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !isMounted) return null;

  const filteredItems = getFilteredItems();

  // Theme-based styles
  const themeStyles = {
    modal: theme === 'dark' 
      ? 'bg-slate-900 border-slate-700' 
      : 'bg-white/10 backdrop-blur-xl border-white/20',
    header: theme === 'dark' 
      ? 'bg-slate-800/50 border-slate-700' 
      : 'bg-white/5 border-white/10',
    text: theme === 'dark' ? 'text-white' : 'text-white',
    textSecondary: theme === 'dark' ? 'text-slate-400' : 'text-slate-300',
    input: theme === 'dark' 
      ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
      : 'bg-white/5 border-white/20 text-white placeholder-slate-300',
    select: theme === 'dark' 
      ? 'bg-slate-800 border-slate-600 text-white' 
      : 'bg-white/5 border-white/20 text-white',
    card: theme === 'dark' 
      ? 'bg-slate-800 border-slate-600' 
      : 'bg-white/5 border-white/10',
    cardSelected: theme === 'dark' 
      ? 'border-teal-500 bg-teal-500/10' 
      : 'border-teal-400 bg-teal-400/20',
    footer: theme === 'dark' 
      ? 'bg-slate-800/50 border-slate-700' 
      : 'bg-white/5 border-white/10'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      {/* Modal dışı tıklama için ref */}
      <div 
        ref={modalRef}
        className={`${themeStyles.modal} rounded-3xl overflow-hidden shadow-2xl w-[90vw] max-w-6xl h-[85vh] max-h-[800px] min-h-[600px] relative flex flex-col`}
        style={{ minWidth: windowSize.width < 768 ? '320px' : '800px' }}
      >
        
        {/* Header */}
        <div className={`${themeStyles.header} p-6 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`${themeStyles.text} text-xl font-bold`}>{title}</h3>
                <p className={`${themeStyles.textSecondary} text-slate-400`}>Mevcut görselleri seçin veya yeni yükleyin</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Görsel ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${themeStyles.input} w-full rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>

            {/* Type Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`${themeStyles.select} rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
            >
              <option value="all" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                Tüm Dosyalar
              </option>
              <option value="images" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                Sadece Görseller
              </option>
            </select>

            {/* Page Filter */}
            <select
              value={pageFilter}
              onChange={(e) => setPageFilter(e.target.value)}
              className={`${themeStyles.select} rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
            >
              <option value="all" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                Tüm Sayfalar
              </option>
              <option value="portfolio" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                Portfolio
              </option>
              <option value="service" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                Hizmetler
              </option>
              <option value="about" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                Hakkımda
              </option>
              <option value="slider" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                Slider
              </option>
              <option value="general" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                Genel
              </option>
            </select>

            {/* Upload New Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUploadNew(e);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span>Yeni Yükle</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={`${themeStyles.card} rounded-xl p-3 border`}>
                  <Skeleton height="aspect-square" className="mb-2 rounded-lg" />
                  <Skeleton height="h-6" className="mb-1 rounded" />
                  <Skeleton height="h-4" width="w-3/4" className="rounded" />
                  <div className="flex justify-between mt-2">
                    <Skeleton height="h-3" width="w-12" className="rounded" />
                    <Skeleton height="h-4" width="w-16" className="rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">
                {searchTerm ? 'Arama kriterlerinize uygun dosya bulunamadı' : 'Henüz yüklenmiş medya dosyası bulunmuyor'}
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUploadNew(e);
                }}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                İlk Görselinizi Yükleyin
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredItems.map((item) => {
                const isSelected = allowMultipleSelect 
                  ? selectedItems.includes(item._id)
                  : selectedItem === item._id;
                
                return (
                  <div
                    key={item._id}
                    className={`${themeStyles.card} rounded-xl p-3 transition-all duration-200 hover:scale-105 relative border`}
                  >
                    {/* Sil butonu */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                      className="absolute top-2 right-2 z-20 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow"
                      title="Sil"
                      tabIndex={0}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                    {/* Önizleme için tıklama */}
                    <div
                      onClick={() => setPreviewItem(item)}
                      className="aspect-square mb-2 bg-slate-700 rounded-lg overflow-hidden relative cursor-zoom-in"
                      tabIndex={0}
                      role="button"
                      aria-label="Önizle"
                    >
                      {item.mimeType.startsWith('image/') && item.url && isValidUrl(item.url) ? (
                        <Image
                          src={item.url}
                          alt={item.originalName}
                          fill
                          className="object-cover"
                          loading="lazy"
                          onError={(e) => {
                            console.error('Image load error for:', item.url);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {item.mimeType.startsWith('image/') ? '🖼️' : '📄'}
                        </div>
                      )}
                    </div>
                    {/* Seçim butonu */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleItemClick(item._id); }}
                      className={`w-full mt-1 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors ${isSelected ? 'ring-2 ring-teal-400' : ''}`}
                      tabIndex={0}
                    >
                      {isSelected ? 'Seçili' : 'Seç'}
                    </button>
                    {/* File Info */}
                    <div className="space-y-1 mt-2">
                      <h5 className={`${themeStyles.text} text-xs font-medium truncate`} title={item.originalName}>
                        {item.originalName}
                      </h5>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{formatFileSize(item.size)}</span>
                        <div className="flex items-center space-x-1">
                          {item.source === 'cloudinary' && (
                            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                              ☁️ Cloud
                            </span>
                          )}
                          {item.source === 'local' && (
                            <span className="bg-slate-600 text-slate-300 px-1.5 py-0.5 rounded text-xs">
                              💾 Local
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredItems.length > 0 && (
          <div className={`${themeStyles.footer} p-6 flex-shrink-0`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <p className={`${themeStyles.textSecondary} text-slate-400`}>
                  {filteredItems.length} dosya bulundu
                </p>
                {allowMultipleSelect && selectedItems.length > 0 ? (
                  <p className={`${themeStyles.text} font-medium text-teal-400`}>
                    {selectedItems.length} görsel seçildi
                  </p>
                ) : selectedItem ? (
                  <p className={`${themeStyles.text} font-medium`}>
                    {mediaItems.find(item => item._id === selectedItem)?.originalName} seçildi
                  </p>
                ) : null}
              </div>
              
              <div className="flex items-center space-x-3">
                {allowMultipleSelect && selectedItems.length > 0 && (
                  <button
                    onClick={() => setSelectedItems([])}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Seçimi Temizle
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSelect}
                  disabled={allowMultipleSelect ? selectedItems.length === 0 : !selectedItem}
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                    (allowMultipleSelect ? selectedItems.length > 0 : selectedItem)
                      ? 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {allowMultipleSelect && selectedItems.length > 1 
                    ? `${selectedItems.length} Görsel Seç` 
                    : 'Seç'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Önizleme Modalı */}
      {previewItem && (
        <div className="fixed inset-0 z-[110] bg-black/70 flex items-center justify-center" onClick={() => setPreviewItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 p-2 bg-slate-200 hover:bg-slate-300 rounded-full" onClick={() => setPreviewItem(null)}>
              <XMarkIcon className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex flex-col items-center">
              {previewItem.mimeType.startsWith('image/') && previewItem.url && isValidUrl(previewItem.url) ? (
                <Image
                  src={previewItem.url}
                  alt={previewItem.originalName}
                  width={600}
                  height={600}
                  className="object-contain rounded-xl max-h-[60vh]"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-2xl">
                  {previewItem.mimeType.startsWith('image/') ? '🖼️' : '📄'}
                </div>
              )}
              <div className="mt-4 text-center">
                <div className="font-semibold text-slate-800">{previewItem.originalName}</div>
                <div className="text-xs text-slate-500">{formatFileSize(previewItem.size)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaBrowser; 