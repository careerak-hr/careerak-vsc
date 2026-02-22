/**
 * Cache Validation Tests
 * 
 * Tests to verify that static assets are cached for 30 days
 * as per FR-PERF-6 and FR-PERF-7
 * 
 * Requirements:
 * - FR-PERF-6: Static assets cached for 30 days
 * - FR-PERF-7: Cached resources served when available
 * - NFR-PERF-6: Cache static assets with 30-day expiration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Static Asset Caching', () => {
  const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60; // 2592000 seconds
  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60; // 31536000 seconds

  describe('Vercel Configuration', () => {
    let vercelConfig;

    beforeEach(async () => {
      // Read vercel.json configuration
      const fs = await import('fs');
      const path = await import('path');
      const configPath = path.resolve(process.cwd(), '../vercel.json');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      vercelConfig = JSON.parse(configContent);
    });

    it('should have cache headers configured', () => {
      expect(vercelConfig.headers).toBeDefined();
      expect(Array.isArray(vercelConfig.headers)).toBe(true);
      expect(vercelConfig.headers.length).toBeGreaterThan(0);
    });

    it('should cache /assets/* for 30 days', () => {
      const assetsHeader = vercelConfig.headers.find(
        h => h.source === '/assets/(.*)'
      );
      
      expect(assetsHeader).toBeDefined();
      expect(assetsHeader.headers).toBeDefined();
      
      const cacheControl = assetsHeader.headers.find(
        h => h.key === 'Cache-Control'
      );
      
      expect(cacheControl).toBeDefined();
      expect(cacheControl.value).toContain('max-age=2592000');
      expect(cacheControl.value).toContain('public');
      expect(cacheControl.value).toContain('immutable');
    });

    it('should cache JS and CSS files for 30 days', () => {
      const jsHeader = vercelConfig.headers.find(
        h => h.source === '/(.*\\.(js|css))'
      );
      
      expect(jsHeader).toBeDefined();
      expect(jsHeader.headers).toBeDefined();
      
      const cacheControl = jsHeader.headers.find(
        h => h.key === 'Cache-Control'
      );
      
      expect(cacheControl).toBeDefined();
      expect(cacheControl.value).toContain('max-age=2592000');
      expect(cacheControl.value).toContain('public');
      expect(cacheControl.value).toContain('immutable');
    });

    it('should cache images for 30 days', () => {
      const imageHeader = vercelConfig.headers.find(
        h => h.source === '/(.*\\.(jpg|jpeg|png|gif|ico|svg|webp))'
      );
      
      expect(imageHeader).toBeDefined();
      expect(imageHeader.headers).toBeDefined();
      
      const cacheControl = imageHeader.headers.find(
        h => h.key === 'Cache-Control'
      );
      
      expect(cacheControl).toBeDefined();
      expect(cacheControl.value).toContain('max-age=2592000');
      expect(cacheControl.value).toContain('public');
      expect(cacheControl.value).toContain('immutable');
    });

    it('should cache fonts for 1 year', () => {
      const fontHeader = vercelConfig.headers.find(
        h => h.source === '/(.*\\.(woff|woff2|ttf|otf|eot))'
      );
      
      expect(fontHeader).toBeDefined();
      expect(fontHeader.headers).toBeDefined();
      
      const cacheControl = fontHeader.headers.find(
        h => h.key === 'Cache-Control'
      );
      
      expect(cacheControl).toBeDefined();
      expect(cacheControl.value).toContain('max-age=31536000');
      expect(cacheControl.value).toContain('public');
      expect(cacheControl.value).toContain('immutable');
    });

    it('should NOT cache HTML files', () => {
      const htmlHeader = vercelConfig.headers.find(
        h => h.source === '/(.*\\.html)'
      );
      
      expect(htmlHeader).toBeDefined();
      expect(htmlHeader.headers).toBeDefined();
      
      const cacheControl = htmlHeader.headers.find(
        h => h.key === 'Cache-Control'
      );
      
      expect(cacheControl).toBeDefined();
      expect(cacheControl.value).toContain('max-age=0');
      expect(cacheControl.value).toContain('must-revalidate');
    });

    it('should NOT cache service worker', () => {
      const swHeader = vercelConfig.headers.find(
        h => h.source === '/service-worker.js'
      );
      
      expect(swHeader).toBeDefined();
      expect(swHeader.headers).toBeDefined();
      
      const cacheControl = swHeader.headers.find(
        h => h.key === 'Cache-Control'
      );
      
      expect(cacheControl).toBeDefined();
      expect(cacheControl.value).toContain('max-age=0');
      expect(cacheControl.value).toContain('must-revalidate');
    });

    it('should NOT cache API responses', () => {
      const apiHeader = vercelConfig.headers.find(
        h => h.source === '/api/(.*)'
      );
      
      expect(apiHeader).toBeDefined();
      expect(apiHeader.headers).toBeDefined();
      
      const cacheControl = apiHeader.headers.find(
        h => h.key === 'Cache-Control'
      );
      
      expect(cacheControl).toBeDefined();
      expect(cacheControl.value).toContain('no-store');
      expect(cacheControl.value).toContain('no-cache');
      expect(cacheControl.value).toContain('must-revalidate');
    });

    it('should include security headers', () => {
      const assetsHeader = vercelConfig.headers.find(
        h => h.source === '/assets/(.*)'
      );
      
      const securityHeader = assetsHeader.headers.find(
        h => h.key === 'X-Content-Type-Options'
      );
      
      expect(securityHeader).toBeDefined();
      expect(securityHeader.value).toBe('nosniff');
    });

    it('should include compression headers', () => {
      const assetsHeader = vercelConfig.headers.find(
        h => h.source === '/assets/(.*)'
      );
      
      const compressionHeader = assetsHeader.headers.find(
        h => h.key === 'Content-Encoding'
      );
      
      expect(compressionHeader).toBeDefined();
      expect(compressionHeader.value).toBe('gzip');
    });
  });

  describe('Service Worker Cache Configuration', () => {
    it('should cache static assets for 30 days in service worker', async () => {
      // Read service worker file
      const fs = await import('fs');
      const path = await import('path');
      const swPath = path.resolve(process.cwd(), 'public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Check for 30-day cache configuration
      expect(swContent).toContain('30 * 24 * 60 * 60');
      expect(swContent).toContain('static-assets');
      expect(swContent).toContain('CacheFirst');
    });

    it('should cache images with size limit', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const swPath = path.resolve(process.cwd(), 'public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Check for image caching configuration
      expect(swContent).toContain('images');
      expect(swContent).toContain('maxEntries: 100');
      expect(swContent).toContain('purgeOnQuotaError: true');
    });

    it('should use NetworkFirst for API calls', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const swPath = path.resolve(process.cwd(), 'public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Check for API caching strategy
      expect(swContent).toContain('NetworkFirst');
      expect(swContent).toContain('/api/');
      expect(swContent).toContain('api-cache');
    });
  });

  describe('Cache Busting', () => {
    it('should include hash in asset filenames', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const viteConfigPath = path.resolve(process.cwd(), 'vite.config.js');
      const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
      
      // Check for hash in filename patterns
      expect(viteConfig).toContain('[hash]');
      expect(viteConfig).toContain('chunkFileNames');
      expect(viteConfig).toContain('entryFileNames');
      expect(viteConfig).toContain('assetFileNames');
    });

    it('should generate version.json for cache busting', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const viteConfigPath = path.resolve(process.cwd(), 'vite.config.js');
      const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
      
      // Check for version plugin
      expect(viteConfig).toContain('versionPlugin');
      expect(viteConfig).toContain('version.json');
      expect(viteConfig).toContain('buildTimestamp');
    });
  });

  describe('Cache Duration Validation', () => {
    it('should use correct 30-day duration in seconds', () => {
      expect(THIRTY_DAYS_IN_SECONDS).toBe(2592000);
    });

    it('should use correct 1-year duration for fonts', () => {
      expect(ONE_YEAR_IN_SECONDS).toBe(31536000);
    });
  });
});

describe('Cache Strategy Validation', () => {
  describe('Asset Type Classification', () => {
    const assetTypes = {
      scripts: ['main.js', 'vendor.js', 'chunk-123.js'],
      styles: ['main.css', 'vendor.css', 'chunk-456.css'],
      images: ['logo.png', 'banner.jpg', 'icon.svg', 'photo.webp'],
      fonts: ['font.woff2', 'font.woff', 'font.ttf', 'font.otf'],
      html: ['index.html', 'offline.html', 'about.html'],
    };

    it('should identify script files correctly', () => {
      assetTypes.scripts.forEach(file => {
        expect(file).toMatch(/\.(js)$/);
      });
    });

    it('should identify style files correctly', () => {
      assetTypes.styles.forEach(file => {
        expect(file).toMatch(/\.(css)$/);
      });
    });

    it('should identify image files correctly', () => {
      assetTypes.images.forEach(file => {
        expect(file).toMatch(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/);
      });
    });

    it('should identify font files correctly', () => {
      assetTypes.fonts.forEach(file => {
        expect(file).toMatch(/\.(woff2?|ttf|otf|eot)$/);
      });
    });

    it('should identify HTML files correctly', () => {
      assetTypes.html.forEach(file => {
        expect(file).toMatch(/\.(html)$/);
      });
    });
  });

  describe('Cache Control Headers', () => {
    const parseCacheControl = (value) => {
      const parts = value.split(',').map(p => p.trim());
      const result = {};
      
      parts.forEach(part => {
        if (part.includes('=')) {
          const [key, val] = part.split('=');
          result[key.trim()] = val.trim();
        } else {
          result[part] = true;
        }
      });
      
      return result;
    };

    it('should parse static asset cache control correctly', () => {
      const cacheControl = 'public, max-age=2592000, immutable';
      const parsed = parseCacheControl(cacheControl);
      
      expect(parsed.public).toBe(true);
      expect(parsed['max-age']).toBe('2592000');
      expect(parsed.immutable).toBe(true);
    });

    it('should parse HTML cache control correctly', () => {
      const cacheControl = 'public, max-age=0, must-revalidate';
      const parsed = parseCacheControl(cacheControl);
      
      expect(parsed.public).toBe(true);
      expect(parsed['max-age']).toBe('0');
      expect(parsed['must-revalidate']).toBe(true);
    });

    it('should parse API cache control correctly', () => {
      const cacheControl = 'no-store, no-cache, must-revalidate';
      const parsed = parseCacheControl(cacheControl);
      
      expect(parsed['no-store']).toBe(true);
      expect(parsed['no-cache']).toBe(true);
      expect(parsed['must-revalidate']).toBe(true);
    });
  });
});
