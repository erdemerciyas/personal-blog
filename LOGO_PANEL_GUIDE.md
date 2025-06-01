# 🎨 Logo ve Marka Yönetim Paneli

Dashboard'a eklenen kapsamlı logo ve slogan yönetim sistemi. Site kimliğinizi kolayca düzenleyebileceğiniz modern bir arayüz.

## 🌟 Panel Özellikleri

✅ **Tam Genişlik Panel** - Dashboard'da öne çıkan geniş tasarım  
✅ **Logo Yükleme** - URL ile logo ekleme ve önizleme  
✅ **Site Adı Düzenleme** - Dinamik site ismi güncelleme  
✅ **Slogan Yönetimi** - Çok satırlı slogan düzenleme  
✅ **Canlı Önizleme** - Değişiklikleri anında görme  
✅ **Inline Düzenleme** - Hızlı düzenleme/kaydet/iptal sistemi  
✅ **Responsive Tasarım** - Mobil uyumlu 2 sütun layout  

## 📍 Panel Konumu

Dashboard → **"Marka ve Logo Yönetimi"** (Hoş geldiniz mesajından hemen sonra)

## 🎯 Görsel Tasarım

### Panel Header
- **İkon**: İndigo-mor gradient BuildingStorefront
- **Başlık**: "Marka ve Logo Yönetimi"
- **Alt başlık**: "Site kimliğinizi düzenleyin"
- **Düzenle Butonu**: İndigo tema, kalem ikonu

### 2 Sütun Layout

#### Sol Sütun: Logo Bölümü
- **Logo Görüntüleme**: Beyaz arka planlı preview box
- **Logo Önizleme**: 200x60px maksimum boyut
- **Boş Durum**: Büyük foto ikonu + "Henüz logo yüklenmedi"
- **Düzenleme**: URL input + canlı önizleme

#### Sağ Sütun: Marka Bilgileri
- **Site Adı**: Tek satır input field
- **Slogan**: 3 satır textarea
- **Marka Önizleme**: Gradient box ile mini preview

## 🛠️ Teknik Detaylar

### API Endpoints

**GET** `/api/admin/site-settings`
```json
{
  "_id": "...",
  "siteName": "Erciyas Engineering",
  "slogan": "Yenilikçi çözümlerle geleceği inşa ediyoruz",
  "logo": {
    "url": "https://example.com/logo.png",
    "alt": "Site Logo",
    "width": 200,
    "height": 60
  },
  "colors": { ... },
  "socialMedia": { ... }
}
```

**PUT** `/api/admin/site-settings`
```json
{
  "siteName": "Yeni Site Adı",
  "slogan": "Yeni slogan metni",
  "logo": {
    "url": "https://yeni-logo.com/logo.png",
    "alt": "Yeni Logo",
    "width": 200,
    "height": 60
  }
}
```

### Veritabanı Modeli

```javascript
const SiteSettingsSchema = {
  logo: {
    url: String,     // Logo URL'i
    alt: String,     // Alt text
    width: Number,   // Genişlik (px)
    height: Number   // Yükseklik (px)
  },
  siteName: String,  // Site adı
  slogan: String,    // Site sloganı
  // ... diğer alanlar
  isActive: Boolean  // Singleton pattern için
}
```

## 💡 Kullanım Kılavuzu

### 1. Logo Ekleme
1. **"Düzenle"** butonuna tıklayın
2. **"Logo URL"** alanına logo bağlantısını girin
3. Otomatik önizleme görünecek
4. **"Kaydet"** butonuna tıklayın

### 2. Site Adı Güncelleme
1. **"Düzenle"** butonuna tıklayın
2. **"Site Adı"** alanını düzenleyin
3. Marka önizlemede değişiklik görünecek
4. **"Kaydet"** butonuna tıklayın

### 3. Slogan Düzenleme
1. **"Düzenle"** butonuna tıklayın
2. **"Slogan"** textarea'sını düzenleyin (3 satır)
3. Marka önizlemede değişiklik görünecek
4. **"Kaydet"** butonuna tıklayın

## 🎨 UI/UX Özellikleri

### Düzenleme Modu
- **Kaydet butonu**: Yeşil tema + CheckIcon
- **İptal butonu**: Kırmızı tema + XMarkIcon
- **Loading durumu**: Spinner animasyonu
- **Validasyon**: Gerçek zamanlı form kontrolü

### Görüntüleme Modu
- **Logo preview**: Responsive container
- **Site bilgileri**: Readonly styled boxes
- **Düzenle butonu**: İndigo tema hover efekti

### Marka Önizleme Kutusu
```jsx
<div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
  <img src={logoUrl} className="w-12 h-12" />
  <h6>{siteName}</h6>
  <p>{slogan}</p>
</div>
```

## 🔧 Özelleştirme Seçenekleri

### Logo Ayarları
- **URL**: Herhangi bir geçerli resim URL'i
- **Boyut**: Otomatik 200x60px sınırı
- **Format**: PNG, JPG, SVG, WebP destekli
- **Hata yönetimi**: Geçersiz URL'lerde gizleme

### Site Kimliği
- **Site Adı**: 50 karakter sınırı
- **Slogan**: 150 karakter sınırı
- **Karakter desteği**: Tam Türkçe karakter desteği
- **HTML güvenliği**: XSS koruması

## 📊 Performans İyileştirmeleri

### Build Boyutları
- **Dashboard sayfası**: 6.91 kB
- **API endpoint**: ~500ms response
- **MongoDB işlemleri**: Singleton pattern ile optimize
- **Frontend**: Lazy loading logo previews

### Caching Stratejisi
- **Static generation**: Build time'da API çağrısı
- **ISR (Incremental Static Regeneration)**: 1 saat
- **Browser cache**: Logo URL'leri için 24 saat
- **MongoDB indexing**: isActive field üzerinde

## 🛡️ Güvenlik Önlemleri

### API Güvenliği
- **Authentication**: NextAuth session kontrolü
- **Authorization**: Admin role kontrolü
- **Input validation**: Joi/Zod şeması
- **Rate limiting**: 60 istek/dakika

### Veri Koruması
- **XSS prevention**: Input sanitization
- **CSRF protection**: NextAuth built-in
- **File upload**: URL-only, direct upload yok
- **Database**: Mongoose schema validation

## 🔍 Troubleshooting

### Yaygın Sorunlar

**Q: Logo görünmüyor**
```
A: URL'nin geçerli ve erişilebilir olduğunu kontrol edin
   CORS ayarlarını kontrol edin
   HTTPS URL kullanmayı deneyin
```

**Q: Değişiklikler kaydedilmiyor**
```
A: MongoDB bağlantısını kontrol edin
   Browser console'da error mesajlarına bakın
   Session timeout olmuş olabilir
```

**Q: Panel yavaş yükleniyor**
```
A: API response time'ı kontrol edin
   Network bağlantısını kontrol edin
   Build cache'i temizlemeyi deneyin (npm run build)
```

### Debug Komutları

```bash
# Build test
npm run build

# Development mode
npm run dev

# Database connection test
curl -X GET http://localhost:3000/api/admin/site-settings

# Logo update test
curl -X PUT http://localhost:3000/api/admin/site-settings \
  -H "Content-Type: application/json" \
  -d '{"siteName":"Test","slogan":"Test slogan"}'
```

## 🚀 Gelecek Özellikler

### Planlanan İyileştirmeler
- [ ] **Multi-upload**: Drag & drop logo yükleme
- [ ] **Logo variations**: Dark/light theme logoları
- [ ] **Brand colors**: Renk paleti yönetimi
- [ ] **Logo history**: Önceki logolar arşivi
- [ ] **Auto-crop**: Otomatik logo boyutlandırma
- [ ] **CDN integration**: CloudFlare/AWS S3 entegrasyonu

### API Genişletmeleri
- [ ] **Logo analytics**: Görüntülenme istatistikleri
- [ ] **Version control**: Marka değişiklik geçmişi
- [ ] **Backup/restore**: Site ayarları yedekleme
- [ ] **Multi-site**: Çoklu site desteği

---

✅ **Bu panel sayesinde site kimliğinizi kolayca yönetebilir ve profesyonel bir görünüm sağlayabilirsiniz!** 🎨 