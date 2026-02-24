#!/usr/bin/env node

/**
 * Error Rate Tracking Script
 * 
 * Monitors and analyzes error rates from the ErrorLog collection
 * 
 * Requirements:
 * - Task 10.4.3: Track error rates
 * - FR-ERR-3: Log error details
 * - NFR-REL-1: Error recovery success rate 95%+
 * 
 * Features:
 * - Real-time error rate calculation
 * - Historical trend analysis
 * - Error rate by component, environment, level
 * - Alerting for high error rates
 * - Export to JSON/CSV
 * 
 * Usage:
 *   node scripts/track-error-rates.js [options]
 * 
 * Options:
 *   --period <hours>     Time period to analyze (default: 24)
 *   --environment <env>  Filter by environment (production, staging, development)
 *   --component <name>   Filter by component name
 *   --level <level>      Filter by error level (error, warning, info)
 *   --threshold <rate>   Alert threshold (errors per hour, default: 10)
 *   --export <format>    Export format (json, csv, default: console)
 *   --watch              Watch mode (continuous monitoring)
 *   --interval <seconds> Watch interval in seconds (default: 60)
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import ErrorLog model
const ErrorLog = require('../src/models/ErrorLog');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  period: 24, // hours
  environment: null,
  component: null,
  level: null,
  threshold: 10, // errors per hour
  export: 'console',
  watch: false,
  interval: 60, // seconds
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--period':
      options.period = parseInt(args[++i]);
      break;
    case '--environment':
      options.environment = args[++i];
      break;
    case '--component':
      options.component = args[++i];
      break;
    case '--level':
      options.level = args[++i];
      break;
    case '--threshold':
      options.threshold = parseFloat(args[++i]);
      break;
    case '--export':
      options.export = args[++i];
      break;
    case '--watch':
      options.watch = true;
      break;
    case '--interval':
      options.interval = parseInt(args[++i]);
      break;
    case '--help':
      console.log(`
Error Rate Tracking Script

Usage:
  node scripts/track-error-rates.js [options]

Options:
  --period <hours>     Time period to analyze (default: 24)
  --environment <env>  Filter by environment (production, staging, development)
  --component <name>   Filter by component name
  --level <level>      Filter by error level (error, warning, info)
  --threshold <rate>   Alert threshold (errors per hour, default: 10)
  --export <format>    Export format (json, csv, default: console)
  --watch              Watch mode (continuous monitoring)
  --interval <seconds> Watch interval in seconds (default: 60)
  --help               Show this help message

Examples:
  # Track errors in last 24 hours
  node scripts/track-error-rates.js

  # Track production errors in last 48 hours
  node scripts/track-error-rates.js --period 48 --environment production

  # Watch mode with 30 second interval
  node scripts/track-error-rates.js --watch --interval 30

  # Export to JSON
  node scripts/track-error-rates.js --export json > error-rates.json

  # Track specific component with alert threshold
  node scripts/track-error-rates.js --component ProfilePage --threshold 5
      `);
      process.exit(0);
  }
}

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

/**
 * Calculate error rates
 */
async function calculateErrorRates() {
  const startDate = new Date(Date.now() - options.period * 60 * 60 * 1000);
  const endDate = new Date();

  // Build filter
  const filter = {
    createdAt: { $gte: startDate, $lte: endDate },
  };
  if (options.environment) filter.environment = options.environment;
  if (options.component) filter.component = options.component;
  if (options.level) filter.level = options.level;

  // Get total errors
  const totalErrors = await ErrorLog.countDocuments(filter);
  const totalOccurrences = await ErrorLog.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: '$count' } } },
  ]);

  // Calculate error rate (errors per hour)
  const errorRate = totalErrors / options.period;
  const occurrenceRate = (totalOccurrences[0]?.total || 0) / options.period;

  // Get errors by level
  const errorsByLevel = await ErrorLog.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 },
        occurrences: { $sum: '$count' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Get errors by component
  const errorsByComponent = await ErrorLog.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$component',
        count: { $sum: 1 },
        occurrences: { $sum: '$count' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Get errors by environment
  const errorsByEnvironment = await ErrorLog.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$environment',
        count: { $sum: 1 },
        occurrences: { $sum: '$count' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Get hourly error distribution
  const hourlyDistribution = await ErrorLog.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d %H:00',
            date: '$createdAt',
          },
        },
        count: { $sum: 1 },
        occurrences: { $sum: '$count' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Get top error messages
  const topErrors = await ErrorLog.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          message: '$message',
          component: '$component',
        },
        count: { $sum: 1 },
        occurrences: { $sum: '$count' },
        lastOccurrence: { $max: '$lastOccurrence' },
      },
    },
    { $sort: { occurrences: -1 } },
    { $limit: 10 },
  ]);

  // Get error recovery rate (resolved vs total)
  const resolvedErrors = await ErrorLog.countDocuments({
    ...filter,
    status: 'resolved',
  });
  const recoveryRate = totalErrors > 0 ? (resolvedErrors / totalErrors) * 100 : 0;

  // Check if error rate exceeds threshold
  const alert = errorRate > options.threshold;

  return {
    period: {
      hours: options.period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    filters: {
      environment: options.environment || 'all',
      component: options.component || 'all',
      level: options.level || 'all',
    },
    summary: {
      totalErrors,
      totalOccurrences: totalOccurrences[0]?.total || 0,
      errorRate: parseFloat(errorRate.toFixed(2)),
      occurrenceRate: parseFloat(occurrenceRate.toFixed(2)),
      recoveryRate: parseFloat(recoveryRate.toFixed(2)),
      alert,
      threshold: options.threshold,
    },
    breakdown: {
      byLevel: errorsByLevel,
      byComponent: errorsByComponent,
      byEnvironment: errorsByEnvironment,
    },
    hourlyDistribution,
    topErrors,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format output for console
 */
function formatConsoleOutput(data) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         Error Rate Tracking Report                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Period
  console.log('Period:');
  console.log(`  ${data.period.hours} hours (${data.period.startDate} to ${data.period.endDate})\n`);

  // Filters
  console.log('Filters:');
  console.log(`  Environment: ${data.filters.environment}`);
  console.log(`  Component: ${data.filters.component}`);
  console.log(`  Level: ${data.filters.level}\n`);

  // Summary
  console.log('Summary:');
  console.log(`  Total Errors: ${data.summary.totalErrors}`);
  console.log(`  Total Occurrences: ${data.summary.totalOccurrences}`);
  console.log(`  Error Rate: ${data.summary.errorRate} errors/hour`);
  console.log(`  Occurrence Rate: ${data.summary.occurrenceRate} occurrences/hour`);
  console.log(`  Recovery Rate: ${data.summary.recoveryRate}%`);
  
  if (data.summary.alert) {
    console.log(`  ⚠️  ALERT: Error rate (${data.summary.errorRate}) exceeds threshold (${data.summary.threshold})`);
  } else {
    console.log(`  ✓ Error rate is within threshold (${data.summary.threshold})`);
  }
  console.log();

  // Errors by level
  if (data.breakdown.byLevel.length > 0) {
    console.log('Errors by Level:');
    data.breakdown.byLevel.forEach(item => {
      const bar = '█'.repeat(Math.min(50, Math.ceil(item.count / 2)));
      console.log(`  ${item._id.padEnd(10)} ${bar} ${item.count} (${item.occurrences} occurrences)`);
    });
    console.log();
  }

  // Errors by component
  if (data.breakdown.byComponent.length > 0) {
    console.log('Top 10 Components by Error Count:');
    data.breakdown.byComponent.forEach((item, index) => {
      const bar = '█'.repeat(Math.min(40, Math.ceil(item.count / 2)));
      console.log(`  ${(index + 1).toString().padStart(2)}. ${item._id.padEnd(30)} ${bar} ${item.count}`);
    });
    console.log();
  }

  // Errors by environment
  if (data.breakdown.byEnvironment.length > 0) {
    console.log('Errors by Environment:');
    data.breakdown.byEnvironment.forEach(item => {
      const bar = '█'.repeat(Math.min(50, Math.ceil(item.count / 2)));
      console.log(`  ${item._id.padEnd(15)} ${bar} ${item.count}`);
    });
    console.log();
  }

  // Hourly distribution
  if (data.hourlyDistribution.length > 0) {
    console.log('Hourly Distribution:');
    const maxCount = Math.max(...data.hourlyDistribution.map(h => h.count));
    data.hourlyDistribution.forEach(item => {
      const bar = '█'.repeat(Math.min(50, Math.ceil((item.count / maxCount) * 50)));
      console.log(`  ${item._id} ${bar} ${item.count}`);
    });
    console.log();
  }

  // Top errors
  if (data.topErrors.length > 0) {
    console.log('Top 10 Errors:');
    data.topErrors.forEach((item, index) => {
      console.log(`  ${(index + 1).toString().padStart(2)}. [${item._id.component}] ${item._id.message.substring(0, 60)}...`);
      console.log(`      Count: ${item.count}, Occurrences: ${item.occurrences}, Last: ${new Date(item.lastOccurrence).toLocaleString()}`);
    });
    console.log();
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Report generated at: ${new Date(data.timestamp).toLocaleString()}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

/**
 * Format output for JSON
 */
function formatJSONOutput(data) {
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Format output for CSV
 */
function formatCSVOutput(data) {
  // CSV header
  console.log('Timestamp,Period (hours),Total Errors,Total Occurrences,Error Rate,Occurrence Rate,Recovery Rate,Alert');
  
  // CSV data
  console.log([
    data.timestamp,
    data.period.hours,
    data.summary.totalErrors,
    data.summary.totalOccurrences,
    data.summary.errorRate,
    data.summary.occurrenceRate,
    data.summary.recoveryRate,
    data.summary.alert,
  ].join(','));
}

/**
 * Main function
 */
async function main() {
  await connectDB();

  if (options.watch) {
    console.log(`\n🔍 Starting error rate monitoring (interval: ${options.interval}s)...\n`);
    console.log('Press Ctrl+C to stop\n');

    // Run immediately
    const data = await calculateErrorRates();
    if (options.export === 'json') {
      formatJSONOutput(data);
    } else if (options.export === 'csv') {
      formatCSVOutput(data);
    } else {
      formatConsoleOutput(data);
    }

    // Then run at intervals
    setInterval(async () => {
      const data = await calculateErrorRates();
      if (options.export === 'json') {
        formatJSONOutput(data);
      } else if (options.export === 'csv') {
        formatCSVOutput(data);
      } else {
        formatConsoleOutput(data);
      }
    }, options.interval * 1000);
  } else {
    // Run once
    const data = await calculateErrorRates();
    
    if (options.export === 'json') {
      formatJSONOutput(data);
    } else if (options.export === 'csv') {
      formatCSVOutput(data);
    } else {
      formatConsoleOutput(data);
    }

    await mongoose.connection.close();
    process.exit(0);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', async () => {
  console.log('\n\n👋 Stopping error rate monitoring...\n');
  await mongoose.connection.close();
  process.exit(0);
});

// Run
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
