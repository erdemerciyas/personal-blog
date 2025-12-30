'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  CubeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import ModelViewer from '../3DModelViewer';
import { Model3D } from '../../types/portfolio';

interface MediaItem {
  type: 'image' | '3d-model';
  url: string;
  name?: string;
  format?: string;
  size?: number;
  downloadable?: boolean;
  publicId?: string;
}

interface PortfolioMediaGalleryProps {
  images: string[];
  models3D?: Model3D[];
  title: string;
  coverImage?: string;
}

export default function PortfolioMediaGallery({ 
  images, 
  models3D = [],
  title, 
  coverImage 
}: PortfolioMediaGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItemIndex, setLightboxItemIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Combine images and 3D models into a unified media array
  const allMediaItems = useMemo(() => {
    const mediaItems: MediaItem[] = [];
    
    // Add images
    const imageList = coverImage && !images.includes(coverImage) 
      ? [coverImage, ...images] 
      : images.length > 0 ? images : (coverImage ? [coverImage] : []);
    
    imageList.forEach(image => {
      mediaItems.push({
        type: 'image',
        url: image
      });
    });
    
    // Add 3D models
    models3D.forEach(model => {
      mediaItems.push({
        type: '3d-model',
        url: model.url,
        name: model.name,
        format: model.format,
        size: model.size,
        downloadable: model.downloadable,
        publicId: model.publicId
      });
    });
    
    return mediaItems;
  }, [coverImage, images, models3D]);

  useEffect(() => {
    setMounted(true);
    if (allMediaItems.length > 0 && !selectedItem) {
      setSelectedItem(allMediaItems[0]);
    }
  }, [allMediaItems, selectedItem]);

  // Keyboard navigation for lightbox and body scroll lock
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          setLightboxOpen(false);
          break;
        case 'ArrowLeft':
          setLightboxItemIndex((prev) => (prev > 0 ? prev - 1 : allMediaItems.length - 1));
          break;
        case 'ArrowRight':
          setLightboxItemIndex((prev) => (prev < allMediaItems.length - 1 ? prev + 1 : 0));
          break;
      }
    };

    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyPress);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [lightboxOpen, lightboxItemIndex, allMediaItems.length]);

  const openLightbox = (itemIndex: number) => {
    setLightboxItemIndex(itemIndex);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxItemIndex((prev) => (prev > 0 ? prev - 1 : allMediaItems.length - 1));
    } else {
      setLightboxItemIndex((prev) => (prev < allMediaItems.length - 1 ? prev + 1 : 0));
    }
  };

  const handleDownload = async (model: MediaItem) => {
    if (model.type !== '3d-model' || !model.downloadable || !model.name) {
      return;
    }

    try {
      const response = await fetch(`/api/3dmodels/download?url=${encodeURIComponent(model.url)}&filename=${encodeURIComponent(model.name)}`);
      
      if (!response.ok) {
        throw new Error('İndirme başarısız');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = model.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('İndirme hatası:', error);
      alert('İndirme sırasında bir hata oluştu');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!allMediaItems.length) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
        <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <PhotoIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Medya bulunamadı</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Main Media Display */}
        <motion.div 
          key={`main-media-${selectedItem?.url || 'loading'}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white group cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            if (selectedItem) {
              const currentIndex = allMediaItems.findIndex(item => item.url === selectedItem.url);
              openLightbox(currentIndex >= 0 ? currentIndex : 0);
            }
          }}
        >
          {selectedItem ? (
            <>
              {selectedItem.type === 'image' ? (
                <div className="relative w-full h-full">
                  <Image
                    key={`selected-${selectedItem.url}`}
                    src={selectedItem.url}
                    alt={`${title} - Seçili Görsel`}
                    fill
                    className="object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  />
                  {/* Hover overlay for images */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl">
                        <MagnifyingGlassIcon className="w-8 h-8 text-slate-700" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <>
                  {/* 3D Model Preview - Mini viewer */}
                  <div className="w-full h-full relative">
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200">
                      <ModelViewer 
                        modelUrl={selectedItem.url} 
                        format={selectedItem.format || 'gltf'}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CubeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{selectedItem.format?.toUpperCase()}</span>
                      </div>
                    </div>
                    {selectedItem.downloadable && (
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  {/* Hover overlay for 3D models */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl">
                        <CubeIcon className="w-8 h-8 text-blue-600" />
                      </div>
                    </motion.div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="bg-slate-100 flex items-center justify-center h-full">
              <div className="text-center">
                <PhotoIcon className="h-16 w-16 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Medya yükleniyor...</p>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Media Thumbnail Gallery */}
        {allMediaItems.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <PhotoIcon className="w-6 h-6 mr-3 text-brand-primary-700" />
              Proje Medyaları ({allMediaItems.length})
              {models3D.length > 0 && (
                <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {models3D.length} 3D Model
                </span>
              )}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {allMediaItems.map((item, index) => (
                <motion.button
                  key={`thumb-${index}-${item.url}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedItem(item);
                  }}
                  className={`relative aspect-square w-full h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36 rounded-xl overflow-hidden border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:ring-offset-2 ${
                    selectedItem?.url === item.url
                      ? 'border-brand-primary-600 shadow-lg ring-4 ring-brand-primary-200 scale-105'
                      : 'border-slate-200 hover:border-brand-primary-300 hover:shadow-md'
                  }`}
                  type="button"
                >
                  {item.type === 'image' ? (
                    <Image
                      src={item.url}
                      alt={`Proje görseli ${index + 1}`}
                      fill
                      className="object-cover pointer-events-none"
                      sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, (max-width: 1024px) 12vw, 10vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                      <CubeIcon className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  
                  {selectedItem?.url === item.url && (
                    <div className="absolute inset-0 bg-brand-primary-600/20 flex items-center justify-center pointer-events-none">
                      <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                    </div>
                  )}
                  
                  {/* Media type indicator */}
                  <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none flex items-center space-x-1">
                    {item.type === 'image' ? (
                      <PhotoIcon className="w-3 h-3" />
                    ) : (
                      <CubeIcon className="w-3 h-3" />
                    )}
                  </div>
                  
                  {/* Media number overlay */}
                  <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                    {index + 1}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Lightbox Modal */}
      {mounted && lightboxOpen && createPortal(
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 99999,
            width: '100vw',
            height: '100vh'
          }}
        >
          <div className="relative w-screen h-screen flex items-center justify-center p-4" style={{ width: '100vw', height: '100vh' }}>
            
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-4 transition-all duration-200 hover:scale-110"
              title="Kapat (ESC)"
            >
              <XMarkIcon className="w-6 h-6" />
            </motion.button>
            
            {/* Media Counter */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute top-6 left-6 z-10 bg-black/50 text-white px-6 py-3 rounded-full text-lg font-medium flex items-center space-x-2"
            >
              {allMediaItems[lightboxItemIndex]?.type === '3d-model' ? (
                <CubeIcon className="w-5 h-5" />
              ) : (
                <PhotoIcon className="w-5 h-5" />
              )}
              <span>{lightboxItemIndex + 1} / {allMediaItems.length}</span>
            </motion.div>
            
            {/* Download Button for 3D Models */}
            {allMediaItems[lightboxItemIndex]?.type === '3d-model' && allMediaItems[lightboxItemIndex]?.downloadable && (
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => handleDownload(allMediaItems[lightboxItemIndex])}
                className="absolute top-6 right-20 z-10 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                title="3D Modeli İndir"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>İndir</span>
              </motion.button>
            )}
            
            {/* Previous Button */}
            {allMediaItems.length > 1 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => navigateLightbox('prev')}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-4 transition-all duration-200 hover:scale-110"
                title="Önceki (←)"
              >
                <ChevronLeftIcon className="w-8 h-8" />
              </motion.button>
            )}
            
            {/* Main Media Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full max-w-7xl max-h-full"
            >
              {allMediaItems[lightboxItemIndex]?.type === 'image' ? (
                <Image
                  src={allMediaItems[lightboxItemIndex].url}
                  alt={`${title} - Görsel ${lightboxItemIndex + 1}`}
                  fill
                  className="object-contain"
                  quality={100}
                  sizes="100vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full max-w-4xl h-96 bg-white rounded-lg overflow-hidden">
                    <ModelViewer 
                      modelUrl={allMediaItems[lightboxItemIndex].url} 
                      format={allMediaItems[lightboxItemIndex].format || 'gltf'}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </motion.div>
            
            {/* Next Button */}
            {allMediaItems.length > 1 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => navigateLightbox('next')}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-4 transition-all duration-200 hover:scale-110"
                title="Sonraki (→)"
              >
                <ChevronRightIcon className="w-8 h-8" />
              </motion.button>
            )}
            
            {/* Media Title and Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 text-white px-8 py-4 rounded-2xl text-center max-w-2xl"
            >
              <h3 className="font-bold text-xl mb-2">{title}</h3>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
                <span>
                  {allMediaItems[lightboxItemIndex]?.type === '3d-model' ? '3D Model' : 'Görsel'} {lightboxItemIndex + 1} / {allMediaItems.length}
                </span>
                {allMediaItems[lightboxItemIndex]?.type === '3d-model' && (
                  <>
                    <span>•</span>
                    <span>{allMediaItems[lightboxItemIndex]?.format?.toUpperCase()}</span>
                    {allMediaItems[lightboxItemIndex]?.size && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(allMediaItems[lightboxItemIndex].size!)}</span>
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>
            
            {/* Click outside to close */}
            <div 
              className="absolute inset-0 -z-10" 
              onClick={() => setLightboxOpen(false)}
            />
          </div>
        </motion.div>,
        document.body
      )}
    </div>
  );
}