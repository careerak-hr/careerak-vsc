#!/usr/bin/env node

/**
 * Bundle Size Monitoring Script
 * 
 * This script provides continuous monitoring of bundle sizes:
 * - Tracks bundle sizes over time
 * - Compares with previous builds
 * - Alerts when sizes exceed thresholds
 * - Maintains historical data
 * - Generates trend reports
 * 
 * Requirements: Task 10.4.2
 * Related: NFR-PERF-2, FR-PERF-5
 */

const fs = require('fs');
const path = require('path');
const { gzipSync, brotliCompressSync } = require('zlib');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

// Thresholds for alerts
const THRESHOLDS = {
  maxChunkSize: 200 * 1024,        // 200 KB (per requirement)
  maxInitialJS: 1000 * 1024,       // 1 MB
  maxTotalJS: 2000 * 1024,         // 2 MB
  maxCSS: 150 * 1024,              // 150 KB
  increaseWarning: 10,             // Warn if size increases by 10%+
  increaseError: 20,               // Error if size increases by 20%+
};

// History file location
const HISTORY_DIR = path.resolve(__dirname, '../.bundle-history');
const HISTORY_FILE = path.join(HISTORY_DIR, 'bundle-sizes.json');
const MAX_HISTORY_ENTRIES = 100; // Keep last 100 builds

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Calculate percentage change
 */
function calculateChange(previous, current) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous * 100).toFixed(2);
}

/**
 * Get file sizes with compression
 */
function getFileSizes(filePath) {
  const content = fs.readFileSync(filePath);
  const raw = content.length;
  const gzip = gzipSync(content).length;
  const brotli = brotliCompressSync(content).length;
  
  return { raw, gzip, brotli };
}

/**
 * Recursively get all files in directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Load history from file
 */
function loadHistory() {
  if (!fs.existsSync(HISTORY_FILE)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn(`${colors.yellow}⚠️  Could not load history: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Save history to file
 */
function saveHistory(history) {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }
  
  // Keep only last MAX_HISTORY_ENTRIES
  const trimmedHistory = history.slice(-MAX_HISTORY_ENTRIES);
  
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmedHistory, null, 2));
}

/**
 * Analyze current build
 */
function analyzeCurrentBuild() {
  const buildDir = path.resolve(__dirname, '../build');
  const assetsDir = path.join(buildDir, 'assets');
  
  if (!fs.existsSync(buildDir)) {
    throw new Error(`Build directory not found: ${buildDir}. Run 'npm run build' first.`);
  }

  // Get all JS and CSS files
  const jsFiles = getAllFiles(assetsDir).filter(f => f.endsWith('.js') && !f.endsWith('.map'));
  const cssFiles = getAllFiles(assetsDir).filter(f => f.endsWith('.css'));

  // Calculate sizes
  let totalJSRaw = 0;
  let totalJSGzip = 0;
  let totalJSBrotli = 0;
  let largestChunk = { name: '', size: 0 };
  const chunks = [];

  jsFiles.forEach(file => {
    const sizes = getFileSizes(file);
    totalJSRaw += sizes.raw;
    totalJSGzip += sizes.gzip;
    totalJSBrotli += sizes.brotli;
    
    const fileName = path.basename(file);
    chunks.push({
      name: fileName,
      size: sizes.raw,
      gzip: sizes.gzip,
      brotli: sizes.brotli,
    });

    if (sizes.raw > largestChunk.size) {
      largestChunk = { name: fileName, size: sizes.raw };
    }
  });

  let totalCSSRaw = 0;
  let totalCSSGzip = 0;
  let totalCSSBrotli = 0;

  cssFiles.forEach(file => {
    const sizes = getFileSizes(file);
    totalCSSRaw += sizes.raw;
    totalCSSGzip += sizes.gzip;
    totalCSSBrotli += sizes.brotli;
  });

  return {
    timestamp: new Date().toISOString(),
    git: getGitInfo(),
    totalJS: {
      raw: totalJSRaw,
      gzip: totalJSGzip,
      brotli: totalJSBrotli,
    },
    totalCSS: {
      raw: totalCSSRaw,
      gzip: totalCSSGzip,
      brotli: totalCSSBrotli,
    },
    largestChunk: {
      name: largestChunk.name,
      size: largestChunk.size,
    },
    fileCount: {
      js: jsFiles.length,
      css: cssFiles.length,
    },
    chunks: chunks.sort((a, b) => b.size - a.size).slice(0, 10), // Top 10
  };
}

/**
 * Get Git information
 */
function getGitInfo() {
  try {
    const { execSync } = require('child_process');
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    const message = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();
    
    return { branch, commit, message };
  } catch (error) {
    return { branch: 'unknown', commit: 'unknown', message: 'unknown' };
  }
}

/**
 * Check thresholds and generate alerts
 */
function checkThresholds(current, previous) {
  const alerts = [];

  // Check absolute thresholds
  if (current.largestChunk.size > THRESHOLDS.maxChunkSize) {
    alerts.push({
      level: 'error',
      type: 'chunk_size',
      message: `Largest chunk (${current.largestChunk.name}) exceeds limit: ${formatBytes(current.largestChunk.size)} > ${formatBytes(THRESHOLDS.maxChunkSize)}`,
      current: current.largestChunk.size,
      threshold: THRESHOLDS.maxChunkSize,
    });
  }

  if (current.totalJS.raw > THRESHOLDS.maxTotalJS) {
    alerts.push({
      level: 'warning',
      type: 'total_js',
      message: `Total JS size exceeds recommended limit: ${formatBytes(current.totalJS.raw)} > ${formatBytes(THRESHOLDS.maxTotalJS)}`,
      current: current.totalJS.raw,
      threshold: THRESHOLDS.maxTotalJS,
    });
  }

  if (current.totalCSS.raw > THRESHOLDS.maxCSS) {
    alerts.push({
      level: 'warning',
      type: 'total_css',
      message: `Total CSS size exceeds recommended limit: ${formatBytes(current.totalCSS.raw)} > ${formatBytes(THRESHOLDS.maxCSS)}`,
      current: current.totalCSS.raw,
      threshold: THRESHOLDS.maxCSS,
    });
  }

  // Check changes from previous build
  if (previous) {
    const jsChange = calculateChange(previous.totalJS.raw, current.totalJS.raw);
    const cssChange = calculateChange(previous.totalCSS.raw, current.totalCSS.raw);
    const chunkChange = calculateChange(previous.largestChunk.size, current.largestChunk.size);

    if (Math.abs(jsChange) >= THRESHOLDS.increaseError) {
      alerts.push({
        level: 'error',
        type: 'js_increase',
        message: `Total JS size changed significantly: ${jsChange > 0 ? '+' : ''}${jsChange}%`,
        previous: previous.totalJS.raw,
        current: current.totalJS.raw,
        change: jsChange,
      });
    } else if (Math.abs(jsChange) >= THRESHOLDS.increaseWarning) {
      alerts.push({
        level: 'warning',
        type: 'js_increase',
        message: `Total JS size changed: ${jsChange > 0 ? '+' : ''}${jsChange}%`,
        previous: previous.totalJS.raw,
        current: current.totalJS.raw,
        change: jsChange,
      });
    }

    if (Math.abs(cssChange) >= THRESHOLDS.increaseWarning) {
      alerts.push({
        level: 'warning',
        type: 'css_increase',
        message: `Total CSS size changed: ${cssChange > 0 ? '+' : ''}${cssChange}%`,
        previous: previous.totalCSS.raw,
        current: current.totalCSS.raw,
        change: cssChange,
      });
    }

    if (Math.abs(chunkChange) >= THRESHOLDS.increaseWarning) {
      alerts.push({
        level: 'warning',
        type: 'chunk_increase',
        message: `Largest chunk size changed: ${chunkChange > 0 ? '+' : ''}${chunkChange}%`,
        previous: previous.largestChunk.size,
        current: current.largestChunk.size,
        change: chunkChange,
      });
    }
  }

  return alerts;
}

/**
 * Print monitoring report
 */
function printReport(current, previous, alerts) {
  console.log(`${colors.bright}${colors.cyan}📊 Bundle Size Monitoring Report${colors.reset}\n`);
  console.log(`${colors.blue}Timestamp: ${new Date(current.timestamp).toLocaleString()}${colors.reset}`);
  console.log(`${colors.blue}Git: ${current.git.branch}@${current.git.commit}${colors.reset}\n`);

  // Current sizes
  console.log(`${colors.bright}=== Current Build ===${colors.reset}\n`);
  console.log(`Total JS:      ${formatBytes(current.totalJS.raw)} (gzip: ${formatBytes(current.totalJS.gzip)})`);
  console.log(`Total CSS:     ${formatBytes(current.totalCSS.raw)} (gzip: ${formatBytes(current.totalCSS.gzip)})`);
  console.log(`Largest chunk: ${formatBytes(current.largestChunk.size)} (${current.largestChunk.name})`);
  console.log(`File count:    ${current.fileCount.js} JS, ${current.fileCount.css} CSS\n`);

  // Comparison with previous
  if (previous) {
    console.log(`${colors.bright}=== Changes from Previous Build ===${colors.reset}\n`);
    
    const jsChange = calculateChange(previous.totalJS.raw, current.totalJS.raw);
    const cssChange = calculateChange(previous.totalCSS.raw, current.totalCSS.raw);
    const chunkChange = calculateChange(previous.largestChunk.size, current.largestChunk.size);

    const jsColor = Math.abs(jsChange) < 5 ? colors.green : Math.abs(jsChange) < 10 ? colors.yellow : colors.red;
    const cssColor = Math.abs(cssChange) < 5 ? colors.green : Math.abs(cssChange) < 10 ? colors.yellow : colors.red;
    const chunkColor = Math.abs(chunkChange) < 5 ? colors.green : Math.abs(chunkChange) < 10 ? colors.yellow : colors.red;

    console.log(`Total JS:      ${jsColor}${jsChange > 0 ? '+' : ''}${jsChange}%${colors.reset} (${formatBytes(current.totalJS.raw - previous.totalJS.raw)})`);
    console.log(`Total CSS:     ${cssColor}${cssChange > 0 ? '+' : ''}${cssChange}%${colors.reset} (${formatBytes(current.totalCSS.raw - previous.totalCSS.raw)})`);
    console.log(`Largest chunk: ${chunkColor}${chunkChange > 0 ? '+' : ''}${chunkChange}%${colors.reset} (${formatBytes(current.largestChunk.size - previous.largestChunk.size)})\n`);
  }

  // Threshold checks
  console.log(`${colors.bright}=== Threshold Checks ===${colors.reset}\n`);
  
  const chunkOk = current.largestChunk.size <= THRESHOLDS.maxChunkSize;
  const jsOk = current.totalJS.raw <= THRESHOLDS.maxTotalJS;
  const cssOk = current.totalCSS.raw <= THRESHOLDS.maxCSS;

  console.log(`${chunkOk ? colors.green + '✓' : colors.red + '✗'} Chunk size limit (${formatBytes(THRESHOLDS.maxChunkSize)}): ${formatBytes(current.largestChunk.size)}${colors.reset}`);
  console.log(`${jsOk ? colors.green + '✓' : colors.yellow + '⚠'} Total JS limit (${formatBytes(THRESHOLDS.maxTotalJS)}): ${formatBytes(current.totalJS.raw)}${colors.reset}`);
  console.log(`${cssOk ? colors.green + '✓' : colors.yellow + '⚠'} Total CSS limit (${formatBytes(THRESHOLDS.maxCSS)}): ${formatBytes(current.totalCSS.raw)}${colors.reset}\n`);

  // Alerts
  if (alerts.length > 0) {
    console.log(`${colors.bright}=== Alerts (${alerts.length}) ===${colors.reset}\n`);
    
    alerts.forEach((alert, index) => {
      const icon = alert.level === 'error' ? '✗' : '⚠️';
      const color = alert.level === 'error' ? colors.red : colors.yellow;
      console.log(`${color}${icon} ${alert.message}${colors.reset}`);
    });
    console.log();
  } else {
    console.log(`${colors.green}✓ No alerts - all thresholds met!${colors.reset}\n`);
  }

  // Top chunks
  console.log(`${colors.bright}=== Top 5 Largest Chunks ===${colors.reset}\n`);
  current.chunks.slice(0, 5).forEach((chunk, index) => {
    const exceedsLimit = chunk.size > THRESHOLDS.maxChunkSize;
    const color = exceedsLimit ? colors.red : colors.green;
    const status = exceedsLimit ? '⚠️ ' : '✓ ';
    console.log(`${status}${index + 1}. ${chunk.name}`);
    console.log(`   ${color}${formatBytes(chunk.size)}${colors.reset} (gzip: ${formatBytes(chunk.gzip)})`);
  });
  console.log();
}

/**
 * Generate trend report
 */
function generateTrendReport(history) {
  if (history.length < 2) {
    console.log(`${colors.yellow}Not enough data for trend analysis (need at least 2 builds)${colors.reset}\n`);
    return;
  }

  console.log(`${colors.bright}=== Trend Analysis (Last ${Math.min(10, history.length)} Builds) ===${colors.reset}\n`);

  const recent = history.slice(-10);
  const oldest = recent[0];
  const newest = recent[recent.length - 1];

  const jsTrend = calculateChange(oldest.totalJS.raw, newest.totalJS.raw);
  const cssTrend = calculateChange(oldest.totalCSS.raw, newest.totalCSS.raw);
  const chunkTrend = calculateChange(oldest.largestChunk.size, newest.largestChunk.size);

  console.log(`Total JS trend:      ${jsTrend > 0 ? '+' : ''}${jsTrend}% over ${recent.length} builds`);
  console.log(`Total CSS trend:     ${cssTrend > 0 ? '+' : ''}${cssTrend}% over ${recent.length} builds`);
  console.log(`Largest chunk trend: ${chunkTrend > 0 ? '+' : ''}${chunkTrend}% over ${recent.length} builds\n`);

  // Simple ASCII chart for JS size
  console.log(`${colors.bright}JS Size History:${colors.reset}`);
  const maxSize = Math.max(...recent.map(h => h.totalJS.raw));
  const minSize = Math.min(...recent.map(h => h.totalJS.raw));
  const range = maxSize - minSize;

  recent.forEach((entry, index) => {
    const normalized = range > 0 ? (entry.totalJS.raw - minSize) / range : 0.5;
    const barLength = Math.round(normalized * 40);
    const bar = '█'.repeat(barLength) + '░'.repeat(40 - barLength);
    const date = new Date(entry.timestamp).toLocaleDateString();
    console.log(`${date} ${bar} ${formatBytes(entry.totalJS.raw)}`);
  });
  console.log();
}

/**
 * Main monitoring function
 */
function monitorBundleSizes() {
  try {
    console.log(`${colors.bright}${colors.magenta}🔍 Starting Bundle Size Monitoring...${colors.reset}\n`);

    // Analyze current build
    const current = analyzeCurrentBuild();

    // Load history
    const history = loadHistory();
    const previous = history.length > 0 ? history[history.length - 1] : null;

    // Check thresholds
    const alerts = checkThresholds(current, previous);

    // Print report
    printReport(current, previous, alerts);

    // Generate trend report
    if (history.length > 0) {
      generateTrendReport(history);
    }

    // Save to history
    history.push(current);
    saveHistory(history);

    console.log(`${colors.cyan}📁 History saved to: ${HISTORY_FILE}${colors.reset}`);
    console.log(`${colors.cyan}📊 Total builds tracked: ${history.length}${colors.reset}\n`);

    // Exit with appropriate code
    const hasErrors = alerts.some(a => a.level === 'error');
    const hasWarnings = alerts.some(a => a.level === 'warning');

    if (hasErrors) {
      console.log(`${colors.red}${colors.bright}✗ Monitoring failed: ${alerts.filter(a => a.level === 'error').length} error(s)${colors.reset}\n`);
      process.exit(1);
    } else if (hasWarnings) {
      console.log(`${colors.yellow}⚠️  Monitoring passed with warnings: ${alerts.filter(a => a.level === 'warning').length} warning(s)${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.green}${colors.bright}✓ Monitoring passed: All checks successful!${colors.reset}\n`);
      process.exit(0);
    }

  } catch (error) {
    console.error(`${colors.red}✗ Error during monitoring:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run monitoring
monitorBundleSizes();
