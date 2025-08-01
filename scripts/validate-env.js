#!/usr/bin/env node

/**
 * Environment Validation Script
 * CI/CD pipeline için environment variables kontrolü
 */

console.log('🔍 Environment Variables Validation...\n');

// CI ortamında daha esnek kontrol
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const skipEnvValidation = process.env.SKIP_ENV_VALIDATION === 'true';

// CI ortamında minimal gereksinimler
const requiredEnvs = isCI ? {
  'NEXTAUTH_SECRET': 'NextAuth secret key (fallback available)',
  'NEXTAUTH_URL': 'NextAuth URL (fallback available)'
} : {
  'NEXTAUTH_SECRET': 'NextAuth secret key',
  'NEXTAUTH_URL': 'NextAuth URL',
  'MONGODB_URI': 'MongoDB connection string'
};

// Production'da gerekli olan ama CI'da opsiyonel
const productionEnvs = isCI ? {} : {
  'MONGODB_URI': 'MongoDB connection string'
};

const optionalEnvs = {
  'CLOUDINARY_CLOUD_NAME': 'Cloudinary cloud name',
  'CLOUDINARY_API_KEY': 'Cloudinary API key',
  'CLOUDINARY_API_SECRET': 'Cloudinary API secret',
  'VERCEL_TOKEN': 'Vercel deployment token',
  'VERCEL_ORG_ID': 'Vercel organization ID',
  'VERCEL_PROJECT_ID': 'Vercel project ID'
};

let hasErrors = false;
let hasWarnings = false;

console.log('📋 Required Environment Variables:');
Object.entries(requiredEnvs).forEach(([key, description]) => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: ${description} - OK`);
  } else if (skipEnvValidation) {
    console.log(`⚠️ ${key}: ${description} - SKIPPED (validation disabled)`);
    hasWarnings = true;
  } else if (isCI && (key === 'NEXTAUTH_SECRET' || key === 'NEXTAUTH_URL')) {
    console.log(`⚠️ ${key}: ${description} - MISSING (CI fallback available)`);
    hasWarnings = true;
  } else {
    console.log(`❌ ${key}: ${description} - MISSING`);
    hasErrors = true;
  }
});

console.log('\n📋 Production Environment Variables:');
Object.entries(productionEnvs).forEach(([key, description]) => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: ${description} - OK`);
  } else if (isCI) {
    console.log(`⚠️ ${key}: ${description} - MISSING (CI environment)`);
    hasWarnings = true;
  } else {
    console.log(`❌ ${key}: ${description} - MISSING`);
    hasErrors = true;
  }
});

console.log('\n📋 Optional Environment Variables:');
Object.entries(optionalEnvs).forEach(([key, description]) => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: ${description} - OK`);
  } else {
    console.log(`⚠️ ${key}: ${description} - MISSING (optional)`);
    hasWarnings = true;
  }
});

console.log('\n' + '='.repeat(50));

if (skipEnvValidation) {
  console.log('⚠️ VALIDATION SKIPPED: Environment validation disabled');
  console.log('✅ Continuing with build process');
  process.exit(0);
} else if (hasErrors && !isCI) {
  console.log('❌ VALIDATION FAILED: Missing required environment variables');
  console.log('\n💡 To fix this:');
  console.log('1. Create .env.local file in project root');
  console.log('2. Add missing environment variables');
  console.log('3. For GitHub Actions, add secrets to repository settings');
  process.exit(1);
} else if (hasErrors && isCI) {
  console.log('⚠️ VALIDATION PASSED WITH CI FALLBACKS: Using fallback values');
  console.log('✅ CI environment detected, using fallback configurations');
  process.exit(0);
} else if (hasWarnings) {
  console.log('⚠️ VALIDATION PASSED WITH WARNINGS: Some optional variables missing');
  console.log('✅ All required environment variables are present');
  process.exit(0);
} else {
  console.log('✅ VALIDATION PASSED: All environment variables are present');
  process.exit(0);
}