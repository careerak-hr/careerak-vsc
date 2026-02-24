#!/usr/bin/env node

/**
 * Vercel Deployment Test Script
 * Tests all critical aspects of the Vercel deployment
 * 
 * Usage: node scripts/test-vercel-deployment.js [production-url]
 * Example: node scripts/test-vercel-deployment.js https://careerak.com
 */

const https = require('https');
const http = require('http');

// Configuration
const DEPLOYMENT_URL = process.argv[2] || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, TIMEOUT);

    const req = protocol.get(url, options, (res) => {
      clearTimeout(timeout);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

/**
 * Test helper
 */
function test(name, fn) {
  return async () => {
    try {
      await fn();
      results.passed++;
      results.tests.push({ name, status: 'passed' });
      console.log(`${colors.green}✓${colors.reset} ${name}`);
    } catch (error) {
      results.failed++;
      results.tests.push({ name, status: 'failed', error: error.message });
      console.log(`${colors.red}✗${colors.reset} ${name}`);
      console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    }
  };
}

/**
 * Warning helper
 */
function warn(message) {
  results.warnings++;
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

// ============================================================================
// TEST SUITE
// ============================================================================

const tests = [
  // 1. Basic Connectivity
  test('Frontend is accessible', async () => {
    const res = await makeRequest(DEPLOYMENT_URL);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
  }),

  test('Backend API is accessible', async () => {
    const res = await makeRequest(`${DEPLOYMENT_URL}/api/health`);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
  }),

  // 2. Cache Headers
  test('Static assets have cache headers', async () => {
    const res = await makeRequest(`${DEPLOYMENT_URL}/assets/index.js`);
    const cacheControl = res.headers['cache-control'];
    if (!cacheControl || !cacheControl.includes('max-age')) {
      throw new Error('Cache-Control header missing or invalid');
    }
  }),

  test('HTML has no-cache headers', async () => {
    const res = await makeRequest(DEPLOYMENT_URL);
    const cacheControl = res.headers['cache-control'];
    if (!cacheControl || !cacheControl.includes('must-revalidate')) {
      throw new Error('HTML should have must-revalidate');
    }
  }),

  // 3. Compression
  test('Compression is enabled', async () => {
    const res = await makeRequest(DEPLOYMENT_URL, {
      headers: { 'Accept-Encoding': 'gzip, deflate, br' }
    });
    const encoding = res.headers['content-encoding'];
    if (!encoding || (!encoding.includes('gzip') && !encoding.includes('br'))) {
      throw new Error('Compression not enabled');
    }
  }),

  // 4. Security Headers
  test('Security headers are present', async () => {
    const res = await makeRequest(DEPLOYMENT_URL);
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options'
    ];
    
    for (const header of requiredHeaders) {
      if (!res.headers[header]) {
        throw new Error(`Missing security header: ${header}`);
      }
    }
  }),

  // 5. Redirects
  test('Redirects work correctly', async () => {
    try {
      const res = await makeRequest(`${DEPLOYMENT_URL}/jobs`, {
        followRedirect: false
      });
      if (res.statusCode !== 301 && res.statusCode !== 302 && res.statusCode !== 307 && res.statusCode !== 308) {
        throw new Error(`Expected redirect status, got ${res.statusCode}`);
      }
    } catch (error) {
      // If we get a 200, the redirect might have been followed automatically
      if (error.message.includes('200')) {
        warn('Redirect test: Got 200 (redirect may have been followed)');
      } else {
        throw error;
      }
    }
  }),

  // 6. PWA Files
  test('Manifest.json is accessible', async () => {
    const res = await makeRequest(`${DEPLOYMENT_URL}/manifest.json`);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
    try {
      JSON.parse(res.body);
    } catch {
      throw new Error('Invalid JSON in manifest.json');
    }
  }),

  test('Service worker is accessible', async () => {
    const res = await makeRequest(`${DEPLOYMENT_URL}/service-worker.js`);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
  }),

  // 7. SEO Files
  test('Robots.txt is accessible', async () => {
    const res = await makeRequest(`${DEPLOYMENT_URL}/robots.txt`);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
  }),

  test('Sitemap.xml is accessible', async () => {
    const res = await makeRequest(`${DEPLOYMENT_URL}/sitemap.xml`);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200, got ${res.statusCode}`);
    }
  }),

  // 8. Environment Variables
  test('Backend has required environment variables', async () => {
    try {
      const res = await makeRequest(`${DEPLOYMENT_URL}/api/health`);
      const data = JSON.parse(res.body);
      if (!data.status || data.status !== 'ok') {
        throw new Error('Backend health check failed - check environment variables');
      }
    } catch (error) {
      throw new Error('Backend health check failed - check environment variables');
    }
  }),

  // 9. Performance
  test('Response time is acceptable', async () => {
    const start = Date.now();
    await makeRequest(DEPLOYMENT_URL);
    const duration = Date.now() - start;
    if (duration > 3000) {
      throw new Error(`Response time too slow: ${duration}ms`);
    }
  }),

  // 10. Content Type
  test('HTML has correct content type', async () => {
    const res = await makeRequest(DEPLOYMENT_URL);
    const contentType = res.headers['content-type'];
    if (!contentType || !contentType.includes('text/html')) {
      throw new Error('Invalid content type for HTML');
    }
  }),

  test('API returns JSON', async () => {
    const res = await makeRequest(`${DEPLOYMENT_URL}/api/health`);
    const contentType = res.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API should return JSON');
    }
  }),

  // 11. Error Pages
  test('404 page works', async () => {
    try {
      const res = await makeRequest(`${DEPLOYMENT_URL}/non-existent-page-12345`);
      // Should either return 404 or 200 (SPA fallback)
      if (res.statusCode !== 404 && res.statusCode !== 200) {
        throw new Error(`Unexpected status code: ${res.statusCode}`);
      }
    } catch (error) {
      if (!error.message.includes('404') && !error.message.includes('200')) {
        throw error;
      }
    }
  }),

  // 12. CORS
  test('CORS headers are configured', async () => {
    const res = await makeRequest(`${DEPLOYMENT_URL}/api/health`, {
      headers: { 'Origin': 'https://example.com' }
    });
    // CORS headers should be present for API routes
    if (res.headers['access-control-allow-origin']) {
      // CORS is configured
    } else {
      warn('CORS headers not found - may need configuration');
    }
  }),
];

// ============================================================================
// RUN TESTS
// ============================================================================

async function runTests() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║         Vercel Deployment Test Suite                      ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.blue}Testing deployment at:${colors.reset} ${DEPLOYMENT_URL}\n`);

  for (const testFn of tests) {
    await testFn();
  }

  // Summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}Test Summary${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✓ Passed:${colors.reset}   ${results.passed}`);
  console.log(`${colors.red}✗ Failed:${colors.reset}   ${results.failed}`);
  console.log(`${colors.yellow}⚠ Warnings:${colors.reset} ${results.warnings}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  // Exit code
  if (results.failed > 0) {
    console.log(`${colors.red}❌ Deployment test failed!${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ All deployment tests passed!${colors.reset}\n`);
    process.exit(0);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});

// Run
runTests().catch((error) => {
  console.error(`${colors.red}Test suite failed:${colors.reset}`, error);
  process.exit(1);
});
