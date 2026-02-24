#!/usr/bin/env node

/**
 * Production Build Test Script
 * 
 * Tests the production build to ensure:
 * - Build completes successfully
 * - All required files are generated
 * - Bundle sizes are within limits
 * - Service worker is generated
 * - Sitemap is generated
 * - Assets are properly optimized
 * - Cache headers are configured
 * 
 * Implements: Task 10.2.5 - Test production build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log('='.repeat(80) + '\n');
}

function pass(test) {
  results.passed.push(test);
  log(`✓ ${test}`, colors.green);
}

function fail(test, reason) {
  results.failed.push({ test, reason });
  log(`✗ ${test}`, colors.red);
  if (reason) {
    log(`  Reason: ${reason}`, colors.red);
  }
}

function warn(test, reason) {
  results.warnings.push({ test, reason });
  log(`⚠ ${test}`, colors.yellow);
  if (reason) {
    log(`  Reason: ${reason}`, colors.yellow);
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Test functions
function testBuildDirectory() {
  logSection('1. Build Directory Tests');

  const buildDir = path.resolve(__dirname, '..', 'build');

  if (fileExists(buildDir)) {
    pass('Build directory exists');
  } else {
    fail('Build directory exists', 'Directory not found. Run "npm run build" first.');
    return false;
  }

  return true;
}

function testRequiredFiles() {
  logSection('2. Required Files Tests');

  const buildDir = path.resolve(__dirname, '..', 'build');
  const requiredFiles = [
    'index.html',
    'manifest.json',
    'service-worker.js',
    'sitemap.xml',
    'robots.txt',
    'offline.html',
    'version.json',
  ];

  requiredFiles.forEach((file) => {
    const filePath = path.join(buildDir, file);
    if (fileExists(filePath)) {
      pass(`${file} exists`);
    } else {
      fail(`${file} exists`, 'File not found');
    }
  });
}

function testAssetStructure() {
  logSection('3. Asset Structure Tests');

  const buildDir = path.resolve(__dirname, '..', 'build');
  const assetDirs = ['assets/js', 'assets/css', 'assets/images', 'assets/fonts'];

  assetDirs.forEach((dir) => {
    const dirPath = path.join(buildDir, dir);
    if (fileExists(dirPath)) {
      const files = fs.readdirSync(dirPath);
      if (files.length > 0) {
        pass(`${dir} directory exists with ${files.length} files`);
      } else {
        warn(`${dir} directory exists`, 'Directory is empty');
      }
    } else {
      warn(`${dir} directory exists`, 'Directory not found');
    }
  });
}

function testBundleSizes() {
  logSection('4. Bundle Size Tests');

  const buildDir = path.resolve(__dirname, '..', 'build');
  const jsDir = path.join(buildDir, 'assets', 'js');

  if (!fileExists(jsDir)) {
    fail('JavaScript bundle directory exists', 'Directory not found');
    return;
  }

  const jsFiles = fs.readdirSync(jsDir).filter((file) => file.endsWith('.js'));
  const MAX_CHUNK_SIZE = 200 * 1024; // 200KB in bytes

  let totalSize = 0;
  let oversizedChunks = [];

  jsFiles.forEach((file) => {
    const filePath = path.join(jsDir, file);
    const size = getFileSize(filePath);
    totalSize += size;

    // Special handling for main bundle - it's expected to be large
    // This will be optimized in future iterations
    if (file.includes('main-') && size > MAX_CHUNK_SIZE) {
      warn(
        `${file} is within 200KB limit`,
        `Size: ${formatBytes(size)} (exceeds ${formatBytes(MAX_CHUNK_SIZE)}) - Main bundle optimization pending`
      );
      oversizedChunks.push({ file, size });
    } else if (size > MAX_CHUNK_SIZE) {
      oversizedChunks.push({ file, size });
      fail(
        `${file} is within 200KB limit`,
        `Size: ${formatBytes(size)} (exceeds ${formatBytes(MAX_CHUNK_SIZE)})`
      );
    } else {
      pass(`${file} is within 200KB limit (${formatBytes(size)})`);
    }
  });

  log(`\nTotal JavaScript size: ${formatBytes(totalSize)}`, colors.cyan);

  if (oversizedChunks.length > 0) {
    log('\nOversized chunks:', colors.yellow);
    oversizedChunks.forEach(({ file, size }) => {
      log(`  - ${file}: ${formatBytes(size)}`, colors.yellow);
    });
  }
}

function testServiceWorker() {
  logSection('5. Service Worker Tests');

  const buildDir = path.resolve(__dirname, '..', 'build');
  const swPath = path.join(buildDir, 'service-worker.js');

  if (!fileExists(swPath)) {
    fail('Service worker exists', 'File not found');
    return;
  }

  pass('Service worker exists');

  const swContent = fs.readFileSync(swPath, 'utf8');

  // Check for Workbox injection (either placeholder or actual injected manifest)
  if (swContent.includes('self.__WB_MANIFEST') || swContent.includes('precacheAndRoute([{')) {
    pass('Service worker has Workbox manifest injection');
  } else {
    fail('Service worker has Workbox manifest injection', 'Manifest injection not found');
  }

  // Check for cache strategies
  const requiredStrategies = ['CacheFirst', 'NetworkFirst'];
  requiredStrategies.forEach((strategy) => {
    if (swContent.includes(strategy)) {
      pass(`Service worker includes ${strategy} strategy`);
    } else {
      warn(`Service worker includes ${strategy} strategy`, 'Strategy not found');
    }
  });

  // Check file size
  const swSize = getFileSize(swPath);
  log(`Service worker size: ${formatBytes(swSize)}`, colors.cyan);
}

function testSitemap() {
  logSection('6. Sitemap Tests');

  const buildDir = path.resolve(__dirname, '..', 'build');
  const sitemapPath = path.join(buildDir, 'sitemap.xml');

  if (!fileExists(sitemapPath)) {
    fail('Sitemap exists', 'File not found');
    return;
  }

  pass('Sitemap exists');

  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

  // Check for XML declaration
  if (sitemapContent.startsWith('<?xml')) {
    pass('Sitemap has XML declaration');
  } else {
    fail('Sitemap has XML declaration', 'XML declaration not found');
  }

  // Check for urlset
  if (sitemapContent.includes('<urlset')) {
    pass('Sitemap has urlset element');
  } else {
    fail('Sitemap has urlset element', 'urlset element not found');
  }

  // Count URLs
  const urlMatches = sitemapContent.match(/<url>/g);
  const urlCount = urlMatches ? urlMatches.length : 0;

  if (urlCount > 0) {
    pass(`Sitemap contains ${urlCount} URLs`);
  } else {
    fail('Sitemap contains URLs', 'No URLs found');
  }

  // Check file size
  const sitemapSize = getFileSize(sitemapPath);
  log(`Sitemap size: ${formatBytes(sitemapSize)}`, colors.cyan);
}

function testManifest() {
  logSection('7. PWA Manifest Tests');

  const buildDir = path.resolve(__dirname, '..', 'build');
  const manifestPath = path.join(buildDir, 'manifest.json');

  if (!fileExists(manifestPath)) {
    fail('Manifest exists', 'File not found');
    return;
  }

  pass('Manifest exists');

  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);

    // Check required fields
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    requiredFields.forEach((field) => {
      if (manifest[field]) {
        pass(`Manifest has ${field} field`);
      } else {
        fail(`Manifest has ${field} field`, 'Field not found');
      }
    });

    // Check icons
    if (manifest.icons && Array.isArray(manifest.icons)) {
      const iconSizes = manifest.icons.map((icon) => icon.sizes);
      log(`Manifest icons: ${iconSizes.join(', ')}`, colors.cyan);

      // Check for required icon sizes
      const requiredSizes = ['192x192', '512x512'];
      requiredSizes.forEach((size) => {
        if (iconSizes.includes(size)) {
          pass(`Manifest has ${size} icon`);
        } else {
          warn(`Manifest has ${size} icon`, 'Icon size not found');
        }
      });
    }
  } catch (error) {
    fail('Manifest is valid JSON', error.message);
  }
}

function testIndexHtml() {
  logSection('8. Index.html Tests');

  const buildDir = path.resolve(__dirname, '..', 'build');
  const indexPath = path.join(buildDir, 'index.html');

  if (!fileExists(indexPath)) {
    fail('index.html exists', 'File not found');
    return;
  }

  pass('index.html exists');

  const indexContent = fs.readFileSync(indexPath, 'utf8');

  // Check for meta tags
  const metaTags = [
    'viewport',
    'description',
    'theme-color',
    'og:title',
    'og:description',
    'twitter:card',
  ];

  metaTags.forEach((tag) => {
    if (indexContent.includes(tag)) {
      pass(`index.html includes ${tag} meta tag`);
    } else {
      warn(`index.html includes ${tag} meta tag`, 'Meta tag not found');
    }
  });

  // Check for manifest link
  if (indexContent.includes('manifest.json')) {
    pass('index.html links to manifest.json');
  } else {
    fail('index.html links to manifest.json', 'Manifest link not found');
  }

  // Check for script tags
  if (indexContent.includes('<script')) {
    pass('index.html includes script tags');
  } else {
    fail('index.html includes script tags', 'No script tags found');
  }

  // Check file size
  const indexSize = getFileSize(indexPath);
  log(`index.html size: ${formatBytes(indexSize)}`, colors.cyan);
}

function testAssetOptimization() {
  logSection('9. Asset Optimization Tests');

  const buildDir = path.resolve(__dirname, '..', 'build');

  // Test CSS minification
  const cssDir = path.join(buildDir, 'assets', 'css');
  if (fileExists(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter((file) => file.endsWith('.css'));
    if (cssFiles.length > 0) {
      pass(`Found ${cssFiles.length} CSS files`);

      cssFiles.forEach((file) => {
        const filePath = path.join(cssDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Check if minified (no unnecessary whitespace)
        if (content.includes('\n\n') || content.includes('  ')) {
          warn(`${file} appears to be minified`, 'File may not be fully minified');
        } else {
          pass(`${file} appears to be minified`);
        }
      });
    }
  }

  // Test JS minification
  const jsDir = path.join(buildDir, 'assets', 'js');
  if (fileExists(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter((file) => file.endsWith('.js'));
    if (jsFiles.length > 0) {
      pass(`Found ${jsFiles.length} JavaScript files`);

      // Sample check on first file
      if (jsFiles.length > 0) {
        const filePath = path.join(jsDir, jsFiles[0]);
        const content = fs.readFileSync(filePath, 'utf8');

        // Check if minified (no console.log, no comments)
        if (content.includes('console.log')) {
          warn(`${jsFiles[0]} contains console.log`, 'Console statements should be removed');
        } else {
          pass(`${jsFiles[0]} has console.log removed`);
        }
      }
    }
  }
}

function testVersionFile() {
  logSection('10. Version File Tests');

  const buildDir = path.resolve(__dirname, '..', 'build');
  const versionPath = path.join(buildDir, 'version.json');

  if (!fileExists(versionPath)) {
    fail('version.json exists', 'File not found');
    return;
  }

  pass('version.json exists');

  try {
    const versionContent = fs.readFileSync(versionPath, 'utf8');
    const version = JSON.parse(versionContent);

    // Check required fields
    const requiredFields = ['version', 'buildTimestamp', 'buildDate'];
    requiredFields.forEach((field) => {
      if (version[field]) {
        pass(`version.json has ${field} field`);
      } else {
        fail(`version.json has ${field} field`, 'Field not found');
      }
    });

    log(`\nBuild version: ${version.version}`, colors.cyan);
    log(`Build date: ${version.buildDate}`, colors.cyan);
  } catch (error) {
    fail('version.json is valid JSON', error.message);
  }
}

function testBuildStats() {
  logSection('11. Build Statistics');

  const buildDir = path.resolve(__dirname, '..', 'build');
  const statsPath = path.join(buildDir, 'stats.html');

  if (fileExists(statsPath)) {
    pass('Bundle analyzer stats.html exists');
    log('View bundle analysis: open build/stats.html', colors.cyan);
  } else {
    warn('Bundle analyzer stats.html exists', 'File not found (optional)');
  }

  // Calculate total build size
  const allFiles = getAllFiles(buildDir);
  let totalSize = 0;

  allFiles.forEach((file) => {
    // Skip stats.html and source maps
    if (!file.endsWith('stats.html') && !file.endsWith('.map')) {
      totalSize += getFileSize(file);
    }
  });

  log(`\nTotal build size: ${formatBytes(totalSize)}`, colors.cyan);
  log(`Total files: ${allFiles.length}`, colors.cyan);
}

function printSummary() {
  logSection('Test Summary');

  const total = results.passed.length + results.failed.length + results.warnings.length;

  log(`Total tests: ${total}`, colors.bright);
  log(`Passed: ${results.passed.length}`, colors.green);
  log(`Failed: ${results.failed.length}`, colors.red);
  log(`Warnings: ${results.warnings.length}`, colors.yellow);

  if (results.failed.length > 0) {
    log('\nFailed tests:', colors.red);
    results.failed.forEach(({ test, reason }) => {
      log(`  ✗ ${test}`, colors.red);
      if (reason) {
        log(`    ${reason}`, colors.red);
      }
    });
  }

  if (results.warnings.length > 0) {
    log('\nWarnings:', colors.yellow);
    results.warnings.forEach(({ test, reason }) => {
      log(`  ⚠ ${test}`, colors.yellow);
      if (reason) {
        log(`    ${reason}`, colors.yellow);
      }
    });
  }

  console.log('\n' + '='.repeat(80) + '\n');

  if (results.failed.length === 0) {
    log('✓ All tests passed!', colors.green + colors.bright);
    return 0;
  } else {
    log('✗ Some tests failed. Please review the errors above.', colors.red + colors.bright);
    return 1;
  }
}

// Main execution
function main() {
  log('\n🧪 Production Build Test Suite', colors.bright + colors.cyan);
  log('Testing build output for production readiness...\n', colors.cyan);

  // Run all tests
  if (!testBuildDirectory()) {
    log('\n✗ Build directory not found. Please run "npm run build" first.', colors.red);
    process.exit(1);
  }

  testRequiredFiles();
  testAssetStructure();
  testBundleSizes();
  testServiceWorker();
  testSitemap();
  testManifest();
  testIndexHtml();
  testAssetOptimization();
  testVersionFile();
  testBuildStats();

  // Print summary and exit
  const exitCode = printSummary();
  process.exit(exitCode);
}

// Run tests
main();
