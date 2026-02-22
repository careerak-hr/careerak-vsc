#!/usr/bin/env node

/**
 * Automated Slow Network Testing Script
 * 
 * This script uses Lighthouse to test loading states on slow network conditions.
 * It complements the manual testing guide by providing automated performance metrics.
 * 
 * Task: 8.6.6 Test loading states on slow network
 * 
 * Usage:
 *   node scripts/test-slow-network.js
 *   node scripts/test-slow-network.js --url=http://localhost:5173
 *   node scripts/test-slow-network.js --throttling=mobile3G
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  url: process.argv.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:5173',
  throttling: process.argv.find(arg => arg.startsWith('--throttling='))?.split('=')[1] || 'mobile3G',
  outputDir: path.join(__dirname, '../lighthouse-reports'),
};

// Throttling profiles
const throttlingProfiles = {
  mobile3G: {
    rttMs: 300,
    throughputKbps: 700,
    requestLatencyMs: 300 * 3.75,
    downloadThroughputKbps: 700,
    uploadThroughputKbps: 700,
    cpuSlowdownMultiplier: 4,
  },
  slow3G: {
    rttMs: 400,
    throughputKbps: 400,
    requestLatencyMs: 400 * 3.75,
    downloadThroughputKbps: 400,
    uploadThroughputKbps: 400,
    cpuSlowdownMultiplier: 4,
  },
  fast3G: {
    rttMs: 150,
    throughputKbps: 1600,
    requestLatencyMs: 150 * 3.75,
    downloadThroughputKbps: 1600,
    uploadThroughputKbps: 750,
    cpuSlowdownMultiplier: 4,
  },
};

// Pages to test
const pagesToTest = [
  { name: 'Home', path: '/' },
  { name: 'Jobs', path: '/jobs' },
  { name: 'Courses', path: '/courses' },
  { name: 'Login', path: '/login' },
];

/**
 * Run Lighthouse audit on a URL
 */
async function runLighthouse(url, throttling) {
  console.log(`\n🔍 Testing: ${url}`);
  console.log(`📡 Network: ${throttling}`);

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
    throttling: throttlingProfiles[throttling],
    throttlingMethod: 'simulate',
  };

  const runnerResult = await lighthouse(url, options);
  await chrome.kill();

  return runnerResult;
}

/**
 * Extract relevant metrics from Lighthouse result
 */
function extractMetrics(result) {
  const { lhr } = result;
  const { audits } = lhr;

  return {
    performanceScore: Math.round(lhr.categories.performance.score * 100),
    metrics: {
      fcp: {
        value: audits['first-contentful-paint'].numericValue,
        displayValue: audits['first-contentful-paint'].displayValue,
        passed: audits['first-contentful-paint'].numericValue < 1800, // < 1.8s
      },
      tti: {
        value: audits['interactive'].numericValue,
        displayValue: audits['interactive'].displayValue,
        passed: audits['interactive'].numericValue < 3800, // < 3.8s
      },
      cls: {
        value: audits['cumulative-layout-shift'].numericValue,
        displayValue: audits['cumulative-layout-shift'].displayValue,
        passed: audits['cumulative-layout-shift'].numericValue < 0.1,
      },
      lcp: {
        value: audits['largest-contentful-paint'].numericValue,
        displayValue: audits['largest-contentful-paint'].displayValue,
      },
      tbt: {
        value: audits['total-blocking-time'].numericValue,
        displayValue: audits['total-blocking-time'].displayValue,
      },
      speedIndex: {
        value: audits['speed-index'].numericValue,
        displayValue: audits['speed-index'].displayValue,
      },
    },
    opportunities: audits['diagnostics']?.details?.items || [],
  };
}

/**
 * Print metrics in a readable format
 */
function printMetrics(pageName, metrics) {
  console.log(`\n📊 Results for ${pageName}:`);
  console.log(`   Performance Score: ${metrics.performanceScore}/100`);
  console.log(`\n   Core Web Vitals:`);
  console.log(`   ├─ FCP: ${metrics.metrics.fcp.displayValue} ${metrics.metrics.fcp.passed ? '✅' : '❌'} (Target: < 1.8s)`);
  console.log(`   ├─ TTI: ${metrics.metrics.tti.displayValue} ${metrics.metrics.tti.passed ? '✅' : '❌'} (Target: < 3.8s)`);
  console.log(`   ├─ CLS: ${metrics.metrics.cls.displayValue} ${metrics.metrics.cls.passed ? '✅' : '❌'} (Target: < 0.1)`);
  console.log(`   ├─ LCP: ${metrics.metrics.lcp.displayValue}`);
  console.log(`   ├─ TBT: ${metrics.metrics.tbt.displayValue}`);
  console.log(`   └─ Speed Index: ${metrics.metrics.speedIndex.displayValue}`);
}

/**
 * Save report to file
 */
function saveReport(results, throttling) {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `slow-network-test-${throttling}-${timestamp}.json`;
  const filepath = path.join(config.outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Report saved: ${filepath}`);
}

/**
 * Generate summary report
 */
function generateSummary(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📋 SUMMARY REPORT');
  console.log('='.repeat(80));

  const allPassed = results.every(r => 
    r.metrics.metrics.fcp.passed && 
    r.metrics.metrics.tti.passed && 
    r.metrics.metrics.cls.passed
  );

  console.log(`\n✨ Overall Status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`\n📈 Performance Scores:`);
  
  results.forEach(result => {
    console.log(`   ${result.page}: ${result.metrics.performanceScore}/100`);
  });

  console.log(`\n🎯 Core Web Vitals:`);
  console.log(`   Metric | Target  | Results`);
  console.log(`   -------|---------|--------`);
  
  const fcpResults = results.map(r => r.metrics.metrics.fcp.passed ? '✅' : '❌').join(' ');
  const ttiResults = results.map(r => r.metrics.metrics.tti.passed ? '✅' : '❌').join(' ');
  const clsResults = results.map(r => r.metrics.metrics.cls.passed ? '✅' : '❌').join(' ');
  
  console.log(`   FCP    | < 1.8s  | ${fcpResults}`);
  console.log(`   TTI    | < 3.8s  | ${ttiResults}`);
  console.log(`   CLS    | < 0.1   | ${clsResults}`);

  console.log('\n' + '='.repeat(80));
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Slow Network Testing...');
  console.log(`📡 Network Profile: ${config.throttling}`);
  console.log(`🌐 Base URL: ${config.url}`);

  const results = [];

  for (const page of pagesToTest) {
    try {
      const url = `${config.url}${page.path}`;
      const result = await runLighthouse(url, config.throttling);
      const metrics = extractMetrics(result);
      
      printMetrics(page.name, metrics);
      
      results.push({
        page: page.name,
        url: url,
        metrics: metrics,
      });
    } catch (error) {
      console.error(`\n❌ Error testing ${page.name}:`, error.message);
    }
  }

  if (results.length > 0) {
    generateSummary(results);
    saveReport(results, config.throttling);
  }

  console.log('\n✅ Testing complete!');
  console.log('\n📖 For manual testing, see: frontend/docs/SLOW_NETWORK_TESTING_GUIDE.md');
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
