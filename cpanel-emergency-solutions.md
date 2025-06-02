# cPanel Acil Durum Çözümleri - Kritik Hatalar

## 🚨 Devam Eden Hatalar

### Hata 1: Memory Yetersiz
```
RangeError: WebAssembly.instantiate(): Out of memory
```

### Hata 2: Build Bulunamıyor
```
Error: Could not find a production build in the '.next' directory
```

## 🔍 Sorun Analizi

### Neden hâlâ hata alıyorsunuz?

1. **Memory Limiti**: Hosting planınız Next.js için yetersiz (512MB altı)
2. **File Path**: .next klasörü yanlış dizinde olabilir
3. **Upload Sorunu**: .next içeriği eksik/bozuk
4. **CloudLinux Kısıtları**: cPanel ortamı Next.js'i desteklemiyor olabilir

## ⚡ Acil Çözüm 1: Vercel Deployment (5 dakika)

### Next.js'in Doğal Platformu - ÜCRETSIZ

```bash
# 1. Vercel CLI yükle
npm install -g vercel

# 2. Deploy et
vercel

# 3. Domain bağla (isteğe bağlı)
vercel --prod
```

### Vercel Avantajları:
- ✅ Next.js için optimize
- ✅ Unlimited memory
- ✅ MongoDB Atlas ile perfect
- ✅ SSL otomatik
- ✅ CDN dahil
- ✅ Ücretsiz plan

## ⚡ Acil Çözüm 2: Netlify (Alternatif)

```bash
# 1. Build et
npm run build
npm run export  # Static export

# 2. Netlify'da drag-drop deploy
# netlify.com → Sites → Deploy from folder
```

## ⚡ Acil Çözüm 3: Railway (Backend-friendly)

```bash
# 1. Railway CLI
npm install -g @railway/cli

# 2. Deploy
railway login
railway init
railway up
```

## 🔧 cPanel Son Deneme (30 dakika)

### Debug: .next Klasörü Kontrolü

#### Step 1: cPanel File Manager'da kontrol edin:
```
/public_html/app/     # Application root
├── .next/           # ← Bu klasör tam burada olmalı
│   ├── server/      # ← Bu alt klasörler var mı?
│   ├── static/
│   ├── BUILD_ID     # ← Bu dosya var mı?
│   └── package.json
├── app.js
├── package.json
└── src/
```

#### Step 2: .next İçeriği Kontrolü
.next klasöründe olması gerekenler:
- ✅ `BUILD_ID` dosyası (1 line text)
- ✅ `server/` klasörü (compiled code)
- ✅ `static/` klasörü (assets)
- ✅ `package.json` (dependencies info)

### Debug: Memory Limit Kontrolü

#### Hosting Plan Memory Limit:
1. cPanel → **Statistics** → **Memory Usage**
2. Limit 256MB altındaysa Next.js çalışmaz
3. En az 512MB gerekli

#### Test: Static Export (Fallback)

Eğer dynamic features'ları kapatıp static site yapmak isterseniz:

`next.config.js` güncellemesi:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Dynamic features'ları kapat
  experimental: {
    appDir: false
  }
}

module.exports = nextConfig
```

Build:
```bash
npm run build
# out/ klasörü oluşur, bunu upload edin
```

## 📞 Hosting Desteği Acil Mesaj

```
Konu: URGENT - Next.js Memory Allocation Error

Hi Support Team,

I'm deploying a Next.js 14 application and getting these critical errors:

1. "WebAssembly.instantiate(): Out of memory"
2. "Could not find a production build in the '.next' directory"

Technical Details:
- Framework: Next.js 14 
- Node.js version: 18+
- Required Memory: 512MB minimum
- Current memory limit: [Check cPanel stats]

Questions:
1. What is my current memory limit?
2. Can it be increased to 512MB+?
3. Does your CloudLinux support Next.js applications?
4. If not, can you recommend alternatives?

This is time-sensitive. Please prioritize this ticket.

Best regards,
[Your name]
```

## 💡 Gerçekçi Değerlendirme

### cPanel Shared Hosting Sınırları:
- 🔴 Memory: Genellikle 128-256MB (yetersiz)
- 🔴 CPU: Sınırlı
- 🔴 Execution time: Kısıtlı
- 🔴 WebAssembly: Desteklemeyebilir

### Next.js Gereksinimleri:
- ✅ Memory: 512MB+ 
- ✅ Modern Node.js
- ✅ WebAssembly support
- ✅ Long-running processes

## 🎯 Tavsiye Edilen Çözüm Sırası

### 1. ⚡ Vercel (Hemen, 5 dakika)
```bash
npx vercel
```
- En hızlı ve güvenilir
- Next.js'in kendi platformu
- Ücretsiz plan yeterli

### 2. 🔄 Hosting Upgrade
- VPS hosting
- Dedicated server
- Cloud hosting (AWS, DigitalOcean)

### 3. 📞 Hosting Desteği
- Memory limit increase
- Plan upgrade seçenekleri

### 4. 🏠 cPanel Son Deneme
- Static export
- Memory optimization
- Alternative configuration

## ⏰ Zaman Çizelgesi

### Hemen (0-10 dakika):
- **Vercel deployment** dene
- En hızlı çözüm

### Kısa vadeli (1-24 saat):
- Hosting desteği ile iletişim
- Memory limit artırımı

### Uzun vadeli (1-7 gün):
- Hosting migration
- VPS veya cloud çözüm

---

**🚨 Acil Öneri**: Vercel ile deploy edin. cPanel shared hosting bu proje için yetersiz görünüyor.

**💰 Maliyet**: Vercel free tier kullanım limitiniz için yeterli olacak.** 