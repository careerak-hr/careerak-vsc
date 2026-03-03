#!/usr/bin/env node

/**
 * Advanced Search & Filter System - Test Runner
 * 
 * Runs all tests for the advanced search system:
 * - Unit tests
 * - Property-based tests
 * - Integration tests
 * - Performance tests
 * 
 * Usage:
 *   node tests/run-advanced-search-tests.js [options]
 * 
 * Options:
 *   --unit          Run only unit tests
 *   --property      Run only property-based tests
 *   --integration   Run only integration tests
 *   --performance   Run only performance tests
 *   --all           Run all tests (default)
 *   --verbose       Show detailed output
 */

const { spawn } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  unit: args.includes('--unit'),
  property: args.includes('--property'),
  integration: args.includes('--integration'),
  performance: args.includes('--performance'),
  all: args.includes('--all') || args.length === 0,
  verbose: args.includes('--verbose')
};

// If --all or no specific option, run all tests
if (options.all) {
  options.unit = true;
  options.property = true;
  options.integration = true;
  options.performance = true;
}

// Test files
const testFiles = {
  unit: [
    'advanced-search-filter.unit.test.js'
  ],
  property: [
    'search-bilingual.property.test.js',
    'saved-search-round-trip.property.test.js',
    'alert-deduplication.property.test.js',
    'alert-toggle-behavior.property.test.js'
  ],
  integration: [
    'advanced-search-integration.test.js'
  ],
  performance: [
    'advanced-search-performance.test.js'
  ]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTests(category, files) {
  return new Promise((resolve, reject) => {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`Running ${category.toUpperCase()} Tests`, 'bright');
    log('='.repeat(60), 'cyan');

    const testPattern = files.join('|');
    const jestArgs = [
      '--testPathPattern',
      testPattern,
      '--runInBand',
      '--forceExit'
    ];

    if (options.verbose) {
      jestArgs.push('--verbose');
    }

    const jest = spawn('npx', ['jest', ...jestArgs], {
      stdio: 'inherit',
      shell: true
    });

    jest.on('close', (code) => {
      if (code === 0) {
        log(`\n✅ ${category.toUpperCase()} tests passed!`, 'green');
        resolve();
      } else {
        log(`\n❌ ${category.toUpperCase()} tests failed!`, 'red');
        reject(new Error(`${category} tests failed with code ${code}`));
      }
    });

    jest.on('error', (error) => {
      log(`\n❌ Error running ${category} tests: ${error.message}`, 'red');
      reject(error);
    });
  });
}

async function main() {
  const startTime = Date.now();
  
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║     Advanced Search & Filter System - Test Suite          ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝', 'bright');

  const results = {
    passed: [],
    failed: []
  };

  try {
    // Run unit tests
    if (options.unit && testFiles.unit.length > 0) {
      try {
        await runTests('unit', testFiles.unit);
        results.passed.push('Unit');
      } catch (error) {
        results.failed.push('Unit');
      }
    }

    // Run property-based tests
    if (options.property && testFiles.property.length > 0) {
      try {
        await runTests('property', testFiles.property);
        results.passed.push('Property');
      } catch (error) {
        results.failed.push('Property');
      }
    }

    // Run integration tests
    if (options.integration && testFiles.integration.length > 0) {
      try {
        await runTests('integration', testFiles.integration);
        results.passed.push('Integration');
      } catch (error) {
        results.failed.push('Integration');
      }
    }

    // Run performance tests
    if (options.performance && testFiles.performance.length > 0) {
      try {
        await runTests('performance', testFiles.performance);
        results.passed.push('Performance');
      } catch (error) {
        results.failed.push('Performance');
      }
    }

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log('\n' + '='.repeat(60), 'cyan');
    log('Test Summary', 'bright');
    log('='.repeat(60), 'cyan');
    
    if (results.passed.length > 0) {
      log(`✅ Passed: ${results.passed.join(', ')}`, 'green');
    }
    
    if (results.failed.length > 0) {
      log(`❌ Failed: ${results.failed.join(', ')}`, 'red');
    }
    
    log(`\n⏱️  Total time: ${duration}s`, 'cyan');
    log('='.repeat(60), 'cyan');

    if (results.failed.length > 0) {
      process.exit(1);
    } else {
      log('\n🎉 All tests passed successfully!', 'green');
      process.exit(0);
    }

  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run
main();
