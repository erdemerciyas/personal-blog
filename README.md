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
- **Deployment**: Vercel

## 🚀 **HIZLI VERCEL DEPLOYMENT**

### **1. Yeni Vercel Projesi:**
```bash
# 1. Vercel Dashboard → New Project
# 2. GitHub repository seç: personal-blog
# 3. Import → Deploy
```

### **2. Environment Variables:**
```bash
NEXTAUTH_SECRET=f1181d6e1ce33c4ba4135a7497694541679c39f7ea81e7feddeca23a93e39ab9
NEXTAUTH_URL=https://[VERCEL-URL-IN]
NODE_ENV=production
MONGODB_URI=mongodb+srv://erdemerciyasreverse:oI9OMHyFwhIdh54O@erdemerciyas.1xlwobu.mongodb.net/?retryWrites=true&w=majority&appName=erdemerciyas
```

### **3. Build Configuration:**
```bash
Build Command: npm run build
Install Command: npm install --legacy-peer-deps
Output Directory: .next
```

**📋 Detaylı rehber:** `VERCEL_DEPLOYMENT_GUIDE.md`

## 📦 Local Development

1. **Repository'yi klonlayın**
   ```bash
   git clone https://github.com/erdemerciyas/personal-blog.git
   cd personal-blog
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install --legacy-peer-deps
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
│   └── index.ts          # Component exports
├── lib/                  # Utility fonksiyonlar
├── models/               # MongoDB modelleri
└── types/                # TypeScript tip tanımları
```

## ✅ **SON DURUM - DEPLOYMENT HAZIR**

### **Çözülen Sorunlar:**
- ✅ NextAuth self-fetch sorunu düzeltildi
- ✅ ImageUpload component import hatası çözüldü  
- ✅ Dependency conflicts giderildi
- ✅ Build başarıyla çalışıyor
- ✅ MongoDB bağlantısı test edildi
- ✅ Component export/import sistemi optimize edildi

### **Optimizasyonlar:**
- ✅ Email bağımlılığı kaldırıldı (sonra eklenebilir)
- ✅ OpenAI bağımlılığı kaldırıldı (sonra eklenebilir)
- ✅ Vercel-optimized konfigürasyon
- ✅ Legacy peer deps desteği

## 📝 Özellik Listesi

### Admin Paneli
- ✅ Dashboard ve istatistikler
- ✅ Portfolio proje yönetimi
- ✅ Medya kütüphanesi
- ✅ İletişim mesajları (DB'ye kaydediliyor)
- ✅ Slider yönetimi
- ✅ Site ayarları
- ✅ Kullanıcı yönetimi
- ✅ Güvenlik sorusu sistemi

### Frontend
- ✅ Responsive tasarım
- ✅ Portfolio galerisi
- ✅ İletişim formu
- ✅ Modern animasyonlar
- ✅ SEO optimizasyonu

## 🔧 Environment Değişkenleri

### **Production (Vercel):**
```env
NEXTAUTH_SECRET=f1181d6e1ce33c4ba4135a7497694541679c39f7ea81e7feddeca23a93e39ab9
NEXTAUTH_URL=https://[VERCEL-URL]
NODE_ENV=production
MONGODB_URI=mongodb+srv://erdemerciyasreverse:oI9OMHyFwhIdh54O@erdemerciyas.1xlwobu.mongodb.net/?retryWrites=true&w=majority&appName=erdemerciyas
```

### **Development (Local):**
```env
NEXTAUTH_SECRET=f1181d6e1ce33c4ba4135a7497694541679c39f7ea81e7feddeca23a93e39ab9
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://erdemerciyasreverse:oI9OMHyFwhIdh54O@erdemerciyas.1xlwobu.mongodb.net/?retryWrites=true&w=majority&appName=erdemerciyas
```

## 📧 İletişim & Destek

Proje hakkında sorularınız için:

- **Email**: erdem.erciyas@gmail.com
- **Website**: [Erdem Erciyas](https://www.erdemerciyas.com.tr)
- **GitHub**: [@erdemerciyas](https://github.com/erdemerciyas)

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakınız.

## 👨‍💻 Developer

**Erdem Erciyas**
- Full Stack Developer
- Mühendislik ve Teknoloji Uzmanı

---

### 🔄 Versiyon Geçmişi

- **v1.0.0** - Production Ready ✅
  - Vercel deployment optimize edildi
  - NextAuth fix edildi
  - Component system düzeltildi
  - Build optimizasyonları
  
- **v0.1.0** - İlk stabil sürüm
  - Temel admin paneli
  - Portfolio yönetimi
  - Medya sistemi
  - İletişim formu

---

**🎉 Proje Vercel deployment için tamamen hazır!** 🚀
