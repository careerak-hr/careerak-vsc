/**
 * Cache Busting Utilities
 * 
 * Provides utilities for cache busting to ensure users always get the latest assets.
 * Works in conjunction with Vite's hash-based file naming.
 */

/**
 * Get the build version from environment variables
 * This is set during build time in vite.config.js
 */
export const getBuildVersion = () => {
  return import.meta.env.VITE_BUILD_VERSION || '1.0.0';
};

/**
 * Get the build timestamp from environment variables
 * This is set during build time in vite.config.js
 */
export const getBuildTimestamp = () => {
  return import.meta.env.VITE_BUILD_TIMESTAMP || Date.now();
};

/**
 * Generate a cache-busted URL by appending version query parameter
 * 
 * @param {string} url - The original URL
 * @param {boolean} useTimestamp - Whether to use timestamp instead of version
 * @returns {string} Cache-busted URL
 * 
 * @example
 * getCacheBustedUrl('/api/data') // '/api/data?v=1.3.0'
 * getCacheBustedUrl('/api/data', true) // '/api/data?t=1234567890'
 */
export const getCacheBustedUrl = (url, useTimestamp = false) => {
  if (!url) return url;
  
  // Split URL into base and fragment
  const [baseUrl, fragment] = url.split('#');
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  const param = useTimestamp 
    ? `t=${getBuildTimestamp()}`
    : `v=${getBuildVersion()}`;
  
  const cacheBustedBase = `${baseUrl}${separator}${param}`;
  
  // Reattach fragment if it exists
  return fragment ? `${cacheBustedBase}#${fragment}` : cacheBustedBase;
};

/**
 * Clear all caches (localStorage, sessionStorage, and Cache API)
 * Useful when forcing a hard refresh or after major updates
 * 
 * @returns {Promise<void>}
 */
export const clearAllCaches = async () => {
  try {
    // Clear localStorage (except critical data)
    const keysToPreserve = ['careerak-theme', 'careerak-language', 'careerak-auth-token'];
    
    // Get all keys from localStorage
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }
    
    // Remove non-preserved keys
    allKeys.forEach(key => {
      if (!keysToPreserve.includes(key)) {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error(`[Cache Busting] Error removing key ${key}:`, error);
        }
      }
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear Cache API if available
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    console.log('[Cache Busting] All caches cleared successfully');
  } catch (error) {
    console.error('[Cache Busting] Error clearing caches:', error);
  }
};

/**
 * Check if a new version is available by comparing stored version
 * 
 * @returns {boolean} True if new version is available
 */
export const isNewVersionAvailable = () => {
  const currentVersion = getBuildVersion();
  const storedVersion = localStorage.getItem('careerak-app-version');
  
  if (!storedVersion) {
    // First time - store current version
    localStorage.setItem('careerak-app-version', currentVersion);
    return false;
  }
  
  return storedVersion !== currentVersion;
};

/**
 * Update the stored version to current version
 */
export const updateStoredVersion = () => {
  const currentVersion = getBuildVersion();
  localStorage.setItem('careerak-app-version', currentVersion);
  console.log(`[Cache Busting] Version updated to ${currentVersion}`);
};

/**
 * Force reload the page with cache bypass
 * This performs a hard refresh, bypassing all caches
 */
export const forceReload = () => {
  // Clear caches first
  clearAllCaches().then(() => {
    // Hard reload with cache bypass
    window.location.reload(true);
  });
};

/**
 * Get cache control headers for fetch requests
 * 
 * @param {boolean} noCache - Whether to bypass cache completely
 * @returns {Object} Headers object with cache control
 */
export const getCacheHeaders = (noCache = false) => {
  if (noCache) {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }
  
  return {
    'Cache-Control': 'public, max-age=2592000', // 30 days
  };
};

/**
 * Preload critical assets with cache busting
 * 
 * @param {Array<string>} urls - Array of URLs to preload
 */
export const preloadAssets = (urls = []) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = getCacheBustedUrl(url);
    
    // Determine the 'as' attribute based on file extension
    if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (/\.(woff2?|ttf|otf)$/i.test(url)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    } else if (/\.(png|jpe?g|svg|gif|webp)$/i.test(url)) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Add cache busting meta tags to document head
 * This helps with browser cache control
 */
export const addCacheBustingMetaTags = () => {
  const version = getBuildVersion();
  const timestamp = getBuildTimestamp();
  
  // Add version meta tag
  const versionMeta = document.createElement('meta');
  versionMeta.name = 'app-version';
  versionMeta.content = version;
  document.head.appendChild(versionMeta);
  
  // Add build timestamp meta tag
  const timestampMeta = document.createElement('meta');
  timestampMeta.name = 'build-timestamp';
  timestampMeta.content = timestamp;
  document.head.appendChild(timestampMeta);
  
  console.log(`[Cache Busting] Version: ${version}, Build: ${new Date(parseInt(timestamp)).toISOString()}`);
};

/**
 * Initialize cache busting on app load
 * Checks for new version and optionally prompts user to reload
 * 
 * @param {boolean} autoReload - Whether to automatically reload on new version
 * @returns {boolean} True if new version was detected
 */
export const initCacheBusting = (autoReload = false) => {
  // Add meta tags
  addCacheBustingMetaTags();
  
  // Check for new version
  const newVersionAvailable = isNewVersionAvailable();
  
  if (newVersionAvailable) {
    console.log('[Cache Busting] New version detected!');
    
    if (autoReload) {
      console.log('[Cache Busting] Auto-reloading...');
      updateStoredVersion();
      forceReload();
    } else {
      // Notify user about new version (can be handled by UI component)
      console.log('[Cache Busting] New version available. User should reload.');
    }
  }
  
  return newVersionAvailable;
};

export default {
  getBuildVersion,
  getBuildTimestamp,
  getCacheBustedUrl,
  clearAllCaches,
  isNewVersionAvailable,
  updateStoredVersion,
  forceReload,
  getCacheHeaders,
  preloadAssets,
  addCacheBustingMetaTags,
  initCacheBusting,
};
