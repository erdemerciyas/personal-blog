#!/usr/bin/env node

/**
 * Performance Test Script
 * Bu script projenin performans durumunu test eder
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Personal Blog - Performans Testi Başlatılıyor...\n');

// Test sonuçları
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function addTest(name, status, message, severity = 'info') {
  results.tests.push({ name, status, message, severity });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else if (status === 'WARN') results.warnings++;
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  addTest(
    description,
    exists ? 'PASS' : 'FAIL',
    exists ? `✅ ${filePath} mevcut` : `❌ ${filePath} bulunamadı`,
    exists ? 'info' : 'error'
  );
  return exists;
}

function checkFileContent(filePath, searchText, description) {
  if (!fs.existsSync(filePath)) {
    addTest(description, 'FAIL', `❌ ${filePath} bulunamadı`, 'error');
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const found = content.includes(searchText);
  addTest(
    description,
    found ? 'PASS' : 'FAIL',
    found ? `✅ ${description}` : `❌ ${description}`,
    found ? 'info' : 'error'
  );
  return found;
}

// 1. Performans dosyalarının varlığını kontrol et
console.log('📁 Performans Dosyaları Kontrolü:');
checkFileExists('src/lib/cache-manager.ts', 'Cache Manager Sistemi');
checkFileExists('src/hooks/useApi.ts', 'API Hooks Sistemi');
checkFileExists('src/components/SkeletonLoader.tsx', 'Skeleton Loading Sistemi');
checkFileExists('src/components/OptimizedImage.tsx', 'Optimized Image Sistemi');
checkFileExists('src/hooks/usePerformance.ts', 'Performance Monitoring');

// 2. Next.js optimizasyonları kontrolü
console.log('\n⚙️ Next.js Optimizasyonları:');
checkFileContent('next.config.js', 'swcMinify: true', 'SWC Minification');
checkFileContent('next.config.js', 'compress: true', 'Compression Enabled');
checkFileContent('next.config.js', 'optimizeCss: true', 'CSS Optimization');
checkFileContent('next.config.js', 'formats: [\'image/webp\']', 'WebP Image Format');

// 3. Caching sistemi kontrolü
console.log('\n🗄️ Caching Sistemi Kontrolü:');
checkFileContent('src/hooks/useApi.ts', 'cacheManager', 'API Caching');
checkFileContent('src/lib/cache-manager.ts', 'class CacheManager', 'Cache Manager Class');
checkFileContent('src/lib/cache-manager.ts', 'cleanup()', 'Cache Cleanup');

// 4. Loading optimizasyonları kontrolü
console.log('\n⏳ Loading Optimizasyonları:');
checkFileContent('src/app/page.tsx', 'SkeletonHero', 'Hero Skeleton Loading');
checkFileContent('src/app/page.tsx', 'SkeletonServiceGrid', 'Services Skeleton Loading');
checkFileContent('src/app/page.tsx', 'SkeletonGrid', 'Portfolio Skeleton Loading');
checkFileContent('src/app/loading.tsx', 'SkeletonHero', 'Global Loading Optimization');

// 5. Image optimizasyonları kontrolü
console.log('\n🖼️ Image Optimizasyonları:');
checkFileContent('src/components/OptimizedImage.tsx', 'quality=', 'Image Quality Control');
checkFileContent('src/components/OptimizedImage.tsx', 'placeholder=', 'Image Placeholder');
checkFileContent('src/components/OptimizedImage.tsx', 'onLoad=', 'Image Load Handling');

// 6. Bundle size kontrolü
console.log('\n📦 Bundle Optimizasyonları:');
if (fs.existsSync('.next')) {
  addTest('Next.js Build', 'PASS', '✅ Next.js build mevcut', 'info');
  
  // Check for build optimization
  const buildManifest = '.next/build-manifest.json';
  if (fs.existsSync(buildManifest)) {
    addTest('Build Manifest', 'PASS', '✅ Build manifest mevcut', 'info');
  } else {
    addTest('Build Manifest', 'WARN', '⚠️ Build manifest bulunamadı', 'warning');
  }
} else {
  addTest('Next.js Build', 'WARN', '⚠️ Next.js build bulunamadı (npm run build çalıştırın)', 'warning');
}

// 7. Performance scripts kontrolü
console.log('\n🔧 Performance Scripts:');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  const performanceScripts = ['perf:analyze', 'perf:lighthouse', 'perf:bundle'];
  performanceScripts.forEach(script => {
    const exists = scripts[script] !== undefined;
    addTest(
      `Performance Script: ${script}`,
      exists ? 'PASS' : 'FAIL',
      exists ? `✅ ${script} script mevcut` : `❌ ${script} script bulunamadı`,
      exists ? 'info' : 'error'
    );
  });
}

// Sonuçları göster
console.log('\n' + '='.repeat(60));
console.log('🚀 PERFORMANS TESTİ SONUÇLARI');
console.log('='.repeat(60));

console.log(`✅ Başarılı: ${results.passed}`);
console.log(`❌ Başarısız: ${results.failed}`);
console.log(`⚠️ Uyarı: ${results.warnings}`);
console.log(`📊 Toplam: ${results.tests.length}`);

console.log('\n📋 Detaylı Sonuçlar:');
results.tests.forEach(test => {
  const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${test.name}: ${test.message}`);
});

// Performans skoru hesapla
const performanceScore = Math.round((results.passed / results.tests.length) * 100);
console.log('\n' + '='.repeat(60));
console.log(`🏆 PERFORMANS SKORU: ${performanceScore}%`);

if (performanceScore >= 90) {
  console.log('🟢 Mükemmel! Performans seviyesi çok yüksek.');
} else if (performanceScore >= 80) {
  console.log('🟡 İyi! Birkaç iyileştirme yapılabilir.');
} else if (performanceScore >= 70) {
  console.log('🟠 Orta! Performans iyileştirmeleri gerekli.');
} else {
  console.log('🔴 Düşük! Acil performans optimizasyonları gerekli.');
}

console.log('='.repeat(60));

// Öneriler
if (results.failed > 0 || results.warnings > 0) {
  console.log('\n💡 ÖNERİLER:');
  
  if (results.failed > 0) {
    console.log('❌ Başarısız testler için:');
    console.log('   - Eksik performans dosyalarını oluşturun');
    console.log('   - Next.js optimizasyonlarını aktifleştirin');
    console.log('   - Caching sistemini tamamlayın');
  }
  
  if (results.warnings > 0) {
    console.log('⚠️ Uyarılar için:');
    console.log('   - npm run build çalıştırın');
    console.log('   - Bundle analyzer ile analiz yapın');
    console.log('   - Lighthouse ile performans testi yapın');
  }
  
  console.log('\n📚 Performans komutları:');
  console.log('   - npm run perf:analyze (bundle analizi)');
  console.log('   - npm run perf:lighthouse (lighthouse testi)');
  console.log('   - npm run perf:bundle (bundle boyut analizi)');
}

console.log('\n📈 Performans iyileştirmeleri hakkında daha fazla bilgi için README.md dosyasını inceleyin.');

// Exit code
process.exit(results.failed > 0 ? 1 : 0);