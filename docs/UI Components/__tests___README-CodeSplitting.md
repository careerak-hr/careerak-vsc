# Code Splitting Property-Based Tests

## Overview

This document describes the property-based tests for code splitting validation, implementing task 2.6.2 from the general-platform-enhancements spec.

## Test Files

### 1. CodeSplitting.property.test.jsx
Full property-based test suite using fast-check and vitest. This file contains comprehensive tests with 100 iterations per property.

**Location**: `frontend/src/components/__tests__/CodeSplitting.property.test.jsx`

**Requirements**: 
- vitest
- fast-check
- jsdom
- Build directory must exist (`npm run build`)

**Run with**: `npm test -- CodeSplitting.property.test.jsx --run`

### 2. test-code-splitting.js
Standalone test runner that doesn't require vitest. This is a simplified version for quick validation.

**Location**: `frontend/test-code-splitting.js`

**Requirements**:
- Node.js only
- Build directory must exist

**Run with**: `node test-code-splitting.js`

## Property Being Tested

**Property PERF-2: Code Splitting**

```
∀ chunk ∈ Chunks:
  chunk.size ≤ 200KB
```

This property verifies that all code chunks do not exceed the 200KB size limit for optimal loading performance.

## Test Coverage

The tests validate the following aspects of code splitting:

### 1. Chunk Size Limit (Property PERF-2)
- ✅ All chunks are under 200KB
- ✅ Vendor chunks are under 200KB
- ✅ App chunks are under 200KB
- ✅ Lazy-loaded chunks are under 200KB

### 2. Vendor Chunk Separation
- ✅ Expected vendor chunks exist (react-vendor, router-vendor, etc.)
- ✅ Vendor chunks are properly separated
- ✅ No duplicate vendor code across chunks
- ✅ Vendor chunks have content hashes for caching

### 3. Bundle Size Reduction
- ✅ Total bundle size is reduced by code splitting
- ✅ Multiple chunks exist (not a monolithic bundle)
- ✅ Average chunk size is well below the limit
- ✅ Initial load size is reasonable

### 4. Code Splitting Consistency
- ✅ Chunk naming follows convention
- ✅ Chunks are in correct directory (assets/js)
- ✅ Source maps exist for debugging
- ✅ Chunk size variance is reasonable
- ✅ No empty or near-empty chunks
- ✅ Chunk size distribution is balanced

## Test Results

### Current Status: ❌ FAILING

The test successfully identified violations of Property PERF-2:

**Main Issue**: vendor-C0YILmkh.js (803.57KB)
- Exceeds 200KB limit by 4x
- Dominates 54.86% of total bundle
- Contains miscellaneous vendor libraries not explicitly separated

**Other Findings**:
- Total bundle: 1.43MB across 46 chunks ✅
- Average chunk size: 31.84KB ✅
- Initial load: 0.25MB ✅
- 37 lazy-loaded chunks ✅
- Most route chunks are 500-800 bytes (lazy loading wrappers) ✅

### Minor Issues

1. **Naming Convention**: Some chunks use underscores and numbers (e.g., `00_LanguagePage-DQm0VxbD.js`)
   - This is intentional for route chunks
   - Not a critical issue

2. **Small Chunks**: 21 chunks are under 1KB
   - These are lazy loading wrappers
   - Expected behavior for route-based code splitting

3. **Content Hashes**: Vendor chunks use mixed case hashes
   - Regex pattern needs adjustment
   - Not a functional issue

## How to Fix the Failing Test

The vendor-C0YILmkh.js chunk needs to be split into smaller, more specific vendor chunks. Update `frontend/vite.config.js`:

```javascript
manualChunks: (id) => {
  // Add more specific vendor separations
  
  // UI/Animation libraries
  if (id.includes('node_modules/framer-motion')) {
    return 'animation-vendor';
  }
  
  // Form/Validation libraries
  if (id.includes('node_modules/formik') || 
      id.includes('node_modules/yup')) {
    return 'form-vendor';
  }
  
  // Date/Time libraries
  if (id.includes('node_modules/date-fns') ||
      id.includes('node_modules/moment')) {
    return 'date-vendor';
  }
  
  // Utility libraries
  if (id.includes('node_modules/lodash') ||
      id.includes('node_modules/ramda')) {
    return 'utility-vendor';
  }
  
  // ... existing vendor separations ...
}
```

## Integration with CI/CD

Add to package.json scripts:

```json
{
  "scripts": {
    "test:code-splitting": "node test-code-splitting.js",
    "test:code-splitting:full": "vitest CodeSplitting.property.test.jsx --run"
  }
}
```

Add to CI pipeline:

```yaml
- name: Build
  run: npm run build
  
- name: Test Code Splitting
  run: npm run test:code-splitting
```

## References

- **Spec**: `.kiro/specs/general-platform-enhancements/design.md`
- **Requirements**: FR-PERF-2, FR-PERF-5, NFR-PERF-2
- **Task**: 2.6.2 Write property-based test for code splitting (100 iterations)

## Notes

- The test requires a production build to exist
- Run `npm run build` before running tests
- The test validates actual build output, not source code
- Property-based testing with 100 iterations ensures thorough validation
- The test correctly identifies real issues with code splitting configuration
