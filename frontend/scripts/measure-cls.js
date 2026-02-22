/**
 * CLS (Cumulative Layout Shift) Measurement Script
 * 
 * This script measures CLS across all pages and verifies it's below 0.1
 * Uses Lighthouse CLI to extract CLS metrics
 * 
 * Target: CLS < 0.1 (Good)
 * Acceptable: CLS < 0.25 (Needs Improvement)
 * Poor: CLS >= 0.25
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');

// Pages to measure
const PAGES_TO_MEASURE = [
  { path: '/', name: 'Home' },
  { path: '/entry', name: 'Entry Page' },
  { path: '/language', name: 'Language Selection' },
  { path: '/login', name: 'Login' },
  { path: '/auth', name: 'Registration' },
  { path: '/profile', name: 'Profile' },
  { path: '/jobs', name: 'Job Postings' },
  { path: '/courses', name: 'Courses' },
  { path: '/settings', name: 'Settings' },
];

// CLS thresholds
const CLS_TARGET = 0.1;
const CLS_ACCEPTABLE = 0.25;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function startServer() {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: path.join(__dirname, '..', 'build'),
      cleanUrls: true,
      rewrites: [
        { source: '**', destination: '/index.html' }
      ]
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(3002, (err) => {
      if (err) reject(err);
      else {
        console.log(colorize('✓ Local server started on http://localhost:3002', 'green'));
        resolve(server);
      }
    });
  });
}

function runLighthouseCLI(url, outputPath) {
  return new Promise((resolve, reject) => {
    const lighthouse = spawn('npx', [
      'lighthouse',
      url,
      '--output=json',
      `--output-path=${outputPath}`,
      '--only-categories=performance',
      '--chrome-flags="--headless --no-sandbox"',
      '--throttling-method=simulate',
      '--quiet'
    ], {
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stderr = '';

    lighthouse.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    lighthouse.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Lighthouse exited with code ${code}\n${stderr}`));
      }
    });

    lighthouse.on('error', (error) => {
      reject(error);
    });
  });
}

function getCLSStatus(cls) {
  if (cls < CLS_TARGET) {
    return { status: 'GOOD', color: 'green', icon: '✓' };
  } else if (cls < CLS_ACCEPTABLE) {
    return { status: 'NEEDS IMPROVEMENT', color: 'yellow', icon: '⚠' };
  } else {
    return { status: 'POOR', color: 'red', icon: '✗' };
  }
}

function printCLSResult(pageName, cls) {
  const { status, color, icon } = getCLSStatus(cls);
  console.log(
    `  ${colorize(icon, color)} ${pageName}: ${colorize(cls.toFixed(3), color)} ` +
    `(${colorize(status, color)})`
  );
}

async function measureAllPages() {
  console.log(colorize('\n🎯 CLS (Cumulative Layout Shift) Measurement', 'cyan'));
  console.log(colorize('=' .repeat(70), 'cyan'));
  console.log(colorize(`Target: CLS < ${CLS_TARGET} (Good)`, 'blue'));
  console.log(colorize(`Acceptable: CLS < ${CLS_ACCEPTABLE} (Needs Improvement)`, 'blue'));
  console.log(colorize(`Poor: CLS >= ${CLS_ACCEPTABLE}`, 'blue'));
  
  // Check if build folder exists
  const buildPath = path.join(__dirname, '..', 'build');
  if (!fs.existsSync(buildPath)) {
    console.error(colorize('\n❌ Error: build folder not found!', 'red'));
    console.log(colorize('Please run "npm run build" first.', 'yellow'));
    process.exit(1);
  }

  // Start local server
  let server;
  try {
    server = await startServer();
  } catch (error) {
    console.error(colorize('\n❌ Error starting server:', 'red'), error.message);
    process.exit(1);
  }

  const results = [];
  const clsValues = [];

  // Create temp directory for reports
  const tempDir = path.join(__dirname, '..', 'lighthouse-cls-temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  console.log(colorize('\n📊 Measuring CLS for each page...', 'cyan'));

  // Run measurements for each page
  for (let i = 0; i < PAGES_TO_MEASURE.length; i++) {
    const page = PAGES_TO_MEASURE[i];
    const url = `http://localhost:3002${page.path}`;
    const outputPath = path.join(tempDir, `cls-report-${i}.json`);
    
    process.stdout.write(colorize(`\n🔍 Measuring: ${page.name}... `, 'cyan'));
    
    try {
      await runLighthouseCLI(url, outputPath);
      
      // Read the report
      const reportData = fs.readFileSync(outputPath, 'utf8');
      const lhr = JSON.parse(reportData);
      
      // Extract CLS value
      const clsAudit = lhr.audits['cumulative-layout-shift'];
      const cls = clsAudit ? clsAudit.numericValue : null;
      
      if (cls !== null) {
        results.push({ pageName: page.name, cls });
        clsValues.push(cls);
        process.stdout.write(colorize('Done\n', 'green'));
      } else {
        process.stdout.write(colorize('No CLS data\n', 'yellow'));
      }
      
    } catch (error) {
      process.stdout.write(colorize('Failed\n', 'red'));
      console.error(colorize(`  Error: ${error.message}`, 'red'));
    }
  }

  // Clean up temp directory
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }

  // Stop server
  server.close();

  // Print results
  console.log(colorize('\n' + '='.repeat(70), 'cyan'));
  console.log(colorize('📈 CLS Results by Page', 'cyan'));
  console.log(colorize('='.repeat(70), 'cyan'));

  results.forEach(result => {
    printCLSResult(result.pageName, result.cls);
  });

  // Calculate statistics
  if (clsValues.length === 0) {
    console.log(colorize('\n❌ No CLS measurements collected', 'red'));
    return 1;
  }

  const avgCLS = clsValues.reduce((a, b) => a + b, 0) / clsValues.length;
  const maxCLS = Math.max(...clsValues);
  const minCLS = Math.min(...clsValues);
  const passedCount = clsValues.filter(cls => cls < CLS_TARGET).length;
  const totalCount = clsValues.length;

  console.log(colorize('\n' + '='.repeat(70), 'cyan'));
  console.log(colorize('📊 Summary Statistics', 'cyan'));
  console.log(colorize('='.repeat(70), 'cyan'));
  
  const avgStatus = getCLSStatus(avgCLS);
  console.log(
    `${colorize(avgStatus.icon, avgStatus.color)} Average CLS: ` +
    `${colorize(avgCLS.toFixed(3), avgStatus.color)} ` +
    `(${colorize(avgStatus.status, avgStatus.color)})`
  );
  
  const maxStatus = getCLSStatus(maxCLS);
  console.log(
    `${colorize(maxStatus.icon, maxStatus.color)} Maximum CLS: ` +
    `${colorize(maxCLS.toFixed(3), maxStatus.color)} ` +
    `(${colorize(maxStatus.status, maxStatus.color)})`
  );
  
  const minStatus = getCLSStatus(minCLS);
  console.log(
    `${colorize(minStatus.icon, minStatus.color)} Minimum CLS: ` +
    `${colorize(minCLS.toFixed(3), minStatus.color)} ` +
    `(${colorize(minStatus.status, minStatus.color)})`
  );
  
  console.log(
    `\n  Pages passing target (< ${CLS_TARGET}): ` +
    `${colorize(`${passedCount}/${totalCount}`, passedCount === totalCount ? 'green' : 'yellow')}`
  );

  // Save detailed report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(__dirname, '..', `cls-report-${timestamp}.json`);
  
  const report = {
    timestamp: new Date().toISOString(),
    target: CLS_TARGET,
    acceptable: CLS_ACCEPTABLE,
    summary: {
      average: avgCLS,
      maximum: maxCLS,
      minimum: minCLS,
      passedCount,
      totalCount,
      passRate: (passedCount / totalCount * 100).toFixed(1) + '%'
    },
    pages: results
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(colorize(`\n📄 Detailed report saved: cls-report-${timestamp}.json`, 'blue'));

  // Final result
  console.log(colorize('\n' + '='.repeat(70), 'cyan'));
  
  const allPassed = avgCLS < CLS_TARGET && maxCLS < CLS_TARGET;
  
  if (allPassed) {
    console.log(colorize('✅ SUCCESS: All pages have CLS < 0.1!', 'green'));
    console.log(colorize('   Layout stability is excellent across the platform.', 'green'));
    return 0;
  } else if (avgCLS < CLS_ACCEPTABLE) {
    console.log(colorize('⚠️  NEEDS IMPROVEMENT: Some pages have CLS >= 0.1', 'yellow'));
    console.log(colorize('\nRecommendations to improve CLS:', 'yellow'));
    console.log('  • Add explicit width/height to images');
    console.log('  • Reserve space for dynamic content (ads, embeds)');
    console.log('  • Use CSS aspect-ratio for responsive images');
    console.log('  • Avoid inserting content above existing content');
    console.log('  • Use transform animations instead of layout-triggering properties');
    console.log('  • Preload fonts to avoid FOIT/FOUT');
    return 1;
  } else {
    console.log(colorize('❌ FAILED: CLS is too high (>= 0.25)', 'red'));
    console.log(colorize('\nCritical issues to fix:', 'red'));
    console.log('  • Images without dimensions causing layout shifts');
    console.log('  • Dynamic content insertion without space reservation');
    console.log('  • Web fonts causing FOUT (Flash of Unstyled Text)');
    console.log('  • Animations using layout-triggering properties');
    console.log('  • Late-loading content pushing down existing content');
    return 1;
  }
}

// Run the measurements
measureAllPages()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error(colorize('\n❌ Fatal error:', 'red'), error);
    process.exit(1);
  });
