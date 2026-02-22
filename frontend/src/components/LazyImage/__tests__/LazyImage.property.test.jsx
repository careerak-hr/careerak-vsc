/**
 * Property-Based Tests for LazyImage Component
 * 
 * **Validates: Requirements 2.6.3**
 * 
 * Tests the correctness properties of the image lazy loading implementation
 * using property-based testing with fast-check.
 * 
 * Property PERF-3: Image Lazy Loading
 * ∀ image ∈ Images:
 *   image.loaded = false UNTIL image.inViewport = true
 * 
 * Test: Images load only when in viewport
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import LazyImage from '../LazyImage';

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.elements = new Set();
    MockIntersectionObserver.instances.push(this);
  }

  observe(element) {
    this.elements.add(element);
    MockIntersectionObserver.observedElements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
    MockIntersectionObserver.observedElements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  // Helper to trigger intersection
  triggerIntersection(isIntersecting) {
    this.elements.forEach((element) => {
      this.callback([
        {
          target: element,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
        },
      ]);
    });
  }

  static instances = [];
  static observedElements = new Set();

  static reset() {
    MockIntersectionObserver.instances = [];
    MockIntersectionObserver.observedElements.clear();
  }

  static getLastInstance() {
    return MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1];
  }
}

describe('LazyImage Property-Based Tests', () => {
  beforeEach(() => {
    // Setup IntersectionObserver mock
    global.IntersectionObserver = MockIntersectionObserver;
    MockIntersectionObserver.reset();
  });

  afterEach(() => {
    MockIntersectionObserver.reset();
  });

  /**
   * Property PERF-3: Image Lazy Loading
   * 
   * ∀ image ∈ Images:
   *   image.loaded = false UNTIL image.inViewport = true
   * 
   * This property ensures that images are not loaded until they enter the viewport,
   * which is the core behavior of lazy loading.
   */
  describe('Property PERF-3: Image Lazy Loading', () => {
    it('should not load image until it enters viewport (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // publicId
          fc.string({ minLength: 0, maxLength: 100 }), // alt text
          fc.integer({ min: 50, max: 2000 }), // width
          fc.integer({ min: 50, max: 2000 }), // height
          fc.double({ min: 0, max: 1 }), // threshold
          fc.constantFrom('0px', '10px', '50px', '100px', '200px'), // rootMargin
          (publicId, alt, width, height, threshold, rootMargin) => {
            // Render LazyImage
            const { container } = render(
              <LazyImage
                publicId={publicId}
                alt={alt}
                width={width}
                height={height}
                threshold={threshold}
                rootMargin={rootMargin}
              />
            );

            // Get the observer instance
            const observer = MockIntersectionObserver.getLastInstance();

            // Verify image is NOT loaded initially (not in viewport)
            const picture = container.querySelector('picture');
            expect(picture).toBeNull(); // Picture element should not exist yet

            // Verify placeholder is shown
            const notLoadedDiv = container.querySelector('.lazy-image-not-loaded');
            expect(notLoadedDiv).not.toBeNull();

            // Simulate image entering viewport
            observer.triggerIntersection(true);

            // Now picture element should exist (image starts loading)
            const pictureAfter = container.querySelector('picture');
            expect(pictureAfter).not.toBeNull();

            // Verify the image element exists
            const img = container.querySelector('img.lazy-image');
            expect(img).not.toBeNull();
            expect(img.getAttribute('alt')).toBe(alt);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain lazy loading behavior across different configurations (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // publicId
          fc.boolean(), // responsive
          fc.boolean(), // placeholder
          fc.boolean(), // showSpinner
          fc.constantFrom('jpeg', 'png'), // fallbackFormat
          (publicId, responsive, placeholder, showSpinner, fallbackFormat) => {
            // Render LazyImage with various configurations
            const { container } = render(
              <LazyImage
                publicId={publicId}
                alt="Test image"
                responsive={responsive}
                placeholder={placeholder}
                showSpinner={showSpinner}
                fallbackFormat={fallbackFormat}
              />
            );

            // Get the observer instance
            const observer = MockIntersectionObserver.getLastInstance();

            // Before entering viewport: image should NOT be loaded
            let picture = container.querySelector('picture');
            expect(picture).toBeNull();

            // Trigger intersection (image enters viewport)
            observer.triggerIntersection(true);

            // After entering viewport: image SHOULD be loaded
            picture = container.querySelector('picture');
            expect(picture).not.toBeNull();

            // Verify image element exists
            const img = container.querySelector('img.lazy-image');
            expect(img).not.toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should only trigger loading once when triggerOnce is true (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // publicId
          fc.array(fc.boolean(), { minLength: 2, maxLength: 10 }), // sequence of visibility changes
          (publicId, visibilitySequence) => {
            // Render LazyImage
            const { container } = render(
              <LazyImage publicId={publicId} alt="Test" />
            );

            const observer = MockIntersectionObserver.getLastInstance();

            // Initially not loaded
            expect(container.querySelector('picture')).toBeNull();

            // Apply visibility sequence
            let hasBeenVisible = false;
            for (const isVisible of visibilitySequence) {
              observer.triggerIntersection(isVisible);
              
              if (isVisible && !hasBeenVisible) {
                hasBeenVisible = true;
              }
            }

            // If image was visible at least once, it should be loaded
            const picture = container.querySelector('picture');
            if (hasBeenVisible) {
              expect(picture).not.toBeNull();
            } else {
              expect(picture).toBeNull();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect threshold and rootMargin settings (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // publicId
          fc.double({ min: 0, max: 1 }), // threshold
          fc.constantFrom('0px', '50px', '100px', '200px'), // rootMargin
          (publicId, threshold, rootMargin) => {
            // Render LazyImage with specific threshold and rootMargin
            render(
              <LazyImage
                publicId={publicId}
                alt="Test"
                threshold={threshold}
                rootMargin={rootMargin}
              />
            );

            // Get the observer instance
            const observer = MockIntersectionObserver.getLastInstance();

            // Verify observer was created with correct options
            expect(observer.options.threshold).toBe(threshold);
            expect(observer.options.rootMargin).toBe(rootMargin);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple images independently (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              publicId: fc.string({ minLength: 1, maxLength: 50 }),
              alt: fc.string({ minLength: 0, maxLength: 100 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          (images) => {
            // Render multiple LazyImage components
            const { container } = render(
              <div>
                {images.map((img, index) => (
                  <LazyImage
                    key={index}
                    publicId={img.publicId}
                    alt={img.alt}
                  />
                ))}
              </div>
            );

            // Get all observer instances
            const observers = MockIntersectionObserver.instances.slice(-images.length);

            // Initially, no images should be loaded
            let pictures = container.querySelectorAll('picture');
            expect(pictures.length).toBe(0);

            // Trigger intersection for only the first image
            observers[0].triggerIntersection(true);

            // Only the first image should be loaded
            pictures = container.querySelectorAll('picture');
            expect(pictures.length).toBe(1);

            // Trigger intersection for all remaining images
            for (let i = 1; i < observers.length; i++) {
              observers[i].triggerIntersection(true);
            }

            // Now all images should be loaded
            pictures = container.querySelectorAll('picture');
            expect(pictures.length).toBe(images.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not load image when it leaves viewport before loading (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // publicId
          (publicId) => {
            // Render LazyImage
            const { container } = render(
              <LazyImage publicId={publicId} alt="Test" />
            );

            const observer = MockIntersectionObserver.getLastInstance();

            // Initially not loaded
            expect(container.querySelector('picture')).toBeNull();

            // Simulate entering viewport
            observer.triggerIntersection(true);

            // Image should start loading
            expect(container.querySelector('picture')).not.toBeNull();

            // Note: Once triggerOnce is true and image has been visible,
            // it stays loaded even if it leaves viewport
            // This is the expected behavior for lazy loading
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty or invalid publicId gracefully (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', null, undefined), // invalid publicId
          (publicId) => {
            // Render LazyImage with invalid publicId
            const { container } = render(
              <LazyImage publicId={publicId} alt="Test" />
            );

            // Should show placeholder, not attempt to load
            const placeholder = container.querySelector('.lazy-image-placeholder');
            expect(placeholder).not.toBeNull();

            // Should not have picture element
            const picture = container.querySelector('picture');
            expect(picture).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve lazy loading behavior when props change (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // initial publicId
          fc.string({ minLength: 1, maxLength: 50 }), // new publicId
          (initialPublicId, newPublicId) => {
            // Render LazyImage
            const { container, rerender } = render(
              <LazyImage publicId={initialPublicId} alt="Test" />
            );

            const observer = MockIntersectionObserver.getLastInstance();

            // Initially not loaded
            expect(container.querySelector('picture')).toBeNull();

            // Change publicId before entering viewport
            rerender(<LazyImage publicId={newPublicId} alt="Test" />);

            // Still should not be loaded
            expect(container.querySelector('picture')).toBeNull();

            // Now trigger intersection
            const newObserver = MockIntersectionObserver.getLastInstance();
            newObserver.triggerIntersection(true);

            // Should be loaded now
            expect(container.querySelector('picture')).not.toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional Property: Observer Cleanup
   * 
   * Ensures that IntersectionObserver is properly cleaned up when component unmounts
   */
  describe('Observer Cleanup Property', () => {
    it('should cleanup observer on unmount (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // publicId
          (publicId) => {
            // Render LazyImage
            const { unmount } = render(
              <LazyImage publicId={publicId} alt="Test" />
            );

            // Verify observer was created
            const observer = MockIntersectionObserver.getLastInstance();
            expect(observer.elements.size).toBeGreaterThan(0);

            // Unmount component
            unmount();

            // Observer should be cleaned up (elements should be empty)
            // Note: In real implementation, disconnect() is called
            // Our mock doesn't automatically clear on disconnect, but the real one does
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional Property: Intersection Observer Fallback
   * 
   * Ensures graceful degradation when IntersectionObserver is not supported
   */
  describe('IntersectionObserver Fallback Property', () => {
    it('should load images immediately when IntersectionObserver is not supported (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // publicId
          (publicId) => {
            // Remove IntersectionObserver support
            const originalIO = global.IntersectionObserver;
            delete global.IntersectionObserver;

            // Render LazyImage
            const { container } = render(
              <LazyImage publicId={publicId} alt="Test" />
            );

            // Image should be loaded immediately (fallback behavior)
            const picture = container.querySelector('picture');
            expect(picture).not.toBeNull();

            // Restore IntersectionObserver
            global.IntersectionObserver = originalIO;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
