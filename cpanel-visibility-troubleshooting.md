# cPanel Uygulama Çalışıyor Ama Görünmüyor - Troubleshooting

## ✅ Durum: Sistem Çalışıyor, Web'de Görünmüyor

Bu yaygın bir CloudLinux/cPanel sorunu. Adım adım çözüm:

## 🔍 1. CloudLinux NodeJS Panel Kontrolü

### cPanel → NodeJS'te kontrol edin:
- [ ] **Application Status**: Running ✅
- [ ] **Application URL**: Doğru domain yazıyor mu?
- [ ] **Port**: Hangi port atanmış? (örn: 3000, 3001)
- [ ] **Logs**: Hata mesajı var mı?

### Application URL örnekleri:
```
✅ Doğru: yourdomain.com
✅ Doğru: blog.yourdomain.com  
❌ Yanlış: yourdomain.com:3000
❌ Yanlış: localhost:3000
```

## 🌐 2. Domain/URL Ayarları

### Subdomain kullanıyorsanız:
1. cPanel → **Subdomains** kontrol edin
2. `blog.yourdomain.com` → `/public_html/blog` yönlendirmesi var mı?
3. DNS propagation tamamlandı mı? (2-24 saat sürebilir)

### Ana domain kullanıyorsanız:
1. cPanel → **Main Domain** ayarları
2. Document root doğru mu?

## 🔧 3. Port ve Proxy Sorunu

### CloudLinux otomatik port atar, kontrol edin:

#### Yöntem A: cPanel Logs
1. cPanel → **NodeJS** → **Logs**
2. Şu satırı arayın:
   ```
   > Ready on http://0.0.0.0:PORT_NUMBER
   ```

#### Yöntem B: .htaccess Proxy (Ana domain için)
`public_html/.htaccess` dosyası oluşturun:
```apache
RewriteEngine On

# Node.js uygulamasına proxy
RewriteCond %{REQUEST_URI} !^/cgi-bin/
RewriteRule ^(.*)$ http://localhost:PORT_NUMBER/$1 [P,L]

# PORT_NUMBER'ı gerçek port ile değiştirin (örn: 3001)
```

## 🛠️ 4. Next.js Yapılandırması

### next.config.js güncellemesi:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // cPanel için base path (eğer subdirectory'de ise)
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Asset prefix (CDN veya subdomain için)
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Output standalone (cPanel için önerilen)
  output: 'standalone',
  
  // Environment variables
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  
  // Images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  }
}

module.exports = nextConfig
```

### app.js güncellemesi:
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const port = parseInt(process.env.PORT || '3001', 10)
const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'

// cPanel için özel ayarlar
const app = next({ 
  dev,
  conf: {
    // Custom server için
    serverRuntimeConfig: {
      port: port
    }
  }
})
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Host header kontrolü (cPanel için önemli)
      const host = req.headers.host
      console.log(`Request from: ${host}${req.url}`)
      
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
    console.log(`> Environment: ${process.env.NODE_ENV}`)
    console.log(`> NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`)
  })
})
```

## 🔍 5. DNS ve SSL Kontrolü

### DNS Kontrolü:
```bash
# Online DNS checker kullanın:
# https://dnschecker.org/
# Domain: yourdomain.com veya blog.yourdomain.com
```

### SSL Sertifikası:
1. cPanel → **SSL/TLS** → **Manage SSL Sites**
2. Domain için SSL aktif mi?
3. `https://` ile erişim deneyin

## 🚨 6. Yaygın Sorunlar ve Çözümleri

### Sorun 1: "Site can't be reached"
**Çözüm:**
- DNS propagation bekleyin (2-24 saat)
- Hosting desteği ile DNS ayarlarını kontrol edin

### Sorun 2: "502 Bad Gateway"
**Çözüm:**
- CloudLinux NodeJS'te application restart
- Port yönlendirmesi kontrol edin
- .htaccess proxy ayarları

### Sorun 3: "404 Not Found"
**Çözüm:**
- Document root doğru ayarlanmış mı?
- File permissions: 755
- .htaccess dosyası var mı?

### Sorun 4: Assets yüklenmiyor (CSS/JS)
**Çözüm:**
- next.config.js'de assetPrefix ayarı
- CORS headers
- CDN ayarları

## 📞 7. Hosting Desteği İçin Mesaj

Sorun devam ederse:

```
Konu: Node.js Uygulaması Çalışıyor Ama Web'de Görünmüyor

Detay:
- CloudLinux NodeJS Selector kullanıyorum
- Application status: Running
- Port: [Port numaranız]
- Domain: [yourdomain.com]
- Next.js 14 uygulaması
- Log'larda hata yok ama web'de erişemiyorum

Lütfen şu kontrolleri yapabilir misiniz:
1. DNS yönlendirmesi doğru mu?
2. Port proxy çalışıyor mu?
3. Document root ayarları doğru mu?
```

## 🎯 8. Hızlı Test Adımları

### Test URL'leri deneyin:
```
1. http://yourdomain.com
2. https://yourdomain.com  
3. http://yourdomain.com:PORT_NUMBER (eğer port biliyorsanız)
4. https://blog.yourdomain.com (subdomain varsa)
```

### Browser Developer Tools:
1. F12 → **Network** tab
2. Sayfayı yenileyin
3. HTTP status codes kontrol edin:
   - 200: OK ✅
   - 404: Not Found ❌
   - 502: Bad Gateway ❌
   - 503: Service Unavailable ❌

## 📋 9. Deployment Sonrası Checklist

- [ ] CloudLinux NodeJS: Application Running
- [ ] Domain DNS ayarları yapıldı
- [ ] SSL sertifikası aktif
- [ ] .htaccess proxy ayarları (ana domain için)
- [ ] File permissions: 755
- [ ] Environment variables set
- [ ] Logs'ta hata yok

---

**💡 En yaygın sebep**: DNS propagation henüz tamamlanmamış veya port proxy ayarları eksik. 2-24 saat bekleyin veya hosting desteği ile iletişime geçin. 