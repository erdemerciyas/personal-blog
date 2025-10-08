# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.2] - 2025-10-08

### Added
- **Cloudinary Günlük Kayıtları**: Cloudinary upload işlemlerine detaylı günlük kayıtları eklendi
- **Güvenlik Geliştirmeleri**: Dosya yükleme işlemlerine magic number doğrulaması eklendi
- **Hata Ayıklama Geliştirmeleri**: Cloudinary konfigürasyon hataları için detaylı günlük kayıtları

### Changed
- **Cloudinary Versiyonu**: Cloudinary kütüphanesi 1.41.0'dan 2.7.0 sürümüne yükseltildi
- **Upload Route'ları**: Admin upload route'larına detaylı loglama eklendi
- **README Güncellemesi**: Son deploy tarihi ve versiyon bilgisi güncellendi

### Removed
- **Gereksiz Debug Dosyaları**: Geliştirme amaçlı kullanılan debug-cloudinary klasörü kaldırıldı

### Fixed
- **Build Uyarıları**: Sentry entegrasyonu olmayan projede oluşan build uyarıları düzeltildi
- **Cloudinary Konfigürasyonu**: Cloudinary konfigürasyon eksikliği durumunda hata loglama eklendi

## [2.5.1] - 2025-01-27

### Fixed
- **Portfolio Sıralama**: En yeni projeler artık doğru şekilde en üstte görünüyor
- **API Optimizasyonu**: MongoDB aggregate ile güvenilir sıralama sistemi
- **Frontend Sıralama**: Sıralama mantığı düzeltildi (desc/asc logic fix)
- **Cache Optimizasyonu**: Random projeler için cache devre dışı bırakıldı

### Changed
- **Container Genişliği**: 64rem'den 74rem'e artırıldı (daha geniş içerik alanı)
- **Anasayfa Portfolio**: Her sayfa yenilemesinde farklı projeler gösteriliyor
- **Featured Filter**: Tüm projeler arasından rastgele seçim yapılıyor

### Fixed (Technical)
- **Hydration Hatası**: Breadcrumb hydration mismatch sorunu çözüldü
- **Image Positioning**: Next.js Image fill prop hataları düzeltildi
- **Manifest Icon**: Bozuk PNG icon dosyası SVG ile değiştirildi
- **Console Temizliği**: Tüm debug logları kaldırıldı

### Removed
- **Gereksiz Dosyalar**: Build artifacts ve geçici dosyalar temizlendi
  - `tsconfig.tsbuildinfo`
  - `youtube-video.md`
  - `EDITOR_UPGRADE.md`
  - `vercel-build-fix.js`
  - `coverage/` klasörü

### Notes
- Bu sürüm portfolyo sıralama sorunlarını tamamen çözer
- Anasayfa artık dinamik ve her ziyarette farklı projeler gösterir
- Kod tabanı temizlendi ve production-ready hale getirildi

## [2.5.0] - 2025-09-25

### Changed
- Versiyon 2.5.0 olarak güncellendi; README rozet ve tarih bilgileri hizalandı
- Ana branch geçmişi sadeleştirildi; kararsız commitler konsolide edildi

### Notes
- Bu sürüm v2.5.0'ı latest olarak işaretler

## [2.4.2] - 2025-01-27

### Fixed
- **ESLint Hata Düzeltmeleri**: Tüm kritik ESLint hataları çözüldü
- **CI/CD Pipeline İyileştirmeleri**: GitHub Actions stabilite artırıldı
- **Code Quality**: ESLint konfigürasyonu optimize edildi

### Added
- **Mail Sistemi**: Gmail SMTP integration tamamlandı
- **Test Araçları**: Mail test ve debug scriptleri eklendi
- **Admin Panel Integration**: Real-time mail status monitoring

## [2.4.0] - 2025-01-27

### Added
- **Gelişmiş Video Yönetim Sistemi**: YouTube video yönetimi tamamen yenilendi
- **Basitleştirilmiş Video Ekleme**: Sadece YouTube linkleri ile video ekleme
- **Toplu Video İşlemleri**: Çoklu seçim ve toplu silme özellikleri
- **API Optimizasyonları**: Yeni endpoint'ler ve performans iyileştirmeleri

### Removed
- **Kanal Yönetimi**: Gereksiz kanal yönetimi modalı kaldırıldı
- **Kullanılmayan Kodlar**: Test script'leri ve gereksiz API route'ları temizlendi

## [2.3.4] - 2025-08-27

### Added
- **Kapsamlı Monitoring Sistemi**: Real-time performance ve error tracking
- **Admin Monitoring Dashboard**: `/admin/monitoring` ile sistem izleme
- **Health Check API**: `/api/health` sistem sağlık endpoint'i
- **Web Vitals Support**: Performance metrics desteği

### Fixed
- **TypeScript Fixes**: Production build hataları düzeltildi
- **Sentry Integration**: Optional Sentry entegrasyonu eklendi

## [2.3.3] - 2025-08-23

### Fixed
- **Sentry Konfigürasyonu**: Deprecated API'lerden yeni SDK'ya geçiş
- **TypeScript Uyumluluk**: JWT ve circular dependency sorunları çözüldü
- **Build Optimizasyonu**: 93 sayfa başarılı derleme

## [2.3.2] - 2025-08-19

### Removed
- **Pattern Sistemi**: Arka plan pattern tasarımı tamamen kaldırıldı
- **Dekoratif Elementler**: Layout'tan gereksiz blob katmanları temizlendi

## [2.3.1] - 2025-08-17

### Added
- **Google Entegrasyonları**: Site verification, GA4 ve GTM desteği
- **Dynamic Scripts**: Google servisleri için otomatik script yükleme

## [2.3.0] - 2025-08-17

### Changed
- **Cloudinary Geçişi**: Tüm medya yönetimi Cloudinary'e taşındı
- **Logo Upload**: Cloudinary entegrasyonu ile logo yükleme
- **Media Migration**: Local medyaları cloud'a taşıma script'i

## [2.2.9] - 2025-08-12

### Fixed
- **TypeScript Temizliği**: Tüm tip hataları giderildi
- **ESLint Uyarıları**: no-explicit-any ve diğer uyarılar temizlendi
- **Build Optimizasyonu**: Hatasız production build

## [2.2.7] - 2025-08-11

### Added
- **Ürün Medyası Ayrıştırma**: Ürün görselleri ayrı klasörlerde yönetiliyor
- **Admin Medya Filtreleri**: Site/Ürün/Hepsi kapsam filtreleri
- **Performance İyileştirmeleri**: Query optimizasyonları ve cache header'ları

## [2.2.5] - 2025-08-10

### Improved
- **Mobil UI Yenilemesi**: Hero, CTA ve navigation mobil optimizasyonları
- **Typography**: Başlık ve metin alanları mobil uyumlu hale getirildi
- **Grid Sistemleri**: Responsive grid yapıları iyileştirildi

## [2.2.4] - 2025-01-27

### Security
- **Production Readiness**: Debug dosyaları ve test endpoint'leri kaldırıldı
- **Middleware Consolidation**: Tüm güvenlik kontrolleri tek middleware'de
- **CSP Hardening**: Production için sıkılaştırılmış Content Security Policy
- **Build Quality**: Kalite kontrolleri aktif hale getirildi

### Cleanup
- **Code Organization**: Gereksiz dosyalar ve kodlar temizlendi
- **Security Hardening**: Test authentication endpoint'leri kaldırıldı
- **GitHub Deployment**: Production-ready commit organizasyonu

---

For older versions and detailed changes, please refer to the git history.