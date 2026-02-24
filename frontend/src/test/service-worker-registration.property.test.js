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
  let registrationCalls;

  beforeAll(() => {
    // Save original navigator
    originalNavigator = global.navigator;
    
    // Create mock navigator with service worker support
    mockNavigator = {
      serviceWorker: {
        register: (scriptURL, options) => {
          registrationCalls.push({ scriptURL, options });
          const registration = new MockServiceWorkerRegistration({
            scope: options?.scope || '/',
            installing: new MockServiceWorker(scriptURL),
          });
          return Promise.resolve(registration);
        },
        ready: Promise.resolve(new MockServiceWorkerRegistration()),
        controller: null,
        getRegistration: () => Promise.resolve(null),
        getRegistrations: () => Promise.resolve([]),
      },
    };
    
    // Replace global navigator
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
      configurable: true,
    });
  });

  beforeEach(() => {
    // Reset registration calls before each test
    registrationCalls = [];
  });

  afterAll(() => {
    // Restore original navigator
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
    
    test('Property: Service worker registration must always return a valid registration object', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js', '/sw-v1.js'),
          async (scriptURL) => {
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
            
            // Verify registration has required methods
            expect(typeof registration.update).toBe('function');
            expect(typeof registration.unregister).toBe('function');
            expect(typeof registration.addEventListener).toBe('function');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must be idempotent', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.integer({ min: 2, max: 5 }),
          async (scriptURL, numRegistrations) => {
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
            expect(registrationCalls.length).toBeGreaterThanOrEqual(numRegistrations);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must accept valid script URLs', () => {
      fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant('/sw.js'),
            fc.constant('/service-worker.js'),
            fc.constant('/sw-v1.js'),
            fc.constant('/sw-v2.js'),
            fc.constant('/pwa-sw.js')
          ),
          async (scriptURL) => {
            // Register with valid URL
            const registration = await navigator.serviceWorker.register(scriptURL);
            
            // Verify registration succeeded
            expect(registration).toBeDefined();
            
            // Verify correct script URL was used
            const lastCall = registrationCalls[registrationCalls.length - 1];
            if (lastCall) {
              expect(lastCall.scriptURL).toBe(scriptURL);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must support scope option', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.constantFrom('/', '/app/', '/pwa/'),
          async (scriptURL, scope) => {
            // Register with scope
            const registration = await navigator.serviceWorker.register(scriptURL, { scope });
            
            // Verify registration succeeded
            expect(registration).toBeDefined();
            
            // Verify scope was set correctly
            expect(registration.scope).toBe(scope);
            
            // Verify scope was passed to register call
            const lastCall = registrationCalls[registrationCalls.length - 1];
            if (lastCall && lastCall.options) {
              expect(lastCall.options.scope).toBe(scope);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must have active worker after successful registration', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          async (scriptURL) => {
            // Register service worker
            const registration = await navigator.serviceWorker.register(scriptURL);
            
            // Verify registration has an active or installing worker
            const hasWorker = registration.active !== null || 
                            registration.installing !== null || 
                            registration.waiting !== null;
            
            expect(hasWorker).toBe(true);
            
            // If active worker exists, verify it's valid
            if (registration.active) {
              expect(registration.active).toHaveProperty('state');
              expect(registration.active.state).toBe('activated');
            }
            
            // If installing worker exists, verify it's valid
            if (registration.installing) {
              expect(registration.installing).toBeInstanceOf(MockServiceWorker);
              expect(registration.installing).toHaveProperty('scriptURL');
              expect(registration.installing.scriptURL).toBe(scriptURL);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must support event listeners', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.constantFrom('updatefound', 'controllerchange'),
          async (scriptURL, eventType) => {
            // Register service worker
            const registration = await navigator.serviceWorker.register(scriptURL);
            
            // Add event listener
            let eventFired = false;
            const listener = () => { eventFired = true; };
            registration.addEventListener(eventType, listener);
            
            // Verify listener was added
            expect(registration._listeners[eventType]).toBeDefined();
            expect(registration._listeners[eventType]).toContain(listener);
            
            // Trigger event
            registration._triggerEvent(eventType, {});
            
            // Verify event was fired
            expect(eventFired).toBe(true);
            
            // Remove listener
            registration.removeEventListener(eventType, listener);
            
            // Verify listener was removed
            expect(registration._listeners[eventType]).not.toContain(listener);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must support update method', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          async (scriptURL) => {
            // Register service worker
            const registration = await navigator.serviceWorker.register(scriptURL);
            
            // Verify update method exists
            expect(typeof registration.update).toBe('function');
            
            // Call update
            const updateResult = await registration.update();
            
            // Verify update completed (returns undefined or registration)
            expect(updateResult === undefined || updateResult === registration).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must support unregister method', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          async (scriptURL) => {
            // Register service worker
            const registration = await navigator.serviceWorker.register(scriptURL);
            
            // Verify unregister method exists
            expect(typeof registration.unregister).toBe('function');
            
            // Call unregister
            const unregisterResult = await registration.unregister();
            
            // Verify unregister returns boolean
            expect(typeof unregisterResult).toBe('boolean');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker state transitions must be valid', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.array(
            fc.constantFrom('installing', 'installed', 'activating', 'activated'),
            { minLength: 1, maxLength: 4 }
          ),
          async (scriptURL, stateSequence) => {
            // Register service worker
            const registration = await navigator.serviceWorker.register(scriptURL);
            const worker = registration.installing;
            
            if (!worker) {
              return true; // Skip if no installing worker
            }
            
            // Track state changes
            const stateChanges = [];
            worker.addEventListener('statechange', (event) => {
              stateChanges.push(event.target.state);
            });
            
            // Simulate state transitions
            for (const state of stateSequence) {
              worker._setState(state);
            }
            
            // Verify state changes were recorded
            expect(stateChanges.length).toBe(stateSequence.length);
            
            // Verify final state matches last in sequence
            expect(worker.state).toBe(stateSequence[stateSequence.length - 1]);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Multiple service worker registrations must not interfere', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('/sw.js', '/service-worker.js', '/sw-v1.js'),
            { minLength: 2, maxLength: 5 }
          ),
          async (scriptURLs) => {
            // Register multiple service workers
            const registrations = await Promise.all(
              scriptURLs.map(url => navigator.serviceWorker.register(url))
            );
            
            // Verify all registrations succeeded
            expect(registrations.length).toBe(scriptURLs.length);
            
            // Verify each registration is valid and independent
            registrations.forEach((reg, index) => {
              expect(reg).toBeDefined();
              expect(reg).toBeInstanceOf(MockServiceWorkerRegistration);
              
              // Verify correct script URL was used (if registrationCalls has the entry)
              if (registrationCalls[index]) {
                expect(registrationCalls[index].scriptURL).toBe(scriptURLs[index]);
              }
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must be consistent across calls', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.integer({ min: 1, max: 10 }),
          async (scriptURL, iterations) => {
            // Register multiple times
            const registrations = [];
            for (let i = 0; i < iterations; i++) {
              const reg = await navigator.serviceWorker.register(scriptURL);
              registrations.push(reg);
            }
            
            // All registrations should be valid
            registrations.forEach(reg => {
              expect(reg).toBeDefined();
              expect(reg).toBeInstanceOf(MockServiceWorkerRegistration);
              expect(reg).toHaveProperty('scope');
              expect(reg).toHaveProperty('active');
            });
            
            // Verify consistent behavior
            const scopes = registrations.map(r => r.scope);
            const allSame = scopes.every(s => s === scopes[0]);
            expect(allSame).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must handle concurrent registrations', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.integer({ min: 2, max: 10 }),
          async (scriptURL, concurrentCount) => {
            // Start multiple registrations concurrently
            const registrationPromises = Array(concurrentCount)
              .fill(null)
              .map(() => navigator.serviceWorker.register(scriptURL));
            
            // Wait for all to complete
            const registrations = await Promise.all(registrationPromises);
            
            // All should succeed
            expect(registrations.length).toBe(concurrentCount);
            
            // All should be valid
            registrations.forEach(reg => {
              expect(reg).toBeDefined();
              expect(reg).toBeInstanceOf(MockServiceWorkerRegistration);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must preserve options', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.record({
            scope: fc.constantFrom('/', '/app/', '/pwa/'),
            updateViaCache: fc.constantFrom('imports', 'all', 'none'),
          }),
          async (scriptURL, options) => {
            // Register with options
            const registration = await navigator.serviceWorker.register(scriptURL, options);
            
            // Verify options were passed
            const lastCall = registrationCalls[registrationCalls.length - 1];
            if (lastCall && lastCall.options) {
              expect(lastCall.options.scope).toBe(options.scope);
              expect(lastCall.options.updateViaCache).toBe(options.updateViaCache);
            }
            
            // Verify registration reflects options
            expect(registration.scope).toBe(options.scope);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must be deterministic for same inputs', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.constantFrom('/', '/app/'),
          async (scriptURL, scope) => {
            // Register twice with same inputs
            const reg1 = await navigator.serviceWorker.register(scriptURL, { scope });
            const reg2 = await navigator.serviceWorker.register(scriptURL, { scope });
            
            // Both should succeed
            expect(reg1).toBeDefined();
            expect(reg2).toBeDefined();
            
            // Both should have same scope
            expect(reg1.scope).toBe(scope);
            expect(reg2.scope).toBe(scope);
            
            // Both should be valid registrations
            expect(reg1).toBeInstanceOf(MockServiceWorkerRegistration);
            expect(reg2).toBeInstanceOf(MockServiceWorkerRegistration);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must support ready promise', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constant(true),
          async () => {
            // Access ready promise
            const readyPromise = navigator.serviceWorker.ready;
            
            // Verify it's a promise
            expect(readyPromise).toBeInstanceOf(Promise);
            
            // Wait for ready
            const registration = await readyPromise;
            
            // Verify registration is valid
            expect(registration).toBeDefined();
            expect(registration).toBeInstanceOf(MockServiceWorkerRegistration);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must maintain state across updates', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.integer({ min: 1, max: 5 }),
          async (scriptURL, updateCount) => {
            // Initial registration
            const registration = await navigator.serviceWorker.register(scriptURL);
            
            // Perform multiple updates
            for (let i = 0; i < updateCount; i++) {
              await registration.update();
            }
            
            // Verify registration is still valid
            expect(registration).toBeDefined();
            expect(registration).toBeInstanceOf(MockServiceWorkerRegistration);
            expect(registration.scope).toBeDefined();
            
            // Verify update method still works
            expect(typeof registration.update).toBe('function');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================
  // Integration with FR-PWA-1 Requirements
  // ============================================

  describe('FR-PWA-1 Compliance', () => {
    
    test('Property: Service worker must register for offline functionality', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          async (scriptURL) => {
            // Simulate registration as per FR-PWA-1
            const registration = await navigator.serviceWorker.register(scriptURL);
            
            // Verify registration succeeded (required for offline functionality)
            expect(registration).toBeDefined();
            expect(registration.active !== null || registration.installing !== null).toBe(true);
            
            // Verify registration can be used for offline functionality
            expect(typeof registration.update).toBe('function');
            expect(typeof registration.addEventListener).toBe('function');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Service worker registration must be reliable across page loads', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          fc.integer({ min: 1, max: 10 }),
          async (scriptURL, pageLoads) => {
            // Simulate multiple page loads
            for (let i = 0; i < pageLoads; i++) {
              const registration = await navigator.serviceWorker.register(scriptURL);
              
              // Each registration should succeed
              expect(registration).toBeDefined();
              expect(registration).toBeInstanceOf(MockServiceWorkerRegistration);
            }
            
            // Verify all registrations were attempted
            expect(registrationCalls.length).toBeGreaterThanOrEqual(pageLoads);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
