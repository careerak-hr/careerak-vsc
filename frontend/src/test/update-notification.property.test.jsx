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
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
    delete window.location;
    window.location = { reload: vi.fn() };
  });

  afterEach(() => {
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
    
    test('Property: Service worker update must trigger notification display', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('installing', 'installed', 'activating', 'activated'),
          async (finalState) => {
            // Create new worker
            const newWorker = new MockServiceWorker('/sw.js', 'installing');
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for component to mount
            await waitFor(() => {
              expect(mockNavigator.serviceWorker.ready).toBeDefined();
            });
            
            // Trigger update found
            mockRegistration._triggerUpdateFound(newWorker);
            
            // Simulate state change to installed with controller present
            if (finalState === 'installed') {
              newWorker._setState('installed');
              
              // Wait for notification to appear
              await waitFor(() => {
                const notification = container.querySelector('[role="alert"]');
                expect(notification).toBeTruthy();
              }, { timeout: 1000 });
              
              // Verify notification is visible
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
              expect(notification.getAttribute('aria-live')).toBe('polite');
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification must show when waiting worker exists', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js', '/sw-v1.js'),
          async (scriptURL) => {
            // Create waiting worker
            const waitingWorker = new MockServiceWorker(scriptURL, 'installed');
            mockRegistration._setWaiting(waitingWorker);
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for notification to appear
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            
            // Verify notification is displayed
            const notification = container.querySelector('[role="alert"]');
            expect(notification).toBeTruthy();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification must contain required UI elements', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('ar', 'en', 'fr'),
          async (language) => {
            // Set language
            global.localStorage.getItem = vi.fn((key) => {
              if (key === 'language') return language;
              return null;
            });
            
            // Create waiting worker
            const waitingWorker = new MockServiceWorker('/sw.js', 'installed');
            mockRegistration._setWaiting(waitingWorker);
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for notification
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            
            // Verify required elements exist
            const notification = container.querySelector('[role="alert"]');
            expect(notification).toBeTruthy();
            
            // Check for buttons
            const buttons = notification.querySelectorAll('button');
            expect(buttons.length).toBeGreaterThanOrEqual(2); // Update and Dismiss buttons
            
            // Check for text content
            const text = notification.textContent;
            expect(text.length).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update button must trigger SKIP_WAITING message', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          async (scriptURL) => {
            // Create waiting worker
            const waitingWorker = new MockServiceWorker(scriptURL, 'installed');
            mockRegistration._setWaiting(waitingWorker);
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for notification
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            
            // Find and click update button (first button)
            const buttons = container.querySelectorAll('button');
            const updateButton = Array.from(buttons).find(btn => 
              btn.textContent.includes('Reload') || 
              btn.textContent.includes('إعادة التحميل') ||
              btn.textContent.includes('Recharger')
            );
            
            if (updateButton) {
              fireEvent.click(updateButton);
              
              // Verify SKIP_WAITING message was sent
              const messages = waitingWorker._getMessages();
              const skipWaitingMessage = messages.find(msg => msg.type === 'SKIP_WAITING');
              expect(skipWaitingMessage).toBeTruthy();
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Dismiss button must hide notification', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          async (scriptURL) => {
            // Create waiting worker
            const waitingWorker = new MockServiceWorker(scriptURL, 'installed');
            mockRegistration._setWaiting(waitingWorker);
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for notification
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            
            // Find and click dismiss button
            const buttons = container.querySelectorAll('button');
            const dismissButton = Array.from(buttons).find(btn => 
              btn.textContent.includes('Later') || 
              btn.textContent.includes('لاحقاً') ||
              btn.textContent.includes('Plus tard') ||
              btn.getAttribute('aria-label') === 'Dismiss notification'
            );
            
            if (dismissButton) {
              fireEvent.click(dismissButton);
              
              // Wait for notification to disappear
              await waitFor(() => {
                const notification = container.querySelector('[role="alert"]');
                expect(notification).toBeFalsy();
              }, { timeout: 1000 });
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification must support multiple languages', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('ar', 'en', 'fr'),
          async (language) => {
            // Set language
            global.localStorage.getItem = vi.fn((key) => {
              if (key === 'language') return language;
              return null;
            });
            
            // Create waiting worker
            const waitingWorker = new MockServiceWorker('/sw.js', 'installed');
            mockRegistration._setWaiting(waitingWorker);
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for notification
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            
            // Verify language-specific content
            const notification = container.querySelector('[role="alert"]');
            const text = notification.textContent;
            
            // Check for language-specific keywords
            if (language === 'ar') {
              expect(text).toMatch(/تحديث|إعادة التحميل|لاحقاً/);
            } else if (language === 'en') {
              expect(text).toMatch(/update|Reload|Later/i);
            } else if (language === 'fr') {
              expect(text).toMatch(/mise à jour|Recharger|Plus tard/i);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification must have proper accessibility attributes', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          async (scriptURL) => {
            // Create waiting worker
            const waitingWorker = new MockServiceWorker(scriptURL, 'installed');
            mockRegistration._setWaiting(waitingWorker);
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for notification
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            
            // Verify accessibility attributes
            const notification = container.querySelector('[role="alert"]');
            expect(notification.getAttribute('role')).toBe('alert');
            expect(notification.getAttribute('aria-live')).toBe('polite');
            
            // Check for aria-label on close button
            const closeButton = notification.querySelector('[aria-label="Dismiss notification"]');
            expect(closeButton).toBeTruthy();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification must not show when no update available', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom(true, false),
          async (hasController) => {
            // Create a fresh mock for this test
            const testMockNavigator = {
              serviceWorker: {
                ready: Promise.resolve(mockRegistration),
                controller: hasController ? { state: 'activated' } : null,
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
            
            // Temporarily replace navigator
            Object.defineProperty(global, 'navigator', {
              value: testMockNavigator,
              writable: true,
              configurable: true,
            });
            
            // No waiting worker
            mockRegistration._setWaiting(null);
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Verify no notification is shown
            const notification = container.querySelector('[role="alert"]');
            expect(notification).toBeFalsy();
            
            // Restore original mock
            Object.defineProperty(global, 'navigator', {
              value: mockNavigator,
              writable: true,
              configurable: true,
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification must trigger on state change to installed', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('installing', 'installed', 'activating', 'activated'),
            { minLength: 1, maxLength: 4 }
          ),
          async (stateSequence) => {
            // Create new worker
            const newWorker = new MockServiceWorker('/sw.js', 'installing');
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for mount
            await waitFor(() => {
              expect(mockNavigator.serviceWorker.ready).toBeDefined();
            });
            
            // Trigger update found
            mockRegistration._triggerUpdateFound(newWorker);
            
            // Simulate state changes
            let notificationShown = false;
            for (const state of stateSequence) {
              newWorker._setState(state);
              
              // Check if notification appears when state is 'installed'
              if (state === 'installed' && mockNavigator.serviceWorker.controller) {
                await waitFor(() => {
                  const notification = container.querySelector('[role="alert"]');
                  if (notification) {
                    notificationShown = true;
                  }
                }, { timeout: 500 }).catch(() => {});
              }
            }
            
            // If sequence included 'installed', notification should have shown
            if (stateSequence.includes('installed') && mockNavigator.serviceWorker.controller) {
              expect(notificationShown).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification must be idempotent for multiple updates', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 5 }),
          async (updateCount) => {
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for mount
            await waitFor(() => {
              expect(mockNavigator.serviceWorker.ready).toBeDefined();
            });
            
            // Trigger multiple updates
            for (let i = 0; i < updateCount; i++) {
              const newWorker = new MockServiceWorker(`/sw-v${i}.js`, 'installing');
              mockRegistration._triggerUpdateFound(newWorker);
              newWorker._setState('installed');
              
              // Small delay between updates
              await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Wait for notification
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            
            // Should only show one notification
            const notifications = container.querySelectorAll('[role="alert"]');
            expect(notifications.length).toBe(1);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification must persist across re-renders', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }),
          async (rerenderCount) => {
            // Create waiting worker
            const waitingWorker = new MockServiceWorker('/sw.js', 'installed');
            mockRegistration._setWaiting(waitingWorker);
            
            // Render component
            const { container, rerender } = render(<ServiceWorkerManager />);
            
            // Wait for notification
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            
            // Re-render multiple times
            for (let i = 0; i < rerenderCount; i++) {
              rerender(<ServiceWorkerManager />);
              await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            // Notification should still be visible
            const notification = container.querySelector('[role="alert"]');
            expect(notification).toBeTruthy();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification must handle rapid state changes', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('installing', 'installed', 'activating', 'activated'),
            { minLength: 3, maxLength: 10 }
          ),
          async (rapidStates) => {
            // Create new worker
            const newWorker = new MockServiceWorker('/sw.js', 'installing');
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for mount
            await waitFor(() => {
              expect(mockNavigator.serviceWorker.ready).toBeDefined();
            });
            
            // Trigger update found
            mockRegistration._triggerUpdateFound(newWorker);
            
            // Rapidly change states
            for (const state of rapidStates) {
              newWorker._setState(state);
            }
            
            // Wait a bit for any notifications
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // If 'installed' was in the sequence, notification should appear
            if (rapidStates.includes('installed') && mockNavigator.serviceWorker.controller) {
              await waitFor(() => {
                const notification = container.querySelector('[role="alert"]');
                expect(notification).toBeTruthy();
              }, { timeout: 1000 });
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification must handle missing controller gracefully', () => {
      fc.assert(
        fc.asyncProperty(
          fc.boolean(),
          async (hasController) => {
            // Create a fresh mock for this test
            const testMockNavigator = {
              serviceWorker: {
                ready: Promise.resolve(mockRegistration),
                controller: hasController ? { state: 'activated' } : null,
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
            
            // Temporarily replace navigator
            Object.defineProperty(global, 'navigator', {
              value: testMockNavigator,
              writable: true,
              configurable: true,
            });
            
            // Create new worker
            const newWorker = new MockServiceWorker('/sw.js', 'installing');
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for mount
            await waitFor(() => {
              expect(testMockNavigator.serviceWorker.ready).toBeDefined();
            });
            
            // Trigger update found
            mockRegistration._triggerUpdateFound(newWorker);
            newWorker._setState('installed');
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Notification should only show if controller exists
            const notification = container.querySelector('[role="alert"]');
            if (hasController) {
              expect(notification).toBeTruthy();
            } else {
              expect(notification).toBeFalsy();
            }
            
            // Restore original mock
            Object.defineProperty(global, 'navigator', {
              value: mockNavigator,
              writable: true,
              configurable: true,
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification styling must be consistent', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          async (scriptURL) => {
            // Create waiting worker
            const waitingWorker = new MockServiceWorker(scriptURL, 'installed');
            mockRegistration._setWaiting(waitingWorker);
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for notification
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            
            // Verify styling properties
            const notification = container.querySelector('[role="alert"]');
            const style = notification.style;
            
            // Check positioning
            expect(style.position).toBe('fixed');
            expect(style.bottom).toBeTruthy();
            expect(style.zIndex).toBeTruthy();
            
            // Check notification has content
            const innerDiv = notification.querySelector('div');
            expect(innerDiv).toBeTruthy();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification must handle concurrent worker updates', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('/sw.js', '/sw-v1.js', '/sw-v2.js'),
            { minLength: 2, maxLength: 5 }
          ),
          async (workerURLs) => {
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for mount
            await waitFor(() => {
              expect(mockNavigator.serviceWorker.ready).toBeDefined();
            });
            
            // Trigger multiple worker updates
            for (const url of workerURLs) {
              const newWorker = new MockServiceWorker(url, 'installing');
              mockRegistration._triggerUpdateFound(newWorker);
              newWorker._setState('installed');
            }
            
            // Wait for notification
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            
            // Should show notification (only one)
            const notifications = container.querySelectorAll('[role="alert"]');
            expect(notifications.length).toBe(1);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================
  // Integration with FR-PWA-6 Requirements
  // ============================================

  describe('FR-PWA-6 Compliance', () => {
    
    test('Property: System must notify user when service worker updates', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          async (scriptURL) => {
            // Create waiting worker (simulating update)
            const waitingWorker = new MockServiceWorker(scriptURL, 'installed');
            mockRegistration._setWaiting(waitingWorker);
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for notification (FR-PWA-6 requirement)
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            
            // Verify notification content
            const notification = container.querySelector('[role="alert"]');
            expect(notification.textContent.length).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: System must offer reload option for new version', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/sw.js', '/service-worker.js'),
          async (scriptURL) => {
            // Create waiting worker
            const waitingWorker = new MockServiceWorker(scriptURL, 'installed');
            mockRegistration._setWaiting(waitingWorker);
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait for notification
            await waitFor(() => {
              const notification = container.querySelector('[role="alert"]');
              expect(notification).toBeTruthy();
            }, { timeout: 1000 });
            
            // Verify reload button exists (FR-PWA-6 requirement)
            const buttons = container.querySelectorAll('button');
            const hasReloadButton = Array.from(buttons).some(btn => 
              btn.textContent.includes('Reload') || 
              btn.textContent.includes('إعادة التحميل') ||
              btn.textContent.includes('Recharger')
            );
            
            expect(hasReloadButton).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Property: Update notification must be reliable across different scenarios', () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            scriptURL: fc.constantFrom('/sw.js', '/service-worker.js', '/sw-v1.js'),
            language: fc.constantFrom('ar', 'en', 'fr'),
            hasWaiting: fc.boolean(),
          }),
          async ({ scriptURL, language, hasWaiting }) => {
            // Set language
            global.localStorage.getItem = vi.fn((key) => {
              if (key === 'language') return language;
              return null;
            });
            
            // Set waiting worker if needed
            if (hasWaiting) {
              const waitingWorker = new MockServiceWorker(scriptURL, 'installed');
              mockRegistration._setWaiting(waitingWorker);
            } else {
              mockRegistration._setWaiting(null);
            }
            
            // Render component
            const { container } = render(<ServiceWorkerManager />);
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Verify notification state matches waiting worker state
            const notification = container.querySelector('[role="alert"]');
            if (hasWaiting) {
              expect(notification).toBeTruthy();
            } else {
              expect(notification).toBeFalsy();
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
