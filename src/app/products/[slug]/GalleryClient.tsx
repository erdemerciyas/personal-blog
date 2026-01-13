'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import NextImage from 'next/image';

type Props = {
  cover: string;
  images?: string[];
  title: string;
};

export default function ProductGallery({ cover, images = [], title }: Props) {
  const gallery = useMemo(() => [cover, ...images.filter((u) => u && u !== cover)], [cover, images]);
  const [active, setActive] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === 'Escape') setIsFullscreen(false);
      if (e.key === 'ArrowLeft') setActive((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
      if (e.key === 'ArrowRight') setActive((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, gallery.length]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActive((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActive((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div
          className="relative group rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm aspect-[4/3] cursor-zoom-in"
          onClick={toggleFullscreen}
        >
          <NextImage src={gallery[active] || cover} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />

          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
              <ArrowsPointingOutIcon className="w-6 h-6 text-slate-700" />
            </div>
          </div>

          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
            {active + 1} / {gallery.length}
          </div>
        </div>

        {/* Thumbnails */}
        {gallery.length > 1 && (
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {gallery.map((u, idx) => (
              <div
                key={`${u}-${idx}`}
                onClick={() => setActive(idx)}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all h-24 ${active === idx
                  ? 'border-brand-primary-500 ring-2 ring-brand-primary-200 ring-offset-1'
                  : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100 h-24'
                  }`}
              >
                <NextImage src={u} alt={`${title} ${idx + 1}`} fill className="object-cover" sizes="100px" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={toggleFullscreen}
          >
            {/* Controls */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
              <div className="text-white/80 font-medium">
                {active + 1} / {gallery.length}
              </div>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
            </div>

            {/* Navigation Arrows */}
            {gallery.length > 1 && (
              <>
                <button
                  className="absolute left-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50"
                  onClick={prevImage}
                >
                  <ChevronLeftIcon className="w-8 h-8" />
                </button>
                <button
                  className="absolute right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50"
                  onClick={nextImage}
                >
                  <ChevronRightIcon className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Main Fullscreen Image */}
            <div
              className="w-full h-full flex items-center justify-center p-4 md:p-12 lg:p-20"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full h-full"
              >
                <NextImage src={gallery[active]} alt={title} fill className="object-contain drop-shadow-2xl" sizes="100vw" />
              </motion.div>
            </div>

            {/* Bottom Thumbnails Strip */}
            {gallery.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2 bg-black/40 backdrop-blur-md rounded-2xl" onClick={(e) => e.stopPropagation()}>
                {gallery.map((u, idx) => (
                  <div
                    key={`thumb-${idx}`}
                    onClick={() => setActive(idx)}
                    className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${active === idx
                      ? 'border-white opacity-100 scale-110 shadow-lg'
                      : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                  >
                    <NextImage src={u} alt={`${title} thumb ${idx}`} fill className="object-cover" sizes="100px" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


