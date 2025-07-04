'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  ArrowLeftIcon,
  CubeTransparentIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  DocumentIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  PlusIcon
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

export default function AdminMediaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Media Management States
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [mediaFilter, setMediaFilter] = useState('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Media Management Functions
  const loadMedia = async () => {
    setLoadingMedia(true);
    try {
      const response = await fetch('/api/admin/media');
      if (response.ok) {
        const data = await response.json();
        setMediaItems(data);
      } else {
        throw new Error('Medya dosyaları yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Media load error:', error);
      setMessage({ type: 'error', text: 'Medya dosyaları yüklenirken hata oluştu.' });
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleMediaUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`${file.name} yüklenirken hata oluştu`);
      }

      return response.json();
    });

    try {
      await Promise.all(uploadPromises);
      setMessage({ type: 'success', text: 'Dosyalar başarıyla yüklendi!' });
      loadMedia(); // Refresh media list
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Media upload error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Dosya yükleme hatası' });
    } finally {
      setUploadingMedia(false);
      setShowUploadModal(false);
    }
  };

  const deleteSelectedMedia = async () => {
    if (selectedMedia.length === 0) return;

    if (!window.confirm(`${selectedMedia.length} dosyayı silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: selectedMedia })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `${data.deletedFiles.length} dosya başarıyla silindi!` });
        setSelectedMedia([]);
        loadMedia(); // Refresh media list
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Dosya silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Delete media error:', error);
      setMessage({ type: 'error', text: 'Dosyalar silinirken hata oluştu.' });
    }
  };

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMedia(prev => 
      prev.includes(mediaId) 
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const selectAllMedia = () => {
    const filteredItems = getFilteredMediaItems();
    setSelectedMedia(filteredItems.map(item => item._id));
  };

  const getFilteredMediaItems = () => {
    return mediaItems.filter(item => {
      const matchesFilter = mediaFilter === 'all' || 
        (mediaFilter === 'cloudinary' && item.source === 'cloudinary') ||
        (mediaFilter === 'local' && item.source === 'local') ||
        (mediaFilter === 'images' && item.mimeType.startsWith('image/'));

      const matchesSearch = !mediaSearch || 
        item.originalName.toLowerCase().includes(mediaSearch.toLowerCase()) ||
        item.filename.toLowerCase().includes(mediaSearch.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load media on component mount
  useEffect(() => {
    if (status === 'authenticated') {
      loadMedia();
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            <p className="text-slate-600">Yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AdminLayout 
      title="Medya Kütüphanesi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Medya Kütüphanesi' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600">Dosya ve resim yönetimi</p>
            <div className="flex items-center space-x-4 text-sm text-slate-500 mt-2">
              <span>Toplam: {mediaItems.length} dosya</span>
              <span>•</span>
              <span>Cloudinary: {mediaItems.filter(item => item.source === 'cloudinary').length}</span>
              <span>•</span>
              <span>Yerel: {mediaItems.filter(item => item.source === 'local').length}</span>
            </div>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Dosya Yükle</span>
          </button>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Dosya ara..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-slate-500" />
                <select
                  value={mediaFilter}
                  onChange={(e) => setMediaFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">Tüm Dosyalar</option>
                  <option value="images">Sadece Resimler</option>
                  <option value="cloudinary">Cloudinary</option>
                  <option value="local">Yerel Dosyalar</option>
                </select>
              </div>

              {/* Stats */}
              <div className="hidden lg:flex items-center space-x-4 text-sm text-slate-600">
                <span>Filtrelenen: {getFilteredMediaItems().length}</span>
              </div>
            </div>
          </div>

          {/* Selection Actions */}
          {selectedMedia.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600" />
                  <span className="text-slate-900 font-semibold">
                    {selectedMedia.length} dosya seçildi
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedMedia([])}
                    className="text-slate-600 hover:text-slate-900 px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    Seçimi Temizle
                  </button>
                  <button
                    onClick={deleteSelectedMedia}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Sil</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Media Grid */}
        {loadingMedia ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
              <p className="text-slate-600 text-lg">Medya dosyaları yükleniyor...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {/* Select All Button */}
            {getFilteredMediaItems().length > 0 && (
              <div
                onClick={selectAllMedia}
                className="bg-white/10 border-2 border-dashed border-white/30 rounded-xl p-6 cursor-pointer hover:bg-white/20 hover:border-teal-500 transition-all duration-200 flex flex-col items-center justify-center min-h-[180px] group"
              >
                <CheckCircleIcon className="w-8 h-8 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-slate-300 text-center font-medium">Tümünü Seç</span>
                <span className="text-xs text-slate-500 mt-1">{getFilteredMediaItems().length} dosya</span>
              </div>
            )}

            {/* Media Items */}
            {getFilteredMediaItems().map((item) => (
              <div
                key={item._id}
                className={`relative bg-white/5 border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:bg-white/10 group ${
                  selectedMedia.includes(item._id) 
                    ? 'border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/20' 
                    : 'border-white/20 hover:border-teal-500/50'
                }`}
                onClick={() => toggleMediaSelection(item._id)}
              >
                {/* Source Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className={`text-xs px-2 py-1 rounded-full text-white font-semibold ${
                    item.source === 'cloudinary' 
                      ? 'bg-blue-600' 
                      : 'bg-green-600'
                  }`}>
                    {item.source === 'cloudinary' ? '☁️' : '💾'}
                  </span>
                </div>

                {/* Selection Indicator */}
                {selectedMedia.includes(item._id) && (
                  <div className="absolute top-2 right-2 z-10">
                    <CheckCircleIcon className="w-6 h-6 text-teal-400 drop-shadow-lg" />
                  </div>
                )}

                {/* Image Preview */}
                <div className="aspect-square bg-slate-800 flex items-center justify-center">
                  {item.mimeType.startsWith('image/') ? (
                    <Image
                      src={item.url}
                      alt={item.originalName}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <DocumentIcon className="w-12 h-12 text-slate-400 group-hover:text-slate-300 transition-colors" />
                  )}
                </div>

                {/* File Info */}
                <div className="p-3 bg-gradient-to-t from-black/50 to-transparent absolute bottom-0 left-0 right-0">
                  <p className="text-sm text-white font-semibold truncate mb-1" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-300">
                      {formatFileSize(item.size)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(item.uploadedAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* No Media Message */}
            {getFilteredMediaItems().length === 0 && !loadingMedia && (
              <div className="col-span-full text-center py-16">
                <PhotoIcon className="w-20 h-20 mx-auto text-slate-400 mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {mediaFilter === 'all' ? 'Henüz medya dosyası yok' : 'Filtreye uygun dosya bulunamadı'}
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  {mediaFilter === 'all' 
                    ? 'İlk dosyanızı yükleyerek medya kütüphanenizi oluşturmaya başlayın.'
                    : 'Farklı bir filtre deneyin veya arama terimini değiştirin.'
                  }
                </p>
                {mediaFilter === 'all' && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 mx-auto"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>İlk Dosyayı Yükle</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Media Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl p-6">
                          <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                  <CloudArrowUpIcon className="w-5 h-5 text-teal-600" />
                  <span>Dosya Yükle</span>
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  disabled={uploadingMedia}
                >
                  <XMarkIcon className="w-5 h-5 text-slate-500" />
                </button>
              </div>

            <div className="space-y-6">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  uploadingMedia
                    ? 'border-teal-500 bg-teal-500/10'
                    : 'border-white/30 hover:border-teal-500 hover:bg-white/5'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!uploadingMedia && e.dataTransfer.files) {
                    handleMediaUpload(e.dataTransfer.files);
                  }
                }}
              >
                <input
                  type="file"
                  id="media-upload"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      handleMediaUpload(e.target.files);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingMedia}
                />
                
                {uploadingMedia ? (
                  <div className="space-y-4">
                    <CloudArrowUpIcon className="w-16 h-16 mx-auto text-teal-400 animate-pulse" />
                    <div>
                      <p className="text-teal-300 font-semibold text-lg">Dosyalar yükleniyor...</p>
                      <p className="text-slate-400 text-sm mt-1">Lütfen bekleyin</p>
                    </div>
                    <div className="w-full max-w-xs mx-auto bg-white/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <CloudArrowUpIcon className="w-16 h-16 mx-auto text-slate-400" />
                    <div>
                      <p className="text-white font-semibold text-lg">Dosya Yükle</p>
                      <p className="text-slate-400 text-sm mt-1">
                        Dosyaları buraya sürükleyin veya tıklayın
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500">
                        Desteklenen formatlar: JPG, PNG, GIF, WebP, MP4, MOV
                      </p>
                      <p className="text-xs text-slate-500">
                        Maksimum dosya boyutu: 10MB
                      </p>
                    </div>
                    <button
                      type="button"
                      className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                      onClick={() => document.getElementById('media-upload')?.click()}
                    >
                      Dosya Seç
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Tips */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-blue-300 font-semibold mb-2 flex items-center space-x-2">
                  <InformationCircleIcon className="w-5 h-5" />
                  <span>İpuçları</span>
                </h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Aynı anda birden fazla dosya seçebilirsiniz</li>
                  <li>• Dosyalar otomatik olarak Cloudinary'ye yüklenecek</li>
                  <li>• Yüklenen dosyalar anında görünecek</li>
                  <li>• Büyük dosyalar için sabırlı olun</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploadingMedia}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  {uploadingMedia ? 'Yükleniyor...' : 'Kapat'}
                </button>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}