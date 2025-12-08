import { logger } from './logger';

/**
 * Image validation constants
 */
export const IMAGE_VALIDATION = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  MAGIC_NUMBERS: {
    jpeg: [0xff, 0xd8, 0xff],
    png: [0x89, 0x50, 0x4e, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46],
  },
};

/**
 * Validate image file
 */
export async function validateImageFile(
  file: File | Buffer,
  options?: {
    maxSize?: number;
    allowedFormats?: string[];
  }
): Promise<{ valid: boolean; error?: string }> {
  const maxSize = options?.maxSize || IMAGE_VALIDATION.MAX_FILE_SIZE;
  const allowedFormats = options?.allowedFormats || IMAGE_VALIDATION.ALLOWED_FORMATS;

  try {
    // Check file size
    const fileSize = file instanceof File ? file.size : file.length;
    if (fileSize > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`,
      };
    }

    // Check MIME type
    const mimeType = file instanceof File ? file.type : 'application/octet-stream';
    if (!allowedFormats.includes(mimeType)) {
      return {
        valid: false,
        error: `File format not allowed. Allowed formats: ${allowedFormats.join(', ')}`,
      };
    }

    // Check magic numbers (file signature)
    const buffer = file instanceof File ? await file.arrayBuffer() : file;
    const bytes = new Uint8Array(buffer).slice(0, 4);

    const isValidMagic = validateMagicNumbers(bytes, mimeType);
    if (!isValidMagic) {
      return {
        valid: false,
        error: 'File signature does not match the declared format',
      };
    }

    return { valid: true };
  } catch (error) {
    logger.error('Image validation error', 'IMAGE_VALIDATION', { error });
    return {
      valid: false,
      error: 'Failed to validate image file',
    };
  }
}

/**
 * Validate magic numbers (file signatures)
 */
function validateMagicNumbers(bytes: Uint8Array, mimeType: string): boolean {
  switch (mimeType) {
    case 'image/jpeg':
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

    case 'image/png':
      return (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
      );

    case 'image/webp':
      return (
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46
      );

    default:
      return false;
  }
}

/**
 * Generate alt text from filename
 */
export function generateAltText(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize words
    .trim();
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores
    .replace(/^\.+/, '') // Remove leading dots
    .slice(0, 255); // Limit length
}

/**
 * Get image dimensions from buffer
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number } | null> {
  try {
    // Simple dimension extraction for common formats
    const bytes = new Uint8Array(buffer);

    // Check for JPEG
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      return extractJpegDimensions(bytes);
    }

    // Check for PNG
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return extractPngDimensions(bytes);
    }

    // Check for WebP
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46
    ) {
      return extractWebpDimensions(bytes);
    }

    return null;
  } catch (error) {
    logger.error('Error extracting image dimensions', 'IMAGE_VALIDATION', { error });
    return null;
  }
}

/**
 * Extract JPEG dimensions
 */
function extractJpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  let offset = 2;

  while (offset < bytes.length) {
    if (bytes[offset] === 0xff) {
      const marker = bytes[offset + 1];

      // SOF markers (Start of Frame)
      if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
        const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
        const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
        return { width, height };
      }

      // Skip to next marker
      const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
      offset += length + 2;
    } else {
      offset++;
    }
  }

  return null;
}

/**
 * Extract PNG dimensions
 */
function extractPngDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) return null;

  const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
  const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];

  return { width, height };
}

/**
 * Extract WebP dimensions
 */
function extractWebpDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 30) return null;

  // WebP dimensions are stored at offset 26-29
  const width = ((bytes[27] << 8) | bytes[26]) + 1;
  const height = ((bytes[29] << 8) | bytes[28]) + 1;

  return { width, height };
}
