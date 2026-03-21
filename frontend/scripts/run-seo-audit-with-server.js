/**
 * Lighthouse SEO Audit Runner with Preview Server
 * 
 * This script:
 * 1. Starts a preview server for the built application
 * 2. Runs a Lighthouse SEO audit
 * 3. Generates a report with the score
 * 4. Stops the server
 * 
 * Target: 95+ SEO score
 */

const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let previewServer = null;

async function startPreviewServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting preview server...\n');
    
    previewServer = spawn('npm', ['run', 'preview'], {
      cwd: __dirname,
      shell: true,
      stdio: 'pipe'
    });

    let serverReady = false;
    let serverUrl = null;

    const checkForUrl = (output) => {
      if (serverReady) return;
      
      // Strip ANSI codes and special characters
      const cleanOutput = output.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').replace(/\r/g, '');
      
      // Look for localhost:PORT pattern
      const match = cleanOutput.match(/(http:\/\/localhost:\d+)/);
      if (match && cleanOutput.includes('Local')) {
        serverUrl = match[1];
        serverReady = true;
        console.log(`\n✅ Server detected at ${serverUrl}\n`);
        // Wait longer for server and React app to be fully ready
        setTimeout(() => resolve(serverUrl), 5000);
      }
    };

    previewServer.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);
      checkForUrl(output);
    });

    previewServer.stderr.on('data', (data) => {
      const output = data.toString();
      process.stderr.write(output);
      checkForUrl(output);
    });

    previewServer.on('error', (error) => {
      reject(error);
    });

    // Timeout after 45 seconds
    setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Preview server failed to start within 45 seconds'));
      }
    }, 45000);
  });
}

function stopPreviewServer() {
  if (previewServer) {
    console.log('\n🛑 Stopping preview server...\n');
    previewServer.kill();
  }
}

async function runLighthouseSEOAudit(url) {
  console.log(`🔍 Running Lighthouse SEO audit on ${url}...\n`);

  let chrome;
  try {
    // Launch Chrome with more permissive flags
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--disable-web-security'
      ],
      logLevel: 'error'
    });

    const options = {
      logLevel: 'error',
      output: ['html', 'json'],
      onlyCategories: ['seo'],
      port: chrome.port,
      // Add more time for page load
      maxWaitForLoad: 60000,
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
    };

    const runnerResult = await lighthouse(url, options);

    // Extract results
    const { lhr, report } = runnerResult;
    const seoScore = lhr.categories.seo.score * 100;

    // Save reports
    const htmlReport = report[0];
    const jsonReport = report[1];

    fs.writeFileSync(
      path.join(__dirname, 'lighthouse-seo-report.html'),
      htmlReport
    );
    fs.writeFileSync(
      path.join(__dirname, 'lighthouse-seo-report.json'),
      jsonReport
    );

    // Print results
    console.log('✅ Lighthouse SEO Audit Complete!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 SEO Score: ${seoScore.toFixed(1)}/100`);
    console.log(`🎯 Target Score: 95/100`);
    console.log('═══════════════════════════════════════════════════════════');
    
    if (seoScore >= 95) {
      console.log('✅ PASSED: SEO score meets the target!');
    } else {
      console.log(`❌ FAILED: SEO score is below target (${(95 - seoScore).toFixed(1)} points short)`);
    }

    console.log(`\n📄 Reports saved:`);
    console.log(`   - lighthouse-seo-report.html`);
    console.log(`   - lighthouse-seo-report.json`);

    // Print audit details
    console.log('\n📋 SEO Audit Details:');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const audits = lhr.categories.seo.auditRefs;
    const failedAudits = audits.filter(audit => {
      const auditResult = lhr.audits[audit.id];
      return auditResult.score !== null && auditResult.score < 1;
    });

    if (failedAudits.length > 0) {
      console.log(`⚠️  ${failedAudits.length} SEO issues found:\n`);
      failedAudits.forEach((audit, index) => {
        const auditResult = lhr.audits[audit.id];
        console.log(`${index + 1}. ${auditResult.title}`);
        console.log(`   Score: ${(auditResult.score * 100).toFixed(0)}/100`);
        if (auditResult.description) {
          const desc = auditResult.description.replace(/\[.*?\]\(.*?\)/g, '');
          console.log(`   ${desc.substring(0, 150)}${desc.length > 150 ? '...' : ''}`);
        }
        console.log('');
      });
    } else {
      console.log('✅ No SEO issues found!');
    }

    // Print passing audits summary
    const passingAudits = audits.filter(audit => {
      const auditResult = lhr.audits[audit.id];
      return auditResult.score === 1;
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ ${passingAudits.length} SEO checks passed:\n`);
    passingAudits.forEach(audit => {
      const auditResult = lhr.audits[audit.id];
      console.log(`   ✓ ${auditResult.title}`);
    });
    console.log('═══════════════════════════════════════════════════════════\n');

    return seoScore;
  } finally {
    // Stop Chrome with error handling
    if (chrome) {
      try {
        await chrome.kill();
      } catch (error) {
        // Ignore cleanup errors
        console.log('Note: Chrome cleanup had minor issues (can be ignored)');
      }
    }
  }
}

// Main execution
async function main() {
  try {
    // Start preview server
    const serverUrl = await startPreviewServer();
    
    console.log(`\n✅ Server ready at ${serverUrl}\n`);
    
    // Run SEO audit
    const score = await runLighthouseSEOAudit(serverUrl);
    
    // Stop server
    stopPreviewServer();
    
    // Exit with appropriate code
    process.exit(score >= 95 ? 0 : 1);
  } catch (error) {
    console.error('❌ Error running Lighthouse SEO audit:', error);
    stopPreviewServer();
    process.exit(1);
  }
}

main();
