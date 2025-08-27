#!/usr/bin/env node

/**
 * Configuration Test Script
 * Tests essential configurations and dependencies for CI/CD pipeline
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test results
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function runTest(testName, testFn) {
  try {
    const result = testFn();
    if (result === true) {
      logSuccess(`${testName}`);
      testResults.passed++;
    } else if (result === 'warning') {
      logWarning(`${testName}`);
      testResults.warnings++;
    } else {
      logError(`${testName}`);
      testResults.failed++;
    }
  } catch (error) {
    logError(`${testName}: ${error.message}`);
    testResults.failed++;
  }
}

// Test functions
function testPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    throw new Error('package.json not found');
  }
  
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Check required scripts
  const requiredScripts = ['build', 'start', 'dev', 'lint'];
  for (const script of requiredScripts) {
    if (!pkg.scripts[script]) {
      throw new Error(`Missing required script: ${script}`);
    }
  }
  
  // Check required dependencies
  const requiredDeps = ['next', 'react', 'react-dom'];
  for (const dep of requiredDeps) {
    if (!pkg.dependencies[dep]) {
      throw new Error(`Missing required dependency: ${dep}`);
    }
  }
  
  return true;
}

function testNextConfig() {
  const configPath = path.join(process.cwd(), 'next.config.js');
  if (!fs.existsSync(configPath)) {
    throw new Error('next.config.js not found');
  }
  
  // Basic syntax check
  try {
    require(configPath);
  } catch (error) {
    throw new Error(`next.config.js syntax error: ${error.message}`);
  }
  
  return true;
}

function testTsConfig() {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) {
    throw new Error('tsconfig.json not found');
  }
  
  try {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    
    // Check essential compiler options
    if (!tsConfig.compilerOptions) {
      throw new Error('Missing compilerOptions in tsconfig.json');
    }
    
    const requiredOptions = ['target', 'lib', 'allowJs', 'skipLibCheck', 'strict'];
    for (const option of requiredOptions) {
      if (tsConfig.compilerOptions[option] === undefined) {
        throw new Error(`Missing required TypeScript option: ${option}`);
      }
    }
    
    return true;
  } catch (error) {
    if (error.message.includes('Missing required')) {
      throw error;
    }
    throw new Error(`tsconfig.json parse error: ${error.message}`);
  }
}

function testEslintConfig() {
  const eslintPath = path.join(process.cwd(), '.eslintrc.json');
  if (!fs.existsSync(eslintPath)) {
    return 'warning'; // ESLint is optional but recommended
  }
  
  try {
    const eslintConfig = JSON.parse(fs.readFileSync(eslintPath, 'utf8'));
    if (!eslintConfig.extends || !Array.isArray(eslintConfig.extends)) {
      throw new Error('ESLint config should have extends array');
    }
    return true;
  } catch (error) {
    throw new Error(`ESLint config error: ${error.message}`);
  }
}

function testEnvironmentVariables() {
  // Check for environment variable examples
  const envExamplePath = path.join(process.cwd(), '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    return 'warning'; // .env.example is recommended but not required
  }
  
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  
  // Check for essential environment variables
  const requiredEnvVars = ['NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
  for (const envVar of requiredEnvVars) {
    if (!envExample.includes(envVar)) {
      throw new Error(`Missing environment variable example: ${envVar}`);
    }
  }
  
  return true;
}

function testSrcStructure() {
  const srcPath = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcPath)) {
    throw new Error('src directory not found');
  }
  
  // Check for essential directories
  const requiredDirs = ['app', 'components', 'lib'];
  for (const dir of requiredDirs) {
    const dirPath = path.join(srcPath, dir);
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Missing required directory: src/${dir}`);
    }
  }
  
  // Check for app directory structure (Next.js 13+)
  const appPath = path.join(srcPath, 'app');
  const requiredAppFiles = ['layout.tsx', 'page.tsx'];
  for (const file of requiredAppFiles) {
    const filePath = path.join(appPath, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing required app file: ${file}`);
    }
  }
  
  return true;
}

function testJestConfig() {
  const jestConfigPath = path.join(process.cwd(), 'jest.config.js');
  if (!fs.existsSync(jestConfigPath)) {
    return 'warning'; // Jest is optional
  }
  
  try {
    // Clear require cache to get fresh config
    delete require.cache[require.resolve(jestConfigPath)];
    const jestConfig = require(jestConfigPath);
    
    // Jest config can be a function (when using createJestConfig) or an object
    if (typeof jestConfig !== 'object' && typeof jestConfig !== 'function') {
      throw new Error('Jest config should export an object or function');
    }
    return true;
  } catch (error) {
    throw new Error(`Jest config error: ${error.message}`);
  }
}

function testGitIgnore() {
  const gitIgnorePath = path.join(process.cwd(), '.gitignore');
  if (!fs.existsSync(gitIgnorePath)) {
    throw new Error('.gitignore not found');
  }
  
  const gitIgnore = fs.readFileSync(gitIgnorePath, 'utf8');
  
  // Check for essential ignore patterns
  const requiredPatterns = ['node_modules', '.next', '.env.local'];
  for (const pattern of requiredPatterns) {
    if (!gitIgnore.includes(pattern)) {
      throw new Error(`Missing .gitignore pattern: ${pattern}`);
    }
  }
  
  return true;
}

function testNodeModules() {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    throw new Error('node_modules not found - run npm install');
  }
  
  // Check for essential packages
  const requiredPackages = ['next', 'react', 'react-dom'];
  for (const pkg of requiredPackages) {
    const pkgPath = path.join(nodeModulesPath, pkg);
    if (!fs.existsSync(pkgPath)) {
      throw new Error(`Missing package: ${pkg} - run npm install`);
    }
  }
  
  return true;
}

// Main test execution
function main() {
  log('🧪 Running Configuration Tests...', 'bold');
  log('');
  
  // Run all tests
  runTest('Package.json configuration', testPackageJson);
  runTest('Next.js configuration', testNextConfig);
  runTest('TypeScript configuration', testTsConfig);
  runTest('ESLint configuration', testEslintConfig);
  runTest('Environment variables setup', testEnvironmentVariables);
  runTest('Source code structure', testSrcStructure);
  runTest('Jest configuration', testJestConfig);
  runTest('Git ignore configuration', testGitIgnore);
  runTest('Node modules installation', testNodeModules);
  
  // Print results
  log('');
  log('📊 Test Results:', 'bold');
  logSuccess(`Passed: ${testResults.passed}`);
  if (testResults.warnings > 0) {
    logWarning(`Warnings: ${testResults.warnings}`);
  }
  if (testResults.failed > 0) {
    logError(`Failed: ${testResults.failed}`);
  }
  
  log('');
  
  if (testResults.failed > 0) {
    logError('❌ Configuration tests failed! Please fix the issues above.');
    process.exit(1);
  } else if (testResults.warnings > 0) {
    logWarning('⚠️  Configuration tests passed with warnings. Consider addressing the warnings.');
    process.exit(0);
  } else {
    logSuccess('✅ All configuration tests passed!');
    process.exit(0);
  }
}

// Handle CLI execution
if (require.main === module) {
  main();
}

module.exports = {
  testPackageJson,
  testNextConfig,
  testTsConfig,
  testEslintConfig,
  testEnvironmentVariables,
  testSrcStructure,
  testJestConfig,
  testGitIgnore,
  testNodeModules
};