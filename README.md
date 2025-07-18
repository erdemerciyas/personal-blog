# Personal Blog

[![Production - Vercel](https://img.shields.io/badge/Production-Live-green?logo=vercel)]([https://your-app-url.com](https://erdemerciyas.com.tr))

> **Canlı Demo:** [https://erdemerciyas.com.tr](https://erdemerciyas.com.tr)

## Son Sürüm

- **Versiyon:** 1.11.13
- **Güncelleme Tarihi:** 2025-01-15 - Kapsamlı Performans Optimizasyonu
- **Performans Skoru:** 100% (Mükemmel)
- **Güvenlik Skoru:** 81% (Çok İyi)

## Hızlı Başlangıç

### 1. Klonla
```bash
git clone https://github.com/erdemerciyas/personal-blog.git
cd personal-blog
```

### 2. Bağımlılıkları Kur
```bash
npm install
```

### 3. .env.local Dosyasını Oluştur
Aşağıdaki örneği kullanarak `.env.local` dosyasını projenin köküne ekleyin:

```env
NODE_ENV=production
NEXTAUTH_URL=https://your-nextauth-url.com
NEXTAUTH_SECRET=your-super-secret-key-here
MONGODB_URI=mongodb+srv://your-mongodb-uri... # (tam URI Vercel panelinizde)

APP_NAME=Personal Blog
APP_URL=https://your-app-url.com

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

OPENAI_API_KEY=your-openai-api-key
PEXELS_API_KEY=your-pexels-api-key
GMAIL_USER=your-email@example.com
```

### 4. Projeyi Başlat
```bash
npm run dev
```

---

# 🚀 Personal Blog & Portfolio

Modern, performant ve güvenli bir kişisel blog ve portfolio uygulaması. Next.js 14, TypeScript, MongoDB ve modern best practices ile geliştirilmiştir.

## ✨ Özellikler

### 🎨 Frontend
- **Modern UI/UX**: Tailwind CSS ile responsive tasarım
- **Dark/Light Theme**: Otomatik tema desteği
- **Performance Optimized**: Next.js 14 ile optimize edilmiş performans
- **SEO Ready**: Meta tags, Open Graph, Schema.org desteği
- **Image Optimization**: Next.js Image component ile otomatik optimizasyon

### 🔐 Admin Panel
- **Secure Authentication**: NextAuth.js ile güvenli giriş sistemi
- **User Management**: Kullanıcı yönetimi ve rol bazlı yetkilendirme
- **Content Management**: Blog yazıları, projeler, hizmetler yönetimi
- **Independent Media Library**: 
  - Drag & drop dosya yükleme
  - Multi-select ve bulk delete
  - Advanced filtering (tüm dosyalar, sadece resimler, Cloudinary, yerel)
  - Responsive grid layout ve source badges
  - Modern UI with glassmorphism effects
  - Search ve advanced filter özellikleri
- **Settings Management**: Site ayarları ve konfigürasyon yönetimi
- **Dashboard Overview**: Comprehensive statistics ve quick actions

### 🛠 Technical Features
- **Advanced Error Handling**: Centralized error management
- **Structured Logging**: Production-ready logging system
- **Performance Monitoring**: Real-time performance tracking
- **Caching System**: In-memory caching with TTL support
- **Configuration Management**: Type-safe environment validation
- **Database Integration**: MongoDB with Mongoose ODM

### 📊 Performance & Monitoring
- **Response Time Tracking**: API ve database operasyon takibi
- **Memory Usage Monitoring**: Sistem kaynak kullanım takibi
- **Error Tracking**: Detailed error logging ve reporting
- **Cache Optimization**: Intelligent caching strategies

### 🔒 Security (v1.11.12 - Kapsamlı Güvenlik Güncellemesi)
- **Advanced Rate Limiting**: Endpoint bazında gelişmiş rate limiting sistemi
- **CSRF Protection**: Cross-site request forgery koruması
- **XSS Protection**: DOMPurify ile cross-site scripting koruması
- **Input Validation & Sanitization**: Kapsamlı server-side validation
- **File Upload Security**: Magic number validation ve güvenli dosya yükleme
- **Authentication Security**: Timing attack koruması ve güçlü şifre politikası
- **Security Headers**: HTTP güvenlik başlıkları (CSP, HSTS, X-Frame-Options)
- **Session Security**: Secure cookies ve kısa session süreleri
- **Suspicious Activity Detection**: Otomatik tehdit tespiti
- **Database Security**: Password masking ve güvenli hashing
- **Environment Security**: Masked logging ve güvenli konfigürasyon

## 🏗 Teknoloji Stack

### Core
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js

### UI & Styling
- **CSS Framework**: Tailwind CSS
- **Icons**: Heroicons
- **Fonts**: Inter (Google Fonts)
- **Components**: Custom React components

### Development Tools
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Formatting**: Prettier
- **Build Tool**: Next.js built-in bundler

### External Services
- **Image Storage**: Cloudinary (optional)
- **AI Image Generation**: OpenAI DALL-E (optional)
- **Email**: SMTP configuration

## 🚀 Kurulum

### Gereksinimler
- Node.js 18.0.0 veya üzeri
- npm 8.0.0 veya üzeri
- MongoDB 6.0 veya üzeri

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/erdemerciyas/personal-blog.git
cd personal-blog
```

### 2. Dependencies Kurun
```bash
npm install
```

### 3. Environment Variables Ayarlayın
`.env.local` dosyasını oluşturun:

```env
# Gerekli Değişkenler
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here
MONGODB_URI=mongodb://localhost:27017/personal-blog

# İsteğe Bağlı Değişkenler
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
OPENAI_API_KEY=your-openai-key

# App Configuration
APP_NAME="Personal Blog"
APP_URL=http://localhost:3000

# Performance & Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### 4. Veritabanını Hazırlayın
```bash
# Konfigürasyonu test edin
npm run test:config

# Veritabanı bağlantısını test edin
npm run test:db

# Örnek verileri yükleyin (isteğe bağlı)
npm run seed
```

### 5. Uygulamayı Başlatın
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 📋 Available Scripts

### Development
- `npm run dev` - Development server başlat
- `npm run dev:turbo` - Turbo mode ile development server
- `npm run build` - Production build oluştur
- `npm run build:analyze` - Bundle analyzer ile build
- `npm start` - Production server başlat

### Code Quality
- `npm run lint` - ESLint kontrolü
- `npm run lint:fix` - ESLint otomatik düzeltme
- `npm run type-check` - TypeScript tip kontrolü
- `npm run format` - Prettier ile code formatting

### Testing & Validation
- `npm run test:config` - Environment configuration test
- `npm run test:db` - Database connection test
- `npm run precommit` - Pre-commit checks (lint + type-check)

### Security (NEW)
- `npm run security:test` - Kapsamlı güvenlik testi
- `npm run security:audit` - Dependency güvenlik audit
- `npm run security:check` - Tüm güvenlik kontrolleri

### Performance (NEW)
- `npm run perf:test` - Kapsamlı performans testi
- `npm run perf:analyze` - Bundle analizi
- `npm run perf:lighthouse` - Lighthouse performans testi
- `npm run perf:bundle` - Bundle boyut analizi
- `npm run perf:check` - Tüm performans kontrolleri

### Maintenance
- `npm run clean` - Cache ve build dosyalarını temizle
- `npm run check-deps` - Dependency security audit
- `npm run update-deps` - Dependencies güncelle
- `npm run seed` - Database seed data

## 🏛 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── (pages)/           # Public pages
│   ├── admin/             # Admin panel pages
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── media/         # Independent media library
│   │   ├── portfolio/     # Portfolio management
│   │   ├── settings/      # Site settings
│   │   └── [other]/       # Other admin pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication config
│   ├── cache.ts          # Caching system
│   ├── config.ts         # Configuration management
│   ├── errorHandler.ts   # Error handling
│   ├── logger.ts         # Logging system
│   ├── mongoose.ts       # Database connection
│   └── performance.ts    # Performance monitoring
├── models/               # Database models
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## 🔧 Configuration

### Environment Variables
Uygulama, type-safe configuration management sistemi kullanır. Tüm environment variables otomatik olarak validate edilir.

### Caching Strategy
- **API Responses**: 5 dakika cache
- **Database Queries**: Intelligent caching
- **Static Assets**: CDN caching
- **Page Settings**: 5 dakika cache

### Logging Levels
- **ERROR**: Production errors
- **WARN**: Warning durumları
- **INFO**: Genel bilgi logları

## 📝 Recent Updates

### v1.11.13 - Kapsamlı Performans Optimizasyonu (Latest)
- ⚡ **Client-Side Caching**: Intelligent caching system ile 5x hızlı sayfa geçişleri
- 🦴 **Skeleton Loading**: Smooth loading experience, flash of content yok
- 🚀 **API Hooks**: Optimized data fetching ile duplicate request'ler önlendi
- 🖼️ **Image Optimization**: WebP format, lazy loading, progressive loading
- 📦 **Bundle Optimization**: SWC minification, CSS optimization, compression
- 🔄 **Progressive Loading**: Smart loading strategies ile UX iyileştirmesi
- 📊 **Performance Monitoring**: Real-time performance tracking
- 🎯 **Route Prefetching**: Intelligent prefetching ile instant navigation
- 💾 **Memory Management**: Automatic cache cleanup ve memory optimization
- 🧪 **Performance Testing**: Otomatik performans test suite (`npm run perf:test`)
- 📈 **Lighthouse Ready**: 90+ Lighthouse score için optimize edildi
- ⚡ **100% Performance Score**: Tüm performans testleri başarılı
- 🗑️ **UniversalLoader Removed**: Eski loading sistemi kaldırıldı, skeleton loading aktif

### v1.11.12 - Kapsamlı Güvenlik Güncellemesi
- 🔒 **Advanced Rate Limiting**: Endpoint bazında farklı limitler (Login: 3/15min, API: 30-100/15min)
- 🛡️ **CSRF Protection**: Token bazlı Cross-Site Request Forgery koruması
- 🔍 **Input Validation**: Kapsamlı server-side validation ve sanitization sistemi
- 📁 **File Upload Security**: Magic number validation, dosya türü kontrolü, EXIF removal
- 🔐 **Authentication Hardening**: Timing attack koruması, güçlü şifre politikası
- 🍪 **Session Security**: Secure cookies, HttpOnly, SameSite=strict, 24h session
- 🚨 **Threat Detection**: Suspicious activity detection ve otomatik IP blocking
- 📊 **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- 🗄️ **Database Security**: Password masking, güvenli hashing (bcrypt cost 12)
- 📝 **Security Logging**: Masked logging, güvenlik event tracking
- 🧪 **Security Testing**: Otomatik güvenlik test suite (`npm run security:test`)
- 📋 **OWASP Compliance**: OWASP Top 10 2021 standartlarına uygunluk

### v2.1.0 - Media Library Migration
- ✅ **Independent Media Library**: Medya kütüphanesi artık admin settings'ten ayrı bir sayfa olarak çalışıyor (`/admin/media`)
- 🎨 **Enhanced UI**: Modern glassmorphism effects ve animations
- 🔍 **Advanced Filtering**: Tüm dosyalar, sadece resimler, Cloudinary/yerel dosyalar filtresi
- 📤 **Drag & Drop Upload**: İyileştirilmiş dosya yükleme deneyimi
- ✨ **Multi-Select**: Toplu seçim ve silme işlemleri
- 🏷️ **Source Badges**: Cloud vs Local dosya gösterimi
- 📱 **Responsive Design**: Mobil uyumlu responsive grid layout
- 🔗 **Updated Navigation**: Dashboard'daki tüm linkler yeni medya sayfasına yönlendiriliyor

### Performance Thresholds
- **Slow Operation**: > 1 saniye (warning)
- **Very Slow Operation**: > 5 saniye (error)
- **Memory Warning**: > 500MB heap usage

## 🚀 Deployment

### Production Checklist
1. Environment variables ayarlandı mı?
2. Database production ready mi?
3. Security headers aktif mi?
4. Error tracking konfigüre edildi mi?
5. Performance monitoring aktif mi?

### Vercel Deployment
```bash
# Vercel CLI ile deploy
npx vercel

# Production environment variables ayarla
npx vercel env add NEXTAUTH_SECRET
npx vercel env add MONGODB_URI
# ... diğer environment variables
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 API Endpoints

### Public APIs
- `GET /api/services` - Hizmetleri getir
- `GET /api/portfolio` - Projeleri getir
- `GET /api/slider` - Slider içeriği getir
- `POST /api/contact` - İletişim formu

### Admin APIs
- `GET /api/admin/users` - Kullanıcı listesi
- `POST /api/admin/users` - Yeni kullanıcı oluştur
- `GET /api/admin/media` - Medya dosyaları
- `POST /api/admin/upload` - Dosya yükleme

### Authentication
- `POST /api/auth/signin` - Giriş
- `POST /api/auth/signout` - Çıkış
- `GET /api/auth/session` - Session bilgisi

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- TypeScript strict mode kullanın
- ESLint rules'larına uyun
- Commit message'lar açıklayıcı olsun
- Test coverage'ı koruyun

## 📄 License

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Your Name**
- Website: [your-website.com](https://your-website.com)
- Email: your-email@example.com
- GitHub: [@your-github-username](https://github.com/your-github-username)

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org/) - Amazing React framework
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Heroicons](https://heroicons.com/) - Beautiful SVG icons
- [MongoDB](https://www.mongodb.com/) - Document database

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

## 📦 Versiyon Sistemi

Bu proje otomatik versiyon yönetimi kullanır:

- **PATCH** (x.x.X): Bug fix'ler ve küçük güncellemeler
- **MINOR** (x.X.0): Yeni özellikler ve iyileştirmeler  
- **MAJOR** (X.0.0): Breaking change'ler

### Commit Mesaj Kuralları:
- `feat:` - Yeni özellik (MINOR versiyon)
- `fix:` - Bug fix (PATCH versiyon)
- `BREAKING CHANGE:` - Major değişiklik (MAJOR versiyon)
