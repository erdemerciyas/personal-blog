'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
}

interface MediaBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  onUploadNew: () => void;
  title?: string;
  allowedTypes?: string[];
}

const MediaBrowser: React.FC<MediaBrowserProps> = ({
  isOpen,
  onClose,
  onSelect,
  onUploadNew,
  title = 'Medya Seç',
  allowedTypes = ['image/']
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  // URL validation helper
  const isValidUrl = (url: string) => {
    return url && (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://'));
  };

  // Fetch media items
  useEffect(() => {
    if (isOpen) {
      fetchMediaItems();
    }
  }, [isOpen]);

  const fetchMediaItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/media');
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
    if (selectedItem) {
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

  const handleUploadNew = () => {
    onUploadNew();
    onClose();
  };

  if (!isOpen) return null;

  const filteredItems = getFilteredItems();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-900 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-700">
        
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-slate-400">Mevcut görselleri seçin veya yeni yükleyin</p>
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
                className="w-full bg-slate-800 border border-slate-600 rounded-xl pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                style={{
                  color: 'white',
                  backgroundColor: '#1e293b' // slate-800
                }}
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              style={{
                color: 'white',
                backgroundColor: '#1e293b' // slate-800
              }}
            >
              <option value="all" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                Tüm Dosyalar
              </option>
              <option value="images" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                Sadece Görseller
              </option>
            </select>

            {/* Upload New Button */}
            <button
              onClick={handleUploadNew}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span>Yeni Yükle</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              <span className="ml-3 text-slate-400">Medya dosyaları yükleniyor...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">
                {searchTerm ? 'Arama kriterlerinize uygun dosya bulunamadı' : 'Henüz yüklenmiş medya dosyası bulunmuyor'}
              </p>
              <button
                onClick={handleUploadNew}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                İlk Görselinizi Yükleyin
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedItem(item._id)}
                  className={`relative bg-slate-800 border rounded-xl p-3 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedItem === item._id
                      ? 'border-teal-500 bg-teal-500/10 ring-2 ring-teal-500/50'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {/* Selection Indicator */}
                  {selectedItem === item._id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center z-10">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Image Preview */}
                  <div className="aspect-square mb-2 bg-slate-700 rounded-lg overflow-hidden relative">
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

                  {/* File Info */}
                  <div className="space-y-1">
                    <h5 className="text-white text-xs font-medium truncate" title={item.originalName}>
                      {item.originalName}
                    </h5>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{formatFileSize(item.size)}</span>
                      <span>{item._id?.includes('/') ? item._id.split('/')[0] : 'root'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredItems.length > 0 && (
          <div className="bg-slate-800/50 border-t border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-400">
                {filteredItems.length} dosya bulundu
                {selectedItem && (
                  <span className="text-teal-400 font-medium">
                    {' • '}{mediaItems.find(item => item._id === selectedItem)?.originalName} seçildi
                  </span>
                )}
              </p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSelect}
                  disabled={!selectedItem}
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                    selectedItem
                      ? 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Seç
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaBrowser; 