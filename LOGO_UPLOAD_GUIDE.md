# 🎨 Logo Yükleme ve Marka Yönetimi Sistemi

Dashboard'daki "Marka ve Logo Yönetimi" paneli **Ayarlar** sekmesine taşındı ve kapsamlı dosya upload özelliği eklendi! Artık logoları kolayca yükleyebilir ve marka kimliğinizi profesyonelce yönetebilirsiniz.

## 🌟 Yeni Özellikler

✅ **Dosya Upload Sistemi** - Gerçek dosya yükleme desteği  
✅ **Drag & Drop Arayüz** - Modern upload UI/UX  
✅ **Canlı Önizleme** - Yükleme öncesi dosya önizleme  
✅ **Kapsamlı Format Desteği** - PNG, JPG, WebP, SVG  
✅ **Dosya Boyut Kontrolü** - 5MB maksimum limit  
✅ **Güvenlik Doğrulaması** - Dosya türü ve boyut kontrolü  
✅ **Manuel URL Seçeneği** - URL ile logo ekleme alternatifi  

## 📍 Yeni Konum

**Eskiden**: Dashboard → "Marka ve Logo Yönetimi" paneli  
**Şimdi**: Dashboard → **Ayarlar** → **"Marka ve Logo"** sekmesi

## 🚀 Nasıl Kullanılır?

### 1. Ayarlar Sayfasına Erişim
```
Dashboard → Ayarlar butonu → "Marka ve Logo" sekmesi
```

### 2. Logo Yükleme (2 Yöntem)

#### Yöntem A: Dosya Upload
1. **"Yeni Logo Yükle"** bölümündeki **upload alanına tıklayın**
2. Dosya seçici açılacak, logoyu seçin
3. **Önizleme** otomatik görünecek
4. **"Logo Yükle"** butonuna tıklayın
5. Yükleme başarılı olunca logoUrl otomatik güncellenecek

#### Yöntem B: Manuel URL
1. **"Logo URL (manuel)"** alanına direkt URL girin
2. Marka önizlemede değişiklik göreceksiniz
3. **"Marka Bilgilerini Kaydet"** butonuna tıklayın

### 3. Marka Bilgileri
- **Site Adı**: Sitenizin ana adı
- **Slogan**: Çok satırlı textarea ile slogan
- **Logo**: Upload veya URL ile
- **Canlı Önizleme**: Değişiklikleri anında görün

## 🛠️ Teknik Detaylar

### Dosya Upload API
```typescript
POST /api/admin/logo-upload
Content-Type: multipart/form-data

FormData:
- logo: File (image file)

Response:
{
  "message": "Logo başarıyla yüklendi",
  "logoUrl": "/uploads/logos/logo-1699123456789.png",
  "fileName": "logo-1699123456789.png",
  "fileSize": 45231,
  "fileType": "image/png"
}
```

### Dosya Depolama
```
public/uploads/logos/
├── logo-1699123456789.png
├── logo-1699234567890.jpg
└── logo-1699345678901.webp
```

### Güvenlik Kontrolları
- **Dosya Türü**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/svg+xml`
- **Dosya Boyutu**: Maximum 5MB
- **Auth Kontrolü**: Admin yetkisi gerekli
- **Dosya Adı**: Güvenli timestamp ile isimlendirilir

## 🎯 UI/UX Özellikleri

### Upload Arayüzü
```jsx
// Modern Drag & Drop Upload Box
<div className="border-dashed border-white/20 hover:border-white/30">
  <CloudArrowUpIcon className="w-12 h-12" />
  <p>Dosya seçmek için tıklayın</p>
  <p>PNG, JPG, WebP, SVG • Max 5MB</p>
</div>
```

### Dosya Önizleme
- **Dosya Bilgileri**: Ad, boyut, tip
- **Görsel Önizleme**: Küçültülmüş logo preview
- **Silme Butonu**: X işareti ile iptal etme
- **Upload Butonu**: Gradient tasarım + loading state

### Marka Önizleme Kutusu
```jsx
<div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
  {logoUrl && <img src={logoUrl} className="w-12 h-12" />}
  <h6>{siteName || 'Site Adınız'}</h6>
  <p>{slogan || 'Site sloganınız'}</p>
</div>
```

## 📋 Logo Rehberi

### Önerilen Boyutlar
- **Optimal**: 200x60 piksel
- **Maksimum**: 400x120 piksel
- **Aspect Ratio**: 3:1 veya 4:1
- **Format**: PNG (şeffaf arka plan)

### Dosya Gereksinimleri
| Format | Desteklenen | Önerilen | Maks Boyut |
|--------|-------------|----------|------------|
| PNG    | ✅ | ⭐ | 5MB |
| JPG    | ✅ | ✅ | 5MB |
| WebP   | ✅ | ✅ | 5MB |
| SVG    | ✅ | ⭐ | 5MB |

### Tasarım İpuçları
- **Şeffaf arka plan** kullanın (PNG)
- **Yüksek çözünürlük** seçin (2x için 400x120)
- **Minimal tasarım** tercih edin
- **Koyu/açık temada** test edin

## 🔧 API Entegrasyonu

### Site Settings Güncelleme
```javascript
PUT /api/admin/site-settings
{
  "siteName": "Yeni Site Adı",
  "slogan": "Yeni slogan",
  "logo": {
    "url": "/uploads/logos/logo-timestamp.png",
    "alt": "Site Logo",
    "width": 200,
    "height": 60
  }
}
```

### Frontend State Management
```javascript
const [logoFile, setLogoFile] = useState<File | null>(null);
const [logoPreview, setLogoPreview] = useState<string>('');
const [uploadingLogo, setUploadingLogo] = useState(false);

// File selection
const handleLogoFileChange = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    setLogoFile(file);
    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result);
    reader.readAsDataURL(file);
  }
};

// Upload process
const handleLogoUpload = async () => {
  const formData = new FormData();
  formData.append('logo', logoFile);
  
  const response = await fetch('/api/admin/logo-upload', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  // Update logo URL in form data
};
```

## 🎨 Visual Design

### Color Scheme
- **Upload Area**: `bg-white/5 border-white/20`
- **Upload Button**: `from-teal-600 to-blue-600`
- **Preview Box**: `from-indigo-500/10 to-purple-500/10`
- **Instructions**: `bg-blue-500/10 border-blue-500/20`

### Icons Used
- **CloudArrowUpIcon**: Upload trigger
- **PhotoIcon**: Logo/image representation
- **XMarkIcon**: Remove/cancel actions
- **CheckIcon**: Success/save actions
- **BuildingStorefrontIcon**: Brand/business identity

## 🔍 Troubleshooting

### Yaygın Sorunlar

**Q: Logo yüklenmiyor**
```
✅ Dosya boyutu 5MB'dan küçük olduğunu kontrol edin
✅ Desteklenen format (PNG/JPG/WebP/SVG) kullandığınızı doğrulayın
✅ İnternet bağlantınızı kontrol edin
✅ Browser console'da hata mesajlarına bakın
```

**Q: Logo önizleme görünmüyor**
```
✅ Logo URL'inin erişilebilir olduğunu kontrol edin
✅ CORS ayarlarını kontrol edin
✅ Dosya path'inin doğru olduğundan emin olun
✅ Browser cache'i temizleyin
```

**Q: Değişiklikler kaydedilmiyor**
```
✅ Admin yetkisine sahip olduğunuzu kontrol edin
✅ Tüm alanları doldurun
✅ Network errors için browser console'u kontrol edin
✅ Server logs'u kontrol edin
```

### Debug Commands

```bash
# Development server
npm run dev

# Build test
npm run build

# Upload klasörü kontrol
ls -la public/uploads/logos/

# Log monitoring
tail -f .next/server.log

# API test
curl -X POST http://localhost:3000/api/admin/logo-upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "logo=@/path/to/logo.png"
```

## 🚀 Gelecek Özellikler

### Planlanan İyileştirmeler
- [ ] **Image Cropping**: Yükleme sırasında logo kırpma
- [ ] **Multiple Variants**: Dark/light mode logoları
- [ ] **Batch Upload**: Birden fazla logo yükleme
- [ ] **CDN Integration**: AWS S3/CloudFlare entegrasyonu
- [ ] **Auto Optimization**: Otomatik boyutlandırma ve sıkıştırma
- [ ] **Version History**: Logo değişiklik geçmişi

### UI Geliştirmeleri
- [ ] **Advanced Preview**: 3D logo önizleme
- [ ] **Template Gallery**: Hazır logo şablonları
- [ ] **AI Generator**: AI destekli logo oluşturma
- [ ] **Real-time Sync**: Değişiklikleri canlı site'de görme

---

✅ **Artık logoları kolayca yükleyip marka kimliğinizi profesyonelce yönetebilirsiniz!** 🎨

**Settings → Marka ve Logo** sekmesini ziyaret ederek yeni sistemin keyfini çıkarın! 