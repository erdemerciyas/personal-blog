# Personal Blog

[![Production - Vercel](https://img.shields.io/badge/Production-Live-green?logo=vercel)](https://erdemerciyas.vercel.app)

> **Canlı Demo:** [https://erdemerciyas.vercel.app](https://erdemerciyas.vercel.app)

## Son Sürüm

- **Versiyon:** 1.11.7
- **Güncelleme Tarihi:** Otomatik Vercel senkronizasyonu sonrası

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
NEXTAUTH_URL=https://erdemerciyas.vercel.app
NEXTAUTH_SECRET=f1181d6e1ce33c4ba4135a7497694541679c39f7ea81e7feddeca23a93e39ab9
MONGODB_URI=mongodb+srv://erdemerciyasrev... # (tam URI Vercel panelinizde)

APP_NAME=Personal Blog
APP_URL=https://erdemerciyas.vercel.app

CLOUDINARY_CLOUD_NAME=dlgnhbq8l
CLOUDINARY_API_KEY=788149143685286
CLOUDINARY_API_SECRET=1LVXl0-pogS9G7lnh4U_4rWiMW

OPENAI_API_KEY=sk-proj-acQ2008TWsFkvbZh-a0ztm...
PEXELS_API_KEY=ARLQnJxW2BYREGyHpviaUs93mV0z...
GMAIL_USER=erdem.erciyas@gmail.com
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

### 🔒 Security
- **CSRF Protection**: Cross-site request forgery koruması
- **XSS Protection**: Cross-site scripting koruması
- **Security Headers**: Comprehensive security headers
- **Input Validation**: Server-side validation ve sanitization
- **Rate Limiting**: API endpoint koruma

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

### v2.1.0 - Media Library Migration (Latest)
- ✅ **Independent Media Library**: Medya kütüphanesi artık admin settings'ten ayrı bir sayfa olarak çalışıyor (`/admin/media`)
- 🎨 **Enhanced UI**: Modern glassmorphism effects ve animations
- 🔍 **Advanced Filtering**: Tüm dosyalar, sadece resimler, Cloudinary/yerel dosyalar filtresi
- 📤 **Drag & Drop Upload**: İyileştirilmiş dosya yükleme deneyimi
- ✨ **Multi-Select**: Toplu seçim ve silme işlemleri
- 🏷️ **Source Badges**: Cloud vs Local dosya gösterimi
- 📱 **Responsive Design**: Mobil uyumlu responsive grid layout
- 🔗 **Updated Navigation**: Dashboard'daki tüm linkler yeni medya sayfasına yönlendiriliyor
- **DEBUG**: Development detayları (sadece dev mode)

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

**Erdem Erciyas**
- Website: [erdemerciyas.com.tr](https://www.erdemerciyas.com.tr)
- Email: erdem.erciyas@gmail.com
- GitHub: [@erdemerciyas](https://github.com/erdemerciyas)

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
