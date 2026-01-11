# WordPress-like Template & Plugin System

Bu dokümantasyon, projenizde uygulanan WordPress benzeri template ve plugin sistemini açıklar.

## 📚 İçindekiler

1. [Sistem Genel Bakış](#sistem-genel-bakış)
2. [Template Sistemi](#template-sistemi)
3. [Plugin Sistemi](#plugin-sistemi)
4. [Kullanım](#kullanım)
5. [Geliştirme](#geliştirme)
6. [API Referansı](#api-referansı)

---

## 🎯 Sistem Genel Bakış

Bu sistem, WordPress'in esnekliğini Next.js'in modern performansıyla birleştirir. İki ana bileşenden oluşur:

- **Template Sistemi**: Site görünümünü ve layout'larını yönetir
- **Plugin Sistemi**: Site özelliklerini genişletmek için hook ve component injection sağlar

### Temel Özellikler

✅ Dinamik tema değiştirme
✅ Page template'leri (home, blog, single, archive)
✅ WordPress benzeri action ve filter hooks
✅ Component injection ve widget desteği
✅ Plugin bağımlılık yönetimi
✅ Admin panelinden tema/plugin yönetimi
✅ TypeScript ile type safety
✅ MongoDB ile kalıcı depolama

---

## 🎨 Template Sistemi

### Yapı

```
src/
├── themes/
│   ├── default/              # Varsayılan tema
│   │   ├── theme.config.ts   # Tema konfigürasyonu
│   │   ├── components/       # Temaya özel componentler
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── layouts/
│   │   │       ├── DefaultLayout.tsx
│   │   │       └── BlogLayout.tsx
│   │   └── templates/       # Page template'leri
│   │       ├── HomeTemplate.tsx
│   │       ├── PageTemplate.tsx
│   │       └── SingleTemplate.tsx
│   └── modern/              # Alternatif tema
│       └── ...
```

### Tema Konfigürasyonu

Her tema bir `theme.config.ts` dosyası içermelidir:

```typescript
import { ITheme } from '../../models/Theme';

export const themeConfig: Partial<ITheme> = {
  name: 'My Theme',
  slug: 'my-theme',
  version: '1.0.0',
  author: 'Your Name',
  description: 'Tema açıklaması',
  thumbnail: '/themes/my-theme/thumbnail.png',
  config: {
    colors: {
      primary: '#003450',
      secondary: '#3A506B',
      accent: '#003450',
      background: '#F8F9FA',
      text: '#3D3D3D',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    layout: {
      maxWidth: 1280,
      sidebar: false,
      headerStyle: 'fixed',
      footerStyle: 'simple',
    },
    features: {
      heroSlider: true,
      portfolioGrid: true,
      blogList: true,
      contactForm: true,
    },
  },
  templates: [
    {
      id: 'home-custom',
      name: 'Custom Home',
      type: 'home',
      component: 'templates/HomeTemplate',
      screenshot: '/themes/my-theme/screenshots/home.png',
    },
    // ... daha fazla template
  ],
};
```

### Template Oluşturma

Template'ler React component'leri olarak oluşturulur:

```typescript
// src/themes/my-theme/templates/HomeTemplate.tsx
import React from 'react';

interface HomeTemplateProps {
  sliderItems?: any[];
  portfolioItems?: any[];
}

export default function HomeTemplate({
  sliderItems = [],
  portfolioItems = [],
}: HomeTemplateProps) {
  return (
    <div className="home-template">
      {/* Template içeriği */}
      <h1>Welcome to My Theme</h1>
      {/* ... */}
    </div>
  );
}
```

### Tema Kullanımı

```typescript
import { themeEngine } from '@/core/theme/ThemeEngine';

// Tema yükle
await themeEngine.loadTheme('my-theme');

// Template render
const template = themeEngine.renderTemplate('home-custom', { 
  sliderItems, 
  portfolioItems 
});

// CSS değişkenleri al
const cssVars = themeEngine.getThemeCSSVariables();
```

---

## 🔌 Plugin Sistemi

### Yapı

```
src/
├── plugins/
│   ├── core/
│   │   ├── HookSystem.ts      # Hook sistemi
│   │   ├── PluginManager.ts   # Plugin yöneticisi
│   │   └── index.ts
│   ├── built-in/
│   │   ├── seo-plugin/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   │       └── SeoWidget.tsx
│   │   └── analytics-plugin/
│   │       └── ...
│   └── custom/               # Kullanıcı plugin'leri
│       └── ...
```

### Hook Sistemi

WordPress benzeri action ve filter hooks:

#### Action Hooks

Action hooks, belirli olaylarda çalıştırılan callback'lerdir:

```typescript
import { hookSystem } from '@/plugins/core/HookSystem';

// Action hook ekle
hookSystem.addAction('page:loaded', (page) => {
  console.log('Page loaded:', page.title);
  // Analytics tracking, vb.
}, 10, 'my-plugin');

// Action hook çalıştır
hookSystem.doAction('page:loaded', { title: 'My Page' });
```

#### Filter Hooks

Filter hooks, değerleri değiştirmek için kullanılır:

```typescript
// Filter hook ekle
hookSystem.addFilter('page:meta', (meta, page) => {
  return {
    ...meta,
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt,
  };
}, 10, 'my-plugin');

// Filter uygula
const filteredMeta = hookSystem.applyFilters('page:meta', meta, page);
```

### Plugin Oluşturma

Her bir plugin bir `index.ts` dosyası içermelidir:

```typescript
// src/plugins/custom/my-plugin/index.ts
import { hookSystem } from '../../core/HookSystem';

// Plugin başlatma fonksiyonu
export async function init(hookSystem: any) {
  console.log('[My Plugin] Initializing...');

  // Hook'ları kaydet
  hookSystem.addFilter('page:content', (content: string, page: any) => {
    // İçeriği değiştir
    return content + '<div class="my-plugin-content">...</div>';
  }, 10, 'my-plugin');

  console.log('[My Plugin] Initialized successfully');
}

// Widget component
export function MyWidget() {
  return (
    <div className="my-widget">
      {/* Widget içeriği */}
    </div>
  );
}
```

### Plugin Konfigürasyonu

Plugin'ler veritabanında şu yapıya sahip olmalıdır:

```typescript
{
  name: 'My Plugin',
  slug: 'my-plugin',
  version: '1.0.0',
  author: 'Your Name',
  description: 'Plugin açıklaması',
  isActive: true,
  type: 'custom',
  config: {},
  hooks: [
    {
      name: 'page:content',
      callback: 'filterContent',
      priority: 10,
    },
  ],
  components: [
    {
      id: 'my-widget',
      type: 'widget',
      component: 'components/MyWidget',
      name: 'My Widget',
    },
  ],
  dependencies: [],
}
```

---

## 🚀 Kullanım

### Admin Panelinden Tema Yönetimi

1. `/admin/themes` sayfasına gidin
2. Mevcut temaları görüntüleyin
3. "Temayı Aktifleştir" butonuna tıklayın
4. Sayfa otomatik olarak yeniden yüklenir

### Admin Panelinden Plugin Yönetimi

1. `/admin/plugins` sayfasına gidin
2. Mevcut plugin'leri görüntüleyin
3. "Aktifleştir" veya "Devre Dışı Bırak" butonuna tıklayın
4. Plugin otomatik olarak yüklenir veya kaldırılır

### Programatik Kullanım

```typescript
import { themeEngine } from '@/core/theme/ThemeEngine';
import { pluginManager } from '@/plugins/core/PluginManager';

// Tüm plugin'leri yükle
await pluginManager.loadAllPlugins();

// Aktif temayı yükle
await themeEngine.loadActiveTheme();

// Belirli bir plugin yükle
await pluginManager.loadPlugin('seo-plugin');

// Plugin component'ini al
const Component = await pluginManager.getComponent('my-widget');
```

---

## 🛠️ Geliştirme

### Yeni Tema Oluşturma

1. `src/themes/` altında yeni bir klasör oluşturun
2. `theme.config.ts` dosyası oluşturun
3. `components/` ve `templates/` klasörlerini oluşturun
4. Template component'lerini yazın
5. Temayı veritabanına ekleyin
6. Admin panelinden aktifleştirin

### Yeni Plugin Oluşturma

1. `src/plugins/custom/` altında yeni bir klasör oluşturun
2. `index.ts` dosyası oluşturun
3. `init()` fonksiyonu yazın
4. Gerekirse component'ler oluşturun
5. Plugin'i veritabanına ekleyin
6. Admin panelinden aktifleştirin

### Hook İsimleri

Sistemde kullanılabilir hook'lar:

| Hook Adı | Tip | Açıklama |
|-----------|------|------------|
| `theme:loaded` | Action | Tema yüklendiğinde |
| `plugin:loaded` | Action | Plugin yüklendiğinde |
| `plugin:unloaded` | Action | Plugin kaldırıldığında |
| `page:meta` | Filter | Sayfa meta verilerini filtrele |
| `page:head` | Filter | Sayfa head içeriğini filtrele |
| `page:content` | Filter | Sayfa içeriğini filtrele |
| `template:props` | Filter | Template props'larını filtrele |
| `theme:variables` | Filter | Tema CSS değişkenlerini filtrele |

---

## 📡 API Referansı

### Tema API'leri

#### GET /api/admin/themes
Tüm temaları listeler

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Default Theme",
      "slug": "default",
      "isActive": true,
      "config": { ... }
    }
  ]
}
```

#### POST /api/admin/themes/activate
Tema aktifleştirir

**Request:**
```json
{
  "slug": "default"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Theme Default Theme activated successfully"
}
```

### Plugin API'leri

#### GET /api/admin/plugins
Tüm plugin'leri listeler

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "SEO Plugin",
      "slug": "seo-plugin",
      "isActive": true,
      "type": "built-in"
    }
  ]
}
```

#### POST /api/admin/plugins/toggle
Plugin aktifleştirir veya devre dışı bırakır

**Request:**
```json
{
  "slug": "seo-plugin"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Plugin SEO Plugin activated successfully"
}
```

---

## 🔒 Güvenlik

### Plugin Güvenliği

- Plugin'ler sandbox ortamında çalışır
- Kullanıcı girdisi her zaman sanitize edilir
- Plugin bağımlılıkları kontrol edilir
- Hatalı plugin'ler otomatik olarak devre dışı bırakılır

### Tema Güvenliği

- Tema CSS değişkenleri escape edilir
- Template component'leri type-safe
- XSS koruması otomatik olarak uygulanır

---

## 📝 Örnekler

### Basit SEO Plugin

```typescript
// src/plugins/custom/seo-enhancer/index.ts
import { hookSystem } from '../../core/HookSystem';

export async function init(hookSystem: any) {
  hookSystem.addFilter('page:meta', (meta: any, page: any) => {
    return {
      ...meta,
      title: `${page.title} | My Site`,
      description: page.excerpt?.substring(0, 160),
    };
  }, 10, 'seo-enhancer');
}
```

### Basit Widget

```typescript
// src/plugins/custom/my-widget/index.ts
import React from 'react';

export function MyWidget({ title }: { title: string }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-bold mb-2">{title}</h3>
      <p>Widget içeriği</p>
    </div>
  );
}
```

---

## 🤝 Katkıda Bulunma

Bu sistem geliştirilmeye açıktır. Katkıda bulunmak için:

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi yapın
4. Test edin
5. Pull request gönderin

---

## 📄 Lisans

MIT License - Ayrıntılı bilgi için LICENSE dosyasına bakın

---

## 💡 İpuçları

1. **Performans**: Plugin'leri lazy loading ile yükleyin
2. **Debug**: Development modunda hook'lar loglanır
3. **Test**: Her plugin ve tema için test yazın
4. **Dokümantasyon**: Plugin'lerinizi iyi dokümante edin
5. **Type Safety**: TypeScript kullanarak hataları önleyin

---

## 🆘 Sorun Giderme

### Plugin Yüklenmiyor

1. Plugin'in `index.ts` dosyasını kontrol edin
2. `init()` fonksiyonunun export edildiğinden emin olun
3. Console'da hata mesajlarını kontrol edin

### Tema Uygulanmıyor

1. Tema config'ini kontrol edin
2. Template component'lerinin doğru export edildiğinden emin olun
3. CSS değişkenlerinin tanımlandığından emin olun

### Hook'lar Çalışmıyor

1. Hook adının doğru olduğundan emin olun
2. Priority değerini kontrol edin
3. Plugin'in aktif olduğundan emin olun

---

## 📞 Destek

Sorularınız için:
- GitHub Issues: [repository-url]/issues
- Email: support@example.com
- Dokümantasyon: [repository-url]/wiki
