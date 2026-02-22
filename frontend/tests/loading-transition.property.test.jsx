/**
 * Loading Transition Property-Based Test
 * Task 8.6.2: Write property-based test for loading transition (100 iterations)
 * 
 * This test suite validates loading state transitions using property-based testing
 * to ensure smooth transitions across all possible loading state combinations.
 * 
 * Requirements:
 * - FR-LOAD-7: 200ms fade transition for loading states
 * - Property LOAD-2: Loading transitions are smooth
 * - NFR-PERF-5: CLS < 0.1
 * 
 * **Validates: Requirements FR-LOAD-7, Property LOAD-2, NFR-PERF-5**
 */

import fc from 'fast-check';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import React, { useState, useEffect } from 'react';
import { getLoadingTransitionStyles } from '../src/utils/layoutShiftPrevention';
import { useLoadingTransition } from '../src/hooks/useLayoutShiftPrevention';

/**
 * Arbitrary generators for property-based testing
 */

// Generate loading state (true/false)
const loadingStateArbitrary = fc.boolean();

// Generate transition duration in ms (should be around 200ms)
const transitionDurationArbitrary = fc.integer({ min: 100, max: 300 });

// Generate delay before state change (0-500ms)
const delayArbitrary = fc.integer({ min: 0, max: 500 });

// Generate opacity values (0-1)
const opacityArbitrary = fc.double({ min: 0, max: 1 });

// Generate scale values (0.9-1.1)
const scaleArbitrary = fc.double({ min: 0.9, max: 1.1 });

// Generate multiple loading states for coordination testing
const multipleLoadingStatesArbitrary = fc.array(fc.boolean(), { minLength: 2, maxLength: 5 });

// Generate timing function
const timingFunctionArbitrary = fc.constantFrom(
  'ease-in-out',
  'ease-in',
  'ease-out',
  'linear'
);

/**
 * Helper function to extract transition duration from CSS string
 */
const extractTransitionDuration = (transitionString) => {
  if (!transitionString) return 0;
  const match = transitionString.match(/(\d+)ms/);
  return match ? parseInt(match[1], 10) : 0;
};

/**
 * Helper function to check if transition uses GPU-accelerated properties
 */
const usesGPUAcceleratedProperties = (transitionString) => {
  if (!transitionString) return false;
  const gpuProps = ['opacity', 'transform'];
  return gpuProps.some(prop => transitionString.includes(prop));
};

/**
 * Helper component for testing loading transitions
 */
const LoadingTransitionComponent = ({ initialLoading, delay = 100 }) => {
  const [loading, setLoading] = useState(initialLoading);
  const transitionStyle = getLoadingTransitionStyles(loading);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(!initialLoading), delay);
    return () => clearTimeout(timer);
  }, [initialLoading, delay]);

  return (
    <div data-testid="transition-container" style={transitionStyle}>
      {loading ? (
        <div data-testid="loading-state">Loading...</div>
      ) : (
        <div data-testid="content-state">Content Loaded</div>
      )}
    </div>
  );
};

describe('Loading Transition Property-Based Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // Clean up DOM after each test
    vi.restoreAllMocks();
  });

  /**
   * Property 1: Transition duration should always be 200ms
   * Validates: FR-LOAD-7
   */
  it('should always use 200ms transition duration (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        (isLoading) => {
          const styles = getLoadingTransitionStyles(isLoading);
          
          // Extract transition duration
          const duration = extractTransitionDuration(styles.transition);
          
          // Should be exactly 200ms
          expect(duration).toBe(200);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Transitions should only use GPU-accelerated properties
   * Validates: Property LOAD-2, NFR-PERF-5
   */
  it('should only use GPU-accelerated properties (opacity, transform) (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        (isLoading) => {
          const styles = getLoadingTransitionStyles(isLoading);
          
          // Check that transition uses GPU-accelerated properties
          expect(usesGPUAcceleratedProperties(styles.transition)).toBe(true);
          
          // Should not animate width, height, top, left, etc.
          expect(styles.transition).not.toContain('width');
          expect(styles.transition).not.toContain('height');
          expect(styles.transition).not.toContain('top');
          expect(styles.transition).not.toContain('left');
          expect(styles.transition).not.toContain('margin');
          expect(styles.transition).not.toContain('padding');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Opacity should transition between 0.6 (loading) and 1 (loaded)
   * Validates: Property LOAD-2
   */
  it('should transition opacity correctly based on loading state (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        (isLoading) => {
          const styles = getLoadingTransitionStyles(isLoading);
          
          if (isLoading) {
            expect(styles.opacity).toBe(0.6);
          } else {
            expect(styles.opacity).toBe(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Transform scale should transition between 0.98 (loading) and 1 (loaded)
   * Validates: Property LOAD-2
   */
  it('should transition transform scale correctly based on loading state (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        (isLoading) => {
          const styles = getLoadingTransitionStyles(isLoading);
          
          if (isLoading) {
            expect(styles.transform).toBe('scale(0.98)');
          } else {
            expect(styles.transform).toBe('scale(1)');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: willChange should always be set for performance
   * Validates: NFR-PERF-5
   */
  it('should always set willChange for GPU optimization (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        (isLoading) => {
          const styles = getLoadingTransitionStyles(isLoading);
          
          expect(styles.willChange).toBeDefined();
          expect(styles.willChange).toContain('opacity');
          expect(styles.willChange).toContain('transform');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Transition should use ease-in-out timing function
   * Validates: Property LOAD-2
   */
  it('should use ease-in-out timing function (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        (isLoading) => {
          const styles = getLoadingTransitionStyles(isLoading);
          
          expect(styles.transition).toContain('ease-in-out');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Loading state changes should be fast
   * Validates: FR-LOAD-7, Property LOAD-2
   */
  it('should have correct transition timing configuration (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        (isLoading) => {
          const styles = getLoadingTransitionStyles(isLoading);
          
          // Extract duration from transition string
          const duration = extractTransitionDuration(styles.transition);
          
          // Should be 200ms which allows completion within 300ms
          expect(duration).toBe(200);
          
          // Should use ease-in-out for smooth transitions
          expect(styles.transition).toContain('ease-in-out');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Transition styles should be consistent regardless of state order
   * Validates: Property LOAD-2
   */
  it('should produce consistent styles regardless of state transitions (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(loadingStateArbitrary, { minLength: 2, maxLength: 10 }),
        (stateSequence) => {
          const styles = stateSequence.map(state => getLoadingTransitionStyles(state));
          
          // All styles should have the same transition property
          const transitions = styles.map(s => s.transition);
          const uniqueTransitions = [...new Set(transitions)];
          expect(uniqueTransitions.length).toBe(1);
          
          // All styles should have willChange set
          styles.forEach(style => {
            expect(style.willChange).toBe('opacity, transform');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Multiple loading states should not interfere with each other
   * Validates: Property LOAD-2
   */
  it('should handle multiple independent loading states (100 iterations)', () => {
    fc.assert(
      fc.property(
        multipleLoadingStatesArbitrary,
        (loadingStates) => {
          const allStyles = loadingStates.map(state => getLoadingTransitionStyles(state));
          
          // Each should have independent styles
          allStyles.forEach((styles, index) => {
            const expectedOpacity = loadingStates[index] ? 0.6 : 1;
            const expectedScale = loadingStates[index] ? 'scale(0.98)' : 'scale(1)';
            
            expect(styles.opacity).toBe(expectedOpacity);
            expect(styles.transform).toBe(expectedScale);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Transition should maintain layout stability (no dimension changes)
   * Validates: NFR-PERF-5 (CLS < 0.1)
   */
  it('should not change element dimensions during transition (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        (isLoading) => {
          const styles = getLoadingTransitionStyles(isLoading);
          
          // Should not have width or height in styles
          expect(styles.width).toBeUndefined();
          expect(styles.height).toBeUndefined();
          
          // Should not have position changes
          expect(styles.top).toBeUndefined();
          expect(styles.left).toBeUndefined();
          expect(styles.right).toBeUndefined();
          expect(styles.bottom).toBeUndefined();
          
          // Should not have margin/padding changes
          expect(styles.margin).toBeUndefined();
          expect(styles.padding).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11: Transition should be idempotent (same input = same output)
   * Validates: Property LOAD-2
   */
  it('should produce identical styles for identical inputs (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        (isLoading) => {
          const styles1 = getLoadingTransitionStyles(isLoading);
          const styles2 = getLoadingTransitionStyles(isLoading);
          
          expect(styles1).toEqual(styles2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Hook should provide consistent transition styles
   * Validates: Property LOAD-2
   */
  it('should provide consistent styles through useLoadingTransition hook (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        (initialLoading) => {
          const HookTestComponent = () => {
            const { transitionStyle, loading } = useLoadingTransition(initialLoading);
            
            return (
              <div data-testid="hook-container" style={transitionStyle}>
                {loading ? 'Loading' : 'Loaded'}
              </div>
            );
          };

          const { container, unmount } = render(<HookTestComponent />);
          
          try {
            const elements = screen.queryAllByTestId('hook-container');
            
            // Should have at least one element
            expect(elements.length).toBeGreaterThan(0);
            
            // Verify styles are applied (checking via inline styles)
            const element = elements[0];
            const style = element.getAttribute('style');
            expect(style).toBeTruthy();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Rapid state changes should not break transitions
   * Validates: Property LOAD-2
   */
  it('should handle rapid loading state changes gracefully (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(loadingStateArbitrary, { minLength: 5, maxLength: 20 }),
        (rapidStates) => {
          // Simulate rapid state changes
          rapidStates.forEach(state => {
            const styles = getLoadingTransitionStyles(state);
            
            // Each call should return valid styles
            expect(styles.transition).toBeDefined();
            expect(styles.opacity).toBeDefined();
            expect(styles.transform).toBeDefined();
            expect(styles.willChange).toBeDefined();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 14: Transition properties should be valid CSS values
   * Validates: Property LOAD-2
   */
  it('should always return valid CSS values (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        (isLoading) => {
          const styles = getLoadingTransitionStyles(isLoading);
          
          // Opacity should be a number between 0 and 1
          expect(typeof styles.opacity).toBe('number');
          expect(styles.opacity).toBeGreaterThanOrEqual(0);
          expect(styles.opacity).toBeLessThanOrEqual(1);
          
          // Transform should be a string with scale
          expect(typeof styles.transform).toBe('string');
          expect(styles.transform).toMatch(/^scale\([\d.]+\)$/);
          
          // Transition should be a valid CSS transition string
          expect(typeof styles.transition).toBe('string');
          expect(styles.transition).toMatch(/opacity \d+ms ease-in-out, transform \d+ms ease-in-out/);
          
          // willChange should be a string
          expect(typeof styles.willChange).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 15: Transition styles should work with any initial state
   * Validates: Property LOAD-2
   */
  it('should produce valid styles regardless of initial loading state (100 iterations)', () => {
    fc.assert(
      fc.property(
        loadingStateArbitrary,
        (initialLoading) => {
          const styles = getLoadingTransitionStyles(initialLoading);
          
          // Should always return valid styles
          expect(styles.opacity).toBeDefined();
          expect(styles.transform).toBeDefined();
          expect(styles.transition).toBeDefined();
          expect(styles.willChange).toBeDefined();
          
          // Values should be correct for the state
          if (initialLoading) {
            expect(styles.opacity).toBe(0.6);
            expect(styles.transform).toBe('scale(0.98)');
          } else {
            expect(styles.opacity).toBe(1);
            expect(styles.transform).toBe('scale(1)');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Summary of Properties Tested:
 * 
 * 1. Transition duration is always 200ms (FR-LOAD-7)
 * 2. Only GPU-accelerated properties are used (NFR-PERF-5)
 * 3. Opacity transitions correctly (0.6 ↔ 1)
 * 4. Transform scale transitions correctly (0.98 ↔ 1)
 * 5. willChange is always set for optimization
 * 6. Uses ease-in-out timing function
 * 7. Transition timing is configured correctly
 * 8. Consistent styles regardless of state order
 * 9. Multiple loading states don't interfere
 * 10. No dimension changes (layout stability)
 * 11. Idempotent (same input = same output)
 * 12. Hook provides consistent styles
 * 13. Handles rapid state changes
 * 14. Returns valid CSS values
 * 15. Works with different initial states
 * 
 * All properties validate:
 * - FR-LOAD-7: 200ms fade transition for loading states
 * - Property LOAD-2: Loading transitions are smooth
 * - NFR-PERF-5: CLS < 0.1 (no layout shifts)
 */
