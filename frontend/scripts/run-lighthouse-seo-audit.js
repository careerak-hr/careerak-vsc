/**
 * Lighthouse SEO Audit Runner
 * 
 * This script runs a Lighthouse SEO audit on the built application
 * and generates a report with the score.
 * 
 * Target: 95+ SEO score
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function runLighthouseSEOAudit() {
  console.log('🚀 Starting Lighthouse SEO Audit...\n');

  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
    logLevel: 'error'
  });

  const options = {
    logLevel: 'error',
    output: ['html', 'json'],
    onlyCategories: ['seo'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(`http://localhost:${chrome.port}`, options);

  // Stop Chrome
  await chrome.kill();

  // Extract results
  const { lhr, report } = runnerResult;
  const seoScore = lhr.categories.seo.score * 100;

  // Save reports
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const htmlReport = report[0];
  const jsonReport = report[1];

  fs.writeFileSync(
    path.join(__dirname, `lighthouse-seo-report.html`),
    htmlReport
  );
  fs.writeFileSync(
    path.join(__dirname, `lighthouse-seo-report.json`),
    jsonReport
  );

  // Print results
  console.log('✅ Lighthouse SEO Audit Complete!\n');
  console.log(`📊 SEO Score: ${seoScore}/100`);
  console.log(`🎯 Target Score: 95/100`);
  
  if (seoScore >= 95) {
    console.log('✅ PASSED: SEO score meets the target!');
  } else {
    console.log(`❌ FAILED: SEO score is below target (${95 - seoScore} points short)`);
  }

  console.log(`\n📄 Reports saved:`);
  console.log(`   - lighthouse-seo-report.html`);
  console.log(`   - lighthouse-seo-report.json`);

  // Print audit details
  console.log('\n📋 SEO Audit Details:');
  const audits = lhr.categories.seo.auditRefs;
  const failedAudits = audits.filter(audit => {
    const auditResult = lhr.audits[audit.id];
    return auditResult.score !== null && auditResult.score < 1;
  });

  if (failedAudits.length > 0) {
    console.log(`\n⚠️  ${failedAudits.length} SEO issues found:\n`);
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
    console.log('   ✅ No SEO issues found!');
  }

  // Print passing audits summary
  const passingAudits = audits.filter(audit => {
    const auditResult = lhr.audits[audit.id];
    return auditResult.score === 1;
  });

  console.log(`\n✅ ${passingAudits.length} SEO checks passed:\n`);
  passingAudits.forEach(audit => {
    const auditResult = lhr.audits[audit.id];
    console.log(`   ✓ ${auditResult.title}`);
  });

  return seoScore;
}

// Run the audit
runLighthouseSEOAudit()
  .then(score => {
    process.exit(score >= 95 ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Error running Lighthouse SEO audit:', error);
    process.exit(1);
  });
