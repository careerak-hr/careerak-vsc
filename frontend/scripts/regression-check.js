#!/usr/bin/env node

/**
 * Regression Check Script
 * Verifies no regressions in existing features after platform enhancements
 * Task: 10.5.4 - Verify no regressions in existing features
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         Regression Check - Existing Features              ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const checks = [];
let passed = 0;
let failed = 0;
let warnings = 0;

function check(name, condition, message) {
  checks.push({ name, condition, message });
  if (condition) {
    console.log(`✓ ${name}`);
    passed++;
  } else {
    console.log(`✗ ${name}: ${message}`);
    failed++;
  }
}

function warn(name, message) {
  console.log(`⚠️  ${name}: ${message}`);
  warnings++;
}

// 1. Core Files Existence
console.log('\n═══════════════════════════════════════════════════════════');
console.log('1. Core Application Files');
console.log('═══════════════════════════════════════════════════════════');

check(
  'App.jsx exists',
  fs.existsSync(path.join(__dirname, '../src/App.jsx')),
  'Main App component missing'
);

check(
  'index.jsx exists',
  fs.existsSync(path.join(__dirname, '../src/index.jsx')),
  'Entry point missing'
);

check(
  'AppRoutes exists',
  fs.existsSync(path.join(__dirname, '../src/components/AppRoutes.jsx')),
  'Routing component missing'
);

// 2. Context Providers
console.log('\n═══════════════════════════════════════════════════════════');
console.log('2. Context Providers (Existing + New)');
console.log('═══════════════════════════════════════════════════════════');

const contexts = [
  'AppContext.jsx',
  'AuthContext.jsx',
  'ThemeContext.jsx',
  'AnimationContext.jsx',
  'OfflineContext.jsx'
];

contexts.forEach(context => {
  check(
    `${context} exists`,
    fs.existsSync(path.join(__dirname, '../src/context', context)),
    `Context provider ${context} missing`
  );
});

// 3. Core Pages
console.log('\n═══════════════════════════════════════════════════════════');
console.log('3. Core Pages (Must Not Be Broken)');
console.log('═══════════════════════════════════════════════════════════');

const corePages = [
  '00_LanguagePage.jsx',
  '01_EntryPage.jsx',
  '02_LoginPage.jsx',
  '03_AuthPage.jsx',
  '07_ProfilePage.jsx',
  '09_JobPostingsPage.jsx',
  '11_CoursesPage.jsx',
  '14_SettingsPage.jsx'
];

corePages.forEach(page => {
  const pagePath = path.join(__dirname, '../src/pages', page);
  check(
    `${page} exists`,
    fs.existsSync(pagePath),
    `Core page ${page} missing`
  );
  
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    // Check for React imports
    check(
      `${page} has React import`,
      content.includes('import React') || content.includes('from \'react\''),
      `${page} missing React import`
    );
    
    // Check for export
    check(
      `${page} has export`,
      content.includes('export default') || content.includes('export {'),
      `${page} missing export`
    );
  }
});

// 4. Essential Components
console.log('\n═══════════════════════════════════════════════════════════');
console.log('4. Essential Components');
console.log('═══════════════════════════════════════════════════════════');

const essentialComponents = [
  'Navbar.jsx',
  'Footer.jsx',
  'ErrorBoundary.jsx',
  'ServiceWorkerManager.jsx',
  'PageTransition.jsx'
];

essentialComponents.forEach(component => {
  check(
    `${component} exists`,
    fs.existsSync(path.join(__dirname, '../src/components', component)),
    `Essential component ${component} missing`
  );
});

// 5. Services and APIs
console.log('\n═══════════════════════════════════════════════════════════');
console.log('5. Services and API Integration');
console.log('═══════════════════════════════════════════════════════════');

const services = [
  'api.js',
  'userService.js',
  'notificationManager.js'
];

services.forEach(service => {
  check(
    `${service} exists`,
    fs.existsSync(path.join(__dirname, '../src/services', service)),
    `Service ${service} missing`
  );
});

// 6. Styling Files
console.log('\n═══════════════════════════════════════════════════════════');
console.log('6. Core Styling Files');
console.log('═══════════════════════════════════════════════════════════');

const styles = [
  'darkMode.css',
  'responsiveFixes.css',
  'focusIndicators.css',
  'hoverEffects.css'
];

styles.forEach(style => {
  check(
    `${style} exists`,
    fs.existsSync(path.join(__dirname, '../src/styles', style)),
    `Style file ${style} missing`
  );
});

// 7. Configuration Files
console.log('\n═══════════════════════════════════════════════════════════');
console.log('7. Configuration Files');
console.log('═══════════════════════════════════════════════════════════');

check(
  'package.json exists',
  fs.existsSync(path.join(__dirname, '../package.json')),
  'package.json missing'
);

check(
  'vite.config.js exists',
  fs.existsSync(path.join(__dirname, '../vite.config.js')),
  'vite.config.js missing'
);

check(
  'manifest.json exists',
  fs.existsSync(path.join(__dirname, '../public/manifest.json')),
  'PWA manifest missing'
);

check(
  'service-worker.js exists',
  fs.existsSync(path.join(__dirname, '../public/service-worker.js')),
  'Service worker missing'
);

// 8. Input Border Color Check (Critical Rule)
console.log('\n═══════════════════════════════════════════════════════════');
console.log('8. Input Border Color Invariant (Critical)');
console.log('═══════════════════════════════════════════════════════════');

const cssFiles = [
  '../src/pages/02_LoginPage.css',
  '../src/pages/03_AuthPage.css',
  '../src/styles/darkMode.css'
];

cssFiles.forEach(cssFile => {
  const fullPath = path.join(__dirname, cssFile);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for the correct border color
    const hasCorrectBorder = content.includes('#D4816180') || content.includes('#d4816180');
    check(
      `${path.basename(cssFile)} uses correct input border color`,
      hasCorrectBorder,
      `Input border color must be #D4816180`
    );
    
    // Check for incorrect border colors
    const hasIncorrectBorder = content.match(/border.*#304B60/i);
    if (hasIncorrectBorder) {
      warn(
        `${path.basename(cssFile)} may have incorrect border`,
        'Found #304B60 border - verify it\'s not for inputs'
      );
    }
  }
});

// 9. Translation Files
console.log('\n═══════════════════════════════════════════════════════════');
console.log('9. Multi-Language Support');
console.log('═══════════════════════════════════════════════════════════');

const languages = ['ar.json', 'en.json', 'fr.json'];

languages.forEach(lang => {
  check(
    `${lang} exists`,
    fs.existsSync(path.join(__dirname, '../src/i18n', lang)),
    `Translation file ${lang} missing`
  );
});

// 10. Build Configuration
console.log('\n═══════════════════════════════════════════════════════════');
console.log('10. Build and Deployment Configuration');
console.log('═══════════════════════════════════════════════════════════');

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);

check(
  'Build script exists',
  packageJson.scripts && packageJson.scripts.build,
  'Build script missing in package.json'
);

check(
  'Dev script exists',
  packageJson.scripts && packageJson.scripts.dev,
  'Dev script missing in package.json'
);

check(
  'Preview script exists',
  packageJson.scripts && packageJson.scripts.preview,
  'Preview script missing in package.json'
);

// 11. Critical Dependencies
console.log('\n═══════════════════════════════════════════════════════════');
console.log('11. Critical Dependencies');
console.log('═══════════════════════════════════════════════════════════');

const criticalDeps = [
  'react',
  'react-dom',
  'react-router-dom',
  'framer-motion',
  'axios'
];

criticalDeps.forEach(dep => {
  check(
    `${dep} is installed`,
    packageJson.dependencies && packageJson.dependencies[dep],
    `Critical dependency ${dep} missing`
  );
});

// 12. Enhanced Features Integration
console.log('\n═══════════════════════════════════════════════════════════');
console.log('12. Enhanced Features Integration');
console.log('═══════════════════════════════════════════════════════════');

// Check if enhanced features are properly integrated
// Providers are in ApplicationShell, not App.jsx directly
const shellPath = path.join(__dirname, '../src/components/ApplicationShell.jsx');
if (fs.existsSync(shellPath)) {
  const shellContent = fs.readFileSync(shellPath, 'utf8');
  
  check(
    'ThemeProvider integrated',
    shellContent.includes('ThemeProvider') || shellContent.includes('ThemeContext'),
    'ThemeProvider not integrated in ApplicationShell'
  );

  check(
    'ErrorBoundary integrated',
    shellContent.includes('ErrorBoundary'),
    'ErrorBoundary not integrated in ApplicationShell'
  );
  
  check(
    'OfflineProvider integrated',
    shellContent.includes('OfflineProvider'),
    'OfflineProvider not integrated in ApplicationShell'
  );
} else {
  warn('ApplicationShell.jsx not found', 'Cannot verify provider integration');
}

// 13. Accessibility Features
console.log('\n═══════════════════════════════════════════════════════════');
console.log('13. Accessibility Features');
console.log('═══════════════════════════════════════════════════════════');

check(
  'Skip links component exists',
  fs.existsSync(path.join(__dirname, '../src/components/Accessibility/SkipLink.jsx')),
  'Skip links component missing'
);

check(
  'Focus indicators CSS exists',
  fs.existsSync(path.join(__dirname, '../src/styles/focusIndicators.css')),
  'Focus indicators CSS missing'
);

// 14. SEO Components
console.log('\n═══════════════════════════════════════════════════════════');
console.log('14. SEO Components');
console.log('═══════════════════════════════════════════════════════════');

check(
  'SEOHead component exists',
  fs.existsSync(path.join(__dirname, '../src/components/SEO/SEOHead.jsx')),
  'SEOHead component missing'
);

check(
  'StructuredData component exists',
  fs.existsSync(path.join(__dirname, '../src/components/SEO/StructuredData.jsx')),
  'StructuredData component missing'
);

// 15. Loading States
console.log('\n═══════════════════════════════════════════════════════════');
console.log('15. Loading States Components');
console.log('═══════════════════════════════════════════════════════════');

// SkeletonLoader is in SkeletonLoaders directory
check(
  'SkeletonLoader.jsx exists',
  fs.existsSync(path.join(__dirname, '../src/components/SkeletonLoaders/SkeletonLoader.jsx')),
  'SkeletonLoader component missing'
);

const loadingComponents = [
  'ProgressBar.jsx',
  'ButtonSpinner.jsx',
  'OverlaySpinner.jsx'
];

loadingComponents.forEach(component => {
  check(
    `${component} exists`,
    fs.existsSync(path.join(__dirname, '../src/components/Loading', component)),
    `Loading component ${component} missing`
  );
});

// Summary
console.log('\n═══════════════════════════════════════════════════════════');
console.log('Test Summary');
console.log('═══════════════════════════════════════════════════════════');
console.log(`✓ Passed:   ${passed}`);
console.log(`✗ Failed:   ${failed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log('═══════════════════════════════════════════════════════════\n');

if (failed === 0) {
  console.log('✅ All regression checks passed!');
  console.log('   No regressions detected in existing features.\n');
  process.exit(0);
} else {
  console.log('❌ Some regression checks failed!');
  console.log('   Please review the failures above.\n');
  process.exit(1);
}
