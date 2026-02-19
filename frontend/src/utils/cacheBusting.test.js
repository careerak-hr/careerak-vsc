import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './cacheBusting.test.setup'; // Import test setup
import {
  getBuildVersion,
  getBuildTimestamp,
  getCacheBustedUrl,
  isNewVersionAvailable,
  updateStoredVersion,
  clearAllCaches,
  getCacheHeaders,
} from './cacheBusting';

describe('Cache Busting Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getBuildVersion', () => {
    it('should return a version string', () => {
      const version = getBuildVersion();
      expect(version).toBeTruthy();
      expect(typeof version).toBe('string');
    });

    it('should return default version if env var not set', () => {
      const version = getBuildVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+$/); // Semver format
    });
  });

  describe('getBuildTimestamp', () => {
    it('should return a timestamp', () => {
      const timestamp = getBuildTimestamp();
      expect(timestamp).toBeTruthy();
      expect(typeof timestamp).toBe('string');
    });

    it('should return a valid timestamp', () => {
      const timestamp = getBuildTimestamp();
      const parsed = parseInt(timestamp);
      expect(parsed).toBeGreaterThan(0);
      expect(new Date(parsed).getTime()).toBeGreaterThan(0);
    });
  });

  describe('getCacheBustedUrl', () => {
    it('should append version parameter to URL without query string', () => {
      const url = getCacheBustedUrl('/api/data');
      expect(url).toContain('?v=');
      expect(url).toMatch(/^\/api\/data\?v=\d+\.\d+\.\d+$/);
    });

    it('should append version parameter to URL with existing query string', () => {
      const url = getCacheBustedUrl('/api/data?foo=bar');
      expect(url).toContain('&v=');
      expect(url).toMatch(/^\/api\/data\?foo=bar&v=\d+\.\d+\.\d+$/);
    });

    it('should use timestamp when useTimestamp is true', () => {
      const url = getCacheBustedUrl('/api/data', true);
      expect(url).toContain('?t=');
      expect(url).toMatch(/^\/api\/data\?t=\d+$/);
    });

    it('should handle empty URL', () => {
      const url = getCacheBustedUrl('');
      expect(url).toBe('');
    });

    it('should handle null URL', () => {
      const url = getCacheBustedUrl(null);
      expect(url).toBeNull();
    });
  });

  describe('isNewVersionAvailable', () => {
    it('should return false on first run (no stored version)', () => {
      const hasUpdate = isNewVersionAvailable();
      expect(hasUpdate).toBe(false);
      
      // Should store current version
      const stored = localStorage.getItem('careerak-app-version');
      expect(stored).toBe(getBuildVersion());
    });

    it('should return false when versions match', () => {
      const currentVersion = getBuildVersion();
      localStorage.setItem('careerak-app-version', currentVersion);
      
      const hasUpdate = isNewVersionAvailable();
      expect(hasUpdate).toBe(false);
    });

    it('should return true when stored version is different', () => {
      localStorage.setItem('careerak-app-version', '0.0.1');
      
      const hasUpdate = isNewVersionAvailable();
      expect(hasUpdate).toBe(true);
    });
  });

  describe('updateStoredVersion', () => {
    it('should update localStorage with current version', () => {
      updateStoredVersion();
      
      const stored = localStorage.getItem('careerak-app-version');
      expect(stored).toBe(getBuildVersion());
    });

    it('should log version update', () => {
      updateStoredVersion();
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Version updated to')
      );
    });
  });

  describe('clearAllCaches', () => {
    beforeEach(() => {
      // Set up test data
      localStorage.setItem('careerak-theme', 'dark');
      localStorage.setItem('careerak-language', 'ar');
      localStorage.setItem('careerak-auth-token', 'test-token');
      localStorage.setItem('some-other-key', 'value');
      
      sessionStorage.setItem('test-session', 'value');
    });

    it('should clear localStorage except preserved keys', async () => {
      await clearAllCaches();
      
      // Preserved keys should remain
      expect(localStorage.getItem('careerak-theme')).toBe('dark');
      expect(localStorage.getItem('careerak-language')).toBe('ar');
      expect(localStorage.getItem('careerak-auth-token')).toBe('test-token');
      
      // Other keys should be removed
      expect(localStorage.getItem('some-other-key')).toBeNull();
    });

    it('should clear sessionStorage', async () => {
      await clearAllCaches();
      
      expect(sessionStorage.getItem('test-session')).toBeNull();
    });

    it('should log success message', async () => {
      await clearAllCaches();
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('All caches cleared successfully')
      );
    });

    it('should handle errors gracefully', async () => {
      // Mock localStorage.removeItem to throw error
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn((key) => {
        if (key === 'some-other-key') {
          throw new Error('Test error');
        }
      });
      
      // Add a key that will cause error
      localStorage.setItem('some-other-key', 'value');
      
      await clearAllCaches();
      
      expect(console.error).toHaveBeenCalled();
      
      // Restore
      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('getCacheHeaders', () => {
    it('should return cache headers when noCache is false', () => {
      const headers = getCacheHeaders(false);
      
      expect(headers).toHaveProperty('Cache-Control');
      expect(headers['Cache-Control']).toContain('public');
      expect(headers['Cache-Control']).toContain('max-age=2592000');
    });

    it('should return no-cache headers when noCache is true', () => {
      const headers = getCacheHeaders(true);
      
      expect(headers).toHaveProperty('Cache-Control');
      expect(headers['Cache-Control']).toContain('no-cache');
      expect(headers['Cache-Control']).toContain('no-store');
      expect(headers['Cache-Control']).toContain('must-revalidate');
      expect(headers).toHaveProperty('Pragma', 'no-cache');
      expect(headers).toHaveProperty('Expires', '0');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete version update flow', () => {
      // 1. First run - no stored version
      expect(isNewVersionAvailable()).toBe(false);
      
      // 2. Simulate old version
      localStorage.setItem('careerak-app-version', '0.0.1');
      
      // 3. Check for update
      expect(isNewVersionAvailable()).toBe(true);
      
      // 4. Update version
      updateStoredVersion();
      
      // 5. No update available now
      expect(isNewVersionAvailable()).toBe(false);
    });

    it('should generate consistent cache-busted URLs', () => {
      const url1 = getCacheBustedUrl('/api/data');
      const url2 = getCacheBustedUrl('/api/data');
      
      // Should be consistent within same session
      expect(url1).toBe(url2);
    });

    it('should preserve critical data when clearing caches', async () => {
      // Set up critical data
      localStorage.setItem('careerak-theme', 'dark');
      localStorage.setItem('careerak-language', 'ar');
      localStorage.setItem('careerak-auth-token', 'token123');
      localStorage.setItem('non-critical', 'value');
      
      // Clear caches
      await clearAllCaches();
      
      // Critical data preserved
      expect(localStorage.getItem('careerak-theme')).toBe('dark');
      expect(localStorage.getItem('careerak-language')).toBe('ar');
      expect(localStorage.getItem('careerak-auth-token')).toBe('token123');
      
      // Non-critical data removed
      expect(localStorage.getItem('non-critical')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle URLs with fragments', () => {
      const url = getCacheBustedUrl('/page#section');
      expect(url).toContain('?v=');
      expect(url).toMatch(/^\/page\?v=\d+\.\d+\.\d+#section$/);
    });

    it('should handle URLs with multiple query parameters', () => {
      const url = getCacheBustedUrl('/api/data?foo=bar&baz=qux');
      expect(url).toContain('&v=');
      expect(url).toMatch(/^\/api\/data\?foo=bar&baz=qux&v=\d+\.\d+\.\d+$/);
    });

    it('should handle absolute URLs', () => {
      const url = getCacheBustedUrl('https://example.com/api/data');
      expect(url).toContain('?v=');
      expect(url).toMatch(/^https:\/\/example\.com\/api\/data\?v=\d+\.\d+\.\d+$/);
    });

    it('should handle data URLs', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const url = getCacheBustedUrl(dataUrl);
      expect(url).toContain('?v=');
    });
  });
});
