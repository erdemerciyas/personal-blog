#!/usr/bin/env node

/**
 * Build Debug Script
 * Bu script Vercel build problemlerini tespit etmek için kullanılır
 */

console.log('🔍 Build Debug Script Started');

// Environment check
console.log('\n📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Missing');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');

// Memory check
console.log('\n💾 Memory Usage:');
const memUsage = process.memoryUsage();
console.log('Heap Used:', Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB');
console.log('Heap Total:', Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB');
console.log('External:', Math.round(memUsage.external / 1024 / 1024) + ' MB');

// Node version check
console.log('\n🔧 Runtime Info:');
console.log('Node Version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

// File system check
const fs = require('fs');
const path = require('path');

console.log('\n📁 Project Structure:');
const checkPath = (filePath, name) => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${name}: Found`);
  } else {
    console.log(`❌ ${name}: Missing`);
  }
};

checkPath('package.json', 'package.json');
checkPath('next.config.js', 'next.config.js');
checkPath('tsconfig.json', 'tsconfig.json');
checkPath('src/app', 'src/app directory');
checkPath('src/lib', 'src/lib directory');
checkPath('src/models', 'src/models directory');

// Dependencies check
console.log('\n📦 Critical Dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = packageJson.dependencies;
  
  const criticalDeps = ['next', 'react', 'mongoose', 'next-auth'];
  criticalDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`✅ ${dep}: ${deps[dep]}`);
    } else {
      console.log(`❌ ${dep}: Missing`);
    }
  });
} catch (error) {
  console.error('❌ Cannot read package.json:', error.message);
}

console.log('\n🎯 Build Debug Complete');
console.log('If build fails, check the issues marked with ❌'); 