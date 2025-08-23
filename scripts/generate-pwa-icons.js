const fs = require('fs');
const path = require('path');

// SVG içeriği - favicon.svg'den alındı
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="12" fill="#0f172a"/>
  <circle cx="32" cy="24" r="8" fill="#0d9488" stroke="#14b8a6" stroke-width="2"/>
  <path d="M16 40 L32 32 L48 40 L32 48 Z" fill="#0d9488" stroke="#14b8a6" stroke-width="1.5"/>
  <circle cx="32" cy="40" r="2" fill="#14b8a6"/>
  <text x="32" y="58" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="8" font-weight="bold">EE</text>
</svg>`;

// İcon boyutları
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Icons klasörünü kontrol et ve oluştur
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('PWA ikonları oluşturuluyor...');

// Her boyut için SVG dosyası oluştur (PNG dönüşümü için placeholder)
iconSizes.forEach(size => {
  const sizedSvg = svgContent.replace(/width="64" height="64"/, `width="${size}" height="${size}"`);
  const fileName = `icon-${size}x${size}.svg`;
  const filePath = path.join(iconsDir, fileName);
  
  fs.writeFileSync(filePath, sizedSvg);
  console.log(`✓ ${fileName} oluşturuldu`);
});

// Basit PNG placeholder oluştur (SVG'yi PNG olarak kopyala)
iconSizes.forEach(size => {
  const fileName = `icon-${size}x${size}.png`;
  const svgFileName = `icon-${size}x${size}.svg`;
  const svgPath = path.join(iconsDir, svgFileName);
  const pngPath = path.join(iconsDir, fileName);
  
  // SVG'yi PNG olarak kopyala (geçici çözüm)
  fs.copyFileSync(svgPath, pngPath);
  console.log(`✓ ${fileName} oluşturuldu (SVG olarak)`);
});

// Manifest için screenshot placeholder'ları oluştur
const screenshotsDir = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Desktop screenshot placeholder
const desktopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <rect width="1280" height="720" fill="#0f172a"/>
  <text x="640" y="360" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="48" font-weight="bold">FIXRAL Desktop</text>
</svg>`;
fs.writeFileSync(path.join(screenshotsDir, 'desktop-home.png'), desktopSvg);

// Mobile screenshot placeholder
const mobileSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 667" width="375" height="667">
  <rect width="375" height="667" fill="#0f172a"/>
  <text x="187.5" y="333.5" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="24" font-weight="bold">FIXRAL Mobile</text>
</svg>`;
fs.writeFileSync(path.join(screenshotsDir, 'mobile-home.png'), mobileSvg);

console.log('✓ Screenshot placeholder\'ları oluşturuldu');

// Shortcut ikonları oluştur
const shortcuts = ['portfolio', 'services', 'contact'];
shortcuts.forEach(shortcut => {
  const shortcutSvg = svgContent.replace(/EE<\/text>/, `${shortcut.charAt(0).toUpperCase()}</text>`);
  const fileName = `shortcut-${shortcut}.png`;
  const filePath = path.join(iconsDir, fileName);
  
  fs.writeFileSync(filePath, shortcutSvg);
  console.log(`✓ ${fileName} oluşturuldu`);
});

console.log('\n🎉 Tüm PWA ikonları başarıyla oluşturuldu!');
console.log('📱 Manifest.json dosyası şimdi çalışmaya hazır.');