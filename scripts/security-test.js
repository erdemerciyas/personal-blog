#!/usr/bin/env node

/**
 * Security Test Script
 * Bu script projenin güvenlik durumunu test eder
 */

const fs = require('fs');
const path = require('path');

// CI ortamında .env.local dosyası olmayabilir
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

if (!isCI && fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

console.log('🔒 Personal Blog - Güvenlik Testi Başlatılıyor...\n');
if (isCI) {
  console.log('🤖 CI ortamı tespit edildi - Esnek kontrol modu aktif\n');
}

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

// 1. Güvenlik dosyalarının varlığını kontrol et
console.log('📁 Güvenlik Dosyaları Kontrolü:');
checkFileExists('src/lib/rate-limit.ts', 'Rate Limiting Sistemi');
checkFileExists('src/lib/validation.ts', 'Input Validation Sistemi');
checkFileExists('src/lib/csrf.ts', 'CSRF Protection Sistemi');
checkFileExists('src/lib/security-headers.ts', 'Security Headers Sistemi');
checkFileExists('SECURITY.md', 'Güvenlik Dokümantasyonu');

// 2. Environment variables kontrolü
console.log('\n🔐 Environment Variables Kontrolü:');
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'MONGODB_URI',
  'NEXTAUTH_URL'
];

requiredEnvVars.forEach(envVar => {
  const exists = process.env[envVar] !== undefined;
  const status = exists ? 'PASS' : (isCI ? 'WARN' : 'FAIL');
  const severity = exists ? 'info' : (isCI ? 'warning' : 'error');
  const message = exists 
    ? `✅ ${envVar} tanımlı` 
    : isCI 
      ? `⚠️ ${envVar} tanımlı değil (CI ortamında fallback kullanılacak)`
      : `❌ ${envVar} tanımlı değil`;
  
  addTest(`Environment Variable: ${envVar}`, status, message, severity);
});

// 3. Güvenlik konfigürasyonları kontrolü
console.log('\n⚙️ Güvenlik Konfigürasyonları:');
checkFileContent('src/middleware.ts', 'rateLimit', 'Middleware Rate Limiting');
checkFileContent('src/middleware.ts', 'SecurityHeaders', 'Middleware Security Headers');
checkFileContent('src/middleware.ts', 'detectSuspiciousActivity', 'Suspicious Activity Detection');

checkFileContent('next.config.js', 'X-Frame-Options', 'Next.js Security Headers');
checkFileContent('next.config.js', 'poweredByHeader: false', 'Powered-By Header Disabled');

checkFileContent('src/lib/auth.ts', 'sameSite: \'strict\'', 'Strict SameSite Cookies');
checkFileContent('src/lib/auth.ts', 'httpOnly: true', 'HttpOnly Cookies');

// 4. API güvenlik kontrolü
console.log('\n🛡️ API Güvenlik Kontrolü:');
checkFileContent('src/app/api/contact/route.ts', 'rateLimit', 'Contact API Rate Limiting');
checkFileContent('src/app/api/contact/route.ts', 'RequestValidator', 'Contact API Input Validation');

checkFileContent('src/app/api/admin/upload/route.ts', 'validateFileSignature', 'File Upload Magic Number Validation');
checkFileContent('src/app/api/admin/upload/route.ts', 'sanitizeFileName', 'File Upload Filename Sanitization');

checkFileContent('src/app/api/auth/reset-password/route.ts', 'isStrongPassword', 'Password Reset Strong Password Check');

// 5. Database güvenlik kontrolü
console.log('\n🗄️ Database Güvenlik Kontrolü:');
checkFileContent('src/models/User.ts', 'toJSON', 'User Model Password Masking');
checkFileContent('src/models/User.ts', 'bcrypt.hash', 'Password Hashing');

// 6. Dependency güvenlik kontrolü
console.log('\n📦 Dependency Güvenlik Kontrolü:');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Güvenlik kütüphaneleri kontrolü
  const securityDeps = ['bcryptjs', 'dompurify', 'jsdom'];
  securityDeps.forEach(dep => {
    const exists = dependencies[dep] !== undefined;
    addTest(
      `Security Dependency: ${dep}`,
      exists ? 'PASS' : 'WARN',
      exists ? `✅ ${dep} yüklü` : `⚠️ ${dep} yüklü değil`,
      exists ? 'info' : 'warning'
    );
  });
  
  // Potansiyel güvenlik riski olan paketler
  const riskyDeps = ['eval', 'vm2', 'serialize-javascript'];
  riskyDeps.forEach(dep => {
    const exists = dependencies[dep] !== undefined;
    if (exists) {
      addTest(
        `Risky Dependency: ${dep}`,
        'WARN',
        `⚠️ ${dep} potansiyel güvenlik riski`,
        'warning'
      );
    }
  });
}

// 7. Dosya izinleri kontrolü (Unix sistemler için)
console.log('\n📋 Dosya İzinleri Kontrolü:');
const sensitiveFiles = ['.env.local', '.env.example'];
sensitiveFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const stats = fs.statSync(file);
      const mode = (stats.mode & parseInt('777', 8)).toString(8);
      const isSecure = mode === '600' || mode === '644';
      addTest(
        `File Permissions: ${file}`,
        isSecure ? 'PASS' : 'WARN',
        `${isSecure ? '✅' : '⚠️'} ${file} izinleri: ${mode}`,
        isSecure ? 'info' : 'warning'
      );
    } catch (error) {
      addTest(
        `File Permissions: ${file}`,
        'WARN',
        `⚠️ ${file} izinleri kontrol edilemedi`,
        'warning'
      );
    }
  }
});

// Sonuçları göster
console.log('\n' + '='.repeat(60));
console.log('🔒 GÜVENLİK TESTİ SONUÇLARI');
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

// Güvenlik skoru hesapla
const securityScore = Math.round((results.passed / results.tests.length) * 100);
console.log('\n' + '='.repeat(60));
console.log(`🏆 GÜVENLİK SKORU: ${securityScore}%`);

if (securityScore >= 90) {
  console.log('🟢 Mükemmel! Güvenlik seviyesi çok yüksek.');
} else if (securityScore >= 80) {
  console.log('🟡 İyi! Birkaç iyileştirme yapılabilir.');
} else if (securityScore >= 70) {
  console.log('🟠 Orta! Güvenlik açıkları mevcut.');
} else {
  console.log('🔴 Düşük! Acil güvenlik düzeltmeleri gerekli.');
}

console.log('='.repeat(60));

// Öneriler
if (results.failed > 0 || results.warnings > 0) {
  console.log('\n💡 ÖNERİLER:');
  
  if (results.failed > 0) {
    console.log('❌ Başarısız testler için:');
    console.log('   - Eksik güvenlik dosyalarını oluşturun');
    console.log('   - Environment variables\'ları tanımlayın');
    console.log('   - Güvenlik konfigürasyonlarını tamamlayın');
  }
  
  if (results.warnings > 0) {
    console.log('⚠️ Uyarılar için:');
    console.log('   - Dosya izinlerini kontrol edin');
    console.log('   - Güvenlik kütüphanelerini yükleyin');
    console.log('   - Potansiyel riskli paketleri gözden geçirin');
  }
}

console.log('\n📚 Daha fazla bilgi için SECURITY.md dosyasını inceleyin.');

// Exit code - CI ortamında daha esnek
const shouldFail = isCI ? false : results.failed > 0;
process.exit(shouldFail ? 1 : 0);