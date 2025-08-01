'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { InlineLoader } from './AdminLoader';
import {
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  TrashIcon,
  StarIcon,
  Bars3Icon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import MediaBrowser from './MediaBrowser';

interface PortfolioImageGalleryProps {
  images: string[];
  coverImage: string;
  onImagesChange: (images: string[]) => void;
  onCoverImageChange: (coverImage: string) => void;
  disabled?: boolean;
  maxSize?: number; // MB cinsinden
  pageContext?: string;
}

interface ImageItem {
  url: string;
  id: string;
}

const PortfolioImageGallery: React.FC<PortfolioImageGalleryProps> = ({
  images,
  coverImage,
  onImagesChange,
  onCoverImageChange,
  disabled = false,
  maxSize = 10,
  pageContext = 'portfolio'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Görsel listesini ImageItem formatına çevir
  const imageItems: ImageItem[] = images.map((url, index) => ({
    url,
    id: `image-${index}-${url.split('/').pop()}`
  }));

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    await uploadMultipleFiles(fileArray);
  };

  const uploadMultipleFiles = async (files: File[]) => {
    setError('');
    setSuccess('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
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
        
        // Progress güncelle
        setUploadProgress(((index + 1) / files.length) * 100);
        
        return data.url;
      });

      const newUrls = await Promise.all(uploadPromises);
      const updatedImages = [...images, ...newUrls];
      
      onImagesChange(updatedImages);
      
      // Eğer kapak görseli yoksa, ilk yüklenen görseli kapak yap
      if (!coverImage && newUrls.length > 0) {
        onCoverImageChange(newUrls[0]);
      }

      setSuccess(`${files.length} resim başarıyla yüklendi!`);
      
      // Modal'ı kapat
      setMediaModalOpen(false);
      
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

  // Medya kütüphanesinden seçilen görselleri ekle
  const handleMediaSelect = (urls: string | string[]) => {
    let newImages: string[] = [];
    if (Array.isArray(urls)) {
      // Aynı görsel tekrar eklenmesin
      newImages = [...images, ...urls.filter(url => !images.includes(url))];
    } else if (typeof urls === 'string' && !images.includes(urls)) {
      newImages = [...images, urls];
    } else {
      newImages = [...images];
    }
    onImagesChange(newImages);
    // Eğer kapak yoksa, ilk eklenen görseli kapak yap
    if (!coverImage && newImages.length > 0) {
      onCoverImageChange(newImages[0]);
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

  const removeImage = (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    
    onImagesChange(updatedImages);
    
    // Eğer silinen görsel kapak görseli ise, yeni kapak seç
    if (imageToRemove === coverImage) {
      const newCover = updatedImages.length > 0 ? updatedImages[0] : '';
      onCoverImageChange(newCover);
    }
    
    setSuccess('Görsel başarıyla silindi!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const setCoverImage = (imageUrl: string) => {
    onCoverImageChange(imageUrl);
    setSuccess('Kapak görseli güncellendi!');
    setTimeout(() => setSuccess(''), 2000);
  };

  // Drag & Drop için görsel sıralama
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Sürüklenen öğeyi kaldır
    newImages.splice(draggedIndex, 1);
    
    // Yeni pozisyona ekle
    newImages.splice(dropIndex, 0, draggedImage);
    
    onImagesChange(newImages);
    setDraggedIndex(null);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
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

      {/* Upload Progress */}
      {uploading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <ArrowUpTrayIcon className="w-5 h-5 text-blue-500 animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-sm text-blue-700 mb-1">
                <span>Görseller yükleniyor...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <InlineLoader text="Görseller yükleniyor..." />
        </div>
      ) : (
        // Yükleme ve medya kütüphanesi butonları
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            <ArrowUpTrayIcon className="w-5 h-5" /> Görsel Yükle
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-primary-600 bg-brand-primary-50 hover:bg-brand-primary-100 text-brand-primary-800 transition-colors"
            onClick={() => setMediaModalOpen(true)}
            disabled={disabled || uploading}
          >
            <PhotoIcon className="w-5 h-5" /> Medya Kütüphanesinden Seç
          </button>
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={e => handleFileSelect(e.target.files)}
        disabled={disabled || uploading}
      />

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-900">
              Proje Görselleri ({images.length})
            </h4>
            <p className="text-sm text-slate-600">
              ⭐ işaretli görsel kapak görseli olarak kullanılır
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                draggable={!disabled}
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={handleImageDragOver}
                onDrop={(e) => handleImageDrop(e, index)}
                onDragEnd={handleImageDragEnd}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all h-32 ${
                  imageUrl === coverImage 
                    ? 'border-brand-primary-600 shadow-lg' 
                    : 'border-slate-200 hover:border-slate-300'
                } ${draggedIndex === index ? 'opacity-50 scale-95' : ''} ${
                  !disabled ? 'cursor-move' : ''
                }`}
              >
                {/* Drag Handle */}
                {!disabled && (
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black bg-opacity-50 rounded p-1">
                      <Bars3Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                {/* Cover Image Badge */}
                {imageUrl === coverImage && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-brand-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <StarIconSolid className="w-3 h-3" />
                      <span>Kapak</span>
                    </div>
                  </div>
                )}

                {/* Image */}
                <div className="aspect-square bg-slate-100 h-32 w-32">
                  <Image
                    src={imageUrl}
                    alt={`Proje görseli ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      console.error('Image load error:', e);
                    }}
                  />
                </div>

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    {/* Set as Cover */}
                    {imageUrl !== coverImage && (
                      <button
                        type="button"
                        onClick={() => setCoverImage(imageUrl)}
                        className="bg-brand-primary-700 hover:bg-brand-primary-800 text-white p-2 rounded-lg transition-colors"
                        title="Kapak görseli yap"
                      >
                        <StarIcon className="w-4 h-4" />
                      </button>
                    )}

                    {/* Remove Image */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                      title="Görseli sil"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Order Badge */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Gallery Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <PhotoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Galeri Yönetimi:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Görselleri sürükleyerek sıralayabilirsiniz</li>
                  <li>• ⭐ butonuna tıklayarak kapak görseli seçebilirsiniz</li>
                  <li>• 🗑️ butonuna tıklayarak görseli silebilirsiniz</li>
                  <li>• Kapak görseli otomatik olarak ilk görsel seçilir</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <MediaBrowser
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        onUploadNew={() => {
          console.log('onUploadNew çağrıldı - PortfolioImageGallery');
          // Dosya seçim input'unu tetikle ama modal'ı kapatma
          fileInputRef.current?.click();
        }}
        allowedTypes={["image/"]}
        allowMultipleSelect={true}
        theme="light"
        pageContext={pageContext}
      />
    </div>
  );
};

export default PortfolioImageGallery; 