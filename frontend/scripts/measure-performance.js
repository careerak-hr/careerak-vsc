#!/usr/bin/env node

/**
 * Performance Measurement Script
 * 
 * يقيس أداء الصفحة ويتحقق من تحقيق الأهداف
 * الهدف: تحميل < 2 ثانية
 * 
 * الاستخدام:
 * node scripts/measure-performance.js [url]
 * 
 * مثال:
 * node scripts/measure-performance.js http://localhost:4173
 */

const puppeteer = require('puppeteer');
const chalk = require('chalk');

// الأهداف المطلوبة
const TARGETS = {
  loadTime: 2000,      // < 2 seconds
  fcp: 1800,           // < 1.8s
  lcp: 2500,           // < 2.5s
  cls: 0.1,            // < 0.1
  tti: 3800,           // < 3.8s
  fid: 100             // < 100ms
};

/**
 * قياس أداء الصفحة
 */
async function measurePerformance(url) {
  console.log(chalk.blue('\n🔍 Starting performance measurement...\n'));
  console.log(chalk.gray(`URL: ${url}\n`));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // تعيين viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // تفعيل Performance API
    await page.evaluateOnNewDocument(() => {
      window.performanceMetrics = {};
    });

    // بدء القياس
    const startTime = Date.now();

    // تحميل الصفحة
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // جمع المقاييس
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      return {
        // Navigation Timing
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        domInteractive: perfData.domInteractive - perfData.fetchStart,
        loadComplete: perfData.loadEventEnd - perfData.fetchStart,
        
        // Paint Timing
        fcp: fcp ? fcp.startTime : null,
        
        // Resource Timing
        resourceCount: performance.getEntriesByType('resource').length,
        
        // Memory (if available)
        memory: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null
      };
    });

    // جمع Web Vitals من PerformanceObserver
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        let observersCompleted = 0;
        const totalObservers = 2;

        const checkComplete = () => {
          observersCompleted++;
          if (observersCompleted === totalObservers) {
            resolve(vitals);
          }
        };

        // LCP Observer
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
            lcpObserver.disconnect();
            checkComplete();
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Timeout بعد 5 ثواني
          setTimeout(() => {
            lcpObserver.disconnect();
            checkComplete();
          }, 5000);
        } catch (e) {
          checkComplete();
        }

        // CLS Observer
        try {
          let clsScore = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsScore += entry.value;
              }
            }
            vitals.cls = clsScore;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          
          // Timeout بعد 5 ثواني
          setTimeout(() => {
            clsObserver.disconnect();
            checkComplete();
          }, 5000);
        } catch (e) {
          checkComplete();
        }
      });
    });

    // دمج المقاييس
    const allMetrics = {
      loadTime,
      fcp: metrics.fcp,
      lcp: webVitals.lcp || null,
      cls: webVitals.cls || 0,
      tti: metrics.domInteractive,
      domContentLoaded: metrics.domContentLoaded,
      resourceCount: metrics.resourceCount,
      memory: metrics.memory
    };

    // طباعة النتائج
    printResults(allMetrics);

    // التحقق من الأهداف
    const passed = checkTargets(allMetrics);

    await browser.close();

    return passed ? 0 : 1;

  } catch (error) {
    console.error(chalk.red('\n❌ Error measuring performance:'), error.message);
    await browser.close();
    return 1;
  }
}

/**
 * طباعة النتائج
 */
function printResults(metrics) {
  console.log(chalk.blue('═══════════════════════════════════════════════════════════'));
  console.log(chalk.blue('                    Performance Metrics                     '));
  console.log(chalk.blue('═══════════════════════════════════════════════════════════\n'));

  // Load Time
  const loadTimeStatus = metrics.loadTime <= TARGETS.loadTime ? '✅' : '❌';
  const loadTimeColor = metrics.loadTime <= TARGETS.loadTime ? chalk.green : chalk.red;
  console.log(`${loadTimeStatus} Total Load Time: ${loadTimeColor(metrics.loadTime + 'ms')} (target: ${TARGETS.loadTime}ms)`);

  // FCP
  if (metrics.fcp) {
    const fcpStatus = metrics.fcp <= TARGETS.fcp ? '✅' : '❌';
    const fcpColor = metrics.fcp <= TARGETS.fcp ? chalk.green : chalk.red;
    console.log(`${fcpStatus} First Contentful Paint (FCP): ${fcpColor(metrics.fcp.toFixed(2) + 'ms')} (target: ${TARGETS.fcp}ms)`);
  }

  // LCP
  if (metrics.lcp) {
    const lcpStatus = metrics.lcp <= TARGETS.lcp ? '✅' : '❌';
    const lcpColor = metrics.lcp <= TARGETS.lcp ? chalk.green : chalk.red;
    console.log(`${lcpStatus} Largest Contentful Paint (LCP): ${lcpColor(metrics.lcp.toFixed(2) + 'ms')} (target: ${TARGETS.lcp}ms)`);
  }

  // CLS
  const clsStatus = metrics.cls <= TARGETS.cls ? '✅' : '❌';
  const clsColor = metrics.cls <= TARGETS.cls ? chalk.green : chalk.red;
  console.log(`${clsStatus} Cumulative Layout Shift (CLS): ${clsColor(metrics.cls.toFixed(4))} (target: ${TARGETS.cls})`);

  // TTI
  const ttiStatus = metrics.tti <= TARGETS.tti ? '✅' : '❌';
  const ttiColor = metrics.tti <= TARGETS.tti ? chalk.green : chalk.red;
  console.log(`${ttiStatus} Time to Interactive (TTI): ${ttiColor(metrics.tti + 'ms')} (target: ${TARGETS.tti}ms)`);

  // معلومات إضافية
  console.log(chalk.blue('\n───────────────────────────────────────────────────────────'));
  console.log(chalk.blue('                   Additional Information                   '));
  console.log(chalk.blue('───────────────────────────────────────────────────────────\n'));

  console.log(`📦 Resources Loaded: ${chalk.yellow(metrics.resourceCount)}`);
  console.log(`⏱️  DOM Content Loaded: ${chalk.yellow(metrics.domContentLoaded.toFixed(2) + 'ms')}`);

  if (metrics.memory) {
    const usedMB = (metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    const totalMB = (metrics.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
    console.log(`💾 Memory Used: ${chalk.yellow(usedMB + 'MB')} / ${chalk.yellow(totalMB + 'MB')}`);
  }

  console.log(chalk.blue('\n═══════════════════════════════════════════════════════════\n'));
}

/**
 * التحقق من الأهداف
 */
function checkTargets(metrics) {
  const checks = [
    { name: 'Load Time', value: metrics.loadTime, target: TARGETS.loadTime, unit: 'ms' },
    { name: 'FCP', value: metrics.fcp, target: TARGETS.fcp, unit: 'ms' },
    { name: 'LCP', value: metrics.lcp, target: TARGETS.lcp, unit: 'ms' },
    { name: 'CLS', value: metrics.cls, target: TARGETS.cls, unit: '' },
    { name: 'TTI', value: metrics.tti, target: TARGETS.tti, unit: 'ms' }
  ];

  let passed = 0;
  let failed = 0;

  checks.forEach(check => {
    if (check.value !== null && check.value !== undefined) {
      if (check.value <= check.target) {
        passed++;
      } else {
        failed++;
      }
    }
  });

  console.log(chalk.blue('═══════════════════════════════════════════════════════════'));
  console.log(chalk.blue('                        Summary                             '));
  console.log(chalk.blue('═══════════════════════════════════════════════════════════\n'));

  console.log(`${chalk.green('✓ Passed:')}   ${passed}`);
  console.log(`${chalk.red('✗ Failed:')}   ${failed}`);

  console.log(chalk.blue('\n═══════════════════════════════════════════════════════════\n'));

  if (failed === 0) {
    console.log(chalk.green.bold('✅ All performance targets met!\n'));
    return true;
  } else {
    console.log(chalk.red.bold('❌ Some performance targets not met. Please optimize.\n'));
    return false;
  }
}

// تشغيل السكريبت
const url = process.argv[2] || 'http://localhost:4173';

measurePerformance(url)
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
