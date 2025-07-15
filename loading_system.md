# 🧹 Modüler Skeleton ve Loading Sistemi – Next.js 14 (App Router)

Bu doküman, Next.js 14 + TypeScript ile geliştirilen projelerde, **Skeleton yükleme ekranı** sisteminin **modüler**, **yeniden kullanılabilir** ve **env/config kontrollü** hale getirilmesi için hazırlanmıştır.

---

## 🌟 Amaç

- **Tek bir merkezden yönetilebilir** Skeleton yapısı
- **Sayfalara kolayca entegre edilebilir** (HOC veya layout/`loading.tsx`)
- `env` veya `config.ts` dosyasından **aktif/pasif edilebilir**
- Kod tekrarını önleyerek **geliştirilebilirliği artırır**

---

## 📁 Klasör Yapısı Önerisi

```
/components
  └── SkeletonLoader.tsx
  └── withSkeleton.tsx

/lib
  └── config.ts

/app
  └── [locale]/[...routes]/
       └── page.tsx
       └── loading.tsx (opsiyonel)
```

---

## 1⃣ `SkeletonLoader` Bileşeni

**Yolu:** `components/SkeletonLoader.tsx`

```tsx
'use client';

import React from 'react';
import clsx from 'clsx';

interface SkeletonLoaderProps {
  isActive?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  isActive = true,
  children,
  className,
}) => {
  if (!isActive) return <>{children}</>;

  return (
    <div className={clsx("animate-pulse space-y-4", className)}>
      <div className="h-6 bg-gray-300 rounded w-1/2" />
      <div className="h-4 bg-gray-300 rounded w-3/4" />
      <div className="h-4 bg-gray-300 rounded w-full" />
    </div>
  );
};
```

---

## 2⃣ Global Ayar Dosyası (`config.ts`)

**Yolu:** `lib/config.ts`

```ts
export const appConfig = {
  showSkeleton: process.env.NEXT_PUBLIC_SHOW_SKELETON === 'true',
};
```

`.env.local` dosyasına ekle:

```env
NEXT_PUBLIC_SHOW_SKELETON=true
```

> `false` yaparak tüm sistem pasif edilebilir.

---

## 3⃣ HOC (Higher-Order Component) ile Sarma

**Yolu:** `components/withSkeleton.tsx`

```tsx
import React from 'react';
import { appConfig } from '@/lib/config';
import { SkeletonLoader } from './SkeletonLoader';

export function withSkeleton<T>(WrappedComponent: React.ComponentType<T>) {
  return function WithSkeletonWrapper(props: T) {
    const isLoading = false; // Dinamik bir kontrol mekanizması entegre edilebilir
    return (
      <>
        {isLoading && appConfig.showSkeleton ? (
          <SkeletonLoader />
        ) : (
          <WrappedComponent {...props} />
        )}
      </>
    );
  };
}
```

---

## 4⃣ Sayfada Kullanım Örneği

```tsx
// app/projects/page.tsx
import { withSkeleton } from '@/components/withSkeleton';
import ProjectsPage from './ProjectsPage';

export default withSkeleton(ProjectsPage);
```

> `ProjectsPage` bileşeninde `isLoading` durumuna göre `SkeletonLoader` otomatik devreye girer.

---

## 5⃣ App Router `loading.tsx` ile Entegre (Opsiyonel)

App Router yapısında, her route için `loading.tsx` kullanılabilir.

```tsx
// app/projects/loading.tsx
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { appConfig } from '@/lib/config';

export default function Loading() {
  if (!appConfig.showSkeleton) return null;
  return <SkeletonLoader />;
}
```

---

## 🔧 Geliştirme Notları

- `isLoading` değeri sabit değil, `context`, `fetch`, `router`, vs. ile entegre edilebilir
- `SkeletonLoader` bileşeni `children` alabilir ve özelleşebilir
- Farklı türde skeleton'lar (liste, detay, kart vs.) için `variant` destekli geliştirilebilir

---

## 🗪 Örnek Kullanım: Custom Skeleton

```tsx
<SkeletonLoader isActive={true}>
  <div className="bg-white p-4 shadow rounded">Gerçek içerik yüklendiğinde burası görünür</div>
</SkeletonLoader>
```

---

## ↺ Sistem Nasıl Aktif/Pasif Edilir?

`.env.local` üzerinden:

```env
NEXT_PUBLIC_SHOW_SKELETON=true  // Aktif
NEXT_PUBLIC_SHOW_SKELETON=false // Pasif
```

> Bu yapı CI/CD süreçlerinde staging ya da production için davranış kontrolü sağlar.

---

## ✅ Avantajlar

- Tek bir merkezden yönetim
- Hızlıca devreye alınabilir veya kapatılabilir
- Sayfa bazlı farklı görünüler ükretebilir
- Kod tekrarsızlığı ve temizlik

---

Bu sistemi daha da geliştirmek için `zustand`, `context`, `router`, `Suspense`, vs. gibi yapılar entegre edilebilir.

