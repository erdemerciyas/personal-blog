# 🚀 Vercel Deployment Rehberi

Bu rehber, Personal Blog projesini Vercel'e deploy etmek için gerekli adımları açıklar.

## 📋 Ön Gereksinimler

### 1. Vercel Hesabı
- [Vercel.com](https://vercel.com) üzerinden hesap oluşturun
- GitHub hesabınızı bağlayın

### 2. Environment Variables
Aşağıdaki environment variables'ları hazırlayın:

#### Gerekli Variables:
```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
```

#### Önerilen Variables:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Opsiyonel Variables:
```env
OPENAI_API_KEY=sk-your-openai-api-key
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
APP_NAME=Personal Blog
```

## 🔧 Deployment Adımları

### 1. GitHub Repository Hazırlığı
```bash
# Değişiklikleri commit edin
git add .
git commit -m "feat: Vercel deployment optimizations"
git push origin main
```

### 2. Vercel Dashboard
1. [Vercel Dashboard](https://vercel.com/dashboard) açın
2. "New Project" butonuna tıklayın
3. GitHub repository'nizi seçin
4. "Import" butonuna tıklayın

### 3. Project Configuration
```json
{
  "name": "personal-blog",
  "framework": "nextjs",
  "buildCommand": "npm run vercel-build",
  "outputDirectory": ".next",
  "installCommand": "npm install --legacy-peer-deps"
}
```

### 4. Environment Variables Ayarlama
Vercel Dashboard > Settings > Environment Variables:

```env
# Production Environment Variables
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here
MONGODB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
VERCEL=1
```

### 5. Domain Configuration
1. Settings > Domains
2. Custom domain ekleyin (opsiyonel)
3. DNS ayarlarını yapın

## ⚡ Optimizasyonlar

### 1. Build Optimizasyonları
- ✅ Custom build script (`vercel-build-fix.js`)
- ✅ Memory optimization (4GB limit)
- ✅ TypeScript/ESLint skip on Vercel
- ✅ MongoDB externals optimization

### 2. Performance Optimizasyonları
- ✅ Static page generation (45/48 pages)
- ✅ Image optimization
- ✅ Bundle splitting
- ✅ Cache headers

### 3. Security Optimizasyonları
- ✅ Security headers
- ✅ CSP configuration
- ✅ Rate limiting
- ✅ Environment validation

## 🔍 Troubleshooting

### Build Errors
```bash
# Local build test
npm run build

# Vercel build test
npm run vercel-build
```

### Environment Issues
```bash
# Configuration test
npm run test:config
```

### Database Connection
```bash
# MongoDB connection test
npm run test:db
```

## 📊 Deployment Checklist

### Pre-deployment:
- [ ] Environment variables hazır
- [ ] Local build başarılı
- [ ] Database bağlantısı test edildi
- [ ] Git repository güncel

### Post-deployment:
- [ ] Site erişilebilir
- [ ] Admin panel çalışıyor
- [ ] Database bağlantısı aktif
- [ ] Image upload çalışıyor
- [ ] Contact form çalışıyor

## 🚀 Automatic Deployment

### GitHub Integration
Vercel otomatik olarak:
- `main` branch'e push'larda deploy yapar
- Pull request'lerde preview deploy oluşturur
- Build status'unu GitHub'a bildirir

### Deployment Commands
```bash
# Manual deployment
vercel --prod

# Preview deployment
vercel

# Environment variables
vercel env add NEXTAUTH_SECRET
vercel env add MONGODB_URI
```

## 📈 Monitoring

### Vercel Analytics
- Performance metrics
- Core Web Vitals
- User analytics

### Error Tracking
- Function logs
- Build logs
- Runtime errors

## 🔧 Advanced Configuration

### Custom Domain
```bash
# Domain ekleme
vercel domains add your-domain.com

# DNS configuration
vercel dns add your-domain.com A 76.76.19.61
```

### Function Configuration
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

## 📞 Support

### Vercel Documentation
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)

### Project Support
- GitHub Issues: [Repository Issues](https://github.com/erdemerciyas/personal-blog/issues)
- Email: erdem.erciyas@gmail.com

---

**Son Güncelleme:** 2025-01-18  
**Vercel Version:** 44.5.0  
**Next.js Version:** 14.2.30