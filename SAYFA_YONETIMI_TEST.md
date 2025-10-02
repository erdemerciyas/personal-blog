# Sayfa Yönetimi Test Rehberi

## Test Adımları

### 1. Sayfa Listesini Görüntüleme

1. Admin panele giriş yap
2. Sol menüden **İçerik Yönetimi** > **Sayfa Yönetimi** tıkla
3. Sayfa listesi açılmalı

**Beklenen Sonuç:**
- Eğer sayfa yoksa: "Henüz sayfa yok" mesajı ve "İlk Sayfayı Oluştur" butonu görünmeli
- Eğer sayfa varsa: Tüm sayfalar liste halinde görünmeli

### 2. Yeni Sayfa Oluşturma

1. "Yeni Sayfa" veya "İlk Sayfayı Oluştur" butonuna tıkla
2. Formu doldur:
   - **Sayfa Başlığı:** Test Sayfası
   - **Slug:** test-sayfasi (otomatik oluşur)
   - **İçerik:** Bu bir test sayfasıdır
   - **Sayfayı yayınla:** ✓ İşaretle
   - **Navigasyon menüsünde göster:** ✓ İşaretle
   - **Menü Sırası:** 10
3. "Kaydet" butonuna tıkla

**Beklenen Sonuç:**
- "Sayfa başarıyla oluşturuldu!" mesajı görünmeli
- Sayfa listesine yönlendirilmeli
- Yeni sayfa listede görünmeli
- "Yayında" ve "Nav Menüde" badge'leri görünmeli

### 3. Sayfayı Düzenleme

1. Sayfa listesinden bir sayfanın "Düzenle" butonuna tıkla
2. Başlığı değiştir: "Test Sayfası Güncel"
3. "Kaydet" butonuna tıkla

**Beklenen Sonuç:**
- "Sayfa başarıyla güncellendi!" mesajı görünmeli
- Değişiklikler kaydedilmeli

### 4. Nav Menüden Gizleme

1. Bir sayfayı düzenle
2. "Navigasyon menüsünde göster" checkbox'ını kaldır
3. "Kaydet" butonuna tıkla
4. Sayfa listesine dön

**Beklenen Sonuç:**
- "Nav Menüde" badge'i kaybolmalı
- Frontend'de nav menüde sayfa görünmemeli

### 5. Nav Menüde Gösterme

1. Bir sayfayı düzenle
2. "Navigasyon menüsünde göster" checkbox'ını işaretle
3. Menü sırasını belirle (örn: 5)
4. "Kaydet" butonuna tıkla
5. Frontend'e git ve nav menüyü kontrol et

**Beklenen Sonuç:**
- "Nav Menüde" badge'i görünmeli
- Frontend'de nav menüde sayfa görünmeli
- Belirlediğin sıraya göre konumlanmalı

### 6. Sayfayı Silme

1. Bir sayfayı düzenle
2. "Sil" butonuna tıkla
3. Onay dialog'unda "Evet" seç

**Beklenen Sonuç:**
- Sayfa silinmeli
- Sayfa listesine yönlendirilmeli
- Silinen sayfa listede görünmemeli

### 7. Frontend'de Sayfa Görüntüleme

1. Yayında bir sayfa oluştur (slug: test-sayfasi)
2. Browser'da `http://localhost:3000/test-sayfasi` adresine git

**Beklenen Sonuç:**
- Sayfa içeriği görünmeli
- Başlık ve içerik doğru şekilde render edilmeli
- SEO meta tagları doğru olmalı

## Sorun Giderme

### Sayfa Listesi Boş Görünüyor

**Olası Nedenler:**
1. Veritabanında henüz sayfa yok (normal)
2. API endpoint çalışmıyor
3. Authentication sorunu

**Çözüm:**
1. Browser console'u aç (F12)
2. Network tab'ına git
3. `/api/admin/pages` isteğini kontrol et
4. Hata varsa console'da göreceksin

**Console'da görebileceğin mesajlar:**
- `Loaded pages: []` - Veritabanında sayfa yok (normal)
- `Loaded pages: [...]` - Sayfalar başarıyla yüklendi
- `Pages fetch error: ...` - API hatası

### Yeni Sayfa Oluşturulamıyor

**Olası Nedenler:**
1. Slug zaten kullanılıyor
2. Gerekli alanlar doldurulmamış
3. Veritabanı bağlantı sorunu

**Çözüm:**
1. Tüm gerekli alanları doldur (başlık, içerik)
2. Farklı bir slug dene
3. Console'da hata mesajını kontrol et

### Sayfa Nav Menüde Görünmüyor

**Kontrol Listesi:**
- [ ] Sayfa yayında mı? (isPublished: true)
- [ ] "Navigasyon menüsünde göster" işaretli mi?
- [ ] Menü sırası belirlenmiş mi?
- [ ] Sayfa kaydedilmiş mi?
- [ ] Sayfayı yeniledikten sonra kontrol edildi mi? (30 saniye bekle veya sayfayı yenile)

### Dinamik Sayfa 404 Veriyor

**Olası Nedenler:**
1. Sayfa yayında değil
2. Slug yanlış
3. Route dosyası eksik

**Çözüm:**
1. Sayfanın yayında olduğundan emin ol
2. Slug'ı kontrol et (küçük harf, tire ile)
3. `src/app/[slug]/page.tsx` dosyasının var olduğunu kontrol et

## API Endpoints

### GET /api/admin/pages
- Tüm sayfaları listeler
- Admin authentication gerekli
- Response: Array of pages

### POST /api/admin/pages
- Yeni sayfa oluşturur
- Admin authentication gerekli
- Body: Page data

### GET /api/admin/pages/[id]
- Tek sayfa detayı
- Admin authentication gerekli
- Response: Page object

### PUT /api/admin/pages/[id]
- Sayfayı günceller
- Admin authentication gerekli
- Body: Updated page data

### DELETE /api/admin/pages/[id]
- Sayfayı siler
- Admin authentication gerekli
- Response: Success message

### GET /api/pages/navigation
- Nav menüde gösterilecek sayfaları listeler
- Public endpoint
- Response: Array of published pages with showInNavigation: true

## Veritabanı Kontrolü

Eğer MongoDB'ye direkt erişimin varsa:

```javascript
// Tüm sayfaları listele
db.pages.find()

// Yayında ve nav menüde olan sayfalar
db.pages.find({ isPublished: true, showInNavigation: true })

// Sayfa sayısı
db.pages.countDocuments()
```

## Başarı Kriterleri

✅ Sayfa listesi görüntüleniyor
✅ Yeni sayfa oluşturulabiliyor
✅ Sayfa düzenlenebiliyor
✅ Sayfa silinebiliyor
✅ Nav menü kontrolü çalışıyor
✅ Menü sırası değiştirilebiliyor
✅ Dinamik sayfalar frontend'de görünüyor
✅ SEO meta tagları doğru

---

**Not:** İlk kullanımda veritabanında sayfa olmadığı için "Henüz sayfa yok" mesajı görmek normaldir. "İlk Sayfayı Oluştur" butonuna tıklayarak başlayabilirsin.
