/**
 * PWA Installability Test
 * 
 * Tests FR-PWA-5: PWA is installable with custom splash screen
 * 
 * Verifies:
 * - Manifest.json is valid and accessible
 * - Required icons exist (192x192, 512x512, maskable)
 * - Service worker is registered
 * - Theme and background colors are set for splash screen
 * - PWA meets installability criteria
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA Installability Tests', () => {
  let manifest;
  const publicDir = path.resolve(__dirname, '../public');

  beforeAll(() => {
    // Read manifest.json
    const manifestPath = path.join(publicDir, 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(manifestContent);
  });

  describe('Manifest Configuration', () => {
    it('should have valid manifest.json', () => {
      expect(manifest).toBeDefined();
      expect(manifest).toBeTypeOf('object');
    });

    it('should have required manifest fields', () => {
      // Required fields for PWA installability
      expect(manifest.name).toBeDefined();
      expect(manifest.short_name).toBeDefined();
      expect(manifest.start_url).toBeDefined();
      expect(manifest.display).toBeDefined();
      expect(manifest.icons).toBeDefined();
      expect(Array.isArray(manifest.icons)).toBe(true);
    });

    it('should have proper display mode for standalone app', () => {
      expect(manifest.display).toBe('standalone');
    });

    it('should have theme_color for splash screen', () => {
      expect(manifest.theme_color).toBeDefined();
      expect(manifest.theme_color).toBe('#304B60');
    });

    it('should have background_color for splash screen', () => {
      expect(manifest.background_color).toBeDefined();
      expect(manifest.background_color).toBe('#E3DAD1');
    });

    it('should have proper start_url', () => {
      expect(manifest.start_url).toBe('/');
    });

    it('should have proper scope', () => {
      expect(manifest.scope).toBe('/');
    });
  });

  describe('Icon Requirements', () => {
    it('should have at least 2 icons (192x192 and 512x512)', () => {
      expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    });

    it('should have 192x192 icon', () => {
      const icon192 = manifest.icons.find(icon => icon.sizes === '192x192');
      expect(icon192).toBeDefined();
      expect(icon192.src).toBeDefined();
      expect(icon192.type).toBe('image/png');
    });

    it('should have 512x512 icon', () => {
      const icon512 = manifest.icons.find(icon => icon.sizes === '512x512');
      expect(icon512).toBeDefined();
      expect(icon512.src).toBeDefined();
      expect(icon512.type).toBe('image/png');
    });

    it('should have maskable icons for adaptive icons', () => {
      const maskableIcons = manifest.icons.filter(icon => 
        icon.purpose && icon.purpose.includes('maskable')
      );
      expect(maskableIcons.length).toBeGreaterThanOrEqual(2);
    });

    it('should have 192x192 maskable icon', () => {
      const maskable192 = manifest.icons.find(icon => 
        icon.sizes === '192x192' && icon.purpose && icon.purpose.includes('maskable')
      );
      expect(maskable192).toBeDefined();
    });

    it('should have 512x512 maskable icon', () => {
      const maskable512 = manifest.icons.find(icon => 
        icon.sizes === '512x512' && icon.purpose && icon.purpose.includes('maskable')
      );
      expect(maskable512).toBeDefined();
    });

    it('should have all icon files exist', () => {
      manifest.icons.forEach(icon => {
        const iconPath = path.join(publicDir, icon.src);
        expect(fs.existsSync(iconPath), `Icon ${icon.src} should exist`).toBe(true);
      });
    });
  });

  describe('Service Worker', () => {
    it('should have service-worker.js file', () => {
      const swPath = path.join(publicDir, 'service-worker.js');
      expect(fs.existsSync(swPath)).toBe(true);
    });

    it('should have valid service worker content', () => {
      const swPath = path.join(publicDir, 'service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Check for essential service worker features
      expect(swContent).toContain('importScripts');
      expect(swContent).toContain('workbox');
      expect(swContent).toContain('precacheAndRoute');
    });
  });

  describe('Splash Screen Configuration', () => {
    it('should have theme_color matching primary color', () => {
      expect(manifest.theme_color).toBe('#304B60');
    });

    it('should have background_color matching secondary color', () => {
      expect(manifest.background_color).toBe('#E3DAD1');
    });

    it('should have proper orientation for mobile', () => {
      expect(manifest.orientation).toBeDefined();
      expect(['portrait-primary', 'portrait', 'any']).toContain(manifest.orientation);
    });

    it('should have proper language and direction', () => {
      expect(manifest.lang).toBe('ar');
      expect(manifest.dir).toBe('rtl');
    });
  });

  describe('PWA Metadata', () => {
    it('should have description', () => {
      expect(manifest.description).toBeDefined();
      expect(manifest.description.length).toBeGreaterThan(0);
    });

    it('should have categories', () => {
      expect(manifest.categories).toBeDefined();
      expect(Array.isArray(manifest.categories)).toBe(true);
      expect(manifest.categories.length).toBeGreaterThan(0);
    });

    it('should have shortcuts for quick actions', () => {
      expect(manifest.shortcuts).toBeDefined();
      expect(Array.isArray(manifest.shortcuts)).toBe(true);
      expect(manifest.shortcuts.length).toBeGreaterThan(0);
    });

    it('should have valid shortcuts configuration', () => {
      manifest.shortcuts.forEach(shortcut => {
        expect(shortcut.name).toBeDefined();
        expect(shortcut.url).toBeDefined();
        expect(shortcut.icons).toBeDefined();
        expect(Array.isArray(shortcut.icons)).toBe(true);
      });
    });
  });

  describe('HTML Configuration', () => {
    it('should have index.html with manifest link', () => {
      const indexPath = path.join(publicDir, 'index.html');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      
      expect(indexContent).toContain('rel="manifest"');
      // Check for manifest link (with or without PUBLIC_URL placeholder)
      expect(
        indexContent.includes('href="/manifest.json"') || 
        indexContent.includes('href="%PUBLIC_URL%/manifest.json"')
      ).toBe(true);
    });

    it('should have theme-color meta tag', () => {
      const indexPath = path.join(publicDir, 'index.html');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      
      expect(indexContent).toContain('name="theme-color"');
    });

    it('should have apple-touch-icon for iOS', () => {
      const indexPath = path.join(publicDir, 'index.html');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      
      expect(indexContent).toContain('rel="apple-touch-icon"');
    });

    it('should have viewport meta tag with viewport-fit=cover', () => {
      const indexPath = path.join(publicDir, 'index.html');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      
      expect(indexContent).toContain('viewport-fit=cover');
    });
  });

  describe('Installability Criteria', () => {
    it('should meet all PWA installability requirements', () => {
      // Check all criteria for PWA installability
      const criteria = {
        hasManifest: manifest !== undefined,
        hasName: manifest.name !== undefined,
        hasShortName: manifest.short_name !== undefined,
        hasStartUrl: manifest.start_url !== undefined,
        hasDisplay: manifest.display === 'standalone' || manifest.display === 'fullscreen',
        hasIcons: manifest.icons && manifest.icons.length >= 2,
        has192Icon: manifest.icons.some(icon => icon.sizes === '192x192'),
        has512Icon: manifest.icons.some(icon => icon.sizes === '512x512'),
        hasThemeColor: manifest.theme_color !== undefined,
        hasBackgroundColor: manifest.background_color !== undefined,
        hasServiceWorker: fs.existsSync(path.join(publicDir, 'service-worker.js')),
      };

      // All criteria must be met
      Object.entries(criteria).forEach(([key, value]) => {
        expect(value, `Criterion ${key} should be met`).toBe(true);
      });
    });

    it('should have proper icon sizes for different devices', () => {
      const iconSizes = manifest.icons.map(icon => icon.sizes);
      
      // Should have icons for different screen densities
      expect(iconSizes).toContain('192x192'); // 1x, 2x
      expect(iconSizes).toContain('512x512'); // 3x, 4x
    });

    it('should have maskable icons for Android adaptive icons', () => {
      const maskableIcons = manifest.icons.filter(icon => 
        icon.purpose && icon.purpose.includes('maskable')
      );
      
      expect(maskableIcons.length).toBeGreaterThanOrEqual(2);
      
      const maskableSizes = maskableIcons.map(icon => icon.sizes);
      expect(maskableSizes).toContain('192x192');
      expect(maskableSizes).toContain('512x512');
    });
  });

  describe('Splash Screen Visual Requirements', () => {
    it('should have contrasting theme and background colors', () => {
      // Theme color (dark) and background color (light) should provide good contrast
      const themeColor = manifest.theme_color;
      const backgroundColor = manifest.background_color;
      
      expect(themeColor).toBe('#304B60'); // Dark blue
      expect(backgroundColor).toBe('#E3DAD1'); // Light beige
      
      // These colors provide good contrast for splash screen
      expect(themeColor).not.toBe(backgroundColor);
    });

    it('should have proper icon for splash screen', () => {
      // Splash screen uses the largest icon (512x512)
      const largestIcon = manifest.icons.find(icon => icon.sizes === '512x512');
      expect(largestIcon).toBeDefined();
      
      const iconPath = path.join(publicDir, largestIcon.src);
      expect(fs.existsSync(iconPath)).toBe(true);
    });
  });

  describe('Offline Support', () => {
    it('should have offline.html fallback page', () => {
      const offlinePath = path.join(publicDir, 'offline.html');
      expect(fs.existsSync(offlinePath)).toBe(true);
    });

    it('should have service worker with offline caching', () => {
      const swPath = path.join(publicDir, 'service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Check for offline support features
      expect(swContent).toContain('offline');
      expect(swContent).toContain('CacheFirst');
      expect(swContent).toContain('NetworkFirst');
    });
  });
});
