#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Image migration utilities (simplified for Node.js)
function parseImageTag(imgTag) {
  try {
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
    if (!srcMatch) return null;
    
    const src = srcMatch[1];
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
    const alt = altMatch ? altMatch[1] : '';
    
    const widthMatch = imgTag.match(/width=["']?(\d+)["']?/);
    const heightMatch = imgTag.match(/height=["']?(\d+)["']?/);
    const width = widthMatch ? parseInt(widthMatch[1]) : undefined;
    const height = heightMatch ? parseInt(heightMatch[1]) : undefined;
    
    const classMatch = imgTag.match(/class=["']([^"']*)["']/);
    const className = classMatch ? classMatch[1] : undefined;
    
    const loadingMatch = imgTag.match(/loading=["']([^"']*)["']/);
    const loading = loadingMatch ? loadingMatch[1] : undefined;
    
    const isCloudinary = src.includes('cloudinary.com') || src.includes('res.cloudinary.com');
    
    return {
      src,
      alt,
      width,
      height,
      className,
      loading,
      isCloudinary
    };
  } catch (error) {
    console.error('Image tag parsing error:', error);
    return null;
  }
}

function generateNextImageJSX(imageInfo, options = {}) {
  const {
    defaultWidth = 800,
    defaultHeight = 600,
    defaultSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    defaultPreset = 'card'
  } = options;

  const props = [];
  
  props.push(`src="${imageInfo.src}"`);
  props.push(`alt="${imageInfo.alt || ''}"`);
  
  const width = imageInfo.width || defaultWidth;
  const height = imageInfo.height || defaultHeight;
  props.push(`width={${width}}`);
  props.push(`height={${height}}`);
  
  if (imageInfo.className) {
    props.push(`className="${imageInfo.className}"`);
  }
  
  props.push(`sizes="${defaultSizes}"`);
  
  if (imageInfo.loading === 'eager') {
    props.push(`priority={true}`);
  }
  
  if (imageInfo.isCloudinary) {
    props.push(`preset="${defaultPreset}"`);
    props.push(`placeholder="blur"`);
    props.push(`quality="auto"`);
  }
  
  const componentName = imageInfo.isCloudinary ? 'CloudinaryImage' : 'Image';
  
  return `<${componentName}\n  ${props.join('\n  ')}\n/>`;
}

function migrateImagesInContent(content, options = {}) {
  const imgTagRegex = /<img[^>]*>/gi;
  const migrations = [];
  
  let migratedContent = content;
  let match;
  
  while ((match = imgTagRegex.exec(content)) !== null) {
    const imgTag = match[0];
    const imageInfo = parseImageTag(imgTag);
    
    if (imageInfo) {
      const migratedJSX = generateNextImageJSX(imageInfo, options);
      
      migrations.push({
        original: imgTag,
        migrated: migratedJSX,
        isCloudinary: imageInfo.isCloudinary
      });
      
      migratedContent = migratedContent.replace(imgTag, migratedJSX);
    }
  }
  
  return { migratedContent, migrations };
}

function generateImports(migrations) {
  const imports = [];
  
  const hasRegularImages = migrations.some(m => !m.isCloudinary);
  const hasCloudinaryImages = migrations.some(m => m.isCloudinary);
  
  if (hasRegularImages) {
    imports.push("import Image from 'next/image';");
  }
  
  if (hasCloudinaryImages) {
    imports.push("import { CloudinaryImage } from '@/components/CloudinaryImage';");
  }
  
  return imports;
}

function addImportsToFile(content, imports) {
  if (imports.length === 0) return content;
  
  // React import'undan sonra ekle
  const reactImportMatch = content.match(/import React[^;]*;/);
  if (reactImportMatch) {
    const insertIndex = reactImportMatch.index + reactImportMatch[0].length;
    return content.slice(0, insertIndex) + '\n' + imports.join('\n') + content.slice(insertIndex);
  }
  
  // Başka import'lar varsa onlardan sonra ekle
  const importMatch = content.match(/import[^;]*;/);
  if (importMatch) {
    const insertIndex = importMatch.index + importMatch[0].length;
    return content.slice(0, insertIndex) + '\n' + imports.join('\n') + content.slice(insertIndex);
  }
  
  // Hiç import yoksa başa ekle
  return imports.join('\n') + '\n\n' + content;
}

async function migrateFile(filePath, options = {}) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { migratedContent, migrations } = migrateImagesInContent(content, options);
    
    if (migrations.length === 0) {
      return {
        filePath,
        migrations: [],
        success: true,
        message: 'No images found to migrate'
      };
    }
    
    const requiredImports = generateImports(migrations);
    const finalContent = addImportsToFile(migratedContent, requiredImports);
    
    if (!options.dryRun) {
      // Backup oluştur
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);
      
      // Yeni içeriği yaz
      fs.writeFileSync(filePath, finalContent);
    }
    
    return {
      filePath,
      migrations,
      requiredImports,
      success: true,
      message: `${options.dryRun ? 'Would migrate' : 'Migrated'} ${migrations.length} images`
    };
  } catch (error) {
    return {
      filePath,
      migrations: [],
      success: false,
      error: error.message
    };
  }
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  console.log(`🚀 Starting image migration${isDryRun ? ' (DRY RUN)' : ''}...\n`);
  
  // TSX ve JSX dosyalarını bul
  const files = await glob('src/**/*.{tsx,jsx}', { 
    ignore: ['node_modules/**', '.next/**', 'dist/**'] 
  });
  
  console.log(`Found ${files.length} files to process\n`);
  
  const results = [];
  const options = {
    defaultWidth: 800,
    defaultHeight: 600,
    defaultSizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    defaultPreset: 'card'
  };
  
  for (const file of files) {
    console.log(`Processing: ${file}`);
    const result = await migrateFile(file, { ...options, dryRun: isDryRun });
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
  }
  
  // Rapor oluştur
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalMigrations = successful.reduce((sum, r) => sum + r.migrations.length, 0);
  const cloudinaryMigrations = successful.reduce((sum, r) => 
    sum + r.migrations.filter(m => m.isCloudinary).length, 0
  );
  
  console.log('\n📊 Migration Summary:');
  console.log(`- Files processed: ${results.length}`);
  console.log(`- Successful: ${successful.length}`);
  console.log(`- Failed: ${failed.length}`);
  console.log(`- Total images migrated: ${totalMigrations}`);
  console.log(`- Cloudinary images: ${cloudinaryMigrations}`);
  console.log(`- Regular images: ${totalMigrations - cloudinaryMigrations}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed files:');
    failed.forEach(result => {
      console.log(`- ${result.filePath}: ${result.error}`);
    });
  }
  
  console.log('\n✨ Migration completed!');
  console.log('💡 Backup files created with .backup extension');
  console.log('🔍 Please review the changes before committing');
}

// Script'i çalıştır
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  migrateFile,
  migrateImagesInContent,
  parseImageTag,
  generateNextImageJSX
};