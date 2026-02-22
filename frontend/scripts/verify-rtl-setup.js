#!/usr/bin/env node

/**
 * RTL Layout Verification Script
 * 
 * This script verifies that RTL support is properly configured in the codebase.
 * It checks for:
 * - HTML dir attribute setup
 * - CSS RTL rules
 * - Font configuration for Arabic
 * - Component RTL support
 * 
 * Requirements: NFR-COMPAT-4, DS-LAYOUT-2, IR-8
 * Task: 9.3.5 Test RTL layout for Arabic
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
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

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const statusColor = passed ? 'green' : 'red';
  log(`${status} - ${name}`, statusColor);
  if (details) {
    console.log(`  ${details}`);
  }
}

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
};

function recordTest(passed) {
  results.total++;
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
}

function recordWarning() {
  results.warnings++;
}

// Helper to check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.resolve(__dirname, '..', filePath));
}

// Helper to read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(path.resolve(__dirname, '..', filePath), 'utf8');
  } catch (error) {
    return null;
  }
}

// Helper to search for pattern in file
function fileContains(filePath, pattern) {
  const content = readFile(filePath);
  if (!content) return false;
  return pattern.test(content);
}

// Helper to count occurrences
function countOccurrences(filePath, pattern) {
  const content = readFile(filePath);
  if (!content) return 0;
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

// Test 1: Verify HTML dir attribute setup
function testHtmlDirAttribute() {
  logSection('Test 1: HTML dir Attribute Setup');
  
  // Check index.html
  const indexHtml = readFile('index.html');
  const hasDirRtl = indexHtml && indexHtml.includes('dir="rtl"');
  const hasLangAr = indexHtml && indexHtml.includes('lang="ar"');
  
  logTest('index.html has dir="rtl"', hasDirRtl);
  recordTest(hasDirRtl);
  
  logTest('index.html has lang="ar"', hasLangAr);
  recordTest(hasLangAr);
  
  // Check AuthContext for dynamic dir setting
  const authContext = readFile('src/context/AuthContext.jsx');
  const hasDynamicDir = authContext && authContext.includes('document.documentElement.dir');
  
  logTest('AuthContext sets dir dynamically', hasDynamicDir);
  recordTest(hasDynamicDir);
  
  if (hasDynamicDir) {
    const hasRtlLogic = authContext.includes('lang === "ar" ? "rtl" : "ltr"');
    logTest('AuthContext has RTL logic for Arabic', hasRtlLogic);
    recordTest(hasRtlLogic);
  }
}

// Test 2: Verify CSS RTL rules
function testCssRtlRules() {
  logSection('Test 2: CSS RTL Rules');
  
  const cssFiles = [
    'src/styles/formsDarkMode.css',
    'src/styles/darkModePages.css',
    'src/pages/NotFoundPage.css',
    'src/pages/ServerErrorPage.css',
    'src/pages/NotificationsPage.css',
    'src/components/Navbar.css',
    'src/components/OfflineIndicator.css',
    'src/components/OfflineQueueStatus.css',
    'src/components/NotificationList.css',
    'src/components/modals/Modal.css',
  ];
  
  let totalRtlRules = 0;
  let filesWithRtl = 0;
  
  cssFiles.forEach(file => {
    if (fileExists(file)) {
      const count = countOccurrences(file, /\[dir=["']rtl["']\]/g);
      if (count > 0) {
        filesWithRtl++;
        totalRtlRules += count;
        logTest(`${path.basename(file)} has RTL rules`, true, `Found ${count} RTL rules`);
      } else {
        log(`  ⚠️  ${path.basename(file)} has no RTL rules`, 'yellow');
        recordWarning();
      }
    }
  });
  
  const hasEnoughRtlRules = totalRtlRules >= 20;
  logTest(`Total RTL rules across CSS files`, hasEnoughRtlRules, `Found ${totalRtlRules} RTL rules in ${filesWithRtl} files`);
  recordTest(hasEnoughRtlRules);
}

// Test 3: Verify Arabic font configuration
function testArabicFontConfig() {
  logSection('Test 3: Arabic Font Configuration');
  
  // Check index.html for font preloading
  const indexHtml = readFile('index.html');
  const hasAmiriPreload = indexHtml && indexHtml.includes('Amiri-Regular.woff2');
  
  logTest('Amiri font preloaded in index.html', hasAmiriPreload);
  recordTest(hasAmiriPreload);
  
  // Check AuthContext for font switching
  const authContext = readFile('src/context/AuthContext.jsx');
  const hasFontSwitching = authContext && authContext.includes("'Amiri', 'Cairo', serif");
  
  logTest('AuthContext switches to Arabic font', hasFontSwitching);
  recordTest(hasFontSwitching);
  
  // Check CSS files for Arabic font rules
  const modalCss = readFile('src/components/modals/Modal.css');
  const hasModalArabicFont = modalCss && modalCss.includes('[dir="rtl"]') && modalCss.includes('Amiri');
  
  logTest('Modal CSS has Arabic font rules', hasModalArabicFont);
  recordTest(hasModalArabicFont);
}

// Test 4: Verify component RTL support
function testComponentRtlSupport() {
  logSection('Test 4: Component RTL Support');
  
  const components = [
    { name: 'Navbar', file: 'src/components/Navbar.css', pattern: /\[dir=["']rtl["']\].*navbar/i },
    { name: 'Modal', file: 'src/components/modals/Modal.css', pattern: /\[dir=["']rtl["']\].*modal/i },
    { name: 'OfflineIndicator', file: 'src/components/OfflineIndicator.css', pattern: /\[dir=["']rtl["']\]/ },
    { name: 'NotificationList', file: 'src/components/NotificationList.css', pattern: /\[dir=["']rtl["']\]/ },
  ];
  
  components.forEach(({ name, file, pattern }) => {
    const hasRtl = fileContains(file, pattern);
    logTest(`${name} has RTL support`, hasRtl);
    recordTest(hasRtl);
  });
}

// Test 5: Verify page RTL support
function testPageRtlSupport() {
  logSection('Test 5: Page RTL Support');
  
  const pages = [
    { name: 'LoginPage', file: 'src/pages/02_LoginPage.css' },
    { name: 'AuthPage', file: 'src/pages/03_AuthPage.css' },
    { name: 'NotFoundPage', file: 'src/pages/NotFoundPage.css' },
    { name: 'ServerErrorPage', file: 'src/pages/ServerErrorPage.css' },
    { name: 'NotificationsPage', file: 'src/pages/NotificationsPage.css' },
  ];
  
  pages.forEach(({ name, file }) => {
    const hasRtl = fileContains(file, /\[dir=["']rtl["']\]/);
    logTest(`${name} has RTL support`, hasRtl);
    recordTest(hasRtl);
  });
}

// Test 6: Verify dark mode + RTL compatibility
function testDarkModeRtlCompatibility() {
  logSection('Test 6: Dark Mode + RTL Compatibility');
  
  const darkModeCss = readFile('src/styles/darkModePages.css');
  const formsDarkCss = readFile('src/styles/formsDarkMode.css');
  
  const hasDarkRtl = darkModeCss && darkModeCss.includes('[dir="rtl"]');
  logTest('darkModePages.css has RTL rules', hasDarkRtl);
  recordTest(hasDarkRtl);
  
  const hasFormsDarkRtl = formsDarkCss && formsDarkCss.includes('[dir="rtl"].dark');
  logTest('formsDarkMode.css has dark + RTL rules', hasFormsDarkRtl);
  recordTest(hasFormsDarkRtl);
}

// Test 7: Verify responsive + RTL
function testResponsiveRtl() {
  logSection('Test 7: Responsive + RTL Support');
  
  const responsiveCss = readFile('src/styles/responsiveFixes.css');
  
  if (responsiveCss) {
    const hasResponsiveRtl = responsiveCss.includes('[dir="rtl"]');
    logTest('responsiveFixes.css has RTL rules', hasResponsiveRtl);
    recordTest(hasResponsiveRtl);
  } else {
    log('  ⚠️  responsiveFixes.css not found', 'yellow');
    recordWarning();
  }
}

// Test 8: Verify documentation
function testDocumentation() {
  logSection('Test 8: Documentation');
  
  const hasTestReport = fileExists('docs/RTL_LAYOUT_TEST_REPORT.md');
  logTest('RTL test report exists', hasTestReport);
  recordTest(hasTestReport);
  
  const projectStandards = readFile('../project-standards.md');
  const hasRtlInStandards = projectStandards && projectStandards.includes('RTL');
  logTest('project-standards.md mentions RTL', hasRtlInStandards);
  recordTest(hasRtlInStandards);
}

// Main execution
function main() {
  log('\n🔍 RTL Layout Verification Script', 'blue');
  log('Task: 9.3.5 Test RTL layout for Arabic\n', 'blue');
  
  testHtmlDirAttribute();
  testCssRtlRules();
  testArabicFontConfig();
  testComponentRtlSupport();
  testPageRtlSupport();
  testDarkModeRtlCompatibility();
  testResponsiveRtl();
  testDocumentation();
  
  // Print summary
  logSection('Test Summary');
  log(`Total Tests: ${results.total}`, 'cyan');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Warnings: ${results.warnings}`, 'yellow');
  
  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`\nPass Rate: ${passRate}%`, passRate >= 90 ? 'green' : passRate >= 70 ? 'yellow' : 'red');
  
  if (results.failed === 0) {
    log('\n✅ All RTL setup tests passed!', 'green');
    log('Proceed with manual testing using RTL_LAYOUT_TEST_REPORT.md', 'cyan');
  } else {
    log('\n❌ Some RTL setup tests failed!', 'red');
    log('Please fix the issues before proceeding with manual testing.', 'yellow');
  }
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the script
main();
