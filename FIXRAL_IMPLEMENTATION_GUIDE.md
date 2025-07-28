# Fixral Design System - Uygulama Rehberi

Bu belge, Fixral Design System'in mevcut Next.js projesine nasıl entegre edildiğini ve nasıl kullanılacağını açıklar.

## 🎯 Uygulanan Değişiklikler

### 1. Tailwind CSS Konfigürasyonu
- Fixral renk paleti eklendi
- Orbitron ve Inter font aileleri tanımlandı
- Özel border-radius ve shadow değerleri eklendi

### 2. Global CSS Güncellemeleri
- CSS değişkenleri Fixral renkleri ile güncellendi
- Tipografi sınıfları eklendi (h1-h6 için Orbitron)
- Form elemanları için özel stiller
- Mobil duyarlılık kuralları

### 3. Yeni UI Bileşenleri
- `FixralButton` - Çoklu variant ve boyut desteği
- `FixralCard` - Farklı kart stilleri
- `FixralInput` - Form input elemanı
- `FixralTextarea` - Çok satırlı metin alanı
- `FixralSelect` - Dropdown seçim elemanı

## 🎨 Renk Paleti

```css
/* Fixral Renkleri */
--fixral-night-blue: #0D1B2A    /* Ana başlıklar, navigasyon */
--fixral-turquoise: #00B4D8     /* Vurgu butonları, CTA */
--fixral-light-gray: #F8F9FA    /* Sayfa zeminleri */
--fixral-charcoal: #3D3D3D      /* Metin içeriği */
--fixral-gray-blue: #3A506B     /* Sekonder öğeler */
```

## 🔤 Tipografi

### Font Aileleri
- **Tüm metinler:** Inter (`font-sans`)
- **Başlıklar ve metin:** Inter font ailesi (Orbitron kaldırıldı)

### Kullanım
```tsx
<h1 className="font-sans text-fixral-night-blue">Başlık</h1>
<p className="font-sans text-fixral-charcoal">Paragraf metni</p>
```

## 🧩 Bileşen Kullanımı

### FixralButton
```tsx
import { FixralButton } from '@/components/ui';

<FixralButton variant="primary" size="md">
  Tıkla
</FixralButton>

<FixralButton variant="outline" loading>
  Yükleniyor...
</FixralButton>
```

**Variant'lar:** `primary`, `secondary`, `outline`, `ghost`
**Boyutlar:** `sm`, `md`, `lg`

### FixralCard
```tsx
import { FixralCard } from '@/components/ui';

<FixralCard variant="default" padding="md">
  <h3>Kart Başlığı</h3>
  <p>Kart içeriği</p>
</FixralCard>
```

**Variant'lar:** `default`, `glass`, `elevated`
**Padding:** `sm`, `md`, `lg`

### Form Elemanları
```tsx
import { FixralInput, FixralTextarea, FixralSelect } from '@/components/ui';

<FixralInput
  label="Ad Soyad"
  placeholder="Adınızı girin"
  error="Bu alan zorunludur"
/>

<FixralTextarea
  label="Mesaj"
  rows={4}
  helperText="En az 10 karakter"
/>

<FixralSelect
  label="Kategori"
  options={[
    { value: 'web', label: 'Web Geliştirme' },
    { value: 'mobile', label: 'Mobil App' }
  ]}
/>
```

## 📱 Mobil Duyarlılık

- Butonlar minimum 44x44px boyutunda
- Mobilde 14px, masaüstünde 16px font boyutu
- Responsive grid sistemleri
- Touch-friendly etkileşimler

## 🔧 CSS Sınıfları

### Butonlar
```css
.btn-primary     /* Ana buton stili */
.btn-secondary   /* İkincil buton stili */
```

### Form Elemanları
```css
.input-field     /* Input alanları */
.textarea-field  /* Textarea alanları */
.select-field    /* Select dropdown */
.label-text      /* Label metinleri */
```

### Kartlar
```css
.card           /* Temel kart stili */
.card-glass     /* Cam efektli kart */
```

## 🚀 Örnek Kullanım

Tam örnekleri görmek için:
```tsx
import FixralExamples from '@/components/examples/FixralExamples';
```

## ⚡ Performans Notları

- Font'lar `display: swap` ile optimize edildi
- CSS değişkenleri kullanılarak tema tutarlılığı sağlandı
- Tailwind CSS ile gereksiz stiller temizlendi
- Mobil-first yaklaşım benimsenди

## 🔄 Mevcut Kodla Uyumluluk

- Eski buton sınıfları hala çalışır
- Mevcut renk değişkenleri korundu
- Geriye dönük uyumluluk sağlandı
- Kademeli geçiş mümkün

## 📋 Yapılacaklar

- [ ] Karanlık tema desteği
- [ ] Framer Motion animasyonları
- [ ] Storybook entegrasyonu
- [ ] Accessibility testleri
- [ ] Component unit testleri

---

Bu implementasyon, mevcut projenin yapısını bozmadan Fixral Design System'i entegre eder ve gelecekteki geliştirmeler için sağlam bir temel oluşturur.