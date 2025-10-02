# Sürükle-Bırak Sıralama Özelliği

**Tarih:** 2 Ekim 2025  
**Status:** ✅ TAMAMLANDI

## Genel Bakış

Sayfa yönetimi paneline sürükle-bırak (drag & drop) ile sıralama özelliği eklendi! Artık sayfaları fareyle sürükleyerek nav menü sırasını kolayca değiştirebilirsin.

## Özellikler

### 1. ✅ Sürükle-Bırak Arayüzü

**Kullanım:**
- Her sayfanın solunda bir tutma ikonu (⋮⋮) var
- İkona tıkla ve tut
- Sayfayı istediğin konuma sürükle
- Bırak

**Görsel Feedback:**
- Sürüklerken sayfa yarı saydam olur
- Hedef konum vurgulanır
- Animasyonlu geçişler

### 2. ✅ Otomatik Kaydetme

**Nasıl Çalışır:**
1. Sayfayı yeni konuma sürükle
2. Bıraktığın anda otomatik kaydedilir
3. "Sıralama kaydediliyor..." mesajı görünür
4. Nav menü anında güncellenir

**Teknik Detaylar:**
- Hem statik hem dinamik sayfalar desteklenir
- Toplu güncelleme (batch update)
- Hata durumunda otomatik geri yükleme

### 3. ✅ Akıllı Sıralama

**Order Numaraları:**
- Her sayfa bir order numarası alır (0, 1, 2, 3...)
- Sürükle-bırak ile otomatik güncellenir
- Küçük numara = Önce görünür

**Örnek:**
```
Başlangıç:
0. Ana Sayfa
1. Hakkımda
2. Hizmetler
3. Portfolio

Hizmetler'i en başa sürükle:
0. Hizmetler  ← Yeni
1. Ana Sayfa
2. Hakkımda
3. Portfolio
```

## Kullanım Örnekleri

### Örnek 1: Hizmetler'i En Başa Alma

**Adımlar:**
1. Sayfa Yönetimi'ne git
2. "Hizmetler" satırındaki tutma ikonuna tıkla
3. En üste sürükle
4. Bırak
5. ✅ Hizmetler artık ilk sırada!

### Örnek 2: Portfolio'yu Gizleme ve Sıralama

**Adımlar:**
1. Portfolio'yu "İletişim"den sonraya sürükle
2. "Nav Menüde" badge'ine tıkla (gizle)
3. ✅ Portfolio nav menüde görünmüyor ama sırada

### Örnek 3: Yeni Sayfa Ekleme ve Konumlandırma

**Adımlar:**
1. "Yeni Sayfa" ile "Referanslar" oluştur
2. Sayfa listesinde en altta görünür
3. "Portfolio"dan sonraya sürükle
4. ✅ İstediğin konumda!

## Teknik Detaylar

### Kullanılan Kütüphane

**@dnd-kit**
- Modern, performanslı
- Accessibility desteği
- Touch screen uyumlu
- Keyboard navigation

**Kurulum:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Bileşen Yapısı

```typescript
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={pageIds}
    strategy={verticalListSortingStrategy}
  >
    {pages.map(page => (
      <SortablePageItem key={page.id} page={page} />
    ))}
  </SortableContext>
</DndContext>
```

### Drag End Handler

```typescript
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  
  // Yeni sırayı hesapla
  const newPages = arrayMove(pages, oldIndex, newIndex);
  
  // Order numaralarını güncelle
  const updatedPages = newPages.map((page, index) => ({
    ...page,
    order: index
  }));
  
  // UI'ı güncelle
  setPages(updatedPages);
  
  // Backend'e kaydet
  await saveOrder(updatedPages);
};
```

### API Güncellemeleri

**PUT /api/admin/page-settings**
```typescript
// Toplu order güncelleme
body: [
  { pageId: 'home', order: 0 },
  { pageId: 'about', order: 1 },
  { pageId: 'services', order: 2 }
]
```

**PUT /api/admin/pages/[id]**
```typescript
// Tek sayfa order güncelleme
body: { order: 5 }
```

## Kullanıcı Deneyimi

### Görsel İpuçları

**Tutma İkonu (⋮⋮):**
- Her satırın solunda
- Hover'da vurgulanır
- Cursor: grab → grabbing

**Sürükleme Sırasında:**
- Sayfa yarı saydam (opacity: 0.5)
- Shadow efekti
- Smooth animasyon

**Bırakma Sonrası:**
- Anında sıralama güncellenir
- "Sıralama kaydediliyor..." mesajı
- Başarı feedback'i

### Erişilebilirlik

**Keyboard Desteği:**
- Tab ile navigasyon
- Space/Enter ile seçim
- Arrow keys ile hareket
- Escape ile iptal

**Screen Reader:**
- ARIA labels
- Durum bildirimleri
- Anlamlı mesajlar

## Performans

### Optimizasyonlar

**Debouncing:**
- Sürükleme bitince kaydet
- Gereksiz API çağrıları yok

**Batch Updates:**
- Tüm değişiklikler toplu
- Tek API çağrısı

**Optimistic UI:**
- Anında UI güncellenir
- Backend'i beklemez
- Hata durumunda geri alır

### Hata Yönetimi

**Başarısız Kaydetme:**
```typescript
try {
  await saveOrder(newPages);
} catch (error) {
  // Eski sırayı geri yükle
  await loadPages();
  showError('Sıralama kaydedilemedi');
}
```

## Sınırlamalar

⚠️ **Mevcut Sınırlamalar:**
- Sadece dikey sıralama (yatay yok)
- Gruplar arası sürükleme yok
- Çoklu seçim yok

⚠️ **Tarayıcı Desteği:**
- Modern tarayıcılar (Chrome, Firefox, Safari, Edge)
- IE11 desteklenmiyor
- Touch screen destekleniyor

## Gelecek İyileştirmeler

### Öncelikli

1. **Görsel İyileştirmeler**
   - Daha belirgin drag handle
   - Animasyon iyileştirmeleri
   - Drop zone vurgulaması

2. **Undo/Redo**
   - Sıralama değişikliklerini geri al
   - Değişiklik geçmişi

3. **Toplu Sıralama**
   - Çoklu sayfa seçimi
   - Grup halinde taşıma

### Opsiyonel

- Sayfa grupları (kategoriler)
- Nested sıralama (alt sayfalar)
- Sürükle-bırak ile kopyalama
- Sıralama şablonları

## Test Senaryoları

### ✅ Temel Sürükleme
```
1. Bir sayfayı tut
2. Yukarı/aşağı sürükle
3. Bırak
4. Sıralama güncellenmeli
```

### ✅ Çoklu Değişiklik
```
1. Birden fazla sayfayı sırala
2. Her biri kaydedilmeli
3. Nav menü güncel olmalı
```

### ✅ Hata Durumu
```
1. İnternet bağlantısını kes
2. Sayfayı sürükle
3. Hata mesajı görünmeli
4. Eski sıra geri yüklenmeli
```

### ✅ Keyboard Navigation
```
1. Tab ile sayfalara git
2. Space ile seç
3. Arrow keys ile taşı
4. Enter ile bırak
```

## Karşılaştırma

### Önceki Sistem
- ❌ Manuel order numarası girme
- ❌ Sayfa düzenleme gerekli
- ❌ Yavaş ve zahmetli
- ❌ Hata yapma riski

### Yeni Sistem
- ✅ Sürükle-bırak
- ✅ Anında güncelleme
- ✅ Hızlı ve kolay
- ✅ Görsel feedback

## Sonuç

✅ **Sürükle-bırak sıralama başarıyla eklendi!**

**Özellikler:**
- ✅ Kolay kullanım
- ✅ Otomatik kaydetme
- ✅ Görsel feedback
- ✅ Keyboard desteği
- ✅ Hata yönetimi
- ✅ Performanslı

**Kullanıma Hazır:**
- Sayfaları sürükle-bırak
- Anında nav menü güncelleme
- Hem statik hem dinamik sayfalar
- Touch screen uyumlu

---

**Hazırlayan:** Kiro AI  
**Tarih:** 2 Ekim 2025  
**Status:** ✅ PRODUCTION READY

## Hızlı Başlangıç

1. Sayfa Yönetimi'ne git
2. Tutma ikonuna (⋮⋮) tıkla
3. Sayfayı sürükle
4. İstediğin yere bırak
5. ✅ Otomatik kaydedilir!

**İpucu:** Sayfaları sürüklerken "Sıralama kaydediliyor..." mesajını göreceksin. Bu mesaj kaybolduğunda değişiklikler nav menüye yansımıştır.
