#!/usr/bin/env node

/**
 * Workbox Configuration Verification Script
 * 
 * This script verifies that Workbox is properly configured for the PWA.
 * It checks:
 * 1. Workbox dependencies are installed
 * 2. Service worker source file exists
 * 3. Vite config has Workbox plugin
 * 4. Offline fallback page exists
 * 5. Manifest file exists
 * 
 * Usage: node scripts/verify-workbox-config.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    log(`✓ ${description}: ${filePath}`, 'green');
    return true;
  } else {
    log(`✗ ${description}: ${filePath} (NOT FOUND)`, 'red');
    return false;
  }
}

function checkFileContent(filePath, searchString, description) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    log(`✗ ${description}: ${filePath} (FILE NOT FOUND)`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const found = content.includes(searchString);
  
  if (found) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description} (NOT FOUND)`, 'red');
    return false;
  }
}

function checkPackageJson() {
  const packagePath = path.resolve(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  const workboxBuild = packageJson.devDependencies?.['workbox-build'];
  const workboxWindow = packageJson.devDependencies?.['workbox-window'];
  
  let allGood = true;
  
  if (workboxBuild) {
    log(`✓ workbox-build installed: ${workboxBuild}`, 'green');
  } else {
    log('✗ workbox-build NOT installed', 'red');
    allGood = false;
  }
  
  if (workboxWindow) {
    log(`✓ workbox-window installed: ${workboxWindow}`, 'green');
  } else {
    log('✗ workbox-window NOT installed', 'red');
    allGood = false;
  }
  
  return allGood;
}

function main() {
  log('\n=== Workbox Configuration Verification ===\n', 'cyan');
  
  const checks = [];
  
  // Check 1: Dependencies
  log('1. Checking Workbox dependencies...', 'blue');
  checks.push(checkPackageJson());
  console.log();
  
  // Check 2: Service Worker Source
  log('2. Checking service worker source file...', 'blue');
  checks.push(checkFile('public/service-worker.js', 'Service worker source'));
  checks.push(checkFileContent(
    'public/service-worker.js',
    'importScripts',
    'Service worker imports Workbox'
  ));
  checks.push(checkFileContent(
    'public/service-worker.js',
    'precacheAndRoute',
    'Service worker uses precacheAndRoute'
  ));
  console.log();
  
  // Check 3: Vite Configuration
  log('3. Checking Vite configuration...', 'blue');
  checks.push(checkFile('vite.config.js', 'Vite config'));
  checks.push(checkFileContent(
    'vite.config.js',
    'workbox-build',
    'Vite config imports workbox-build'
  ));
  checks.push(checkFileContent(
    'vite.config.js',
    'injectManifest',
    'Vite config uses injectManifest'
  ));
  checks.push(checkFileContent(
    'vite.config.js',
    'workboxPlugin',
    'Vite config has workboxPlugin'
  ));
  console.log();
  
  // Check 4: Offline Fallback
  log('4. Checking offline fallback page...', 'blue');
  checks.push(checkFile('public/offline.html', 'Offline fallback page'));
  console.log();
  
  // Check 5: Manifest
  log('5. Checking PWA manifest...', 'blue');
  checks.push(checkFile('public/manifest.json', 'PWA manifest'));
  console.log();
  
  // Check 6: Service Worker Registration
  log('6. Checking service worker registration...', 'blue');
  checks.push(checkFileContent(
    'src/index.jsx',
    'serviceWorker',
    'Service worker registration in index.jsx'
  ));
  console.log();
  
  // Summary
  const passed = checks.filter(Boolean).length;
  const total = checks.length;
  const allPassed = passed === total;
  
  log('\n=== Summary ===\n', 'cyan');
  log(`Checks passed: ${passed}/${total}`, allPassed ? 'green' : 'yellow');
  
  if (allPassed) {
    log('\n✓ Workbox is properly configured!', 'green');
    log('You can now run "npm run build" to generate the service worker.\n', 'cyan');
    process.exit(0);
  } else {
    log('\n✗ Some checks failed. Please review the errors above.', 'red');
    log('Refer to docs/WORKBOX_CONFIGURATION.md for setup instructions.\n', 'yellow');
    process.exit(1);
  }
}

// Run verification
main();
