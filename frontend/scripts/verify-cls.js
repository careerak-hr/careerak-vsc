/**
 * CLS Verification Script
 * 
 * Extracts CLS data from existing Lighthouse reports
 * Target: CLS < 0.1
 */

const fs = require('fs');
const path = require('path');

const CLS_TARGET = 0.1;
const CLS_ACCEPTABLE = 0.25;

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

function getCLSStatus(cls) {
  if (cls < CLS_TARGET) {
    return { status: 'GOOD', color: 'green', icon: '✓' };
  } else if (cls < CLS_ACCEPTABLE) {
    return { status: 'NEEDS IMPROVEMENT', color: 'yellow', icon: '⚠' };
  } else {
    return { status: 'POOR', color: 'red', icon: '✗' };
  }
}

function extractCLSFromReport(reportPath) {
  try {
    const data = fs.readFileSync(reportPath, 'utf8');
    const report = JSON.parse(data);
    
    if (report.audits && report.audits['cumulative-layout-shift']) {
      const clsAudit = report.audits['cumulative-layout-shift'];
      if (clsAudit.numericValue !== undefined && clsAudit.numericValue !== null) {
        return clsAudit.numericValue;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

function findLighthouseReports() {
  const reports = [];
  const frontendDir = path.join(__dirname, '..');
  
  // Check for lighthouse-report.report.json
  const mainReport = path.join(frontendDir, 'lighthouse-report.report.json');
  if (fs.existsSync(mainReport)) {
    reports.push({ path: mainReport, name: 'Main Report' });
  }
  
  // Check for timestamped reports
  const files = fs.readdirSync(frontendDir);
  files.forEach(file => {
    if (file.startsWith('lighthouse-report-') && file.endsWith('.json')) {
      reports.push({ 
        path: path.join(frontendDir, file), 
        name: file.replace('lighthouse-report-', '').replace('.json', '')
      });
    }
  });
  
  return reports;
}

console.log(colorize('\n🎯 CLS (Cumulative Layout Shift) Verification', 'cyan'));
console.log(colorize('=' .repeat(70), 'cyan'));
console.log(colorize(`Target: CLS < ${CLS_TARGET} (Good)`, 'blue'));
console.log(colorize(`Acceptable: CLS < ${CLS_ACCEPTABLE} (Needs Improvement)`, 'blue'));
console.log(colorize(`Poor: CLS >= ${CLS_ACCEPTABLE}`, 'blue'));

const reports = findLighthouseReports();

if (reports.length === 0) {
  console.log(colorize('\n❌ No Lighthouse reports found!', 'red'));
  console.log(colorize('Please run "npm run audit:lighthouse" first to generate reports.', 'yellow'));
  process.exit(1);
}

console.log(colorize(`\n📊 Found ${reports.length} Lighthouse report(s)`, 'cyan'));
console.log(colorize('=' .repeat(70), 'cyan'));

const clsValues = [];
const results = [];

reports.forEach(report => {
  const cls = extractCLSFromReport(report.path);
  
  if (cls !== null) {
    const { status, color, icon } = getCLSStatus(cls);
    console.log(
      `${colorize(icon, color)} ${report.name}: ${colorize(cls.toFixed(3), color)} ` +
      `(${colorize(status, color)})`
    );
    clsValues.push(cls);
    results.push({ name: report.name, cls });
  } else {
    console.log(colorize(`⚠ ${report.name}: No CLS data`, 'yellow'));
  }
});

if (clsValues.length === 0) {
  console.log(colorize('\n❌ No valid CLS measurements found', 'red'));
  process.exit(1);
}

// Calculate statistics
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
  `\n  Reports passing target (< ${CLS_TARGET}): ` +
  `${colorize(`${passedCount}/${totalCount}`, passedCount === totalCount ? 'green' : 'yellow')}`
);

// Save report
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(__dirname, '..', `cls-verification-${timestamp}.json`);

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
  reports: results
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(colorize(`\n📄 Verification report saved: cls-verification-${timestamp}.json`, 'blue'));

// Final result
console.log(colorize('\n' + '='.repeat(70), 'cyan'));

const allPassed = avgCLS < CLS_TARGET && maxCLS < CLS_TARGET;

if (allPassed) {
  console.log(colorize('✅ SUCCESS: CLS < 0.1 verified!', 'green'));
  console.log(colorize('   Layout stability is excellent.', 'green'));
  process.exit(0);
} else if (avgCLS < CLS_ACCEPTABLE) {
  console.log(colorize('⚠️  NEEDS IMPROVEMENT: Some measurements have CLS >= 0.1', 'yellow'));
  console.log(colorize('\nRecommendations:', 'yellow'));
  console.log('  • Add explicit width/height to images');
  console.log('  • Reserve space for dynamic content');
  console.log('  • Use CSS aspect-ratio for responsive images');
  console.log('  • Avoid inserting content above existing content');
  console.log('  • Use transform animations instead of layout properties');
  console.log('  • Preload fonts to avoid FOIT/FOUT');
  process.exit(1);
} else {
  console.log(colorize('❌ FAILED: CLS is too high (>= 0.25)', 'red'));
  console.log(colorize('\nCritical issues:', 'red'));
  console.log('  • Images without dimensions');
  console.log('  • Dynamic content insertion without space reservation');
  console.log('  • Web fonts causing FOUT');
  console.log('  • Animations using layout-triggering properties');
  process.exit(1);
}
