'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface PortfolioImageGalleryProps {
  images: string[];
  title: string;
  coverImage?: string;
}

export default function PortfolioImageGallery({ 
  images, 
  title, 
  coverImage 
}: PortfolioImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Combine cover image with other images, avoiding duplicates
  const allImages = coverImage
    ? [coverImage, ...images.filter(img => img !== coverImage)]
    : images;

  useEffect(() => {
    setMounted(true);
    if (allImages.length > 0 && !selectedImage) {
      setSelectedImage(allImages[0]);
    }
  }, [allImages, selectedImage]);



  // Keyboard navigation for lightbox and body scroll lock
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          setLightboxOpen(false);
          break;
        case 'ArrowLeft':
          setLightboxImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
          break;
        case 'ArrowRight':
          setLightboxImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
          break;
      }
    };

    if (lightboxOpen) {
      // Lock body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyPress);
    } else {
      // Restore body scroll when lightbox is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [lightboxOpen, lightboxImageIndex, allImages.length]);

  const openLightbox = (imageIndex: number) => {
    setLightboxImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
    } else {
      setLightboxImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    }
  };

  if (!allImages.length) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
        <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <PhotoIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Görsel bulunamadı</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Main Image */}
        <motion.div 
          key={`main-image-${selectedImage}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white group cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            const currentIndex = allImages.findIndex(img => img === selectedImage);
            openLightbox(currentIndex >= 0 ? currentIndex : 0);
          }}
        >
          {selectedImage ? (
            <>
              <Image
                key={`selected-${selectedImage}`}
                src={selectedImage}
                alt={`${title} - Seçili Görsel`}
                fill
                className="object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
              {/* Hover overlay */}
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
            </>
          ) : (
            <div className="bg-slate-100 flex items-center justify-center h-full">
              <div className="text-center">
                <PhotoIcon className="h-16 w-16 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Görsel yükleniyor...</p>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Thumbnail Gallery */}
        {allImages.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <PhotoIcon className="w-6 h-6 mr-3 text-teal-600" />
              Proje Görselleri ({allImages.length})
            </h3>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {allImages.map((image, index) => (
                <motion.button
                  key={`thumb-${index}-${image}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedImage(image);
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                    selectedImage === image
                      ? 'border-teal-500 shadow-lg ring-4 ring-teal-200 scale-105'
                      : 'border-slate-200 hover:border-teal-300 hover:shadow-md'
                  }`}
                  type="button"
                >
                  <Image
                    src={image}
                    alt={`Proje görseli ${index + 1}`}
                    fill
                    className="object-cover pointer-events-none"
                    sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, (max-width: 1024px) 12vw, 10vw"
                  />
                  {selectedImage === image && (
                    <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center pointer-events-none">
                      <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                    </div>
                  )}
                  
                  {/* Image number overlay */}
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
              
              {/* Image Counter */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute top-6 left-6 z-10 bg-black/50 text-white px-6 py-3 rounded-full text-lg font-medium"
              >
                {lightboxImageIndex + 1} / {allImages.length}
              </motion.div>
              
              {/* Previous Button */}
              {allImages.length > 1 && (
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
              
              {/* Main Image Container */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full max-w-7xl max-h-full"
              >
                <Image
                  src={allImages[lightboxImageIndex]}
                  alt={`${title} - Görsel ${lightboxImageIndex + 1}`}
                  fill
                  className="object-contain"
                  quality={100}
                  sizes="100vw"
                  priority
                />
              </motion.div>
              
              {/* Next Button */}
              {allImages.length > 1 && (
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
              
              {/* Image Title */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 text-white px-8 py-4 rounded-2xl text-center max-w-2xl"
              >
                <h3 className="font-bold text-xl mb-2">{title}</h3>
                <p className="text-sm text-gray-300">Görsel {lightboxImageIndex + 1} / {allImages.length}</p>
              </motion.div>
              
              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 backdrop-blur-sm rounded-3xl p-4 max-w-6xl overflow-x-auto"
                >
                  <div className="flex space-x-3">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setLightboxImageIndex(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-200 hover:scale-105 ${
                          lightboxImageIndex === index
                            ? 'border-teal-400 shadow-lg shadow-teal-400/50'
                            : 'border-white/30 hover:border-white/60'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Küçük görsel ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                        {lightboxImageIndex === index && (
                          <div className="absolute inset-0 bg-teal-400/20 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
              
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