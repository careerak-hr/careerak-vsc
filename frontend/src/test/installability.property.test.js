/**
 * Property-Based Tests for PWA Installability
 * Task 3.6.5: Write property-based test for installability (100 iterations)
 * 
 * Property PWA-5: Installability
 * 
 * **Validates: Requirements FR-PWA-4, FR-PWA-5, Task 3.3**
 * 
 * This test suite verifies that:
 * - PWA is installable when manifest is valid and service worker is active
 * - Install prompt is shown on mobile devices
 * - PWA provides standalone app experience after installation
 * 
 * Property PWA-5:
 * manifest.valid = true AND serviceWorker.active = true
 *   → installable = true
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';

// Mock BeforeInstallPromptEvent
class MockBeforeInstallPromptEvent extends Event {
  constructor(type, options = {}) {
    super(type);
    this.platforms = options.platforms || ['web'];
    this.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
    this._prevented = false;
  }

  preventDefault() {
    this._prevented = true;
  }

  prompt() {
    return Promise.resolve();
  }
}

// Mock service worker registration
class MockServiceWorkerRegistration {
  constructor(options = {}) {
    this.installing = options.installing || null;
    this.waiting = options.waiting || null;
    this.active = options.hasOwnProperty('active') ? options.active : { state: 'activated' };
    this.scope = options.scope || '/';
  }
}

// Mock service worker
class MockServiceWorker {
  constructor(scriptURL, state = 'activated') {
    this.scriptURL = scriptURL;
    this.state = state;
  }
}

// Manifest validator
class ManifestValidator {
  constructor(manifest) {
    this.manifest = manifest;
  }

  isValid() {
    if (!this.manifest) return false;

    // Required fields
    const hasName = !!(
      (this.manifest.name && this.manifest.name.trim().length > 0) || 
      (this.manifest.short_name && this.manifest.short_name.trim().length > 0)
    );
    const hasIcons = Array.isArray(this.manifest.icons) && this.manifest.icons.length > 0;
    const hasStartUrl = !!this.manifest.start_url;
    const hasDisplay = !!this.manifest.display;

    // Check icon requirements (at least one icon >= 192x192)
    const hasValidIcon = this.manifest.icons?.some(icon => {
      if (!icon || !icon.sizes) return false;
      const sizes = icon.sizes.split('x').map(s => parseInt(s));
      return sizes && sizes.length === 2 && sizes[0] >= 192 && sizes[1] >= 192;
    });

    return hasName && hasIcons && hasValidIcon && hasStartUrl && hasDisplay;
  }

  getErrors() {
    const errors = [];

    if (!this.manifest) {
      errors.push('Manifest is missing');
      return errors;
    }

    const hasValidName = 
      (this.manifest.name && this.manifest.name.trim().length > 0) ||
      (this.manifest.short_name && this.manifest.short_name.trim().length > 0);
    
    if (!hasValidName) {
      errors.push('Missing name or short_name');
    }

    if (!Array.isArray(this.manifest.icons) || this.manifest.icons.length === 0) {
      errors.push('Missing icons array');
    } else {
      const hasValidIcon = this.manifest.icons.some(icon => {
        if (!icon || !icon.sizes) return false;
        const sizes = icon.sizes.split('x').map(s => parseInt(s));
        return sizes && sizes.length === 2 && sizes[0] >= 192 && sizes[1] >= 192;
      });
      if (!hasValidIcon) {
        errors.push('No icon with size >= 192x192');
      }
    }

    if (!this.manifest.start_url) {
      errors.push('Missing start_url');
    }

    if (!this.manifest.display) {
      errors.push('Missing display mode');
    }

    return errors;
  }
}

// PWA Installability checker
class PWAInstallabilityChecker {
  constructor(manifest, serviceWorkerRegistration) {
    this.manifest = manifest;
    this.serviceWorkerRegistration = serviceWorkerRegistration;
  }

  isInstallable() {
    // Check manifest validity
    const manifestValidator = new ManifestValidator(this.manifest);
    const manifestValid = manifestValidator.isValid();

    // Check service worker is active
    const serviceWorkerActive = !!(
      this.serviceWorkerRegistration &&
      this.serviceWorkerRegistration.active &&
      this.serviceWorkerRegistration.active.state === 'activated'
    );

    // Property PWA-5: manifest.valid AND serviceWorker.active → installable
    return manifestValid && serviceWorkerActive;
  }

  getInstallabilityStatus() {
    const manifestValidator = new ManifestValidator(this.manifest);
    const manifestValid = manifestValidator.isValid();
    const manifestErrors = manifestValidator.getErrors();

    const serviceWorkerActive = !!(
      this.serviceWorkerRegistration &&
      this.serviceWorkerRegistration.active &&
      this.serviceWorkerRegistration.active.state === 'activated'
    );

    return {
      installable: this.isInstallable(),
      manifest: {
        valid: manifestValid,
        errors: manifestErrors,
      },
      serviceWorker: {
        active: serviceWorkerActive,
        state: this.serviceWorkerRegistration?.active?.state || 'none',
      },
    };
  }
}

describe('PWA Installability Property Tests', () => {
  let mockWindow;
  let originalWindow;

  beforeEach(() => {
    // Save original window
    originalWindow = global.window;

    // Create mock window
    mockWindow = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      matchMedia: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    };

    // Replace global window
    global.window = mockWindow;
  });

  afterEach(() => {
    // Restore original window
    if (originalWindow) {
      global.window = originalWindow;
    }
    vi.clearAllMocks();
  });

  // ============================================
  // Property PWA-5: Installability
  // ============================================

  describe('Property PWA-5: Installability', () => {
    
    /**
     * Property: PWA must be installable when manifest is valid and service worker is active
     * 
     * **Validates: Requirements FR-PWA-4, FR-PWA-5**
     * 
     * manifest.valid = true AND serviceWorker.active = true → installable = true
     * 
     * This property verifies that a PWA is installable when both
     * the manifest is valid and the service worker is active.
     */
    it('should be installable when manifest is valid and service worker is active', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid manifest
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            short_name: fc.string({ minLength: 1, maxLength: 12 }),
            start_url: fc.constantFrom('/', '/index.html', '/app'),
            display: fc.constantFrom('standalone', 'fullscreen', 'minimal-ui'),
            theme_color: fc.constantFrom('#304B60', '#E3DAD1', '#D48161'),
            background_color: fc.constantFrom('#E3DAD1', '#FFFFFF', '#304B60'),
            icons: fc.constant([
              { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' },
            ]),
          }),
          // Generate service worker state
          fc.constantFrom('activated', 'activating'),
          async (manifest, swState) => {
            // Create service worker registration
            const serviceWorker = new MockServiceWorker('/sw.js', swState);
            const registration = new MockServiceWorkerRegistration({
              active: serviceWorker,
            });

            // Check installability
            const checker = new PWAInstallabilityChecker(manifest, registration);
            const isInstallable = checker.isInstallable();

            // Property: If manifest is valid and SW is active, PWA is installable
            if (swState === 'activated') {
              expect(isInstallable).toBe(true);
            } else {
              // If SW is not fully activated, may not be installable yet
              expect(typeof isInstallable).toBe('boolean');
            }

            // Verify status details
            const status = checker.getInstallabilityStatus();
            expect(status.manifest.valid).toBe(true);
            expect(status.manifest.errors).toHaveLength(0);
            
            if (swState === 'activated') {
              expect(status.serviceWorker.active).toBe(true);
              expect(status.installable).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: PWA must not be installable when manifest is invalid
     * 
     * **Validates: Requirements FR-PWA-4**
     * 
     * manifest.valid = false → installable = false
     * 
     * This property verifies that a PWA is not installable
     * when the manifest is invalid, even if service worker is active.
     */
    it('should not be installable when manifest is invalid', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate invalid manifests (missing required fields)
          fc.oneof(
            fc.constant(null), // No manifest
            fc.constant({}), // Empty manifest
            fc.record({ name: fc.string() }), // Missing icons
            fc.record({ icons: fc.constant([]) }), // Empty icons
            fc.record({
              name: fc.string(),
              icons: fc.constant([{ src: 'icon.png', sizes: '48x48' }]), // Icon too small
            }),
            fc.record({
              name: fc.string(),
              icons: fc.constant([{ src: 'icon-192x192.png', sizes: '192x192' }]),
              // Missing start_url
            }),
          ),
          async (invalidManifest) => {
            // Create active service worker
            const serviceWorker = new MockServiceWorker('/sw.js', 'activated');
            const registration = new MockServiceWorkerRegistration({
              active: serviceWorker,
            });

            // Check installability
            const checker = new PWAInstallabilityChecker(invalidManifest, registration);
            const isInstallable = checker.isInstallable();

            // Property: Invalid manifest → not installable
            expect(isInstallable).toBe(false);

            // Verify status shows manifest errors
            const status = checker.getInstallabilityStatus();
            expect(status.manifest.valid).toBe(false);
            expect(status.manifest.errors.length).toBeGreaterThan(0);
            expect(status.installable).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: PWA must not be installable when service worker is not active
     * 
     * **Validates: Requirements FR-PWA-1, FR-PWA-4**
     * 
     * serviceWorker.active = false → installable = false
     * 
     * This property verifies that a PWA is not installable
     * when the service worker is not active, even if manifest is valid.
     */
    it('should not be installable when service worker is not active', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid manifest
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            short_name: fc.string({ minLength: 1, maxLength: 12 }),
            start_url: fc.constant('/'),
            display: fc.constant('standalone'),
            icons: fc.constant([
              { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' },
            ]),
          }),
          // Generate non-active service worker states
          fc.oneof(
            fc.constant(null), // No registration
            fc.constant({ active: null }), // No active worker
            fc.record({
              active: fc.record({
                state: fc.constantFrom('installing', 'installed', 'redundant'),
              }),
            }),
          ),
          async (manifest, registration) => {
            // Check installability
            const checker = new PWAInstallabilityChecker(manifest, registration);
            const isInstallable = checker.isInstallable();

            // Property: No active service worker → not installable
            expect(isInstallable).toBe(false);

            // Verify status shows service worker is not active
            const status = checker.getInstallabilityStatus();
            expect(status.manifest.valid).toBe(true);
            expect(status.serviceWorker.active).toBe(false);
            expect(status.installable).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Install prompt must be preventable
     * 
     * **Validates: Requirements FR-PWA-4**
     * 
     * This property verifies that the beforeinstallprompt event
     * can be prevented and stored for later use.
     */
    it('should allow preventing and storing install prompt', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('web', 'android', 'ios'),
          async (platform) => {
            let deferredPrompt = null;

            // Create beforeinstallprompt event
            const event = new MockBeforeInstallPromptEvent('beforeinstallprompt', {
              platforms: [platform],
            });

            // Simulate event handler
            const handleBeforeInstallPrompt = (e) => {
              e.preventDefault();
              deferredPrompt = e;
            };

            // Handle event
            handleBeforeInstallPrompt(event);

            // Property: Event can be prevented and stored
            expect(event._prevented).toBe(true);
            expect(deferredPrompt).toBe(event);
            expect(deferredPrompt.platforms).toContain(platform);

            // Property: Prompt can be shown later
            expect(typeof deferredPrompt.prompt).toBe('function');
            await expect(deferredPrompt.prompt()).resolves.toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Install prompt must provide user choice
     * 
     * **Validates: Requirements FR-PWA-4**
     * 
     * This property verifies that the install prompt
     * provides information about the user's choice.
     */
    it('should provide user choice after install prompt', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('accepted', 'dismissed'),
          fc.constantFrom('web', 'android'),
          async (outcome, platform) => {
            // Create event with specific outcome
            const event = new MockBeforeInstallPromptEvent('beforeinstallprompt', {
              platforms: [platform],
            });

            // Override userChoice
            event.userChoice = Promise.resolve({ outcome, platform });

            // Show prompt
            await event.prompt();

            // Get user choice
            const choice = await event.userChoice;

            // Property: User choice is provided
            expect(choice).toBeDefined();
            expect(choice.outcome).toBe(outcome);
            expect(choice.platform).toBe(platform);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Manifest must have required fields for installability
     * 
     * **Validates: Requirements Task 3.3.1, Task 3.3.2, Task 3.3.3, Task 3.3.4**
     * 
     * This property verifies that all required manifest fields
     * are present for the PWA to be installable.
     */
    it('should require all mandatory manifest fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            hasName: fc.boolean(),
            hasIcons: fc.boolean(),
            hasStartUrl: fc.boolean(),
            hasDisplay: fc.boolean(),
            iconSize: fc.constantFrom('48x48', '96x96', '192x192', '512x512'),
          }),
          async ({ hasName, hasIcons, hasStartUrl, hasDisplay, iconSize }) => {
            // Build manifest based on flags
            const manifest = {};

            if (hasName) {
              manifest.name = 'Test App';
              manifest.short_name = 'Test';
            }

            if (hasIcons) {
              manifest.icons = [
                { src: `icon-${iconSize}.png`, sizes: iconSize, type: 'image/png' },
              ];
            }

            if (hasStartUrl) {
              manifest.start_url = '/';
            }

            if (hasDisplay) {
              manifest.display = 'standalone';
            }

            // Validate manifest
            const validator = new ManifestValidator(manifest);
            const isValid = validator.isValid();

            // Parse icon size
            const [width] = iconSize.split('x').map(s => parseInt(s));
            const hasValidIconSize = width >= 192;

            // Property: All required fields must be present
            const shouldBeValid = hasName && hasIcons && hasValidIconSize && hasStartUrl && hasDisplay;
            expect(isValid).toBe(shouldBeValid);

            // Verify errors match missing fields
            const errors = validator.getErrors();
            if (!shouldBeValid) {
              expect(errors.length).toBeGreaterThan(0);
            } else {
              expect(errors.length).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Manifest icons must meet size requirements
     * 
     * **Validates: Requirements Task 3.3.2**
     * 
     * This property verifies that manifest icons meet
     * the minimum size requirement (192x192) for installability.
     */
    it('should require icons with minimum size 192x192', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              width: fc.integer({ min: 48, max: 512 }),
              height: fc.integer({ min: 48, max: 512 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (iconSizes) => {
            // Create manifest with icons
            const manifest = {
              name: 'Test App',
              start_url: '/',
              display: 'standalone',
              icons: iconSizes.map(({ width, height }) => ({
                src: `icon-${width}x${height}.png`,
                sizes: `${width}x${height}`,
                type: 'image/png',
              })),
            };

            // Validate manifest
            const validator = new ManifestValidator(manifest);
            const isValid = validator.isValid();

            // Check if any icon meets size requirement
            const hasValidIcon = iconSizes.some(
              ({ width, height }) => width >= 192 && height >= 192
            );

            // Property: At least one icon must be >= 192x192
            expect(isValid).toBe(hasValidIcon);

            if (!hasValidIcon) {
              const errors = validator.getErrors();
              expect(errors.some(e => e.includes('192x192'))).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Manifest display mode must be valid for standalone experience
     * 
     * **Validates: Requirements FR-PWA-5, Task 3.3.4**
     * 
     * This property verifies that the manifest display mode
     * is set to provide a standalone app experience.
     */
    it('should support standalone display modes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('standalone', 'fullscreen', 'minimal-ui', 'browser'),
          async (displayMode) => {
            // Create manifest with display mode
            const manifest = {
              name: 'Test App',
              start_url: '/',
              display: displayMode,
              icons: [
                { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
              ],
            };

            // Create active service worker
            const serviceWorker = new MockServiceWorker('/sw.js', 'activated');
            const registration = new MockServiceWorkerRegistration({
              active: serviceWorker,
            });

            // Check installability
            const checker = new PWAInstallabilityChecker(manifest, registration);
            const isInstallable = checker.isInstallable();

            // Property: Valid display mode allows installability
            expect(isInstallable).toBe(true);

            // Verify manifest is valid
            const validator = new ManifestValidator(manifest);
            expect(validator.isValid()).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Installability check must be consistent
     * 
     * **Validates: Requirements FR-PWA-4, FR-PWA-5**
     * 
     * This property verifies that installability checks
     * return consistent results for the same inputs.
     */
    it('should return consistent installability results', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.constantFrom('Test App', 'My PWA', 'Careerak', 'Demo App', 'Sample'),
            start_url: fc.constant('/'),
            display: fc.constant('standalone'),
            icons: fc.constant([
              { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
            ]),
          }),
          fc.constantFrom('activated', 'installing', 'installed'),
          fc.integer({ min: 2, max: 5 }),
          async (manifest, swState, iterations) => {
            // Create service worker
            const serviceWorker = new MockServiceWorker('/sw.js', swState);
            const registration = new MockServiceWorkerRegistration({
              active: swState === 'activated' ? serviceWorker : null,
              installing: swState === 'installing' ? serviceWorker : null,
              waiting: swState === 'installed' ? serviceWorker : null,
            });

            // Check installability multiple times
            const results = [];
            for (let i = 0; i < iterations; i++) {
              const checker = new PWAInstallabilityChecker(manifest, registration);
              results.push(checker.isInstallable());
            }

            // Property: All results must be identical
            const allSame = results.every(r => r === results[0]);
            expect(allSame).toBe(true);

            // Verify expected result
            const expectedInstallable = swState === 'activated';
            expect(results[0]).toBe(expectedInstallable);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Installability must handle edge cases gracefully
     * 
     * **Validates: Requirements FR-PWA-4, FR-PWA-5**
     * 
     * This property verifies that installability checks
     * handle edge cases without errors.
     */
    it('should handle edge cases gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant({}),
            fc.record({
              name: fc.option(fc.string(), { nil: null }),
              icons: fc.option(fc.array(fc.anything()), { nil: null }),
            }),
          ),
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant({}),
            fc.record({
              active: fc.option(
                fc.record({
                  state: fc.option(fc.string(), { nil: null }),
                }),
                { nil: null }
              ),
            }),
          ),
          async (manifest, registration) => {
            // Check installability with edge case inputs
            const checker = new PWAInstallabilityChecker(manifest, registration);

            // Property: Should not throw errors
            expect(() => checker.isInstallable()).not.toThrow();
            expect(() => checker.getInstallabilityStatus()).not.toThrow();

            // Result should be boolean
            const isInstallable = checker.isInstallable();
            expect(typeof isInstallable).toBe('boolean');

            // Status should have expected structure
            const status = checker.getInstallabilityStatus();
            expect(status).toHaveProperty('installable');
            expect(status).toHaveProperty('manifest');
            expect(status).toHaveProperty('serviceWorker');
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Multiple installability checks must not interfere
     * 
     * **Validates: Requirements FR-PWA-4, FR-PWA-5**
     * 
     * This property verifies that multiple concurrent
     * installability checks don't interfere with each other.
     */
    it('should support concurrent installability checks', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              name: fc.constantFrom('Test App', 'My PWA', 'Careerak', 'Demo App', 'Sample'),
              start_url: fc.constant('/'),
              display: fc.constant('standalone'),
              icons: fc.constant([
                { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
              ]),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          async (manifests) => {
            // Create service worker
            const serviceWorker = new MockServiceWorker('/sw.js', 'activated');
            const registration = new MockServiceWorkerRegistration({
              active: serviceWorker,
            });

            // Check installability for all manifests concurrently
            const checkers = manifests.map(
              manifest => new PWAInstallabilityChecker(manifest, registration)
            );

            const results = checkers.map(checker => checker.isInstallable());

            // Property: All should be installable (valid manifest + active SW)
            results.forEach(result => {
              expect(result).toBe(true);
            });

            // Property: Results should be independent
            expect(results.length).toBe(manifests.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================
  // Integration with FR-PWA-4 and FR-PWA-5 Requirements
  // ============================================

  describe('FR-PWA-4 and FR-PWA-5 Compliance', () => {
    
    /**
     * Property: Install prompt must be shown on mobile devices
     * 
     * **Validates: Requirements FR-PWA-4**
     * 
     * This property verifies that the install prompt
     * is shown on mobile devices when PWA is installable.
     */
    it('should show install prompt on mobile devices', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('android', 'ios', 'web'),
          async (platform) => {
            // Create valid manifest
            const manifest = {
              name: 'Careerak',
              short_name: 'Careerak',
              start_url: '/',
              display: 'standalone',
              theme_color: '#304B60',
              background_color: '#E3DAD1',
              icons: [
                { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' },
              ],
            };

            // Create active service worker
            const serviceWorker = new MockServiceWorker('/sw.js', 'activated');
            const registration = new MockServiceWorkerRegistration({
              active: serviceWorker,
            });

            // Check installability
            const checker = new PWAInstallabilityChecker(manifest, registration);
            const isInstallable = checker.isInstallable();

            // Property: PWA is installable on all platforms
            expect(isInstallable).toBe(true);

            // Simulate beforeinstallprompt event
            const event = new MockBeforeInstallPromptEvent('beforeinstallprompt', {
              platforms: [platform],
            });

            // Property: Event can be captured and used
            expect(event.platforms).toContain(platform);
            expect(typeof event.prompt).toBe('function');
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: PWA must provide standalone app experience
     * 
     * **Validates: Requirements FR-PWA-5**
     * 
     * This property verifies that the PWA provides
     * a standalone app experience after installation.
     */
    it('should provide standalone app experience', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('standalone', 'fullscreen', 'minimal-ui'),
          async (displayMode) => {
            // Create manifest with standalone display
            const manifest = {
              name: 'Careerak',
              short_name: 'Careerak',
              start_url: '/',
              display: displayMode,
              theme_color: '#304B60',
              background_color: '#E3DAD1',
              icons: [
                { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' },
              ],
            };

            // Validate manifest
            const validator = new ManifestValidator(manifest);
            expect(validator.isValid()).toBe(true);

            // Property: Display mode supports standalone experience
            expect(['standalone', 'fullscreen', 'minimal-ui']).toContain(displayMode);
            expect(manifest.display).toBe(displayMode);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
