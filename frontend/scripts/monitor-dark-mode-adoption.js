#!/usr/bin/env node

/**
 * Dark Mode Adoption Monitoring Script
 * 
 * Analyzes dark mode usage metrics from localStorage data.
 * Provides insights into adoption rates, trends, and user preferences.
 * 
 * Usage:
 *   node scripts/monitor-dark-mode-adoption.js [options]
 * 
 * Options:
 *   --period <days>      Analysis period in days (default: 30)
 *   --threshold <rate>   Adoption rate threshold for alerts (default: 0.30 = 30%)
 *   --platform <name>    Filter by platform (Android, iOS, Desktop)
 *   --browser <name>     Filter by browser (Chrome, Safari, Firefox, Edge)
 *   --export             Export metrics to JSON file
 *   --watch              Continuous monitoring mode (updates every 5 minutes)
 * 
 * Examples:
 *   npm run monitor:darkmode
 *   npm run monitor:darkmode -- --period 7
 *   npm run monitor:darkmode -- --threshold 0.25
 *   npm run monitor:darkmode:export
 *   npm run monitor:darkmode:watch
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  period: 30,
  threshold: 0.30, // 30% adoption rate target
  platform: null,
  browser: null,
  export: false,
  watch: false,
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--period':
      options.period = parseInt(args[++i], 10);
      break;
    case '--threshold':
      options.threshold = parseFloat(args[++i]);
      break;
    case '--platform':
      options.platform = args[++i];
      break;
    case '--browser':
      options.browser = args[++i];
      break;
    case '--export':
      options.export = true;
      break;
    case '--watch':
      options.watch = true;
      break;
  }
}

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

/**
 * Load metrics from file
 * @returns {Array} Array of metric events
 */
function loadMetrics() {
  const metricsDir = path.join(__dirname, '..', '.dark-mode-metrics');
  const metricsFile = path.join(metricsDir, 'adoption-metrics.json');

  if (!fs.existsSync(metricsFile)) {
    return [];
  }

  try {
    const data = fs.readFileSync(metricsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load metrics:', error.message);
    return [];
  }
}

/**
 * Calculate metrics from events
 * @param {Array} events - Array of metric events
 * @param {Object} options - Filter options
 * @returns {Object} Calculated metrics
 */
function calculateMetrics(events, options) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - options.period);

  // Filter events
  let filtered = events.filter(event => {
    const eventDate = new Date(event.timestamp);
    if (eventDate < cutoffDate) return false;
    if (options.platform && event.platform !== options.platform) return false;
    if (options.browser && event.browser !== options.browser) return false;
    return true;
  });

  // Count theme changes
  const themeChanges = filtered.filter(e => e.type === 'theme_changed');
  
  // Count sessions by theme
  const sessionStarts = filtered.filter(e => e.type === 'session_start');
  const darkSessions = sessionStarts.filter(e => e.isDark).length;
  const lightSessions = sessionStarts.filter(e => !e.isDark).length;
  const totalSessions = sessionStarts.length;

  // Calculate adoption rate
  const adoptionRate = totalSessions > 0 ? (darkSessions / totalSessions) : 0;

  // Count by platform
  const byPlatform = {};
  sessionStarts.forEach(event => {
    const platform = event.platform || 'Unknown';
    if (!byPlatform[platform]) {
      byPlatform[platform] = { dark: 0, light: 0, total: 0 };
    }
    byPlatform[platform].total++;
    if (event.isDark) {
      byPlatform[platform].dark++;
    } else {
      byPlatform[platform].light++;
    }
  });

  // Count by browser
  const byBrowser = {};
  sessionStarts.forEach(event => {
    const browser = event.browser || 'Unknown';
    if (!byBrowser[browser]) {
      byBrowser[browser] = { dark: 0, light: 0, total: 0 };
    }
    byBrowser[browser].total++;
    if (event.isDark) {
      byBrowser[browser].dark++;
    } else {
      byBrowser[browser].light++;
    }
  });

  // Daily trends (last 7 days)
  const dailyTrends = {};
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  
  sessionStarts
    .filter(e => new Date(e.timestamp) >= last7Days)
    .forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!dailyTrends[date]) {
        dailyTrends[date] = { dark: 0, light: 0, total: 0 };
      }
      dailyTrends[date].total++;
      if (event.isDark) {
        dailyTrends[date].dark++;
      } else {
        dailyTrends[date].light++;
      }
    });

  return {
    period: options.period,
    totalSessions,
    darkSessions,
    lightSessions,
    adoptionRate,
    themeChanges: themeChanges.length,
    byPlatform,
    byBrowser,
    dailyTrends,
  };
}

/**
 * Format percentage
 * @param {number} value - Value between 0 and 1
 * @returns {string} Formatted percentage
 */
function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Print header
 */
function printHeader() {
  console.log('\n' + colors.bright + '╔════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.bright + '║         Dark Mode Adoption Monitoring Report              ║' + colors.reset);
  console.log(colors.bright + '╚════════════════════════════════════════════════════════════╝' + colors.reset);
  console.log();
  console.log(`${colors.cyan}📅 Analysis Period:${colors.reset} Last ${options.period} days`);
  console.log(`${colors.cyan}📊 Report Generated:${colors.reset} ${new Date().toLocaleString()}`);
  console.log();
}

/**
 * Print overall metrics
 * @param {Object} metrics - Calculated metrics
 */
function printOverallMetrics(metrics) {
  console.log(colors.bright + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.bright + 'Overall Metrics' + colors.reset);
  console.log(colors.bright + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log(`Total Sessions:           ${metrics.totalSessions}`);
  console.log(`Dark Mode Sessions:       ${metrics.darkSessions}`);
  console.log(`Light Mode Sessions:      ${metrics.lightSessions}`);
  console.log(`Theme Changes:            ${metrics.themeChanges}`);
  console.log();
  
  const adoptionPercent = formatPercent(metrics.adoptionRate);
  const adoptionColor = metrics.adoptionRate >= options.threshold ? colors.green : colors.yellow;
  console.log(`${colors.bright}Dark Mode Adoption Rate:  ${adoptionColor}${adoptionPercent}${colors.reset}`);
  
  if (metrics.adoptionRate >= options.threshold) {
    console.log(`${colors.green}✅ Adoption Rate MEETS Threshold: ${formatPercent(options.threshold)}${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Adoption Rate BELOW Threshold: ${formatPercent(options.threshold)}${colors.reset}`);
  }
  console.log();
}

/**
 * Print platform breakdown
 * @param {Object} byPlatform - Platform metrics
 */
function printPlatformBreakdown(byPlatform) {
  console.log(colors.bright + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.bright + 'By Platform' + colors.reset);
  console.log(colors.bright + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log();

  Object.entries(byPlatform)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([platform, stats]) => {
      const rate = stats.total > 0 ? stats.dark / stats.total : 0;
      console.log(`${colors.cyan}${platform}:${colors.reset}`);
      console.log(`  Sessions:     ${stats.total}`);
      console.log(`  Dark:         ${stats.dark}`);
      console.log(`  Light:        ${stats.light}`);
      console.log(`  Adoption:     ${formatPercent(rate)}`);
      console.log();
    });
}

/**
 * Print browser breakdown
 * @param {Object} byBrowser - Browser metrics
 */
function printBrowserBreakdown(byBrowser) {
  console.log(colors.bright + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.bright + 'By Browser' + colors.reset);
  console.log(colors.bright + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log();

  Object.entries(byBrowser)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([browser, stats]) => {
      const rate = stats.total > 0 ? stats.dark / stats.total : 0;
      console.log(`${colors.cyan}${browser}:${colors.reset}`);
      console.log(`  Sessions:     ${stats.total}`);
      console.log(`  Dark:         ${stats.dark}`);
      console.log(`  Light:        ${stats.light}`);
      console.log(`  Adoption:     ${formatPercent(rate)}`);
      console.log();
    });
}

/**
 * Print daily trends
 * @param {Object} dailyTrends - Daily trend data
 */
function printDailyTrends(dailyTrends) {
  console.log(colors.bright + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.bright + 'Daily Trends (Last 7 Days)' + colors.reset);
  console.log(colors.bright + '═══════════════════════════════════════════════════════════' + colors.reset);

  const sortedDates = Object.keys(dailyTrends).sort();
  
  if (sortedDates.length === 0) {
    console.log('No data available for the last 7 days.');
    console.log();
    return;
  }

  sortedDates.forEach(date => {
    const stats = dailyTrends[date];
    const rate = stats.total > 0 ? stats.dark / stats.total : 0;
    const barLength = Math.round(rate * 40);
    const bar = '█'.repeat(barLength) + '░'.repeat(40 - barLength);
    
    console.log(`${date}  ${bar}  ${formatPercent(rate)} (${stats.dark}/${stats.total})`);
  });
  
  console.log();
}

/**
 * Export metrics to file
 * @param {Object} metrics - Calculated metrics
 */
function exportMetrics(metrics) {
  const exportDir = path.join(__dirname, '..', '.dark-mode-metrics');
  const exportFile = path.join(exportDir, `adoption-report-${Date.now()}.json`);

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  fs.writeFileSync(exportFile, JSON.stringify(metrics, null, 2));
  console.log(`${colors.green}✅ Metrics exported to: ${exportFile}${colors.reset}`);
  console.log();
}

/**
 * Main monitoring function
 */
function monitor() {
  const events = loadMetrics();

  if (events.length === 0) {
    console.log(`${colors.yellow}⚠️  No metrics data found.${colors.reset}`);
    console.log('Make sure dark mode tracking is initialized in your app.');
    console.log('Data will be collected in localStorage and can be exported.');
    return;
  }

  const metrics = calculateMetrics(events, options);

  printHeader();
  printOverallMetrics(metrics);
  printPlatformBreakdown(metrics.byPlatform);
  printBrowserBreakdown(metrics.byBrowser);
  printDailyTrends(metrics.dailyTrends);

  if (options.export) {
    exportMetrics(metrics);
  }

  // Alert if below threshold
  if (metrics.adoptionRate < options.threshold) {
    console.log(colors.bright + '═══════════════════════════════════════════════════════════' + colors.reset);
    console.log(colors.bright + 'Recommendations' + colors.reset);
    console.log(colors.bright + '═══════════════════════════════════════════════════════════' + colors.reset);
    console.log(`${colors.yellow}⚠️  Dark mode adoption is below target (${formatPercent(options.threshold)})${colors.reset}`);
    console.log();
    console.log('Consider:');
    console.log('  • Making dark mode toggle more visible');
    console.log('  • Adding dark mode onboarding/tutorial');
    console.log('  • Promoting dark mode benefits (battery, eye strain)');
    console.log('  • A/B testing different toggle placements');
    console.log('  • Analyzing user feedback on dark mode');
    console.log();
  }
}

/**
 * Watch mode - continuous monitoring
 */
function watchMode() {
  console.log(`${colors.cyan}🔄 Watch mode enabled - monitoring every 5 minutes${colors.reset}`);
  console.log(`${colors.cyan}Press Ctrl+C to stop${colors.reset}`);
  console.log();

  monitor();

  setInterval(() => {
    console.clear();
    monitor();
  }, 5 * 60 * 1000); // 5 minutes
}

// Run
if (options.watch) {
  watchMode();
} else {
  monitor();
}
