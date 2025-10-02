# 🚀 GitHub Release Oluşturma Rehberi - v2.7.0

## Otomatik Yöntem (GitHub CLI)

### 1. GitHub CLI Kurulumu
```bash
# Windows (winget)
winget install --id GitHub.cli

# Veya Chocolatey
choco install gh

# Veya Scoop
scoop install gh
```

### 2. GitHub CLI ile Giriş
```bash
gh auth login
```

### 3. Release Oluştur
```bash
gh release create v2.7.0 \
  --title "v2.7.0 - Enhanced MediaPicker & GitHub Best Practices" \
  --notes-file RELEASE_NOTES_v2.7.0.md \
  --latest
```

## Manuel Yöntem (GitHub Web UI)

### Adım 1: GitHub Repository'ye Git
1. https://github.com/erdemerciyas/personal-blog adresine git
2. "Releases" sekmesine tıkla (sağ tarafta)
3. "Draft a new release" butonuna tıkla

### Adım 2: Release Bilgilerini Doldur

**Tag version:**
```
v2.7.0
```

**Release title:**
```
v2.7.0 - Enhanced MediaPicker & GitHub Best Practices
```

**Description:**
```markdown
## 🎯 Overview

Bu release, MediaPicker bileşeninde önemli iyileştirmeler ve GitHub best practices uyumluluğu getiriyor.

## ✨ What's New

### Enhanced MediaPicker Component
- ✅ Context-based media upload (slider, portfolio, products, services)
- ✅ Auto-detect media category from URL
- ✅ Delete functionality with confirmation
- ✅ Smart category filtering
- ✅ Improved UX with hover effects

### GitHub Best Practices - 100% Compliance
- ✅ Issue templates (bug report, feature request)
- ✅ Code of Conduct (Contributor Covenant v2.0)
- ✅ Dependabot configuration
- ✅ GitHub Community Standards 100%

### Media Management API
- ✅ POST endpoint for context-based upload
- ✅ Enhanced DELETE endpoint
- ✅ Folder-based organization

## 🐛 Bug Fixes
- ✅ Media upload functionality restored
- ✅ Category filtering fixed
- ✅ Selected media highlighting improved

## 📊 Metrics
- **GitHub Community Standards:** 100% (8/8) ✨
- **TypeScript Errors:** 0
- **Build Status:** ✅ Passing

## 📚 Documentation
- Added comprehensive release notes
- Updated README.md and CHANGELOG.md
- Added GitHub best practices audit report

## 🔒 Security
- Input validation for uploads
- Secure deletion with authentication
- Automated dependency updates via Dependabot

## 🚀 Installation

```bash
git pull origin main
npm install
npm run build
npm run start
```

## 📞 Support
- **Issues:** [GitHub Issues](https://github.com/erdemerciyas/personal-blog/issues)
- **Email:** erdem.erciyas@gmail.com

---

**Full Changelog:** [v2.6.0...v2.7.0](https://github.com/erdemerciyas/personal-blog/compare/v2.6.0...v2.7.0)

Made with ❤️ by [Erdem Erciyas](https://github.com/erdemerciyas)
```

### Adım 3: Release Ayarları
- ✅ "Set as the latest release" işaretle
- ✅ "Create a discussion for this release" (opsiyonel)
- ⬜ "Set as a pre-release" (işaretleme)

### Adım 4: Yayınla
- "Publish release" butonuna tıkla

## 🎯 Release Sonrası Kontroller

### 1. GitHub Actions Kontrolü
```bash
# GitHub Actions durumunu kontrol et
gh run list --limit 5

# Veya web'den:
# https://github.com/erdemerciyas/personal-blog/actions
```

**Kontrol Edilecekler:**
- ✅ CI/CD Pipeline (quality-check, build, security-check)
- ✅ Security Scan
- ✅ All checks passed

### 2. Build Kontrolü
```bash
# Lokal build testi
npm run build

# Type check
npm run type-check

# Lint check
npm run lint
```

### 3. Deployment Kontrolü (Vercel)

**Otomatik Deployment:**
- Vercel otomatik olarak main branch'i deploy edecek
- Deployment URL: https://personal-blog-[hash].vercel.app
- Production URL: https://fixral.com (veya custom domain)

**Kontrol Adımları:**
1. Vercel Dashboard'a git: https://vercel.com/dashboard
2. "personal-blog" projesini seç
3. Son deployment'ı kontrol et
4. "Visit" butonuna tıklayarak siteyi test et

**Test Edilecek Özellikler:**
- ✅ Ana sayfa yükleniyor
- ✅ Admin panel erişilebilir
- ✅ MediaPicker çalışıyor
- ✅ Medya yükleme/silme çalışıyor
- ✅ Kategori filtreleme çalışıyor

### 4. Dependabot Kontrolü
```bash
# Dependabot PR'larını kontrol et
gh pr list --label "dependencies"
```

**Beklenen Davranış:**
- Her Pazartesi 09:00'da otomatik PR'lar
- Gruplandırılmış güncellemeler
- Otomatik test çalışması

### 5. Issue Templates Kontrolü
1. GitHub'da "Issues" sekmesine git
2. "New Issue" butonuna tıkla
3. Template seçeneklerini gör:
   - 🐛 Bug Report
   - ✨ Feature Request
   - 💬 GitHub Discussions
   - 🔒 Security Issue

## 📊 Başarı Kriterleri

### ✅ Release Başarılı Sayılır Eğer:
- [x] Git push başarılı
- [x] GitHub Actions tüm testler geçti
- [ ] Vercel deployment başarılı
- [ ] Production site erişilebilir
- [ ] Yeni özellikler çalışıyor
- [ ] GitHub release oluşturuldu
- [ ] Release notes görünüyor

### ⚠️ Sorun Varsa:
1. GitHub Actions loglarını kontrol et
2. Vercel deployment loglarını kontrol et
3. Browser console'da hata var mı kontrol et
4. API endpoint'leri test et

## 🔄 Rollback Planı

### Eğer Sorun Çıkarsa:
```bash
# Önceki versiyona dön
git revert HEAD
git push origin main

# Veya önceki commit'e reset
git reset --hard 3d74e02
git push origin main --force
```

## 📞 Yardım

### GitHub Actions Hataları
- Logları kontrol et: `gh run view [run-id]`
- Workflow dosyasını kontrol et: `.github/workflows/ci.yml`

### Vercel Deployment Hataları
- Vercel Dashboard'dan logları kontrol et
- Environment variables'ı kontrol et
- Build command'ı kontrol et: `npm run build`

### Genel Sorular
- Email: erdem.erciyas@gmail.com
- GitHub Issues: https://github.com/erdemerciyas/personal-blog/issues

---

**Hazırlayan:** Kiro AI  
**Tarih:** 3 Ekim 2025  
**Version:** 2.7.0
