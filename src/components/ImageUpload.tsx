'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import MediaBrowser from './MediaBrowser';
import {
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  TrashIcon,
  FolderOpenIcon,
  LinkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ImageUploadProps {
  value?: string | string[];
  onChange?: (url: string | string[]) => void;
  onRemove?: () => void;
  onImageUpload?: (url: string | string[]) => void;
  onImageRemove?: () => void;
  currentImage?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  acceptMultiple?: boolean;
  maxSize?: number;
  showUrlInput?: boolean;
  pageContext?: string;
  allowMultipleSelect?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  onImageUpload,
  onImageRemove,
  currentImage,
  disabled = false,
  className = '',
  label = 'Resim Yükle',
  acceptMultiple = false,
  maxSize = 10,
  showUrlInput = false,
  pageContext = 'general',
  allowMultipleSelect = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // reserved state placeholder removed
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // onChange function güvenlik kontrolü
  const handleOnChange = (url: string | string[]) => {
    const changeHandler = onChange || onImageUpload;
    if (typeof changeHandler === 'function') {
      if (Array.isArray(url)) {
        const validUrls = url.filter(u => u && (u.startsWith('/') || u.startsWith('http://') || u.startsWith('https://')));
        if (validUrls.length > 0) {
          changeHandler(validUrls);
        } else {
          setError('Geçersiz görsel URL\'leri');
        }
      } else if (url && (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://'))) {
        changeHandler(url);
      } else {
        setError('Geçersiz görsel URL\'i');
      }
    }
  };

  // File selection handler
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const file = files[0];
      
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`Dosya boyutu ${maxSize}MB&apos;dan büyük olamaz`);
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Sadece resim dosyaları yüklenebilir');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', pageContext);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload başarısız');
      }

      const data = await response.json();
      handleOnChange(data.url);
      setSuccess('Resim başarıyla yüklendi!');
      
      setTimeout(() => {
        setSuccess('');
        setUploadProgress(0);
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload sırasında hata oluştu');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Remove image handler
  const removeImage = async () => {
    try {
      if (typeof onRemove === 'function') {
        onRemove();
      } else if (typeof onImageRemove === 'function') {
        onImageRemove();
      } else if (typeof onChange === 'function') {
        onChange('');
      }
      setSuccess('Resim başarıyla silindi!');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Resim silinirken hata oluştu');
    }
  };

  // MediaBrowser handlers
  const handleBrowseMedia = () => {
    setShowMediaBrowser(true);
  };

  const handleUploadNew = () => {
    fileInputRef.current?.click();
  };

  const handleMediaSelect = (url: string | string[]) => {
    if (typeof onChange === 'function') {
      onChange(url);
    } else if (typeof onImageUpload === 'function') {
      onImageUpload(url);
    }
    const count = Array.isArray(url) ? url.length : 1;
    setSuccess(`${count} görsel başarıyla seçildi!`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleCloseBrowser = () => {
    setShowMediaBrowser(false);
  };

  // URL Input handlers
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setError('Geçerli bir URL girin');
      return;
    }

    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      setError('URL http:// veya https:// ile başlamalıdır');
      return;
    }

    handleOnChange(urlInput.trim());
    setSuccess('URL ile görsel başarıyla eklendi!');
    setShowUrlModal(false);
    setUrlInput('');
    setTimeout(() => setSuccess(''), 2000);
  };

  // Check if image exists
  const currentImageValue = value || currentImage;
  const currentImageString = Array.isArray(currentImageValue) ? currentImageValue[0] : currentImageValue;
  const hasImage = currentImageString && 
                   currentImageString.trim() !== '' && 
                   (currentImageString.startsWith('/') || currentImageString.startsWith('http://') || currentImageString.startsWith('https://'));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-3 bg-brand-primary-50 border border-brand-primary-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckIcon className="w-4 h-4 text-brand-primary-600 flex-shrink-0" />
            <span className="text-sm text-brand-primary-800">{success}</span>
          </div>
        </div>
      )}

      {/* Main Upload Area */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        
        {/* Current Image Display - Kompakt Görünüm */}
        {hasImage && !uploading && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={currentImageString!}
                  alt="Uploaded image"
                  fill
                  className="object-cover"
                  onError={() => setError('Görsel yüklenirken hata oluştu')}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Görsel yüklendi
                </p>
                <p className="text-sm text-gray-500">
                  Yeni görsel yüklemek için aşağıdaki butonları kullanın
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <ArrowUpTrayIcon className="w-5 h-5 text-blue-500 animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Yükleniyor...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Actions */}
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {/* Browse Media */}
            <button
              type="button"
              onClick={handleBrowseMedia}
              disabled={disabled || uploading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FolderOpenIcon className="w-4 h-4" />
              <span>Medya Kütüphanesi</span>
            </button>

            {/* Upload New */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-primary-50 text-brand-primary-700 rounded-lg hover:bg-brand-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span>Yeni Yükle</span>
            </button>

            {/* URL Input */}
            {showUrlInput && (
              <button
                type="button"
                onClick={() => setShowUrlModal(true)}
                disabled={disabled || uploading}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                <span>URL ile Ekle</span>
              </button>
            )}

            {/* Remove Image */}
            {hasImage && (onRemove || onImageRemove) && (
              <button
                type="button"
                onClick={removeImage}
                disabled={disabled || uploading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Kaldır</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={allowMultipleSelect || acceptMultiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* MediaBrowser Modal */}
      <MediaBrowser
        isOpen={showMediaBrowser}
        onClose={handleCloseBrowser}
        onSelect={handleMediaSelect}
        onUploadNew={handleUploadNew}
        title={`${label || 'Görsel'} Seç`}
        allowedTypes={['image/']}
        pageContext={pageContext}
        allowMultipleSelect={allowMultipleSelect}
      />

      {/* URL Input Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">URL ile Görsel Ekle</h3>
              <button
                type="button"
                onClick={() => setShowUrlModal(false)}
                className="p-1 text-gray-400 hover:text-gray-500 rounded-md"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Görsel URL'si
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;