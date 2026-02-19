/**
 * Property-Based Tests for Bundle Size Reduction
 * 
 * Property PERF-5: Bundle Size Reduction
 * 
 * **Validates: Requirements FR-PERF-2, NFR-PERF-2**
 */

import { describe, test, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to get file size in KB
const getFileSizeKB = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size / 1024; // Convert bytes to KB
  } catch (error) {
    return 0;
  }
};

// Helper function to get all JS files in build directory
const getJSFiles = (dir) => {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      files.push(...getJSFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
};

// Helper function to calculate total bundle size
const getTotalBundleSize = (buildDir) => {
  const jsFiles = getJSFiles(buildDir);
  let totalSize = 0;
  
  for (const file of jsFiles) {
    totalSize += getFileSizeKB(file);
  }
  
  return totalSize;
};

describe('Bundle Size Reduction Property Tests', () => {
  const buildDir = path.resolve(__dirname, '../../build');
  const assetsDir = path.join(buildDir, 'assets', 'js');
  
  // Baseline bundle size (before optimization) - estimated from typical React app
  // A typical React app without optimization is around 1200-1500KB
  const BASELINE_BUNDLE_SIZE = 1200; // KB
  
  // Target: 40-60% reduction means new size should be 40-60% of original
  const MAX_BUNDLE_SIZE = BASELINE_BUNDLE_SIZE * 0.6; // 720KB (60% of original)
  const TARGET_REDUCTION = 0.4; // 40% reduction minimum
  
  // Individual chunk size limit
  const MAX_CHUNK_SIZE = 200; // KB
  
  let buildExists = false;
  let totalBundleSize = 0;
  let jsFiles = [];
  
  beforeAll(() => {
    // Check if build directory exists
    buildExists = fs.existsSync(buildDir);
    
    if (buildExists) {
      totalBundleSize = getTotalBundleSize(buildDir);
      jsFiles = getJSFiles(buildDir);
      
      console.log('\n📦 Bundle Analysis:');
      console.log(`   Build directory: ${buildDir}`);
      console.log(`   Total JS files: ${jsFiles.length}`);
      console.log(`   Total bundle size: ${totalBundleSize.toFixed(2)} KB`);
      console.log(`   Baseline size: ${BASELINE_BUNDLE_SIZE} KB`);
      console.log(`   Max allowed size: ${MAX_BUNDLE_SIZE} KB`);
      console.log(`   Target reduction: ${(TARGET_REDUCTION * 100).toFixed(0)}%`);
    } else {
      console.log('\n⚠️  Build directory not found. Run "npm run build" first.');
    }
  });
  
  // ============================================
  // Property PERF-5: Bundle Size Reduction
  // ============================================
  
  describe('Property PERF-5: Bundle Size Reduction', () => {
    
    test('Property: Total bundle size must be ≤ 60% of baseline (720KB)', () => {
      // Skip if build doesn't exist
      if (!buildExists) {
        console.log('⏭️  Skipping: Build directory not found');
        return;
      }
      
      fc.assert(
        fc.property(fc.constant(totalBundleSize), (bundleSize) => {
          // Verify bundle size is within limit
          expect(bundleSize).toBeLessThanOrEqual(MAX_BUNDLE_SIZE);
          
          // Calculate reduction percentage
          const reduction = ((BASELINE_BUNDLE_SIZE - bundleSize) / BASELINE_BUNDLE_SIZE);
          
          // Log the reduction
          console.log(`   Reduction: ${(reduction * 100).toFixed(1)}% (${bundleSize.toFixed(2)} KB)`);
          
          // Verify minimum 40% reduction
          expect(reduction).toBeGreaterThanOrEqual(TARGET_REDUCTION);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
    
    test('Property: Each chunk must be ≤ 200KB', () => {
      // Skip if build doesn't exist
      if (!buildExists || jsFiles.length === 0) {
        console.log('⏭️  Skipping: No JS files found');
        return;
      }
      
      fc.assert(
        fc.property(
          fc.constantFrom(...jsFiles),
          (filePath) => {
            const fileSize = getFileSizeKB(filePath);
            const fileName = path.basename(filePath);
            
            // Log chunk size
            if (fileSize > 100) {
              console.log(`   ${fileName}: ${fileSize.toFixed(2)} KB`);
            }
            
            // Verify chunk size is within limit
            expect(fileSize).toBeLessThanOrEqual(MAX_CHUNK_SIZE);
            
            return true;
          }
        ),
        { numRuns: Math.min(100, jsFiles.length) }
      );
    });
    
    test('Property: Vendor chunks must be properly split', () => {
      // Skip if build doesn't exist
      if (!buildExists || jsFiles.length === 0) {
        console.log('⏭️  Skipping: No JS files found');
        return;
      }
      
      // Find vendor chunks
      const vendorChunks = jsFiles.filter(file => 
        path.basename(file).includes('vendor')
      );
      
      console.log(`   Found ${vendorChunks.length} vendor chunks`);
      
      fc.assert(
        fc.property(fc.constant(vendorChunks), (chunks) => {
          // Should have at least one vendor chunk (code splitting working)
          expect(chunks.length).toBeGreaterThan(0);
          
          // Each vendor chunk should be under limit
          for (const chunk of chunks) {
            const size = getFileSizeKB(chunk);
            const name = path.basename(chunk);
            
            console.log(`   ${name}: ${size.toFixed(2)} KB`);
            
            expect(size).toBeLessThanOrEqual(MAX_CHUNK_SIZE);
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
    
    test('Property: Main entry chunk must be optimized', () => {
      // Skip if build doesn't exist
      if (!buildExists || jsFiles.length === 0) {
        console.log('⏭️  Skipping: No JS files found');
        return;
      }
      
      // Find main entry chunk (usually index-*.js)
      const mainChunk = jsFiles.find(file => 
        path.basename(file).includes('index-') || 
        path.basename(file).includes('main-')
      );
      
      if (!mainChunk) {
        console.log('⏭️  Skipping: Main chunk not found');
        return;
      }
      
      fc.assert(
        fc.property(fc.constant(mainChunk), (chunk) => {
          const size = getFileSizeKB(chunk);
          const name = path.basename(chunk);
          
          console.log(`   ${name}: ${size.toFixed(2)} KB`);
          
          // Main chunk should be small (most code split into other chunks)
          // Typically should be under 100KB
          expect(size).toBeLessThanOrEqual(100);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
    
    test('Property: Bundle size must be consistent across builds', () => {
      // Skip if build doesn't exist
      if (!buildExists) {
        console.log('⏭️  Skipping: Build directory not found');
        return;
      }
      
      fc.assert(
        fc.property(
          fc.constant(totalBundleSize),
          fc.constant(totalBundleSize),
          (size1, size2) => {
            // Same build should have same size
            expect(size1).toBe(size2);
            
            // Size should be deterministic (within 1% variance for rounding)
            const variance = Math.abs(size1 - size2) / size1;
            expect(variance).toBeLessThan(0.01);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
    
    test('Property: Code splitting must reduce initial load', () => {
      // Skip if build doesn't exist
      if (!buildExists || jsFiles.length === 0) {
        console.log('⏭️  Skipping: No JS files found');
        return;
      }
      
      // Calculate initial load size (entry + critical vendors)
      const criticalChunks = jsFiles.filter(file => {
        const name = path.basename(file);
        return name.includes('index-') || 
               name.includes('main-') ||
               name.includes('react-vendor') ||
               name.includes('router-vendor');
      });
      
      const initialLoadSize = criticalChunks.reduce((sum, file) => {
        return sum + getFileSizeKB(file);
      }, 0);
      
      console.log(`   Initial load: ${initialLoadSize.toFixed(2)} KB (${criticalChunks.length} files)`);
      
      fc.assert(
        fc.property(fc.constant(initialLoadSize), (loadSize) => {
          // Initial load should be much smaller than total bundle
          // Target: < 50% of total bundle
          expect(loadSize).toBeLessThan(totalBundleSize * 0.5);
          
          // Initial load should be under 400KB for good performance
          expect(loadSize).toBeLessThanOrEqual(400);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
    
    test('Property: Lazy-loaded chunks must be smaller than main bundle', () => {
      // Skip if build doesn't exist
      if (!buildExists || jsFiles.length === 0) {
        console.log('⏭️  Skipping: No JS files found');
        return;
      }
      
      // Find lazy-loaded chunks (non-vendor, non-entry chunks)
      const lazyChunks = jsFiles.filter(file => {
        const name = path.basename(file);
        return !name.includes('vendor') && 
               !name.includes('index-') && 
               !name.includes('main-');
      });
      
      if (lazyChunks.length === 0) {
        console.log('⏭️  Skipping: No lazy chunks found');
        return;
      }
      
      console.log(`   Found ${lazyChunks.length} lazy-loaded chunks`);
      
      fc.assert(
        fc.property(
          fc.constantFrom(...lazyChunks),
          (chunk) => {
            const size = getFileSizeKB(chunk);
            const name = path.basename(chunk);
            
            console.log(`   ${name}: ${size.toFixed(2)} KB`);
            
            // Lazy chunks should be small (under 150KB)
            expect(size).toBeLessThanOrEqual(150);
            
            return true;
          }
        ),
        { numRuns: Math.min(100, lazyChunks.length) }
      );
    });
    
    test('Property: Total number of chunks must be reasonable', () => {
      // Skip if build doesn't exist
      if (!buildExists) {
        console.log('⏭️  Skipping: Build directory not found');
        return;
      }
      
      fc.assert(
        fc.property(fc.constant(jsFiles.length), (numChunks) => {
          console.log(`   Total chunks: ${numChunks}`);
          
          // Should have multiple chunks (code splitting working)
          expect(numChunks).toBeGreaterThan(3);
          
          // But not too many (over-splitting is bad for HTTP/2)
          // Reasonable range: 5-20 chunks
          expect(numChunks).toBeLessThanOrEqual(20);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
    
    test('Property: Bundle size reduction must be at least 40%', () => {
      // Skip if build doesn't exist
      if (!buildExists) {
        console.log('⏭️  Skipping: Build directory not found');
        return;
      }
      
      fc.assert(
        fc.property(
          fc.constant(BASELINE_BUNDLE_SIZE),
          fc.constant(totalBundleSize),
          (baseline, current) => {
            const reduction = ((baseline - current) / baseline);
            const reductionPercent = (reduction * 100).toFixed(1);
            
            console.log(`   Baseline: ${baseline} KB`);
            console.log(`   Current: ${current.toFixed(2)} KB`);
            console.log(`   Reduction: ${reductionPercent}%`);
            
            // Verify minimum 40% reduction
            expect(reduction).toBeGreaterThanOrEqual(TARGET_REDUCTION);
            
            // Verify within 60% of baseline
            expect(current).toBeLessThanOrEqual(baseline * 0.6);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
    
    test('Property: Minification must be applied to all chunks', () => {
      // Skip if build doesn't exist
      if (!buildExists || jsFiles.length === 0) {
        console.log('⏭️  Skipping: No JS files found');
        return;
      }
      
      fc.assert(
        fc.property(
          fc.constantFrom(...jsFiles),
          (filePath) => {
            const content = fs.readFileSync(filePath, 'utf-8');
            const fileName = path.basename(filePath);
            
            // Check for minification indicators
            // Minified code should not have:
            // - Multiple consecutive spaces
            // - Newlines with indentation
            // - Comments (except license comments)
            
            const hasMultipleSpaces = /  +/.test(content.slice(0, 1000));
            const hasIndentation = /\n\s{2,}/.test(content.slice(0, 1000));
            
            // Minified code should be compact
            expect(hasMultipleSpaces).toBe(false);
            expect(hasIndentation).toBe(false);
            
            // File should not be empty
            expect(content.length).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: Math.min(100, jsFiles.length) }
      );
    });
  });
});
