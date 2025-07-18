// Image migration utilities - HTML img etiketlerini Next.js Image bileşenine dönüştürme

export interface ImageMigrationOptions {
  // Varsayılan boyutlar
  defaultWidth?: number;
  defaultHeight?: number;
  // Varsayılan sizes attribute
  defaultSizes?: string;
  // Lazy loading varsayılan olarak açık mı?
  defaultLazy?: boolean;
  // Cloudinary preset
  defaultPreset?: 'hero' | 'card' | 'thumbnail' | 'gallery';
  // Placeholder türü
  defaultPlaceholder?: 'blur' | 'empty';
}

export interface ImageInfo {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: string;
  loading?: 'lazy' | 'eager';
  isCloudinary: boolean;
  publicId?: string;
}

/**
 * HTML img etiketinden bilgi çıkarır
 */
export function parseImageTag(imgTag: string): ImageInfo | null {
  try {
    // src attribute'unu çıkar
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
    if (!srcMatch) return null;
    
    const src = srcMatch[1];
    
    // alt attribute'unu çıkar
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
    const alt = altMatch ? altMatch[1] : '';
    
    // width ve height çıkar
    const widthMatch = imgTag.match(/width=["']?(\d+)["']?/);
    const heightMatch = imgTag.match(/height=["']?(\d+)["']?/);
    const width = widthMatch ? parseInt(widthMatch[1]) : undefined;
    const height = heightMatch ? parseInt(heightMatch[1]) : undefined;
    
    // class attribute'unu çıkar
    const classMatch = imgTag.match(/class=["']([^"']*)["']/);
    const className = classMatch ? classMatch[1] : undefined;
    
    // style attribute'unu çıkar
    const styleMatch = imgTag.match(/style=["']([^"']*)["']/);
    const style = styleMatch ? styleMatch[1] : undefined;
    
    // loading attribute'unu çıkar
    const loadingMatch = imgTag.match(/loading=["']([^"']*)["']/);
    const loading = loadingMatch ? (loadingMatch[1] as 'lazy' | 'eager') : undefined;
    
    // Cloudinary kontrolü
    const isCloudinary = src.includes('cloudinary.com') || src.includes('res.cloudinary.com');
    
    let publicId: string | undefined;
    if (isCloudinary) {
      publicId = extractPublicIdFromCloudinaryUrl(src);
    }
    
    return {
      src,
      alt,
      width,
      height,
      className,
      style,
      loading,
      isCloudinary,
      publicId
    };
  } catch (error) {
    console.error('Image tag parsing error:', error);
    return null;
  }
}

/**
 * Cloudinary URL'sinden public ID çıkarır
 */
function extractPublicIdFromCloudinaryUrl(url: string): string {
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return url;
    
    let publicIdParts = urlParts.slice(uploadIndex + 1);
    
    // Transformation parametrelerini atla
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

/**
 * ImageInfo'dan Next.js Image bileşeni JSX'i oluşturur
 */
export function generateNextImageJSX(
  imageInfo: ImageInfo, 
  options: ImageMigrationOptions = {}
): string {
  const {
    defaultWidth = 800,
    defaultHeight = 600,
    defaultSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    defaultLazy = true,
    defaultPreset = 'card',
    defaultPlaceholder = 'blur'
  } = options;

  const props: string[] = [];
  
  // src - Cloudinary ise public ID kullan
  if (imageInfo.isCloudinary && imageInfo.publicId) {
    props.push(`src="${imageInfo.publicId}"`);
  } else {
    props.push(`src="${imageInfo.src}"`);
  }
  
  // alt
  props.push(`alt="${imageInfo.alt || ''}"`);
  
  // width ve height
  const width = imageInfo.width || defaultWidth;
  const height = imageInfo.height || defaultHeight;
  props.push(`width={${width}}`);
  props.push(`height={${height}}`);
  
  // className
  if (imageInfo.className) {
    props.push(`className="${imageInfo.className}"`);
  }
  
  // sizes
  props.push(`sizes="${defaultSizes}"`);
  
  // loading
  const loading = imageInfo.loading || (defaultLazy ? 'lazy' : 'eager');
  if (loading === 'eager') {
    props.push(`priority={true}`);
  }
  
  // Cloudinary için özel props
  if (imageInfo.isCloudinary) {
    props.push(`preset="${defaultPreset}"`);
    props.push(`placeholder="${defaultPlaceholder}"`);
    props.push(`quality="auto"`);
  }
  
  // Bileşen adını belirle
  const componentName = imageInfo.isCloudinary ? 'CloudinaryImage' : 'Image';
  
  return `<${componentName}\n  ${props.join('\n  ')}\n/>`;
}

/**
 * Dosya içeriğindeki tüm img etiketlerini Next.js Image bileşenlerine dönüştürür
 */
export function migrateImagesInContent(
  content: string, 
  options: ImageMigrationOptions = {}
): { 
  migratedContent: string; 
  migrations: Array<{ original: string; migrated: string; isCloudinary: boolean }> 
} {
  const imgTagRegex = /<img[^>]*>/gi;
  const migrations: Array<{ original: string; migrated: string; isCloudinary: boolean }> = [];
  
  let migratedContent = content;
  let match;
  
  while ((match = imgTagRegex.exec(content)) !== null) {
    const imgTag = match[0];
    const imageInfo = parseImageTag(imgTag);
    
    if (imageInfo) {
      const migratedJSX = generateNextImageJSX(imageInfo, options);
      
      migrations.push({
        original: imgTag,
        migrated: migratedJSX,
        isCloudinary: imageInfo.isCloudinary
      });
      
      migratedContent = migratedContent.replace(imgTag, migratedJSX);
    }
  }
  
  return { migratedContent, migrations };
}

/**
 * Dosya için gerekli import'ları oluşturur
 */
export function generateImports(migrations: Array<{ isCloudinary: boolean }>): string[] {
  const imports: string[] = [];
  
  const hasRegularImages = migrations.some(m => !m.isCloudinary);
  const hasCloudinaryImages = migrations.some(m => m.isCloudinary);
  
  if (hasRegularImages) {
    imports.push("import Image from 'next/image';");
  }
  
  if (hasCloudinaryImages) {
    imports.push("import { CloudinaryImage } from '@/components/CloudinaryImage';");
  }
  
  return imports;
}

/**
 * Batch migration için utility
 */
export interface BatchMigrationResult {
  filePath: string;
  originalContent: string;
  migratedContent: string;
  migrations: Array<{ original: string; migrated: string; isCloudinary: boolean }>;
  requiredImports: string[];
  success: boolean;
  error?: string;
}

export function createMigrationReport(results: BatchMigrationResult[]): string {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalMigrations = successful.reduce((sum, r) => sum + r.migrations.length, 0);
  const cloudinaryMigrations = successful.reduce((sum, r) => 
    sum + r.migrations.filter(m => m.isCloudinary).length, 0
  );
  
  let report = `# Image Migration Report\n\n`;
  report += `## Summary\n`;
  report += `- Files processed: ${results.length}\n`;
  report += `- Successful migrations: ${successful.length}\n`;
  report += `- Failed migrations: ${failed.length}\n`;
  report += `- Total images migrated: ${totalMigrations}\n`;
  report += `- Cloudinary images: ${cloudinaryMigrations}\n`;
  report += `- Regular images: ${totalMigrations - cloudinaryMigrations}\n\n`;
  
  if (successful.length > 0) {
    report += `## Successful Migrations\n\n`;
    successful.forEach(result => {
      report += `### ${result.filePath}\n`;
      report += `- Images migrated: ${result.migrations.length}\n`;
      report += `- Required imports: ${result.requiredImports.join(', ')}\n\n`;
    });
  }
  
  if (failed.length > 0) {
    report += `## Failed Migrations\n\n`;
    failed.forEach(result => {
      report += `### ${result.filePath}\n`;
      report += `- Error: ${result.error}\n\n`;
    });
  }
  
  return report;
}