# Modern Portfolio & Blog Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-003450?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-003450?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Live-black?style=for-the-badge&logo=vercel)](https://www.fixral.com)

[![Security](https://img.shields.io/badge/Security-Hardened-003450?style=for-the-badge&logo=shield)](https://github.com/erdemerciyas/personal-blog/blob/main/SECURITY.md)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://github.com/erdemerciyas/personal-blog/blob/main/LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-075985?style=for-the-badge&logo=github-actions)](https://github.com/erdemerciyas/personal-blog/actions)
[![Code Quality](https://img.shields.io/badge/Code_Quality-Optimized-075985?style=for-the-badge&logo=codeclimate)](https://github.com/erdemerciyas/personal-blog)

Modern, güvenli ve performanslı kişisel blog ve portfolyo platformu. Next.js 14, TypeScript, MongoDB ve Tailwind CSS ile geliştirilmiştir.

## 🚀 Live Demo

**[Live Site](https://www.fixral.com)** | **[Admin Panel](https://www.fixral.com/admin)** | **[API Health](https://www.fixral.com/api/health)**

> **Status**: **LIVE** | **Last Deploy**: 2025-10-08 | **Version**: v2.5.3 | **CI/CD Pipeline**: **OPTIMIZED**

## ✨ Özellikler

### 🎨 Modern UI/UX
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Dark/Light Mode**: Otomatik tema desteği
- **Smooth Animations**: Framer Motion ile akıcı animasyonlar
- **Accessibility Ready**: WCAG 2.1 AA uyumlu

### 📊 Portfolio Yönetimi
- **Dynamic Portfolio**: Rastgele proje gösterimi
- **Advanced Filtering**: Kategori, teknoloji ve tarih filtreleri
- **Lightbox Gallery**: Tam ekran görsel galeri
- **SEO Optimized**: Slug-based URL yapısı

### 🛡️ Güvenlik Özellikleri
- **Rate Limiting**: API endpoint koruması
- **CSRF Protection**: Cross-site request forgery koruması
- **XSS Prevention**: HTML sanitization
- **Security Headers**: Kapsamlı güvenlik başlıkları
- **Input Validation**: Tüm girişlerde doğrulama

### ⚡ Performans Optimizasyonları
- **Server-Side Rendering**: Hızlı sayfa yükleme
- **Image Optimization**: Next.js Image component
- **Bundle Optimization**: Code splitting ve tree shaking
- **Client-Side Caching**: Akıllı API önbellekleme sistemi
- **Lazy Loading**: İhtiyaç anında yükleme

### 📹 Video Yönetimi
- **YouTube Integration**: Basit video ekleme
- **Otomatik Bilgi Alma**: Video metadata çekme
- **Toplu İşlemler**: Çoklu video yönetimi
- **Modern Admin Panel**: Kullanıcı dostu arayüz

### 📈 Monitoring & Analytics
- **Real-time Monitoring**: Sistem sağlığı izleme
- **Performance Metrics**: Detaylı performans metrikleri
- **Error Tracking**: Kapsamlı hata yakalama
- **Health Check API**: Sistem durumu endpoint'i

## 🛠️ Teknoloji Stack

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **Framer Motion**: Animasyonlar
- **Heroicons**: Modern ikonlar

### Backend
- **Next.js API Routes**: Serverless functions
- **MongoDB**: NoSQL veritabanı
- **Mongoose**: ODM
- **NextAuth.js**: Authentication
- **Cloudinary**: Medya yönetimi

### DevOps & Deployment
- **Vercel**: Hosting platform
- **GitHub Actions**: CI/CD
- **ESLint & Prettier**: Code quality
- **Husky**: Git hooks

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- MongoDB
- npm veya yarn

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/erdemerciyas/personal-blog.git
cd personal-blog
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Environment Variables
`.env.example` dosyasını `.env.local` olarak kopyalayın:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/personal-blog

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Admin User
ADMIN_EMAIL=your-email@example.com
ADMIN_NAME=Your Name
ADMIN_DEFAULT_PASSWORD=SecurePassword123!

# Mail Configuration
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js 14 App Router
│   ├── admin/             # Admin panel sayfaları
│   ├── api/               # API routes
│   ├── portfolio/         # Portfolyo sayfaları
│   └── ...
├── components/            # React bileşenleri
│   ├── common/           # Ortak bileşenler
│   ├── portfolio/        # Portfolyo bileşenleri
│   └── admin/            # Admin bileşenleri
├── lib/                  # Utility fonksiyonları
├── models/               # MongoDB modelleri
├── types/                # TypeScript tipleri
└── hooks/                # Custom React hooks
```

## 🔒 Güvenlik

### Security Level: **HIGH**

- **Rate Limiting**: API endpoint koruması
- **CSRF Protection**: Cross-site request forgery koruması
- **XSS Prevention**: HTML sanitization
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Input Validation**: Tüm girişlerde doğrulama
- **Authentication**: NextAuth.js ile güvenli kimlik doğrulama

## ⚡ Performans

### Bundle Sizes (Production)
- **Homepage**: 9.18 kB (159 kB First Load)
- **Portfolio**: 7.42 kB (164 kB First Load)
- **Shared JS**: 87.3 kB (optimized)
- **Performance Score**: 92% (Excellent)

## 🚀 Deployment

### Production Deployment (Vercel)

**Current Status**: **LIVE** on Vercel  
**Deployment URL**: https://www.fixral.com  
**Last Deploy**: 2025-01-27  
**Build Time**: ~57 seconds  

#### Quick Deploy
```bash
# Manuel deployment (önerilen)
npm run deploy

# Alternatif deployment
vercel --prod
```

## 📝 Scripts

### Development
```bash
npm run dev              # Development server
npm run build            # Production build
npm run start            # Production server
```

### Quality & Testing
```bash
npm run lint             # ESLint check
npm run lint:fix         # ESLint fix
npm run type-check       # TypeScript check
npm run test:config      # Configuration test
```

### Deployment
```bash
npm run deploy           # Deploy to production
npm run security:check   # Security audit
npm run perf:check       # Performance test
```

## 🆕 Son Güncellemeler (v2.5.1)

### Portfolio Sıralama Düzeltmeleri (2025-01-27)
- **Portfolio Sıralama**: En yeni projeler artık doğru şekilde en üstte görünüyor
- **API Optimizasyonu**: MongoDB aggregate ile güvenilir sıralama
- **Frontend Sıralama**: Sıralama mantığı düzeltildi
- **Cache Optimizasyonu**: Random projeler için cache devre dışı
- **Container Genişliği**: 64rem'den 74rem'e artırıldı

### Anasayfa Portfolio Dinamikleştirme
- **Random Portfolio**: Her sayfa yenilemesinde farklı projeler
- **Cache Temizliği**: Random projeler için cache kaldırıldı
- **Featured Filter**: Tüm projeler arasından rastgele seçim

### Hata Düzeltmeleri
- **Hydration Hatası**: Breadcrumb hydration sorunu çözüldü
- **Image Positioning**: Next.js Image fill prop hataları düzeltildi
- **Manifest Icon**: Bozuk icon dosyası SVG ile değiştirildi
- **Console Temizliği**: Debug logları kaldırıldı

### Kod Temizliği
- **Gereksiz Dosyalar**: Build artifacts ve geçici dosyalar temizlendi
- **TypeScript**: Tip güvenliği artırıldı
- **ESLint**: Kod kalitesi iyileştirildi

## 📚 Dokümantasyon

- [CHANGELOG.md](CHANGELOG.md) - Detaylı değişiklik geçmişi
- [CONTRIBUTING.md](CONTRIBUTING.md) - Katkıda bulunma rehberi
- [SECURITY.md](SECURITY.md) - Güvenlik politikaları
- [LICENSE](LICENSE) - MIT lisansı

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Erdem Erciyas**
- Website: [fixral.com](https://www.fixral.com)
- GitHub: [@erdemerciyas](https://github.com/erdemerciyas)
- Email: info@fixral.com

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!