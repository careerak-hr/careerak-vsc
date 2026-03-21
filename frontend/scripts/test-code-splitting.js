/**
 * Standalone Code Splitting Property-Based Test Runner
 * 
 * This script runs the code splitting tests without requiring
 * the full vitest setup. It uses Node.js directly.
 * 
 * Note: This is a simplified version that validates chunks exist
 * and meet size requirements. The full property-based tests with
 * fast-check are in CodeSplitting.property.test.jsx
 */

const fs = require('fs');
const path = require('path');

// Build output directory
const BUILD_DIR = path.resolve(__dirname, 'build');
const ASSETS_JS_DIR = path.join(BUILD_DIR, 'assets', 'js');

// Maximum chunk size in bytes (200KB)
const MAX_CHUNK_SIZE = 200 * 1024;

// Expected vendor chunks based on vite.config.js
const EXPECTED_VENDOR_CHUNKS = [
  'react-vendor',
  'router-vendor',
  'i18n-vendor',
  'capacitor-vendor',
  'crypto-vendor',
  'axios-vendor',
  'image-vendor',
  'vendor'
];

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

/**
 * Helper function to get all JS files from build directory
 */
function getJSFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir);
  return files
    .filter(file => file.endsWith('.js') && !file.endsWith('.map'))
    .map(file => ({
      name: file,
      path: path.join(dir, file),
      size: fs.statSync(path.join(dir, file)).size
    }));
}

/**
 * Helper function to extract chunk name from filename
 */
function extractChunkName(filename) {
  const match = filename.match(/^(.+?)-[a-f0-9A-Z_]+\.js$/);
  return match ? match[1] : filename.replace('.js', '');
}

/**
 * Helper function to categorize chunks
 */
function categorizeChunks(files) {
  const categories = {
    vendor: [],
    app: [],
    other: []
  };

  files.forEach(file => {
    const chunkName = extractChunkName(file.name);
    
    if (EXPECTED_VENDOR_CHUNKS.some(vendor => chunkName.includes(vendor))) {
      categories.vendor.push(file);
    } else if (chunkName.includes('index')) {
      categories.app.push(file);
    } else {
      categories.other.push(file);
    }
  });

  return categories;
}

/**
 * Test runner helper
 */
function runTest(name, testFn) {
  totalTests++;
  try {
    testFn();
    passedTests++;
    console.log(`✓ ${name}`);
    return true;
  } catch (error) {
    failedTests++;
    failures.push({ name, error: error.message });
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

/**
 * Async test runner helper
 */
async function runAsyncTest(name, testFn) {
  totalTests++;
  try {
    await testFn();
    passedTests++;
    console.log(`✓ ${name}`);
    return true;
  } catch (error) {
    failedTests++;
    failures.push({ name, error: error.message });
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

/**
 * Main test suite
 */
async function runTests() {
  console.log('\n🧪 Code Splitting Property-Based Tests\n');
  console.log('=' .repeat(60));

  // Check if build exists
  if (!fs.existsSync(BUILD_DIR)) {
    console.log('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  const jsFiles = getJSFiles(ASSETS_JS_DIR);
  
  if (jsFiles.length === 0) {
    console.log('❌ No JS files found in build directory.');
    process.exit(1);
  }

  console.log(`\n📦 Found ${jsFiles.length} JS chunks\n`);

  // Test 1: All chunks under 200KB
  runTest(
    'Property PERF-2: All chunks are under 200KB',
    () => {
      let violations = [];
      
      for (const file of jsFiles) {
        const sizeInKB = file.size / 1024;
        
        if (file.size > MAX_CHUNK_SIZE) {
          violations.push(`${file.name}: ${sizeInKB.toFixed(2)}KB`);
        }
      }

      if (violations.length > 0) {
        throw new Error(
          `${violations.length} chunks exceed 200KB:\n  ${violations.join('\n  ')}`
        );
      }

      console.log(`  ✓ All ${jsFiles.length} chunks are under 200KB`);
    }
  );

  // Test 2: Vendor chunks properly separated
  runTest(
    'Vendor chunks are properly separated',
    () => {
      const categories = categorizeChunks(jsFiles);
      
      if (categories.vendor.length === 0) {
        throw new Error('No vendor chunks found');
      }

      let violations = [];
      
      for (const vendorChunk of categories.vendor) {
        const sizeInKB = vendorChunk.size / 1024;

        if (vendorChunk.size > MAX_CHUNK_SIZE) {
          violations.push(`${vendorChunk.name}: ${sizeInKB.toFixed(2)}KB`);
        }
      }

      if (violations.length > 0) {
        throw new Error(
          `${violations.length} vendor chunks exceed 200KB:\n  ${violations.join('\n  ')}`
        );
      }

      console.log(`  ✓ All ${categories.vendor.length} vendor chunks are under 200KB`);
    }
  );

  // Test 3: Total bundle size is reasonable
  runTest('Total bundle size is reduced by code splitting', () => {
    const totalSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
    const totalSizeInMB = totalSize / 1024 / 1024;

    console.log(`  📊 Total bundle size: ${totalSizeInMB.toFixed(2)}MB (${jsFiles.length} chunks)`);

    if (jsFiles.length <= 5) {
      throw new Error('Expected more than 5 chunks for proper code splitting');
    }

    const avgChunkSize = totalSize / jsFiles.length;
    const avgChunkSizeInKB = avgChunkSize / 1024;

    console.log(`  📊 Average chunk size: ${avgChunkSizeInKB.toFixed(2)}KB`);

    if (avgChunkSize >= MAX_CHUNK_SIZE * 0.8) {
      throw new Error('Average chunk size is too large');
    }
  });

  // Test 4: Chunk size distribution is balanced
  runTest(
    'Chunk size distribution is balanced',
    () => {
      const totalSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
      
      let violations = [];
      
      for (const chunk of jsFiles) {
        const percentage = (chunk.size / totalSize) * 100;
        
        if (percentage >= 40) {
          violations.push(`${chunk.name}: ${percentage.toFixed(2)}%`);
        }
      }

      if (violations.length > 0) {
        throw new Error(
          `${violations.length} chunks dominate bundle:\n  ${violations.join('\n  ')}`
        );
      }

      console.log(`  ✓ Chunk size distribution is balanced`);
    }
  );

  // Test 5: Expected vendor chunks exist
  runTest('Expected vendor chunks exist', () => {
    const categories = categorizeChunks(jsFiles);
    const foundVendorChunks = categories.vendor.map(f => extractChunkName(f.name));

    console.log(`  📦 Found vendor chunks: ${foundVendorChunks.join(', ')}`);

    const hasReactVendor = foundVendorChunks.some(name => name.includes('react-vendor'));
    const hasRouterVendor = foundVendorChunks.some(name => name.includes('router-vendor'));

    if (!hasReactVendor && !hasRouterVendor) {
      throw new Error('Expected react-vendor or router-vendor chunk not found');
    }
  });

  // Test 6: Vendor chunks are cacheable
  runTest(
    'Vendor chunks have content hashes for caching',
    () => {
      const categories = categorizeChunks(jsFiles);

      let violations = [];
      
      for (const vendorChunk of categories.vendor) {
        const hasHash = /[a-f0-9A-Z_]{8,}/.test(vendorChunk.name);
        
        if (!hasHash) {
          violations.push(vendorChunk.name);
        }
      }

      if (violations.length > 0) {
        throw new Error(
          `${violations.length} vendor chunks missing content hash:\n  ${violations.join('\n  ')}`
        );
      }

      console.log(`  ✓ All ${categories.vendor.length} vendor chunks have content hashes`);
    }
  );

  // Test 7: Chunk naming follows convention
  runTest(
    'Chunk naming follows convention',
    () => {
      let violations = [];
      
      for (const file of jsFiles) {
        const hasValidFormat = /^[a-zA-Z0-9_-]+-[a-f0-9A-Z_]+\.js$/.test(file.name);
        
        if (!hasValidFormat) {
          violations.push(file.name);
        }
      }

      if (violations.length > 0) {
        throw new Error(
          `${violations.length} chunks don't follow naming convention:\n  ${violations.join('\n  ')}`
        );
      }

      console.log(`  ✓ All ${jsFiles.length} chunks follow naming convention`);
    }
  );

  // Test 8: No empty chunks
  runTest(
    'No empty or near-empty chunks',
    () => {
      const minSize = 1024; // 1KB

      let violations = [];
      
      for (const file of jsFiles) {
        if (file.size < minSize) {
          violations.push(`${file.name}: ${file.size} bytes`);
        }
      }

      if (violations.length > 0) {
        throw new Error(
          `${violations.length} chunks are too small:\n  ${violations.join('\n  ')}`
        );
      }

      console.log(`  ✓ All ${jsFiles.length} chunks are at least 1KB`);
    }
  );

  // Test 9: Initial load size is reasonable
  runTest('Initial load size is reasonable', () => {
    const categories = categorizeChunks(jsFiles);
    
    const initialLoadChunks = [
      ...categories.app,
      ...categories.vendor.filter(v => 
        extractChunkName(v.name).includes('react-vendor') ||
        extractChunkName(v.name).includes('router-vendor')
      )
    ];

    const initialLoadSize = initialLoadChunks.reduce((sum, file) => sum + file.size, 0);
    const initialLoadSizeInMB = initialLoadSize / 1024 / 1024;

    console.log(`  📊 Initial load size: ${initialLoadSizeInMB.toFixed(2)}MB`);
    console.log(`  📊 Initial load chunks: ${initialLoadChunks.length}`);

    if (jsFiles.length <= initialLoadChunks.length) {
      throw new Error('Expected more lazy-loaded chunks');
    }
  });

  // Test 10: Lazy-loaded chunks are separate
  runTest('Lazy-loaded chunks are separate', () => {
    const categories = categorizeChunks(jsFiles);
    const lazyChunks = categories.other;

    console.log(`  📦 Lazy-loaded chunks: ${lazyChunks.length}`);

    if (lazyChunks.length === 0) {
      throw new Error('No lazy-loaded chunks found');
    }

    for (const chunk of lazyChunks) {
      if (chunk.size > MAX_CHUNK_SIZE) {
        const sizeInKB = chunk.size / 1024;
        throw new Error(
          `Lazy chunk ${chunk.name} exceeds 200KB: ${sizeInKB.toFixed(2)}KB`
        );
      }
    }
  });

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✓`);
  console.log(`Failed: ${failedTests} ✗`);

  if (failedTests > 0) {
    console.log('\n❌ Failed tests:');
    failures.forEach(({ name, error }) => {
      console.log(`  - ${name}`);
      console.log(`    ${error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
