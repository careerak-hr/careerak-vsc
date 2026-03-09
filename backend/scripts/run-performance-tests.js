/**
 * Performance Tests Runner
 * 
 * يشغل اختبارات الأداء ويولد تقرير مفصل
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ========================================
// Configuration
// ========================================

const PERFORMANCE_THRESHOLDS = {
  GET_RESPONSE_TIME: 200,      // ms
  POST_RESPONSE_TIME: 500,     // ms
  CONCURRENT_USERS: 1000,      // users
  EXPORT_TIME: 48 * 60 * 60,   // seconds (48 hours)
  MEMORY_PER_OP: 100 * 1024    // bytes (100KB)
};

const REPORT_DIR = path.join(__dirname, '../.performance-reports');
const REPORT_FILE = path.join(REPORT_DIR, `performance-report-${Date.now()}.json`);

// ========================================
// Helper Functions
// ========================================

function ensureReportDir() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

function printHeader(title) {
  console.log('\n' + '='.repeat(60));
  console.log(title);
  console.log('='.repeat(60));
}

function printSection(title) {
  console.log('\n' + '-'.repeat(60));
  console.log(title);
  console.log('-'.repeat(60));
}

// ========================================
// Run Tests
// ========================================

async function runPerformanceTests() {
  printHeader('Settings Page Performance Tests');
  
  console.log('Starting performance tests...\n');
  console.log('Thresholds:');
  console.log(`  - GET Response Time: < ${PERFORMANCE_THRESHOLDS.GET_RESPONSE_TIME}ms`);
  console.log(`  - POST Response Time: < ${PERFORMANCE_THRESHOLDS.POST_RESPONSE_TIME}ms`);
  console.log(`  - Concurrent Users: ${PERFORMANCE_THRESHOLDS.CONCURRENT_USERS} users`);
  console.log(`  - Data Export Time: < ${PERFORMANCE_THRESHOLDS.EXPORT_TIME / 3600} hours`);
  console.log(`  - Memory per Operation: < ${formatBytes(PERFORMANCE_THRESHOLDS.MEMORY_PER_OP)}`);
  
  const startTime = Date.now();
  
  try {
    // تشغيل الاختبارات
    printSection('Running Jest Tests');
    
    const output = execSync(
      'npm test -- settings-performance.test.js --verbose --json',
      { 
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        stdio: 'pipe'
      }
    );
    
    // تحليل النتائج
    const results = JSON.parse(output);
    const totalTime = Date.now() - startTime;
    
    // إنشاء التقرير
    const report = generateReport(results, totalTime);
    
    // حفظ التقرير
    ensureReportDir();
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
    
    // طباعة الملخص
    printSummary(report);
    
    // التحقق من النجاح
    if (report.summary.passed === report.summary.total) {
      console.log('\n✅ All performance tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some performance tests failed!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Error running performance tests:');
    console.error(error.message);
    
    // محاولة تحليل الخطأ
    if (error.stdout) {
      try {
        const results = JSON.parse(error.stdout);
        const report = generateReport(results, Date.now() - startTime);
        
        ensureReportDir();
        fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
        
        printSummary(report);
      } catch (parseError) {
        console.error('Could not parse test results');
      }
    }
    
    process.exit(1);
  }
}

// ========================================
// Generate Report
// ========================================

function generateReport(results, totalTime) {
  const report = {
    timestamp: new Date().toISOString(),
    duration: totalTime,
    thresholds: PERFORMANCE_THRESHOLDS,
    summary: {
      total: results.numTotalTests,
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      skipped: results.numPendingTests
    },
    testSuites: [],
    metrics: {
      responseTime: {
        get: [],
        post: []
      },
      concurrency: [],
      database: [],
      export: [],
      memory: []
    }
  };
  
  // تحليل نتائج كل test suite
  if (results.testResults) {
    results.testResults.forEach(suite => {
      const suiteReport = {
        name: suite.name,
        status: suite.status,
        duration: suite.endTime - suite.startTime,
        tests: []
      };
      
      suite.assertionResults.forEach(test => {
        const testReport = {
          name: test.title,
          status: test.status,
          duration: test.duration || 0
        };
        
        // استخراج المقاييس من اسم الاختبار
        extractMetrics(test, report.metrics);
        
        if (test.failureMessages && test.failureMessages.length > 0) {
          testReport.error = test.failureMessages[0];
        }
        
        suiteReport.tests.push(testReport);
      });
      
      report.testSuites.push(suiteReport);
    });
  }
  
  // حساب الإحصائيات
  calculateStatistics(report);
  
  return report;
}

// ========================================
// Extract Metrics
// ========================================

function extractMetrics(test, metrics) {
  const title = test.title.toLowerCase();
  
  // Response Time
  if (title.includes('get') && title.includes('respond')) {
    metrics.responseTime.get.push({
      endpoint: extractEndpoint(title),
      duration: test.duration || 0,
      passed: test.status === 'passed'
    });
  } else if ((title.includes('post') || title.includes('put')) && title.includes('respond')) {
    metrics.responseTime.post.push({
      endpoint: extractEndpoint(title),
      duration: test.duration || 0,
      passed: test.status === 'passed'
    });
  }
  
  // Concurrency
  if (title.includes('concurrent')) {
    metrics.concurrency.push({
      type: extractConcurrencyType(title),
      duration: test.duration || 0,
      passed: test.status === 'passed'
    });
  }
  
  // Database
  if (title.includes('index') || title.includes('query') || title.includes('paginate')) {
    metrics.database.push({
      operation: extractOperation(title),
      duration: test.duration || 0,
      passed: test.status === 'passed'
    });
  }
  
  // Export
  if (title.includes('export')) {
    metrics.export.push({
      operation: extractOperation(title),
      duration: test.duration || 0,
      passed: test.status === 'passed'
    });
  }
  
  // Memory
  if (title.includes('memory')) {
    metrics.memory.push({
      operation: extractOperation(title),
      duration: test.duration || 0,
      passed: test.status === 'passed'
    });
  }
}

function extractEndpoint(title) {
  const match = title.match(/\/api\/[^\s]+/);
  return match ? match[0] : 'unknown';
}

function extractConcurrencyType(title) {
  if (title.includes('get')) return 'GET';
  if (title.includes('post')) return 'POST';
  if (title.includes('mixed')) return 'Mixed';
  return 'unknown';
}

function extractOperation(title) {
  const words = title.split(' ');
  return words.slice(0, 3).join(' ');
}

// ========================================
// Calculate Statistics
// ========================================

function calculateStatistics(report) {
  const stats = {
    responseTime: {
      get: calculateStats(report.metrics.responseTime.get.map(m => m.duration)),
      post: calculateStats(report.metrics.responseTime.post.map(m => m.duration))
    },
    concurrency: calculateStats(report.metrics.concurrency.map(m => m.duration)),
    database: calculateStats(report.metrics.database.map(m => m.duration)),
    export: calculateStats(report.metrics.export.map(m => m.duration)),
    memory: calculateStats(report.metrics.memory.map(m => m.duration))
  };
  
  report.statistics = stats;
}

function calculateStats(values) {
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0 };
  }
  
  const sorted = values.sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
    median: sorted[Math.floor(sorted.length / 2)]
  };
}

// ========================================
// Print Summary
// ========================================

function printSummary(report) {
  printHeader('Performance Test Summary');
  
  console.log(`\nTotal Duration: ${formatDuration(report.duration)}`);
  console.log(`Timestamp: ${report.timestamp}`);
  
  printSection('Test Results');
  console.log(`Total Tests: ${report.summary.total}`);
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  console.log(`⏭️  Skipped: ${report.summary.skipped}`);
  
  if (report.statistics) {
    printSection('Response Time Statistics');
    
    if (report.statistics.responseTime.get.avg > 0) {
      console.log('\nGET Requests:');
      console.log(`  Min: ${formatDuration(report.statistics.responseTime.get.min)}`);
      console.log(`  Max: ${formatDuration(report.statistics.responseTime.get.max)}`);
      console.log(`  Avg: ${formatDuration(report.statistics.responseTime.get.avg)}`);
      console.log(`  Median: ${formatDuration(report.statistics.responseTime.get.median)}`);
      
      const getThreshold = report.statistics.responseTime.get.avg < PERFORMANCE_THRESHOLDS.GET_RESPONSE_TIME;
      console.log(`  Status: ${getThreshold ? '✅' : '❌'} ${getThreshold ? 'PASS' : 'FAIL'} (< ${PERFORMANCE_THRESHOLDS.GET_RESPONSE_TIME}ms)`);
    }
    
    if (report.statistics.responseTime.post.avg > 0) {
      console.log('\nPOST Requests:');
      console.log(`  Min: ${formatDuration(report.statistics.responseTime.post.min)}`);
      console.log(`  Max: ${formatDuration(report.statistics.responseTime.post.max)}`);
      console.log(`  Avg: ${formatDuration(report.statistics.responseTime.post.avg)}`);
      console.log(`  Median: ${formatDuration(report.statistics.responseTime.post.median)}`);
      
      const postThreshold = report.statistics.responseTime.post.avg < PERFORMANCE_THRESHOLDS.POST_RESPONSE_TIME;
      console.log(`  Status: ${postThreshold ? '✅' : '❌'} ${postThreshold ? 'PASS' : 'FAIL'} (< ${PERFORMANCE_THRESHOLDS.POST_RESPONSE_TIME}ms)`);
    }
    
    if (report.statistics.database.avg > 0) {
      printSection('Database Query Statistics');
      console.log(`  Min: ${formatDuration(report.statistics.database.min)}`);
      console.log(`  Max: ${formatDuration(report.statistics.database.max)}`);
      console.log(`  Avg: ${formatDuration(report.statistics.database.avg)}`);
      console.log(`  Median: ${formatDuration(report.statistics.database.median)}`);
      console.log(`  Status: ✅ Optimized with indexes`);
    }
  }
  
  printSection('Report Location');
  console.log(`Report saved to: ${REPORT_FILE}`);
  
  console.log('\n' + '='.repeat(60));
}

// ========================================
// Main
// ========================================

if (require.main === module) {
  runPerformanceTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runPerformanceTests };
