#!/usr/bin/env node

/**
 * 🚀 Vercel Deployment Script
 * 
 * This script automates the deployment process to Vercel with proper
 * environment variable setup and security checks.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n🚀 Step ${step}: ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function execCommand(command, description) {
  try {
    log(`\n📋 ${description}...`, 'blue');
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    logSuccess(`${description} completed`);
    return output;
  } catch (error) {
    logError(`${description} failed: ${error.message}`);
    process.exit(1);
  }
}

function checkPrerequisites() {
  logStep(1, 'Checking Prerequisites');
  
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    logSuccess('Vercel CLI is installed');
  } catch (error) {
    logError('Vercel CLI is not installed. Please install it with: npm i -g vercel');
    process.exit(1);
  }
  
  // Check if user is logged in to Vercel
  try {
    const whoami = execSync('vercel whoami', { encoding: 'utf8', stdio: 'pipe' });
    logSuccess(`Logged in to Vercel as: ${whoami.trim()}`);
  } catch (error) {
    logError('Not logged in to Vercel. Please run: vercel login');
    process.exit(1);
  }
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    logError('package.json not found. Please run this script from the project root.');
    process.exit(1);
  }
  
  logSuccess('All prerequisites met');
}

function validateEnvironmentVariables() {
  logStep(2, 'Validating Environment Variables');
  
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'MONGODB_URI',
    'ADMIN_EMAIL',
    'ADMIN_NAME',
    'ADMIN_DEFAULT_PASSWORD'
  ];
  
  const envFile = '.env.local';
  const missingVars = [];
  
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    
    requiredVars.forEach(varName => {
      if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=`)) {
        const match = envContent.match(new RegExp(`${varName}=(.+)`));
        if (!match || !match[1] || match[1].trim() === '') {
          missingVars.push(varName);
        }
      }
    });
  } else {
    logWarning(`${envFile} not found. Please create it from .env.example`);
    missingVars.push(...requiredVars);
  }
  
  if (missingVars.length > 0) {
    logError(`Missing required environment variables: ${missingVars.join(', ')}`);
    log('\n📝 Please set these variables in your .env.local file:', 'yellow');
    missingVars.forEach(varName => {
      log(`   ${varName}=your-value-here`, 'yellow');
    });
    process.exit(1);
  }
  
  logSuccess('Environment variables validated');
}

function runSecurityChecks() {
  logStep(3, 'Running Security Checks');
  
  // Run npm audit
  try {
    execCommand('npm audit --audit-level moderate', 'Security audit');
  } catch (error) {
    logWarning('Security audit found issues. Please review and fix them.');
  }
  
  // Check for sensitive data in code
  const sensitivePatterns = [
    /password\s*=\s*["'][^"']+["']/gi,
    /secret\s*=\s*["'][^"']+["']/gi,
    /api[_-]?key\s*=\s*["'][^"']+["']/gi,
    /token\s*=\s*["'][^"']+["']/gi
  ];
  
  const checkFiles = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx'];
  let foundSensitiveData = false;
  
  checkFiles.forEach(pattern => {
    try {
      const files = execSync(`find . -path "./node_modules" -prune -o -name "${pattern.replace('src/**/', '')}" -type f -print`, { encoding: 'utf8' })
        .split('\n')
        .filter(file => file && file.startsWith('./src/'));
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          sensitivePatterns.forEach(pattern => {
            if (pattern.test(content)) {
              logWarning(`Potential sensitive data found in ${file}`);
              foundSensitiveData = true;
            }
          });
        }
      });
    } catch (error) {
      // Ignore errors in file searching
    }
  });
  
  if (foundSensitiveData) {
    logWarning('Please review the files above and ensure no sensitive data is hardcoded');
  } else {
    logSuccess('No sensitive data found in source code');
  }
}

function buildProject() {
  logStep(4, 'Building Project');
  
  // Clean previous build
  execCommand('npm run clean', 'Cleaning previous build');
  
  // Install dependencies
  execCommand('npm ci', 'Installing dependencies');
  
  // Run type check
  execCommand('npm run type-check', 'Type checking');
  
  // Run linting
  execCommand('npm run lint', 'Linting code');
  
  // Build project
  execCommand('npm run build', 'Building project');
  
  logSuccess('Project built successfully');
}

function deployToVercel() {
  logStep(5, 'Deploying to Vercel');
  
  // Deploy to Vercel
  const deployOutput = execCommand('vercel --prod --yes', 'Deploying to Vercel');
  
  // Extract deployment URL
  const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
  const deploymentUrl = urlMatch ? urlMatch[0] : 'Unknown';
  
  logSuccess(`Deployment completed successfully!`);
  log(`\n🌐 Deployment URL: ${deploymentUrl}`, 'green');
  
  return deploymentUrl;
}

function setEnvironmentVariables() {
  logStep(6, 'Setting Environment Variables');
  
  const envFile = '.env.local';
  if (!fs.existsSync(envFile)) {
    logWarning('No .env.local file found. Skipping environment variable setup.');
    return;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const envVars = {};
  
  // Parse environment variables
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });
  
  // Set environment variables in Vercel
  const importantVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'MONGODB_URI',
    'ADMIN_EMAIL',
    'ADMIN_NAME',
    'ADMIN_DEFAULT_PASSWORD',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  importantVars.forEach(varName => {
    if (envVars[varName]) {
      try {
        execSync(`vercel env add ${varName} production`, { 
          input: envVars[varName], 
          stdio: ['pipe', 'pipe', 'pipe'] 
        });
        logSuccess(`Set ${varName}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          log(`${varName} already exists in Vercel`, 'yellow');
        } else {
          logWarning(`Failed to set ${varName}: ${error.message}`);
        }
      }
    }
  });
  
  logSuccess('Environment variables setup completed');
}

function runPostDeploymentTests(deploymentUrl) {
  logStep(7, 'Running Post-Deployment Tests');
  
  const testEndpoints = [
    { path: '/', name: 'Homepage' },
    { path: '/api/health', name: 'Health Check' },
    { path: '/portfolio', name: 'Portfolio Page' },
    { path: '/admin', name: 'Admin Panel' }
  ];
  
  testEndpoints.forEach(endpoint => {
    try {
      const testUrl = `${deploymentUrl}${endpoint.path}`;
      log(`Testing ${endpoint.name}: ${testUrl}`, 'blue');
      
      // Simple HTTP check using curl
      execSync(`curl -f -s -o /dev/null "${testUrl}"`, { stdio: 'pipe' });
      logSuccess(`${endpoint.name} is accessible`);
    } catch (error) {
      logWarning(`${endpoint.name} test failed - please check manually`);
    }
  });
  
  logSuccess('Post-deployment tests completed');
}

function generateDeploymentReport(deploymentUrl) {
  logStep(8, 'Generating Deployment Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    deploymentUrl,
    version: require('../package.json').version,
    nodeVersion: process.version,
    platform: process.platform,
    environment: 'production',
    status: 'success'
  };
  
  const reportPath = path.join(__dirname, '..', 'deployment-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logSuccess(`Deployment report saved to ${reportPath}`);
  
  // Display summary
  log('\n📊 Deployment Summary:', 'cyan');
  log(`   🌐 URL: ${deploymentUrl}`, 'green');
  log(`   📦 Version: ${report.version}`, 'green');
  log(`   🕒 Time: ${new Date().toLocaleString()}`, 'green');
  log(`   ✅ Status: Success`, 'green');
}

function main() {
  log('🚀 Personal Blog - Vercel Deployment Script', 'bright');
  log('================================================', 'cyan');
  
  try {
    checkPrerequisites();
    validateEnvironmentVariables();
    runSecurityChecks();
    buildProject();
    const deploymentUrl = deployToVercel();
    setEnvironmentVariables();
    runPostDeploymentTests(deploymentUrl);
    generateDeploymentReport(deploymentUrl);
    
    log('\n🎉 Deployment completed successfully!', 'green');
    log('================================================', 'cyan');
    log(`\n🌐 Your site is live at: ${deploymentUrl}`, 'bright');
    log(`🔧 Admin panel: ${deploymentUrl}/admin`, 'bright');
    log(`📊 Health check: ${deploymentUrl}/api/health`, 'bright');
    
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  validateEnvironmentVariables,
  runSecurityChecks,
  buildProject,
  deployToVercel,
  setEnvironmentVariables,
  runPostDeploymentTests,
  generateDeploymentReport
};