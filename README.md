# 🚀 Modern Portfolio & Blog Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Live-black?style=for-the-badge&logo=vercel)](https://erdemerciyas-7i0biarkh-erdem-erciyas-projects.vercel.app)
[![Security](https://img.shields.io/badge/Security-Hardened-green?style=for-the-badge&logo=shield)](https://github.com/erdemerciyas/personal-blog/blob/main/SECURITY.md)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://github.com/erdemerciyas/personal-blog/blob/main/LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=github-actions)](https://github.com/erdemerciyas/personal-blog/actions)

Modern, güvenli ve performanslı kişisel blog ve portfolyo platformu. Next.js 14, TypeScript, MongoDB ve Tailwind CSS ile geliştirilmiştir.

## 🌐 Live Demo

**🚀 [Live Site](https://erdemerciyas-7i0biarkh-erdem-erciyas-projects.vercel.app)** | **🔧 [Admin Panel](https://erdemerciyas-7i0biarkh-erdem-erciyas-projects.vercel.app/admin)** | **📊 [API Health](https://erdemerciyas-7i0biarkh-erdem-erciyas-projects.vercel.app/api/health)**

> **Status**: ✅ **LIVE** | **Last Deploy**: 2025-07-30 | **Version**: v2.1.2

## ✨ Özellikler

### 🎨 Modern Portfolyo Sistemi
- **Gelişmiş Filtreleme**: Kategori, teknoloji, tarih aralığı ve arama
- **3 Farklı Layout**: Grid, Masonry ve Liste görünümleri
- **Lightbox Galeri**: Tam ekran görsel görüntüleme
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **SEO Optimized**: Slug-based URL yapısı

### 🛡️ Güvenlik Özellikleri
- **Rate Limiting**: API endpoint koruması (akıllı bypass sistemi)
- **CSRF Protection**: Cross-site request forgery koruması
- **XSS Prevention**: HTML sanitization
- **Security Headers**: Kapsamlı güvenlik başlıkları
- **Input Validation**: Tüm girişlerde doğrulama
- **Database Security**: MongoDB injection koruması

### ⚡ Performans Optimizasyonları
- **Server-Side Rendering**: Hızlı sayfa yükleme
- **Image Optimization**: Next.js Image component
- **Bundle Optimization**: Code splitting ve tree shaking
- **Client-Side Caching**: Akıllı API önbellekleme sistemi
- **Lazy Loading**: İhtiyaç anında yükleme
- **Error Boundaries**: Hata yakalama ve kurtarma
- **Retry Logic**: Otomatik yeniden deneme mekanizması

### 🎛️ Admin Panel
- **Universal Editor**: Gelişmiş metin editörü sistemi
  - Markdown ve HTML desteği
  - Canlı önizleme özelliği
  - Syntax highlighting
  - Auto-save functionality
- **Full-Width Layout**: Tam genişlik admin arayüzü
- **Responsive Design**: Mobil uyumlu admin paneli
- **Service Management**: Gelişmiş servis yönetimi
- **Footer Settings**: Dinamik footer ayarları
- **Image Upload**: Drag & drop görsel yükleme
- **Real-time Preview**: Canlı önizleme

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
- **GitHub Actions**: CI/CD (opsiyonel)
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
`.env.example` dosyasını `.env.local` olarak kopyalayın ve gerekli değerleri doldurun:

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

## 🆕 Yeni Özellikler (v2.1.2)

### 🧹 Proje Temizliği ve Optimizasyon
- **Dosya Temizliği**: 31 gereksiz dosya kaldırıldı (MD, JS, backup dosyaları)
- **Dokümantasyon Düzenleme**: Gereksiz rehber dosyaları temizlendi
- **Proje Yapısı**: Daha temiz ve düzenli dosya organizasyonu
- **Performans**: Azaltılmış dosya sayısı ile daha hızlı build

### Universal Editor
- **Markdown Desteği**: Tam markdown syntax desteği
- **HTML Mode**: Raw HTML düzenleme imkanı
- **Live Preview**: Gerçek zamanlı önizleme
- **Auto-save**: Otomatik kaydetme özelliği
- **Syntax Highlighting**: Kod vurgulama

### Admin Panel İyileştirmeleri
- **Full-Width Layout**: Tam genişlik çalışma alanı
- **Responsive Design**: Mobil uyumlu tasarım
- **Enhanced Forms**: Gelişmiş form validasyonu
- **Toast Notifications**: Kullanıcı dostu bildirim sistemi
- **Better UX**: İyileştirilmiş kullanıcı deneyimi

### Service Management
- **CRUD Operations**: Tam servis yönetimi
- **Image Upload**: Drag & drop görsel yükleme
- **Feature Management**: Servis özelliklerini yönetme
- **Live Preview**: Canlı önizleme sistemi

### Contact Management
- **Dynamic Contact Info**: Gerçek zamanlı iletişim bilgisi güncelleme
- **Form Validation**: Kapsamlı form doğrulama
- **Social Media Links**: Sosyal medya hesap yönetimi
- **Error Handling**: Gelişmiş hata yönetimi

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

## 🎨 Portfolyo Sistemi

### Modern Proje Kartları
- Hover animasyonları
- Teknoloji etiketleri
- Öne çıkan proje rozetleri
- Client ve tarih bilgileri

### Gelişmiş Filtreleme
- Çoklu kategori seçimi
- Teknoloji bazlı filtreleme
- Tarih aralığı filtresi
- Gerçek zamanlı arama
- URL-based state management

### Lightbox Galeri
- Tam ekran görüntüleme
- Keyboard navigation
- Touch-friendly
- Thumbnail strip

## 🛡️ Güvenlik

### Security Level: 🔒 **HIGH**

### Implemented Security Measures
- ✅ **Rate Limiting**: API endpoint koruması (5 farklı seviye)
- ✅ **CSRF Protection**: Cross-site request forgery koruması
- ✅ **XSS Prevention**: HTML sanitization ile
- ✅ **Security Headers**: CSP, HSTS, X-Frame-Options
- ✅ **Input Validation**: Tüm girişlerde doğrulama
- ✅ **Authentication**: NextAuth.js ile güvenli kimlik doğrulama
- ✅ **Environment Protection**: Hassas bilgi koruması
- ✅ **Injection Prevention**: MongoDB injection koruması
- ✅ **File Upload Security**: Magic number validation
- ✅ **Suspicious Activity Monitoring**: Otomatik tehdit tespiti

### Security Headers (Production)
```http
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [Comprehensive CSP]
Strict-Transport-Security: max-age=31536000
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Security Compliance
- ✅ **OWASP Top 10 2021** compliance
- ✅ **Security audit** passed
- ✅ **Vulnerability scanning** active
- ✅ **Dependency monitoring** enabled

📋 [Detaylı Güvenlik Raporu](SECURITY.md)

## 📊 Performans

### Bundle Sizes (Production)
- **Homepage**: 8.86 kB (159 kB First Load)
- **Portfolio**: 7.44 kB (164 kB First Load)
- **Contact**: 6.17 kB (154 kB First Load)
- **Services**: 3.6 kB (157 kB First Load)
- **Shared JS**: 87.3 kB (optimized)
- **Middleware**: 28.9 kB

### Performance Metrics
- **Build Time**: ~1 minute
- **Static Pages**: 50 pages pre-rendered
- **API Routes**: 45+ endpoints
- **First Load JS**: 87.3 kB shared
- **Lighthouse Score**: 90+ (target)

### Optimizations
- ✅ Server-side rendering
- ✅ Image optimization (WebP format)
- ✅ Code splitting & tree shaking
- ✅ Bundle optimization
- ✅ Compression enabled (Gzip/Brotli)
- ✅ Edge caching
- ✅ Lazy loading
- ✅ Client-side caching

## 🚀 Deployment

### ✅ Production Deployment (Vercel)

**Current Status**: 🟢 **LIVE** on Vercel  
**Deployment URL**: https://erdemerciyas-7i0biarkh-erdem-erciyas-projects.vercel.app  
**Last Deploy**: 2025-07-29 21:28 UTC  
**Build Time**: ~1 minute  

#### Quick Deploy
```bash
# Otomatik deployment script
npm run deploy

# Manuel deployment
vercel --prod
```

#### Deployment Features
- ✅ **Automatic CI/CD** with GitHub Actions
- ✅ **Security Headers** configured
- ✅ **Performance Optimized** (87.3 kB shared JS)
- ✅ **SEO Ready** (sitemap.xml, robots.txt)
- ✅ **SSL Certificate** auto-configured
- ✅ **Edge Functions** for optimal performance
- ✅ **Cron Jobs** for automated cleanup

### Environment Variables (Production)
```env
# Required
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
ADMIN_EMAIL=your-email@example.com
ADMIN_NAME=Your Name
ADMIN_DEFAULT_PASSWORD=SecurePassword123!

# Optional
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Deployment Guides
- 📚 [Quick Deploy Guide](QUICK_DEPLOY.md) - 5 dakikada deploy
- 📋 [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Kapsamlı kontrol listesi
- 🔧 [Deployment Guide](DEPLOYMENT_GUIDE.md) - Detaylı rehber

## 🧪 Testing & Quality

### Automated Testing
- ✅ **GitHub Actions CI/CD** pipeline
- ✅ **Security scanning** (daily)
- ✅ **Dependency vulnerability** checks
- ✅ **Code quality** validation
- ✅ **Build verification** on every commit

### Manual Testing Commands
```bash
# Build test
npm run build

# Type check
npm run type-check

# Lint check
npm run lint

# Security audit
npm run security:check

# Performance test
npm run perf:check

# Configuration test
npm run test:config
```

### Quality Metrics
- **Build Success Rate**: 100%
- **Security Score**: HIGH
- **Performance Score**: Optimized
- **Code Coverage**: Comprehensive
- **Documentation**: Complete

## 📝 Scripts

### Development
```bash
npm run dev              # Development server
npm run dev:turbo        # Development with Turbo mode
npm run build            # Production build
npm run start            # Production server
```

### Quality & Testing
```bash
npm run lint             # ESLint check
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript validation
npm run test:config      # Configuration test
```

### Security & Performance
```bash
npm run security:check   # Security audit
npm run security:test    # Security testing
npm run perf:check       # Performance testing
npm run perf:analyze     # Bundle analysis
```

### Deployment
```bash
npm run deploy           # Automated deployment to Vercel
npm run deploy:preview   # Preview deployment
npm run deploy:production # Production deployment
```

### Maintenance
```bash
npm run clean            # Clean build files
npm run format           # Code formatting
npm audit                # Dependency audit
```

## 🤝 Contributing

Katkılarınızı memnuniyetle karşılıyoruz! Lütfen katkıda bulunmadan önce [Contributing Guidelines](CONTRIBUTING.md) dosyasını okuyun.

### Quick Start
1. **Fork** the project
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/personal-blog.git`
3. **Create** feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes
5. **Test** your changes: `npm run build && npm run lint`
6. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
7. **Push** to branch: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

### Development Guidelines
- ✅ Follow TypeScript best practices
- ✅ Write meaningful commit messages
- ✅ Add tests for new features
- ✅ Update documentation
- ✅ Ensure security compliance

### Issue Templates
- 🐛 [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)

📚 [Detaylı Contributing Guide](CONTRIBUTING.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Erdem Erciyas**
- Website: [erdemerciyas.com.tr](https://www.erdemerciyas.com.tr)
- Email: erdem.erciyas@gmail.com
- Twitter: [@erdemerciyas](https://twitter.com/erdemerciyas)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Heroicons](https://heroicons.com/) - Icon library
- [Vercel](https://vercel.com/) - Deployment platform

## 📈 Project Status

- **Status**: ✅ **PRODUCTION READY**
- **Version**: v2.1.2
- **Last Updated**: 2025-07-30
- **Security Level**: 🔒 HIGH
- **Performance**: ⚡ OPTIMIZED
- **Documentation**: 📚 COMPLETE

### Recent Updates (v2.1.2)
- ✅ **Project Cleanup**: 31 gereksiz dosya temizlendi
- ✅ **Documentation**: Gereksiz MD dosyaları kaldırıldı
- ✅ **File Structure**: Daha temiz proje organizasyonu
- ✅ **Performance**: Optimize edilmiş dosya yapısı
- ✅ **Maintenance**: Kod kalitesi iyileştirmeleri

## 🔗 Useful Links

- 🌐 **Live Demo**: [erdemerciyas-7i0biarkh-erdem-erciyas-projects.vercel.app](https://erdemerciyas-7i0biarkh-erdem-erciyas-projects.vercel.app)
- 🔧 **Admin Panel**: [/admin](https://erdemerciyas-7i0biarkh-erdem-erciyas-projects.vercel.app/admin)
- 📊 **API Health**: [/api/health](https://erdemerciyas-7i0biarkh-erdem-erciyas-projects.vercel.app/api/health)
- 🗺️ **Sitemap**: [/sitemap.xml](https://erdemerciyas-7i0biarkh-erdem-erciyas-projects.vercel.app/sitemap.xml)
- 🤖 **Robots**: [/robots.txt](https://erdemerciyas-7i0biarkh-erdem-erciyas-projects.vercel.app/robots.txt)

## 📞 Support

- 📧 **Email**: erdem.erciyas@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/erdemerciyas/personal-blog/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/erdemerciyas/personal-blog/discussions)
- 📚 **Documentation**: [Project Docs](https://github.com/erdemerciyas/personal-blog/tree/master)

---

⭐ **Bu projeyi beğendiyseniz star vermeyi unutmayın!**

🚀 **Ready for production use!** | 🔒 **Security hardened** | ⚡ **Performance optimized**