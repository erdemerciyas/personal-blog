// Cloudinary URL optimizasyon utilities

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto' | 'auto:good' | 'auto:low';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  fetchFormat?: 'auto';
  dpr?: number | 'auto';
  flags?: string[];
}

export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryOptions = {}
): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    fetchFormat = 'auto',
    dpr = 'auto',
    flags = []
  } = options;

  try {
    // Eğer publicId zaten tam bir URL ise, olduğu gibi döndür
    if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
      return publicId;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dlgnbhq8l';
    let url = `https://res.cloudinary.com/${cloudName}/image/upload/`;

    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (gravity) transformations.push(`g_${gravity}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    if (fetchFormat) transformations.push(`fl_${fetchFormat}`);
    if (dpr) transformations.push(`dpr_${dpr}`);
    if (flags.length > 0) transformations.push(`fl_${flags.join(',')}`);

    if (transformations.length > 0) {
      url += transformations.join(',') + '/';
    }

    // PublicId'yi temizle ve ekle
    const cleanPublicId = publicId.replace(/^\/+/, ''); // Başındaki slash'leri kaldır
    url += cleanPublicId;

    return url;
  } catch (error) {
    console.error('Cloudinary URL build error:', error);
    return publicId;
  }
}

export function buildResponsiveCloudinaryUrls(
  publicId: string,
  baseSizes: number[] = [640, 768, 1024, 1280, 1536, 1920]
): { src: string; width: number }[] {
  return baseSizes.map(width => ({
    src: buildCloudinaryUrl(publicId, { 
      width, 
      quality: 'auto',
      format: 'auto',
      crop: 'fill',
      gravity: 'auto'
    }),
    width
  }));
}

export function buildBlurPlaceholder(publicId: string): string {
  try {
    // Eğer publicId varsa, Cloudinary'den küçük blur versiyonu oluştur
    if (publicId && !publicId.startsWith('data:')) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dlgnbhq8l';
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_10,h_10,q_auto:low,f_auto,fl_blur:1000/${publicId}`;
    }
    
    // Fallback: Simple base64 encoded SVG blur placeholder
    const blurDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmMWY1Zjk7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZTJlOGYwO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNjYmQ1ZTE7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGZpbHRlciBpZD0iYmx1ciI+CiAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiBmaWx0ZXI9InVybCgjYmx1cikiLz4KPC9zdmc+';
    
    return blurDataUrl;
  } catch (error) {
    console.error('Blur placeholder generation error:', error);
    // Fallback to a simple 1x1 transparent pixel
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
}

export function extractPublicIdFromUrl(url: string): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return url;
    
    let publicIdParts = urlParts.slice(uploadIndex + 1);
    
    // Transformation parametrelerini atla (virgül içeren kısımlar)
    while (publicIdParts.length > 0 && publicIdParts[0].includes(',')) {
      publicIdParts = publicIdParts.slice(1);
    }
    
    // Version'ı koruyalım
    let versionPart = '';
    if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
      versionPart = publicIdParts[0] + '/';
      publicIdParts = publicIdParts.slice(1);
    }
    
    const publicId = versionPart + publicIdParts.join('/').replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Public ID extraction error:', error);
    return url;
  }
}

export const CLOUDINARY_PRESETS = {
  hero: {
    quality: 'auto:good' as const,
    format: 'auto' as const,
    crop: 'fill' as const,
    gravity: 'auto' as const,
    fetchFormat: 'auto' as const,
    dpr: 'auto' as const
  },
  card: {
    quality: 'auto:good' as const,
    format: 'auto' as const,
    crop: 'fill' as const,
    gravity: 'auto' as const,
    fetchFormat: 'auto' as const
  },
  thumbnail: {
    quality: 'auto:low' as const,
    format: 'auto' as const,
    crop: 'thumb' as const,
    gravity: 'face' as const,
    fetchFormat: 'auto' as const
  },
  gallery: {
    quality: 'auto:good' as const,
    format: 'auto' as const,
    crop: 'fit' as const,
    gravity: 'center' as const,
    fetchFormat: 'auto' as const
  }
} as const;