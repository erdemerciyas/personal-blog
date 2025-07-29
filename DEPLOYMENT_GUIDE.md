# 🚀 Deployment Guide

Bu rehber, Personal Blog Platform'u GitHub'dan Vercel'e deploy etme sürecini detaylandırır.

## 📋 Ön Gereksinimler

### Hesaplar
- [GitHub](https://github.com) hesabı
- [Vercel](https://vercel.com) hesabı
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) hesabı (önerilen)
- [Cloudinary](https://cloudinary.com) hesabı (opsiyonel)

### Gerekli Bilgiler
- MongoDB connection string
- NextAuth secret key
- Cloudinary credentials (opsiyonel)

## 🔧 1. GitHub Repository Kurulumu

### Repository Oluşturma
```bash
# 1. GitHub'da yeni repository oluşturun
# 2. Local projeyi klonlayın
git clone https://github.com/YOUR_USERNAME/personal-blog.git
cd personal-blog

# 3. Remote origin'i ayarlayın
git remote add origin https://github.com/YOUR_USERNAME/personal-blog.git

# 4. İlk commit'i yapın
git add .
git commit -m "Initial commit: Personal blog platform"
git push -u origin main
```

### Repository Ayarları
1. **Settings** > **General**:
   - Repository name: `personal-blog`
   - Description: "Modern portfolio & blog platform built with Next.js"
   - Visibility: Public (önerilen)

2. **Settings** > **Security**:
   - Enable "Vulnerability alerts"
   - Enable "Dependabot alerts"
   - Enable "Dependabot security updates"

## 🗄️ 2. MongoDB Atlas Kurulumu

### Database Oluşturma
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)'a giriş yapın
2. **Create a New Cluster** tıklayın
3. **Free Tier (M0)** seçin
4. Region olarak **Europe (Frankfurt)** seçin
5. Cluster name: `personal-blog`

### Database Kullanıcısı
1. **Database Access** > **Add New Database User**
2. Authentication Method: **Password**
3. Username: `bloguser`
4. Password: Güçlü bir şifre oluşturun
5. Database User Privileges: **Read and write to any database**

### Network Access
1. **Network Access** > **Add IP Address**
2. **Allow Access from Anywhere** (0.0.0.0/0)
3. Comment: "Vercel deployment access"

### Connection String
1. **Clusters** > **Connect** > **Connect your application**
2. Driver: **Node.js**
3. Version: **4.1 or later**
4. Connection string'i kopyalayın:
   ```
   mongodb+srv://bloguser:<password>@personal-blog.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## ☁️ 3. Cloudinary Kurulumu (Opsiyonel)

### Hesap Oluşturma
1. [Cloudinary](https://cloudinary.com)'ye kaydolun
2. **Dashboard**'a gidin
3. Aşağıdaki bilgileri not alın:
   - Cloud Name
   - API Key
   - API Secret

## 🚀 4. Vercel Deployment

### Vercel'e Bağlanma
1. [Vercel](https://vercel.com)'e GitHub ile giriş yapın
2. **New Project** tıklayın
3. GitHub repository'nizi seçin
4. **Import** tıklayın

### Environment Variables
**Environment Variables** bölümünde aşağıdaki değişkenleri ekleyin:

#### Zorunlu Variables
```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-32-char-key-here
MONGODB_URI=mongodb+srv://bloguser:password@personal-blog.xxxxx.mongodb.net/personal-blog?retryWrites=true&w=majority
ADMIN_EMAIL=your-email@example.com
ADMIN_NAME=Your Name
ADMIN_DEFAULT_PASSWORD=SecureAdmin2024!@#
```

#### Opsiyonel Variables
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
OPENAI_API_KEY=your-openai-key
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

#### Güvenlik Variables
```env
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
BYPASS_RATE_LIMIT=false
SECURITY_HEADERS_ENABLED=true
CSRF_PROTECTION_ENABLED=true
```

### Build & Deploy
1. **Deploy** tıklayın
2. Build process'i izleyin
3. Deploy tamamlandığında URL'yi not alın

## 🔧 5. Domain Konfigürasyonu

### Custom Domain (Opsiyonel)
1. Vercel Dashboard > **Settings** > **Domains**
2. **Add Domain** tıklayın
3. Domain adınızı girin (örn: `erdemerciyas.com.tr`)
4. DNS ayarlarını yapın:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

### SSL Certificate
- Vercel otomatik olarak SSL certificate sağlar
- HTTPS zorlaması aktiftir

## 🔒 6. Güvenlik Konfigürasyonu

### Environment Variables Güvenliği
```bash
# Vercel CLI ile environment variables ekleme
npm i -g vercel
vercel login
vercel env add NEXTAUTH_SECRET
vercel env add MONGODB_URI
vercel env add CLOUDINARY_API_SECRET
```

### Security Headers
Vercel otomatik olarak aşağıdaki security headers'ları ekler:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy

## 📊 7. Monitoring & Analytics

### Vercel Analytics
1. Vercel Dashboard > **Analytics**
2. **Enable Analytics** tıklayın
3. Real-time traffic monitoring

### Performance Monitoring
1. **Speed Insights** aktif edin
2. Core Web Vitals tracking
3. Performance budgets ayarlayın

## 🔄 8. CI/CD Pipeline

### GitHub Actions
Repository'de otomatik olarak şu workflow'lar çalışır:
- **CI Pipeline**: Code quality, testing, building
- **Security Scan**: Daily security audits
- **Auto Deploy**: Main branch'e push'ta otomatik deploy

### Deployment Hooks
```bash
# Production deploy
git push origin main

# Preview deploy
git push origin feature/new-feature
```

## 🧪 9. Testing & Verification

### Deployment Testi
1. **Homepage**: https://your-domain.vercel.app
2. **Admin Panel**: https://your-domain.vercel.app/admin
3. **API Health**: https://your-domain.vercel.app/api/health
4. **Portfolio**: https://your-domain.vercel.app/portfolio

### Performance Testi
```bash
# Lighthouse audit
npm run perf:lighthouse

# Bundle analysis
npm run build:analyze
```

### Security Testi
```bash
# Security audit
npm run security:check

# Vulnerability scan
npm audit --audit-level moderate
```

## 🔧 10. Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and rebuild
vercel --prod --force

# Check build logs
vercel logs your-deployment-url
```

#### Environment Variables
```bash
# List all environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

#### Database Connection
```bash
# Test MongoDB connection
npm run test:config
```

### Debug Mode
```bash
# Enable debug logging
vercel env add DEBUG "mongoose:*,next:*"
```

## 📈 11. Post-Deployment

### SEO Setup
1. **Google Search Console**'a site ekleyin
2. **Sitemap** submit edin: `/sitemap.xml`
3. **robots.txt** kontrol edin: `/robots.txt`

### Analytics Setup
1. **Google Analytics** entegrasyonu
2. **Vercel Analytics** aktif edin
3. **Performance monitoring** ayarlayın

### Backup Strategy
1. **MongoDB Atlas** otomatik backup
2. **Vercel** deployment history
3. **GitHub** source code backup

## 🚀 12. Production Checklist

### Pre-Launch
- [ ] Environment variables set
- [ ] Database connection tested
- [ ] Admin user created
- [ ] SSL certificate active
- [ ] Security headers configured
- [ ] Performance optimized
- [ ] SEO meta tags added
- [ ] Analytics configured
- [ ] Error monitoring setup
- [ ] Backup strategy implemented

### Post-Launch
- [ ] Domain DNS propagated
- [ ] Search engines indexed
- [ ] Performance metrics baseline
- [ ] Security scan completed
- [ ] User acceptance testing
- [ ] Documentation updated
- [ ] Team access configured
- [ ] Monitoring alerts setup

## 📞 Support

### Resources
- **Documentation**: [Next.js Docs](https://nextjs.org/docs)
- **Vercel Support**: [Vercel Docs](https://vercel.com/docs)
- **MongoDB Atlas**: [Atlas Docs](https://docs.atlas.mongodb.com/)

### Contact
- **Email**: erdem.erciyas@gmail.com
- **GitHub Issues**: [Create Issue](https://github.com/erdemerciyas/personal-blog/issues)
- **Vercel Support**: [Support Portal](https://vercel.com/support)

---

🎉 **Tebrikler!** Personal Blog Platform'unuz başarıyla deploy edildi!

**Live URL**: https://your-domain.vercel.app  
**Admin Panel**: https://your-domain.vercel.app/admin  
**Status**: https://your-domain.vercel.app/api/health