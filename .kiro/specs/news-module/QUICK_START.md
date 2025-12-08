# News Module - Quick Start Guide

## 🚀 5 Dakikada Başlayın

### 1. Environment Variables Ayarla

`.env.local` dosyasına ekle:

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI (AI Metadata Generation)
OPENAI_API_KEY=your_openai_key
```

### 2. Development Server Başlat

```bash
npm run dev
```

### 3. Admin Panel'e Erişim

```
http://localhost:3000/admin/news
```

### 4. İlk Haberi Oluştur

1. Admin panel'de "Create Article" butonuna tıkla
2. Başlık ve içerik gir (TR ve ES)
3. Resim yükle
4. "Generate with AI" butonuna tıkla (metadata otomatik oluşturulacak)
5. "Create Article" butonuna tıkla

### 5. Homepage'de Gör

```
http://localhost:3000
```

Carousel'de yeni haberin görünmesi gerekiyor.

---

## 📋 Temel İşlemler

### Haber Oluştur
```
/admin/news/create
```

### Haberleri Yönet
```
/admin/news
```

### Haberi Düzenle
```
/admin/news/[id]/edit
```

### Haberleri Görüntüle (Ziyaretçi)
```
/tr/haberler              # Turkish listing
/tr/haberler/[slug]       # Turkish detail
/es/noticias              # Spanish listing
/es/noticias/[slug]       # Spanish detail
```

---

## 🎨 Admin Panel Özellikleri

### NewsForm Component
- **Multilingual Input**: TR ve ES için ayrı alanlar
- **WYSIWYG Editor**: TipTap ile zengin metin editörü
- **Image Upload**: Cloudinary'ye doğrudan yükleme
- **AI Generation**: Metadata otomatik oluşturma
- **SEO Panel**: Meta description, keywords
- **Status**: Draft/Published seçimi
- **Tags**: Etiket ekleme
- **Relationships**: Portfolio ile ilişkilendirme

### NewsList Component
- **Search**: Haber başlığında arama
- **Filters**: Status ve tarih filtreleri
- **Pagination**: Sayfalama
- **Bulk Actions**: Toplu yayınla/sil
- **Quick Edit**: Hızlı düzenleme

---

## 🔧 API Endpoints

### News CRUD
```
GET    /api/news                    # List news
POST   /api/news                    # Create news
GET    /api/news/:id                # Get by ID
PUT    /api/news/:id                # Update
DELETE /api/news/:id                # Delete
GET    /api/news/slug/:slug         # Get by slug
```

### Bulk Operations
```
POST   /api/news/bulk-action        # Publish/unpublish/delete
```

### AI & Upload
```
POST   /api/ai/generate-metadata    # Generate metadata
POST   /api/admin/upload            # Upload image to Cloudinary
```

---

## 🎯 Sık Kullanılan Görevler

### Haber Yayınla
1. Admin panel'de haberi aç
2. Status'u "Published" yap
3. Kaydet

### Haberi Sil
1. Admin panel'de haberi seç
2. "Delete" butonuna tıkla
3. Onayla

### Toplu İşlem
1. Admin panel'de birden fazla haberi seç
2. Bulk action seç (publish/unpublish/delete)
3. "Apply" butonuna tıkla

### AI ile Metadata Oluştur
1. İçerik gir
2. "Generate with AI" butonuna tıkla
3. Öneriler otomatik doldurulacak
4. Gerekirse düzenle ve kaydet

---

## 📱 Frontend Özellikleri

### Homepage Carousel
- Responsive (1 mobile, 3 desktop)
- Autoplay
- Touch/swipe navigation
- Lazy loading

### Detail Page
- SEO optimized
- JSON-LD schema
- Open Graph tags
- Related news
- Related portfolio
- Social sharing

### Listing Page
- Search
- Filters
- Pagination
- Tag-based filtering

---

## 🔍 Troubleshooting

### Resim Yüklenmiyor
- Cloudinary credentials kontrol et
- API key ve secret doğru mu?

### AI Metadata Oluşturulmuyor
- OpenAI API key kontrol et
- API key geçerli mi?
- Rate limit aşıldı mı?

### Haber Görünmüyor
- Status "Published" mi?
- Tarih doğru mu?
- Cache temizle (Ctrl+Shift+Delete)

### Admin'e Erişemiyor
- Giriş yaptın mı?
- Session geçerli mi?
- Cookies etkin mi?

---

## 📚 Daha Fazla Bilgi

- **Requirements**: `.kiro/specs/news-module/requirements.md`
- **Design**: `.kiro/specs/news-module/design.md`
- **Tasks**: `.kiro/specs/news-module/tasks.md`
- **Implementation Summary**: `.kiro/specs/news-module/IMPLEMENTATION_SUMMARY.md`

---

## 💡 İpuçları

1. **AI Metadata**: İyi sonuç için en az 100 karakter içerik gir
2. **Resim**: Cloudinary otomatik optimize eder, endişelenme
3. **SEO**: JSON-LD otomatik oluşturulur, manuel düzenleme gerekli değil
4. **Cache**: Homepage carousel 60 saniye cache'lenir
5. **Dil**: Her dil için ayrı URL, SEO için iyi

---

## 🎓 Öğrenme Kaynakları

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [TipTap Editor Documentation](https://tiptap.dev)

---

**Başarılar! 🚀**
