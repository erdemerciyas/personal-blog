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
  SparklesIcon,
  LinkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onRemove?: () => void;
  onImageUpload?: (url: string) => void;
  onImageRemove?: () => void;
  currentImage?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  acceptMultiple?: boolean;
  maxSize?: number; // MB cinsinden
  showAIGeneration?: boolean; // AI görsel oluşturma seçeneği
  showUrlInput?: boolean; // URL ile görsel ekleme seçeneği
  projectTitle?: string; // AI için proje başlığı
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
  showAIGeneration = false,
  showUrlInput = false,
  projectTitle = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // onChange function güvenlik kontrolü
  const handleOnChange = (url: string) => {
    const changeHandler = onChange || onImageUpload;
    if (typeof changeHandler === 'function') {
      // URL validation
      if (url && (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://'))) {
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
    const currentImageValue = value || currentImage;
    const removeHandler = onRemove || onImageRemove;
    
    if (!currentImageValue || !removeHandler) return;

    try {
      // Only Cloudinary deletion is supported
      if (currentImageValue.includes('cloudinary.com')) {
        // Cloudinary URL - extract public_id
        const matches = currentImageValue.match(/\/v\d+\/(.+)\./);
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
    setShowMediaBrowser(false);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleMediaSelect = (url: string) => {
    handleOnChange(url);
    setSuccess('Görsel başarıyla seçildi!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleCloseBrowser = () => {
    setShowMediaBrowser(false);
  };

  // AI Image Generation handlers
  const handleAIGenerate = async () => {
    if (!aiPrompt && !projectTitle) {
      setError('Görsel oluşturmak için prompt yazın veya proje başlığı belirtin');
      return;
    }

    setGeneratingAI(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt || null,
          title: projectTitle || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI görsel oluşturulamadı');
      }

      handleOnChange(data.imageUrl);
      setSuccess('AI ile görsel başarıyla oluşturuldu!');
      setShowAIModal(false);
      setAiPrompt('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('AI generate error:', error);
      setError(error instanceof Error ? error.message : 'AI görsel oluşturulurken hata oluştu');
    } finally {
      setGeneratingAI(false);
    }
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
  const hasImage = currentImageValue && 
                   currentImageValue.trim() !== '' && 
                   (currentImageValue.startsWith('/') || currentImageValue.startsWith('http://') || currentImageValue.startsWith('https://'));

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

      {/* Current Image - Improved Layout */}
      {hasImage && !uploading && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 bg-white/5 border border-white/20 rounded-2xl">
          {/* Image Preview - Sol taraf */}
          <div className="lg:col-span-3">
            <div className="relative aspect-video bg-black/20 rounded-xl overflow-hidden">
              {currentImageValue && (currentImageValue.startsWith('/') || currentImageValue.startsWith('http://') || currentImageValue.startsWith('https://')) ? (
                <Image
                  src={currentImageValue}
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
                  <div className="text-center">
                    <PhotoIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Geçersiz görsel URL&apos;i</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Panel - Sağ taraf */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                <PhotoIcon className="w-5 h-5 text-teal-400" />
                <span>Görsel Bilgileri</span>
              </h3>
              
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center justify-between py-2 border-b border-slate-600/30">
                  <span className="text-slate-400">Durum:</span>
                  <span className="text-green-400 font-medium">✓ Yüklendi</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-600/30">
                  <span className="text-slate-400">Format:</span>
                  <span className="text-slate-200 font-medium">
                    {currentImageValue && currentImageValue.includes('.webp') ? 'WebP' : 
                     currentImageValue && currentImageValue.includes('.jpg') ? 'JPEG' : 
                     currentImageValue && currentImageValue.includes('.jpeg') ? 'JPEG' : 
                     currentImageValue && currentImageValue.includes('.png') ? 'PNG' : 'Görsel'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Kaynak:</span>
                  <span className="text-slate-200 font-medium">
                    {currentImageValue && currentImageValue.includes('cloudinary.com') ? 'Cloudinary' : 
                     currentImageValue && currentImageValue.includes('pexels.com') ? 'Pexels' : 'Harici'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300 border-b border-slate-600/30 pb-2">
                İşlemler
              </h4>
              
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={handleBrowseMedia}
                  disabled={disabled}
                  className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
                    disabled
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-teal-600/80 hover:bg-teal-600 text-white'
                  }`}
                >
                  <FolderOpenIcon className="w-4 h-4" />
                  <span>Görselleri Gözat</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
                    disabled
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600/80 hover:bg-blue-600 text-white'
                  }`}
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  <span>Yeni Yükle</span>
                </button>

                {showAIGeneration && (
                  <button
                    type="button"
                    onClick={() => setShowAIModal(true)}
                    disabled={disabled}
                    className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
                      disabled
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600/80 hover:bg-purple-600 text-white'
                    }`}
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>Otomatik Bul</span>
                  </button>
                )}

                {showUrlInput && (
                  <button
                    type="button"
                    onClick={() => setShowUrlModal(true)}
                    disabled={disabled}
                    className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
                      disabled
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-600/80 hover:bg-orange-600 text-white'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>URL Ekle</span>
                  </button>
                )}

                {(onRemove || onImageRemove) && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm bg-red-600/80 hover:bg-red-600 text-white mt-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Resmi Sil</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!hasImage && (
        <div className="space-y-4">
          {/* Upload Options */}
          <div className={`grid gap-4 ${showAIGeneration || showUrlInput ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
            {/* Browse Media Button */}
            <button
              type="button"
              onClick={handleBrowseMedia}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200 group"
            >
              <FolderOpenIcon className="w-10 h-10 text-slate-400 group-hover:text-teal-500 mb-3 transition-colors" />
              <h3 className="text-base font-semibold text-slate-700 group-hover:text-teal-600 mb-1 transition-colors">
                Mevcut Görselleri Gözat
              </h3>
              <p className="text-xs text-slate-500 text-center">
                Yüklenmiş görselleri seçin
              </p>
            </button>

            {/* Upload New Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 group"
            >
              <ArrowUpTrayIcon className="w-10 h-10 text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" />
              <h3 className="text-base font-semibold text-slate-700 group-hover:text-blue-600 mb-1 transition-colors">
                Yeni Görsel Yükle
              </h3>
              <p className="text-xs text-slate-500 text-center">
                Bilgisayardan görsel seçin
              </p>
            </button>

            {/* AI Generation Button */}
            {showAIGeneration && (
              <button
                type="button"
                onClick={() => setShowAIModal(true)}
                disabled={disabled}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SparklesIcon className="w-10 h-10 text-slate-400 group-hover:text-purple-500 mb-3 transition-colors" />
                <h3 className="text-base font-semibold text-slate-700 group-hover:text-purple-600 mb-1 transition-colors">
                  Otomatik Görsel Bul
                </h3>
                <p className="text-xs text-slate-500 text-center">
                  Pexels&apos;tan uygun görsel bulun
                </p>
              </button>
            )}

            {/* URL Input Button */}
            {showUrlInput && (
              <button
                type="button"
                onClick={() => setShowUrlModal(true)}
                disabled={disabled}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LinkIcon className="w-10 h-10 text-slate-400 group-hover:text-orange-500 mb-3 transition-colors" />
                <h3 className="text-base font-semibold text-slate-700 group-hover:text-orange-600 mb-1 transition-colors">
                  URL ile Ekle
                </h3>
                <p className="text-xs text-slate-500 text-center">
                  Görsel URL&apos;si girin
                </p>
              </button>
            )}
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
        <div className={`grid gap-2 ${showAIGeneration || showUrlInput ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
          <button
            type="button"
            onClick={handleBrowseMedia}
            disabled={disabled}
            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
              disabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            <FolderOpenIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Gözat</span>
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
              disabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Yükle</span>
          </button>

          {showAIGeneration && (
            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              disabled={disabled}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
                disabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <SparklesIcon className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </button>
          )}

          {showUrlInput && (
            <button
              type="button"
              onClick={() => setShowUrlModal(true)}
              disabled={disabled}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
                disabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">URL</span>
            </button>
          )}
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

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl max-w-lg w-full border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5 text-purple-400" />
                <span>Otomatik Görsel Bul</span>
              </h3>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                disabled={generatingAI}
              >
                <XMarkIcon className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {projectTitle && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-300 text-sm font-medium mb-1">Proje Başlığı:</p>
                  <p className="text-blue-100">{projectTitle}</p>
                  <p className="text-blue-200 text-xs mt-2">
                    Bu başlık otomatik olarak kullanılacak. İsterseniz aşağıya özel bir prompt yazabilirsiniz.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Özel Prompt (Opsiyonel)
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={projectTitle ? "Özel bir açıklama eklemek isterseniz buraya yazın..." : "Oluşturmak istediğiniz görseli tanımlayın..."}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                  disabled={generatingAI}
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-200 text-sm">
                  <strong>💡 İpucu:</strong> Daha iyi sonuçlar için "modern", "professional", "minimalist" gibi kelimeler kullanın.
                </p>
              </div>

              {generatingAI && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <SparklesIcon className="w-6 h-6 text-purple-400 animate-pulse" />
                    <div>
                      <p className="text-purple-300 font-medium">AI görsel oluşturuyor...</p>
                      <p className="text-purple-200 text-sm">Bu işlem 10-30 saniye sürebilir</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAIModal(false)}
                  disabled={generatingAI}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={generatingAI || (!aiPrompt && !projectTitle)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {generatingAI ? (
                    <>
                      <SparklesIcon className="w-4 h-4 animate-spin" />
                      <span>Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      <span>Görsel Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* URL Input Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl max-w-lg w-full border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <LinkIcon className="w-5 h-5 text-orange-400" />
                <span>URL ile Görsel Ekle</span>
              </h3>
              <button
                onClick={() => setShowUrlModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Görsel URL&apos;si
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-200 text-sm">
                  <strong>📌 Not:</strong> URL&apos;si geçerli ve erişilebilir bir görsel dosyasına işaret etmelidir (JPG, PNG, WebP, vb.)
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowUrlModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Görsel Ekle</span>
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