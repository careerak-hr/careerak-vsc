/**
 * Comprehensive Lighthouse Audit Runner (CLI Version)
 * 
 * This script runs Lighthouse audits using the CLI instead of the Node API
 * to avoid Windows permission issues.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');

// Pages to audit
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

function runLighthouseCLI(url, outputPath) {
  return new Promise((resolve, reject) => {
    const lighthouse = spawn('npx', [
      'lighthouse',
      url,
      '--output=json',
      `--output-path=${outputPath}`,
      '--only-categories=performance,accessibility,seo,best-practices',
      '--chrome-flags="--headless --no-sandbox"',
      '--quiet'
    ], {
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    lighthouse.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    lighthouse.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    lighthouse.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Lighthouse exited with code ${code}\n${stderr}`));
      }
    });

    lighthouse.on('error', (error) => {
      reject(error);
    });
  });
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

async function runAllAudits() {
  console.log(colorize('\n🚀 Starting Comprehensive Lighthouse Audit (CLI)', 'cyan'));
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

  // Create temp directory for reports
  const tempDir = path.join(__dirname, 'lighthouse-temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Run audits for each page
  for (let i = 0; i < PAGES_TO_AUDIT.length; i++) {
    const page = PAGES_TO_AUDIT[i];
    const url = `http://localhost:3001${page.path}`;
    const outputPath = path.join(tempDir, `report-${i}.json`);
    
    console.log(colorize(`\n🔍 Auditing: ${page.name} (${url})`, 'cyan'));
    
    try {
      await runLighthouseCLI(url, outputPath);
      
      // Read the report
      const reportData = fs.readFileSync(outputPath, 'utf8');
      const lhr = JSON.parse(reportData);
      
      // Extract scores
      const scores = {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
        'best-practices': Math.round(lhr.categories['best-practices'].score * 100),
      };
      
      results.push({ scores, pageName: page.name });
      printScores(scores, page.name);
      
      // Collect scores for averaging
      Object.entries(scores).forEach(([category, score]) => {
        allScores[category].push(score);
      });
      
    } catch (error) {
      console.error(colorize(`\n❌ Error auditing ${page.name}:`, 'red'), error.message);
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

  // Calculate and print summary
  console.log(colorize('\n' + '='.repeat(60), 'cyan'));
  console.log(colorize('📈 SUMMARY - Average Scores Across All Pages', 'cyan'));
  console.log(colorize('='.repeat(60), 'cyan'));

  const summary = {};
  let allPassed = true;

  Object.entries(allScores).forEach(([category, scores]) => {
    if (scores.length === 0) {
      console.log(colorize(`⚠️  No scores collected for ${category}`, 'yellow'));
      return;
    }
    
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
    pages: results
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(colorize(`\n📄 Detailed report saved: lighthouse-report-${timestamp}.json`, 'blue'));

  // Final result
  console.log(colorize('\n' + '='.repeat(60), 'cyan'));
  if (allPassed && Object.keys(summary).length > 0) {
    console.log(colorize('✅ SUCCESS: All categories meet their targets!', 'green'));
    return 0;
  } else if (Object.keys(summary).length === 0) {
    console.log(colorize('❌ FAILED: No audits completed successfully', 'red'));
    return 1;
  } else {
    console.log(colorize('❌ FAILED: Some categories are below target', 'red'));
    console.log(colorize('\nRecommendations:', 'yellow'));
    
    if (summary.performance && summary.performance.avg < TARGETS.performance) {
      console.log('  • Performance: Optimize images, enable code splitting, reduce bundle size');
    }
    if (summary.accessibility && summary.accessibility.avg < TARGETS.accessibility) {
      console.log('  • Accessibility: Add ARIA labels, improve color contrast, fix keyboard navigation');
    }
    if (summary.seo && summary.seo.avg < TARGETS.seo) {
      console.log('  • SEO: Add meta tags, improve heading structure, add structured data');
    }
    if (summary['best-practices'] && summary['best-practices'].avg < TARGETS['best-practices']) {
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
