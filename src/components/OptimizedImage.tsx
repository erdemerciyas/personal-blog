import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { 
  buildCloudinaryUrl, 
  buildBlurPlaceholder, 
  extractPublicIdFromUrl,
  CLOUDINARY_PRESETS,
  type CloudinaryOptions 
} from '../lib/cloudinary-utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number | 'auto';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  preset?: keyof typeof CLOUDINARY_PRESETS;
  cloudinaryOptions?: CloudinaryOptions;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  unoptimized?: boolean;
  style?: React.CSSProperties;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  quality = 'auto',
  placeholder = 'empty',
  blurDataURL,
  preset,
  cloudinaryOptions,
  loading = 'lazy',
  onLoad,
  onError,
  unoptimized = false,
  style
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Cloudinary URL optimizasyonu
  const optimizedSrc = useMemo(() => {
    if (!src) return src;
    
    // Eğer src zaten tam bir URL ise (http/https ile başlıyorsa), olduğu gibi kullan
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // Eğer Cloudinary public ID ise, optimize et
    if (src.includes('cloudinary.com') || (!src.startsWith('/') && !src.startsWith('data:'))) {
      const options: CloudinaryOptions = {
        ...cloudinaryOptions,
        ...(preset ? CLOUDINARY_PRESETS[preset] : {}),
        ...(width && { width }),
        ...(height && { height }),
        ...(quality && { quality })
      };
      
      return buildCloudinaryUrl(src, options);
    }
    
    return src;
  }, [src, width, height, quality, preset, cloudinaryOptions]);

  // Blur placeholder
  const optimizedBlurDataURL = useMemo(() => {
    if (blurDataURL) return blurDataURL;
    
    // Eğer placeholder blur ise ve Cloudinary URL'si varsa, blur placeholder oluştur
    if (placeholder === 'blur' && src && !src.startsWith('data:')) {
      return buildBlurPlaceholder(extractPublicIdFromUrl(src));
    }
    
    return undefined;
  }, [blurDataURL, placeholder, src]);

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
    <div className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
      )}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes || (fill ? '100vw' : undefined)}
        quality={typeof quality === 'number' ? quality : 85}
        priority={priority}
        loading={priority ? 'eager' : loading}
        placeholder={placeholder === 'blur' && optimizedBlurDataURL ? 'blur' : 'empty'}
        {...(placeholder === 'blur' && optimizedBlurDataURL ? { blurDataURL: optimizedBlurDataURL } : {})}
        className={`transition-all duration-500 ease-out object-cover ${
          isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        } ${fill ? 'w-full h-full' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized={unoptimized}
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

// Preset configurations for common use cases
export const HeroImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    sizes={props.sizes || "100vw"}
    priority={props.priority !== undefined ? props.priority : true}
    preset={props.preset || "hero"}
    quality={props.quality || "auto"}
    loading={props.loading || "eager"}
  />
);

export const CardImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    sizes={props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
    preset={props.preset || "card"}
    quality={props.quality || "auto"}
  />
);

export const ThumbnailImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    sizes={props.sizes || "(max-width: 768px) 50vw, 25vw"}
    preset={props.preset || "thumbnail"}
    quality={props.quality || "auto"}
  />
);

export const GalleryImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    preset={props.preset || "gallery"}
    quality={props.quality || "auto"}
  />
);