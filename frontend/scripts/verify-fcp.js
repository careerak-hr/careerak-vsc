/**
 * FCP Verification Script (Simplified)
 * Verifies FCP optimizations are in place
 * 
 * This script checks that all FCP optimizations are properly configured
 * without requiring a running server or Lighthouse.
 * 
 * Usage:
 *   node scripts/verify-fcp.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 FCP Optimization Verification');
console.log('━'.repeat(60));
console.log('');

let passed = 0;
let failed = 0;
const issues = [];

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

/**
 * Check if file contains text
 */
function fileContains(filePath, text) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) return false;
  const content = fs.readFileSync(fullPath, 'utf-8');
  return content.includes(text);
}

/**
 * Run a check
 */
function check(name, condition, recommendation = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    failed++;
    if (recommendation) {
      issues.push({ name, recommendation });
    }
  }
}

// Check 1: Resource hints in index.html
console.log('📋 Checking Resource Hints...');
check(
  'DNS prefetch for Cloudinary',
  fileContains('index.html', 'dns-prefetch" href="https://res.cloudinary.com'),
  'Add: <link rel="dns-prefetch" href="https://res.cloudinary.com" />'
);
check(
  'Preconnect for Cloudinary',
  fileContains('index.html', 'preconnect" href="https://res.cloudinary.com'),
  'Add: <link rel="preconnect" href="https://res.cloudinary.com" crossorigin />'
);
check(
  'DNS prefetch for API',
  fileContains('index.html', 'dns-prefetch" href="https://careerak.com'),
  'Add: <link rel="dns-prefetch" href="https://careerak.com" />'
);
check(
  'Preconnect for API',
  fileContains('index.html', 'preconnect" href="https://careerak.com'),
  'Add: <link rel="preconnect" href="https://careerak.com" crossorigin />'
);
console.log('');

// Check 2: Critical CSS inlined
console.log('📋 Checking Critical CSS...');
check(
  'Critical CSS inlined in index.html',
  fileContains('index.html', 'Critical CSS inlined for faster FCP'),
  'Inline critical CSS in <head> of index.html'
);
check(
  'CSS variables defined',
  fileContains('index.html', '--primary: #304B60'),
  'Define CSS variables in inline styles'
);
check(
  'Body styles defined',
  fileContains('index.html', 'background-color: #E3DAD0'),
  'Define body styles in inline styles'
);
console.log('');

// Check 3: Font preloading
console.log('📋 Checking Font Preloading...');
check(
  'Amiri font preloaded',
  fileContains('index.html', 'preload" href="/src/assets/fonts/amiri/Amiri-Regular.woff2'),
  'Add: <link rel="preload" href="/src/assets/fonts/amiri/Amiri-Regular.woff2" as="font" type="font/woff2" crossorigin />'
);
check(
  'Cormorant Garamond font preloaded',
  fileContains('index.html', 'preload" href="/src/assets/fonts/cormorant-garamond/CormorantGaramond-Regular.woff2'),
  'Add: <link rel="preload" href="/src/assets/fonts/cormorant-garamond/CormorantGaramond-Regular.woff2" as="font" type="font/woff2" crossorigin />'
);
check(
  'EB Garamond font preloaded',
  fileContains('index.html', 'preload" href="/src/assets/fonts/eb-garamond/EBGaramond-Regular.woff2'),
  'Add: <link rel="preload" href="/src/assets/fonts/eb-garamond/EBGaramond-Regular.woff2" as="font" type="font/woff2" crossorigin />'
);
console.log('');

// Check 4: Initial loading indicator
console.log('📋 Checking Initial Loading Indicator...');
check(
  'Initial loader in HTML',
  fileContains('index.html', 'initial-loader'),
  'Add initial loader div in #root'
);
check(
  'Loader styles defined',
  fileContains('index.html', '.initial-loader'),
  'Define .initial-loader styles in inline CSS'
);
check(
  'App ready class handler',
  fileContains('src/index.jsx', 'app-ready'),
  'Add code to remove loader when app is ready'
);
console.log('');

// Check 5: Code splitting configuration
console.log('📋 Checking Code Splitting...');
check(
  'Vite config exists',
  fileExists('vite.config.js'),
  'Create vite.config.js with code splitting configuration'
);
check(
  'Manual chunks configured',
  fileContains('vite.config.js', 'manualChunks'),
  'Configure manualChunks in vite.config.js'
);
check(
  'Chunk size limit set',
  fileContains('vite.config.js', 'chunkSizeWarningLimit'),
  'Set chunkSizeWarningLimit to 200 in vite.config.js'
);
console.log('');

// Check 6: Performance measurement
console.log('📋 Checking Performance Measurement...');
check(
  'Performance measurement utility exists',
  fileExists('src/utils/performanceMeasurement.js'),
  'Create src/utils/performanceMeasurement.js'
);
check(
  'FCP measurement configured',
  fileContains('src/utils/performanceMeasurement.js', 'onFCP'),
  'Add FCP measurement using web-vitals library'
);
check(
  'Performance measurement initialized',
  fileContains('src/index.jsx', 'initPerformanceMeasurement'),
  'Initialize performance measurement in src/index.jsx'
);
console.log('');

// Check 7: Caching headers
console.log('📋 Checking Caching Configuration...');
check(
  'Vercel config exists',
  fileExists('../vercel.json'),
  'Create vercel.json with caching headers'
);
check(
  'Static assets cache configured',
  fileContains('../vercel.json', 'max-age=2592000'),
  'Configure 30-day cache for static assets in vercel.json'
);
console.log('');

// Check 8: Compression
console.log('📋 Checking Compression...');
check(
  'PostCSS config exists',
  fileExists('postcss.config.js'),
  'Create postcss.config.js'
);
check(
  'CSS minification configured',
  fileContains('postcss.config.js', 'cssnano'),
  'Configure cssnano in postcss.config.js'
);
check(
  'Terser minification configured',
  fileContains('vite.config.js', 'terser'),
  'Configure Terser minification in vite.config.js'
);
console.log('');

// Check 9: Documentation
console.log('📋 Checking Documentation...');
check(
  'FCP optimization guide exists',
  fileExists('../docs/FCP_OPTIMIZATION.md'),
  'Create docs/FCP_OPTIMIZATION.md'
);
check(
  'FCP quick start guide exists',
  fileExists('../docs/FCP_QUICK_START.md'),
  'Create docs/FCP_QUICK_START.md'
);
console.log('');

// Summary
console.log('━'.repeat(60));
console.log('📊 Summary');
console.log('━'.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
console.log('');

if (failed === 0) {
  console.log('✅ SUCCESS: All FCP optimizations are in place!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Start development server: npm run dev');
  console.log('2. Measure FCP: npm run measure:fcp');
  console.log('3. Verify FCP < 1.8s in Lighthouse');
  console.log('');
  process.exit(0);
} else {
  console.log('❌ FAILED: Some FCP optimizations are missing');
  console.log('');
  console.log('Issues to fix:');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.name}`);
    console.log(`   → ${issue.recommendation}`);
    console.log('');
  });
  console.log('See docs/FCP_OPTIMIZATION.md for detailed instructions');
  console.log('');
  process.exit(1);
}
