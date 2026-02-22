#!/usr/bin/env node

/**
 * TTI Verification Script
 * 
 * This script verifies that Time to Interactive (TTI) is under 3.8 seconds
 * by analyzing the build output and making reasonable estimates based on:
 * - Bundle sizes
 * - Number of chunks
 * - Critical path resources
 * 
 * Requirements: FR-PERF-10, NFR-PERF-4
 * Target: TTI < 3.8s on Fast 3G
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

// Fast 3G network conditions
const NETWORK = {
  downloadSpeed: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps in bytes/sec
  latency: 150, // 150ms RTT
};

// TTI estimation formula:
// TTI ≈ (HTML download + CSS download + JS download + Parse/Compile + Execution) + Network latency
// 
// Assumptions for Fast 3G:
// - HTML: ~10KB (negligible)
// - CSS: Parallel download with JS
// - JS Parse/Compile: ~1ms per KB
// - JS Execution: ~2ms per KB for initial bundle
// - Network latency: 150ms per round trip

function estimateTTI(buildPath) {
  console.log(colorize('\n🔍 Analyzing Build Output for TTI Estimation', 'cyan'));
  console.log(colorize('='.repeat(70), 'cyan'));

  // Read build directory
  const assetsPath = path.join(buildPath, 'assets');
  
  if (!fs.existsSync(assetsPath)) {
    console.error(colorize('\n❌ Error: Build assets not found!', 'red'));
    console.log(colorize('Please run "npm run build" first.', 'yellow'));
    return false;
  }

  // Find all JS and CSS files
  const jsFiles = [];
  const cssFiles = [];

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.js') && !file.endsWith('.map')) {
        const size = stat.size;
        jsFiles.push({ name: file, size, path: filePath });
      } else if (file.endsWith('.css')) {
        const size = stat.size;
        cssFiles.push({ name: file, size, path: filePath });
      }
    });
  }

  scanDirectory(assetsPath);

  // Identify critical resources (loaded on initial page load)
  // Critical: index.html, main CSS, main JS, react-vendor, router-vendor
  const criticalJS = jsFiles.filter(f => 
    f.name.includes('index-') || 
    f.name.includes('main-') ||
    f.name.includes('react-vendor-') ||
    f.name.includes('router-vendor-')
  );

  const criticalCSS = cssFiles.filter(f => 
    f.name.includes('index-')
  );

  console.log(colorize('\n📦 Critical Resources (Initial Load):', 'blue'));
  
  let totalCriticalJS = 0;
  let totalCriticalCSS = 0;

  console.log(colorize('\nJavaScript:', 'cyan'));
  criticalJS.forEach(file => {
    console.log(`  ${file.name}: ${formatSize(file.size)}`);
    totalCriticalJS += file.size;
  });

  console.log(colorize('\nCSS:', 'cyan'));
  criticalCSS.forEach(file => {
    console.log(`  ${file.name}: ${formatSize(file.size)}`);
    totalCriticalCSS += file.size;
  });

  console.log(colorize('\n📊 Size Summary:', 'blue'));
  console.log(`  Total Critical JS:  ${formatSize(totalCriticalJS)}`);
  console.log(`  Total Critical CSS: ${formatSize(totalCriticalCSS)}`);
  console.log(`  Total Critical:     ${formatSize(totalCriticalJS + totalCriticalCSS)}`);

  // Estimate TTI
  console.log(colorize('\n⏱️  TTI Estimation (Fast 3G):', 'blue'));

  // 1. Network time (download)
  const htmlSize = 10 * 1024; // ~10KB HTML
  const totalDownloadSize = htmlSize + totalCriticalJS + totalCriticalCSS;
  const downloadTime = (totalDownloadSize / NETWORK.downloadSpeed) * 1000; // in ms
  
  // 2. Network latency (3 round trips: HTML, CSS+JS, additional resources)
  const latencyTime = NETWORK.latency * 3;

  // 3. Parse and compile time (1ms per KB of JS)
  const parseTime = (totalCriticalJS / 1024) * 1;

  // 4. Execution time (2ms per KB of JS for initial bundle)
  const executionTime = (totalCriticalJS / 1024) * 2;

  // 5. React hydration time (estimated 200ms for typical app)
  const hydrationTime = 200;

  const estimatedTTI = downloadTime + latencyTime + parseTime + executionTime + hydrationTime;

  console.log(`  1. Download time:    ${downloadTime.toFixed(0)}ms`);
  console.log(`  2. Network latency:  ${latencyTime.toFixed(0)}ms`);
  console.log(`  3. Parse time:       ${parseTime.toFixed(0)}ms`);
  console.log(`  4. Execution time:   ${executionTime.toFixed(0)}ms`);
  console.log(`  5. Hydration time:   ${hydrationTime.toFixed(0)}ms`);
  console.log(colorize(`\n  Estimated TTI:       ${(estimatedTTI / 1000).toFixed(2)}s`, 'cyan'));

  // Check against target
  const TARGET_TTI = 3800; // 3.8s in ms
  const meetsTTI = estimatedTTI <= TARGET_TTI;

  console.log(colorize('\n' + '='.repeat(70), 'cyan'));
  console.log(colorize('🎯 TTI Target Check', 'cyan'));
  console.log(colorize('='.repeat(70), 'cyan'));

  console.log(`\nTarget: < ${(TARGET_TTI / 1000).toFixed(1)}s`);
  console.log(`Estimated: ${(estimatedTTI / 1000).toFixed(2)}s`);

  if (meetsTTI) {
    const margin = TARGET_TTI - estimatedTTI;
    console.log(colorize(`\n✅ SUCCESS: TTI target met!`, 'green'));
    console.log(colorize(`Margin: ${(margin / 1000).toFixed(2)}s under target`, 'green'));
  } else {
    const excess = estimatedTTI - TARGET_TTI;
    console.log(colorize(`\n❌ FAILED: TTI target not met`, 'red'));
    console.log(colorize(`Excess: ${(excess / 1000).toFixed(2)}s over target`, 'red'));
    
    console.log(colorize('\n💡 Recommendations:', 'yellow'));
    
    if (totalCriticalJS > 300 * 1024) {
      console.log(colorize('  • Reduce critical JS bundle size (currently > 300KB)', 'yellow'));
      console.log(colorize('    - Move non-critical code to lazy-loaded chunks', 'yellow'));
      console.log(colorize('    - Use dynamic imports for heavy libraries', 'yellow'));
    }
    
    if (criticalJS.length > 4) {
      console.log(colorize('  • Too many critical JS chunks (currently > 4)', 'yellow'));
      console.log(colorize('    - Consolidate vendor chunks', 'yellow'));
      console.log(colorize('    - Reduce number of initial imports', 'yellow'));
    }
    
    console.log(colorize('  • Consider code splitting strategies:', 'yellow'));
    console.log(colorize('    - Route-based splitting (already implemented)', 'yellow'));
    console.log(colorize('    - Component-level lazy loading', 'yellow'));
    console.log(colorize('    - Defer non-critical features', 'yellow'));
  }

  // Additional metrics
  console.log(colorize('\n📈 Additional Metrics:', 'blue'));
  console.log(`  Total JS files:      ${jsFiles.length}`);
  console.log(`  Total CSS files:     ${cssFiles.length}`);
  console.log(`  Critical JS chunks:  ${criticalJS.length}`);
  console.log(`  Critical CSS chunks: ${criticalCSS.length}`);

  // Check for oversized chunks
  const oversizedChunks = jsFiles.filter(f => f.size > 200 * 1024);
  if (oversizedChunks.length > 0) {
    console.log(colorize('\n⚠️  Warning: Oversized chunks detected (> 200KB):', 'yellow'));
    oversizedChunks.forEach(chunk => {
      console.log(`  ${chunk.name}: ${formatSize(chunk.size)}`);
    });
  }

  console.log();

  return meetsTTI;
}

// Run verification
const buildPath = path.join(__dirname, '../build');
const success = estimateTTI(buildPath);

process.exit(success ? 0 : 1);
