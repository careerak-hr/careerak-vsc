/**
 * Lighthouse Accessibility Audit Runner
 * 
 * This script runs a Lighthouse accessibility audit on the built application
 * and generates a report with the score.
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function runLighthouseAudit() {
  console.log('🚀 Starting Lighthouse Accessibility Audit...\n');

  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
    logLevel: 'error'
  });

  const options = {
    logLevel: 'error',
    output: ['html', 'json'],
    onlyCategories: ['accessibility'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(`http://localhost:${chrome.port}`, options);

  // Stop Chrome
  await chrome.kill();

  // Extract results
  const { lhr, report } = runnerResult;
  const accessibilityScore = lhr.categories.accessibility.score * 100;

  // Save reports
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const htmlReport = report[0];
  const jsonReport = report[1];

  fs.writeFileSync(
    path.join(__dirname, `lighthouse-accessibility-${timestamp}.html`),
    htmlReport
  );
  fs.writeFileSync(
    path.join(__dirname, `lighthouse-accessibility-${timestamp}.json`),
    jsonReport
  );

  // Print results
  console.log('✅ Lighthouse Accessibility Audit Complete!\n');
  console.log(`📊 Accessibility Score: ${accessibilityScore}/100`);
  console.log(`🎯 Target Score: 95/100`);
  
  if (accessibilityScore >= 95) {
    console.log('✅ PASSED: Accessibility score meets the target!');
  } else {
    console.log(`❌ FAILED: Accessibility score is below target (${95 - accessibilityScore} points short)`);
  }

  console.log(`\n📄 Reports saved:`);
  console.log(`   - lighthouse-accessibility-${timestamp}.html`);
  console.log(`   - lighthouse-accessibility-${timestamp}.json`);

  // Print audit details
  console.log('\n📋 Audit Details:');
  const audits = lhr.categories.accessibility.auditRefs;
  const failedAudits = audits.filter(audit => {
    const auditResult = lhr.audits[audit.id];
    return auditResult.score !== null && auditResult.score < 1;
  });

  if (failedAudits.length > 0) {
    console.log(`\n⚠️  ${failedAudits.length} accessibility issues found:\n`);
    failedAudits.forEach(audit => {
      const auditResult = lhr.audits[audit.id];
      console.log(`   - ${auditResult.title}`);
      console.log(`     Score: ${(auditResult.score * 100).toFixed(0)}/100`);
      if (auditResult.description) {
        console.log(`     ${auditResult.description.substring(0, 100)}...`);
      }
      console.log('');
    });
  } else {
    console.log('   ✅ No accessibility issues found!');
  }

  return accessibilityScore;
}

// Run the audit
runLighthouseAudit()
  .then(score => {
    process.exit(score >= 95 ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Error running Lighthouse audit:', error);
    process.exit(1);
  });
