/**
 * Compression Test Script
 * Tests gzip/brotli compression for Careerak backend
 * 
 * Usage: node backend/test-compression.js
 */

const http = require('http');
const zlib = require('zlib');

// Test configuration
const TEST_URL = process.env.TEST_URL || 'http://localhost:5000';
const ENDPOINTS = [
  '/health',
  '/api/users',
  '/api/jobs',
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Test compression for a single endpoint
 */
async function testEndpoint(endpoint, encoding) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, TEST_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Accept-Encoding': encoding,
        'User-Agent': 'Compression-Test/1.0',
      },
    };

    const req = http.request(options, (res) => {
      let data = [];
      let uncompressedSize = 0;
      let compressedSize = 0;

      res.on('data', (chunk) => {
        data.push(chunk);
        compressedSize += chunk.length;
      });

      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const contentEncoding = res.headers['content-encoding'];
        
        // Decompress if needed
        let uncompressedData = buffer;
        if (contentEncoding === 'gzip') {
          try {
            uncompressedData = zlib.gunzipSync(buffer);
          } catch (err) {
            console.error(`${colors.red}✗ Failed to decompress gzip${colors.reset}`);
          }
        } else if (contentEncoding === 'br') {
          try {
            uncompressedData = zlib.brotliDecompressSync(buffer);
          } catch (err) {
            console.error(`${colors.red}✗ Failed to decompress brotli${colors.reset}`);
          }
        }
        
        uncompressedSize = uncompressedData.length;
        
        const compressionRatio = compressedSize > 0 
          ? ((1 - compressedSize / uncompressedSize) * 100).toFixed(2)
          : 0;

        resolve({
          endpoint,
          encoding,
          statusCode: res.statusCode,
          contentEncoding: contentEncoding || 'none',
          compressedSize,
          uncompressedSize,
          compressionRatio,
          headers: res.headers,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Print test results
 */
function printResults(results) {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Compression Test Results${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  results.forEach((result) => {
    const statusColor = result.statusCode === 200 ? colors.green : colors.red;
    const compressionColor = result.compressionRatio > 50 ? colors.green : 
                            result.compressionRatio > 30 ? colors.yellow : colors.red;

    console.log(`${colors.blue}Endpoint:${colors.reset} ${result.endpoint}`);
    console.log(`${colors.blue}Encoding:${colors.reset} ${result.encoding}`);
    console.log(`${colors.blue}Status:${colors.reset} ${statusColor}${result.statusCode}${colors.reset}`);
    console.log(`${colors.blue}Content-Encoding:${colors.reset} ${result.contentEncoding}`);
    console.log(`${colors.blue}Compressed Size:${colors.reset} ${formatBytes(result.compressedSize)}`);
    console.log(`${colors.blue}Uncompressed Size:${colors.reset} ${formatBytes(result.uncompressedSize)}`);
    console.log(`${colors.blue}Compression Ratio:${colors.reset} ${compressionColor}${result.compressionRatio}%${colors.reset}`);
    
    if (result.contentEncoding === 'none' && result.encoding !== 'identity') {
      console.log(`${colors.yellow}⚠ Warning: Compression not applied${colors.reset}`);
    } else if (result.contentEncoding !== 'none') {
      console.log(`${colors.green}✓ Compression working${colors.reset}`);
    }
    
    console.log('');
  });

  // Summary
  const avgCompression = results.reduce((sum, r) => sum + parseFloat(r.compressionRatio), 0) / results.length;
  const totalCompressed = results.reduce((sum, r) => sum + r.compressedSize, 0);
  const totalUncompressed = results.reduce((sum, r) => sum + r.uncompressedSize, 0);
  const totalSavings = totalUncompressed - totalCompressed;

  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Summary${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);
  console.log(`${colors.blue}Average Compression:${colors.reset} ${avgCompression.toFixed(2)}%`);
  console.log(`${colors.blue}Total Compressed:${colors.reset} ${formatBytes(totalCompressed)}`);
  console.log(`${colors.blue}Total Uncompressed:${colors.reset} ${formatBytes(totalUncompressed)}`);
  console.log(`${colors.blue}Total Savings:${colors.reset} ${colors.green}${formatBytes(totalSavings)}${colors.reset}`);
  console.log('');
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`${colors.cyan}Starting compression tests...${colors.reset}`);
  console.log(`${colors.blue}Test URL:${colors.reset} ${TEST_URL}\n`);

  const results = [];

  // Test each endpoint with different encodings
  for (const endpoint of ENDPOINTS) {
    for (const encoding of ['gzip', 'br', 'identity']) {
      try {
        console.log(`Testing ${endpoint} with ${encoding}...`);
        const result = await testEndpoint(endpoint, encoding);
        results.push(result);
      } catch (err) {
        console.error(`${colors.red}✗ Error testing ${endpoint} with ${encoding}:${colors.reset}`, err.message);
      }
    }
  }

  printResults(results);
}

// Run tests
runTests().catch((err) => {
  console.error(`${colors.red}✗ Test failed:${colors.reset}`, err);
  process.exit(1);
});
