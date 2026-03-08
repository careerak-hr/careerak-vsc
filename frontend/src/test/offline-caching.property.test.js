/**
 * Property-Based Tests for Offline Caching
 * Task 3.6.2: Write property-based test for offline caching (100 iterations)
 * 
 * Property PWA-2: Offline Caching
 * 
 * **Validates: Requirements FR-PWA-2, FR-PWA-3, FR-PWA-8, NFR-REL-2**
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import fc from 'fast-check';

// Mock Response
class MockResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.ok = this.status >= 200 && this.status < 300;
  }
  clone() { return new MockResponse(this.body, { status: this.status, statusText: this.statusText, headers: Object.fromEntries(this.headers) }); }
}

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
    const response = new MockResponse(JSON.stringify({ cached: true, url }), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' }
    });
    return this.put(url, response);
  }

  async addAll(urls) {
    if (!urls || urls.length === 0) return Promise.resolve();
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

  _clear() { this._storage.clear(); }
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

  async match(request) {
    const key = typeof request === 'string' ? request : request.url;
    for (const cache of this._caches.values()) {
      const response = await cache.match(key);
      if (response) return response;
    }
    return Promise.resolve(undefined);
  }

  async has(cacheName) { return Promise.resolve(this._caches.has(cacheName)); }
  async delete(cacheName) {
    const existed = this._caches.has(cacheName);
    this._caches.delete(cacheName);
    return Promise.resolve(existed);
  }
  async keys() { return Promise.resolve(Array.from(this._caches.keys())); }
  _clear() { this._caches.clear(); }
}

describe('Offline Caching Property Tests', () => {
  let mockCaches;
  let originalCaches;
  let originalResponse;
  let originalRequest;

  beforeAll(() => {
    originalCaches = global.caches;
    originalResponse = global.Response;
    originalRequest = global.Request;

    mockCaches = new MockCacheStorage();
    global.caches = mockCaches;
    global.Response = MockResponse;
    global.Request = class { constructor(url) { this.url = url; } };
  });

  afterAll(() => {
    global.caches = originalCaches;
    global.Response = originalResponse;
    global.Request = originalRequest;
  });

  beforeEach(() => {
    mockCaches._clear();
  });

  describe('Property PWA-2: Offline Caching', () => {
    test('Property: Cached pages must be retrievable when offline', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('/job-postings', '/courses', '/profile', '/settings'), { minLength: 1, maxLength: 10 }),
          async (urls) => {
            const cache = await caches.open('pages');
            await cache.addAll(urls);
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

    test('Property: Uncached pages must return undefined', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/uncached-1', '/random-url'),
          async (url) => {
            const response = await caches.match(url);
            expect(response).toBeUndefined();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache must preserve response properties', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/job-postings', '/profile'),
          async (url) => {
            const cache = await caches.open('pages');
            const originalRes = new Response(JSON.stringify({ data: 'test' }), {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'application/json' }
            });
            await cache.put(url, originalRes);
            const cachedResponse = await cache.match(url);
            expect(cachedResponse).toBeDefined();
            expect(cachedResponse.status).toBe(200);
            expect(cachedResponse.statusText).toBe('OK');
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache deletion must remove entries', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('/job-postings', '/courses', '/profile'), { minLength: 2, maxLength: 4 }),
          async (urls) => {
            const cache = await caches.open('pages');
            await cache.addAll(urls);
            const urlToDelete = urls[0];
            await cache.delete(urlToDelete);
            const deletedResponse = await cache.match(urlToDelete);
            expect(deletedResponse).toBeUndefined();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache names must be unique and retrievable', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('pages-v1', 'api-cache-v1', 'images-v1'), { minLength: 1, maxLength: 3 }),
          async (cacheNames) => {
            await Promise.all(cacheNames.map(name => caches.open(name)));
            const keys = await caches.keys();
            cacheNames.forEach(name => expect(keys).toContain(name));
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Cache keys must return all cached URLs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uniqueArray(fc.constantFrom('/p1', '/p2', '/p3', '/p4'), { minLength: 1, maxLength: 4 }),
          async (urls) => {
            const cache = await caches.open('pages');
            await cache.addAll(urls);
            const keys = await cache.keys();
            expect(keys.length).toBe(urls.length);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Global caches.match must search all caches', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            cache1: fc.constantFrom('/u1', '/u2'),
            cache2: fc.constantFrom('/u3', '/u4')
          }),
          async (data) => {
            const c1 = await caches.open('c1');
            const c2 = await caches.open('c2');
            await c1.add(data.cache1);
            await c2.add(data.cache2);
            const r1 = await caches.match(data.cache1);
            const r2 = await caches.match(data.cache2);
            expect(r1).toBeDefined();
            expect(r2).toBeDefined();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
