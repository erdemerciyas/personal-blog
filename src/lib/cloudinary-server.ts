// Server-side only Cloudinary functions
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary konfigürasyonu
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload fonksiyonu (server-side only)
export const uploadImage = async (file: string, folder: string = 'portfolio'): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      // Otomatik format optimizasyonu
      format: 'auto',
      quality: 'auto:good',
      // Progressive JPEG
      progressive: true,
      // Metadata temizleme
      strip_profile: true,
      // Unique filename
      use_filename: true,
      unique_filename: true,
    });

    return result.secure_url;
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    throw new Error('Resim yüklenemedi');
  }
};

// Delete fonksiyonu (server-side only)
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Resim silme hatası:', error);
    throw new Error('Resim silinemedi');
  }
};

export { cloudinary };
export default cloudinary;