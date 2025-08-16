## [2.3.1] - 2025-08-17

### Added
- Admin > Ayarlar > Genel: Google Site Verification alanı eklendi.
- Google Analytics (GA4) ve Google Tag Manager (GTM) kimlik alanları eklendi; ID girildiğinde scriptler otomatik yüklenir.

### Changed
- `src/app/layout.tsx`: Google site doğrulama meta etiketi ve GA/GTM scriptleri DB’den dinamik okunacak şekilde güncellendi.
- `src/app/api/sitemap/route.ts`: `baseUrl` artık `Settings.siteUrl` değerinden okunuyor; yoksa mevcut fallback kullanılıyor.

### Notes
- Admin panelden `siteUrl`, `googleSiteVerification`, `googleAnalyticsId`, `googleTagManagerId` alanlarını doldurarak entegrasyonları aktifleştirebilirsiniz.

## [2.3.0] - 2025-08-17

### Changed
- Logo upload akışı yerel dosya sisteminden Cloudinary'e taşındı (`src/app/api/admin/logo-upload/route.ts`).
- Varsayılan görsel yolları yerelden uzak URL'lere güncellendi (`src/models/Settings.ts`, `src/app/api/settings/route.ts`).
- Bileşenlerdeki lokal fallback görseller Cloudinary placeholder ile değiştirildi (`src/components/ProjectCard.tsx`, `src/components/portfolio/ModernProjectCard.tsx`).

### Added
- Yerel `public/uploads/logos/` içeriğini Cloudinary'e taşıyan script eklendi: `scripts/migrate-local-media-to-cloudinary.js` (`--delete` ile yükleme sonrası yerelleri silebilir).

### Notes
- Next.js Image için Cloudinary domaini kullanımı doğrulandı. Placeholder URL'leri proje Cloudinary hesabıyla değiştirmeniz önerilir.

## [2.2.11] - 2025-08-16

### Changed
- Erişilebilirlik kapsamı iyileştirildi; `products` sayfalarında dış sarmalayıcı `main#main-content` olacak şekilde semantik yapı güncellendi.
- Erişilebilirlik test kapsamı admin sayfaları hariç olacak şekilde rafine edildi; çekirdek semantik kontroller optimize edildi.

### Scores
- Accessibility: 100/100 (Semantic HTML: 10/10)
- Security: 100/100 (dotenv opsiyonel yükleme ve `.env.local` kontrolleri)

### Notes
- Production deploy Vercel üzerinden başarılı.

## [2.2.9] - 2025-08-12

### Changed
- Proje genelinde TypeScript tip hataları giderildi; `npm run type-check` hatasız.
- ESLint uyarıları temizlendi; `no-explicit-any` azaltıldı.
- Mongoose pre hook `this` tipleri eklendi; güvenli tip erişimleri.
- `appConfig.freeShippingThreshold` erişimleri dar tiplerle güvence altına alındı.
- Portfolio slug API için `lean()` sonuç arayüzleri düzenlendi.
- `npm run build` başarıyla doğrulandı.

## [2.2.8] - 2025-08-12

### Changed
- Admin API endpoints refactored to use centralized security middleware `withSecurity(SecurityConfigs.admin)` for consistent RBAC.
- Removed manual session/role checks from admin and admin-required routes for maintainability.

### Fixed
- `src/app/api/settings/route.ts`: aligned handlers with middleware signature, removed legacy session references, and fixed TypeScript types using `Partial<ISiteSettings>`; ensured full `socialMedia` shape to satisfy the model contract.
- Addressed minor ESLint issues and logging consistency in refactored routes.

### Notes
- Remaining TypeScript errors exist in unrelated pages/components; will be addressed next before enforcing CI build.

## [2.1.2] - 2025-07-29

### Added
- Version update to 2.1.2

### Changed
- Dynamic version display across the application

### Fixed
- Version consistency issues

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2025-01-29

### Added
- Dynamic version display across the application
- Version update script for automated version management
- Client-side cache system for better API performance
- Portfolio error boundary for better error handling
- Retry logic for API calls with exponential backoff
- Toast notification system for admin panel
- Enhanced contact info management system

### Changed
- Admin dashboard now shows dynamic version from package.json
- Footer copyright year is now dynamic
- Admin login/reset pages now use dynamic year
- Portfolio API endpoints optimized for better performance
- Rate limiting bypassed for portfolio and contact APIs
- Contact info update system completely redesigned

### Fixed
- Portfolio detail page 401/500 errors resolved
- Contact info update errors resolved
- Database connection stability improved
- API timeout issues addressed
- Middleware rate limiting conflicts resolved
- Form validation issues in admin panel

### Technical Improvements
- Enhanced error handling in portfolio slug API
- Better database connection management
- Improved client-side caching mechanism
- More robust retry logic for failed requests
- Toast notification system for better UX
- Contact model validation improvements
- Admin panel error handling enhancements

## [2.1.0] - 2025-01-28

### Added
- Universal Editor with Markdown and HTML support
- Full-width admin layout
- Service management system
- Real-time preview functionality
- Enhanced portfolio system with multiple categories

### Changed
- Admin panel redesigned with modern UI
- Improved responsive design
- Better user experience across all devices

### Fixed
- Various bug fixes and performance improvements
- Security enhancements
- Database optimization

## [2.0.0] - 2025-01-15

### Added
- Next.js 14 App Router implementation
- TypeScript integration
- Modern portfolio system
- Admin panel
- Security features (rate limiting, CSRF protection)
- Performance optimizations

### Changed
- Complete rewrite using modern technologies
- Improved architecture and code organization
- Enhanced security measures

## [1.0.0] - 2024-12-01

### Added
- Initial release
- Basic portfolio functionality
- Contact system
- Service pages