#!/usr/bin/env node

/**
 * Version Update Script
 * Automatically updates version numbers across the project
 */

const fs = require('fs');
const path = require('path');

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const currentVersion = packageJson.version;
const versionParts = currentVersion.split('.');
const major = parseInt(versionParts[0]);
const minor = parseInt(versionParts[1]);
const patch = parseInt(versionParts[2]);

// Get version type from command line argument
const versionType = process.argv[2] || 'patch';

let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✅ Version updated from ${currentVersion} to ${newVersion}`);

// Update README.md if it contains version references
const readmePath = path.join(__dirname, '..', 'README.md');
if (fs.existsSync(readmePath)) {
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  // Update version references in README
  const versionRegex = /## 🆕 Yeni Özellikler \(v[\d.]+\)/g;
  if (versionRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(versionRegex, `## 🆕 Yeni Özellikler (v${newVersion})`);
    fs.writeFileSync(readmePath, readmeContent);
    console.log('✅ README.md updated');
  }
}

// Create a changelog entry
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const today = new Date().toISOString().split('T')[0];
const changelogEntry = `
## [${newVersion}] - ${today}

### Added
- Version update to ${newVersion}

### Changed
- Dynamic version display across the application

### Fixed
- Version consistency issues

`;

if (fs.existsSync(changelogPath)) {
  const existingChangelog = fs.readFileSync(changelogPath, 'utf8');
  const updatedChangelog = changelogEntry + existingChangelog;
  fs.writeFileSync(changelogPath, updatedChangelog);
} else {
  const initialChangelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
${changelogEntry}`;
  fs.writeFileSync(changelogPath, initialChangelog);
}

console.log('✅ CHANGELOG.md updated');

console.log(`
🎉 Version update complete!

Current version: ${newVersion}

Next steps:
1. Review changes: git diff
2. Commit changes: git add . && git commit -m "chore: bump version to ${newVersion}"
3. Create tag: git tag v${newVersion}
4. Push changes: git push && git push --tags
`);