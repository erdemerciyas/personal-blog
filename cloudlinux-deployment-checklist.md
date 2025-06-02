# CloudLinux cPanel Deployment Checklist

## ✅ Build Başarılı!

Projeniz CloudLinux deployment için hazır. Bu checklist'i takip edin:

## 📦 Upload Edilecek Dosyalar

### ✅ Kesinlikle Upload Edin:
- [ ] `app.js` - Ana server dosyası
- [ ] `package.json` - Dependencies
- [ ] `.next/` klasörü - Build çıktısı
- [ ] `src/` klasörü - Kaynak kodlar
- [ ] `public/` klasörü - Statik dosyalar
- [ ] `next.config.js` - Next.js config
- [ ] `.htaccess` - Apache config

### ❌ Kesinlikle Upload Etmeyin:
- [ ] `node_modules/` klasörü (**ÖNEMLİ!**)
- [ ] `.env.local` dosyası
- [ ] `.git/` klasörü
- [ ] `README.md` gibi development dosyaları

## 🚀 CloudLinux cPanel Deployment Adımları

### Adım 1: cPanel File Manager
1. cPanel'e giriş yapın
2. **File Manager** açın
3. Application directory oluşturun (örn: `blog/`)
4. Yukarıdaki dosyaları upload edin

### Adım 2: CloudLinux NodeJS Setup
1. cPanel'de **NodeJS** bölümüne gidin
2. **Create Application** tıklayın
3. Ayarları yapın:
   ```
   Node.js version: 18.x veya 20.x
   Application mode: Production
   Application root: blog (subdirectory adı)
   Application startup file: app.js
   Application URL: yourdomain.com veya subdomain
   ```

### Adım 3: Environment Variables
CloudLinux NodeJS panel'de **Environment Variables** ekleyin:
```
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blogdb
NEXTAUTH_SECRET=your-secret-key-32-characters-min
PORT=3000
HOSTNAME=0.0.0.0
```

### Adım 4: Dependencies Installation
1. CloudLinux panel'de **Package.json** import edin
2. **Run NPM Install** butonuna basın
3. CloudLinux otomatik olarak virtual environment oluşturacak
4. `node_modules` symlink otomatik oluşacak

### Adım 5: Application Start
1. **Start App** butonuna basın
2. Status **Running** olana kadar bekleyin
3. **Logs** kısmından hataları kontrol edin

## 🔍 Troubleshooting

### node_modules Hatası Alırsanız:
```bash
# SSH erişimi varsa
cd /public_html/blog
rm -rf node_modules
# CloudLinux panel'den tekrar NPM Install
```

### MongoDB Bağlantı Sorunu:
1. MongoDB Atlas IP whitelist: `0.0.0.0/0`
2. Connection string doğru format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname
   ```

### Port Sorunu:
- CloudLinux otomatik port atar
- `process.env.PORT` kullanın
- Hosting desteği ile iletişime geçin

## 📋 Deployment Sonrası Test

### ✅ Test Edilecekler:
- [ ] Ana sayfa yükleniyor: `https://yourdomain.com`
- [ ] API endpoints çalışıyor: `/api/slider`
- [ ] Admin panel erişimi: `/admin/login`
- [ ] MongoDB bağlantısı aktif
- [ ] Image upload çalışıyor
- [ ] Form submissions çalışıyor

### 🐛 Yaygın Sorunlar:

#### 1. "Application not running"
- Environment variables kontrol edin
- Logs'ta hata mesajlarına bakın
- Memory/CPU limitleri kontrol edin

#### 2. "Database connection failed"
- MongoDB Atlas IP whitelist
- Connection string format
- Network firewall ayarları

#### 3. "File not found errors"
- File permissions (755)
- Path case sensitivity
- Upload completion kontrolü

## 📞 Hosting Desteği

Sorun devam ederse hosting desteği ile iletişim:

```
Konu: CloudLinux NodeJS Deployment Sorunu
Detay: 
- Next.js 14 uygulaması deploy ediyorum
- CloudLinux NodeJS Selector kullanıyorum
- node_modules virtual environment sorunu yaşıyorum
- Lütfen yardım edebilir misiniz?
```

## 🎯 Success Indicators

Deployment başarılı olduğunda:
- ✅ Application status: **Running**
- ✅ Website erişilebilir
- ✅ Admin panel çalışıyor
- ✅ Database operations aktif
- ✅ No console errors

## 🚀 Performance Optimization

Deployment sonrası optimizasyonlar:
1. **CDN** kurulumu (Cloudflare)
2. **Image optimization** aktif
3. **Gzip compression** enabled
4. **Cache headers** configured
5. **SSL certificate** active

---

**💡 İpucu**: İlk deployment 10-15 dakika sürebilir. Sabırlı olun ve logs'ı takip edin! 