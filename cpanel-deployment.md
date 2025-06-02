# cPanel Node.js Deployment Rehberi

Bu rehber, Next.js blog projenizi cPanel'de çalıştırmanız için adım adım talimatlar içerir.

## Ön Gereksinimler

1. **cPanel Node.js desteği** (hosting sağlayıcınızdan onaylayın)
2. **MongoDB Atlas hesabı** (ücretsiz plan yeterli)
3. **Domain name** (cPanel'de tanımlı)

## Adım 1: MongoDB Atlas Kurulumu

1. [MongoDB Atlas](https://mongodb.com/cloud/atlas) hesabı oluşturun
2. Yeni cluster oluşturun (M0 - Free tier)
3. Database Access'ten kullanıcı oluşturun
4. Network Access'ten IP adresi ekleyin (0.0.0.0/0 - herkese açık)
5. Connection string'i kopyalayın

## Adım 2: Proje Hazırlığı

Projeyi build etmek için:

```bash
npm install --legacy-peer-deps
npm run build
```

## Adım 3: cPanel'e Dosya Yükleme

1. cPanel File Manager'ı açın
2. `public_html` klasörüne gidin
3. Aşağıdaki dosya ve klasörleri yükleyin:
   - `.next/` (build çıktısı)
   - `public/`
   - `src/`
   - `node_modules/` (veya cPanel'de npm install çalıştırın)
   - `package.json`
   - `next.config.js`
   - `app.js` ⭐ (Ana giriş dosyası)
   - `.htaccess`

## Adım 4: Environment Variables Ayarları

1. cPanel'de **Node.js** bölümüne gidin
2. Uygulamayı oluşturun/düzenleyin
3. Environment Variables kısmına şunları ekleyin:

```
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blogdb
NEXTAUTH_SECRET=super-secret-key-minimum-32-characters
PORT=3000
HOSTNAME=yourdomain.com
```

## Adım 5: cPanel Node.js Uygulaması Kurulumu

1. cPanel'de **Node.js** menüsüne gidin
2. **Create Application** tıklayın
3. Ayarları yapın:
   - **Node.js version**: 18.x veya üzeri
   - **Application mode**: Production
   - **Application root**: public_html
   - **Application URL**: yourdomain.com
   - **Application startup file**: app.js ⭐

## Adım 6: Paket Yükleme

Terminal'de (cPanel terminal veya SSH):

```bash
cd public_html
npm install --production --legacy-peer-deps
```

## Adım 7: Uygulamayı Başlatma

1. cPanel Node.js panelinde **Start App** tıklayın
2. Uygulama durumunu kontrol edin
3. Hata varsa **Logs** kısmından kontrol edin

## Adım 8: Domain Ayarları

1. cPanel'de **Subdomains** veya **Addon Domains** ayarlayın
2. DNS ayarlarını Node.js uygulamanıza yönlendirin

## cPanel Yükleme Kontrol Listesi

### 📁 Yüklenecek Dosyalar:
- [ ] `.next/` klasörü (build çıktısı)
- [ ] `public/` klasörü
- [ ] `src/` klasörü  
- [ ] `package.json`
- [ ] `next.config.js`
- [ ] `app.js` ⭐
- [ ] `.htaccess`

### ⚙️ cPanel Ayarları:
- [ ] Node.js uygulaması oluşturuldu
- [ ] Startup file: `app.js` 
- [ ] Environment variables eklendi
- [ ] Packages yüklendi (`npm install`)
- [ ] Uygulama başlatıldı

## Sorun Giderme

### Yaygın Hatalar:

1. **Port sorunu**: cPanel otomatik port atar, 3000 portu değişebilir
2. **Environment variables**: Doğru tanımlandığından emin olun
3. **File permissions**: 755 olarak ayarlayın
4. **MongoDB connection**: IP whitelist kontrolü yapın
5. **Module errors**: `npm install --legacy-peer-deps` kullanın

### Performans İyileştirmeleri:

1. `next.config.js`'de image optimization ayarları
2. CDN kullanımı (Cloudflare gibi)
3. Gzip compression aktif
4. Cache headers ayarları

## Güvenlik Ayarları

1. Environment variables'ı güvenli tutun
2. HTTPS kullanın
3. Database erişimini sınırlayın
4. Regular backups alın

## Başarılı Deployment Kontrolü

Site açıldıktan sonra kontrol edin:
- [ ] Ana sayfa yüklenme
- [ ] Admin panel erişimi (/admin/login)
- [ ] Database bağlantısı
- [ ] Image upload
- [ ] Blog post oluşturma

## Destek

Herhangi bir sorun yaşarsanız:
1. cPanel error logs kontrolü
2. Browser developer tools console
3. Network tab ile API istekleri kontrolü

## Hızlı Test

Local'de test etmek için:
```bash
NODE_ENV=production node app.js
```

---

**Not**: Bu proje modern Next.js 14 App Router kullanıyor. Hosting sağlayıcınızın Node.js 18+ desteği olduğundan emin olun. 