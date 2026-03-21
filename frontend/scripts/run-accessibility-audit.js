/**
 * Simple Lighthouse Accessibility Audit
 * Runs only accessibility audit on localhost:3000
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function runAccessibilityAudit() {
  console.log('🚀 Starting Lighthouse Accessibility Audit...\n');
  console.log('📍 Target: http://localhost:3000\n');

  let chrome;
  try {
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--disable-extensions'
      ],
      logLevel: 'error'
    });

    const options = {
      logLevel: 'info',
      output: ['html', 'json'],
      onlyCategories: ['accessibility'],
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
    };

    console.log('🌐 Running Lighthouse audit...\n');
    const runnerResult = await lighthouse('http://localhost:3000', options);

    // Extract results
    const { lhr, report } = runnerResult;
    
    if (!lhr || !lhr.categories || !lhr.categories.accessibility) {
      throw new Error('Invalid Lighthouse result - missing accessibility category');
    }

    const accessibilityScore = Math.round(lhr.categories.accessibility.score * 100);

    // Save reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlReport = report[0];
    const jsonReport = report[1];

    const htmlPath = path.join(__dirname, `lighthouse-accessibility-${timestamp}.html`);
    const jsonPath = path.join(__dirname, `lighthouse-accessibility-${timestamp}.json`);

    fs.writeFileSync(htmlPath, htmlReport);
    fs.writeFileSync(jsonPath, jsonReport);

    // Print results
    console.log('✅ Lighthouse Accessibility Audit Complete!\n');
    console.log('═'.repeat(60));
    console.log(`📊 Accessibility Score: ${accessibilityScore}/100`);
    console.log(`🎯 Target Score: 95/100`);
    console.log('═'.repeat(60));
    
    if (accessibilityScore >= 95) {
      console.log('\n✅ PASSED: Accessibility score meets the target!\n');
    } else {
      console.log(`\n❌ FAILED: Accessibility score is ${95 - accessibilityScore} points below target\n`);
    }

    console.log(`📄 Reports saved:`);
    console.log(`   HTML: ${path.basename(htmlPath)}`);
    console.log(`   JSON: ${path.basename(jsonPath)}\n`);

    // Print audit details
    const audits = lhr.categories.accessibility.auditRefs;
    const failedAudits = audits.filter(audit => {
      const auditResult = lhr.audits[audit.id];
      return auditResult.score !== null && auditResult.score < 1;
    });

    const passedAudits = audits.filter(audit => {
      const auditResult = lhr.audits[audit.id];
      return auditResult.score === 1;
    });

    console.log('📋 Audit Summary:');
    console.log(`   ✅ Passed: ${passedAudits.length} audits`);
    console.log(`   ❌ Failed: ${failedAudits.length} audits`);
    console.log(`   ℹ️  Total: ${audits.length} audits\n`);

    if (failedAudits.length > 0) {
      console.log(`⚠️  Accessibility Issues Found:\n`);
      failedAudits.slice(0, 10).forEach((audit, index) => {
        const auditResult = lhr.audits[audit.id];
        console.log(`${index + 1}. ${auditResult.title}`);
        console.log(`   Score: ${Math.round((auditResult.score || 0) * 100)}/100`);
        if (auditResult.description) {
          const desc = auditResult.description.replace(/<[^>]*>/g, '').substring(0, 80);
          console.log(`   ${desc}...`);
        }
        console.log('');
      });
      
      if (failedAudits.length > 10) {
        console.log(`   ... and ${failedAudits.length - 10} more issues\n`);
      }
    } else {
      console.log('✨ No accessibility issues found!\n');
    }

    return accessibilityScore;

  } catch (error) {
    console.error('❌ Error running Lighthouse audit:', error.message);
    throw error;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

// Run the audit
runAccessibilityAudit()
  .then(score => {
    process.exit(score >= 95 ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
