/**
 * FCP (First Contentful Paint) Measurement Script
 * Measures FCP and verifies it's under 1.8 seconds (FR-PERF-9, NFR-PERF-3)
 * 
 * Usage:
 *   node scripts/measure-fcp.js
 *   node scripts/measure-fcp.js --url=http://localhost:3000
 *   node scripts/measure-fcp.js --runs=5
 *   node scripts/measure-fcp.js --network=3g
 */

const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value || true;
  return acc;
}, {});

// Configuration
const config = {
  url: args.url || 'http://localhost:3000',
  runs: parseInt(args.runs) || 3,
  network: args.network || 'none', // none, 3g, 4g
  device: args.device || 'mobile', // mobile, desktop
  target: 1800, // 1.8 seconds in milliseconds (FR-PERF-9)
  outputDir: path.join(__dirname, '..', 'lighthouse-reports'),
};

// Network throttling presets
const networkProfiles = {
  none: null,
  '3g': {
    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
    uploadThroughput: 750 * 1024 / 8, // 750 Kbps
    latency: 150, // 150ms RTT
  },
  '4g': {
    downloadThroughput: 9 * 1024 * 1024 / 8, // 9 Mbps
    uploadThroughput: 9 * 1024 * 1024 / 8, // 9 Mbps
    latency: 40, // 40ms RTT
  },
};

// Device emulation presets
const devicePresets = {
  mobile: {
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false,
    },
  },
  desktop: {
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
  },
};

/**
 * Run Lighthouse audit
 */
async function runLighthouse(url, options = {}) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
  });

  const lighthouseOptions = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
    ...options,
  };

  // Configure throttling
  const throttling = networkProfiles[config.network];
  if (throttling) {
    lighthouseOptions.throttling = throttling;
    lighthouseOptions.throttlingMethod = 'simulate';
  }

  // Configure device emulation
  const device = devicePresets[config.device];
  if (device) {
    lighthouseOptions.formFactor = device.formFactor;
    lighthouseOptions.screenEmulation = device.screenEmulation;
  }

  try {
    const runnerResult = await lighthouse(url, lighthouseOptions);
    await chrome.kill();
    return runnerResult;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

/**
 * Extract FCP metric from Lighthouse result
 */
function extractFCP(result) {
  const audits = result.lhr.audits;
  const fcp = audits['first-contentful-paint'];
  
  return {
    value: fcp.numericValue,
    displayValue: fcp.displayValue,
    score: fcp.score,
    title: fcp.title,
  };
}

/**
 * Extract additional performance metrics
 */
function extractMetrics(result) {
  const audits = result.lhr.audits;
  
  return {
    fcp: {
      value: audits['first-contentful-paint']?.numericValue || 0,
      score: audits['first-contentful-paint']?.score || 0,
      displayValue: audits['first-contentful-paint']?.displayValue || 'N/A',
    },
    lcp: {
      value: audits['largest-contentful-paint']?.numericValue || 0,
      score: audits['largest-contentful-paint']?.score || 0,
      displayValue: audits['largest-contentful-paint']?.displayValue || 'N/A',
    },
    tti: {
      value: audits['interactive']?.numericValue || 0,
      score: audits['interactive']?.score || 0,
      displayValue: audits['interactive']?.displayValue || 'N/A',
    },
    tbt: {
      value: audits['total-blocking-time']?.numericValue || 0,
      score: audits['total-blocking-time']?.score || 0,
      displayValue: audits['total-blocking-time']?.displayValue || 'N/A',
    },
    cls: {
      value: audits['cumulative-layout-shift']?.numericValue || 0,
      score: audits['cumulative-layout-shift']?.score || 0,
      displayValue: audits['cumulative-layout-shift']?.displayValue || 'N/A',
    },
    speedIndex: {
      value: audits['speed-index']?.numericValue || 0,
      score: audits['speed-index']?.score || 0,
      displayValue: audits['speed-index']?.displayValue || 'N/A',
    },
    performanceScore: result.lhr.categories.performance.score * 100,
  };
}

/**
 * Calculate statistics from multiple runs
 */
function calculateStats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  
  return {
    min: Math.round(sorted[0]),
    max: Math.round(sorted[sorted.length - 1]),
    median: Math.round(sorted[Math.floor(sorted.length / 2)]),
    average: Math.round(sum / values.length),
    p75: Math.round(sorted[Math.floor(sorted.length * 0.75)]),
    p90: Math.round(sorted[Math.floor(sorted.length * 0.90)]),
  };
}

/**
 * Format milliseconds to seconds
 */
function formatMs(ms) {
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Get status icon based on value and target
 */
function getStatusIcon(value, target) {
  if (value <= target) return '✅';
  if (value <= target * 1.2) return '⚠️';
  return '❌';
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 FCP Measurement Tool');
  console.log('━'.repeat(60));
  console.log(`URL: ${config.url}`);
  console.log(`Runs: ${config.runs}`);
  console.log(`Network: ${config.network}`);
  console.log(`Device: ${config.device}`);
  console.log(`Target FCP: ${formatMs(config.target)} (FR-PERF-9)`);
  console.log('━'.repeat(60));
  console.log('');

  // Check if URL is accessible
  console.log('🔍 Checking if URL is accessible...');
  try {
    const response = await fetch(config.url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    console.log('✅ URL is accessible\n');
  } catch (error) {
    console.error('❌ URL is not accessible:', error.message);
    console.error('💡 Make sure the development server is running:');
    console.error('   npm run dev (or) npm start\n');
    process.exit(1);
  }

  // Run multiple audits
  const results = [];
  const fcpValues = [];
  
  for (let i = 1; i <= config.runs; i++) {
    console.log(`📊 Run ${i}/${config.runs}...`);
    
    try {
      const result = await runLighthouse(config.url);
      const metrics = extractMetrics(result);
      
      results.push(metrics);
      fcpValues.push(metrics.fcp.value);
      
      console.log(`   FCP: ${formatMs(metrics.fcp.value)} ${getStatusIcon(metrics.fcp.value, config.target)}`);
      console.log(`   LCP: ${formatMs(metrics.lcp.value)}`);
      console.log(`   TTI: ${formatMs(metrics.tti.value)}`);
      console.log(`   Performance Score: ${Math.round(metrics.performanceScore)}/100`);
      console.log('');
    } catch (error) {
      console.error(`❌ Run ${i} failed:`, error.message);
      console.log('');
    }
  }

  if (results.length === 0) {
    console.error('❌ All runs failed. Cannot generate report.');
    process.exit(1);
  }

  // Calculate statistics
  const stats = calculateStats(fcpValues);
  
  // Print summary
  console.log('━'.repeat(60));
  console.log('📈 FCP Statistics');
  console.log('━'.repeat(60));
  console.log(`Minimum:  ${formatMs(stats.min)} ${getStatusIcon(stats.min, config.target)}`);
  console.log(`Average:  ${formatMs(stats.average)} ${getStatusIcon(stats.average, config.target)}`);
  console.log(`Median:   ${formatMs(stats.median)} ${getStatusIcon(stats.median, config.target)}`);
  console.log(`75th %:   ${formatMs(stats.p75)} ${getStatusIcon(stats.p75, config.target)}`);
  console.log(`90th %:   ${formatMs(stats.p90)} ${getStatusIcon(stats.p90, config.target)}`);
  console.log(`Maximum:  ${formatMs(stats.max)} ${getStatusIcon(stats.max, config.target)}`);
  console.log('━'.repeat(60));
  console.log('');

  // Check if target is met
  const targetMet = stats.median <= config.target;
  
  if (targetMet) {
    console.log('✅ SUCCESS: FCP is under 1.8 seconds! (FR-PERF-9)');
    console.log(`   Median FCP: ${formatMs(stats.median)}`);
    console.log(`   Target: ${formatMs(config.target)}`);
  } else {
    console.log('❌ FAILED: FCP exceeds 1.8 seconds (FR-PERF-9)');
    console.log(`   Median FCP: ${formatMs(stats.median)}`);
    console.log(`   Target: ${formatMs(config.target)}`);
    console.log(`   Difference: +${formatMs(stats.median - config.target)}`);
    console.log('');
    console.log('💡 Optimization suggestions:');
    console.log('   - Reduce JavaScript bundle size');
    console.log('   - Optimize images (use WebP, lazy loading)');
    console.log('   - Minimize render-blocking resources');
    console.log('   - Use code splitting and lazy loading');
    console.log('   - Optimize font loading (preload critical fonts)');
    console.log('   - Reduce server response time (TTFB)');
  }
  
  console.log('');

  // Save detailed report
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  const reportPath = path.join(
    config.outputDir,
    `fcp-report-${Date.now()}.json`
  );

  const report = {
    timestamp: new Date().toISOString(),
    config: {
      url: config.url,
      runs: config.runs,
      network: config.network,
      device: config.device,
      target: config.target,
    },
    statistics: stats,
    targetMet,
    runs: results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Detailed report saved: ${reportPath}`);
  console.log('');

  // Exit with appropriate code
  process.exit(targetMet ? 0 : 1);
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
