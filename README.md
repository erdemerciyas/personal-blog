# 🚀 Modern Portfolio & Blog Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

Modern, güvenli ve performanslı kişisel blog ve portfolyo platformu. Next.js 14, TypeScript, MongoDB ve Tailwind CSS ile geliştirilmiştir.

## ✨ Özellikler

### 🎨 Modern Portfolyo Sistemi
- **Gelişmiş Filtreleme**: Kategori, teknoloji, tarih aralığı ve arama
- **3 Farklı Layout**: Grid, Masonry ve Liste görünümleri
- **Lightbox Galeri**: Tam ekran görsel görüntüleme
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
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
- **Caching Strategies**: Akıllı önbellekleme
- **Lazy Loading**: İhtiyaç anında yükleme

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

## 🆕 Yeni Özellikler (v2.1.0)

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
- **Better UX**: İyileştirilmiş kullanıcı deneyimi

### Service Management
- **CRUD Operations**: Tam servis yönetimi
- **Image Upload**: Drag & drop görsel yükleme
- **Feature Management**: Servis özelliklerini yönetme
- **Live Preview**: Canlı önizleme sistemi

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

### Implemented Security Measures
- ✅ Rate limiting on API endpoints
- ✅ CSRF protection
- ✅ XSS prevention with HTML sanitization
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Input validation and sanitization
- ✅ Secure authentication with NextAuth.js
- ✅ Environment variable protection
- ✅ SQL injection prevention (NoSQL)

### Security Headers
```javascript
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [Comprehensive CSP]
```

## 📊 Performans

### Bundle Sizes
- **Homepage**: 6.47 kB (162 kB First Load)
- **Portfolio**: 6.83 kB (165 kB First Load)
- **Contact**: 9.17 kB (155 kB First Load)
- **Services**: 6.28 kB (158 kB First Load)

### Optimizations
- Server-side rendering
- Image optimization
- Code splitting
- Tree shaking
- Compression enabled

## 🚀 Deployment

### Vercel (Recommended)

1. **GitHub'a Push Edin**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. **Vercel'e Deploy Edin**
- [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
- "New Project" tıklayın
- GitHub repository'nizi seçin
- Environment variables'ları ekleyin
- Deploy edin

### Environment Variables (Vercel)
```
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## 🧪 Testing

```bash
# Build test
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Security audit
npm audit
```

## 📝 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm audit            # Security audit
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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

---

⭐ Bu projeyi beğendiyseniz star vermeyi unutmayın!