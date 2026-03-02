# TTI Optimization Implementation

**Date**: 2026-02-22  
**Status**: ✅ In Progress  
**Requirements**: FR-PERF-10, NFR-PERF-4  
**Target**: TTI < 3.8s on Fast 3G

## Overview

This document details the implementation of Time to Interactive (TTI) optimizations to achieve the target of < 3.8 seconds on Fast 3G networks.

## Current Status

### Before Optimization
- **Estimated TTI**: 12.47s
- **Critical JS**: 1148.92 KB
- **Critical CSS**: 555.44 KB
- **Main Bundle**: 799.63 KB (oversized)
- **Status**: ❌ Failed (8.67s over target)

### After Initial Optimizations
- **Estimated TTI**: 12.21s
- **Critical JS**: 1118.43 KB
- **Critical CSS**: 552.63 KB
- **Main Bundle**: 799.63 KB (still oversized)
- **Status**: ❌ Failed (8.41s over target)
- **Improvement**: 0.26s (2% improvement)

## Optimizations Implemented

### 1. Deferred Performance Measurement
**File**: `frontend/src/index.jsx`

```javascript
// BEFORE: Synchronous import blocking initial render
import { initPerformanceMeasurement } from "./utils/performanceMeasurement";
initPerformanceMeasurement();

// AFTER: Deferred with dynamic import
setTimeout(() => {
  import("./utils/performanceMeasurement").then(({ initPerformanceMeasurement }) => {
    initPerformanceMeasurement();
  });
}, 0);
```

**Impact**: Removes performance measurement from critical path, reducing initial bundle size.

### 2. Deferred Service Worker Registration
**File**: `frontend/src/index.jsx`

```javascript
// BEFORE: Immediate registration on load
window.addEventListener('load', () => {
  navigator.serviceWorker.register('/service-worker.js')
});

// AFTER: Deferred with requestIdleCallback
window.addEventListener('load', () => {
  const registerSW = () => {
    navigator.serviceWorker.register('/service-worker.js')
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(registerSW, { timeout: 2000 });
  } else {
    setTimeout(registerSW, 1000);
  }
});
```

**Impact**: Delays service worker registration until browser is idle, improving TTI.

### 3. Lazy Load Non-Critical Components
**File**: `frontend/src/App.jsx`

```javascript
// BEFORE: Synchronous imports
import ServiceWorkerManager from "./components/ServiceWorkerManager";
import OfflineQueueStatus from "./components/OfflineQueueStatus";

// AFTER: Lazy loaded with React.lazy
const ServiceWorkerManager = React.lazy(() => import("./components/ServiceWorkerManager"));
const OfflineQueueStatus = React.lazy(() => import("./components/OfflineQueueStatus"));

// Wrapped with Suspense
<Suspense fallback={null}>
  <ServiceWorkerManager />
  <OfflineQueueStatus />
</Suspense>
```

**Impact**: Moves non-critical components out of main bundle.

### 4. Lazy Load AppAudioPlayer
**File**: `frontend/src/components/ApplicationShell.jsx`

```javascript
// BEFORE: Synchronous import
import AppAudioPlayer from "./AppAudioPlayer";

// AFTER: Lazy loaded
const AppAudioPlayer = React.lazy(() => import("./AppAudioPlayer"));

<Suspense fallback={null}>
  <AppAudioPlayer />
</Suspense>
```

**Impact**: Audio player is not critical for initial render.

### 5. Optimized Vendor Chunk Splitting
**File**: `frontend/vite.config.js`

Reorganized vendor chunks into:
- **Critical vendors** (loaded immediately):
  - `react-vendor` - React core (137 KB)
  - `router-vendor` - React Router (19 KB)
  - `i18n-vendor` - Internationalization (56 KB)
  - `axios-vendor` - HTTP client (36 KB)

- **Non-critical vendors** (lazy loaded):
  - `framer-vendor` - Animations (101 KB)
  - `helmet-vendor` - SEO (11 KB)
  - `pusher-vendor` - Real-time (62 KB)
  - `capacitor-vendor` - Mobile features (15 KB)
  - `sentry-vendor` - Error tracking
  - `crypto-vendor` - Encryption (66 KB)
  - `image-vendor` - Image processing (20 KB)
  - And others...

**Impact**: Reduces critical vendor bundle size by moving non-essential libraries to lazy-loaded chunks.

## Remaining Issues

### Main Bundle Still Too Large (799.63 KB)

The `main.js` bundle is still 799.63 KB, which is the primary bottleneck for TTI. Analysis shows:

1. **CryptoJS in AppContext** (66 KB)
   - Currently imported synchronously in AppContext
   - Used for encryption/decryption
   - Should be lazy loaded or replaced with Web Crypto API

2. **Heavy Context Providers**
   - AppContext includes many features
   - All loaded upfront even if not immediately needed

3. **Large CSS Bundle** (552.63 KB)
   - Tailwind CSS with all utilities
   - Should implement PurgeCSS more aggressively
   - Consider critical CSS extraction

## Next Steps for TTI < 3.8s

### Priority 1: Reduce Main Bundle Size

1. **Replace CryptoJS with Web Crypto API**
   ```javascript
   // Instead of CryptoJS (66 KB)
   import CryptoJS from 'crypto-js';
   
   // Use native Web Crypto API (0 KB)
   const encrypted = await crypto.subtle.encrypt(...)
   ```

2. **Lazy Load Heavy Contexts**
   - Move non-critical context logic to lazy-loaded modules
   - Use code splitting for context providers

3. **Optimize CSS Bundle**
   - Extract critical CSS for above-the-fold content
   - Defer non-critical CSS
   - More aggressive PurgeCSS configuration

### Priority 2: Further Code Splitting

1. **Split AppContext**
   - Separate auth logic from settings logic
   - Lazy load encryption utilities

2. **Component-Level Code Splitting**
   - Identify large components in main bundle
   - Convert to lazy-loaded components

3. **Route-Based Prefetching**
   - Prefetch likely next routes
   - Use intersection observer for link prefetching

### Priority 3: Build Optimizations

1. **Tree Shaking**
   - Ensure all imports are tree-shakeable
   - Remove unused exports

2. **Minification**
   - Already using Terser with aggressive settings
   - Consider additional compression

3. **Bundle Analysis**
   - Use `npm run build` to generate stats.html
   - Identify largest modules in main bundle
   - Target for optimization

## Measurement Tools

### TTI Verification Script
**File**: `frontend/scripts/verify-tti.js`

Estimates TTI based on:
- Bundle sizes
- Network conditions (Fast 3G)
- Parse/compile time
- Execution time
- Hydration time

**Usage**:
```bash
npm run build
node scripts/verify-tti.js
```

### Bundle Visualizer
**File**: `frontend/build/stats.html`

Generated after build to visualize bundle composition.

**Usage**:
```bash
npm run build
# Open build/stats.html in browser
```

## Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| TTI | < 3.8s | 12.21s | ❌ Failed |
| Critical JS | < 300 KB | 1118 KB | ❌ Failed |
| Critical CSS | < 100 KB | 553 KB | ❌ Failed |
| Main Bundle | < 200 KB | 800 KB | ❌ Failed |

## Estimated Impact of Remaining Optimizations

1. **Replace CryptoJS**: -66 KB → TTI improvement: ~0.5s
2. **Optimize CSS**: -300 KB → TTI improvement: ~1.5s
3. **Split AppContext**: -100 KB → TTI improvement: ~0.6s
4. **Additional lazy loading**: -200 KB → TTI improvement: ~1.2s

**Total estimated improvement**: ~3.8s  
**Projected TTI**: 12.21s - 3.8s = **8.41s** (still above target)

## Conclusion

Initial optimizations have been implemented, achieving a 2% improvement in TTI. However, the main bundle size remains the primary bottleneck. To achieve the target of TTI < 3.8s, we need to:

1. Replace heavy libraries (CryptoJS) with native APIs
2. Implement critical CSS extraction
3. Further split the main bundle
4. Optimize context providers

The current approach of lazy loading components is correct, but we need more aggressive bundle size reduction to meet the target.

## References

- [Web Vitals - TTI](https://web.dev/tti/)
- [Code Splitting - React](https://react.dev/reference/react/lazy)
- [Vite - Code Splitting](https://vitejs.dev/guide/features.html#code-splitting)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
