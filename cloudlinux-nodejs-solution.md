# CloudLinux NodeJS Selector Sorunu ve Çözümü

## ⚠️ Hata Açıklaması

**Error**: "CloudLinux NodeJS Selector demands to store node modules for application in separate folder (virtual environment) pointed by symlink called 'node_modules'"

### Bu hata neden oluşur?
- CloudLinux hosting ortamları Node.js için özel virtual environment sistemi kullanır
- `node_modules` klasörünün application root'ta olmasını istemez
- Bunun yerine ayrı bir klasörde node_modules oluşturup symlink ile bağlar

## 🔧 Çözümler

### Çözüm 1: CloudLinux Sistemini Kullan (Önerilen)

#### Adım 1: node_modules Klasörünü Sil
cPanel File Manager'da:
1. Application root'taki `node_modules` klasörünü sil
2. Sadece kaynak dosyaları bırak

#### Adım 2: CloudLinux NodeJS Panel Kullan
1. cPanel'de **NodeJS** bölümüne git
2. **Create Application** veya mevcut uygulamayı düzenle
3. Ayarları yap:
   ```
   Node.js version: 18.x
   Application mode: Production
   Application root: your-app-folder
   Application startup file: app.js
   ```

#### Adım 3: Dependencies Yükle
CloudLinux panel'de:
1. **Package.json** import et
2. **Run NPM Install** butonuna bas
3. CloudLinux otomatik olarak virtual environment'ta node_modules oluşturacak

### Çözüm 2: Manuel Symlink (SSH Gerekli)

SSH erişimin varsa:

```bash
# Mevcut node_modules'ı sil
rm -rf node_modules

# CloudLinux virtual env yolunu bul
ls -la /opt/cloudlinux/venv/

# Symlink oluştur (path hosting'e göre değişir)
ln -s /opt/cloudlinux/venv/your-app/node_modules ./node_modules

# Dependencies yükle
npm install
```

### Çözüm 3: Alternative Deployment Structure

#### Yeni Folder Yapısı:
```
/public_html/
├── your-blog/           # Application files
│   ├── app.js
│   ├── package.json
│   ├── .next/
│   ├── src/
│   └── public/
└── node_modules/        # CloudLinux yönetir (symlink)
```

#### package.json Güncellemesi:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "prod": "NODE_ENV=production node app.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 🚀 Deployment Adımları (CloudLinux)

### Adım 1: Dosya Hazırlığı
Upload etmeden önce local'de:
```bash
# node_modules'ı sil
rm -rf node_modules

# Build oluştur
npm install
npm run build

# Sadece gerekli dosyaları upload et
```

### Adım 2: cPanel'e Upload
Şu dosyaları yükle:
- ✅ `app.js`
- ✅ `package.json`
- ✅ `.next/` (build çıktısı)
- ✅ `src/`
- ✅ `public/`
- ✅ `next.config.js`
- ❌ `node_modules/` (YÜKLEME!)

### Adım 3: CloudLinux NodeJS Setup
1. cPanel → **NodeJS**
2. **Create Application**
3. Application root belirle (örn: `blog`)
4. Startup file: `app.js`
5. **Run NPM Install** (CloudLinux otomatik halleder)

### Adım 4: Environment Variables
CloudLinux panel'de environment variables ekle:
```
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
MONGODB_URI=your_mongodb_connection
NEXTAUTH_SECRET=your_secret
```

## 🐛 Troubleshooting

### Hâlâ Hata Alıyorsanız:

#### 1. Hosting Desteği İle İletişim
```
Konu: CloudLinux NodeJS Selector node_modules sorunu
Mesaj: "CloudLinux NodeJS Selector kullanıyorum ama node_modules 
klasörü sorunu yaşıyorum. Virtual environment setup'ı ile 
ilgili yardıma ihtiyacım var."
```

#### 2. Alternative: Subdirectory Deployment
```
/public_html/
├── main-site/          # Ana site
└── blog/              # Node.js app (subdomain)
    ├── app.js
    └── package.json
```

#### 3. Alternative: Different Hosting
CloudLinux sorunları devam ederse:
- **Vercel** (Next.js için ideal)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

## 💡 Best Practices

### 1. .gitignore Güncellemesi:
```gitignore
node_modules/
.next/
.env.local
```

### 2. package.json Optimizasyonu:
```json
{
  "scripts": {
    "build": "next build",
    "start": "NODE_ENV=production node app.js"
  },
  "dependencies": {
    // Production dependencies only
  }
}
```

### 3. Production Build:
```bash
# Local'de build et
npm run build

# Sadece dist files upload et
```

## 🎯 Önerilen Çözüm

**CloudLinux sistemi ile çalış:**
1. ✅ node_modules klasörünü silmek
2. ✅ CloudLinux NodeJS panel kullanmak  
3. ✅ Virtual environment'ı hosting'e bırakmak
4. ✅ Sadece source code upload etmek

Bu yöntem %90 başarılı oluyor ve hosting'in doğal sistemini kullanıyor.

---

**Not**: CloudLinux bu sistemi güvenlik ve kaynak yönetimi için kullanıyor. Sisteme uyum sağlamak en iyi yöntem. 