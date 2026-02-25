# FIXRAL 3D - Gelişmiş CMS & E-Ticaret Platformu

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Sürüm](https://img.shields.io/badge/S%C3%BCr%C3%BCm-3.7.0-blue?style=for-the-badge)]()
[![Durum](https://img.shields.io/badge/Durum-Yay%C4%B1nda-success?style=for-the-badge)]()

**Fixral 3D**, Next.js 14 (App Router) ile inşa edilmiş, üretime tam hazır (production-grade), tam yığın (full-stack) bir İçerik Yönetim Sistemi (CMS) ve E-Ticaret platformudur.

Özellikle 3D baskı hizmetleri, mühendislik portfolyoları ve dijital ürün satışları için tasarlanmış olmakla birlikte; modüler mimarisi sayesinde herhangi bir kurumsal portfolyo veya ajans web sitesi için de mükemmel bir uyum sağlar.

---

## 🌟 Önemli Özellikler

### 🎯 Modüler Mimari (v3.7.0)
*   **Tema Sistemi (ThemeRegistry):** Veritabanından aktif temayı seçip, `src/themes/` altındaki uygun bileşenleri dinamik olarak yükleyen kayıt defteri yapısı. Yeni tema eklemek için `page.tsx`'e dokunmaya gerek yoktur.
*   **Eklenti Sistemi (PluginRegistry):** SEO, Analytics gibi eklentilerin sunucu tarafında otomatik olarak başlatılmasını sağlayan Event-Driven yapı. `layout.tsx` üzerinden `PluginManager` ile yönetilir.
*   **Tam i18n Desteği:** Tüm public sayfalar (ürünler, hizmetler, portfolyo, sepet, hesap) `[lang]` dinamik dizini altında çoklu dil yapısına tam entegre edilmiştir.
*   **Sunucu Taraflı Veri Çekme (SSR):** Portfolyo, hizmetler ve ana sayfa verileri Client-Side API istekleri yerine doğrudan Server Component'lerde veritabanından çekilir. Sayfa geçişlerinde sıfır gecikme.

### 🛒 Gelişmiş E-Ticaret Motoru
*   **Ürün Yönetimi:** Varyasyonlar (renk, boyut), kategoriler ve etiketlerle zengin ürün listelemeleri.
*   **Dinamik Sepet:** Gerçek zamanlı stok doğrulama ve fiyat hesaplamasıyla Zustand tabanlı sepet yapısı.
*   **Sipariş Akışı:** Adres seçimi, ödeme ve sipariş takibiyle eksiksiz checkout süreci.
*   **E-posta Bildirimleri:** Nodemailer ile sipariş durumu güncellemeleri ve iletişim form yanıtları.

### 🎨 Portfolyo & 3D Görselleştirme
*   **3D Model Görüntüleyici:** `@react-three/fiber` ile tarayıcı üzerinde GLB/GLTF/STL model desteği.
*   **Gelişmiş Vitrin:** Dinamik masonry düzenleri, filtreleme, sıralama ve arama özellikleri.
*   **Hizmetler Modülü:** Tersine Mühendislik, 3D Tarama gibi hizmetler için özel sayfa yapıları.

### ⚡ Yönetici (Admin) Paneli
*   **CMS Yeteneği:** Blog, Haberler, Slaytlar, Sayfa Ayarları ve tüm içeriğin tam yönetimi.
*   **Mesaj Merkezi:** İletişim formları ve proje başvurularına panelden doğrudan yanıt verebilme.
*   **Medya Yönetimi:** Cloudinary entegrasyonu ile sürükle-bırak görsel yükleme.
*   **Güvenlik:** NextAuth.js ile rol tabanlı erişim kontrolü; Middleware ve SSR koruması.

### 🚀 SEO ve Performans
*   **ISR Önbellekleme:** Artımlı Statik Yenileme ile minimum TTFB ve maksimum SEO puanı.
*   **Dinamik Sitemap & Robots.txt:** MongoDB'den çekilen güncel linklerle otomatik arama motoru optimizasyonu.
*   **Canonical URL Yönetimi:** Her sayfa için bağımsız canonical URL üretimi.
*   **Modern Navigasyon:** Glassmorphism (buzlu cam) efektli, şeffaf ve animasyonlu üst menü.

---

## 🛠 Teknoloji Yığını

| Kategori | Teknoloji |
|---|---|
| **Çatı** | Next.js 14 (React 18 + App Router) |
| **Dil** | TypeScript |
| **Stil** | Tailwind CSS, Framer Motion, Heroicons |
| **Veritabanı** | MongoDB (Mongoose ODM) |
| **3D Grafik** | Three.js, React Three Fiber |
| **Kimlik Doğrulama** | NextAuth.js |
| **Form Doğrulama** | React Hook Form, Zod |
| **Medya** | Cloudinary |

---

## 🚀 Geliştirme Ortamı Kurulumu

### Ön Koşullar
*   **Node.js** v18.17.0 veya üstü
*   **npm** veya **yarn**
*   **MongoDB** bağlantı URI (Yerel veya Atlas)
*   **Cloudinary** hesabı (görsel yüklemeleri için)

### Kurulum

```bash
# 1. Projeyi klonlayın
git clone https://github.com/erdemerciyas/personal-blog.git
cd personal-blog

# 2. Bağımlılıkları yükleyin
npm install

# 3. .env.local dosyasını oluşturun (aşağıdaki şablonu kullanın)

# 4. Uygulamayı başlatın
npm run dev
```

### Çevresel Değişkenler (.env.local)

```bash
# Veritabanı
MONGODB_URI=mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/fixral

# NextAuth Güvenlik
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=guvenlik_icin_karmasik_bir_sifre

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=site_adi
NEXT_PUBLIC_CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=yyy

# E-Posta (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ornek@domain.com
SMTP_PASS=uygulama_sifresi
```

---

## 📦 Derleme ve Dağıtım

```bash
# Kod düzeni kontrolü
npm run lint

# TypeScript tip güvenliği kontrolü
npx tsc --noEmit

# Üretim derlemesi
npm run build
```

> **Not:** Vercel veya benzeri platformlarda tüm çevresel değişkenlerin (MONGODB_URI vb.) doğru eklendiğinden emin olun. MongoDB Atlas kullanıyorsanız Network Access'i uygun şekilde yapılandırın.

---

## 📋 v3.7.0 Sürüm Notları

### Mimari İyileştirmeler
- Tüm public sayfalar `[lang]` dizini altına taşınarak tam i18n entegrasyonu sağlandı
- API endpoint'leri `public/` ve `admin/` olarak net sınırlarla ayrıştırıldı
- Plugin ve Theme Registry sistemi kurularak modüler mimari tamamlandı

### Performans Düzeltmeleri
- Portfolyo sayfası tamamen SSR'a geçirildi (sıfır Client-Side fetch)
- Header'daki 30 saniyelik interval sorgusu kaldırıldı (veritabanı yükü azaltıldı)
- Sayfa geçişlerindeki "yank-back" navigasyon döngüsü düzeltildi
- `loading.tsx` ile sayfa geçişlerinde anında iskelet animasyonu eklendi

### UI/UX Güncellemeleri
- Navigasyon menüsü modern glassmorphism tasarımına geçirildi
- Şeffaf header ile backdrop-blur efektleri uygulandı
- Aktif sayfa göstergesi ince animasyonlu alt çizgiye dönüştürüldü

### Teknik Temizlik
- Mongoose duplicate index uyarıları giderildi
- PluginManager hata mesajları sessizleştirildi
- Gereksiz `console.log` çıktıları debug moduna alındı

---

## 🔐 Güvenlik

*   **Veri Doğrulama:** Tüm API uç noktalarında Zod ve Next.js validasyonları.
*   **XSS Koruması:** DOM tarafına yansıtılan veriler sanitize edilir.
*   **CSRF Koruması:** Token tabanlı form güvenliği.
*   **Middleware Güvenliği:** IP engelleme, rate limiting ve yetkilendirme kontrolleri.

---

## 🤝 Lisans ve İletişim

Bu proje kişisel / kapalı kaynak kullanım için yetkilendirilmiştir. Hakları izinsiz kopyalanamaz veya dağıtılamaz.

**Geliştirici:** Erdem Erciyas
