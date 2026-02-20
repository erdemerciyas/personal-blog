# FIXRAL 3D - Gelişmiş CMS & E-Ticaret Platformu

![Fixral Banner](https://via.placeholder.com/1200x400.png?text=FIXRAL+CMS+%26+PORTFOLIO)

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Durum-Yay%C4%B1na%20Haz%C4%B1r-success?style=for-the-badge)]()

**Fixral 3D**, Next.js 14 (App Router) ile inşa edilmiş, üretime tam hazır (production-grade), tam yığın (full-stack) bir İçerik Yönetim Sistemi (CMS) ve E-Ticaret platformudur. 

Özellikle 3D baskı hizmetleri, mühendislik portfolyoları ve dijital ürün satışları için tasarlanmış olmakla birlikte; modüler mimarisi sayesinde herhangi bir kurumsal portfolyo veya ajans web sitesi için de mükemmel bir uyum sağlar.

---

## 🌟 Önemli Özellikler

### 🛒 Gelişmiş E-Ticaret Motoru
*   **Ürün Yönetimi:** Varyasyonlar (renk, boyut), kategoriler ve etiketlerle zengin ürün listelemeleri.
*   **Dinamik Sepet Sistemi:** Gerçek zamanlı stok doğrulama ve fiyat hesaplamasıyla desteklenmiş sepet yapısı.
*   **Ödeme Adımları (Checkout):** Ödeme altyapılarına entegre edilebilir akıcı sipariş ekranı (Iyzico yapısı hazırlanmıştır).
*   **Sipariş ve Bildirimler:** Süreç takibi, otomatik sipariş durumu e-postaları (Hazırlanıyor, Kargolandı vb.) ve e-posta bildirimleri (Nodemailer destekli).

### 🎨 Portfolyo & 3D Görselleştirme
*   **3D Model Görüntüleyici:** `@react-three/fiber` ve `@react-three/drei` kullanılarak yerleşik 3D model (GLB/GLTF/STL) desteği. Tarayıcı üzerinde modelleri döndürme, yakınlaştırma ve inceleme imkanı.
*   **Gelişmiş Vitrin:** Dinamik masonry (tuğla) düzenleri, yüksek çözünürlüklü görseller ve filtrelemeli projeler.
*   **Hizmetler Modülü:** "Tersine Mühendislik", "3D Tarama" vb. hizmet sunumları için özel sayfa yapıları.

### ⚡ Güçlü Yönetici(Admin) Paneli
*   **CMS Yeteneği:** Bloglar (Gelişmiş Zengin Metin Editörü), Haberler, Slaytlar ve Sayfalar da dahil tüm içeriğin tam yönetimi.
*   **Mesaj Merkezi:** İletişim formları, proje başvuruları ve satıcıya sorulan sorular için tek noktadan yönetim. Panelin içinden kullanıcılara **Doğrudan Yanıt (Reply)** verebilme özelliği.
*   **Dosya/Medya:** Cloudinary ile sürükle-bırak destekli görsel optimizasyonlu medya yönetimi.
*   **Güvenlik:** **NextAuth.js** ile tamamen güvenli, rol tabanlı erişim kontrolü. Sayfalar SSR ve Middleware aracılığıyla korunur.

### 🚀 SEO ve Performans Optimizasyonları
*   **Yüksek Performans:** Özel ISR (Artımlı Statik Yenileme) önbellekleme mimarisi sayesinde TTFB (İlk Bayt Süresi) minimumda tutulur ve SEO'da maksimum puan hedeflenir.
*   **Dinamik XML Site Haritası & Robots.txt:** MongoDB üzerinden anlık çekilen blog, haber ve portfolyo linkleri güncel arama motoru optimizasyonu sağlar (`sitemap.ts` ve `robots.ts` ile otomatik yapılandırılır).
*   **JSON-LD:** Arama sonuçlarında zengin snippet'lar için hazır yapılandırılmış şema verileri (Schema Markup).

---

## 🛠 Teknoloji Yığını

*   **Çatı (Framework):** [Next.js 14](https://nextjs.org/) (React 18 + App Router)
*   **Dil:** TypeScript
*   **Stil & Tasarım:** Tailwind CSS, Headless UI, Heroicons, Framer Motion
*   **Veritabanı:** MongoDB (Mongoose ODM)
*   **3D Grafik:** Three.js, React Three Fiber
*   **Kimlik Doğrulama:** NextAuth.js
*   **Form Doğrulama:** React Hook Form, Zod
*   **Medya Depolama:** Cloudinary

---

## 🚀 Geliştirme Ortamı Kurulumu

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### Ön Koşullar
*   **Node.js**: v18.17.0 veya üstü
*   **npm** veya **yarn**
*   **MongoDB**: Çalışan bir bağlantı URI (Yerel veya Atlas)
*   **Cloudinary Hesabı**: Resim yüklemeleri için API bilgileri

### Adım Adım Kurulum

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/erdemerciyas/personal-blog.git
    cd personal-blog
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Çevresel Değişkenleri Ayarlayın:**
    Ana dizinde `.env.local` adlı bir dosya oluşturun ve altyapı ayarlarınızı girin:

    ```bash
    # Veritabanı (MongoDB)
    MONGODB_URI=mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/fixral

    # NextAuth Güvenlik
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=guvenlik_icin_karmaşık_bir_sifre_girin_buraya

    # Bulut Medya (Cloudinary)
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=site_adi
    NEXT_PUBLIC_CLOUDINARY_API_KEY=xxx
    CLOUDINARY_API_SECRET=yyy

    # E-Posta Bildirimleri (SMTP)
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=ornek@domain.com
    SMTP_PASS=uygulama_sifresi
    ```

4.  **Uygulamayı Başlatın:**
    ```bash
    npm run dev
    ```
    Tarayıcınız üzerinden `http://localhost:3000` adresine girerek test edebilirsiniz.

---

## 📦 Kesintisiz Vercel & CI/CD Dağıtımı (Deployment)

Projemiz, Vercel üzerinde 0 hata ile derlenmek (build) ve otomatik olarak dağıtılmak üzere tasarlanmıştır.

### Derleme (Build) Sırasında Dikkat Edilmesi Gerekenler
*   Vercel veya herhangi bir farklı sunucu platformunda projeyi canlıya alırken, **Environment Variables (Çevresel Değişkenler)** menüsünden projenin ihtiyacı olan *tüm değişkenlerin* (MONGODB_URI vb.) doğru eklendiğinden kesinlikle emin olun.
*   Sayfaların çoğu `Static Generation` + `ISR` (Incremental Static Regeneration) mimarisinde hazırlanmıştır. Eğer derleme sırasında veritabanı bulunamazsa veya eksik değişken varsa projeyi derlemeyi iptal eder (Build Fail). Bunun önüne geçebilmek için veri tabanı bağlantınızın Vercel üzerinden dışarı açık olmasına izin vermeniz gereklidir. (MongoDB Atlas kullanıyorsanız Network Access'i tüm IP'lere [0.0.0.0/0] veya özel Vercel IP'lerine açtığınızdan emin olun).

### Derlemeyi ve Linting'i Yerelde Doğrulamak
Kodu GitHub'a veya sunucuya (Vercel) yollamadan (push) önce daima bu komutları çalıştırıp hata bulunmadığından emin olun:
```bash
# Sıkı kod düzeni ve kullanım hataları kontrolü
npm run lint

# TypeScript tip güvenliği hataları kontrolü (Type-Safe)
npx tsc --noEmit

# Sunucu öncesi gerçek statik derleme testi
npm run build
```
Bu adımlar başarılıysa uygulama %100 oranında Vercel ve CI (Continuous Integration) pipeline aşamalarını başarıyla geçecektir.

---

## 🔐 Güvenlik ve Pipeline Standartları

Bu proje kapsamlı GitHub pipeline/iş akışı kuralları çerçevesinde tasarlanmıştır:
1. **Veri Giriş Temizliği:** Tüm API uç noktalarında gelen veriler ZOD ve Next.js Request validasyonları sayesinde süzgeçten geçirilmektedir. DOM tarafına yansıtılacak olan veriler XSS saldırılarına karşı `dangerouslySetInnerHTML` kontrolleriyle veya ek sanitleme algoritmalarıyla korunur (`DOMPurify`).
2. **Paket Güvenliği:** Kod bağımlılıklarını güncel tutmak için belirli aralıklarla `npm audit` uygulanabilir.

---

## 🤝 Katkıda Bulunma, Destek ve Lisans

Bu proje kişisel / kapalı kaynak kullanım için yetkilendirilmiştir. Hakları izinsiz kopyalanamaz veya dağıtılamaz. Her türlü katkı veya bildirim için `Issues/Pull Requests` ağını takip edebilirsiniz.

**Geliştirici:** Erdem Erciyas
