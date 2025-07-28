---

# 🎨 Fixral Design System

Bu belge, **Fixral.com** için oluşturulan UI/UX tasarım sistemi, renk paleti, tipografi, buton yapısı ve genel bileşenlerin stil kurallarını içerir. Web sitesi tasarımında görsel bütünlük, erişilebilirlik ve teknik profesyonellik önceliklidir.

---

## 🔵 Renk Paleti

| Renk Adı        | HEX       | Kullanım Alanı                            |
| --------------- | --------- | ----------------------------------------- |
| Ana Gece Mavisi | `#0D1B2A` | Arka plan, başlıklar, navigasyon          |
| Canlı Turkuaz   | `#00B4D8` | Vurgu butonları, ikonlar, CTA alanları    |
| Açık Gri-Beyaz  | `#F8F9FA` | Sayfa zeminleri, form arka planları       |
| Kömür Grisi     | `#3D3D3D` | Metinler, alt başlıklar, açıklamalar      |
| Gri Mavi        | `#3A506B` | Sekmeler, kart çerçeveleri, sekonder renk |

## 🔤 Tipografi

### Font Ailesi

- **Başlıklar:** [Orbitron](https://fonts.google.com/specimen/Orbitron), sans-serif
- **Metin ve içerik:** [Inter](https://fonts.google.com/specimen/Inter), sans-serif

```css
body {
  font-family: 'Inter', sans-serif;
  color: #3D3D3D;
  background-color: #F8F9FA;
}
h1, h2, h3, h4, h5 {
  font-family: 'Orbitron', sans-serif;
  color: #0D1B2A;
  font-weight: 600;
}
```

## 🧩 Butonlar

```css
.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary {
  background-color: #00B4D8;
  color: #ffffff;
  border: none;
}

.btn-primary:hover {
  background-color: #0096ba;
}

.btn-secondary {
  background-color: #3A506B;
  color: #ffffff;
  border: none;
}
```

## 📦 Kartlar ve Kutular

```css
.card {
  background-color: #ffffff;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  padding: 24px;
}
```

## 📄 Form Elemanları

```css
input[type="text"], textarea, select {
  width: 100%;
  padding: 12px;
  border: 1px solid #CED4DA;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
}

input:focus, textarea:focus, select:focus {
  border-color: #00B4D8;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 180, 216, 0.25);
}
```

---

## 📱 Mobil Duyarlılık

- Tüm grid ve buton yapısı mobil-first yaklaşımla düzenlenmelidir.
- Butonlar minimum `44x44px` boyutta olmalı.
- Font boyutları mobilde `14px`, masaüstünde `16-18px` olarak ayarlanmalıdır.

---

## 🔄 Gelecekteki Geliştirmeler

- Karanlık tema desteği
- Animasyonlar için Framer Motion entegrasyonu
- UI bileşenlerinin Storybook ile belgelenmesi

---

> **Fixral Design System**, markanın modern, güvenilir ve teknik kimliğini dijital dünyada net bir şekilde yansıtmak için hazırlanmıştır.

