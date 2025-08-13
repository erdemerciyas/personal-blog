# 🚀 Deployment Guide

Bu rehber, Personal Blog Platform'u güvenli bir şekilde deploy etmek için gerekli adımları içerir.

## 📋 Deployment Yöntemleri

### 1. 🎯 Manuel Deployment (Önerilen)

Manuel deployment daha fazla kontrol sağlar ve production ortamında önerilir.

```bash
# 1. Değişiklikleri commit edin
git add .
git commit -m "feat: yeni özellik eklendi"
git push origin main

# 2. Build test edin
npm run build

# 3. Deploy edin
npm run deploy
```

**Avantajları:**
- ✅ Tam kontrol
- ✅ Hata durumunda hızlı müdahale
- ✅ Selective deployment
- ✅ Environment kontrolü

### 2. 🤖 GitHub Actions CI/CD

GitHub Actions otomatik olarak her commit'te çalışır ve build/test yapar.

**Pipeline Adımları:**
1. **Quality Check**: ESLint, TypeScript, Security audit
2. **Testing**: Configuration ve security testleri
3. **Build**: Production build (51 sayfa)
4. **Notification**: Deployment hazır bildirimi

**Workflow Durumu:**
- ✅ **Build & Test**: Otomatik
- ⚠️ **Deployment**: Manuel (güvenlik için)

## 🔧 Deployment Konfigürasyonu

### Environment Variables

Production deployment için gerekli environment variables:

```env
# Zorunlu
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Admin
ADMIN_EMAIL=your-email@example.com
ADMIN_NAME=Your Name
ADMIN_DEFAULT_PASSWORD=SecurePassword123!

# Opsiyonel
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Vercel Konfigürasyonu

`vercel.json` dosyası otomatik olarak konfigüre edilmiştir:

- **Regions**: Frankfurt (fra1)
- **Functions**: 30s timeout
- **Headers**: Security headers
- **Redirects**: Admin panel redirects
- **Cron Jobs**: Cleanup tasks

## 🚀 Deployment Adımları

### Adım 1: Pre-deployment Kontroller

```bash
# Environment validation
npm run test:config

# Security check
npm run security:test

# Build test
npm run build

# Type check
npm run type-check

# Lint check
npm run lint
```

### Adım 2: Deployment

```bash
# Production deployment
npm run deploy

# Preview deployment (test için)
npm run deploy:preview
```

### Adım 3: Post-deployment Verification

```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Admin panel check
curl https://your-domain.vercel.app/admin

# Performance check
npm run perf:check
```

## 📊 Deployment Metrikleri

### Build Performance
- **Build Time**: ~1 dakika
- **Static Pages**: 51 sayfa
- **Bundle Size**: 87.3 kB shared JS
- **API Routes**: 45+ endpoint

### Success Criteria
- ✅ Build başarılı
- ✅ All tests passing
- ✅ Security score > 80%
- ✅ Performance optimized
- ✅ Zero critical vulnerabilities

## 🔍 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache
npm run clean
npm install

# Check environment
npm run test:config

# Rebuild
npm run build
```

#### 2. Environment Issues
```bash
# Validate environment
SKIP_ENV_VALIDATION=false npm run test:config

# Check secrets
vercel env ls
```

#### 3. Performance Issues
```bash
# Analyze bundle
npm run build:analyze

# Performance test
npm run perf:check
```

## 🔒 Security Checklist

- [ ] Environment variables güvenli
- [ ] Admin şifresi güçlü
- [ ] Database bağlantısı güvenli
- [ ] HTTPS aktif
- [ ] Security headers konfigüre
- [ ] Rate limiting aktif
- [ ] Input validation aktif

## 📈 Monitoring

### Health Checks
- **API Health**: `/api/health`
- **Database**: MongoDB Atlas monitoring
- **Performance**: Vercel Analytics
- **Errors**: Vercel Function logs

### Alerts
- Build failures
- Performance degradation
- Security incidents
- Database issues

## 🔄 Rollback Procedure

Sorun durumunda hızlı rollback:

```bash
# Previous deployment'a dön
vercel rollback

# Specific deployment'a dön
vercel rollback [deployment-url]

# Git'te previous commit'e dön
git revert HEAD
git push origin main
npm run deploy
```

## Support

Deployment sorunları için:
- **Email**: extremeecu34@gmail.com
- **Issues**: GitHub Issues
- **Docs**: Project documentation

---

**Son Güncelleme**: 2025-08-01  
**Version**: v2.2.2  
**Status**: ✅ **PRODUCTION READY**