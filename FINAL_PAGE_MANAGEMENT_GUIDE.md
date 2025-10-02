# Sayfa Yönetimi - Kullanım Rehberi

**Tarih:** 2 Ekim 2025  
**Status:** ✅ HAZIR

## Hızlı Başlangıç

### Yeni Sayfa Oluşturma

1. **Admin Panel > Sayfalar > Yeni Sayfa**
2. **Form Doldur:**
   - Başlık: "Test Sayfası"
   - İçerik: "Bu bir test sayfasıdır"
3. **Varsayılan Ayarlar:**
   - ✓ Sayfayı yayınla (Aktif)
   - ✓ Navigasyon menüsünde göster (Görünür)
   - Menü Sırası: 999
4. **Kaydet**
5. ✅ Sayfa anında canlıda ve nav menüde!

## Badge Kontrolleri

### 🟢 Aktif/Pasif Badge

**Tıkla → Durumu değiştir**

```
✓ Aktif  → Tıkla → ✗ Pasif
✗ Pasif  → Tıkla → ✓ Aktif
```

**Ne Yapar:**
- **Aktif:** Sayfa sitede görünür (`/{slug}` erişilebilir)
- **Pasif:** Sayfa kapalı (404 döner)

### 👁 Görünür/Gizli Badge

**Tıkla → Nav menü durumunu değiştir**

```
👁 Görünür → Tıkla → 🔒 Gizli
🔒 Gizli   → Tıkla → 👁 Görünür
```

**Ne Yapar:**
- **Görünür:** Nav menüde görünür
- **Gizli:** Nav menüde görünmez (direkt link ile erişilebilir)

## Sorun Giderme

### Sorun: Yeni Sayfa Nav Menüde Görünmüyor

**Kontrol Listesi:**

1. **Console'u Aç (F12)**
   ```javascript
   // Şunları görmeli sin:
   Loaded pages (sorted by order): [...]
   Nav menu order: [...]
   ```

2. **Badge Durumlarını Kontrol Et**
   - ✓ Aktif olmalı
   - 👁 Görünür olmalı

3. **Sayfayı Yenile**
   - Frontend'i yenile (F5)
   - 30 saniye bekle (otomatik yenileme)

4. **Console'da Hata Var mı?**
   ```javascript
   // Hata varsa göreceksin:
   Toggle visibility error: [mesaj]
   ```

### Sorun: Badge'e Tıklıyorum Ama Değişmiyor

**Adımlar:**

1. **Console'da "clicked!" Mesajını Gör**
   ```javascript
   Visibility badge clicked!
   Toggling visibility for Test: false → true
   ```

2. **Eğer Görmüyorsan:**
   - Sayfayı yenile (Ctrl+R)
   - Cache'i temizle (Ctrl+Shift+R)
   - Browser'ı yeniden başlat

3. **Eğer Görüyorsan Ama Badge Değişmiyorsa:**
   - Network tab'ını kontrol et
   - API isteği başarılı mı? (200 OK)
   - Hata mesajı var mı?

### Sorun: Sayfa 404 Veriyor

**Kontrol Et:**

1. **Badge "Aktif" mi?**
   - Hayır → Badge'e tıkla, aktif yap

2. **Slug Doğru mu?**
   - Küçük harf olmalı
   - Tire ile ayrılmış olmalı
   - Örnek: `test-sayfasi`

3. **Route Dosyası Var mı?**
   - `src/app/[slug]/page.tsx` olmalı

## Console Debug

### Başarılı Sayfa Oluşturma

```javascript
// 1. Sayfa kaydedildi
POST /api/admin/pages → 201 Created

// 2. Sayfalar yüklendi
Loaded pages (sorted by order): [
  { title: 'Ana Sayfa', order: 0, type: 'static' },
  { title: 'Test Sayfası', order: 999, type: 'dynamic' }
]

// 3. Nav menü güncellendi
Nav menu order: [
  { label: 'Anasayfa', order: 0, type: 'static' },
  { label: 'Test Sayfası', order: 999, type: 'dynamic' }
]
```

### Başarılı Badge Toggle

```javascript
// 1. Badge tıklandı
Visibility badge clicked!

// 2. API isteği
Toggling visibility for Test Sayfası: false → true
PUT /api/admin/pages/[id] → 200 OK

// 3. Sayfa güncellendi
Dynamic page visibility updated successfully

// 4. Sayfalar yeniden yüklendi
Loaded pages (sorted by order): [...]
Pages reloaded and navigation updated

// 5. Nav menü güncellendi
Nav menu order: [...]
```

## Varsayılan Ayarlar

### Yeni Sayfa

```typescript
{
  isPublished: true,        // ✓ Aktif
  showInNavigation: true,   // 👁 Görünür
  order: 999                // En sonda
}
```

**Sonuç:**
- ✅ Sayfa anında canlıda
- ✅ Nav menüde görünür
- ✅ En sonda konumlanır

### Değiştirmek İstersen

**Taslak Oluştur:**
- "Sayfayı yayınla" checkbox'ını KALDIR
- Sonuç: Sayfa taslak (sadece admin görebilir)

**Nav Menüde Gizle:**
- "Navigasyon menüsünde göster" checkbox'ını KALDIR
- Sonuç: Sayfa direkt link ile erişilebilir

**Sırayı Değiştir:**
- Menü Sırası: 5 (örnek)
- Sonuç: 5. sırada görünür

## Hızlı Referans

### Badge İkonları

| Badge | Durum | Tıkla |
|-------|-------|-------|
| ✓ Aktif | Sayfa yayında | → ✗ Pasif yap |
| ✗ Pasif | Sayfa kapalı | → ✓ Aktif yap |
| 👁 Görünür | Nav menüde | → 🔒 Gizle |
| 🔒 Gizli | Nav menüde değil | → 👁 Göster |

### Butonlar

| Buton | Ne Yapar |
|-------|----------|
| Görüntüle | Sayfayı yeni tab'da aç |
| Düzenle | Sayfa düzenleme formunu aç |
| Yeni Sayfa | Yeni sayfa oluşturma formunu aç |

### Sürükle-Bırak

| İkon | Ne Yapar |
|------|----------|
| ⋮⋮ | Tutma ikonu - Sürükle ve sırayı değiştir |

## Test Senaryosu

### Tam Test

1. **Console'u Aç** (F12)

2. **Yeni Sayfa Oluştur**
   ```
   Başlık: "Test Sayfası"
   İçerik: "Test içeriği"
   ✓ Sayfayı yayınla
   ✓ Navigasyon menüsünde göster
   Menü Sırası: 10
   ```

3. **Console'da Kontrol Et**
   ```javascript
   Loaded pages (sorted by order): [
     ...
     { title: 'Test Sayfası', order: 10, type: 'dynamic' }
   ]
   ```

4. **Frontend'e Git**
   - Ana sayfaya git
   - Nav menüyü kontrol et
   - ✅ "Test Sayfası" görünmeli

5. **Badge'leri Test Et**
   - "Görünür" badge'ine tıkla → "Gizli" olmalı
   - Console'da mesajları kontrol et
   - Frontend'de nav menüyü kontrol et
   - ✅ Sayfa kaybolmalı

6. **Tekrar Göster**
   - "Gizli" badge'ine tıkla → "Görünür" olmalı
   - Frontend'de nav menüyü kontrol et
   - ✅ Sayfa geri gelmeli

7. **Sayfayı Görüntüle**
   - "Görüntüle" butonuna tıkla
   - Yeni tab açılmalı
   - ✅ Sayfa içeriği görünmeli

## Sonuç

✅ **Sayfa yönetimi sistemi hazır!**

**Özellikler:**
- ✅ Tek tıkla aktif/pasif
- ✅ Tek tıkla göster/gizle
- ✅ Sürükle-bırak sıralama
- ✅ Anında görüntüleme
- ✅ Varsayılan olarak canlıda
- ✅ Debug logları

**Kullanıma Hazır:**
- Yeni sayfa oluştur → Anında canlıda!
- Badge'e tıkla → Anında değişir!
- Sürükle-bırak → Anında sıralanır!

---

**Hazırlayan:** Kiro AI  
**Tarih:** 2 Ekim 2025  
**Status:** ✅ PRODUCTION READY

## İlk Kullanım

1. "Yeni Sayfa" butonuna tıkla
2. Başlık ve içerik doldur
3. Kaydet
4. ✅ Sayfa canlıda ve nav menüde!

**Sorun mu var?** Console'u aç (F12) ve mesajları kontrol et!
