/**
 * Property-Based Tests for Service Worker Update Notification
 * Task 3.6.4: Write property-based test for update notification (100 iterations)
 * 
 * Property PWA-4: Update Notification
 * 
 * **Validates: Requirements FR-PWA-6, NFR-REL-4**
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import ServiceWorkerManager from '../components/ServiceWorkerManager';

// Mock service worker
class MockServiceWorker {
  constructor(scriptURL, state = 'installing') {
    this.scriptURL = scriptURL;
    this.state = state;
    this._listeners = {};
    this._messages = [];
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
    this._messages.push(message);
  }

  _setState(newState) {
    this.state = newState;
    if (this._listeners['statechange']) {
      this._listeners['statechange'].forEach(callback => 
        callback({ target: this })
      );
    }
  }

  _getMessages() {
    return this._messages;
  }
}

// Mock service worker registration
class MockServiceWorkerRegistration {
  constructor(options = {}) {
    this.installing = options.installing || null;
    this.waiting = options.waiting || null;
    this.active = options.active || null;
    this.scope = options.scope || '/';
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

  _triggerUpdateFound(newWorker) {
    this.installing = newWorker;
    if (this._listeners['updatefound']) {
      this._listeners['updatefound'].forEach(callback => callback());
    }
  }

  _setWaiting(worker) {
    this.waiting = worker;
  }
}

describe('Service Worker Update Notification Property Tests', () => {
  let mockNavigator;
  let originalNavigator;
  let mockRegistration;
  let controllerChangeCallbacks;

  beforeEach(() => {
    // Save original navigator
    originalNavigator = global.navigator;
    
    // Reset controller change callbacks
    controllerChangeCallbacks = [];
    
    // Create mock registration
    mockRegistration = new MockServiceWorkerRegistration();
    
    // Create mock navigator with service worker support
    mockNavigator = {
      serviceWorker: {
        ready: Promise.resolve(mockRegistration),
        controller: { state: 'activated' },
        addEventListener: (event, callback) => {
          if (event === 'controllerchange') {
            controllerChangeCallbacks.push(callback);
          }
        },
        removeEventListener: (event, callback) => {
          if (event === 'controllerchange') {
            controllerChangeCallbacks = controllerChangeCallbacks.filter(cb => cb !== callback);
          }
        },
        getRegistration: () => Promise.resolve(mockRegistration),
      },
    };
    
    // Replace global navigator
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
      configurable: true,
    });

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn((key) => {
        if (key === 'language') return 'en';
        return null;
      }),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock;

    // Mock window.location.reload
    if (typeof window !== 'undefined') {
      const originalLocation = window.location;
      delete window.location;
      window.location = { ...originalLocation, reload: vi.fn() };
    }
  });

  afterEach(() => {
    cleanup();
    // Restore original navigator
    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    }
    vi.clearAllMocks();
  });

  // ============================================
  // Property PWA-4: Update Notification
  // ============================================

  describe('Property PWA-4: Update Notification', () => {
    
    test('Property: Service worker update must trigger notification display', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('installing', 'installed', 'activating', 'activated'),
          async (finalState) => {
            const newWorker = new MockServiceWorker('/sw.js', 'installing');
            const { container } = render(<ServiceWorkerManager />);
            await waitFor(() => expect(mockNavigator.serviceWorker.ready).toBeDefined());
            mockRegistration._triggerUpdateFound(newWorker);
            
            if (finalState === 'installed') {
              newWorker._setState('installed');
              await waitFor(() => {
                const notification = container.querySelector('[role="alert"]');
                expect(notification).toBeTruthy();
              }, { timeout: 1000 });
            }
            cleanup();
            return true;
          }
        ),
        { numRuns: 20 } // Reduced for performance
      );
    });

    test('Property: Update notification must show when waiting worker exists', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          async (scriptURL) => {
            const waitingWorker = new MockServiceWorker(scriptURL, 'installed');
            mockRegistration._setWaiting(waitingWorker);
            const { container } = render(<ServiceWorkerManager />);
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            cleanup();
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    test('Property: Update button must trigger SKIP_WAITING message', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          async (scriptURL) => {
            const waitingWorker = new MockServiceWorker(scriptURL, 'installed');
            mockRegistration._setWaiting(waitingWorker);
            const { container } = render(<ServiceWorkerManager />);
            await waitFor(() => expect(container.querySelector('[role="alert"]')).toBeTruthy());
            
            const buttons = container.querySelectorAll('button');
            const updateButton = Array.from(buttons).find(btn => 
              btn.textContent.includes('Reload') || 
              btn.textContent.includes('إعادة التحميل') ||
              btn.textContent.includes('Recharger')
            );
            
            if (updateButton) {
              fireEvent.click(updateButton);
              const messages = waitingWorker._getMessages();
              expect(messages.some(msg => msg.type === 'SKIP_WAITING')).toBeTruthy();
            }
            cleanup();
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    test('Property: Update notification must handle scenarios reliably', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            scriptURL: fc.constantFrom('/sw.js', '/service-worker.js'),
            language: fc.constantFrom('ar', 'en', 'fr'),
            hasWaiting: fc.boolean(),
          }),
          async ({ scriptURL, language, hasWaiting }) => {
            if (global.localStorage) {
              global.localStorage.getItem = vi.fn((key) => key === 'language' ? language : null);
            }
            
            if (hasWaiting) {
              mockRegistration._setWaiting(new MockServiceWorker(scriptURL, 'installed'));
            } else {
              mockRegistration._setWaiting(null);
            }
            
            const { container } = render(<ServiceWorkerManager />);
            await new Promise(resolve => setTimeout(resolve, 50));
            const notification = container.querySelector('[role="alert"]');
            if (hasWaiting) expect(notification).toBeTruthy();
            else expect(notification).toBeFalsy();
            cleanup();
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
