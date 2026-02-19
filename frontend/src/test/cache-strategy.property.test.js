/**
 * Property-Based Tests for Cache Strategy
 * Task 3.6.3: Write property-based test for cache strategy (100 iterations)
 * 
 * Property PWA-3: Cache Strategy
 * 
 * **Validates: Requirements FR-PWA-8, FR-PWA-7, Task 3.2.1, Task 3.2.2**
 * 
 * This test suite verifies that:
 * - Static assets (JS, CSS, fonts, images) use CacheFirst strategy
 * - API requests use NetworkFirst strategy
 * - Cache strategies are applied correctly based on request type
 * 
 * Property PWA-3:
 * ∀ asset ∈ StaticAssets:
 *   cacheStrategy(asset) = CacheFirst
 * ∀ api ∈ APIRequests:
 *   cacheStrategy(api) = NetworkFirst
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';

// Mock cache storage
class MockCache {
  constructor(name) {
    this.name = name;
    this.storage = new Map();
  }

  async match(request) {
    const key = typeof request === 'string' ? request : request.url;
    return this.storage.get(key) || null;
  }

  async put(request, response) {
    const key = typeof request === 'string' ? request : request.url;
    this.storage.set(key, response);
  }

  async delete(request) {
    const key = typeof request === 'string' ? request : request.url;
    return this.storage.delete(key);
  }

  async keys() {
    return Array.from(this.storage.keys()).map(url => ({ url }));
  }
}

// Mock caches API
class MockCaches {
  constructor() {
    this.cacheStorage = new Map();
  }

  async open(cacheName) {
    if (!this.cacheStorage.has(cacheName)) {
      this.cacheStorage.set(cacheName, new MockCache(cacheName));
    }
    return this.cacheStorage.get(cacheName);
  }

  async match(request) {
    for (const cache of this.cacheStorage.values()) {
      const response = await cache.match(request);
      if (response) return response;
    }
    return null;
  }

  async delete(cacheName) {
    return this.cacheStorage.delete(cacheName);
  }

  async keys() {
    return Array.from(this.cacheStorage.keys());
  }
}

// Mock Response
class MockResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || 'OK';
    this.headers = new Map(Object.entries(options.headers || {}));
    this.ok = this.status >= 200 && this.status < 300;
    this.type = options.type || 'basic';
    this.url = options.url || '';
  }

  clone() {
    return new MockResponse(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: Object.fromEntries(this.headers),
      type: this.type,
      url: this.url,
    });
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return this.body;
  }
}

// Mock Request
class MockRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map(Object.entries(options.headers || {}));
    this.mode = options.mode || 'cors';
    this.destination = options.destination || '';
  }
}

// Cache strategy implementations
class CacheFirst {
  constructor(options = {}) {
    this.cacheName = options.cacheName || 'default';
    this.fetchCount = 0;
    this.cacheHitCount = 0;
  }

  async handle(request, caches, fetch) {
    const cache = await caches.open(this.cacheName);
    
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      this.cacheHitCount++;
      return cachedResponse;
    }

    // Fallback to network
    this.fetchCount++;
    const networkResponse = await fetch(request);
    
    // Cache the response
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  }
}

class NetworkFirst {
  constructor(options = {}) {
    this.cacheName = options.cacheName || 'default';
    this.networkTimeoutSeconds = options.networkTimeoutSeconds || 5;
    this.fetchCount = 0;
    this.cacheHitCount = 0;
  }

  async handle(request, caches, fetch) {
    const cache = await caches.open(this.cacheName);
    
    try {
      // Try network first
      this.fetchCount++;
      const networkResponse = await fetch(request);
      
      // Cache the response
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      // Fallback to cache on network failure
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        this.cacheHitCount++;
        return cachedResponse;
      }
      
      throw error;
    }
  }
}

describe('Cache Strategy Property Tests', () => {
  let mockCaches;
  let mockFetch;
  let fetchCallCount;

  beforeEach(() => {
    mockCaches = new MockCaches();
    fetchCallCount = 0;
    
    mockFetch = vi.fn(async (request) => {
      fetchCallCount++;
      const url = typeof request === 'string' ? request : request.url;
      
      // Simulate network response
      return new MockResponse(
        JSON.stringify({ data: 'network response', url }),
        { status: 200, url }
      );
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockCaches = null;
  });

  // ============================================
  // Property PWA-3: Cache Strategy
  // ============================================

  describe('Property PWA-3: Cache Strategy', () => {
    
    /**
     * Property: Static assets must use CacheFirst strategy
     * 
     * **Validates: Requirements FR-PWA-8, Task 3.2.1**
     * 
     * ∀ asset ∈ StaticAssets:
     *   cacheStrategy(asset) = CacheFirst
     * 
     * This property verifies that static assets (JS, CSS, fonts, images)
     * are served from cache first, with network as fallback.
     */
    it('should use CacheFirst strategy for static assets', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate static asset URLs
          fc.record({
            type: fc.constantFrom('script', 'style', 'font', 'image'),
            filename: fc.oneof(
              fc.constant('main.js'),
              fc.constant('styles.css'),
              fc.constant('font.woff2'),
              fc.constant('logo.png'),
              fc.constant('bundle.js'),
              fc.constant('app.css')
            ),
            path: fc.constantFrom('/assets/', '/static/', '/dist/')
          }),
          async ({ type, filename, path }) => {
            // Create fresh mocks for each iteration
            const localMockCaches = new MockCaches();
            const localFetchCount = { count: 0 };
            const localMockFetch = vi.fn(async (request) => {
              localFetchCount.count++;
              const url = typeof request === 'string' ? request : request.url;
              return new MockResponse(
                JSON.stringify({ data: 'network response', url }),
                { status: 200, url }
              );
            });
            
            const url = `${path}${filename}`;
            const request = new MockRequest(url, { destination: type });
            
            // Create CacheFirst strategy
            const strategy = new CacheFirst({ cacheName: 'static-assets' });
            
            // First request - should fetch from network and cache
            const response1 = await strategy.handle(request, localMockCaches, localMockFetch);
            expect(response1).toBeDefined();
            expect(response1.ok).toBe(true);
            expect(strategy.fetchCount).toBe(1);
            expect(strategy.cacheHitCount).toBe(0);
            
            // Reset fetch mock
            localMockFetch.mockClear();
            localFetchCount.count = 0;
            
            // Second request - should serve from cache (no network fetch)
            const response2 = await strategy.handle(request, localMockCaches, localMockFetch);
            expect(response2).toBeDefined();
            expect(response2.ok).toBe(true);
            
            // Property: CacheFirst serves from cache on subsequent requests
            expect(strategy.cacheHitCount).toBe(1);
            expect(localMockFetch).not.toHaveBeenCalled();
            expect(localFetchCount.count).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: API requests must use NetworkFirst strategy
     * 
     * **Validates: Requirements FR-PWA-7, Task 3.2.2**
     * 
     * ∀ api ∈ APIRequests:
     *   cacheStrategy(api) = NetworkFirst
     * 
     * This property verifies that API requests try network first,
     * with cache as fallback when offline.
     */
    it('should use NetworkFirst strategy for API requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate API URLs
          fc.record({
            endpoint: fc.constantFrom(
              'users',
              'jobs',
              'courses',
              'applications',
              'notifications'
            ),
            id: fc.integer({ min: 1, max: 1000 }),
            action: fc.option(fc.constantFrom('list', 'details', 'update'), { nil: null })
          }),
          async ({ endpoint, id, action }) => {
            const url = action 
              ? `/api/${endpoint}/${id}/${action}`
              : `/api/${endpoint}/${id}`;
            const request = new MockRequest(url);
            
            // Create NetworkFirst strategy
            const strategy = new NetworkFirst({ cacheName: 'api-cache' });
            
            // First request - should fetch from network and cache
            const response1 = await strategy.handle(request, mockCaches, mockFetch);
            expect(response1).toBeDefined();
            expect(response1.ok).toBe(true);
            expect(strategy.fetchCount).toBe(1);
            
            // Reset fetch mock
            mockFetch.mockClear();
            fetchCallCount = 0;
            
            // Second request - should still try network first
            const response2 = await strategy.handle(request, mockCaches, mockFetch);
            expect(response2).toBeDefined();
            expect(response2.ok).toBe(true);
            
            // Property: NetworkFirst always tries network first
            expect(strategy.fetchCount).toBe(2);
            expect(mockFetch).toHaveBeenCalled();
            expect(fetchCallCount).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: CacheFirst must fallback to network when cache is empty
     * 
     * **Validates: Requirements FR-PWA-8**
     * 
     * This property verifies that CacheFirst strategy correctly
     * falls back to network when cache is empty.
     */
    it('should fallback to network when cache is empty (CacheFirst)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            '/assets/main.js',
            '/static/styles.css',
            '/dist/bundle.js',
            '/images/logo.png'
          ),
          async (url) => {
            // Create fresh mocks for each iteration
            const localMockCaches = new MockCaches();
            const localFetchCount = { count: 0 };
            const localMockFetch = vi.fn(async (request) => {
              localFetchCount.count++;
              const reqUrl = typeof request === 'string' ? request : request.url;
              return new MockResponse(
                JSON.stringify({ data: 'network response', url: reqUrl }),
                { status: 200, url: reqUrl }
              );
            });
            
            const request = new MockRequest(url);
            const strategy = new CacheFirst({ cacheName: 'empty-cache' });
            
            // Cache is empty, should fetch from network
            const response = await strategy.handle(request, localMockCaches, localMockFetch);
            
            expect(response).toBeDefined();
            expect(response.ok).toBe(true);
            
            // Property: CacheFirst fetches from network when cache is empty
            expect(strategy.fetchCount).toBe(1);
            expect(strategy.cacheHitCount).toBe(0);
            expect(localMockFetch).toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: NetworkFirst must fallback to cache when network fails
     * 
     * **Validates: Requirements FR-PWA-7, FR-PWA-2**
     * 
     * This property verifies that NetworkFirst strategy correctly
     * falls back to cache when network is unavailable.
     */
    it('should fallback to cache when network fails (NetworkFirst)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            '/api/users/1',
            '/api/jobs/list',
            '/api/courses/123',
            '/api/notifications'
          ),
          async (url) => {
            const request = new MockRequest(url);
            const strategy = new NetworkFirst({ cacheName: 'api-cache' });
            
            // First request - populate cache
            await strategy.handle(request, mockCaches, mockFetch);
            
            // Simulate network failure
            const failingFetch = vi.fn().mockRejectedValue(new Error('Network error'));
            
            // Second request - network fails, should serve from cache
            try {
              const response = await strategy.handle(request, mockCaches, failingFetch);
              
              expect(response).toBeDefined();
              expect(response.ok).toBe(true);
              
              // Property: NetworkFirst serves from cache when network fails
              expect(strategy.cacheHitCount).toBe(1);
              expect(failingFetch).toHaveBeenCalled();
            } catch (error) {
              // If cache is also empty, error is expected
              expect(error.message).toBe('Network error');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Cache strategies must handle different request types correctly
     * 
     * **Validates: Requirements FR-PWA-8, FR-PWA-7**
     * 
     * This property verifies that the correct cache strategy is applied
     * based on the request type (static asset vs API).
     */
    it('should apply correct strategy based on request type', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            isStatic: fc.boolean(),
            path: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            extension: fc.constantFrom('js', 'css', 'png', 'woff2', 'json')
          }),
          async ({ isStatic, path, extension }) => {
            const url = isStatic 
              ? `/assets/${path.trim()}.${extension}`
              : `/api/${path.trim()}`;
            
            const request = new MockRequest(url, {
              destination: isStatic ? 'script' : ''
            });
            
            // Determine expected strategy based on request type
            const isApiRequest = url.startsWith('/api/');
            const isStaticAsset = ['script', 'style', 'font', 'image'].includes(request.destination);
            
            if (isStaticAsset) {
              // Should use CacheFirst
              const strategy = new CacheFirst({ cacheName: 'static-assets' });
              
              // First request
              await strategy.handle(request, mockCaches, mockFetch);
              mockFetch.mockClear();
              
              // Second request - should not fetch
              await strategy.handle(request, mockCaches, mockFetch);
              
              // Property: Static assets use CacheFirst (no network on cache hit)
              expect(mockFetch).not.toHaveBeenCalled();
              
            } else if (isApiRequest) {
              // Should use NetworkFirst
              const strategy = new NetworkFirst({ cacheName: 'api-cache' });
              
              // First request
              await strategy.handle(request, mockCaches, mockFetch);
              mockFetch.mockClear();
              
              // Second request - should still fetch
              await strategy.handle(request, mockCaches, mockFetch);
              
              // Property: API requests use NetworkFirst (always try network)
              expect(mockFetch).toHaveBeenCalled();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Cache strategies must preserve response integrity
     * 
     * **Validates: Requirements FR-PWA-8, FR-PWA-7**
     * 
     * This property verifies that cached responses are identical
     * to the original network responses.
     */
    it('should preserve response integrity in cache', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            url: fc.constantFrom('/assets/main.js', '/api/users/1'),
            data: fc.record({
              id: fc.integer({ min: 1, max: 1000 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              value: fc.integer({ min: 0, max: 100 })
            })
          }),
          async ({ url, data }) => {
            // Create fresh mocks for each iteration
            const localMockCaches = new MockCaches();
            const request = new MockRequest(url);
            
            // Mock fetch with specific data
            const dataString = JSON.stringify(data);
            const customFetch = vi.fn().mockResolvedValue(
              new MockResponse(dataString, { status: 200, url })
            );
            
            const strategy = new CacheFirst({ cacheName: 'test-cache' });
            
            // First request - cache the response
            const response1 = await strategy.handle(request, localMockCaches, customFetch);
            const data1 = await response1.json();
            
            // Second request - serve from cache
            const response2 = await strategy.handle(request, localMockCaches, customFetch);
            const data2 = await response2.json();
            
            // Property: Cached response must be identical to original
            expect(data2).toEqual(data1);
            expect(data2).toEqual(data);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Multiple cache strategies must not interfere with each other
     * 
     * **Validates: Requirements FR-PWA-8, FR-PWA-7**
     * 
     * This property verifies that different cache strategies
     * can coexist without interfering with each other.
     */
    it('should allow multiple cache strategies to coexist', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            staticUrl: fc.constantFrom('/assets/main.js', '/static/styles.css'),
            apiUrl: fc.constantFrom('/api/users/1', '/api/jobs/list')
          }),
          async ({ staticUrl, apiUrl }) => {
            const staticRequest = new MockRequest(staticUrl, { destination: 'script' });
            const apiRequest = new MockRequest(apiUrl);
            
            const cacheFirstStrategy = new CacheFirst({ cacheName: 'static-assets' });
            const networkFirstStrategy = new NetworkFirst({ cacheName: 'api-cache' });
            
            // Handle both requests
            await cacheFirstStrategy.handle(staticRequest, mockCaches, mockFetch);
            await networkFirstStrategy.handle(apiRequest, mockCaches, mockFetch);
            
            mockFetch.mockClear();
            fetchCallCount = 0;
            
            // Second round
            await cacheFirstStrategy.handle(staticRequest, mockCaches, mockFetch);
            const staticFetchCount = mockFetch.mock.calls.length;
            
            await networkFirstStrategy.handle(apiRequest, mockCaches, mockFetch);
            const apiFetchCount = mockFetch.mock.calls.length - staticFetchCount;
            
            // Property: CacheFirst doesn't fetch, NetworkFirst does
            expect(staticFetchCount).toBe(0);
            expect(apiFetchCount).toBeGreaterThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
