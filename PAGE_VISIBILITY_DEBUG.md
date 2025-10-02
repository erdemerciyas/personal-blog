# Sayfa Görünürlük Debug Rehberi

**Tarih:** 2 Ekim 2025  
**Status:** 🔍 DEBUG MODE

## Sorun

Sayfa "Aktif" ama "Gizli" durumunda. "Gizli" badge'ine tıkladığında nav menüde görünmüyor.

## Debug Adımları

### 1. Browser Console'u Aç

1. F12 tuşuna bas
2. "Console" tab'ına git
3. Console'u temizle (Clear console)

### 2. Badge'e Tıkla

1. "Gizli" badge'ine tıkla
2. Console'da şu mesajları göreceksin:

**Başarılı Durum:**
```javascript
Toggling visibility for [Sayfa Adı]: false → true
Dynamic page visibility updated successfully
Loaded pages (sorted by order): [...]
Pages reloaded and navigation updated
Nav menu order: [...]
```

**Hatalı Durum:**
```javascript
Toggling visibility for [Sayfa Adı]: false → true
Toggle visibility error: [Hata mesajı]
```

### 3. Hata Mesajlarını Kontrol Et

#### Hata 1: "Yetkisiz erişim"
```
Error: Yetkisiz erişim
```

**Çözüm:**
- Oturumun açık olduğundan emin ol
- Admin olarak giriş yaptığını kontrol et
- Sayfayı yenile ve tekrar dene

#### Hata 2: "Sayfa bulunamadı"
```
Error: Sayfa bulunamadı
```

**Çözüm:**
- Sayfa ID'sinin doğru olduğunu kontrol et
- Veritabanında sayfa var mı kontrol et
- Sayfayı yeniden oluştur

#### Hata 3: Network Error
```
TypeError: Failed to fetch
```

**Çözüm:**
- API endpoint'inin çalıştığını kontrol et
- Network tab'ında isteği kontrol et
- Server'ın çalıştığından emin ol

### 4. Network Tab'ını Kontrol Et

1. F12 > Network tab
2. "Gizli" badge'ine tıkla
3. İsteği bul:
   - Statik sayfa: `POST /api/admin/page-settings`
   - Dinamik sayfa: `PUT /api/admin/pages/[id]`

**Başarılı İstek:**
```
Status: 200 OK
Response: { ... }
```

**Başarısız İstek:**
```
Status: 401 Unauthorized
Response: { error: "Yetkisiz erişim" }
```

veya

```
Status: 500 Internal Server Error
Response: { error: "..." }
```

### 5. Veritabanını Kontrol Et

MongoDB'de sayfayı kontrol et:

```javascript
// MongoDB shell veya Compass
db.pages.findOne({ slug: "sayfa-slug" })
```

**Kontrol Et:**
- `isPublished`: true olmalı
- `showInNavigation`: true olmalı (nav menüde görmek için)
- `order`: Sayı olmalı (0, 1, 2, 3...)

## Test Senaryoları

### ✅ Senaryo 1: Yeni Sayfa Oluştur ve Nav Menüye Ekle

**Adımlar:**
1. Console'u aç
2. "Yeni Sayfa" butonuna tıkla
3. Form doldur:
   - Başlık: "Test Sayfası"
   - İçerik: "Test içeriği"
   - ✓ Sayfayı yayınla
   - ✓ Navigasyon menüsünde göster
   - Menü Sırası: 10
4. "Kaydet" butonuna tıkla
5. Console'da mesajları kontrol et

**Beklenen Console Çıktısı:**
```javascript
// Sayfa oluşturuldu
Loaded pages (sorted by order): [
  ...
  { title: 'Test Sayfası', order: 10, type: 'dynamic' }
]

// Nav menü güncellendi
Nav menu order: [
  ...
  { label: 'Test Sayfası', order: 10, type: 'dynamic' }
]
```

**Frontend Kontrolü:**
1. Ana sayfaya git
2. Nav menüyü kontrol et
3. ✅ "Test Sayfası" görünmeli

### ✅ Senaryo 2: Mevcut Sayfayı Nav Menüye Ekle

**Adımlar:**
1. Console'u aç
2. Sayfa listesinde "Gizli" badge'li bir sayfa bul
3. "Gizli" badge'ine tıkla
4. Console'da mesajları kontrol et

**Beklenen Console Çıktısı:**
```javascript
Toggling visibility for Test Sayfası: false → true
Dynamic page visibility updated successfully
Loaded pages (sorted by order): [...]
Pages reloaded and navigation updated
Nav menu order: [...]
```

**Frontend Kontrolü:**
1. Ana sayfaya git (veya sayfayı yenile)
2. Nav menüyü kontrol et
3. ✅ Sayfa görünmeli

### ✅ Senaryo 3: Sayfayı Nav Menüden Gizle

**Adımlar:**
1. Console'u aç
2. "Nav Menüde" badge'li bir sayfa bul
3. "Nav Menüde" badge'ine tıkla
4. Console'da mesajları kontrol et

**Beklenen Console Çıktısı:**
```javascript
Toggling visibility for Test Sayfası: true → false
Dynamic page visibility updated successfully
Loaded pages (sorted by order): [...]
Pages reloaded and navigation updated
Nav menu order: [...]
```

**Frontend Kontrolü:**
1. Ana sayfaya git (veya sayfayı yenile)
2. Nav menüyü kontrol et
3. ✅ Sayfa görünmemeli

## Yaygın Sorunlar ve Çözümleri

### Sorun 1: Badge'e Tıklıyorum Ama Değişmiyor

**Olası Nedenler:**
- API hatası
- Oturum süresi dolmuş
- Veritabanı bağlantı sorunu

**Çözüm:**
1. Console'da hata mesajını kontrol et
2. Network tab'ında isteği kontrol et
3. Sayfayı yenile ve tekrar dene
4. Gerekirse çıkış yap ve tekrar giriş yap

### Sorun 2: Badge Değişiyor Ama Nav Menüde Görünmüyor

**Olası Nedenler:**
- Cache sorunu
- Nav menü yenilenmemiş
- `pageSettingsChanged` eventi tetiklenmemiş

**Çözüm:**
1. Sayfayı yenile (F5 veya Ctrl+R)
2. Hard refresh yap (Ctrl+Shift+R)
3. Console'da "Nav menu order" logunu kontrol et
4. 30 saniye bekle (otomatik yenileme)

### Sorun 3: Sayfa Yayında Ama 404 Veriyor

**Olası Nedenler:**
- Slug yanlış
- Route dosyası eksik
- Sayfa gerçekten yayında değil

**Çözüm:**
1. Slug'ı kontrol et (küçük harf, tire ile)
2. `src/app/[slug]/page.tsx` dosyasının var olduğunu kontrol et
3. Veritabanında `isPublished: true` olduğunu kontrol et
4. Server'ı yeniden başlat

## API Endpoint Testleri

### Test 1: Sayfa Görünürlüğünü Değiştir (Dinamik Sayfa)

**Request:**
```bash
curl -X PUT http://localhost:3000/api/admin/pages/[PAGE_ID] \
  -H "Content-Type: application/json" \
  -d '{"showInNavigation": true}'
```

**Beklenen Response:**
```json
{
  "_id": "...",
  "title": "Test Sayfası",
  "slug": "test-sayfasi",
  "isPublished": true,
  "showInNavigation": true,
  "order": 10,
  ...
}
```

### Test 2: Sayfa Görünürlüğünü Değiştir (Statik Sayfa)

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin/page-settings \
  -H "Content-Type: application/json" \
  -d '{"pageId": "about", "showInNavigation": true}'
```

**Beklenen Response:**
```json
{
  "pageId": "about",
  "title": "Hakkımda",
  "path": "/about",
  "isActive": true,
  "showInNavigation": true,
  "order": 1,
  ...
}
```

## Sonuç

✅ **Debug logları eklendi!**

**Artık görebilirsin:**
- Badge'e tıklandığında ne oluyor
- API isteği başarılı mı
- Sayfalar yeniden yükleniyor mu
- Nav menü güncelleniyor mu

**Sorun devam ederse:**
1. Console'daki hata mesajını paylaş
2. Network tab'ındaki isteği paylaş
3. Veritabanındaki sayfa verisini paylaş

---

**Hazırlayan:** Kiro AI  
**Tarih:** 2 Ekim 2025  
**Status:** 🔍 DEBUG MODE ACTIVE

## Hızlı Test

1. F12 > Console
2. "Gizli" badge'ine tıkla
3. Console'da mesajları oku
4. Hata varsa paylaş!
