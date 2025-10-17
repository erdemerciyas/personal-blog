/**
 * Advanced image optimization utilities
 * Provides image compression, format conversion, and responsive image generation
 */

import { logger } from './logger';

export interface ImageOptimizationOptions {
  quality?: number; // 1-100, default 80
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  progressive?: boolean;
  metadata?: boolean;
}

export interface ResponsiveImage {
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
  width: number;
  height: number;
}

export interface ImageMetadata {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  optimizedSize: number;
  compressionRatio: number;
}

class ImageOptimizer {
  private cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  private breakpoints = [320, 640, 1024, 1280, 1920];
  private formats = ['webp', 'avif'];

  /**
   * Generate Cloudinary optimization URL
   */
  generateOptimizedUrl(
    imageUrl: string,
    options?: ImageOptimizationOptions
  ): string {
    if (!imageUrl) {
      return '';
    }

    // If already a Cloudinary URL, enhance it
    if (imageUrl.includes('res.cloudinary.com')) {
      return this.enhanceCloudinaryUrl(imageUrl, options);
    }

    // For external images, use Cloudinary fetch
    return this.generateCloudinaryFetchUrl(imageUrl, options);
  }

  /**
   * Enhance existing Cloudinary URL
   */
  private enhanceCloudinaryUrl(
    url: string,
    options?: ImageOptimizationOptions
  ): string {
    const quality = options?.quality || 80;
    const format = options?.format || 'auto';
    const width = options?.width;
    const height = options?.height;
    const fit = options?.fit || 'cover';

    // eslint-disable-next-line prefer-const
    let transformations = [
      `q_${quality}`,
      `f_${format}`,
      `c_${fit}`,
    ];

    if (width) {
      transformations.push(`w_${width}`);
    }

    if (height) {
      transformations.push(`h_${height}`);
    }

    if (options?.progressive) {
      transformations.push('fl_progressive');
    }

    // Insert transformations into URL
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${transformations.join(',')},${parts[1]}`;
    }

    return url;
  }

  /**
   * Generate Cloudinary fetch URL for external images
   */
  private generateCloudinaryFetchUrl(
    imageUrl: string,
    options?: ImageOptimizationOptions
  ): string {
    if (!this.cloudinaryUrl) {
      logger.warn('Cloudinary not configured for image optimization', 'IMAGE_OPTIMIZER');
      return imageUrl;
    }

    const quality = options?.quality || 80;
    const format = options?.format || 'auto';
    const width = options?.width;
    const height = options?.height;
    const fit = options?.fit || 'cover';

    // eslint-disable-next-line prefer-const
    let transformations = [
      `q_${quality}`,
      `f_${format}`,
      `c_${fit}`,
    ];

    if (width) {
      transformations.push(`w_${width}`);
    }

    if (height) {
      transformations.push(`h_${height}`);
    }

    if (options?.progressive) {
      transformations.push('fl_progressive');
    }

    const encodedUrl = Buffer.from(imageUrl).toString('base64');
    return `https://res.cloudinary.com/${this.cloudinaryUrl}/image/fetch/${transformations.join(',')}/${encodedUrl}`;
  }

  /**
   * Generate responsive image srcSet
   */
  generateSrcSet(
    imageUrl: string,
    options?: ImageOptimizationOptions
  ): string {
    const srcSet = this.breakpoints
      .map(width => {
        const url = this.generateOptimizedUrl(imageUrl, {
          ...options,
          width,
        });
        return `${url} ${width}w`;
      })
      .join(', ');

    return srcSet;
  }

  /**
   * Generate sizes attribute
   */
  generateSizes(): string {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, (max-width: 1280px) 80vw, 1200px';
  }

  /**
   * Generate complete responsive image object
   */
  generateResponsiveImage(
    imageUrl: string,
    alt: string,
    options?: ImageOptimizationOptions & { width?: number; height?: number }
  ): ResponsiveImage {
    const width = options?.width || 1200;
    const height = options?.height || 800;

    return {
      src: this.generateOptimizedUrl(imageUrl, { ...options, width, height }),
      srcSet: this.generateSrcSet(imageUrl, options),
      sizes: this.generateSizes(),
      alt,
      width,
      height,
    };
  }

  /**
   * Get image metadata
   */
  async getImageMetadata(imageUrl: string): Promise<ImageMetadata | null> {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });

      if (!response.ok) {
        return null;
      }

      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');

      if (!contentLength || !contentType) {
        return null;
      }

      const size = parseInt(contentLength, 10);
      const format = contentType.split('/')[1] || 'unknown';

      // Estimate optimized size (rough calculation)
      const optimizedSize = Math.round(size * 0.6);
      const compressionRatio = ((size - optimizedSize) / size) * 100;

      return {
        url: imageUrl,
        width: 0,
        height: 0,
        format,
        size,
        optimizedSize,
        compressionRatio: Math.round(compressionRatio),
      };
    } catch (error) {
      logger.error('Failed to get image metadata', 'IMAGE_OPTIMIZER', undefined, error as Error);
      return null;
    }
  }

  /**
   * Generate picture element HTML
   */
  generatePictureElement(
    imageUrl: string,
    alt: string,
    options?: ImageOptimizationOptions
  ): string {
    const webpUrl = this.generateOptimizedUrl(imageUrl, { ...options, format: 'webp' });
    const avifUrl = this.generateOptimizedUrl(imageUrl, { ...options, format: 'avif' });
    const jpegUrl = this.generateOptimizedUrl(imageUrl, { ...options, format: 'jpeg' });

    const srcSet = this.generateSrcSet(imageUrl, options);
    const sizes = this.generateSizes();

    return `
      <picture>
        <source type="image/avif" srcset="${avifUrl}" sizes="${sizes}">
        <source type="image/webp" srcset="${webpUrl}" sizes="${sizes}">
        <source type="image/jpeg" srcset="${jpegUrl}" sizes="${sizes}">
        <img src="${jpegUrl}" alt="${alt}" loading="lazy" decoding="async">
      </picture>
    `;
  }

  /**
   * Estimate file size reduction
   */
  estimateSizeReduction(
    originalSize: number,
    quality: number = 80
  ): {
    estimatedSize: number;
    reduction: number;
    reductionPercent: number;
  } {
    // Rough estimation based on quality
    const qualityFactor = quality / 100;
    const estimatedSize = Math.round(originalSize * qualityFactor * 0.7);
    const reduction = originalSize - estimatedSize;
    const reductionPercent = (reduction / originalSize) * 100;

    return {
      estimatedSize,
      reduction,
      reductionPercent: Math.round(reductionPercent),
    };
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(imageUrl: string): string[] {
    const recommendations: string[] = [];

    if (!imageUrl) {
      recommendations.push('Image URL is missing');
      return recommendations;
    }

    if (!imageUrl.includes('res.cloudinary.com')) {
      recommendations.push('Consider using Cloudinary for image optimization');
    }

    if (!imageUrl.includes('f_auto')) {
      recommendations.push('Add automatic format selection (f_auto)');
    }

    if (!imageUrl.includes('q_')) {
      recommendations.push('Add quality parameter for better compression');
    }

    if (!imageUrl.includes('w_')) {
      recommendations.push('Add width parameter for responsive images');
    }

    if (!imageUrl.includes('fl_progressive')) {
      recommendations.push('Enable progressive loading for better UX');
    }

    return recommendations;
  }

  /**
   * Batch optimize images
   */
  batchOptimize(
    imageUrls: string[],
    options?: ImageOptimizationOptions
  ): Map<string, string> {
    const optimized = new Map<string, string>();

    imageUrls.forEach(url => {
      optimized.set(url, this.generateOptimizedUrl(url, options));
    });

    return optimized;
  }
}

export const imageOptimizer = new ImageOptimizer();

/**
 * Next.js Image component helper
 */
export function getImageProps(
  imageUrl: string,
  alt: string,
  width: number = 1200,
  height: number = 800
) {
  return {
    src: imageOptimizer.generateOptimizedUrl(imageUrl, { width, height }),
    alt,
    width,
    height,
    priority: false,
    loading: 'lazy' as const,
    quality: 80,
  };
}

/**
 * Generate srcSet for Next.js Image
 */
export function generateImageSrcSet(imageUrl: string) {
  return imageOptimizer.generateSrcSet(imageUrl);
}
