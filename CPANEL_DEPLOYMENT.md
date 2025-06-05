# 🚀 cPanel Deployment Guide

Bu rehber Next.js TypeScript projenizi cPanel'de nasıl deploy edeceğinizi gösterir.

## ⚡ **Hızlı Deployment**

### 1. **Build Alma**
```bash
# Lokal bilgisayarınızda
npm run cpanel-build
```

### 2. **Upload Edilecek Dosyalar**
```
📁 .next/          (build output)
📁 public/         (static files) 
📁 node_modules/   (dependencies)
📄 package.json
📄 server.js
📄 next.config.js
```

### 3. **cPanel'de Çalıştırma**
```bash
# SSH ile bağlanın
cd public_html  # veya domain klasörünüz
npm install
npm start
```

## 🔧 **Detaylı Kurulum**

### **Gereksinimler**
- ✅ Node.js 18+ (cPanel'de aktif)
- ✅ npm package manager
- ✅ SSH erişimi (önerilen)

### **Adım 1: Lokal Build**
```bash
# Projenizi temizleyin
npm run clean

# Dependencies yükleyin
npm install

# TypeScript build alın
npm run cpanel-build
```

### **Adım 2: Dosya Hazırlama**
Build sonrası aşağıdaki dosyaları upload edin:

#### **Zorunlu Dosyalar:**
```
.next/                 # Build output (tüm içerik)
package.json          # Dependencies listesi
server.js             # Server script
next.config.js        # Next.js config
```

#### **Opsiyonel Dosyalar:**
```
public/               # Static files (resimler, favicon)
node_modules/         # Dependencies (büyük boyut)
```

### **Adım 3: Environment Variables**
cPanel'de environment variables ekleyin:

```bash
# .env dosyası oluşturun
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
MONGODB_URI=your-mongodb-connection-string
```

### **Adım 4: cPanel'de Kurulum**

#### **SSH ile (Önerilen):**
```bash
# Domain klasörüne gidin
cd public_html/yourdomain.com

# Dosyaları upload ettikten sonra
npm install --production

# Sunucuyu başlatın
npm start
```

#### **File Manager ile:**
1. Build dosyalarını zip ile sıkıştırın
2. cPanel File Manager'da upload edin
3. Zip'i extract edin
4. Terminal'den npm install çalıştırın

## 🔧 **Server.js Optimizasyonu**

Mevcut `server.js` dosyanız cPanel için optimize edilmiştir:

```javascript
// Custom server for cPanel hosting
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = process.env.PORT || 3000

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${PORT}`)
  })
})
```

## 🚨 **Sorun Giderme**

### **TypeScript Build Hataları**
```bash
# TypeScript dependency eksikse
npm install typescript @types/node --save

# Build tekrar deneyin
npm run cpanel-build
```

### **Memory Hataları**
```bash
# Memory limit artırın
export NODE_OPTIONS="--max-old-space-size=4096"
npm run cpanel-build
```

### **Port Sorunları**
```bash
# Farklı port deneyin
PORT=3001 npm start
```

### **Permission Sorunları**
```bash
# Dosya izinlerini düzeltin
chmod -R 755 .next/
chmod +x server.js
```

## 📊 **Performance Tips**

### **Build Optimizasyonu**
```bash
# Gzip compression aktif
NODE_ENV=production npm run cpanel-build

# Static export (opsiyonel)
npm run export
```

### **cPanel Ayarları**
1. **Node.js Version**: 18+ seçin
2. **Memory Limit**: En az 512MB
3. **File Permissions**: 755 (klasörler), 644 (dosyalar)

## 🔄 **Update Süreci**

```bash
# 1. Lokal'de yeni build alın
npm run cpanel-build

# 2. Sadece .next klasörünü upload edin
# 3. Server'ı restart edin
npm restart
```

## 🎯 **Alternatif Hosting**

Eğer cPanel'de sorun yaşarsanız:

1. **Vercel** (önerilen): Otomatik deployment
2. **Netlify**: Static export için uygun
3. **Railway**: Node.js hosting
4. **Heroku**: Tam Node.js desteği

## 📞 **Destek**

Sorun yaşarsanız:
1. Build log'larını kontrol edin
2. Browser developer console'u inceleyin  
3. cPanel error logs'una bakın
4. Node.js version'ını kontrol edin

---

**✅ Bu rehberle cPanel'de sorunsuz deployment yapabilirsiniz!** 