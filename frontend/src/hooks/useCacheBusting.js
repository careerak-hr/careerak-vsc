import { useEffect, useState, useCallback } from 'react';
import {
  getBuildVersion,
  getBuildTimestamp,
  isNewVersionAvailable,
  updateStoredVersion,
  forceReload,
  clearAllCaches,
} from '../utils/cacheBusting';

/**
 * Custom hook for cache busting functionality
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoCheck - Enable automatic version checking
 * @param {number} options.checkInterval - Interval for checking (ms)
 * @param {boolean} options.autoReload - Automatically reload on new version
 * @returns {Object} Cache busting utilities and state
 * 
 * @example
 * const { version, hasUpdate, reload, clearCache } = useCacheBusting({
 *   autoCheck: true,
 *   checkInterval: 60000,
 *   autoReload: false
 * });
 */
export const useCacheBusting = ({
  autoCheck = false,
  checkInterval = 60000,
  autoReload = false,
} = {}) => {
  const [version, setVersion] = useState(getBuildVersion());
  const [timestamp, setTimestamp] = useState(getBuildTimestamp());
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Check for new version
   */
  const checkForUpdate = useCallback(async () => {
    setIsChecking(true);
    
    try {
      // Check if new version is available
      const updateAvailable = isNewVersionAvailable();
      setHasUpdate(updateAvailable);
      
      if (updateAvailable && autoReload) {
        console.log('[useCacheBusting] Auto-reloading due to new version');
        updateStoredVersion();
        forceReload();
      }
      
      return updateAvailable;
    } catch (error) {
      console.error('[useCacheBusting] Error checking for update:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [autoReload]);

  /**
   * Manually reload the application
   */
  const reload = useCallback(() => {
    updateStoredVersion();
    forceReload();
  }, []);

  /**
   * Clear all caches
   */
  const clearCache = useCallback(async () => {
    await clearAllCaches();
    console.log('[useCacheBusting] Caches cleared');
  }, []);

  /**
   * Dismiss the update notification
   */
  const dismissUpdate = useCallback(() => {
    updateStoredVersion();
    setHasUpdate(false);
  }, []);

  /**
   * Get version info
   */
  const getVersionInfo = useCallback(() => {
    return {
      version: getBuildVersion(),
      timestamp: getBuildTimestamp(),
      buildDate: new Date(parseInt(getBuildTimestamp())).toISOString(),
    };
  }, []);

  // Set up automatic checking
  useEffect(() => {
    if (autoCheck) {
      // Check immediately
      checkForUpdate();
      
      // Set up interval
      const interval = setInterval(checkForUpdate, checkInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoCheck, checkInterval, checkForUpdate]);

  // Check on mount
  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  return {
    version,
    timestamp,
    hasUpdate,
    isChecking,
    checkForUpdate,
    reload,
    clearCache,
    dismissUpdate,
    getVersionInfo,
  };
};

/**
 * Hook for getting cache-busted URLs
 * 
 * @param {string} url - The URL to cache-bust
 * @param {boolean} useTimestamp - Use timestamp instead of version
 * @returns {string} Cache-busted URL
 * 
 * @example
 * const imageUrl = useCacheBustedUrl('/images/logo.png');
 */
export const useCacheBustedUrl = (url, useTimestamp = false) => {
  const [cacheBustedUrl, setCacheBustedUrl] = useState('');

  useEffect(() => {
    if (!url) {
      setCacheBustedUrl('');
      return;
    }

    const separator = url.includes('?') ? '&' : '?';
    const param = useTimestamp 
      ? `t=${getBuildTimestamp()}`
      : `v=${getBuildVersion()}`;
    
    setCacheBustedUrl(`${url}${separator}${param}`);
  }, [url, useTimestamp]);

  return cacheBustedUrl;
};

/**
 * Hook for preloading assets with cache busting
 * 
 * @param {Array<string>} urls - Array of URLs to preload
 * @returns {Object} Preload status
 * 
 * @example
 * const { isPreloading, preloadedCount } = usePreloadAssets([
 *   '/fonts/main.woff2',
 *   '/images/hero.webp'
 * ]);
 */
export const usePreloadAssets = (urls = []) => {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedCount, setPreloadedCount] = useState(0);

  useEffect(() => {
    if (!urls || urls.length === 0) return;

    setIsPreloading(true);
    let count = 0;

    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      const separator = url.includes('?') ? '&' : '?';
      link.href = `${url}${separator}v=${getBuildVersion()}`;
      
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
      
      link.onload = () => {
        count++;
        setPreloadedCount(count);
        if (count === urls.length) {
          setIsPreloading(false);
        }
      };
      
      link.onerror = () => {
        count++;
        setPreloadedCount(count);
        if (count === urls.length) {
          setIsPreloading(false);
        }
      };
      
      document.head.appendChild(link);
    });
  }, [urls]);

  return {
    isPreloading,
    preloadedCount,
    totalAssets: urls.length,
  };
};

export default useCacheBusting;
