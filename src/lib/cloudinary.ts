import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add validation
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  logger.error('Cloudinary configuration missing in lib', 'ERROR', {
    cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
    api_key: !!process.env.CLOUDINARY_API_KEY,
    api_secret: !!process.env.CLOUDINARY_API_SECRET,
  });
}

export const uploadImage = async (file: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'portfolio'
    });

    return result.secure_url;
  } catch (error) {
    // Image upload error
    logger.error('Cloudinary image upload failed in lib', 'ERROR', { error });
    throw new Error('Resim yüklenemedi');
  }
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Image delete error
    logger.error('Cloudinary image delete failed in lib', 'ERROR', { error });
    throw new Error('Resim silinemedi');
  }
};

// 3D Model upload fonksiyonu
export const upload3DModel = async (file: string, fileName: string): Promise<{ url: string; publicId: string; size: number }> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'fixral_3d_models',
      resource_type: 'raw',
      public_id: fileName,
      use_filename: true,
      unique_filename: false,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
    };
  } catch (error) {
    logger.error('Cloudinary 3D model upload failed in lib', 'ERROR', { error });
    throw new Error('3D model yüklenemedi');
  }
};

// 3D Model silme fonksiyonu
export const delete3DModel = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    logger.error('Cloudinary 3D model delete failed in lib', 'ERROR', { error });
    throw new Error('3D model silinemedi');
  }
};

// 3D Model listesi alma fonksiyonu
export const list3DModels = async (): Promise<any[]> => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'fixral_3d_models/',
      resource_type: 'raw',
      max_results: 100,
    });

    return result.resources;
  } catch (error) {
    logger.error('Cloudinary 3D models list failed in lib', 'ERROR', { error });
    throw new Error('3D model listesi alınamadı');
  }
};