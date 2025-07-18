# Cloudinary Görsel Optimizasyon Rehberi

Bu rehber, Next.js projenizde Cloudinary görsellerini optimize etmek için gerekli adımları açıklar.

## 🚀 Hızlı Başlangıç

### 1. Migration Script'ini Çalıştırın

```bash
# Önce dry-run ile test edin
npm run migrate:images:dry-run

# Gerçek migration'ı çalıştırın
npm run migrate:images
```

### 2. Yeni Bileşenleri Kullanın

```tsx
// Eski yöntem
<img src="https://res.cloudinary.com/demo/image/upload/sample.jpg" alt="Örnek" />

// Yeni yöntem - CloudinaryImage
import { CloudinaryImage } from '@/components/CloudinaryImage';

<CloudinaryImage
  src="sample"
  alt="Örnek"
  width={800}
  height={600}
  preset="card"
  placeholder="blur"
  quality="auto"
/>
```

## 📦 Bileşenler

### CloudinaryImage

Ana Cloudinary optimizasyon bileşeni:

```tsx
<CloudinaryImage
  src="your-public-id"
  alt="Açıklama"
  width={800}
  height={600}
  preset="card"
  placeholder="blur"
  quality="auto:good"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Preset Bileşenleri

Kolay kullanım için önceden yapılandırılmış bileşenler:

```tsx
// Hero görselleri için
<CloudinaryHeroImage
  src="hero-image"
  alt="Hero görsel"
  fill
/>

// Kart görselleri için
<CloudinaryCardImage
  src="card-image"
  alt="Kart görseli"
  width={400}
  height={300}
/>

// Thumbnail'ler için
<CloudinaryThumbnailImage
  src="thumb-image"
  alt="Küçük görsel"
  width={150}
  height={150}
/>

// Galeri görselleri için
<CloudinaryGalleryImage
  src="gallery-image"
  alt="Galeri görseli"
  width={600}
  height={400}
/>
```

## ⚙️ Optimizasyon Seçenekleri

### Quality (Kalite)

```tsx
quality="auto"        // Otomatik kalite
quality="auto:good"   // İyi kalite
quality="auto:low"    // Düşük kalite
quality={85}          // Manuel kalite (1-100)
```

### Format (Format)

```tsx
format="auto"   // Otomatik format (WebP/AVIF)
format="webp"   // WebP formatı
format="avif"   // AVIF formatı
format="jpg"    // JPEG formatı
```

### Crop (Kırpma)

```tsx
crop="fill"   // Tam doldur
crop="fit"    // Sığdır
crop="scale"  // Ölçekle
crop="crop"   // Kırp
crop="thumb"  // Thumbnail
```

### Gravity (Odak Noktası)

```tsx
gravity="auto"    // Otomatik
gravity="face"    // Yüz odaklı
gravity="center"  // Merkez
gravity="north"   // Üst
gravity="south"   // Alt
```

## 🎯 Preset Konfigürasyonları

### Hero Preset
- Quality: auto:good
- Format: auto
- Crop: fill
- Gravity: auto
- DPR: auto

### Card Preset
- Quality: auto:good
- Format: auto
- Crop: fill
- Gravity: auto

### Thumbnail Preset
- Quality: auto:low
- Format: auto
- Crop: thumb
- Gravity: face

### Gallery Preset
- Quality: auto:good
- Format: auto
- Crop: fit
- Gravity: center

## 📱 Responsive Images

### Sizes Attribute

```tsx
// Mobil öncelikli
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

// Hero görselleri için
sizes="100vw"

// Kart görselleri için
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

// Thumbnail'ler için
sizes="(max-width: 768px) 50vw, 25vw"
```

### Fill Prop

```tsx
// Container'ı tamamen doldur
<CloudinaryImage
  src="image-id"
  alt="Açıklama"
  fill
  sizes="100vw"
  className="object-cover"
/>
```

## 🚀 Performance Optimizasyonları

### Lazy Loading

```tsx
// Varsayılan olarak lazy loading açık
<CloudinaryImage src="image" alt="..." />

// Eager loading (kritik görseller için)
<CloudinaryImage 
  src="image" 
  alt="..." 
  priority={true}
  loading="eager"
/>
```

### Blur Placeholder

```tsx
// Otomatik blur placeholder
<CloudinaryImage 
  src="image" 
  alt="..." 
  placeholder="blur"
/>

// Özel blur placeholder
<CloudinaryImage 
  src="image" 
  alt="..." 
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Preloading

```tsx
import { preloadImage, preloadImages } from '@/lib/cloudinary-optimizer';

// Tek görsel preload
await preloadImage('https://res.cloudinary.com/demo/image/upload/sample.jpg');

// Birden fazla görsel preload
await preloadImages([
  'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
  'https://res.cloudinary.com/demo/image/upload/sample2.jpg'
]);
```

## 🔧 Gelişmiş Kullanım

### Custom Transformations

```tsx
<CloudinaryImage
  src="image-id"
  alt="Açıklama"
  width={800}
  height={600}
  cloudinaryOptions={{
    quality: 'auto:good',
    format: 'webp',
    crop: 'fill',
    gravity: 'face',
    dpr: 'auto',
    flags: ['progressive']
  }}
/>
```

### Effects

```tsx
<CloudinaryImage
  src="image-id"
  alt="Açıklama"
  width={800}
  height={600}
  effects={['blur:300', 'brightness:50']}
/>
```

## 📊 Performance Monitoring

```tsx
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

<PerformanceMonitor>
  <CloudinaryImage src="image" alt="..." />
</PerformanceMonitor>
```

## 🛠️ Troubleshooting

### Yaygın Sorunlar

1. **Görsel yüklenmiyor**
   - Cloudinary cloud name'i kontrol edin
   - Public ID'nin doğru olduğundan emin olun

2. **Blur placeholder çalışmıyor**
   - `placeholder="blur"` prop'unu ekleyin
   - Public ID'nin geçerli olduğundan emin olun

3. **Responsive images çalışmıyor**
   - `sizes` prop'unu ekleyin
   - Next.js config'de domain'i whitelist'e ekleyin

### Debug

```tsx
// Debug modu
<CloudinaryImage
  src="image-id"
  alt="Açıklama"
  width={800}
  height={600}
  onLoad={() => console.log('Image loaded')}
  onError={() => console.log('Image failed to load')}
/>
```

## 📈 Best Practices

1. **Always use alt text** - Erişilebilirlik için
2. **Use appropriate sizes** - Bandwidth tasarrufu için
3. **Enable blur placeholder** - UX için
4. **Use priority for above-fold images** - LCP için
5. **Choose right preset** - Use case'e göre
6. **Monitor performance** - Core Web Vitals için

## 🔗 Faydalı Linkler

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)