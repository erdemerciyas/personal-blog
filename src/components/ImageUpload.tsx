'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import MediaBrowser from './MediaBrowser';
import { useToast } from './ui/useToast';
import {
  ArrowUpTrayIcon,
  TrashIcon,
  FolderOpenIcon,
  LinkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ImageUploadProps {
  // Standardized props - use only these
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  
  // Optional props
  disabled?: boolean;
  className?: string;
  label?: string;
  acceptMultiple?: boolean;
  maxSize?: number;
  showUrlInput?: boolean;
  pageContext?: string;
  allowMultipleSelect?: boolean;
  
  // Deprecated props - kept for backward compatibility
  onRemove?: () => void;
  onImageUpload?: (url: string | string[]) => void;
  onImageRemove?: () => void;
  currentImage?: string;
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
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { show: showToast } = useToast();

  // Standardized onChange handler
  const handleOnChange = (url: string | string[]) => {
    try {
      // Use primary onChange prop, fallback to deprecated props for backward compatibility
      const changeHandler = onChange || onImageUpload;
      
      if (!changeHandler) {
        showToast({
          title: "Hata",
          description: "onChange handler tanımlanmamış",
          variant: "danger"
        });
        return;
      }

      if (Array.isArray(url)) {
        const validUrls = url.filter(u => u && (u.startsWith('/') || u.startsWith('http://') || u.startsWith('https://')));
        if (validUrls.length > 0) {
          changeHandler(validUrls);
          showToast({
            title: "Başarılı",
            description: `${validUrls.length} görsel seçildi`,
            variant: "success"
          });
        } else {
          showToast({
            title: "Hata",
            description: "Geçersiz görsel URL'leri",
            variant: "danger"
          });
        }
      } else if (url && (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://'))) {
        changeHandler(url);
        showToast({
          title: "Başarılı",
          description: "Görsel başarıyla yüklendi",
          variant: "success"
        });
      } else {
        showToast({
          title: "Hata",
          description: "Geçersiz görsel URL'i",
          variant: "danger"
        });
      }
    } catch (error) {
      console.error('ImageUpload onChange error:', error);
      showToast({
        title: "Hata",
        description: "Görsel işlenirken hata oluştu",
        variant: "danger"
      });
    }
  };

  // File selection handler with improved error handling
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);

    try {
      const file = files[0];
      
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`Dosya boyutu ${maxSize}MB'dan büyük olamaz`);
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Sadece resim dosyaları yüklenebilir');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('pageContext', pageContext);

      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to server
      const response = await fetch('/api/admin/upload', {
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
      
      if (data.success && data.url) {
        handleOnChange(data.url);
      } else {
        throw new Error('Upload response geçersiz');
      }
      
      // Reset progress after success
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('File upload error:', error);
      showToast({
        title: "Upload Hatası",
        description: error instanceof Error ? error.message : 'Upload sırasında hata oluştu',
        variant: "danger"
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Remove image handler
  const removeImage = async () => {
    try {
      // Use primary onChange prop, fallback to deprecated props
      if (typeof onRemove === 'function') {
        onRemove();
      } else if (typeof onImageRemove === 'function') {
        onImageRemove();
      } else if (typeof onChange === 'function') {
        onChange('');
      }
      
      showToast({
        title: "Başarılı",
        description: "Görsel başarıyla kaldırıldı",
        variant: "success"
      });
    } catch (error) {
      console.error('Image remove error:', error);
      showToast({
        title: "Hata",
        description: "Görsel kaldırılırken hata oluştu",
        variant: "danger"
      });
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
    handleOnChange(url);
    setShowMediaBrowser(false);
  };

  const handleCloseBrowser = () => {
    setShowMediaBrowser(false);
  };

  // URL Input handlers
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      showToast({
        title: "Hata",
        description: "Geçerli bir URL girin",
        variant: "danger"
      });
      return;
    }

    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      showToast({
        title: "Hata",
        description: "URL http:// veya https:// ile başlamalıdır",
        variant: "danger"
      });
      return;
    }

    handleOnChange(urlInput.trim());
    setShowUrlModal(false);
    setUrlInput('');
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

      {/* Toast notifications are handled by useToast hook */}

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
                  onError={() => console.error('Görsel yüklenirken hata oluştu')}
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
        variant="fullscreen"
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
                  Görsel URL&apos;si
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
