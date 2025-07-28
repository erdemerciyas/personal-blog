# 🚀 Vercel Deployment Rehberi

## Ön Hazırlık

### 1. GitHub Repository Hazır ✅
- Kod GitHub'a push edildi
- Tüm dosyalar commit edildi
- README.md güncellendi

### 2. Environment Variables Listesi

Vercel'de aşağıdaki environment variables'ları eklemeniz gerekiyor:

#### 🔐 Zorunlu Variables
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
NEXTAUTH_SECRET=your-super-secret-32-char-key-here
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### 👤 Admin User Settings
```
ADMIN_EMAIL=erdem.erciyas@gmail.com
ADMIN_NAME=Erdem Erciyas
ADMIN_DEFAULT_PASSWORD=SecureAdmin2024!@#
```

#### ☁️ Cloudinary (Opsiyonel)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### 📧 Email (Opsiyonel)
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

## Vercel Deployment Adımları

### 1. Vercel Dashboard'a Giriş
- [vercel.com](https://vercel.com) adresine gidin
- GitHub hesabınızla giriş yapın

### 2. Yeni Proje Oluşturma
1. **"New Project"** butonuna tıklayın
2. **GitHub repository'nizi** seçin (`personal-blog`)
3. **Framework Preset**: Next.js (otomatik algılanır)
4. **Root Directory**: `.` (varsayılan)

### 3. Environment Variables Ekleme
1. **"Environment Variables"** sekmesine gidin
2. Yukarıdaki listedeki tüm variables'ları ekleyin
3. **Production**, **Preview** ve **Development** için aynı değerleri kullanın

### 4. Deploy Etme
1. **"Deploy"** butonuna tıklayın
2. Build process'i izleyin (yaklaşık 2-3 dakika)
3. Deploy tamamlandığında domain'inizi alacaksınız

## MongoDB Atlas Kurulumu (Gerekirse)

### 1. MongoDB Atlas Hesabı
- [mongodb.com/atlas](https://www.mongodb.com/atlas) adresine gidin
- Ücretsiz hesap oluşturun

### 2. Cluster Oluşturma
1. **"Create Cluster"** tıklayın
2. **Free tier** seçin
3. **Region**: Europe (Frankfurt) önerilir
4. Cluster adı: `personal-blog`

### 3. Database User Oluşturma
1. **Database Access** sekmesine gidin
2. **"Add New Database User"** tıklayın
3. Username ve password oluşturun
4. **Built-in Role**: Read and write to any database

### 4. Network Access
1. **Network Access** sekmesine gidin
2. **"Add IP Address"** tıklayın
3. **"Allow Access from Anywhere"** seçin (0.0.0.0/0)

### 5. Connection String
1. **Clusters** sekmesine gidin
2. **"Connect"** butonuna tıklayın
3. **"Connect your application"** seçin
4. Connection string'i kopyalayın
5. `<password>` kısmını gerçek password ile değiştirin

## Cloudinary Kurulumu (Opsiyonel)

### 1. Cloudinary Hesabı
- [cloudinary.com](https://cloudinary.com) adresine gidin
- Ücretsiz hesap oluşturun

### 2. API Keys
1. Dashboard'da **API Keys** bölümünü bulun
2. `Cloud Name`, `API Key`, `API Secret` değerlerini kopyalayın
3. Vercel environment variables'larına ekleyin

## Domain Ayarları

### 1. Custom Domain (Opsiyonel)
1. Vercel project settings'e gidin
2. **"Domains"** sekmesine tıklayın
3. Custom domain'inizi ekleyin
4. DNS ayarlarını yapın

### 2. SSL Certificate
- Vercel otomatik olarak SSL certificate sağlar
- HTTPS otomatik aktif olur

## Post-Deployment Kontroller

### 1. Site Kontrolü
- [ ] Ana sayfa yükleniyor
- [ ] Admin panel erişilebilir (/admin)
- [ ] Database bağlantısı çalışıyor
- [ ] Cloudinary görselleri yükleniyor
- [ ] Portfolyo filtreleme çalışıyor

### 2. Admin Panel Testi
1. `/admin` adresine gidin
2. Default admin bilgileriyle giriş yapın
3. Tüm CRUD işlemlerini test edin

### 3. Performance Testi
- [PageSpeed Insights](https://pagespeed.web.dev/) ile test edin
- [GTmetrix](https://gtmetrix.com/) ile analiz edin

## Troubleshooting

### Build Hatası
```bash
# Local'de test edin
npm run build
```

### Database Bağlantı Hatası
- MongoDB Atlas IP whitelist kontrolü
- Connection string doğruluğu
- Database user permissions

### Environment Variables Hatası
- Vercel dashboard'da variables kontrolü
- Typo kontrolü
- Redeploy gerekebilir

## Güvenlik Kontrolleri

### 1. Environment Variables
- [ ] Tüm secret'lar environment variables'da
- [ ] Production'da debug mode kapalı
- [ ] API keys güvenli

### 2. Database Security
- [ ] Strong password kullanımı
- [ ] Network access kısıtlaması
- [ ] Regular backup

### 3. Application Security
- [ ] Rate limiting aktif
- [ ] CSRF protection aktif
- [ ] XSS prevention aktif
- [ ] Security headers aktif

## Monitoring ve Maintenance

### 1. Vercel Analytics
- Vercel dashboard'da analytics aktif
- Performance metrics takibi

### 2. Error Monitoring
- Vercel Functions logs kontrolü
- Database connection monitoring

### 3. Regular Updates
- Dependencies güncelleme
- Security patches
- Performance optimizations

---

## 🎉 Deployment Tamamlandı!

Tebrikler! Siteniz artık canlıda. Aşağıdaki adımları takip ederek deployment'ınızı tamamlayabilirsiniz:

1. ✅ GitHub'a kod push edildi
2. ⏳ Vercel'de proje oluşturun
3. ⏳ Environment variables ekleyin
4. ⏳ Deploy edin
5. ⏳ Domain ayarlarını yapın
6. ⏳ Post-deployment testleri yapın

**Deployment URL**: https://your-project-name.vercel.app

İyi çalışmalar! 🚀