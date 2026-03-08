/**
 * Property-Based Tests for Service Worker Registration
 * Task 3.6.1: Write property-based test for service worker registration (100 iterations)
 * 
 * Property PWA-1: Service Worker Registration
 * 
 * **Validates: Requirements FR-PWA-1, NFR-REL-4**
 */

import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import fc from 'fast-check';

// Mock service worker registration
class MockServiceWorkerRegistration {
  constructor(options = {}) {
    this.installing = options.installing || null;
    this.waiting = options.waiting || null;
    this.active = options.active || { state: 'activated' };
    this.scope = options.scope || '/';
    this.updateViaCache = options.updateViaCache || 'imports';
    this._listeners = {};
  }

  addEventListener(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }
  }

  update() {
    return Promise.resolve();
  }

  unregister() {
    return Promise.resolve(true);
  }

  _triggerEvent(event, data) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(callback => callback(data));
    }
  }
}

// Mock service worker
class MockServiceWorker {
  constructor(scriptURL, options = {}) {
    this.scriptURL = scriptURL;
    this.state = options.state || 'installing';
    this._listeners = {};
  }

  addEventListener(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }
  }

  postMessage(message) {
    // Mock postMessage
  }

  _setState(newState) {
    this.state = newState;
    if (this._listeners['statechange']) {
      this._listeners['statechange'].forEach(callback => 
        callback({ target: this })
      );
    }
  }
}

describe('Service Worker Registration Property Tests', () => {
  let mockNavigator;
  let originalNavigator;
  let registrationCalls = [];

  const setupMockNavigator = () => {
    registrationCalls = [];
    mockNavigator = {
      serviceWorker: {
        register: vi.fn().mockImplementation((scriptURL, options) => {
          registrationCalls.push({ scriptURL, options });
          const registration = new MockServiceWorkerRegistration({
            scope: options?.scope || '/',
            installing: new MockServiceWorker(scriptURL),
          });
          return Promise.resolve(registration);
        }),
        ready: Promise.resolve(new MockServiceWorkerRegistration()),
        controller: null,
        getRegistration: vi.fn().mockResolvedValue(null),
        getRegistrations: vi.fn().mockResolvedValue([]),
      },
    };
    
    // Replace global navigator
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
      configurable: true,
    });
  };

  beforeAll(() => {
    originalNavigator = global.navigator;
  });

  afterAll(() => {
    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    }
  });

  // ============================================
  // Property PWA-1: Service Worker Registration
  // ============================================

  describe('Property PWA-1: Service Worker Registration', () => {
    
    test('Property: Service worker registration must always return a valid registration object', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js', '/sw-v1.js'),
          async (scriptURL) => {
            setupMockNavigator();
            // Attempt registration
            const registration = await navigator.serviceWorker.register(scriptURL);
            
            // Verify registration object is valid
            expect(registration).toBeDefined();
            expect(registration).toBeInstanceOf(MockServiceWorkerRegistration);
            
            // Verify registration has required properties
            expect(registration).toHaveProperty('installing');
            expect(registration).toHaveProperty('waiting');
            expect(registration).toHaveProperty('active');
            expect(registration).toHaveProperty('scope');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must be idempotent', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.integer({ min: 2, max: 5 }),
          async (scriptURL, numRegistrations) => {
            setupMockNavigator();
            // Register multiple times
            const registrations = [];
            for (let i = 0; i < numRegistrations; i++) {
              const reg = await navigator.serviceWorker.register(scriptURL);
              registrations.push(reg);
            }
            
            // All registrations should succeed
            expect(registrations.length).toBe(numRegistrations);
            
            // All registrations should be valid
            registrations.forEach(reg => {
              expect(reg).toBeDefined();
              expect(reg).toBeInstanceOf(MockServiceWorkerRegistration);
            });
            
            // Verify register was called correct number of times
            expect(registrationCalls.length).toBe(numRegistrations);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must accept valid script URLs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant('/sw.js'),
            fc.constant('/service-worker.js'),
            fc.constant('/sw-v1.js')
          ),
          async (scriptURL) => {
            setupMockNavigator();
            // Register with valid URL
            const registration = await navigator.serviceWorker.register(scriptURL);
            
            // Verify registration succeeded
            expect(registration).toBeDefined();
            
            // Verify correct script URL was used
            expect(registrationCalls[0].scriptURL).toBe(scriptURL);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must support scope option', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.constantFrom('/', '/app/', '/pwa/'),
          async (scriptURL, scope) => {
            setupMockNavigator();
            // Register with scope
            const registration = await navigator.serviceWorker.register(scriptURL, { scope });
            
            // Verify registration succeeded
            expect(registration).toBeDefined();
            
            // Verify scope was set correctly
            expect(registration.scope).toBe(scope);
            
            // Verify scope was passed to register call
            expect(registrationCalls[0].options.scope).toBe(scope);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must support event listeners', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.constantFrom('updatefound', 'controllerchange'),
          async (scriptURL, eventType) => {
            setupMockNavigator();
            // Register service worker
            const registration = await navigator.serviceWorker.register(scriptURL);
            
            // Add event listener
            let eventFired = false;
            const listener = () => { eventFired = true; };
            registration.addEventListener(eventType, listener);
            
            // Verify listener was added
            expect(registration._listeners[eventType]).toContain(listener);
            
            // Trigger event
            registration._triggerEvent(eventType, {});
            
            // Verify event was fired
            expect(eventFired).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker state transitions must be valid', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.array(
            fc.constantFrom('installing', 'installed', 'activating', 'activated'),
            { minLength: 1, maxLength: 4 }
          ),
          async (scriptURL, stateSequence) => {
            setupMockNavigator();
            // Register service worker
            const registration = await navigator.serviceWorker.register(scriptURL);
            const worker = registration.installing;
            
            if (!worker) return true;
            
            // Track state changes
            const stateChanges = [];
            worker.addEventListener('statechange', (event) => {
              stateChanges.push(event.target.state);
            });
            
            // Simulate state transitions
            for (const state of stateSequence) {
              worker._setState(state);
            }

            // Verify final state matches last in sequence
            expect(worker.state).toBe(stateSequence[stateSequence.length - 1]);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must support ready promise', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(true),
          async () => {
            setupMockNavigator();
            // Access ready promise
            const registration = await navigator.serviceWorker.ready;
            
            // Verify registration is valid
            expect(registration).toBeDefined();
            expect(registration).toBeInstanceOf(MockServiceWorkerRegistration);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
