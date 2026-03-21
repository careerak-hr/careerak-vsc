/**
 * Simplified Lighthouse SEO Audit Runner
 * 
 * This script runs a Lighthouse SEO audit on the built application
 * using a simple HTTP server.
 * 
 * Target: 95+ SEO score
 */

const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');

let server = null;

async function startSimpleServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting simple HTTP server...\n');
    
    const PORT = 5000;
    
    server = http.createServer((request, response) => {
      return handler(request, response, {
        public: path.join(__dirname, 'build'),
        cleanUrls: true,
        rewrites: [
          { source: '**', destination: '/index.html' }
        ]
      });
    });

    server.listen(PORT, () => {
      const url = `http://localhost:${PORT}`;
      console.log(`✅ Server started at ${url}\n`);
      // Wait for server to be ready
      setTimeout(() => resolve(url), 2000);
    });

    server.on('error', (error) => {
      reject(error);
    });
  });
}

function stopServer() {
  if (server) {
    console.log('\n🛑 Stopping server...\n');
    server.close();
  }
}

async function runLighthouseSEOAudit(url) {
  console.log(`🔍 Running Lighthouse SEO audit on ${url}...\n`);

  let chrome;
  try {
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox'
      ],
      logLevel: 'error'
    });

    const options = {
      logLevel: 'info',
      output: ['html', 'json'],
      onlyCategories: ['seo'],
      port: chrome.port,
      maxWaitForLoad: 60000,
      maxWaitForFcp: 60000,
      pauseAfterFcpMs: 1000,
      pauseAfterLoadMs: 1000,
      networkQuietThresholdMs: 1000,
      cpuQuietThresholdMs: 1000,
    };

    console.log('Running Lighthouse audit (this may take 30-60 seconds)...\n');
    const runnerResult = await lighthouse(url, options);

    // Extract results
    const { lhr, report } = runnerResult;
    
    // Check for runtime errors
    if (lhr.runtimeError) {
      console.error('❌ Runtime Error:', lhr.runtimeError.message);
      console.error('Error Code:', lhr.runtimeError.code);
      throw new Error(`Lighthouse runtime error: ${lhr.runtimeError.code}`);
    }
    
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
    // Start simple server
    const serverUrl = await startSimpleServer();
    
    // Run SEO audit
    const score = await runLighthouseSEOAudit(serverUrl);
    
    // Stop server
    stopServer();
    
    // Exit with appropriate code
    process.exit(score >= 95 ? 0 : 1);
  } catch (error) {
    console.error('❌ Error running Lighthouse SEO audit:', error);
    stopServer();
    process.exit(1);
  }
}

main();
