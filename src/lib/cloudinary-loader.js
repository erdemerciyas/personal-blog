// Custom loader for Cloudinary images
export default function cloudinaryLoader({ src, width, quality }) {
  // Eğer URL zaten Cloudinary URL'si ise, olduğu gibi döndür
  if (src.includes('res.cloudinary.com')) {
    return src;
  }
  
  // Diğer URL'ler için Next.js default loader'ını kullan
  const params = ['f_auto', 'c_limit'];
  
  if (width) {
    params.push(`w_${width}`);
  }
  
  if (quality) {
    params.push(`q_${quality || 'auto'}`);
  }
  
  const paramsString = params.join(',');
  return `${src}?${paramsString}`;
}