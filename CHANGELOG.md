# Changelog

Tüm önemli değişiklikler bu dosyada belgelenecektir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standardına dayanmaktadır.

## [2.7.0] - 2025-10-03

### Added
- **MediaPicker Enhancements**
  - Context-based media upload (slider, portfolio, products, services)
  - Auto-detect media category from URL
  - Delete media functionality with confirmation
  - Smart category filtering
  - Hover-based delete buttons in grid and list views
- **GitHub Best Practices**
  - Issue templates (bug report, feature request)
  - Code of Conduct (Contributor Covenant v2.0)
  - Dependabot configuration for automated dependency updates
  - GitHub Community Standards 100% compliance
- **Media Management API**
  - POST endpoint for media upload with context
  - Enhanced DELETE endpoint
  - Folder-based organization (personal-blog/slider, /portfolio, etc.)

### Changed
- MediaPicker now passes context to upload API
- Media files organized by category in Cloudinary
- Improved media selection UX with auto-category detection
- Enhanced error handling in media operations

### Fixed
- Media upload functionality restored
- Category filtering now works correctly
- Selected media properly highlighted in picker
- Media deletion with proper state management

### Security
- Input validation for media uploads
- File type verification
- Secure media deletion with authentication

## [2.6.0] - 2025-10-02

### Added
- Complete admin UI/UX redesign with new component library
- 18+ production-ready UI components with TypeScript support
- Full dark mode support across all admin pages
- WCAG 2.1 AA accessibility compliance
- Comprehensive component documentation
- GitHub Actions CI/CD pipeline
- Design system documentation
- Accessibility audit guide
- Performance optimization guide
- Integration testing guide

### Changed
- Migrated all 33 admin pages to new design system
- Updated component API for better type safety
- Improved responsive design for mobile devices
- Enhanced keyboard navigation and focus management
- Optimized bundle size (87.5 kB shared JS)

### Fixed
- Fixed all TypeScript errors (0 errors)
- Resolved React Hook dependency warnings
- Cleaned up unused imports and variables
- Fixed infinite loop risks in useEffect hooks
- Improved error handling and loading states

### Removed
- Deprecated AdminLayout component
- Old Toast component (replaced with AdminAlert)
- Backup files and temporary code

## [2.5.0] - 2025-01-27

### Added
- Web Vitals tracking system
- Core Web Vitals metrics (CLS, INP, FCP, LCP, TTFB)
- Google Analytics integration for performance tracking

### Changed
- ESLint configuration improvements
- TypeScript strict mode enhancements
- Code quality optimizations

### Fixed
- 142 ESLint errors resolved
- All TypeScript type errors fixed
- `<img>` tags converted to Next.js `<Image>`
- Production build warnings cleaned up

## [2.4.2] - 2025-01-27

### Added
- Mail system integration with Gmail SMTP
- Mail testing tools and debug scripts
- Admin panel mail status monitoring

### Fixed
- ESLint `react/no-unescaped-entities` errors
- `@typescript-eslint/no-unused-vars` warnings
- React Hook dependency warnings
- CI/CD pipeline stability issues

## [2.4.0] - 2025-01-27

### Added
- Advanced video management system
- Bulk video operations (select, delete)
- YouTube oEmbed API integration
- Video editing modal
- Search and filtering for videos

### Changed
- Simplified video adding interface
- Removed channel management modal
- Improved admin UI for video management

### Fixed
- Video upload and management bugs
- API endpoint optimizations

## [2.3.4] - 2025-08-27

### Added
- Comprehensive monitoring and performance tracking system
- Real-time performance monitoring dashboard
- Error tracking with React Error Boundary
- Health check API endpoint
- Admin monitoring dashboard
- Database query performance monitoring

### Changed
- Improved error handling across the application
- Enhanced logging system
- Performance thresholds configuration

## [2.3.3] - 2025-08-23

### Fixed
- Sentry configuration updated to new SDK
- Deprecated API migrations completed
- TypeScript and ESLint compatibility issues
- Build errors resolved

## [2.3.2] - 2025-08-19

### Removed
- Background pattern system completely removed
- Decorative radial blob layers removed
- Unused CSS and component traces cleaned

## [2.3.1] - 2025-08-17

### Added
- Google Site Verification field in admin settings
- Google Analytics (GA4) integration
- Google Tag Manager (GTM) integration
- Dynamic script loading for analytics

### Changed
- Sitemap now reads baseUrl from Settings
- Global layout updated for verification meta tags

## [2.3.0] - 2025-08-17

### Added
- Cloudinary media management integration
- Automatic media migration script
- Remote image support in Next.js

### Changed
- All local logo uploads moved to Cloudinary
- Default image paths updated to cloud URLs
- Component fallback images moved to remote URLs

## [2.2.9] - 2025-08-12

### Fixed
- All TypeScript type errors resolved
- `no-explicit-any` ESLint warnings cleaned
- Mongoose pre hook type safety improved
- Portfolio slug API type safety enhanced

## [2.2.7] - 2025-08-11

### Added
- Product media separation in Cloudinary
- Product media management page
- Media scope filter (Site/Product/All)
- Product count display in dashboard

### Changed
- Product images/files organized in separate folders
- Admin media page with scope filtering

### Fixed
- Product media selection in create/edit pages
- Query performance with indexes

## [2.2.5] - 2025-08-10

### Changed
- Mobile UI improvements for hero/slider
- CTA buttons optimized for mobile
- Typography improvements with better line heights
- Header mobile height optimized
- Grid layouts improved for mobile devices

### Fixed
- Navigation arrows hidden on mobile
- Content overflow issues
- Safe area padding for mobile devices

## [2.2.4] - 2025-01-27

### Added
- GitHub Actions workflow for CI/CD
- Security audit in CI pipeline

### Changed
- Project cleanup and organization
- Middleware consolidation
- CSP and security headers single-source management

### Removed
- Debug and test files
- Deprecated authentication endpoints
- Custom server.js file
- Unused API routes

### Security
- Hardened CSP for production
- Removed unsafe-eval from production
- Enhanced security headers
- Test authentication endpoints removed

## [2.2.3] - 2025-01-27

### Added
- MediaBrowser enhancements
- Portfolio image gallery system
- Modern project cards

### Changed
- Next.js configuration optimization
- Admin media management improvements

## [2.2.2] - 2025-01-27

### Added
- FIXRAL logo integration in footer
- Contact information design improvements

### Changed
- Footer header colors improved
- Typography enhancements
- Quick links bullet points redesigned

### Fixed
- Footer visibility issues
- Responsive design improvements

## [2.1.0] - 2025-01-15

### Added
- Rate limiting system
- CSRF protection
- Input validation and sanitization
- Security headers
- File upload security
- Authentication hardening

### Security
- Comprehensive security hardening
- OWASP Top 10 compliance
- Multiple security layers implemented

---

## Version Format

Format: `[MAJOR.MINOR.PATCH]`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Links

- [GitHub Repository](https://github.com/erdemerciyas/personal-blog)
- [Issues](https://github.com/erdemerciyas/personal-blog/issues)
- [Pull Requests](https://github.com/erdemerciyas/personal-blog/pulls)
