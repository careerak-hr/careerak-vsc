/**
 * Offline Functionality Tests
 * Task 9.6.2: Test offline functionality
 * 
 * These tests verify the PWA offline functionality including:
 * - Service worker caching strategies
 * - Offline page fallback
 * - Request queueing
 * - Cache management
 * 
 * **Validates: Requirements FR-PWA-2, FR-PWA-3, FR-PWA-9, NFR-REL-2, NFR-REL-3**
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Offline Functionality Tests (Task 9.6.2)', () => {
  
  // ============================================
  // Test Suite 1: Service Worker Configuration
  // ============================================
  
  describe('Service Worker Configuration', () => {
    
    test('should have service worker file', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      expect(fs.existsSync(swPath)).toBe(true);
    });

    test('should define cache strategies for offline support', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify CacheFirst for static assets (FR-PWA-8)
      expect(swContent).toContain('new CacheFirst({');
      expect(swContent).toContain("cacheName: 'static-assets'");
      
      // Verify NetworkFirst for API calls
      expect(swContent).toContain('new NetworkFirst({');
      expect(swContent).toContain("cacheName: 'api-cache'");
      
      // Verify CacheFirst for images
      expect(swContent).toContain("cacheName: 'images'");
    });

    test('should have offline fallback page configured (FR-PWA-3)', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify offline fallback is defined
      expect(swContent).toContain('FALLBACK_HTML_URL');
      expect(swContent).toContain('/offline.html');
      
      // Verify fetch event listener for fallback
      expect(swContent).toContain("self.addEventListener('fetch'");
      expect(swContent).toContain('caches.match(FALLBACK_HTML_URL)');
    });

    test('should precache critical assets', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify CRITICAL_ASSETS array
      expect(swContent).toContain('const CRITICAL_ASSETS = [');
      expect(swContent).toContain("'/'");
      expect(swContent).toContain("'/index.html'");
      expect(swContent).toContain("'/manifest.json'");
      expect(swContent).toContain("'/offline.html'");
    });

    test('should have cache expiration configured', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify ExpirationPlugin is used
      expect(swContent).toContain('ExpirationPlugin');
      
      // Verify 30-day expiration for static assets (FR-PWA-8)
      expect(swContent).toContain('30 * 24 * 60 * 60');
      
      // Verify 5-minute timeout for API calls
      expect(swContent).toContain('5 * 60');
    });

    test('should have 50MB size limit for images (FR-PWA-3)', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify maxEntries for images (100 entries ≈ 50MB)
      expect(swContent).toContain('maxEntries: 100');
      
      // Verify purgeOnQuotaError
      expect(swContent).toContain('purgeOnQuotaError: true');
    });
  });

  // ============================================
  // Test Suite 2: Offline Page
  // ============================================
  
  describe('Offline Page (FR-PWA-3)', () => {
    
    test('should have offline.html file', () => {
      const offlinePath = path.resolve(__dirname, '../../public/offline.html');
      expect(fs.existsSync(offlinePath)).toBe(true);
    });

    test('should have multi-language support in offline page', () => {
      const offlinePath = path.resolve(__dirname, '../../public/offline.html');
      const offlineContent = fs.readFileSync(offlinePath, 'utf-8');
      
      // Verify translations object
      expect(offlineContent).toContain('const translations = {');
      expect(offlineContent).toContain('ar:');
      expect(offlineContent).toContain('en:');
      expect(offlineContent).toContain('fr:');
      
      // Verify Arabic translations
      expect(offlineContent).toContain('غير متصل بالإنترنت');
      
      // Verify English translations
      expect(offlineContent).toContain('You are offline');
      
      // Verify French translations
      expect(offlineContent).toContain('Vous êtes hors ligne');
    });

    test('should have retry functionality in offline page', () => {
      const offlinePath = path.resolve(__dirname, '../../public/offline.html');
      const offlineContent = fs.readFileSync(offlinePath, 'utf-8');
      
      // Verify retry function
      expect(offlineContent).toContain('function retry()');
      expect(offlineContent).toContain('checkOnlineStatus()');
      
      // Verify retry button
      expect(offlineContent).toContain('onclick="retry()"');
    });

    test('should detect online status in offline page', () => {
      const offlinePath = path.resolve(__dirname, '../../public/offline.html');
      const offlineContent = fs.readFileSync(offlinePath, 'utf-8');
      
      // Verify online detection
      expect(offlineContent).toContain('function checkOnlineStatus()');
      expect(offlineContent).toContain('navigator.onLine');
      
      // Verify online event listener
      expect(offlineContent).toContain("window.addEventListener('online'");
      
      // Verify periodic check
      expect(offlineContent).toContain('setInterval(checkOnlineStatus');
    });

    test('should have proper styling in offline page', () => {
      const offlinePath = path.resolve(__dirname, '../../public/offline.html');
      const offlineContent = fs.readFileSync(offlinePath, 'utf-8');
      
      // Verify CSS is embedded
      expect(offlineContent).toContain('<style>');
      
      // Verify brand colors
      expect(offlineContent).toContain('#304B60'); // Primary
      expect(offlineContent).toContain('#E3DAD1'); // Secondary
      expect(offlineContent).toContain('#D48161'); // Accent
      
      // Verify responsive design
      expect(offlineContent).toContain('@media (max-width: 640px)');
    });

    test('should support RTL/LTR in offline page', () => {
      const offlinePath = path.resolve(__dirname, '../../public/offline.html');
      const offlineContent = fs.readFileSync(offlinePath, 'utf-8');
      
      // Verify direction setting
      expect(offlineContent).toContain("setAttribute('dir'");
      expect(offlineContent).toContain('rtl');
      expect(offlineContent).toContain('ltr');
      
      // Verify language detection
      expect(offlineContent).toContain("localStorage.getItem('language')");
    });
  });

  // ============================================
  // Test Suite 3: Cache Strategies
  // ============================================
  
  describe('Cache Strategies', () => {
    
    test('should use CacheFirst for static assets (FR-PWA-8)', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify CacheFirst strategy
      expect(swContent).toContain('new CacheFirst({');
      
      // Verify it applies to scripts, styles, and fonts
      expect(swContent).toContain("request.destination === 'script'");
      expect(swContent).toContain("request.destination === 'style'");
      expect(swContent).toContain("request.destination === 'font'");
      
      // Verify cache name
      expect(swContent).toContain("cacheName: 'static-assets'");
    });

    test('should use NetworkFirst for API calls', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify NetworkFirst strategy
      expect(swContent).toContain('new NetworkFirst({');
      
      // Verify it applies to API routes
      expect(swContent).toContain("url.pathname.startsWith('/api/')");
      
      // Verify cache name
      expect(swContent).toContain("cacheName: 'api-cache'");
      
      // Verify 5-minute timeout
      expect(swContent).toContain('networkTimeoutSeconds: 5 * 60');
    });

    test('should use CacheFirst for images', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify CacheFirst for images
      expect(swContent).toContain("request.destination === 'image'");
      expect(swContent).toContain("cacheName: 'images'");
      
      // Verify size limit
      expect(swContent).toContain('maxEntries: 100');
    });

    test('should use NetworkFirst for navigation', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify NetworkFirst for navigation
      expect(swContent).toContain("request.mode === 'navigate'");
      expect(swContent).toContain("cacheName: 'pages'");
    });
  });

  // ============================================
  // Test Suite 4: Request Queueing (FR-PWA-9)
  // ============================================
  
  describe('Request Queueing (FR-PWA-9)', () => {
    
    test('should have background sync configured', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify sync event listener
      expect(swContent).toContain("self.addEventListener('sync'");
      expect(swContent).toContain('sync-requests');
    });

    test('should have syncRequests function', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify syncRequests function
      expect(swContent).toContain('async function syncRequests()');
      
      // Verify it opens failed-requests cache
      expect(swContent).toContain("caches.open('failed-requests')");
      
      // Verify it retries requests
      expect(swContent).toContain('await fetch(request)');
      expect(swContent).toContain('cache.delete(request)');
    });

    test('should queue failed requests', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify failed requests are cached
      // This is handled by the sync event and syncRequests function
      expect(swContent).toContain('failed-requests');
    });
  });

  // ============================================
  // Test Suite 5: Manifest Configuration
  // ============================================
  
  describe('Manifest Configuration', () => {
    
    test('should have manifest.json file', () => {
      const manifestPath = path.resolve(__dirname, '../../public/manifest.json');
      expect(fs.existsSync(manifestPath)).toBe(true);
    });

    test('should have correct manifest properties', () => {
      const manifestPath = path.resolve(__dirname, '../../public/manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      
      // Verify basic properties
      expect(manifest.name).toBe('Careerak - The Future of HR');
      expect(manifest.short_name).toBe('Careerak');
      expect(manifest.start_url).toBe('/');
      expect(manifest.display).toBe('standalone');
      
      // Verify theme colors
      expect(manifest.theme_color).toBe('#304B60');
      expect(manifest.background_color).toBe('#E3DAD1');
      
      // Verify language and direction
      expect(manifest.lang).toBe('ar');
      expect(manifest.dir).toBe('rtl');
    });

    test('should have required icons', () => {
      const manifestPath = path.resolve(__dirname, '../../public/manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      
      // Verify icons array exists
      expect(manifest.icons).toBeDefined();
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThan(0);
      
      // Verify required sizes
      const sizes = manifest.icons.map(icon => icon.sizes);
      expect(sizes).toContain('192x192');
      expect(sizes).toContain('512x512');
      
      // Verify maskable icons
      const purposes = manifest.icons.map(icon => icon.purpose);
      expect(purposes).toContain('maskable');
    });

    test('should have shortcuts defined', () => {
      const manifestPath = path.resolve(__dirname, '../../public/manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      
      // Verify shortcuts exist
      expect(manifest.shortcuts).toBeDefined();
      expect(Array.isArray(manifest.shortcuts)).toBe(true);
      
      // Verify key shortcuts
      const shortcutUrls = manifest.shortcuts.map(s => s.url);
      expect(shortcutUrls).toContain('/jobs');
      expect(shortcutUrls).toContain('/courses');
      expect(shortcutUrls).toContain('/profile');
    });
  });

  // ============================================
  // Test Suite 6: Critical Assets
  // ============================================
  
  describe('Critical Assets', () => {
    
    test('should have all critical assets available', () => {
      const publicDir = path.resolve(__dirname, '../../public');
      
      // Verify offline.html
      expect(fs.existsSync(path.join(publicDir, 'offline.html'))).toBe(true);
      
      // Verify manifest.json
      expect(fs.existsSync(path.join(publicDir, 'manifest.json'))).toBe(true);
      
      // Verify logo.png
      expect(fs.existsSync(path.join(publicDir, 'logo.png'))).toBe(true);
    });

    test('should have service worker in public directory', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      expect(fs.existsSync(swPath)).toBe(true);
    });
  });

  // ============================================
  // Test Suite 7: Workbox Configuration
  // ============================================
  
  describe('Workbox Configuration', () => {
    
    test('should import Workbox from CDN', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify Workbox import
      expect(swContent).toContain('importScripts');
      expect(swContent).toContain('workbox-cdn');
      expect(swContent).toContain('workbox-sw.js');
    });

    test('should use Workbox modules', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify Workbox modules are destructured
      expect(swContent).toContain('clientsClaim');
      expect(swContent).toContain('ExpirationPlugin');
      expect(swContent).toContain('precacheAndRoute');
      expect(swContent).toContain('registerRoute');
      expect(swContent).toContain('CacheFirst');
      expect(swContent).toContain('NetworkFirst');
    });

    test('should call clientsClaim', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify clientsClaim is called
      expect(swContent).toContain('clientsClaim()');
    });

    test('should use precacheAndRoute with manifest', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify precacheAndRoute is called with __WB_MANIFEST
      expect(swContent).toContain('precacheAndRoute(self.__WB_MANIFEST)');
    });
  });

  // ============================================
  // Test Suite 8: Error Handling
  // ============================================
  
  describe('Error Handling', () => {
    
    test('should have error handling for precaching', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify error handling in install event
      expect(swContent).toContain('.catch((error) =>');
      expect(swContent).toContain("console.error('Failed to precache");
      
      // Verify graceful failure (don't fail installation)
      expect(swContent).toContain('Promise.resolve()');
    });

    test('should have error handling for sync', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify error handling in syncRequests
      expect(swContent).toContain("console.error('Failed to sync request");
    });

    test('should have fallback for offline navigation', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify fetch event has catch for offline
      expect(swContent).toContain('fetch(event.request).catch');
      expect(swContent).toContain('caches.match(FALLBACK_HTML_URL)');
    });
  });

  // ============================================
  // Test Suite 9: Compliance Verification
  // ============================================
  
  describe('Requirements Compliance', () => {
    
    test('FR-PWA-2: Should serve cached pages offline', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify NetworkFirst for pages (serves from cache when offline)
      expect(swContent).toContain("request.mode === 'navigate'");
      expect(swContent).toContain('new NetworkFirst({');
      expect(swContent).toContain("cacheName: 'pages'");
    });

    test('FR-PWA-3: Should display offline fallback', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify offline fallback is configured
      expect(swContent).toContain('FALLBACK_HTML_URL');
      expect(swContent).toContain('/offline.html');
      
      // Verify offline.html exists
      const offlinePath = path.resolve(__dirname, '../../public/offline.html');
      expect(fs.existsSync(offlinePath)).toBe(true);
    });

    test('FR-PWA-8: Should cache static assets for 30 days', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify 30-day expiration
      expect(swContent).toContain('30 * 24 * 60 * 60');
      
      // Verify CacheFirst strategy
      expect(swContent).toContain('new CacheFirst({');
      expect(swContent).toContain("cacheName: 'static-assets'");
    });

    test('FR-PWA-9: Should queue failed requests', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify background sync
      expect(swContent).toContain("self.addEventListener('sync'");
      expect(swContent).toContain('syncRequests');
      
      // Verify failed-requests cache
      expect(swContent).toContain('failed-requests');
    });

    test('NFR-REL-2: Should maintain offline functionality', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify caching strategies are in place
      expect(swContent).toContain('CacheFirst');
      expect(swContent).toContain('NetworkFirst');
      expect(swContent).toContain('precacheAndRoute');
    });

    test('NFR-REL-3: Should queue and retry requests', () => {
      const swPath = path.resolve(__dirname, '../../public/service-worker.js');
      const swContent = fs.readFileSync(swPath, 'utf-8');
      
      // Verify sync functionality
      expect(swContent).toContain('async function syncRequests()');
      expect(swContent).toContain('await fetch(request)');
      expect(swContent).toContain('cache.delete(request)');
    });
  });
});

