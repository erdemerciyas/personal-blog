'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import MediaBrowser from './MediaBrowser';
import {
  PhotoIcon,
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
  maxSize?: number; // MB cinsinden
  showUrlInput?: boolean; // URL ile görsel ekleme seçeneği
  pageContext?: string; // Sayfa bağlamı (portfolio, service, etc.)
  allowMultipleSelect?: boolean; // Çoklu seçim izni
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
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
      // URL validation
      if (Array.isArray(url)) {
        const validUrls = url.filter(u => u && (u.startsWith('/') || u.startsWith('http://') || u.startsWith('https://')));
        if (validUrls.length > 0) {
          changeHandler(validUrls);
        } else {
          console.error('ImageUpload: No valid URLs provided:', url);
          setError('Geçersiz görsel URL\'leri');
        }
      } else if (url && (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://'))) {
        changeHandler(url);
      } else {
        console.error('ImageUpload: Invalid URL provided:', url);
        setError('Geçersiz görsel URL\'i');
      }
    } else {
      console.error('ImageUpload: onChange/onImageUpload prop is not a function');
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (allowMultipleSelect) {
      const fileArray = Array.from(files);
      await uploadMultipleFiles(fileArray);
    } else {
      const file = files[0];
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setError('');
    setSuccess('');
    setUploading(true);
    setUploadProgress(0);

    try {
      // Dosya boyutu kontrolü
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`Dosya boyutu ${maxSize}MB'dan büyük olamaz`);
      }

      // Dosya tipi kontrolü
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Sadece JPEG, PNG, GIF ve WebP formatları desteklenir');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('pageContext', pageContext);

      // Upload progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

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
      handleOnChange(data.url);
      setSuccess('Resim başarıyla yüklendi!');
      
      // Modal'ı kapat
      setShowMediaBrowser(false);
      
      setTimeout(() => {
        setSuccess('');
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload sırasında hata oluştu');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleFiles = async (files: File[]) => {
    setError('');
    setSuccess('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file) => {
        // Dosya boyutu kontrolü
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`${file.name} dosya boyutu ${maxSize}MB'dan büyük olamaz`);
        }

        // Dosya tipi kontrolü
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`${file.name} sadece JPEG, PNG, GIF ve WebP formatları desteklenir`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('pageContext', pageContext);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `${file.name} upload başarısız`);
        }

        const data = await response.json();
        return data.url;
      });

      // Upload progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const urls = await Promise.all(uploadPromises);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      handleOnChange(urls);
      setSuccess(`${files.length} resim başarıyla yüklendi!`);
      
      // Modal'ı kapat
      setShowMediaBrowser(false);
      
      setTimeout(() => {
        setSuccess('');
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Multiple upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload sırasında hata oluştu');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const removeImage = async () => {
    const removeHandler = onRemove || onImageRemove;
    const currentImageString = Array.isArray(currentImageValue) ? currentImageValue[0] : currentImageValue;
    
    if (!currentImageString || !removeHandler) return;

    try {
      // Only Cloudinary deletion is supported
      if (currentImageString.includes('cloudinary.com')) {
        // Cloudinary URL - extract public_id
        const matches = currentImageString.match(/\/v\d+\/(.+)\./);
        if (matches) {
          const publicId = matches[1];
          await fetch('/api/admin/media', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mediaIds: [publicId] })
          });
        }
      }
      
      if (typeof removeHandler === 'function') {
        removeHandler();
      }
      setSuccess('Resim başarıyla silindi!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      console.error('Delete error:', error);
      setError('Resim silinirken hata oluştu');
    }
  };

  // MediaBrowser handlers
  const handleBrowseMedia = () => {
    setShowMediaBrowser(true);
  };

  const handleUploadNew = () => {
    // File input'u tetikle ama modal'ı kapatma
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

  // value kontrolü - boş string, undefined veya geçersiz URL ise resim yok kabul et
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
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-green-700">{success}</span>
          </div>
        </div>
      )}

      {/* Main Upload Area */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        
        {/* Current Image Display */}
        {hasImage && !uploading && (
          <div className="p-4 border-b border-gray-100">
            <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden">
              <Image
                src={currentImageString!}
                alt="Uploaded image"
                fill
                className="object-cover"
                onError={(e) => {
                  console.error('Image load error:', e);
                  setError('Görsel yüklenirken hata oluştu');
                }}
              />
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

        {/* Upload Zone */}
        {!hasImage && !uploading && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 text-center cursor-pointer transition-colors ${
              dragOver 
                ? 'bg-blue-50 border-blue-300' 
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <PhotoIcon className={`w-8 h-8 mx-auto mb-3 ${
              dragOver ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <p className={`text-sm font-medium mb-1 ${
              dragOver ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {dragOver ? 'Dosyayı bırakın' : 'Dosya seçin veya sürükleyip bırakın'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP (Maks. {maxSize}MB)
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-3 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {/* Browse Media */}
            <button
              type="button"
              onClick={handleBrowseMedia}
              disabled={disabled}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FolderOpenIcon className="w-4 h-4 mr-1.5" />
              Gözat
            </button>

            {/* Upload New */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpTrayIcon className="w-4 h-4 mr-1.5" />
              Yükle
            </button>

            {/* URL Input */}
            {showUrlInput && (
              <button
                type="button"
                onClick={() => setShowUrlModal(true)}
                disabled={disabled}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LinkIcon className="w-4 h-4 mr-1.5" />
                URL
              </button>
            )}

            {/* Remove Image */}
            {hasImage && (onRemove || onImageRemove) && (
              <button
                type="button"
                onClick={removeImage}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
              >
                <TrashIcon className="w-4 h-4 mr-1.5" />
                Sil
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
                  onClick={() => setShowUrlModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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