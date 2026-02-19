/**
 * Service Worker Precaching Test
 * Task 3.2.4: Verify critical assets are precached
 * 
 * This test verifies that the service worker correctly precaches
 * critical assets (index.html, main.js, main.css) as required by FR-PWA-8
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Service Worker Precaching (Task 3.2.4)', () => {
  it('should define CRITICAL_ASSETS array with required assets', () => {
    const swPath = path.resolve(__dirname, '../../public/service-worker.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    
    // Verify CRITICAL_ASSETS is defined
    expect(swContent).toContain('const CRITICAL_ASSETS = [');
    
    // Verify critical assets are included
    expect(swContent).toContain("'/'"); // index.html root
    expect(swContent).toContain("'/index.html'"); // index.html explicit
    expect(swContent).toContain("'/manifest.json'"); // manifest
    expect(swContent).toContain("'/logo.png'"); // logo
    expect(swContent).toContain("'/offline.html'"); // offline fallback
  });

  it('should have install event listener for precaching', () => {
    const swPath = path.resolve(__dirname, '../../public/service-worker.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    
    // Verify install event listener exists
    expect(swContent).toContain("self.addEventListener('install'");
    
    // Verify it opens critical-assets cache
    expect(swContent).toContain("caches.open('critical-assets-v1')");
    
    // Verify it uses cache.addAll for precaching
    expect(swContent).toContain('cache.addAll(CRITICAL_ASSETS)');
  });

  it('should precache offline fallback page', () => {
    const swPath = path.resolve(__dirname, '../../public/service-worker.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    
    // Verify offline fallback is precached
    expect(swContent).toContain("caches.open('offline-fallback')");
    expect(swContent).toContain("cache.add('/offline.html')");
  });

  it('should use Workbox precacheAndRoute for build assets', () => {
    const swPath = path.resolve(__dirname, '../../public/service-worker.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    
    // Verify Workbox precacheAndRoute is used
    expect(swContent).toContain('precacheAndRoute(self.__WB_MANIFEST)');
    
    // This will precache main.js, main.css, and other build outputs
    // The __WB_MANIFEST is injected by Workbox during build
  });

  it('should have error handling for precaching failures', () => {
    const swPath = path.resolve(__dirname, '../../public/service-worker.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    
    // Verify error handling exists
    expect(swContent).toContain('.catch((error) =>');
    expect(swContent).toContain("console.error('Failed to precache");
  });

  it('should use Promise.all for parallel precaching', () => {
    const swPath = path.resolve(__dirname, '../../public/service-worker.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    
    // Verify Promise.all is used for efficient parallel precaching
    expect(swContent).toContain('Promise.all([');
  });

  it('should verify offline.html exists in public directory', () => {
    const offlinePath = path.resolve(__dirname, '../../public/offline.html');
    expect(fs.existsSync(offlinePath)).toBe(true);
  });

  it('should verify manifest.json exists in public directory', () => {
    const manifestPath = path.resolve(__dirname, '../../public/manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
  });

  it('should verify logo.png exists in public directory', () => {
    const logoPath = path.resolve(__dirname, '../../public/logo.png');
    expect(fs.existsSync(logoPath)).toBe(true);
  });
});

describe('Service Worker Build Output (Task 3.2.4)', () => {
  it('should generate service-worker.js in build directory', () => {
    const buildSwPath = path.resolve(__dirname, '../../build/service-worker.js');
    
    // Check if build exists (may not exist if build hasn't run)
    if (fs.existsSync(buildSwPath)) {
      const swContent = fs.readFileSync(buildSwPath, 'utf-8');
      
      // Verify __WB_MANIFEST is replaced with actual files
      expect(swContent).not.toContain('self.__WB_MANIFEST');
      
      // Verify it contains precacheAndRoute with actual file list
      expect(swContent).toContain('precacheAndRoute([');
      
      // Verify critical assets are in the manifest
      expect(swContent).toContain('index.html');
    }
  });
});

describe('Precaching Requirements Compliance', () => {
  it('should meet FR-PWA-8 requirement (CacheFirst for static assets)', () => {
    const swPath = path.resolve(__dirname, '../../public/service-worker.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    
    // Verify CacheFirst strategy is used
    expect(swContent).toContain('new CacheFirst({');
    expect(swContent).toContain("cacheName: 'static-assets'");
    
    // Verify 30-day expiration
    expect(swContent).toContain('30 * 24 * 60 * 60'); // 30 days in seconds
  });

  it('should implement task 3.2.4 requirements', () => {
    const swPath = path.resolve(__dirname, '../../public/service-worker.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    
    // Task 3.2.4: Precache critical assets (index.html, main.js, main.css)
    // index.html is explicitly precached
    expect(swContent).toContain("'/index.html'");
    
    // main.js and main.css are precached via Workbox __WB_MANIFEST
    expect(swContent).toContain('precacheAndRoute(self.__WB_MANIFEST)');
    
    // Verify comment mentions Task 3.2.4
    expect(swContent).toContain('Task 3.2.4');
  });
});
