# cPanel Node.js Deployment Rehberi (Alternatif Yöntem)

## ⚠️ "public_html" Sorunu Çözümü

Eğer cPanel'de "Directory public_html not allowed" hatası alıyorsanız, bu alternatif yöntemi kullanın.

## Çözüm 1: Subdomain ile Deployment

### Adım 1: Subdomain Oluşturun
1. cPanel'de **Subdomains** bölümüne gidin
2. Yeni subdomain oluşturun: `blog.yourdomain.com`
3. Document root otomatik olarak: `/public_html/blog` olacak

### Adım 2: Node.js Uygulaması Ayarları
1. cPanel'de **Node.js** bölümüne gidin
2. **Create Application** tıklayın
3. Ayarları yapın:
   - **Node.js version**: 18.x veya üzeri
   - **Application mode**: Production
   - **Application root**: `blog` (public_html/blog değil, sadece blog)
   - **Application URL**: `blog.yourdomain.com`
   - **Application startup file**: `app.js`

### Adım 3: Dosya Yükleme
Dosyaları `/public_html/blog/` klasörüne yükleyin:
- `app.js`
- `.next/`
- `src/`
- `public/`
- `package.json`
- `next.config.js`

## Çözüm 2: Ana Domain ile Proxy

### app.js'i Güncelleyin (Port-based)
Ana domain'i kullanmak için app.js'i güncelleyelim:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// cPanel genellikle dinamik port atar
const port = parseInt(process.env.PORT || process.env.CPANEL_PORT || '3001', 10)
const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0' // cPanel için gerekli

const app = next({ dev })
const handle = app.getRequestHandler()

console.log(`Starting server on port ${port}...`)

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
  })
})
```

### .htaccess Güncellemesi (Ana Domain için)
`public_html/.htaccess` dosyasını oluşturun:

```apache
RewriteEngine On

# Node.js uygulamasına yönlendir (port dinamik olacak)
RewriteCond %{REQUEST_URI} !^/cgi-bin/
RewriteRule ^(.*)$ http://localhost:PORT_NUMBER/$1 [P,L]

# Alternatif: Subdomain'e yönlendir
# RewriteRule ^(.*)$ http://blog.yourdomain.com/$1 [R=301,L]
```

## Çözüm 3: Manuel Dizin Oluşturma

### Adım 1: Özel Dizin Oluşturun
1. cPanel File Manager'da ana dizinde: `my-blog` klasörü oluşturun
2. Tam yol: `/home/username/my-blog/`

### Adım 2: Node.js Uygulaması
1. **Application root**: `my-blog` 
2. **Application URL**: `yourdomain.com` (veya subdomain)
3. **Startup file**: `app.js`

### Adım 3: Domain Yönlendirme
cPanel'de ana domain'i Node.js uygulamasına yönlendirin.

## Çözüm 4: Hosting Sağlayıcısı Desteği

Eğer yukarıdaki yöntemler çalışmazsa:

1. **Hosting desteği ile iletişime geçin**
2. Node.js uygulaması için **özel setup** isteyin
3. **SSH erişimi** olup olmadığını sorun

## Önerilen Çözüm: Subdomain (Çözüm 1)

En kolay ve güvenilir yöntem **Subdomain** kullanmaktır:

1. ✅ `blog.yourdomain.com` subdomain oluşturun
2. ✅ Application root: `blog` olarak ayarlayın  
3. ✅ Dosyaları `/public_html/blog/` yükleyin
4. ✅ Uygulamayı başlatın

## Environment Variables

Hangi yöntemi seçerseniz seçin, şu environment variables'ları ekleyin:

```
NODE_ENV=production
NEXTAUTH_URL=https://blog.yourdomain.com (veya ana domain)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blogdb
NEXTAUTH_SECRET=super-secret-key-minimum-32-characters
PORT=3001
HOSTNAME=0.0.0.0
```

## Test

Deployment sonrası test edin:
- `https://blog.yourdomain.com` (subdomain kullanıyorsanız)
- Admin panel: `https://blog.yourdomain.com/admin/login`

---

**💡 İpucu**: Çoğu cPanel hosting'de subdomain yöntemi %99 başarılı oluyor! 