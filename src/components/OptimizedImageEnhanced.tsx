'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { imageOptimizer } from '@/lib/image-optimizer';

interface OptimizedImageEnhancedProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  enableOptimization?: boolean;
  showMetadata?: boolean;
}

/**
 * Enhanced Optimized Image Component
 * Integrates with imageOptimizer for advanced optimization
 */
export const OptimizedImageEnhanced: React.FC<OptimizedImageEnhancedProps> = ({
  src,
  alt,
  width = 1200,
  height = 800,
  className = '',
  priority = false,
  fill = false,
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
  enableOptimization = true,
  showMetadata = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    if (enableOptimization && src) {
      // Generate optimized URL
      const optimized = imageOptimizer.generateOptimizedUrl(src, {
        quality,
        width,
        height,
        format: 'webp',
      });
      setOptimizedSrc(optimized);

      // Fetch metadata if requested
      if (showMetadata) {
        imageOptimizer.getImageMetadata(src).then(setMetadata);
      }
    }
  }, [src, quality, width, height, enableOptimization, showMetadata]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Görsel yüklenemedi</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={imageOptimizer.generateSizes()}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
      />
      {showMetadata && metadata && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b">
          <div>Format: {metadata.format}</div>
          <div>Size: {(metadata.size / 1024).toFixed(2)} KB</div>
          <div>Optimized: {(metadata.optimizedSize / 1024).toFixed(2)} KB</div>
          <div>Compression: {metadata.compressionRatio}%</div>
        </div>
      )}
    </div>
  );
};

/**
 * Responsive Image Component with srcSet
 */
export const ResponsiveImage: React.FC<OptimizedImageEnhancedProps> = (props) => {
  const responsive = imageOptimizer.generateResponsiveImage(
    props.src,
    props.alt,
    { width: props.width, height: props.height }
  );

  return (
    <OptimizedImageEnhanced
      {...props}
      src={responsive.src}
    />
  );
};

/**
 * Hero Image Preset
 */
export const HeroImageEnhanced: React.FC<Omit<OptimizedImageEnhancedProps, 'priority' | 'quality'>> = (
  props
) => (
  <OptimizedImageEnhanced
    {...props}
    priority={true}
    quality={85}
    enableOptimization={true}
  />
);

/**
 * Card Image Preset
 */
export const CardImageEnhanced: React.FC<OptimizedImageEnhancedProps> = (props) => (
  <OptimizedImageEnhanced
    {...props}
    quality={75}
    enableOptimization={true}
  />
);

/**
 * Thumbnail Image Preset
 */
export const ThumbnailImageEnhanced: React.FC<OptimizedImageEnhancedProps> = (props) => (
  <OptimizedImageEnhanced
    {...props}
    quality={60}
    width={300}
    height={300}
    enableOptimization={true}
  />
);

/**
 * Picture Element Component
 * Renders HTML5 picture element with multiple formats
 */
export const PictureElement: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({ src, alt, width = 1200, height = 800, className = '' }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const pictureHtml = imageOptimizer.generatePictureElement(src, alt);
    setHtml(pictureHtml);
  }, [src, alt]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ width, height }}
    />
  );
};
