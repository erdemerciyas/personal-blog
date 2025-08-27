# Monitoring ve Performance Sistemi

Bu dokümantasyon, projede kullanılan monitoring ve performance izleme sistemini açıklar.

## Özellikler

### 1. Performance Monitoring
- **Client-side performance**: Sayfa yükleme süreleri, render süreleri
- **Server-side performance**: API endpoint'leri, database sorguları
- **Web Vitals**: CLS, FID, FCP, LCP, TTFB metrikleri
- **Yavaş sayfa uyarıları**: 3 saniyeden uzun yüklenen sayfalar için otomatik uyarı

### 2. Error Tracking
- **React Error Boundary**: Component hatalarını yakalar
- **Unhandled Promise Rejections**: Yakalanmamış promise hatalarını izler
- **Uncaught Exceptions**: Yakalanmamış exception'ları loglar
- **API Error Monitoring**: API endpoint hatalarını takip eder

### 3. Database Monitoring
- **Query Performance**: Yavaş database sorgularını tespit eder (>1s uyarı, >5s kritik)
- **Connection Health**: Database bağlantı durumunu izler
- **Query Breadcrumbs**: Database işlemlerini detaylı loglar

### 4. System Health
- **Health Check Endpoint**: `/api/health` - Sistem sağlığını kontrol eder
- **Memory Usage**: Bellek kullanımını izler
- **CPU Usage**: İşlemci kullanımını takip eder
- **Uptime**: Sistem çalışma süresini gösterir

## Kullanım

### Client-side Monitoring

```tsx
import { usePerformanceMonitoring, useWebVitals } from '@/hooks/usePerformanceMonitoring';
import ErrorBoundary from '@/components/ErrorBoundary';

function MyComponent() {
  const { measureCustomMetric } = usePerformanceMonitoring();
  useWebVitals(); // Web Vitals otomatik olarak izlenir

  const handleSlowOperation = async () => {
    const startTime = Date.now();
    await someSlowOperation();
    const duration = Date.now() - startTime;
    
    measureCustomMetric('slow_operation_duration', duration);
  };

  return (
    <ErrorBoundary>
      <div>My Component Content</div>
    </ErrorBoundary>
  );
}
```

### Server-side Monitoring

```typescript
import { APIMonitor, PerformanceMonitor } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  return APIMonitor.monitorEndpoint('my-endpoint', async () => {
    // Database işlemi için monitoring
    const result = await PerformanceMonitor.measureDatabaseQuery(
      'user-fetch',
      async () => {
        return await User.findById(userId);
      },
      { userId }
    );

    return NextResponse.json(result);
  }, request);
}
```

### Error Boundary Kullanımı

```tsx
import ErrorBoundary, { withErrorBoundary } from '@/components/ErrorBoundary';

// Direkt kullanım
function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}

// HOC ile kullanım
const SafeComponent = withErrorBoundary(MyComponent);

// Custom fallback ile
function AppWithCustomError() {
  return (
    <ErrorBoundary fallback={<div>Özel hata mesajı</div>}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## API Endpoints

### Performance Metrics
- **GET** `/api/monitoring/performance` - Sistem metriklerini getirir
- **POST** `/api/monitoring/performance` - Client metriklerini gönderir

### Health Check
- **GET** `/api/health` - Sistem sağlık durumunu kontrol eder

## Admin Dashboard

Monitoring dashboard'una `/admin/monitoring` adresinden erişebilirsiniz. Dashboard şunları gösterir:

- **Server Metrics**: Uptime, memory usage, CPU usage, active connections
- **Database Status**: Bağlantı durumu, response time, active queries
- **Error Metrics**: Toplam hata sayısı, hata oranı, kritik hatalar
- **Client Performance**: Ortalama yükleme süreleri, yavaş sayfalar

## Konfigürasyon

### Environment Variables

```env
# Sentry (opsiyonel)
SENTRY_DSN=your_sentry_dsn_here

# Database monitoring
MONGODB_URI=your_mongodb_connection_string

# Performance thresholds
SLOW_QUERY_THRESHOLD=1000  # ms
CRITICAL_QUERY_THRESHOLD=5000  # ms
SLOW_PAGE_THRESHOLD=3000  # ms
```

### Sentry Entegrasyonu (Opsiyonel)

Sentry kullanmak için:

1. Sentry paketini yükleyin:
```bash
npm install @sentry/nextjs
```

2. `sentry.client.config.js` ve `sentry.server.config.js` dosyalarını oluşturun

3. Environment variable'ları ayarlayın

Sentry yüklü değilse, sistem otomatik olarak console logging'e geçer.

## Production Optimizasyonları

### Log Levels
- **Development**: Tüm loglar gösterilir
- **Production**: Sadece önemli loglar ve hatalar gösterilir

### Performance
- Yavaş sorgular (>1s) otomatik olarak loglanır
- Kritik yavaş sorgular (>5s) uyarı olarak gönderilir
- Client metrikleri sadece geçerli değerler için gönderilir (0-60s arası)

### Error Handling
- Production'da uncaught exception'lar process'i sonlandırmaz
- Tüm hatalar monitoring servisine gönderilir
- Client-side hatalar sessizce handle edilir

## Troubleshooting

### Common Issues

1. **Sentry not working**: 
   - SENTRY_DSN environment variable'ının doğru ayarlandığından emin olun
   - Sentry paketi yüklü olduğunu kontrol edin

2. **Database monitoring not working**:
   - MONGODB_URI'nin doğru ayarlandığından emin olun
   - Database bağlantısının aktif olduğunu kontrol edin

3. **Performance metrics not showing**:
   - Browser'ın Performance API'sini desteklediğinden emin olun
   - Network bağlantısının stabil olduğunu kontrol edin

### Debug Mode

Development ortamında debug bilgileri için:

```typescript
// Console'da detaylı loglar görmek için
process.env.NODE_ENV = 'development';

// Monitoring debug
PerformanceMonitor.addBreadcrumb('Debug message', 'debug', 'info');
```

## Best Practices

1. **Error Boundaries**: Tüm major component'leri ErrorBoundary ile sarın
2. **Custom Metrics**: Önemli business logic'ler için custom metrikler ekleyin
3. **Database Queries**: Yavaş sorguları optimize edin
4. **Client Performance**: Büyük bundle'ları lazy loading ile optimize edin
5. **Monitoring Alerts**: Kritik metrikler için alert kuralları ayarlayın

## Gelecek Geliştirmeler

- [ ] Real-time dashboard updates
- [ ] Custom alert rules
- [ ] Performance budgets
- [ ] A/B testing metrics
- [ ] User session tracking
- [ ] API rate limiting monitoring