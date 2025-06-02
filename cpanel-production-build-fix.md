# cPanel Production Build ve Memory Sorunu - Acil Çözüm

## 🚨 Kritik Hatalar

### Hata 1: Memory Sorunu
```
RangeError: WebAssembly.instantiate(): Out of memory: Cannot allocate Wasm memory for new instance
```

### Hata 2: Build Eksik
```
Error: Could not find a production build in the '.next' directory
```

## ✅ Acil Çözüm Adımları

### 1. 🔴 .next Klasörü Eksik

#### Sorun: 
`.next` klasörü upload edilmemiş veya build yapılmamış

#### Çözüm A: Local'den Upload (Hızlı)
1. **Local'de build edin:**
```bash
npm run build
```

2. **cPanel File Manager'a upload edin:**
   - ✅ `.next` klasörünü tamamen upload edin
   - ✅ File permissions: 755
   - ✅ Tüm subfolders dahil

#### Çözüm B: cPanel'de Build (SSH gerekli)
SSH erişiminiz varsa:
```bash
cd /public_html/blog  # Application root
npm run build
```

### 2. 🔴 Memory Sorunu

#### CloudLinux Memory Limiti
- Hosting plan memory limiti düşük olabilir
- WebAssembly memory allocation sorunu

#### Çözüm A: next.config.js Optimization
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Memory optimization için
  experimental: {
    // Reduce memory usage
    optimizePackageImports: ['@heroicons/react']
  },
  
  // Output configuration
  output: 'standalone',
  
  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Production optimization
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all'
          }
        }
      }
    }
    return config
  },
  
  // Environment variables
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    // Memory optimization
    dangerouslyAllowSVG: false,
    formats: ['image/webp']
  }
}

module.exports = nextConfig
```

#### Çözüm B: app.js Memory Limits
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// Memory optimization
process.env.NODE_OPTIONS = '--max-old-space-size=512'

const port = parseInt(process.env.PORT || '3001', 10)
const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'

// Next.js with memory optimization
const app = next({ 
  dev,
  conf: {
    // Memory limits
    experimental: {
      workerThreads: false,
      optimizePackageImports: ['@heroicons/react']
    }
  }
})
const handle = app.getRequestHandler()

console.log(`Starting server with memory optimization...`)

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error:', err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })
  .listen(port, hostname, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Memory: ${process.memoryUsage().heapUsed / 1024 / 1024} MB`)
  })
})

// Memory monitoring
setInterval(() => {
  const mem = process.memoryUsage()
  console.log(`Memory usage: ${Math.round(mem.heapUsed / 1024 / 1024)} MB`)
}, 30000)
```

### 3. 🔄 CloudLinux'ta Restart

#### Adım 1: Application Stop
1. cPanel → **NodeJS**
2. **Stop App**

#### Adım 2: Files Upload
1. **Güncellenmiş dosyaları upload edin:**
   - ✅ `next.config.js` (memory optimization)
   - ✅ `app.js` (memory limits)
   - ✅ `.next/` klasörü (production build)

#### Adım 3: Environment Variables
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
NEXTAUTH_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret
```

#### Adım 4: Application Start
1. **Start App**
2. **Logs** kontrol edin

## 🔧 Alternative: Lightweight Build

### package.json Script Ekleme
```json
{
  "scripts": {
    "build:light": "next build && rm -rf .next/cache",
    "start:prod": "NODE_OPTIONS='--max-old-space-size=512' node app.js"
  }
}
```

### Local'de Lightweight Build
```bash
npm run build:light
```

## 📞 Hosting Desteği Mesajı

```
Konu: Node.js Memory Limit ve Build Sorunu

Detay:
- Next.js 14 uygulaması deploy ediyorum
- WebAssembly memory allocation hatası alıyorum
- Memory limit artırılabilir mi?
- Current plan: [Plan adınız]
- Required memory: ~512MB
```

## 🚨 Acil Troubleshooting

### Test 1: .next Klasörü Kontrolü
cPanel File Manager'da kontrol edin:
```
/public_html/blog/.next/
├── server/
├── static/
├── BUILD_ID
└── package.json
```

### Test 2: Memory Usage
CloudLinux logs'ta:
```
> Memory usage: XXX MB
```

### Test 3: Alternative URL Test
```
http://yourdomain.com:PORT  # Direct port access
```

## 💡 Geçici Çözüm

Eğer memory sorunu devam ederse:

### Plan A: Vercel Deployment (Önerilen)
- Next.js için optimize
- Unlimited memory
- Free tier mevcut

### Plan B: Hosting Upgrade
- Memory limit artırımı
- CPU upgrade

### Plan C: Code Optimization
- Bundle size reduction
- Lazy loading
- Image optimization

---

**🎯 Öncelik Sırası:**
1. ✅ `.next` klasörünü upload edin
2. ✅ Memory optimized `app.js` upload edin  
3. ✅ Application restart
4. 📞 Hosting desteği (memory limit)

**⏰ Tahmini Çözüm Süresi:** 15-30 dakika 