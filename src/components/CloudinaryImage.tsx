import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { 
  buildCloudinaryUrl, 
  buildBlurPlaceholder, 
  extractPublicIdFromUrl,
  CLOUDINARY_PRESETS,
  type CloudinaryOptions 
} from '../lib/cloudinary-utils';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number | 'auto' | 'auto:good' | 'auto:low';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  preset?: keyof typeof CLOUDINARY_PRESETS;
  cloudinaryOptions?: CloudinaryOptions;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
  // Cloudinary specific props
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  dpr?: number | 'auto';
  effects?: string[];
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  quality = 'auto',
  placeholder = 'blur',
  blurDataURL,
  preset,
  cloudinaryOptions,
  loading = 'lazy',
  onLoad,
  onError,
  style,
  crop,
  gravity,
  format = 'auto',
  dpr = 'auto',
  effects = []
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Cloudinary URL optimizasyonu
  const optimizedSrc = useMemo(() => {
    if (!src) return src;
    
    // Eğer src zaten tam bir URL ise ve Cloudinary değilse, olduğu gibi kullan
    if ((src.startsWith('http://') || src.startsWith('https://')) && !src.includes('cloudinary.com')) {
      return src;
    }
    
    // Cloudinary optimizasyon seçenekleri
    const options: CloudinaryOptions = {
      ...cloudinaryOptions,
      ...(preset ? CLOUDINARY_PRESETS[preset] : {}),
      ...(width && { width }),
      ...(height && { height }),
      quality: quality,
      format: format,
      ...(crop && { crop }),
      ...(gravity && { gravity }),
      ...(dpr && { dpr }),
      ...(effects.length > 0 && { flags: effects })
    };
    
    return buildCloudinaryUrl(src, options);
  }, [src, width, height, quality, preset, cloudinaryOptions, crop, gravity, format, dpr, effects]);

  // Blur placeholder
  const optimizedBlurDataURL = useMemo(() => {
    if (blurDataURL) return blurDataURL;
    
    // Eğer placeholder blur ise, blur placeholder oluştur
    if (placeholder === 'blur' && src && !src.startsWith('data:')) {
      return buildBlurPlaceholder(extractPublicIdFromUrl(src));
    }
    
    return undefined;
  }, [blurDataURL, placeholder, src]);

  // Responsive sizes
  const responsiveSizes = useMemo(() => {
    if (sizes) return sizes;
    
    if (fill) return '100vw';
    
    // Preset'e göre varsayılan sizes
    switch (preset) {
      case 'hero':
        return '100vw';
      case 'card':
        return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
      case 'thumbnail':
        return '(max-width: 768px) 50vw, 25vw';
      case 'gallery':
        return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
      default:
        return undefined;
    }
  }, [sizes, fill, preset]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  if (hasError) {
    return (
      <div className={`bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-slate-400">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">Görsel yüklenemedi</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
      )}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={responsiveSizes}
        quality={typeof quality === 'number' ? quality : 85}
        priority={priority}
        loading={priority ? 'eager' : loading}
        placeholder={placeholder === 'blur' && optimizedBlurDataURL ? 'blur' : 'empty'}
        {...(placeholder === 'blur' && optimizedBlurDataURL ? { blurDataURL: optimizedBlurDataURL } : {})}
        className={`transition-all duration-500 ease-out object-cover ${
          isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        } ${fill ? 'w-full h-full' : ''} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          ...(fill ? { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' } : {}),
          ...style
        }}
      />
    </div>
  );
};

// Preset bileşenleri - kolay kullanım için
export const CloudinaryHeroImage: React.FC<CloudinaryImageProps> = (props) => (
  <CloudinaryImage
    {...props}
    preset="hero"
    priority={props.priority !== undefined ? props.priority : true}
    loading="eager"
    quality="auto:good"
  />
);

export const CloudinaryCardImage: React.FC<CloudinaryImageProps> = (props) => (
  <CloudinaryImage
    {...props}
    preset="card"
    quality="auto:good"
  />
);

export const CloudinaryThumbnailImage: React.FC<CloudinaryImageProps> = (props) => (
  <CloudinaryImage
    {...props}
    preset="thumbnail"
    quality="auto:low"
    crop="thumb"
    gravity="face"
  />
);

export const CloudinaryGalleryImage: React.FC<CloudinaryImageProps> = (props) => (
  <CloudinaryImage
    {...props}
    preset="gallery"
    quality="auto:good"
    crop="fit"
  />
);