/**
 * Comprehensive Lighthouse Audit Runner
 * 
 * This script runs Lighthouse audits on all pages of the application
 * with all categories: Performance, Accessibility, SEO, Best Practices
 * 
 * Targets:
 * - Performance: 90+
 * - Accessibility: 95+
 * - SEO: 95+
 * - Best Practices: 90+
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');

// Pages to audit (public pages that don't require authentication)
const PAGES_TO_AUDIT = [
  { path: '/', name: 'Home' },
  { path: '/entry', name: 'Entry Page' },
  { path: '/language', name: 'Language Selection' },
  { path: '/login', name: 'Login' },
  { path: '/auth', name: 'Registration' },
];

// Target scores
const TARGETS = {
  performance: 90,
  accessibility: 95,
  seo: 95,
  'best-practices': 90
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function startServer() {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: path.join(__dirname, 'build'),
      cleanUrls: true,
      rewrites: [
        { source: '**', destination: '/index.html' }
      ]
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(3001, (err) => {
      if (err) reject(err);
      else {
        console.log(colorize('✓ Local server started on http://localhost:3001', 'green'));
        resolve(server);
      }
    });
  });
}

async function runLighthouseAudit(url, pageName) {
  console.log(colorize(`\n🔍 Auditing: ${pageName} (${url})`, 'cyan'));

  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-software-rasterizer',
      '--disable-extensions'
    ],
    logLevel: 'error'
  });

  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
    port: chrome.port,
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
    // Disable storage reset to avoid permission issues
    disableStorageReset: true,
  };

  try {
    const runnerResult = await lighthouse(url, options);
    await chrome.kill();

    const { lhr } = runnerResult;
    
    // Extract scores
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      seo: Math.round(lhr.categories.seo.score * 100),
      'best-practices': Math.round(lhr.categories['best-practices'].score * 100),
    };

    return { scores, lhr, pageName };
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

function printScores(scores, pageName) {
  console.log(colorize(`\n📊 Scores for ${pageName}:`, 'blue'));
  
  Object.entries(scores).forEach(([category, score]) => {
    const target = TARGETS[category];
    const passed = score >= target;
    const icon = passed ? '✓' : '✗';
    const color = passed ? 'green' : 'red';
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
    
    console.log(
      `  ${colorize(icon, color)} ${categoryName}: ${colorize(score, color)}/100 ` +
      `(target: ${target})`
    );
  });
}

function printDetailedIssues(lhr, category) {
  const categoryData = lhr.categories[category];
  const audits = categoryData.auditRefs;
  
  const failedAudits = audits.filter(audit => {
    const auditResult = lhr.audits[audit.id];
    return auditResult.score !== null && auditResult.score < 1;
  });

  if (failedAudits.length > 0) {
    console.log(colorize(`\n⚠️  ${failedAudits.length} ${category} issues:`, 'yellow'));
    failedAudits.slice(0, 5).forEach(audit => {
      const auditResult = lhr.audits[audit.id];
      const score = auditResult.score !== null ? Math.round(auditResult.score * 100) : 'N/A';
      console.log(`   • ${auditResult.title} (${score}/100)`);
      if (auditResult.description) {
        const desc = auditResult.description.replace(/\[.*?\]\(.*?\)/g, '').substring(0, 80);
        console.log(`     ${desc}...`);
      }
    });
    if (failedAudits.length > 5) {
      console.log(`   ... and ${failedAudits.length - 5} more issues`);
    }
  }
}

async function runAllAudits() {
  console.log(colorize('\n🚀 Starting Comprehensive Lighthouse Audit', 'cyan'));
  console.log(colorize('=' .repeat(60), 'cyan'));
  
  // Check if build folder exists
  const buildPath = path.join(__dirname, 'build');
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
  const allScores = {
    performance: [],
    accessibility: [],
    seo: [],
    'best-practices': []
  };

  // Run audits for each page
  for (const page of PAGES_TO_AUDIT) {
    const url = `http://localhost:3001${page.path}`;
    
    try {
      const result = await runLighthouseAudit(url, page.name);
      results.push(result);
      
      // Print scores for this page
      printScores(result.scores, page.name);
      
      // Collect scores for averaging
      Object.entries(result.scores).forEach(([category, score]) => {
        allScores[category].push(score);
      });
      
      // Print top issues for categories below target
      Object.entries(result.scores).forEach(([category, score]) => {
        if (score < TARGETS[category]) {
          printDetailedIssues(result.lhr, category);
        }
      });
      
    } catch (error) {
      console.error(colorize(`\n❌ Error auditing ${page.name}:`, 'red'), error.message);
    }
  }

  // Stop server
  server.close();

  // Calculate and print summary
  console.log(colorize('\n' + '='.repeat(60), 'cyan'));
  console.log(colorize('📈 SUMMARY - Average Scores Across All Pages', 'cyan'));
  console.log(colorize('='.repeat(60), 'cyan'));

  const summary = {};
  let allPassed = true;

  Object.entries(allScores).forEach(([category, scores]) => {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const target = TARGETS[category];
    const passed = avg >= target;
    const icon = passed ? '✓' : '✗';
    const color = passed ? 'green' : 'red';
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
    
    summary[category] = { avg, passed };
    
    if (!passed) allPassed = false;
    
    console.log(
      `${colorize(icon, color)} ${categoryName}: ${colorize(avg, color)}/100 ` +
      `(target: ${target})`
    );
  });

  // Save detailed report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(__dirname, `lighthouse-report-${timestamp}.json`);
  
  const report = {
    timestamp: new Date().toISOString(),
    summary,
    targets: TARGETS,
    pages: results.map(r => ({
      name: r.pageName,
      scores: r.scores
    }))
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(colorize(`\n📄 Detailed report saved: lighthouse-report-${timestamp}.json`, 'blue'));

  // Final result
  console.log(colorize('\n' + '='.repeat(60), 'cyan'));
  if (allPassed) {
    console.log(colorize('✅ SUCCESS: All categories meet their targets!', 'green'));
    return 0;
  } else {
    console.log(colorize('❌ FAILED: Some categories are below target', 'red'));
    console.log(colorize('\nRecommendations:', 'yellow'));
    
    if (summary.performance.avg < TARGETS.performance) {
      console.log('  • Performance: Optimize images, enable code splitting, reduce bundle size');
    }
    if (summary.accessibility.avg < TARGETS.accessibility) {
      console.log('  • Accessibility: Add ARIA labels, improve color contrast, fix keyboard navigation');
    }
    if (summary.seo.avg < TARGETS.seo) {
      console.log('  • SEO: Add meta tags, improve heading structure, add structured data');
    }
    if (summary['best-practices'].avg < TARGETS['best-practices']) {
      console.log('  • Best Practices: Fix console errors, use HTTPS, update dependencies');
    }
    
    return 1;
  }
}

// Run the audits
runAllAudits()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error(colorize('\n❌ Fatal error:', 'red'), error);
    process.exit(1);
  });
