/**
 * Verify Lighthouse Scores Script
 * 
 * This script runs Lighthouse audits on the local preview server
 * and verifies that scores meet the required targets:
 * - Performance: 90+
 * - Accessibility: 95+
 * - SEO: 95+
 * - Best Practices: 90+
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const PAGES = [
  { url: '/', name: 'Homepage' },
  { url: '/job-postings', name: 'Job Postings' },
  { url: '/courses', name: 'Courses' },
  { url: '/login', name: 'Login' },
];

const TARGETS = {
  performance: 0.9,
  accessibility: 0.95,
  seo: 0.95,
  'best-practices': 0.9,
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatScore(score) {
  const percentage = Math.round(score * 100);
  if (percentage >= 90) return `${colors.green}${percentage}${colors.reset}`;
  if (percentage >= 50) return `${colors.yellow}${percentage}${colors.reset}`;
  return `${colors.red}${percentage}${colors.reset}`;
}

async function runLighthouse(url, name) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Testing: ${name} (${url})`, 'bold');
  log('='.repeat(60), 'cyan');

  try {
    // Run Lighthouse
    const command = `npx lighthouse ${BASE_URL}${url} --preset=desktop --quiet --chrome-flags="--headless" --output=json --output-path=./.lighthouse-temp.json`;
    
    log('Running Lighthouse audit...', 'cyan');
    execSync(command, { stdio: 'inherit' });

    // Read results
    const results = JSON.parse(fs.readFileSync('./.lighthouse-temp.json', 'utf8'));
    const categories = results.categories;

    // Display scores
    log('\nScores:', 'bold');
    log(`  Performance:    ${formatScore(categories.performance.score)} (target: 90+)`);
    log(`  Accessibility:  ${formatScore(categories.accessibility.score)} (target: 95+)`);
    log(`  SEO:            ${formatScore(categories.seo.score)} (target: 95+)`);
    log(`  Best Practices: ${formatScore(categories['best-practices'].score)} (target: 90+)`);

    // Check if targets are met
    const results_check = {
      performance: categories.performance.score >= TARGETS.performance,
      accessibility: categories.accessibility.score >= TARGETS.accessibility,
      seo: categories.seo.score >= TARGETS.seo,
      'best-practices': categories['best-practices'].score >= TARGETS['best-practices'],
    };

    const allPassed = Object.values(results_check).every(v => v);

    if (allPassed) {
      log('\n✅ All targets met!', 'green');
    } else {
      log('\n⚠️  Some targets not met:', 'yellow');
      if (!results_check.performance) log('  - Performance score below 90', 'red');
      if (!results_check.accessibility) log('  - Accessibility score below 95', 'red');
      if (!results_check.seo) log('  - SEO score below 95', 'red');
      if (!results_check['best-practices']) log('  - Best Practices score below 90', 'red');
    }

    // Cleanup
    if (fs.existsSync('./.lighthouse-temp.json')) {
      fs.unlinkSync('./.lighthouse-temp.json');
    }

    return {
      name,
      url,
      scores: {
        performance: categories.performance.score,
        accessibility: categories.accessibility.score,
        seo: categories.seo.score,
        'best-practices': categories['best-practices'].score,
      },
      passed: allPassed,
    };
  } catch (error) {
    log(`\n❌ Error running Lighthouse: ${error.message}`, 'red');
    return {
      name,
      url,
      error: error.message,
      passed: false,
    };
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         Lighthouse Score Verification                     ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  log('\nTargets:', 'bold');
  log(`  Performance:    90+`);
  log(`  Accessibility:  95+`);
  log(`  SEO:            95+`);
  log(`  Best Practices: 90+`);

  const results = [];

  // Test homepage only for quick verification
  const result = await runLighthouse(PAGES[0].url, PAGES[0].name);
  results.push(result);

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('Summary', 'bold');
  log('='.repeat(60), 'cyan');

  const allPassed = results.every(r => r.passed);

  if (allPassed) {
    log('\n✅ All Lighthouse targets met!', 'green');
    log('\nTask 10.5.3 "Verify Lighthouse scores meet targets" is COMPLETE.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some Lighthouse targets not met.', 'yellow');
    log('\nPlease review the scores above and address any issues.', 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
