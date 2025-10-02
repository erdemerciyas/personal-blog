# Modern Portfolio & Blog Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-003450?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-003450?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[![Security](https://img.shields.io/badge/Security-Hardened-003450?style=for-the-badge&logo=shield)](https://github.com/erdemerciyas/personal-blog/blob/main/SECURITY.md)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://github.com/erdemerciyas/personal-blog/blob/main/LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-075985?style=for-the-badge&logo=github-actions)](https://github.com/erdemerciyas/personal-blog/actions)

Modern, güvenli ve performanslı kişisel blog ve portfolyo platformu. Next.js 14, TypeScript, MongoDB ve Tailwind CSS ile geliştirilmiştir.

**Version:** 2.6.0 | **Last Updated:** 2 Ekim 2025 | **Status:** Production Ready 🚀

## 🌟 Öne Çıkan Özellikler

### Modern Admin UI/UX (v3.0.0 - NEW!)
- **Yeni Design System**: Tutarlı ve modern tasarım dili
  - 18+ production-ready UI component
  - Tam dark mode desteği
  - WCAG 2.1 AA erişilebilirlik standardı
  - Responsive design (mobil, tablet, desktop)
- **Component Library**: Kapsamlı bileşen kütüphanesi
  - Layout, Forms, Data Display, Feedback, Navigation
  - TypeScript ile tam tip güvenliği
  - Comprehensive testing (215+ unit tests)
- **Dokümantasyon**: 
  - [Component Library Guide](docs/COMPONENT_LIBRARY.md)
  - [Design System Guide](docs/DESIGN_SYSTEM.md)

### Güvenlik Özellikleri
- **Rate Limiting**: API endpoint koruması (5 farklı seviye)
- **CSRF Protection**: Cross-site request forgery koruması
- **XSS Prevention**: HTML sanitization
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Input Validation**: Tüm girişlerde doğrulama
- **Database Security**: MongoDB injection koruması

### Performans Optimizasyonları
- **Server-Side Rendering**: Hızlı sayfa yükleme
- **Image Optimization**: Next.js Image component
- **Bundle Optimization**: Code splitting (87.5 kB shared JS)
- **Client-Side Caching**: Akıllı API önbellekleme
- **Lazy Loading**: İhtiyaç anında yükleme

### Monitoring ve Performance Tracking
- **Real-time Monitoring**: Sistem sağlığı ve performans izleme
- **Error Tracking**: React Error Boundary ile hata yakalama
- **Performance Metrics**: Client ve server-side metrikleri
- **Health Check API**: `/api/health` endpoint
- **Admin Dashboard**: `/admin/monitoring` paneli

### Content Management
- **Portfolio Management**: Gelişmiş proje yönetimi
- **Service Management**: Hizmet yönetimi
- **Product Management**: E-ticaret desteği
- **Video Management**: YouTube video entegrasyonu
- **Media Management**: Cloudinary entegrasyonu
- **Universal Editor**: Markdown ve HTML desteği

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- MongoDB
- npm veya yarn

### Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/erdemerciyas/personal-blog.git
cd personal-blog

# Bağımlılıkları yükleyin
npm install

# Environment variables ayarlayın
cp .env.example .env.local
# .env.local dosyasını düzenleyin

# Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

### Environment Variables

`.env.local` dosyasında aşağıdaki değişkenleri ayarlayın:

```env
# Zorunlu
MONGODB_URI=mongodb://localhost:27017/personal-blog
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret

# Opsiyonel
YOUTUBE_API_KEY=your-youtube-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

## 📦 Teknoloji Stack

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

### DevOps
- **Vercel**: Hosting platform
- **GitHub Actions**: CI/CD pipeline
- **ESLint & Prettier**: Code quality

## 📝 Kullanılabilir Komutlar

```bash
# Geliştirme
npm run dev              # Geliştirme sunucusu
npm run build            # Production build
npm run start            # Production sunucu
npm run lint             # ESLint kontrolü
npm run lint:fix         # ESLint otomatik düzeltme
npm run type-check       # TypeScript kontrolü

# Test
npm run test             # Test çalıştır
npm run test:watch       # Test watch mode
npm run test:coverage    # Test coverage

# Güvenlik
npm run security:check   # Security audit
npm run security:test    # Security test

# Deployment
npm run deploy           # Vercel production deploy
npm run deploy:preview   # Vercel preview deploy
```

## 🏗️ Proje Yapısı

```
src/
├── app/                    # Next.js 14 App Router
│   ├── admin/             # Admin panel sayfaları
│   ├── api/               # API routes
│   ├── portfolio/         # Portfolyo sayfaları
│   └── ...
├── components/            # React bileşenleri
│   ├── admin/            # Admin bileşenleri
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI components
│   ├── common/           # Ortak bileşenler
│   └── ...
├── lib/                  # Utility fonksiyonları
├── models/               # MongoDB modelleri
├── types/                # TypeScript tipleri
└── hooks/                # Custom React hooks
```

## 🔒 Güvenlik

### Security Level: **HIGH**

- **Rate Limiting**: API endpoint koruması
- **CSRF Protection**: Token-based koruma
- **XSS Prevention**: HTML sanitization
- **Security Headers**: Kapsamlı güvenlik başlıkları
- **Input Validation**: Tüm girişlerde doğrulama
- **Authentication**: NextAuth.js ile güvenli kimlik doğrulama
- **File Upload Security**: Magic number validation
- **OWASP Top 10 2021** compliance

Detaylı güvenlik bilgisi için [SECURITY.md](SECURITY.md) dosyasına bakın.

## 📊 Performans

### Build Stats
- **Total Routes**: 124 (72 static + 52 dynamic)
- **Shared JS**: 87.5 kB
- **First Load JS**: ~130 kB average
- **Build Time**: ~1 minute

### Performance Metrics
- **Lighthouse Score**: 90+
- **Performance Score**: 92%
- **TypeScript Errors**: 0
- **Test Coverage**: 215+ unit tests

## 📚 Dokümantasyon

- [Component Library Guide](docs/COMPONENT_LIBRARY.md) - UI component kullanım rehberi
- [Design System Guide](docs/DESIGN_SYSTEM.md) - Design tokens ve patterns
- [Security Guide](SECURITY.md) - Güvenlik dokümantasyonu
- [Accessibility Guide](docs/ACCESSIBILITY_AUDIT_GUIDE.md) - Erişilebilirlik rehberi
- [Performance Guide](docs/PERFORMANCE_OPTIMIZATION_GUIDE.md) - Performans optimizasyonu

## 🎯 Özellikler

### Admin Panel
- Modern UI/UX (v3.0.0)
- Universal Editor (Markdown/HTML)
- Content Management
- Media Management
- System Monitoring
- User Management

### Portfolio Sistemi
- Modern proje kartları
- Gelişmiş filtreleme
- Lightbox galeri
- Teknoloji etiketleri

### E-ticaret
- Ürün yönetimi
- Kategori sistemi
- Sipariş yönetimi
- Ürün incelemeleri

### Video Yönetimi
- YouTube entegrasyonu
- Otomatik bilgi alma
- Toplu işlemler
- Arama ve filtreleme

## 🚀 Deployment

### Vercel (Önerilen)

```bash
# Vercel CLI ile deploy
vercel --prod

# Environment variables ayarla
vercel env add MONGODB_URI
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

### Manuel Deployment

```bash
# Build al
npm run build

# Production sunucu başlat
npm run start
```

## 🔄 Güncellemeler

### v2.6.0 (2 Ekim 2025)
- ✅ Complete admin UI/UX redesign
- ✅ 18+ new production-ready components
- ✅ Fixed all TypeScript errors
- ✅ Full dark mode support
- ✅ WCAG 2.1 AA accessibility
- ✅ Comprehensive documentation
- ✅ GitHub Actions CI/CD

### v2.5.0 (27 Ocak 2025)
- ✅ ESLint ve TypeScript temizliği
- ✅ Web Vitals tracking
- ✅ Performance optimizations
- ✅ Code quality improvements

### v2.4.0 (27 Ocak 2025)
- ✅ Video yönetim sistemi
- ✅ Toplu işlemler
- ✅ API optimizasyonları

Tüm güncellemeler için [CHANGELOG](docs/reports/) klasörüne bakın.

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👤 Yazar

**Erdem Erciyas**

- GitHub: [@erdemerciyas](https://github.com/erdemerciyas)
- Email: erdem.erciyas@gmail.com
- Website: [www.fixral.com](https://www.fixral.com)

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/)
- [Vercel](https://vercel.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudinary](https://cloudinary.com/)

## 📞 Destek

Sorularınız veya sorunlarınız için:

- GitHub Issues: [Issues](https://github.com/erdemerciyas/personal-blog/issues)
- Email: erdem.erciyas@gmail.com

---

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ by [Erdem Erciyas](https://github.com/erdemerciyas)
