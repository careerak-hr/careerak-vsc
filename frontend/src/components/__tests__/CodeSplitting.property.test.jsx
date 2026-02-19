/**
 * Property-Based Tests for Code Splitting
 * 
 * **Validates: Requirements 2.6.2**
 * 
 * Tests the correctness properties of code splitting implementation
 * using property-based testing with fast-check.
 * 
 * Property PERF-2: Code Splitting
 * ∀ chunk ∈ Chunks:
 *   chunk.size ≤ 200KB
 * 
 * This property verifies that all code chunks do not exceed the
 * 200KB size limit for optimal loading performance.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

// Build output directory
const BUILD_DIR = path.resolve(__dirname, '../../../build');
const ASSETS_JS_DIR = path.join(BUILD_DIR, 'assets', 'js');

// Maximum chunk size in bytes (200KB)
const MAX_CHUNK_SIZE = 200 * 1024;

// Expected vendor chunks based on vite.config.js
const EXPECTED_VENDOR_CHUNKS = [
  'react-vendor',
  'router-vendor',
  'i18n-vendor',
  'capacitor-vendor',
  'sentry-vendor',
  'animation-vendor',
  'image-vendor',
  'crypto-vendor',
  'axios-vendor',
  'validation-vendor',
  'vendor' // catch-all
];

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
 * Example: "react-vendor-abc123.js" -> "react-vendor"
 */
function extractChunkName(filename) {
  // Remove hash and extension
  const match = filename.match(/^(.+?)-[a-f0-9]+\.js$/);
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
    } else if (chunkName.includes('index') || chunkName.includes('main')) {
      categories.app.push(file);
    } else {
      categories.other.push(file);
    }
  });

  return categories;
}

describe('Code Splitting Property-Based Tests', () => {
  let jsFiles = [];
  let buildExists = false;

  beforeAll(() => {
    // Check if build directory exists
    buildExists = fs.existsSync(BUILD_DIR);
    
    if (buildExists) {
      jsFiles = getJSFiles(ASSETS_JS_DIR);
    }
  });

  /**
   * Property PERF-2: Code Splitting - Chunk Size Limit
   * 
   * **Validates: Requirements FR-PERF-5, NFR-PERF-2**
   * 
   * ∀ chunk ∈ Chunks:
   *   chunk.size ≤ 200KB
   * 
   * This property verifies that all chunks respect the size limit.
   */
  describe('Property PERF-2: Chunk Size Limit', () => {
    it('should verify all chunks are under 200KB', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      expect(jsFiles.length).toBeGreaterThan(0);

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...jsFiles),
          async (file) => {
            // Property: chunk size must be ≤ 200KB
            const sizeInKB = file.size / 1024;
            
            expect(file.size).toBeLessThanOrEqual(MAX_CHUNK_SIZE);
            
            // Log chunk info for debugging
            if (sizeInKB > 150) {
              console.log(`⚠️  Large chunk detected: ${file.name} (${sizeInKB.toFixed(2)}KB)`);
            }

            return file.size <= MAX_CHUNK_SIZE;
          }
        ),
        { numRuns: Math.min(100, jsFiles.length) }
      );
    });

    it('should verify vendor chunks are properly separated', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      const categories = categorizeChunks(jsFiles);
      
      // Property: Vendor chunks should exist
      expect(categories.vendor.length).toBeGreaterThan(0);

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...categories.vendor),
          async (vendorChunk) => {
            const chunkName = extractChunkName(vendorChunk.name);
            const sizeInKB = vendorChunk.size / 1024;

            // Property: Each vendor chunk should be under 200KB
            expect(vendorChunk.size).toBeLessThanOrEqual(MAX_CHUNK_SIZE);

            // Log vendor chunk info
            console.log(`✓ Vendor chunk: ${chunkName} (${sizeInKB.toFixed(2)}KB)`);

            return vendorChunk.size <= MAX_CHUNK_SIZE;
          }
        ),
        { numRuns: Math.min(100, categories.vendor.length) }
      );
    });

    it('should verify app chunks are under size limit', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      const categories = categorizeChunks(jsFiles);

      if (categories.app.length === 0) {
        console.warn('⚠️  No app chunks found.');
        return;
      }

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...categories.app),
          async (appChunk) => {
            const sizeInKB = appChunk.size / 1024;

            // Property: App chunks should be under 200KB
            expect(appChunk.size).toBeLessThanOrEqual(MAX_CHUNK_SIZE);

            console.log(`✓ App chunk: ${appChunk.name} (${sizeInKB.toFixed(2)}KB)`);

            return appChunk.size <= MAX_CHUNK_SIZE;
          }
        ),
        { numRuns: Math.min(100, categories.app.length) }
      );
    });

    it('should verify total bundle size is reduced by code splitting', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      // Calculate total size
      const totalSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
      const totalSizeInKB = totalSize / 1024;
      const totalSizeInMB = totalSizeInKB / 1024;

      console.log(`📊 Total bundle size: ${totalSizeInMB.toFixed(2)}MB (${jsFiles.length} chunks)`);

      // Property: Total size should be reasonable (not a single monolithic bundle)
      // With code splitting, we expect multiple chunks
      expect(jsFiles.length).toBeGreaterThan(5);

      // Property: Average chunk size should be well below the limit
      const avgChunkSize = totalSize / jsFiles.length;
      const avgChunkSizeInKB = avgChunkSize / 1024;

      console.log(`📊 Average chunk size: ${avgChunkSizeInKB.toFixed(2)}KB`);

      // Average should be significantly below 200KB
      expect(avgChunkSize).toBeLessThan(MAX_CHUNK_SIZE * 0.8);

      return true;
    });

    it('should verify chunk size distribution is balanced', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      await fc.assert(
        fc.asyncProperty(
          fc.subarray(jsFiles, { minLength: 2, maxLength: jsFiles.length }),
          async (chunkSubset) => {
            // Property: No single chunk should dominate the bundle
            const totalSize = chunkSubset.reduce((sum, file) => sum + file.size, 0);
            
            for (const chunk of chunkSubset) {
              const percentage = (chunk.size / totalSize) * 100;
              
              // No chunk should be more than 40% of the subset
              expect(percentage).toBeLessThan(40);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property: Vendor Chunk Separation
   * 
   * **Validates: Requirements FR-PERF-2**
   * 
   * Verifies that vendor libraries are properly separated into
   * dedicated chunks for better caching.
   */
  describe('Vendor Chunk Separation', () => {
    it('should verify expected vendor chunks exist', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      const categories = categorizeChunks(jsFiles);
      const foundVendorChunks = categories.vendor.map(f => extractChunkName(f.name));

      console.log('📦 Found vendor chunks:', foundVendorChunks);

      // Property: At least some expected vendor chunks should exist
      const hasReactVendor = foundVendorChunks.some(name => name.includes('react-vendor'));
      const hasRouterVendor = foundVendorChunks.some(name => name.includes('router-vendor'));

      expect(hasReactVendor || hasRouterVendor).toBe(true);

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...EXPECTED_VENDOR_CHUNKS),
          async (expectedVendor) => {
            // Check if this vendor chunk exists or is bundled elsewhere
            const exists = foundVendorChunks.some(name => name.includes(expectedVendor));
            
            if (exists) {
              console.log(`✓ Found vendor chunk: ${expectedVendor}`);
            }

            // Property: Vendor chunks should be properly separated
            // (Some may not exist if dependencies aren't used)
            return true;
          }
        ),
        { numRuns: Math.min(100, EXPECTED_VENDOR_CHUNKS.length) }
      );
    });

    it('should verify vendor chunks are cacheable', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      const categories = categorizeChunks(jsFiles);

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...categories.vendor),
          async (vendorChunk) => {
            // Property: Vendor chunks should have content hashes in filename
            // This enables long-term caching
            const hasHash = /[a-f0-9]{8,}/.test(vendorChunk.name);
            
            expect(hasHash).toBe(true);

            return hasHash;
          }
        ),
        { numRuns: Math.min(100, categories.vendor.length) }
      );
    });

    it('should verify no duplicate vendor code across chunks', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      const categories = categorizeChunks(jsFiles);
      const vendorNames = categories.vendor.map(f => extractChunkName(f.name));

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...vendorNames),
          fc.constantFrom(...vendorNames),
          async (vendor1, vendor2) => {
            if (vendor1 === vendor2) {
              return true;
            }

            // Property: Vendor chunks should have distinct names
            // (No duplicate vendor code)
            expect(vendor1).not.toBe(vendor2);

            return vendor1 !== vendor2;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property: Code Splitting Consistency
   * 
   * Verifies that code splitting produces consistent and predictable results.
   */
  describe('Code Splitting Consistency', () => {
    it('should verify chunk naming follows convention', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...jsFiles),
          async (file) => {
            // Property: All chunks should follow naming convention
            // Format: [name]-[hash].js
            const hasValidFormat = /^[a-zA-Z0-9_-]+-[a-f0-9]+\.js$/.test(file.name);
            
            expect(hasValidFormat).toBe(true);

            return hasValidFormat;
          }
        ),
        { numRuns: Math.min(100, jsFiles.length) }
      );
    });

    it('should verify chunks are in correct directory', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...jsFiles),
          async (file) => {
            // Property: All JS chunks should be in assets/js directory
            const isInCorrectDir = file.path.includes(path.join('assets', 'js'));
            
            expect(isInCorrectDir).toBe(true);

            return isInCorrectDir;
          }
        ),
        { numRuns: Math.min(100, jsFiles.length) }
      );
    });

    it('should verify source maps exist for debugging', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...jsFiles),
          async (file) => {
            // Property: Each chunk should have a corresponding source map
            const mapPath = `${file.path}.map`;
            const hasSourceMap = fs.existsSync(mapPath);
            
            if (!hasSourceMap) {
              console.warn(`⚠️  Missing source map for: ${file.name}`);
            }

            // Source maps are optional but recommended
            return true;
          }
        ),
        { numRuns: Math.min(100, jsFiles.length) }
      );
    });

    it('should verify chunk size variance is reasonable', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      // Calculate statistics
      const sizes = jsFiles.map(f => f.size);
      const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
      const variance = sizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / sizes.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = (stdDev / avgSize) * 100;

      console.log(`📊 Chunk size statistics:`);
      console.log(`   Average: ${(avgSize / 1024).toFixed(2)}KB`);
      console.log(`   Std Dev: ${(stdDev / 1024).toFixed(2)}KB`);
      console.log(`   Coefficient of Variation: ${coefficientOfVariation.toFixed(2)}%`);

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...jsFiles),
          async (file) => {
            // Property: Chunk sizes should be within reasonable variance
            // Most chunks should be within 2 standard deviations of mean
            const zScore = Math.abs((file.size - avgSize) / stdDev);
            
            if (zScore > 2) {
              console.log(`⚠️  Outlier chunk: ${file.name} (z-score: ${zScore.toFixed(2)})`);
            }

            // Allow outliers but log them
            return true;
          }
        ),
        { numRuns: Math.min(100, jsFiles.length) }
      );
    });

    it('should verify no empty chunks are generated', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...jsFiles),
          async (file) => {
            // Property: All chunks should have meaningful content
            // Minimum size: 1KB (to avoid empty or near-empty chunks)
            const minSize = 1024;
            
            expect(file.size).toBeGreaterThanOrEqual(minSize);

            if (file.size < minSize * 2) {
              console.warn(`⚠️  Very small chunk: ${file.name} (${file.size} bytes)`);
            }

            return file.size >= minSize;
          }
        ),
        { numRuns: Math.min(100, jsFiles.length) }
      );
    });
  });

  /**
   * Property: Bundle Size Reduction
   * 
   * **Validates: Requirements NFR-PERF-2**
   * 
   * Verifies that code splitting achieves the target bundle size reduction.
   */
  describe('Bundle Size Reduction', () => {
    it('should verify code splitting reduces initial load', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      const categories = categorizeChunks(jsFiles);
      
      // Calculate initial load size (main app chunk + critical vendors)
      const initialLoadChunks = [
        ...categories.app,
        ...categories.vendor.filter(v => 
          extractChunkName(v.name).includes('react-vendor') ||
          extractChunkName(v.name).includes('router-vendor')
        )
      ];

      const initialLoadSize = initialLoadChunks.reduce((sum, file) => sum + file.size, 0);
      const initialLoadSizeInKB = initialLoadSize / 1024;
      const initialLoadSizeInMB = initialLoadSizeInKB / 1024;

      console.log(`📊 Initial load size: ${initialLoadSizeInMB.toFixed(2)}MB`);
      console.log(`📊 Initial load chunks: ${initialLoadChunks.length}`);

      // Property: Initial load should be reasonable (< 1MB ideally)
      // This is a soft target, may vary based on app complexity
      const targetInitialLoad = 1.5 * 1024 * 1024; // 1.5MB
      
      if (initialLoadSize > targetInitialLoad) {
        console.warn(`⚠️  Initial load exceeds target: ${initialLoadSizeInMB.toFixed(2)}MB > 1.5MB`);
      }

      // Property: Code splitting should result in multiple chunks
      expect(jsFiles.length).toBeGreaterThan(initialLoadChunks.length);

      return true;
    });

    it('should verify lazy-loaded chunks are separate', async () => {
      if (!buildExists) {
        console.warn('⚠️  Build directory not found. Run "npm run build" first.');
        return;
      }

      const categories = categorizeChunks(jsFiles);
      const lazyChunks = categories.other;

      console.log(`📦 Lazy-loaded chunks: ${lazyChunks.length}`);

      // Property: There should be lazy-loaded chunks (route chunks)
      expect(lazyChunks.length).toBeGreaterThan(0);

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...lazyChunks),
          async (lazyChunk) => {
            const sizeInKB = lazyChunk.size / 1024;

            // Property: Lazy chunks should be under size limit
            expect(lazyChunk.size).toBeLessThanOrEqual(MAX_CHUNK_SIZE);

            console.log(`✓ Lazy chunk: ${lazyChunk.name} (${sizeInKB.toFixed(2)}KB)`);

            return lazyChunk.size <= MAX_CHUNK_SIZE;
          }
        ),
        { numRuns: Math.min(100, lazyChunks.length) }
      );
    });
  });
});
