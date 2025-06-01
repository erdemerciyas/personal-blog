# Kişisel Blog & Portfolio 🚀

Modern, responsive ve kullanıcı dostu kişisel blog ve portfolio sitesi. Next.js 14, React 18, TypeScript ve Tailwind CSS ile geliştirilmiştir.

## 🎯 Özellikler

- **Modern UI/UX**: Tailwind CSS ile responsive tasarım
- **Admin Paneli**: Tam özellikli yönetim sistemi
- **Portfolio Yönetimi**: Proje galerisi ve kategori sistemi
- **Blog Sistemi**: İçerik yönetimi ve düzenleme
- **Medya Yönetimi**: Dosya yükleme ve organizasyon
- **İletişim Formu**: Mesaj yönetim sistemi
- **Slider Sistemi**: Ana sayfa slider yönetimi
- **Kullanıcı Yönetimi**: Rol tabanlı yetkilendirme
- **SEO Optimizasyonu**: Meta etiketler ve sosyal medya entegrasyonu

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB, Mongoose ODM
- **Authentication**: NextAuth.js
- **File Upload**: Cloudinary entegrasyonu
- **Icons**: Heroicons
- **Email**: Nodemailer

## 📦 Kurulum

1. **Repository'yi klonlayın**
   ```bash
   git clone https://github.com/erdemerciyas/personal-blog.git
   cd personal-blog
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Environment değişkenlerini ayarlayın**
   ```bash
   cp .env.example .env.local
   ```

4. **Development server'ı başlatın**
   ```bash
   npm run dev
   ```

## 🎨 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel sayfaları
│   ├── api/               # API routes
│   └── ...                # Public sayfalar
├── components/            # React bileşenleri
│   ├── ui/               # UI bileşenleri
│   └── ...               # Diğer bileşenler
├── lib/                  # Utility fonksiyonlar
├── models/               # MongoDB modelleri
└── types/                # TypeScript tip tanımları
```

## 🚀 Deployment

1. **Build oluşturun**
   ```bash
   npm run build
   ```

2. **Production server'ı başlatın**
   ```bash
   npm start
   ```

## 📝 Özellik Listesi

### Admin Paneli
- ✅ Dashboard ve istatistikler
- ✅ Portfolio proje yönetimi
- ✅ Medya kütüphanesi
- ✅ İletişim mesajları
- ✅ Slider yönetimi
- ✅ Site ayarları
- ✅ Kullanıcı yönetimi

### Frontend
- ✅ Responsive tasarım
- ✅ Portfolio galerisi
- ✅ İletişim formu
- ✅ Modern animasyonlar
- ✅ SEO optimizasyonu

## 🔧 Konfigürasyon

### Environment Değişkenleri

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_site_url
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## 📧 İletişim & Destek

Proje hakkında sorularınız için:

- **Email**: erdem.erciyas@gmail.com
- **Website**: [Erciyas Engineering](https://www.erdemerciyas.com.tr)
- **GitHub**: [@erdemdev](https://github.com/erdemerciyas)

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakınız.

## 👨‍💻 Developer

**Erdem Erciyas**
- Full Stack Developer
- Mühendislik ve Teknoloji Uzmanı
- Erciyas Engineering Kurucusu

---

### 🔄 Versiyon Geçmişi

- **v0.1.0** - İlk stabil sürüm
  - Temel admin paneli
  - Portfolio yönetimi
  - Medya sistemi
  - İletişim formu

---

*Bu proje sürekli geliştirilmekte ve güncellemektedir. Katkılarınız her zaman değerlidir!* ⭐
