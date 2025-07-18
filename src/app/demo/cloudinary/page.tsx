'use client';

import React, { useState } from 'react';
import { CloudinaryImage, CloudinaryHeroImage, CloudinaryCardImage, CloudinaryThumbnailImage, CloudinaryGalleryImage } from '@/components/CloudinaryImage';
import { OptimizedImage, HeroImage, CardImage, ThumbnailImage, GalleryImage } from '@/components/OptimizedImage';

export default function CloudinaryDemoPage() {
  const [selectedPreset, setSelectedPreset] = useState<'hero' | 'card' | 'thumbnail' | 'gallery'>('card');
  const [selectedQuality, setSelectedQuality] = useState<'auto' | 'auto:good' | 'auto:low'>('auto');
  const [selectedFormat, setSelectedFormat] = useState<'auto' | 'webp' | 'avif' | 'jpg'>('auto');

  // Demo görselleri (Cloudinary demo hesabından)
  const demoImages = [
    'sample',
    'woman',
    'couple',
    'family',
    'man',
    'people'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cloudinary Image Optimization Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Next.js Image bileşeni ile Cloudinary entegrasyonu ve optimizasyon örnekleri
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Optimizasyon Ayarları</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Preset Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preset
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hero">Hero</option>
                <option value="card">Card</option>
                <option value="thumbnail">Thumbnail</option>
                <option value="gallery">Gallery</option>
              </select>
            </div>

            {/* Quality Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality
              </label>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">Auto</option>
                <option value="auto:good">Auto Good</option>
                <option value="auto:low">Auto Low</option>
              </select>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">Auto</option>
                <option value="webp">WebP</option>
                <option value="avif">AVIF</option>
                <option value="jpg">JPEG</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hero Image Example */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Hero Image</h2>
          <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
            <CloudinaryHeroImage
              src="sample"
              alt="Hero Image Demo"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-4xl font-bold mb-2">Hero Image</h3>
                <p className="text-xl">Optimized with Cloudinary</p>
              </div>
            </div>
          </div>
        </section>

        {/* Card Images Grid */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Card Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoImages.slice(0, 6).map((imageId, index) => (
              <div key={imageId} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <CloudinaryCardImage
                    src={imageId}
                    alt={`Demo Image ${index + 1}`}
                    fill
                    className="object-cover"
                    preset={selectedPreset}
                    quality={selectedQuality}
                    format={selectedFormat}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Card {index + 1}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Preset: {selectedPreset} | Quality: {selectedQuality} | Format: {selectedFormat}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Thumbnail Images */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Thumbnail Images</h2>
          <div className="flex flex-wrap gap-4">
            {demoImages.map((imageId, index) => (
              <div key={imageId} className="relative">
                <CloudinaryThumbnailImage
                  src={imageId}
                  alt={`Thumbnail ${index + 1}`}
                  width={100}
                  height={100}
                  className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Gallery Images */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Gallery Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {demoImages.map((imageId, index) => (
              <div key={imageId} className="relative aspect-square">
                <CloudinaryGalleryImage
                  src={imageId}
                  alt={`Gallery Image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Before vs After Comparison</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Before - Regular img tag */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Before: Regular img tag</h3>
              <div className="relative h-64 mb-4">
                <CloudinaryImage
  src="https://res.cloudinary.com/demo/image/upload/sample.jpg"
  alt="Regular img tag"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  preset="card"
  placeholder="blur"
  quality="auto"
/>
              </div>
              <div className="text-sm text-gray-600">
                <p>❌ No lazy loading</p>
                <p>❌ No automatic format optimization</p>
                <p>❌ No responsive images</p>
                <p>❌ No blur placeholder</p>
                <p>❌ No automatic quality optimization</p>
              </div>
            </div>

            {/* After - CloudinaryImage */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">After: CloudinaryImage</h3>
              <div className="relative h-64 mb-4">
                <CloudinaryImage
                  src="sample"
                  alt="Optimized CloudinaryImage"
                  fill
                  className="object-cover rounded-lg"
                  placeholder="blur"
                  quality="auto:good"
                  format="auto"
                />
              </div>
              <div className="text-sm text-green-600">
                <p>✅ Lazy loading enabled</p>
                <p>✅ Automatic format optimization (WebP/AVIF)</p>
                <p>✅ Responsive images with srcset</p>
                <p>✅ Blur placeholder</p>
                <p>✅ Automatic quality optimization</p>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Tips */}
        <section className="bg-blue-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Performance Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Do's</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Use appropriate presets for different use cases</li>
                <li>• Enable blur placeholders for better UX</li>
                <li>• Set priority={true} for above-fold images</li>
                <li>• Use proper sizes attribute for responsive images</li>
                <li>• Choose quality based on content importance</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">❌ Don'ts</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Don't use regular img tags for external images</li>
                <li>• Don't forget to add alt text</li>
                <li>• Don't use high quality for thumbnails</li>
                <li>• Don't load all images eagerly</li>
                <li>• Don't ignore responsive design</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}