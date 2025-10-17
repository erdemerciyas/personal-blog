# 🔗 Entegrasyon Rehberi

Bu rehber, eklenen yeni özelliklerin projeye nasıl entegre edileceğini açıklamaktadır.

---

## 📋 İçindekiler

1. [Dependencies Kurulumu](#dependencies-kurulumu)
2. [Error Handling Entegrasyonu](#error-handling-entegrasyonu)
3. [Advanced Logging](#advanced-logging)
4. [Caching Sistemi](#caching-sistemi)
5. [Image Optimization](#image-optimization)
6. [Schema Markup](#schema-markup)
7. [E2E Testing](#e2e-testing)
8. [API Documentation](#api-documentation)

---

## Dependencies Kurulumu

### 1. Yeni Paketleri Yükle

```bash
npm install
```

Bu komut `package.json`'da tanımlı tüm yeni paketleri yükleyecektir:
- `redis@^4.6.11` - Redis client
- `@playwright/test@^1.40.0` - E2E testing

### 2. Playwright Browsers'ı Kur

```bash
npx playwright install
```

---

## Error Handling Entegrasyonu

### API Route'larda Kullanım

```typescript
import { createError, handleApiError } from '@/lib/errorHandler';
import { logDetailedError, categorizeError } from '@/lib/error-utils';

export async function GET(request: NextRequest) {
  try {
    // İşlem yap
    if (!data) {
      throw createError.notFound('Data not found');
    }
    
    return NextResponse.json(data);
  } catch (error) {
    // Detaylı hata logging
    logDetailedError(error as Error, {
      endpoint: '/api/endpoint',
      method: 'GET',
      requestId: 'req-123'
    });
    
    // Error response döndür
    return handleApiError(error as Error, request);
  }
}
```

### Error Kategorileri

```typescript
import { categorizeError, getRecoveryStrategy } from '@/lib/error-utils';

const category = categorizeError(error);
const strategy = getRecoveryStrategy(category);

if (strategy.retry) {
  // Retry işlemi yap
}
```

---

## Advanced Logging

### Structured Logging

```typescript
import { advancedLogger } from '@/lib/advanced-logger';

// Context ile logging
advancedLogger.logWithContext(
  'info',
  'User logged in',
  'AUTH',
  { userId: '123', email: 'user@example.com' },
  undefined,
  'req-123',
  'user-123'
);

// Performance tracking
advancedLogger.measurePerformance('database_query', async () => {
  return await db.query();
});

// Analytics
advancedLogger.logAnalytics('portfolio_viewed', 'user-123', {
  projectId: 'proj-1',
  duration: 5000
});
```

### Log İstatistikleri

```typescript
// Performance stats
const stats = advancedLogger.getPerformanceStats();
console.log(stats);
// {
//   totalOperations: 100,
//   successfulOperations: 95,
//   failedOperations: 5,
//   averageDuration: 250,
//   slowestOperation: {...},
//   fastestOperation: {...}
// }

// Analytics summary
const summary = advancedLogger.getAnalyticsSummary();
console.log(summary);
// { portfolio_viewed: 50, portfolio_created: 5, ... }
```

---

## Caching Sistemi

### Cache Manager Kullanımı

```typescript
import { cacheManager, CACHE_KEYS, CACHE_TAGS } from '@/lib/redis-cache';

// Basit cache
cacheManager.set('key', data, { ttl: 3600 });
const cached = cacheManager.get('key');

// Cache-aside pattern
const data = await cacheManager.getOrSet(
  CACHE_KEYS.PORTFOLIO,
  () => fetchPortfolio(),
  { ttl: 3600, tags: [CACHE_TAGS.PORTFOLIO] }
);

// Tag bazında invalidation
cacheManager.invalidateByTag(CACHE_TAGS.PORTFOLIO);

// Batch operations
const results = cacheManager.mget(['key1', 'key2', 'key3']);
cacheManager.mset([
  ['key1', data1, { ttl: 3600 }],
  ['key2', data2, { ttl: 3600 }]
]);

// Cache statistics
const stats = cacheManager.getStats();
console.log(stats);
// { size: 10, maxSize: 1000, entries: 10, tags: 5 }
```

### Önceden Tanımlı Anahtarlar

```typescript
CACHE_KEYS.PORTFOLIO        // 'portfolio'
CACHE_KEYS.PORTFOLIO_ITEM   // 'portfolio:item'
CACHE_KEYS.PRODUCTS         // 'products'
CACHE_KEYS.SERVICES         // 'services'
CACHE_KEYS.SITE_SETTINGS    // 'site:settings'
```

---

## Image Optimization

### Enhanced Image Component

```typescript
import { OptimizedImageEnhanced, HeroImageEnhanced } from '@/components/OptimizedImageEnhanced';

// Temel kullanım
<OptimizedImageEnhanced
  src="https://example.com/image.jpg"
  alt="Description"
  width={1200}
  height={800}
  quality={80}
  enableOptimization={true}
/>

// Hero image
<HeroImageEnhanced
  src="https://example.com/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
/>

// Responsive image
<ResponsiveImage
  src="https://example.com/image.jpg"
  alt="Description"
  width={1200}
  height={800}
/>
```

### Image Optimizer Utility

```typescript
import { imageOptimizer } from '@/lib/image-optimizer';

// Optimize URL
const optimized = imageOptimizer.generateOptimizedUrl(
  'https://example.com/image.jpg',
  { quality: 80, width: 1200, format: 'webp' }
);

// Responsive srcSet
const srcSet = imageOptimizer.generateSrcSet(
  'https://example.com/image.jpg'
);

// Picture element
const picture = imageOptimizer.generatePictureElement(
  'https://example.com/image.jpg',
  'Alt text'
);

// Recommendations
const recommendations = imageOptimizer.getRecommendations(imageUrl);
```

---

## Schema Markup

### React Component Kullanımı

```typescript
import { StructuredData, BreadcrumbStructuredData, ProductStructuredData } from '@/components/seo/StructuredData';

// Organization
<StructuredData type="organization" data={{}} />

// Breadcrumb
<BreadcrumbStructuredData items={[
  { name: 'Home', url: '/' },
  { name: 'Portfolio', url: '/portfolio' }
]} />

// Product
<ProductStructuredData
  name="Product Name"
  description="Description"
  image="image.jpg"
  price={99.99}
  currency="USD"
  rating={4.5}
  reviewCount={100}
/>

// Blog Posting
<BlogPostingStructuredData
  title="Blog Title"
  description="Description"
  image="image.jpg"
  datePublished="2025-01-01"
  dateModified="2025-01-02"
  author="Author Name"
  url="https://example.com/blog"
/>

// Video
<VideoStructuredData
  name="Video Title"
  description="Description"
  thumbnailUrl="thumb.jpg"
  uploadDate="2025-01-01"
  duration="PT5M30S"
  embedUrl="https://youtube.com/embed/..."
/>
```

### Schema Generator Kullanımı

```typescript
import { schemaMarkupGenerator } from '@/lib/schema-markup';

// Organization schema
const org = schemaMarkupGenerator.generateOrganizationSchema();

// Product schema
const product = schemaMarkupGenerator.generateProductSchema(
  'Product Name',
  'Description',
  'image.jpg',
  99.99
);

// Breadcrumb schema
const breadcrumb = schemaMarkupGenerator.generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Portfolio', url: '/portfolio' }
]);

// JSON-LD string
const jsonLd = schemaMarkupGenerator.toJsonLd(schema);
```

---

## E2E Testing

### Test Çalıştırma

```bash
# Tüm E2E testleri çalıştır
npm run test:e2e

# UI mode ile testleri çalıştır
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Tüm testleri çalıştır (unit + E2E)
npm run test:all
```

### Test Yazma

```typescript
import { test, expect } from '@playwright/test';

test.describe('Portfolio Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio');
  });

  test('should load portfolio page', async ({ page }) => {
    await expect(page).toHaveTitle(/Portfolio/i);
  });

  test('should display portfolio items', async ({ page }) => {
    const items = page.locator('[data-testid="portfolio-item"]');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });
});
```

---

## API Documentation

### Swagger UI Erişimi

```
http://localhost:3000/api/docs
```

### API Endpoint'leri

```
GET  /api/swagger          - OpenAPI specification
GET  /api/portfolio        - Portfolio items
POST /api/portfolio        - Create portfolio item
GET  /api/products         - Products
GET  /api/services         - Services
GET  /api/videos           - Videos
POST /api/contact          - Contact form
GET  /api/health           - Health check
```

---

## GitHub Actions Entegrasyonu

### Workflow Dosyası

`.github/workflows/e2e-tests.yml` otomatik olarak:
- E2E testleri çalıştırır
- Unit testleri çalıştırır
- Coverage raporlarını oluşturur
- Linting ve type checking yapar
- Security audit yapar

### Workflow Tetikleme

- `main` branch'e push
- `develop` branch'e push
- Pull request oluşturulduğunda

---

## Checklist

### Kurulum
- [ ] `npm install` çalıştır
- [ ] `npx playwright install` çalıştır
- [ ] Environment variables'ı ayarla

### Entegrasyon
- [ ] Error handling'i API routes'lara ekle
- [ ] Advanced logger'ı kullan
- [ ] Cache manager'ı API routes'lara entegre et
- [ ] Image optimizer'ı bileşenlere ekle
- [ ] Schema markup'ı sayfalara ekle

### Testing
- [ ] E2E testleri çalıştır
- [ ] Unit testleri çalıştır
- [ ] Coverage raporlarını kontrol et
- [ ] GitHub Actions workflow'unu test et

### Deployment
- [ ] Production environment variables'ı ayarla
- [ ] Redis server'ı kur (production)
- [ ] Swagger UI'ı test et
- [ ] API endpoints'leri test et

---

## Sorun Giderme

### Redis Bağlantı Hatası

```typescript
// In-memory cache fallback otomatik olarak kullanılır
// Production'da Redis server'ı kur
```

### Playwright Kurulum Hatası

```bash
npx playwright install --with-deps
```

### Swagger UI Yüklenmedi

```bash
npm install swagger-ui-react
```

### Test Timeout

```typescript
// playwright.config.ts
timeout: 30000, // 30 seconds
```

---

## Kaynaklar

- [Error Handling](./src/lib/error-utils.ts)
- [Advanced Logger](./src/lib/advanced-logger.ts)
- [Cache Manager](./src/lib/redis-cache.ts)
- [Image Optimizer](./src/lib/image-optimizer.ts)
- [Schema Markup](./src/lib/schema-markup.ts)
- [E2E Tests](./e2e/)
- [API Documentation](./src/app/api/docs/page.tsx)

---

**Son Güncelleme**: 17 Ekim 2025  
**Versiyon**: 2.6.0
