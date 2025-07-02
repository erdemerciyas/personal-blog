#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Otomatik versiyon kontrolü başlatılıyor...');

// Package.json dosyasını oku
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const currentVersion = packageJson.version;

console.log(`📦 Mevcut versiyon: ${currentVersion}`);

// Son commit mesajını al
let lastCommitMessage = '';
try {
  lastCommitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
  console.log(`💬 Son commit mesajı: "${lastCommitMessage}"`);
} catch (error) {
  console.log('⚠️  Son commit mesajı alınamadı, patch versiyon artırılacak');
}

// Git diff ile değişiklik kontrolü
let hasChanges = false;
try {
  const diffOutput = execSync('git diff --cached --quiet', { encoding: 'utf8' });
} catch (error) {
  hasChanges = true;
}

// Staged files kontrolü
let stagedFiles = [];
try {
  const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  stagedFiles = output.trim().split('\n').filter(file => file.length > 0);
  console.log(`📝 Staged dosyalar: ${stagedFiles.join(', ')}`);
} catch (error) {
  console.log('⚠️  Staged dosya bilgisi alınamadı');
}

// Versiyon artırma kuralları
let versionType = 'patch'; // default

if (lastCommitMessage.includes('BREAKING CHANGE:') || 
    lastCommitMessage.includes('major:') ||
    lastCommitMessage.includes('feat!:') ||
    lastCommitMessage.includes('fix!:')) {
  versionType = 'major';
  console.log('🚨 MAJOR versiyon artırılacak (Breaking change tespit edildi)');
} else if (lastCommitMessage.includes('feat:') || 
           lastCommitMessage.includes('feature:') ||
           stagedFiles.some(file => file.includes('src/app/') && !file.includes('.test.'))) {
  versionType = 'minor';
  console.log('✨ MINOR versiyon artırılacak (Yeni özellik tespit edildi)');
} else if (lastCommitMessage.includes('fix:') || 
           lastCommitMessage.includes('bugfix:') ||
           lastCommitMessage.includes('hotfix:') ||
           lastCommitMessage.includes('patch:')) {
  versionType = 'patch';
  console.log('🔧 PATCH versiyon artırılacak (Bug fix tespit edildi)');
} else {
  // Default patch artırımı
  console.log('📈 PATCH versiyon artırılacak (Standart güncelleme)');
}

// Versiyon artır
const versionParts = currentVersion.split('.').map(Number);
let newVersion;

switch (versionType) {
  case 'major':
    newVersion = `${versionParts[0] + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${versionParts[0]}.${versionParts[1] + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`;
    break;
}

// Package.json güncelle
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`🎉 Versiyon güncellendi: ${currentVersion} → ${newVersion}`);

// Git'e ekle
try {
  execSync('git add package.json', { stdio: 'inherit' });
  console.log('✅ package.json git\'e eklendi');
} catch (error) {
  console.error('❌ package.json git\'e eklenirken hata:', error.message);
}

// Changelog güncelle (eğer varsa)
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  const now = new Date().toISOString().split('T')[0];
  const changelogEntry = `\n## [${newVersion}] - ${now}\n\n### Changes\n- ${lastCommitMessage}\n`;
  
  const existingChangelog = fs.readFileSync(changelogPath, 'utf8');
  const updatedChangelog = existingChangelog.replace(
    '# Changelog\n',
    `# Changelog\n${changelogEntry}`
  );
  fs.writeFileSync(changelogPath, updatedChangelog);
  
  try {
    execSync('git add CHANGELOG.md', { stdio: 'inherit' });
    console.log('📄 CHANGELOG.md güncellendi ve git\'e eklendi');
  } catch (error) {
    console.error('❌ CHANGELOG.md git\'e eklenirken hata:', error.message);
  }
} else {
  // CHANGELOG.md oluştur
  const initialChangelog = `# Changelog

All notable changes to this project will be documented in this file.

## [${newVersion}] - ${new Date().toISOString().split('T')[0]}

### Changes  
- ${lastCommitMessage}
`;
  fs.writeFileSync(changelogPath, initialChangelog);
  
  try {
    execSync('git add CHANGELOG.md', { stdio: 'inherit' });
    console.log('📄 CHANGELOG.md oluşturuldu ve git\'e eklendi');
  } catch (error) {
    console.error('❌ CHANGELOG.md git\'e eklenirken hata:', error.message);
  }
}

console.log('🏁 Otomatik versiyon güncellemesi tamamlandı!'); 