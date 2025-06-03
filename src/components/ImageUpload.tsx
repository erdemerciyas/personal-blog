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
  FolderOpenIcon
} from '@heroicons/react/24/outline';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  acceptMultiple?: boolean;
  maxSize?: number; // MB cinsinden
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  disabled = false,
  className = '',
  label = 'Resim Yükle',
  acceptMultiple = false,
  maxSize = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // onChange function güvenlik kontrolü
  const handleOnChange = (url: string) => {
    if (typeof onChange === 'function') {
      // URL validation
      if (url && (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://'))) {
        onChange(url);
      } else {
        console.error('ImageUpload: Invalid URL provided:', url);
        setError('Geçersiz görsel URL&apos;i');
      }
    } else {
      console.error('ImageUpload: onChange prop is not a function');
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setError('');
    setSuccess('');
    setUploading(true);
    setUploadProgress(0);

    try {
      // Dosya boyutu kontrolü
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`Dosya boyutu ${maxSize}MB&apos;dan büyük olamaz`);
      }

      // Dosya tipi kontrolü
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Sadece JPEG, PNG, GIF ve WebP formatları desteklenir');
      }

      const formData = new FormData();
      formData.append('file', file);

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
    } catch (error) {
      console.error('Upload error:', error);
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
    if (!value || !onRemove) return;

    try {
      // Extract filename from URL
      const fileName = value.split('/').pop();
      if (fileName) {
        await fetch(`/api/upload?fileName=${fileName}`, {
          method: 'DELETE',
        });
      }
      if (typeof onRemove === 'function') {
        onRemove();
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
    setShowMediaBrowser(false);
    fileInputRef.current?.click();
  };

  const handleMediaSelect = (url: string) => {
    handleOnChange(url);
    setSuccess('Görsel başarıyla seçildi!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleCloseBrowser = () => {
    setShowMediaBrowser(false);
  };

  // value kontrolü - boş string, undefined veya geçersiz URL ise resim yok kabul et
  const hasImage = value && 
                   value.trim() !== '' && 
                   (value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://'));

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-semibold text-slate-200">
        {label}
      </label>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-300 p-3 rounded-xl flex items-center space-x-2">
          <CheckIcon className="w-5 h-5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Current Image */}
      {hasImage && !uploading && (
        <div className="relative">
          <div className="relative w-full h-48 bg-white/5 border border-white/20 rounded-xl overflow-hidden">
            {value && (value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://')) ? (
              <Image
                src={value}
                alt="Uploaded image"
                fill
                className="object-cover"
                onError={(e) => {
                  console.error('Image load error:', e);
                  setError('Görsel yüklenirken hata oluştu');
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200">
                <PhotoIcon className="w-16 h-16 text-slate-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-slate-500 text-sm">Geçersiz görsel URL&apos;i</p>
                </div>
              </div>
            )}
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title="Resmi Sil"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!hasImage && (
        <div className="space-y-4">
          {/* Upload Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Browse Media Button */}
            <button
              type="button"
              onClick={handleBrowseMedia}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 group"
            >
              <FolderOpenIcon className="w-12 h-12 text-slate-400 group-hover:text-teal-500 mb-4 transition-colors" />
              <h3 className="text-lg font-semibold text-slate-700 group-hover:text-teal-600 mb-2 transition-colors">
                Mevcut Görselleri Gözat
              </h3>
              <p className="text-sm text-slate-500 text-center">
                Daha önce yüklenmiş görselleri seçin
              </p>
            </button>

            {/* Upload New Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 group"
            >
              <ArrowUpTrayIcon className="w-12 h-12 text-slate-400 group-hover:text-blue-500 mb-4 transition-colors" />
              <h3 className="text-lg font-semibold text-slate-700 group-hover:text-blue-600 mb-2 transition-colors">
                Yeni Görsel Yükle
              </h3>
              <p className="text-sm text-slate-500 text-center">
                Bilgisayarınızdan yeni görsel seçin
              </p>
            </button>
          </div>

          {/* Classic Drag & Drop Area */}
          <div className="relative">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-4">veya</p>
            </div>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-teal-500 bg-teal-50/50 scale-105'
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
              }`}
            >
              <PhotoIcon className={`w-8 h-8 mb-2 transition-colors ${dragOver ? 'text-teal-500' : 'text-slate-400'}`} />
              <p className={`text-sm font-medium transition-colors ${dragOver ? 'text-teal-600' : 'text-slate-600'}`}>
                {dragOver ? 'Dosyayı bırakın' : 'Dosyayı sürükleyip bırakın'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PNG, JPG, WebP (Maks. {maxSize}MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-white/5 border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <ArrowUpTrayIcon className="w-8 h-8 text-teal-400 animate-pulse" />
            <div className="flex-1">
              <p className="text-slate-300 mb-2">Yükleniyor...</p>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-400 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Replace Image Button */}
      {hasImage && !uploading && (
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleBrowseMedia}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              disabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            <FolderOpenIcon className="w-5 h-5" />
            <span>Mevcut Görselleri Gözat</span>
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              disabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span>Yeni Yükle</span>
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={acceptMultiple}
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
      />
    </div>
  );
};

export default ImageUpload; 