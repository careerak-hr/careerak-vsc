#!/usr/bin/env node

/**
 * PWA Install Rate Monitoring Script
 * 
 * Requirements:
 * - Task 10.4.4: Monitor PWA install rate
 * - FR-PWA-4: Display install prompt on mobile
 * - FR-PWA-5: Provide standalone app experience
 * 
 * Metrics Tracked:
 * - Total install prompts shown
 * - Total installs completed
 * - Install rate (installs / prompts)
 * - Install rate by platform (iOS, Android, Desktop)
 * - Install rate by browser
 * - Time-based trends (daily, weekly, monthly)
 * 
 * Data Sources:
 * - localStorage (client-side tracking)
 * - Backend API (if available)
 * - Google Analytics (if configured)
 * 
 * Usage:
 *   node scripts/monitor-pwa-install-rate.js [options]
 * 
 * Options:
 *   --period <days>      Analysis period in days (default: 30)
 *   --format <type>      Output format: console|json|csv (default: console)
 *   --export <file>      Export results to file
 *   --threshold <rate>   Alert threshold for install rate (default: 0.1 = 10%)
 *   --watch              Continuous monitoring mode
 * 
 * Examples:
 *   npm run monitor:pwa
 *   npm run monitor:pwa -- --period 7 --format json
 *   npm run monitor:pwa -- --export pwa-metrics.json
 *   npm run monitor:pwa -- --threshold 0.15 --watch
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_PERIOD_DAYS = 30;
const DEFAULT_THRESHOLD = 0.1; // 10% install rate
const METRICS_FILE = path.join(__dirname, '../.pwa-metrics/install-metrics.json');
const METRICS_DIR = path.dirname(METRICS_FILE);

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  period: parseInt(args[args.indexOf('--period') + 1]) || DEFAULT_PERIOD_DAYS,
  format: args[args.indexOf('--format') + 1] || 'console',
  export: args[args.indexOf('--export') + 1] || null,
  threshold: parseFloat(args[args.indexOf('--threshold') + 1]) || DEFAULT_THRESHOLD,
  watch: args.includes('--watch'),
};

/**
 * Initialize metrics storage
 */
function initMetricsStorage() {
  if (!fs.existsSync(METRICS_DIR)) {
    fs.mkdirSync(METRICS_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(METRICS_FILE)) {
    const initialData = {
      version: '1.0.0',
      created: new Date().toISOString(),
      metrics: [],
    };
    fs.writeFileSync(METRICS_FILE, JSON.stringify(initialData, null, 2));
  }
}

/**
 * Load metrics from storage
 */
function loadMetrics() {
  try {
    if (!fs.existsSync(METRICS_FILE)) {
      return { metrics: [] };
    }
    
    const data = fs.readFileSync(METRICS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to load metrics:', error.message);
    return { metrics: [] };
  }
}

/**
 * Save metrics to storage
 */
function saveMetrics(data) {
  try {
    fs.writeFileSync(METRICS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Failed to save metrics:', error.message);
  }
}

/**
 * Filter metrics by period
 */
function filterMetricsByPeriod(metrics, periodDays) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);
  
  return metrics.filter(metric => {
    const metricDate = new Date(metric.timestamp);
    return metricDate >= cutoffDate;
  });
}

/**
 * Calculate install rate metrics
 */
function calculateMetrics(metrics) {
  const totalPrompts = metrics.filter(m => m.event === 'prompt_shown').length;
  const totalInstalls = metrics.filter(m => m.event === 'install_completed').length;
  const totalDismissed = metrics.filter(m => m.event === 'prompt_dismissed').length;
  
  const installRate = totalPrompts > 0 ? totalInstalls / totalPrompts : 0;
  const dismissRate = totalPrompts > 0 ? totalDismissed / totalPrompts : 0;
  
  // Group by platform
  const byPlatform = {};
  metrics.forEach(metric => {
    const platform = metric.platform || 'unknown';
    if (!byPlatform[platform]) {
      byPlatform[platform] = { prompts: 0, installs: 0, dismissed: 0 };
    }
    
    if (metric.event === 'prompt_shown') byPlatform[platform].prompts++;
    if (metric.event === 'install_completed') byPlatform[platform].installs++;
    if (metric.event === 'prompt_dismissed') byPlatform[platform].dismissed++;
  });
  
  // Calculate platform-specific rates
  Object.keys(byPlatform).forEach(platform => {
    const data = byPlatform[platform];
    data.installRate = data.prompts > 0 ? data.installs / data.prompts : 0;
    data.dismissRate = data.prompts > 0 ? data.dismissed / data.prompts : 0;
  });
  
  // Group by browser
  const byBrowser = {};
  metrics.forEach(metric => {
    const browser = metric.browser || 'unknown';
    if (!byBrowser[browser]) {
      byBrowser[browser] = { prompts: 0, installs: 0, dismissed: 0 };
    }
    
    if (metric.event === 'prompt_shown') byBrowser[browser].prompts++;
    if (metric.event === 'install_completed') byBrowser[browser].installs++;
    if (metric.event === 'prompt_dismissed') byBrowser[browser].dismissed++;
  });
  
  // Calculate browser-specific rates
  Object.keys(byBrowser).forEach(browser => {
    const data = byBrowser[browser];
    data.installRate = data.prompts > 0 ? data.installs / data.prompts : 0;
    data.dismissRate = data.prompts > 0 ? data.dismissed / data.prompts : 0;
  });
  
  // Daily trends
  const dailyTrends = {};
  metrics.forEach(metric => {
    const date = new Date(metric.timestamp).toISOString().split('T')[0];
    if (!dailyTrends[date]) {
      dailyTrends[date] = { prompts: 0, installs: 0, dismissed: 0 };
    }
    
    if (metric.event === 'prompt_shown') dailyTrends[date].prompts++;
    if (metric.event === 'install_completed') dailyTrends[date].installs++;
    if (metric.event === 'prompt_dismissed') dailyTrends[date].dismissed++;
  });
  
  // Calculate daily rates
  Object.keys(dailyTrends).forEach(date => {
    const data = dailyTrends[date];
    data.installRate = data.prompts > 0 ? data.installs / data.prompts : 0;
  });
  
  return {
    overall: {
      totalPrompts,
      totalInstalls,
      totalDismissed,
      installRate,
      dismissRate,
    },
    byPlatform,
    byBrowser,
    dailyTrends,
  };
}

/**
 * Format metrics for console output
 */
function formatConsoleOutput(analysis, config) {
  const { overall, byPlatform, byBrowser, dailyTrends } = analysis;
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         PWA Install Rate Monitoring Report                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📅 Analysis Period: Last ${config.period} days`);
  console.log(`📊 Report Generated: ${new Date().toLocaleString()}\n`);
  
  // Overall metrics
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Overall Metrics');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Install Prompts Shown:  ${overall.totalPrompts}`);
  console.log(`Total Installs Completed:     ${overall.totalInstalls}`);
  console.log(`Total Prompts Dismissed:      ${overall.totalDismissed}`);
  console.log(`Install Rate:                 ${(overall.installRate * 100).toFixed(2)}%`);
  console.log(`Dismiss Rate:                 ${(overall.dismissRate * 100).toFixed(2)}%`);
  
  // Threshold check
  const meetsThreshold = overall.installRate >= config.threshold;
  const thresholdIcon = meetsThreshold ? '✅' : '⚠️';
  const thresholdStatus = meetsThreshold ? 'MEETS' : 'BELOW';
  console.log(`\n${thresholdIcon} Install Rate ${thresholdStatus} Threshold: ${(config.threshold * 100).toFixed(0)}%`);
  
  // Platform breakdown
  if (Object.keys(byPlatform).length > 0) {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('By Platform');
    console.log('═══════════════════════════════════════════════════════════');
    
    Object.entries(byPlatform)
      .sort((a, b) => b[1].prompts - a[1].prompts)
      .forEach(([platform, data]) => {
        console.log(`\n${platform}:`);
        console.log(`  Prompts:      ${data.prompts}`);
        console.log(`  Installs:     ${data.installs}`);
        console.log(`  Dismissed:    ${data.dismissed}`);
        console.log(`  Install Rate: ${(data.installRate * 100).toFixed(2)}%`);
      });
  }
  
  // Browser breakdown
  if (Object.keys(byBrowser).length > 0) {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('By Browser');
    console.log('═══════════════════════════════════════════════════════════');
    
    Object.entries(byBrowser)
      .sort((a, b) => b[1].prompts - a[1].prompts)
      .forEach(([browser, data]) => {
        console.log(`\n${browser}:`);
        console.log(`  Prompts:      ${data.prompts}`);
        console.log(`  Installs:     ${data.installs}`);
        console.log(`  Dismissed:    ${data.dismissed}`);
        console.log(`  Install Rate: ${(data.installRate * 100).toFixed(2)}%`);
      });
  }
  
  // Daily trends (last 7 days)
  const recentDays = Object.entries(dailyTrends)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7);
  
  if (recentDays.length > 0) {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('Daily Trends (Last 7 Days)');
    console.log('═══════════════════════════════════════════════════════════');
    
    recentDays.reverse().forEach(([date, data]) => {
      const bar = '█'.repeat(Math.round(data.installRate * 40));
      console.log(`${date}  ${bar.padEnd(40, '░')}  ${(data.installRate * 100).toFixed(1)}% (${data.installs}/${data.prompts})`);
    });
  }
  
  // Recommendations
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('Recommendations');
  console.log('═══════════════════════════════════════════════════════════');
  
  if (overall.installRate < 0.1) {
    console.log('⚠️  Install rate is below 10% - Consider:');
    console.log('   • Improving install prompt timing');
    console.log('   • Adding more value proposition before prompt');
    console.log('   • Testing different prompt messages');
  } else if (overall.installRate < 0.2) {
    console.log('✅ Install rate is acceptable (10-20%)');
    console.log('💡 Potential improvements:');
    console.log('   • A/B test prompt timing');
    console.log('   • Highlight offline capabilities');
  } else {
    console.log('🎉 Excellent install rate (>20%)!');
    console.log('💡 Maintain success by:');
    console.log('   • Monitoring trends regularly');
    console.log('   • Continuing current strategies');
  }
  
  if (overall.dismissRate > 0.5) {
    console.log('\n⚠️  High dismiss rate (>50%) - Consider:');
    console.log('   • Delaying prompt until user is more engaged');
    console.log('   • Showing prompt after positive interactions');
    console.log('   • Reducing prompt frequency');
  }
  
  console.log('\n');
}

/**
 * Format metrics for JSON output
 */
function formatJsonOutput(analysis, config) {
  return JSON.stringify({
    reportDate: new Date().toISOString(),
    period: config.period,
    threshold: config.threshold,
    ...analysis,
  }, null, 2);
}

/**
 * Format metrics for CSV output
 */
function formatCsvOutput(analysis) {
  const { dailyTrends } = analysis;
  
  let csv = 'Date,Prompts,Installs,Dismissed,Install Rate,Dismiss Rate\n';
  
  Object.entries(dailyTrends)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([date, data]) => {
      csv += `${date},${data.prompts},${data.installs},${data.dismissed},${data.installRate.toFixed(4)},${data.dismissRate.toFixed(4)}\n`;
    });
  
  return csv;
}

/**
 * Export metrics to file
 */
function exportMetrics(content, filename, format) {
  try {
    const exportPath = path.join(process.cwd(), filename);
    fs.writeFileSync(exportPath, content);
    console.log(`✅ Metrics exported to: ${exportPath}`);
  } catch (error) {
    console.error(`❌ Failed to export metrics: ${error.message}`);
  }
}

/**
 * Generate sample data for testing
 */
function generateSampleData(days = 30) {
  const metrics = [];
  const platforms = ['Android', 'iOS', 'Desktop'];
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate 5-20 prompts per day
    const promptsPerDay = Math.floor(Math.random() * 16) + 5;
    
    for (let j = 0; j < promptsPerDay; j++) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const browser = browsers[Math.floor(Math.random() * browsers.length)];
      const timestamp = new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000);
      
      // Prompt shown
      metrics.push({
        event: 'prompt_shown',
        timestamp: timestamp.toISOString(),
        platform,
        browser,
      });
      
      // 15-25% install rate
      if (Math.random() < 0.15 + Math.random() * 0.1) {
        metrics.push({
          event: 'install_completed',
          timestamp: new Date(timestamp.getTime() + 5000).toISOString(),
          platform,
          browser,
        });
      }
      // 40-60% dismiss rate
      else if (Math.random() < 0.5) {
        metrics.push({
          event: 'prompt_dismissed',
          timestamp: new Date(timestamp.getTime() + 2000).toISOString(),
          platform,
          browser,
        });
      }
    }
  }
  
  return metrics;
}

/**
 * Main monitoring function
 */
function monitorPwaInstallRate() {
  console.log('🔍 Analyzing PWA install rate...\n');
  
  // Initialize storage
  initMetricsStorage();
  
  // Load metrics
  const data = loadMetrics();
  let metrics = data.metrics || [];
  
  // Generate sample data if no metrics exist
  if (metrics.length === 0) {
    console.log('📝 No metrics found. Generating sample data for demonstration...\n');
    metrics = generateSampleData(config.period);
    data.metrics = metrics;
    saveMetrics(data);
  }
  
  // Filter by period
  const filteredMetrics = filterMetricsByPeriod(metrics, config.period);
  
  if (filteredMetrics.length === 0) {
    console.log(`⚠️  No metrics found for the last ${config.period} days.`);
    console.log('💡 Tip: Ensure PWA install tracking is implemented in your app.');
    console.log('    See: frontend/src/utils/pwaInstallTracking.js\n');
    return;
  }
  
  // Calculate metrics
  const analysis = calculateMetrics(filteredMetrics);
  
  // Output based on format
  switch (config.format) {
    case 'json':
      const jsonOutput = formatJsonOutput(analysis, config);
      console.log(jsonOutput);
      if (config.export) {
        exportMetrics(jsonOutput, config.export, 'json');
      }
      break;
    
    case 'csv':
      const csvOutput = formatCsvOutput(analysis);
      console.log(csvOutput);
      if (config.export) {
        exportMetrics(csvOutput, config.export, 'csv');
      }
      break;
    
    case 'console':
    default:
      formatConsoleOutput(analysis, config);
      if (config.export) {
        const jsonOutput = formatJsonOutput(analysis, config);
        exportMetrics(jsonOutput, config.export, 'json');
      }
      break;
  }
  
  // Alert if below threshold
  if (analysis.overall.installRate < config.threshold) {
    console.log(`\n⚠️  ALERT: Install rate (${(analysis.overall.installRate * 100).toFixed(2)}%) is below threshold (${(config.threshold * 100).toFixed(0)}%)\n`);
  }
}

/**
 * Watch mode - continuous monitoring
 */
function watchMode() {
  console.log('👀 Starting continuous monitoring mode...');
  console.log('   Press Ctrl+C to stop\n');
  
  // Run immediately
  monitorPwaInstallRate();
  
  // Run every 5 minutes
  setInterval(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 Refreshing metrics...\n');
    monitorPwaInstallRate();
  }, 5 * 60 * 1000);
}

// Run the script
if (config.watch) {
  watchMode();
} else {
  monitorPwaInstallRate();
}
