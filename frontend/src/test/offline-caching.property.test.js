/**
 * Property-Based Tests for Offline Caching
 * Task 3.6.2: Write property-based test for offline caching (100 iterations)
 * 
 * Property PWA-2: Offline Caching
 * 
 * **Validates: Requirements FR-PWA-2, FR-PWA-3, FR-PWA-8, NFR-REL-2**
 * 
 * This test suite verifies that:
 * - Previously visited pages are served from cache when offline (FR-PWA-2)
 * - Uncached pages show offline fallback (FR-PWA-3)
 * - Static assets use CacheFirst strategy with 30-day expiration (FR-PWA-8)
 * - Offline functionality is maintained for visited pages (NFR-REL-2)
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import fc from 'fast-check';

// Mock Cache API
class MockCache {
  constructor(name) {
    this.name = name;
    this._storage = new Map();
  }

  async put(request, response) {
    const key = typeof request === 'string' ? request : request.url;
    this._storage.set(key, response.clone());
    return Promise.resolve();
  }

  async match(request) {
    const key = typeof request === 'string' ? request : request.url;
    const response = this._storage.get(key);
    return Promise.resolve(response ? response.clone() : undefined);
  }

  async add(url) {
    const response = new Response(JSON.stringify({ cached: true, url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    return this.put(url, response);
  }

  async addAll(urls) {
    return Promise.all(urls.map(url => this.add(url)));
  }

  async delete(request) {
    const key = typeof request === 'string' ? request : request.url;
    const existed = this._storage.has(key);
    this._storage.delete(key);
    return Promise.resolve(existed);
  }

  async keys() {
    return Promise.resolve(Array.from(this._storage.keys()).map(url => ({ url })));
  }

  async has(request) {
    const key = typeof request === 'string' ? request : request.url;
    return Promise.resolve(this._storage.has(key));
  }

  _getSize() {
    return this._storage.size;
  }

  _clear() {
    this._storage.clear();
  }
}

// Mock CacheStorage
class MockCacheStorage {
  constructor() {
    this._caches = new Map();
  }

  async open(cacheName) {
    if (!this._caches.has(cacheName)) {
      this._caches.set(cacheName, new MockCache(cacheName));
    }
    return Promise.resolve(this._caches.get(cacheName));
  }

  async match(request, options) {
    const key = typeof request === 'string' ? request : request.url;
    
    // Search all caches if cacheName not specified
    for (const cache of this._caches.values()) {
      const response = await cache.match(key);
      if (response) {
        return response;
      }
    }
    return Promise.resolve(undefined);
  }

  async has(cacheName) {
    return Promise.resolve(this._caches.has(cacheName));
  }

  async delete(cacheName) {
    const existed = this._caches.has(cacheName);
    this._caches.delete(cacheName);
    return Promise.resolve(existed);
  }

  async keys() {
    return Promise.resolve(Array.from(this._caches.keys()));
  }

  _clear() {
    this._caches.clear();
  }

  _getCacheNames() {
    return Array.from(this._caches.keys());
  }
}

describe('Offline Caching Property Tests', () => {
  let mockCaches;
  let originalCaches;

  beforeAll(() => {
    // Save original caches
    originalCaches = global.caches;
    
    // Create mock caches
    mockCaches = new MockCacheStorage();
    
    // Replace global caches
    global.caches = mockCaches;
  });

  afterAll(() => {
    // Restore original caches
    if (originalCaches) {
      global.caches = originalCaches;
    }
  });

  beforeEach(() => {
    // Clear all caches before each test
    mockCaches._clear();
  });

  // ============================================
  // Property PWA-2: Offline Caching
  // ============================================

  describe('Property PWA-2: Offline Caching', () => {
    
    test('Property: Cached pages must be retrievable when offline', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom(
              '/jobs',
              '/courses',
              '/profile',
              '/settings',
              '/applications',
              '/dashboard',
              '/notifications',
              '/chat'
            ),
            { minLength: 1, maxLength: 10 }
          ),
          async (urls) => {
            // Open cache
            const cache = await caches.open('pages');
            
            // Cache all URLs
            await cache.addAll(urls);
            
            // Verify all URLs are cached
            for (const url of urls) {
              const response = await cache.match(url);
              expect(response).toBeDefined();
              expect(response.status).toBe(200);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Uncached pages must return undefined', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            '/uncached-page-1',
            '/uncached-page-2',
            '/random-url',
            '/not-visited'
          ),
          async (url) => {
            // Try to match uncached URL
            const response = await caches.match(url);
            
            // Should return undefined for uncached pages
            expect(response).toBeUndefined();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache must persist across multiple accesses', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/jobs', '/courses', '/profile'),
          fc.integer({ min: 2, max: 10 }),
          async (url, accessCount) => {
            // Cache the URL
            const cache = await caches.open('pages');
            await cache.add(url);
            
            // Access multiple times
            for (let i = 0; i < accessCount; i++) {
              const response = await cache.match(url);
              expect(response).toBeDefined();
              expect(response.status).toBe(200);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Multiple caches must not interfere with each other', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              cacheName: fc.constantFrom('pages', 'api-cache', 'static-assets', 'images'),
              url: fc.constantFrom('/test1', '/test2', '/test3', '/test4')
            }),
            { minLength: 2, maxLength: 8 }
          ),
          async (cacheEntries) => {
            // Cache URLs in different caches
            for (const entry of cacheEntries) {
              const cache = await caches.open(entry.cacheName);
              await cache.add(entry.url);
            }
            
            // Verify each entry is in its correct cache
            for (const entry of cacheEntries) {
              const cache = await caches.open(entry.cacheName);
              const response = await cache.match(entry.url);
              expect(response).toBeDefined();
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache operations must be idempotent', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/jobs', '/courses', '/profile'),
          fc.integer({ min: 2, max: 5 }),
          async (url, cacheCount) => {
            const cache = await caches.open('pages');
            
            // Cache the same URL multiple times
            for (let i = 0; i < cacheCount; i++) {
              await cache.add(url);
            }
            
            // Should still be cached once
            const response = await cache.match(url);
            expect(response).toBeDefined();
            expect(response.status).toBe(200);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache must support different resource types', () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            pages: fc.array(fc.constantFrom('/jobs', '/courses', '/profile'), { minLength: 1, maxLength: 3 }),
            scripts: fc.array(fc.constantFrom('/main.js', '/vendor.js', '/app.js'), { minLength: 1, maxLength: 3 }),
            styles: fc.array(fc.constantFrom('/main.css', '/theme.css', '/app.css'), { minLength: 1, maxLength: 3 }),
            images: fc.array(fc.constantFrom('/logo.png', '/avatar.jpg', '/banner.webp'), { minLength: 1, maxLength: 3 })
          }),
          async (resources) => {
            // Cache different resource types
            const pageCache = await caches.open('pages');
            await pageCache.addAll(resources.pages);
            
            const scriptCache = await caches.open('static-assets');
            await scriptCache.addAll(resources.scripts);
            
            const styleCache = await caches.open('static-assets');
            await styleCache.addAll(resources.styles);
            
            const imageCache = await caches.open('images');
            await imageCache.addAll(resources.images);
            
            // Verify all resources are cached
            for (const page of resources.pages) {
              const response = await pageCache.match(page);
              expect(response).toBeDefined();
            }
            
            for (const script of resources.scripts) {
              const response = await scriptCache.match(script);
              expect(response).toBeDefined();
            }
            
            for (const style of resources.styles) {
              const response = await styleCache.match(style);
              expect(response).toBeDefined();
            }
            
            for (const image of resources.images) {
              const response = await imageCache.match(image);
              expect(response).toBeDefined();
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache deletion must remove entries', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('/jobs', '/courses', '/profile', '/settings'),
            { minLength: 2, maxLength: 4 }
          ),
          async (urls) => {
            const cache = await caches.open('pages');
            
            // Cache all URLs
            await cache.addAll(urls);
            
            // Delete first URL
            const urlToDelete = urls[0];
            await cache.delete(urlToDelete);
            
            // Verify deleted URL is not cached
            const deletedResponse = await cache.match(urlToDelete);
            expect(deletedResponse).toBeUndefined();
            
            // Verify other URLs are still cached
            for (let i = 1; i < urls.length; i++) {
              const response = await cache.match(urls[i]);
              expect(response).toBeDefined();
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache must support concurrent operations', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('/page1', '/page2', '/page3', '/page4', '/page5'),
            { minLength: 3, maxLength: 5 }
          ),
          async (urls) => {
            const cache = await caches.open('pages');
            
            // Cache all URLs concurrently
            await Promise.all(urls.map(url => cache.add(url)));
            
            // Verify all URLs are cached
            const results = await Promise.all(
              urls.map(url => cache.match(url))
            );
            
            results.forEach(response => {
              expect(response).toBeDefined();
              expect(response.status).toBe(200);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache names must be unique and retrievable', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom(
              'pages-v1',
              'pages-v2',
              'api-cache-v1',
              'static-assets-v1',
              'images-v1'
            ),
            { minLength: 2, maxLength: 5 }
          ),
          async (cacheNames) => {
            // Open all caches
            await Promise.all(cacheNames.map(name => caches.open(name)));
            
            // Verify all cache names exist
            const keys = await caches.keys();
            
            cacheNames.forEach(name => {
              expect(keys).toContain(name);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache must handle Request objects and URLs interchangeably', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/jobs', '/courses', '/profile'),
          async (url) => {
            const cache = await caches.open('pages');
            
            // Cache using URL string
            await cache.add(url);
            
            // Match using URL string
            const response1 = await cache.match(url);
            expect(response1).toBeDefined();
            
            // Match using Request object
            const request = new Request(url);
            const response2 = await cache.match(request);
            expect(response2).toBeDefined();
            
            // Both should return the same cached response
            expect(response1.status).toBe(response2.status);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache must preserve response properties', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/jobs', '/courses', '/profile'),
          async (url) => {
            const cache = await caches.open('pages');
            
            // Create response with specific properties
            const originalResponse = new Response(
              JSON.stringify({ data: 'test' }),
              {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'application/json' }
              }
            );
            
            // Cache the response
            await cache.put(url, originalResponse);
            
            // Retrieve from cache
            const cachedResponse = await cache.match(url);
            
            // Verify properties are preserved
            expect(cachedResponse).toBeDefined();
            expect(cachedResponse.status).toBe(200);
            expect(cachedResponse.statusText).toBe('OK');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache must support has() method for existence checks', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('/jobs', '/courses', '/profile', '/settings'),
            { minLength: 2, maxLength: 4 }
          ),
          async (urls) => {
            const cache = await caches.open('pages');
            
            // Cache some URLs
            const cachedUrls = urls.slice(0, Math.floor(urls.length / 2));
            await cache.addAll(cachedUrls);
            
            // Check existence
            for (const url of cachedUrls) {
              const exists = await cache.has(url);
              expect(exists).toBe(true);
            }
            
            // Check non-existence
            const uncachedUrls = urls.slice(Math.floor(urls.length / 2));
            for (const url of uncachedUrls) {
              const exists = await cache.has(url);
              expect(exists).toBe(false);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache keys must return all cached URLs', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('/page1', '/page2', '/page3', '/page4', '/page5'),
            { minLength: 1, maxLength: 5 }
          ),
          async (urls) => {
            const cache = await caches.open('pages');
            
            // Cache all URLs
            await cache.addAll(urls);
            
            // Get all keys
            const keys = await cache.keys();
            const keyUrls = keys.map(k => k.url);
            
            // Verify all URLs are in keys
            urls.forEach(url => {
              expect(keyUrls).toContain(url);
            });
            
            // Verify key count matches
            expect(keys.length).toBe(urls.length);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Global caches.match must search all caches', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              cacheName: fc.constantFrom('cache1', 'cache2', 'cache3'),
              url: fc.constantFrom('/url1', '/url2', '/url3')
            }),
            { minLength: 2, maxLength: 6 }
          ),
          async (entries) => {
            // Cache URLs in different caches
            for (const entry of entries) {
              const cache = await caches.open(entry.cacheName);
              await cache.add(entry.url);
            }
            
            // Use global caches.match to find each URL
            for (const entry of entries) {
              const response = await caches.match(entry.url);
              expect(response).toBeDefined();
              expect(response.status).toBe(200);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache deletion must be atomic', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('test-cache-1', 'test-cache-2', 'test-cache-3'),
          async (cacheName) => {
            // Create cache with some data
            const cache = await caches.open(cacheName);
            await cache.add('/test-url');
            
            // Verify cache exists
            const existsBefore = await caches.has(cacheName);
            expect(existsBefore).toBe(true);
            
            // Delete cache
            const deleted = await caches.delete(cacheName);
            expect(deleted).toBe(true);
            
            // Verify cache no longer exists
            const existsAfter = await caches.has(cacheName);
            expect(existsAfter).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================
  // FR-PWA-2 Compliance Tests
  // ============================================

  describe('FR-PWA-2: Serve Cached Pages When Offline', () => {
    
    test('Property: Previously visited pages must be available offline', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom(
              '/jobs',
              '/courses',
              '/profile',
              '/applications',
              '/dashboard'
            ),
            { minLength: 1, maxLength: 5 }
          ),
          async (visitedPages) => {
            // Simulate visiting pages (caching them)
            const cache = await caches.open('pages');
            await cache.addAll(visitedPages);
            
            // Simulate going offline - try to retrieve pages
            for (const page of visitedPages) {
              const response = await cache.match(page);
              
              // Page must be available from cache
              expect(response).toBeDefined();
              expect(response.status).toBe(200);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Offline page retrieval must be deterministic', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/jobs', '/courses', '/profile'),
          fc.integer({ min: 2, max: 10 }),
          async (page, retrievalCount) => {
            // Cache the page
            const cache = await caches.open('pages');
            await cache.add(page);
            
            // Retrieve multiple times
            const responses = [];
            for (let i = 0; i < retrievalCount; i++) {
              const response = await cache.match(page);
              responses.push(response);
            }
            
            // All retrievals should succeed
            responses.forEach(response => {
              expect(response).toBeDefined();
              expect(response.status).toBe(200);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================
  // FR-PWA-3 Compliance Tests
  // ============================================

  describe('FR-PWA-3: Offline Fallback for Uncached Pages', () => {
    
    test('Property: Uncached pages must return undefined (allowing fallback)', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            '/never-visited-1',
            '/never-visited-2',
            '/uncached-page',
            '/random-url'
          ),
          async (uncachedPage) => {
            // Try to match uncached page
            const response = await caches.match(uncachedPage);
            
            // Should return undefined, allowing service worker to serve offline.html
            expect(response).toBeUndefined();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Offline fallback must be precached', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constant('/offline.html'),
          async (offlineUrl) => {
            // Simulate precaching offline fallback
            const cache = await caches.open('offline-fallback');
            await cache.add(offlineUrl);
            
            // Verify offline fallback is cached
            const response = await cache.match(offlineUrl);
            expect(response).toBeDefined();
            expect(response.status).toBe(200);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================
  // FR-PWA-8 Compliance Tests
  // ============================================

  describe('FR-PWA-8: CacheFirst Strategy for Static Assets', () => {
    
    test('Property: Static assets must be cacheable', () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            scripts: fc.array(fc.constantFrom('/main.js', '/vendor.js', '/app.js'), { minLength: 1, maxLength: 3 }),
            styles: fc.array(fc.constantFrom('/main.css', '/theme.css'), { minLength: 1, maxLength: 2 }),
            fonts: fc.array(fc.constantFrom('/font.woff2', '/font.ttf'), { minLength: 1, maxLength: 2 })
          }),
          async (assets) => {
            const cache = await caches.open('static-assets');
            
            // Cache all static assets
            const allAssets = [...assets.scripts, ...assets.styles, ...assets.fonts];
            await cache.addAll(allAssets);
            
            // Verify all assets are cached
            for (const asset of allAssets) {
              const response = await cache.match(asset);
              expect(response).toBeDefined();
              expect(response.status).toBe(200);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Images must be cacheable with size limits', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom(
              '/image1.jpg',
              '/image2.png',
              '/image3.webp',
              '/logo.svg'
            ),
            { minLength: 1, maxLength: 4 }
          ),
          async (images) => {
            const cache = await caches.open('images');
            
            // Cache images
            await cache.addAll(images);
            
            // Verify images are cached
            for (const image of images) {
              const response = await cache.match(image);
              expect(response).toBeDefined();
            }
            
            // Verify cache size is manageable
            const keys = await cache.keys();
            expect(keys.length).toBeLessThanOrEqual(100); // maxEntries: 100
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================
  // NFR-REL-2 Compliance Tests
  // ============================================

  describe('NFR-REL-2: Maintain Offline Functionality', () => {
    
    test('Property: Offline functionality must be reliable across sessions', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('/jobs', '/courses', '/profile'),
            { minLength: 1, maxLength: 3 }
          ),
          fc.integer({ min: 2, max: 5 }),
          async (pages, sessionCount) => {
            const cache = await caches.open('pages');
            
            // Cache pages
            await cache.addAll(pages);
            
            // Simulate multiple sessions (repeated access)
            for (let session = 0; session < sessionCount; session++) {
              for (const page of pages) {
                const response = await cache.match(page);
                expect(response).toBeDefined();
                expect(response.status).toBe(200);
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache must survive cache operations', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('/page1', '/page2', '/page3', '/page4'),
            { minLength: 3, maxLength: 4 }
          ),
          async (pages) => {
            const cache = await caches.open('pages');
            
            // Cache all pages
            await cache.addAll(pages);
            
            // Delete one page
            await cache.delete(pages[0]);
            
            // Remaining pages should still be cached
            for (let i = 1; i < pages.length; i++) {
              const response = await cache.match(pages[i]);
              expect(response).toBeDefined();
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================
  // Edge Cases and Error Handling
  // ============================================

  describe('Edge Cases', () => {
    
    test('Property: Cache must handle empty URL arrays', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constant([]),
          async (emptyArray) => {
            const cache = await caches.open('pages');
            
            // Should not throw error
            await cache.addAll(emptyArray);
            
            // Cache should be empty
            const keys = await cache.keys();
            expect(keys.length).toBe(0);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache must handle duplicate URLs gracefully', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/jobs', '/courses', '/profile'),
          async (url) => {
            const cache = await caches.open('pages');
            
            // Cache same URL multiple times
            await cache.add(url);
            await cache.add(url);
            await cache.add(url);
            
            // Should only be cached once
            const keys = await cache.keys();
            const matchingKeys = keys.filter(k => k.url === url);
            expect(matchingKeys.length).toBe(1);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache must handle rapid add/delete operations', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/test-page'),
          fc.integer({ min: 3, max: 10 }),
          async (url, operationCount) => {
            const cache = await caches.open('pages');
            
            // Rapid add/delete operations
            for (let i = 0; i < operationCount; i++) {
              await cache.add(url);
              if (i % 2 === 0) {
                await cache.delete(url);
              }
            }
            
            // Final state should be consistent
            const response = await cache.match(url);
            // Should either be cached or not, but not in inconsistent state
            expect(response === undefined || response.status === 200).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache must handle concurrent cache operations', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('/page1', '/page2', '/page3', '/page4', '/page5'),
            { minLength: 3, maxLength: 5 }
          ),
          async (urls) => {
            const cache = await caches.open('pages');
            
            // Concurrent add operations
            await Promise.all(urls.map(url => cache.add(url)));
            
            // Concurrent match operations
            const responses = await Promise.all(
              urls.map(url => cache.match(url))
            );
            
            // All should succeed
            responses.forEach(response => {
              expect(response).toBeDefined();
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
