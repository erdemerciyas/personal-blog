# 🛠️ Fixral.com - Next.js Tema/Template Yapısı (Full Setup Dokümantasyonu)

Bu doküman, `fixral.com` alan adı üzerinde kurulu olan Next.js 14 (App Router + TypeScript) altyapısına çoklu tema destekli, kurumsal web, blog, portföy ve admin panel yapılarının entegre edildiği modüler bir sistemi kapsamaktadır. Yapı, modüler dosya sistemine dayalı, dinamik olarak genişletilebilir ve her tema bağımsız component'ler üzerinden yönetilir.

---

## 📦 Genel Mimarî Özeti

- **Framework**: Next.js 14 (App Router)
- **Dil**: TypeScript
- **Veritabanı**: MongoDB (Mongoose)
- **Kimlik Doğrulama**: NextAuth.js (OAuth + Credentials destekli)
- **Görsel Yönetimi**: Cloudinary
- **Stil**: TailwindCSS + custom SCSS opsiyonlu
- **Çoklu Tema**: `ThemeProvider` + middleware destekli geçiş
- **Çoklu Dil**: `next-intl` ile i18n altyapısı

## 📁 Klasör Yapısı (Örnek)

```
/app
  /page.tsx (Landing)
  /blog
    /page.tsx (Blog listesi)
    /[slug]/page.tsx (Blog detay)
  /portfolio
    /page.tsx
    /[slug]/page.tsx
  /dashboard
    /page.tsx
  /api (isteğe bağlı route handlers)
/components
/themes
  /default
    /components
      /Landing
      /Blog
      /Portfolio
      /Dashboard
/lib
/models (Mongoose modelleri)
/middleware.ts
/context/ThemeContext.tsx
```

---

## 📖 Sayfa Modül Detayları

### 1. Landing Page (`/`)

Kurumsal ana sayfa yapısıdır. Her tema için ayrı ayrı component olarak geliştirilebilir.

**Alt Bölümler:**

- **Hero alanı**: Büyük başlık, açıklama metni, CTA butonları, ilgi çekici arka plan (görsel, video, animasyon).
- **Hakkımızda**: Şirket/birey tanıtımı, misyon & vizyon gibi bölümler.
- **Hizmet kartları**: Responsive grid üzerinde ikon, başlık, açıklama içeren kartlar.
- **Müşteri yorumları**: Swiper.js gibi slider'lar ile referans gösterimi.
- **CTA alanları**: "Ücretsiz Danışmanlık Alın", "Bize Ulaşın" gibi formlar ve butonlar.

**Teknik Detaylar:**

- Konum: `themes/default/components/Landing/*`
- Sayfa: `/app/page.tsx`
- Responsive yapı: Tailwind grid & flex kullanımı

**Örnek Component:**

```tsx
// components/Landing/Hero.tsx
export default function Hero() {
  return (
    <section className="text-center py-16 bg-gray-100 dark:bg-neutral-900">
      <h1 className="text-4xl font-bold">Fixral ile Dijital Dönüşüm</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        Profesyonel web çözümleri, blog sistemleri ve portföy tanıtımı bir arada.
      </p>
    </section>
  )
}
```

**Landing Page Component Yapısı:**

```
/components/Landing/
  Hero.tsx
  About.tsx
  Services.tsx
  Testimonials.tsx
  CallToAction.tsx
```

**Dosya Açıklamaları:**

- `Hero.tsx`: Açılış başlığı ve tanıtım
- `About.tsx`: Hakkımızda metinleri ve görsel alan
- `Services.tsx`: Hizmet kartları (ikon + başlık + açıklama)
- `Testimonials.tsx`: Müşteri referansları slider'ı
- `CallToAction.tsx`: CTA butonları ve iletişim tetikleyicisi

**Sayfa Kullanımı:**

```tsx
// app/page.tsx
import Hero from '@/themes/default/components/Landing/Hero'
import About from '@/themes/default/components/Landing/About'
import Services from '@/themes/default/components/Landing/Services'
import Testimonials from '@/themes/default/components/Landing/Testimonials'
import CallToAction from '@/themes/default/components/Landing/CallToAction'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Services />
      <Testimonials />
      <CallToAction />
    </main>
  )
}
```

---

### 2. Blog Modülü (`/blog`)

Blog içeriklerinin MongoDB'den dinamik olarak yüklendiği, markdown destekli bir sistemdir.

**Alt Bölümler:**

- **Blog listesi**: `/blog/page.tsx` dosyasında kart yapısı (resim, başlık, kısa açıklama).
- **Detay sayfası**: `/blog/[slug]/page.tsx` - içeriğin markdown'dan parse edilmesi.
- **Filtreleme**: Kategori veya tag sistemine göre filtreleme (isteğe bağlı).

**Teknik Detaylar:**

- Model: `models/Blog.ts`
- Markdown desteği: `react-markdown`, `rehype-*` pluginleri
- SEO: `generateMetadata` fonksiyonları ile sayfa başlığı, açıklama, sosyal paylaşım görselleri

**Örnek Blog Modeli:**

```ts
// models/Blog.ts
import mongoose from 'mongoose'

const BlogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  author: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema)
```

---

### 3. Portföy Modülü (`/portfolio`)

Projelerin sergilendiği bir yapı. Kategorilere göre filtreleme, detay sayfaları ve galeri desteklidir.

**Alt Bölümler:**

- **Proje listesi**: Grid layout, kategoriye göre filtre (button ya da dropdown tabanlı).
- **Detay sayfası**: `/portfolio/[slug]/page.tsx` - proje görselleri, kısa açıklamalar, kullanılan teknolojiler, bağlantılar.
- **Galeri**: Cloudinary üzerinden dinamik görsel yönetimi (carousel destekli).

**Teknik Detaylar:**

- Model: `models/Project.ts`
- Görseller: Cloudinary upload + gallery component
- Slug bazlı route: `generateStaticParams()` + `generateMetadata()` kullanımı

---

### 4. Admin Panel (`/dashboard`)

Giriş yapan yöneticilere açık olan, içerik yönetimi, kullanıcı yönetimi ve tema kontrol sistemidir.

**Alt Bölümler:**

- **Giriş yap**: NextAuth (Google, Github, Credentials Provider)
- **Blog yönetimi**: Yeni blog yazısı ekleme, mevcut yazıları düzenleme/silme
- **Proje yönetimi**: Portföy girişleri oluşturma, resim yükleme, kategori seçimi
- **Tema yönetimi**: Açık/Koyu tema geçişi, sistem varsayılanını belirleme
- **Kullanıcı profili**: Şifre değişikliği, kullanıcı bilgileri, avatar güncelleme

**Teknik Detaylar:**

- Kimlik kontrol: `middleware.ts` + session kontrolü
- Upload: Cloudinary + React Hook Form / Zod Validation
- Sayfa konumu: `/app/dashboard/page.tsx` + modül alt sayfaları (`/blog/edit`, `/portfolio/edit`, vb)
- CRUD: API routes ya da Server Actions ile yapılır

**Örnek Admin Blog Editörü:**

```tsx
// components/Dashboard/BlogEditor.tsx
'use client'
import { useForm } from 'react-hook-form'

export default function BlogEditor() {
  const { register, handleSubmit } = useForm()
  const onSubmit = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('title')} placeholder="Başlık" className="input" />
      <textarea {...register('content')} placeholder="İçerik" className="textarea" />
      <button type="submit" className="btn">Kaydet</button>
    </form>
  )
}
```

---

## 🔐 Kimlik Doğrulama & Middleware

```ts
// middleware.ts
import { getToken } from "next-auth/jwt"
export async function middleware(req) {
  const token = await getToken({ req })
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}
```

---

## 🎨 Tema Yapısı & Tailwind Entegrasyonu

- `ThemeProvider.tsx` ile context bazlı tema geçişi (dark/light)
- Tailwind `darkMode: 'class'` yapısı kullanılır
- `_app.tsx` veya `layout.tsx` seviyesinde tema context uygulanır

---

## 🌐 Çoklu Dil (i18n)

- `next-intl` kullanılır
- `i18n/config.ts` → desteklenen diller: `tr`, `en`, `es`
- URL bazlı yönlendirme: `/tr`, `/en`, `/es`
- Tüm UI componentleri `useTranslations()` ile çevrilidir

---

Bu doküman doğrudan AI sistemlerinde veya otomatik kurulum sistemlerinde kullanılmak üzere tek parça olarak yapılandırılmıştır. Her bölüm, geliştiricinin tek başına veya otomasyon ile kurulum yapabilmesine uygun şekilde kapsamlıdır.

➡ Şimdi istersen, diğer modüller için (örneğin: iletişim, mağaza, SSS) yapı tasarlayabiliriz veya dosya sistemine gerçek örnek .tsx/.ts dosyaları çıkartabiliriz.

