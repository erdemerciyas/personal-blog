# v2.3.0 – Çoklu Dil (i18n) Kaldırma ve Temizlik

Yayın Tarihi: 2025-08-12

## Özeti
- Projeden çoklu dil (i18n) altyapısı tamamen kaldırıldı.
- Kullanılmayan bağımlılıklar ve dizinler temizlendi.
- Dokümantasyon ve sürüm bilgileri güncellendi.
- Production build ve Vercel deployment başarıyla doğrulandı.

## Değişiklikler
- Kaldırıldı: `next-i18next`, `react-i18next` bağımlılıkları (package.json)
- Silindi: `public/locales/` ve `src/i18n/` dizinleri (önceden temizlik yapılmıştı)
- Konfig: `middleware.ts` ve `next.config.js` içinde i18n yönlendirmesi/bağımlılığı bulunmuyor
- Dokümantasyon: `README.md` güncellendi (Status/Version = v2.3.0, i18n notları eklendi)

## Teknik Notlar
- Sürüm: 2.3.0 (breaking change: i18n kaldırıldı)
- Build: `npm run build` başarılı
- Deploy: `npm run deploy` ile Vercel production deploy tamamlandı
- Tag: `v2.3.0` GitHub’a pushlandı

## Kontrol Listesi
- [x] Bağımlılıklar güncellendi (`npm install`)
- [x] Production build başarılı
- [x] Vercel deploy tamamlandı
- [x] README güncellendi
- [x] Git tag oluşturuldu (`v2.3.0`)

## Katkılar
Teşekkürler: Tüm katkı sağlayanlara 🙏

— Erdem Erciyas
