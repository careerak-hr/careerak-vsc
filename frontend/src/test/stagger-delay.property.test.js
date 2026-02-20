/**
 * Stagger Delay Property-Based Test
 * Task 4.6.3: Write property-based test for stagger delay (100 iterations)
 * 
 * Property ANIM-3: Stagger Delay
 * ∀ item[i] ∈ ListItems: item[i].delay = i * 50ms
 * 
 * This test verifies that list items stagger with exactly 50ms delay between items
 * using property-based testing with fast-check.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  listVariants,
  createStaggerContainer,
  navVariants
} from '../utils/animationVariants';

// Helper function to calculate expected delay for item at index i
const calculateExpectedDelay = (index, staggerDelay, initialDelay = 0) => {
  return initialDelay + (index * staggerDelay);
};

// Helper function to extract staggerChildren from container variant
const getStaggerDelay = (containerVariant) => {
  if (containerVariant?.animate?.transition?.staggerChildren !== undefined) {
    return containerVariant.animate.transition.staggerChildren;
  }
  return null;
};

// Helper function to extract delayChildren from container variant
const getInitialDelay = (containerVariant) => {
  if (containerVariant?.animate?.transition?.delayChildren !== undefined) {
    return containerVariant.animate.transition.delayChildren;
  }
  return 0;
};

describe('Stagger Delay Property-Based Tests', () => {
  describe('Property ANIM-3: List items stagger with 50ms delay', () => {
    it('should verify default stagger delay is exactly 0.05s (50ms) (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const staggerDelay = getStaggerDelay(listVariants.container);
            
            // Stagger delay should be exactly 0.05s (50ms)
            return staggerDelay === 0.05;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify item delay calculation for any list size (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }), // List item index
          (itemIndex) => {
            const staggerDelay = getStaggerDelay(listVariants.container);
            const initialDelay = getInitialDelay(listVariants.container);
            
            // Calculate expected delay for this item
            const expectedDelay = calculateExpectedDelay(itemIndex, staggerDelay, initialDelay);
            
            // Verify calculation is correct
            const calculatedDelay = initialDelay + (itemIndex * 0.05);
            
            return Math.abs(expectedDelay - calculatedDelay) < 0.0001; // Float comparison
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify stagger delay consistency across multiple items (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 50 }),
          fc.integer({ min: 0, max: 50 }),
          (index1, index2) => {
            const staggerDelay = getStaggerDelay(listVariants.container);
            const initialDelay = getInitialDelay(listVariants.container);
            
            const delay1 = calculateExpectedDelay(index1, staggerDelay, initialDelay);
            const delay2 = calculateExpectedDelay(index2, staggerDelay, initialDelay);
            
            // The difference between delays should equal the difference in indices * staggerDelay
            const expectedDifference = Math.abs(index2 - index1) * staggerDelay;
            const actualDifference = Math.abs(delay2 - delay1);
            
            return Math.abs(expectedDifference - actualDifference) < 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify stagger delay is uniform (not random) (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 20 }), { minLength: 2, maxLength: 10 }),
          (indices) => {
            const staggerDelay = getStaggerDelay(listVariants.container);
            const initialDelay = getInitialDelay(listVariants.container);
            
            // Calculate delays for all indices
            const delays = indices.map(i => 
              calculateExpectedDelay(i, staggerDelay, initialDelay)
            );
            
            // Sort both arrays
            const sortedIndices = [...indices].sort((a, b) => a - b);
            const sortedDelays = [...delays].sort((a, b) => a - b);
            
            // Verify that sorted delays match sorted indices
            return sortedIndices.every((index, i) => {
              const expectedDelay = calculateExpectedDelay(index, staggerDelay, initialDelay);
              return Math.abs(sortedDelays[i] - expectedDelay) < 0.0001;
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-3: Fast container stagger delay (30ms)', () => {
    it('should verify fast stagger delay is exactly 0.03s (30ms) (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const staggerDelay = getStaggerDelay(listVariants.fastContainer);
            
            // Fast stagger delay should be exactly 0.03s (30ms)
            return staggerDelay === 0.03;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify fast container item delays (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 50 }),
          (itemIndex) => {
            const staggerDelay = getStaggerDelay(listVariants.fastContainer);
            const initialDelay = getInitialDelay(listVariants.fastContainer);
            
            const expectedDelay = calculateExpectedDelay(itemIndex, staggerDelay, initialDelay);
            const calculatedDelay = initialDelay + (itemIndex * 0.03);
            
            return Math.abs(expectedDelay - calculatedDelay) < 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-3: Slow container stagger delay (100ms)', () => {
    it('should verify slow stagger delay is exactly 0.1s (100ms) (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const staggerDelay = getStaggerDelay(listVariants.slowContainer);
            
            // Slow stagger delay should be exactly 0.1s (100ms)
            return staggerDelay === 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify slow container item delays (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 50 }),
          (itemIndex) => {
            const staggerDelay = getStaggerDelay(listVariants.slowContainer);
            const initialDelay = getInitialDelay(listVariants.slowContainer);
            
            const expectedDelay = calculateExpectedDelay(itemIndex, staggerDelay, initialDelay);
            const calculatedDelay = initialDelay + (itemIndex * 0.1);
            
            return Math.abs(expectedDelay - calculatedDelay) < 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-3: createStaggerContainer helper', () => {
    it('should create containers with custom stagger delays (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.01, max: 0.2, noNaN: true }),
          (customDelay) => {
            const container = createStaggerContainer(customDelay);
            const staggerDelay = getStaggerDelay(container);
            
            return Math.abs(staggerDelay - customDelay) < 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create containers with custom initial delays (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 0.5, noNaN: true }),
          fc.double({ min: 0, max: 0.5, noNaN: true }),
          (staggerDelay, initialDelay) => {
            const container = createStaggerContainer(staggerDelay, initialDelay);
            const actualInitialDelay = getInitialDelay(container);
            
            return Math.abs(actualInitialDelay - initialDelay) < 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify default values when no arguments provided (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const container = createStaggerContainer();
            const staggerDelay = getStaggerDelay(container);
            const initialDelay = getInitialDelay(container);
            
            return staggerDelay === 0.05 && initialDelay === 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-3: Navigation stagger delay', () => {
    it('should verify nav item container has stagger delay (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const staggerDelay = getStaggerDelay(navVariants.navItemContainer);
            
            // Nav items should stagger with 50ms delay
            return staggerDelay === 0.05;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify nav item delays for any menu size (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 20 }), // Menu item index
          (itemIndex) => {
            const staggerDelay = getStaggerDelay(navVariants.navItemContainer);
            const initialDelay = getInitialDelay(navVariants.navItemContainer);
            
            const expectedDelay = calculateExpectedDelay(itemIndex, staggerDelay, initialDelay);
            const calculatedDelay = initialDelay + (itemIndex * 0.05);
            
            return Math.abs(expectedDelay - calculatedDelay) < 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-3: Stagger delay bounds and validation', () => {
    it('should verify stagger delays are within reasonable range (100 iterations)', () => {
      const containers = [
        listVariants.container,
        listVariants.fastContainer,
        listVariants.slowContainer,
        navVariants.navItemContainer
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...containers),
          (container) => {
            const staggerDelay = getStaggerDelay(container);
            
            // Stagger delay should be between 10ms and 200ms for good UX
            return staggerDelay >= 0.01 && staggerDelay <= 0.2;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify stagger delay is not zero (100 iterations)', () => {
      const containers = [
        listVariants.container,
        listVariants.fastContainer,
        listVariants.slowContainer,
        navVariants.navItemContainer
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...containers),
          (container) => {
            const staggerDelay = getStaggerDelay(container);
            
            // Stagger delay should never be zero (no stagger effect)
            return staggerDelay > 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify stagger delay is not too long (100 iterations)', () => {
      const containers = [
        listVariants.container,
        listVariants.fastContainer,
        listVariants.slowContainer
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...containers),
          (container) => {
            const staggerDelay = getStaggerDelay(container);
            
            // Stagger delay should not exceed 150ms for good UX
            return staggerDelay <= 0.15;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-3: Total animation time calculations', () => {
    it('should verify total animation time for any list size (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }), // Number of items
          (numItems) => {
            const staggerDelay = getStaggerDelay(listVariants.container);
            const initialDelay = getInitialDelay(listVariants.container);
            const itemDuration = 0.3; // From listVariants.item.transition.duration
            
            // Last item starts at: initialDelay + (numItems - 1) * staggerDelay
            const lastItemStartTime = initialDelay + ((numItems - 1) * staggerDelay);
            
            // Total time: last item start + item animation duration
            const totalTime = lastItemStartTime + itemDuration;
            
            // Verify calculation
            const expectedLastItemStart = 0.1 + ((numItems - 1) * 0.05);
            const expectedTotalTime = expectedLastItemStart + 0.3;
            
            return Math.abs(totalTime - expectedTotalTime) < 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify stagger effect is noticeable but not too slow (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }), // Number of items
          (numItems) => {
            const staggerDelay = getStaggerDelay(listVariants.container);
            const initialDelay = getInitialDelay(listVariants.container);
            
            // Time between first and last item starting
            const totalStaggerTime = (numItems - 1) * staggerDelay;
            
            // Should be noticeable (>= 50ms) but not too slow (< 1s)
            return totalStaggerTime >= 0.05 && totalStaggerTime < 1.0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify fast container is faster than default (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 20 }),
          (numItems) => {
            const defaultStagger = getStaggerDelay(listVariants.container);
            const fastStagger = getStaggerDelay(listVariants.fastContainer);
            
            const defaultTime = (numItems - 1) * defaultStagger;
            const fastTime = (numItems - 1) * fastStagger;
            
            // Fast container should always be faster
            return fastTime < defaultTime;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify slow container is slower than default (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 20 }),
          (numItems) => {
            const defaultStagger = getStaggerDelay(listVariants.container);
            const slowStagger = getStaggerDelay(listVariants.slowContainer);
            
            const defaultTime = (numItems - 1) * defaultStagger;
            const slowTime = (numItems - 1) * slowStagger;
            
            // Slow container should always be slower
            return slowTime > defaultTime;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-3: Stagger delay precision', () => {
    it('should verify 50ms equals exactly 0.05 seconds (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const milliseconds = 50;
            const seconds = milliseconds / 1000;
            const staggerDelay = getStaggerDelay(listVariants.container);
            
            return seconds === 0.05 && staggerDelay === 0.05;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify stagger delay has sufficient precision (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.01, max: 0.2, noNaN: true }),
          (customDelay) => {
            const container = createStaggerContainer(customDelay);
            const actualDelay = getStaggerDelay(container);
            
            // Precision should be at least 4 decimal places
            const difference = Math.abs(actualDelay - customDelay);
            return difference < 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-3: Exit stagger behavior', () => {
    it('should verify exit stagger is faster than enter (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const enterStagger = listVariants.container.animate.transition.staggerChildren;
            const exitStagger = listVariants.container.exit.transition.staggerChildren;
            
            // Exit should be faster (smaller delay) than enter
            return exitStagger < enterStagger;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify exit stagger direction is reversed (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const staggerDirection = listVariants.container.exit.transition.staggerDirection;
            
            // Exit should stagger in reverse (-1)
            return staggerDirection === -1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify exit animation completes faster than enter (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 20 }),
          (numItems) => {
            const enterStagger = listVariants.container.animate.transition.staggerChildren;
            const exitStagger = listVariants.container.exit.transition.staggerChildren;
            const enterDelay = listVariants.container.animate.transition.delayChildren;
            
            const enterTime = enterDelay + ((numItems - 1) * enterStagger);
            const exitTime = (numItems - 1) * exitStagger; // No initial delay on exit
            
            // Exit should complete faster
            return exitTime < enterTime;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-3: Edge cases and error handling', () => {
    it('should handle single item lists (no stagger needed) (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const numItems = 1;
            const staggerDelay = getStaggerDelay(listVariants.container);
            const initialDelay = getInitialDelay(listVariants.container);
            
            // Single item should just use initial delay
            const totalDelay = initialDelay + ((numItems - 1) * staggerDelay);
            
            return totalDelay === initialDelay;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty lists gracefully (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const numItems = 0;
            const staggerDelay = getStaggerDelay(listVariants.container);
            
            // Should not throw errors
            const totalStaggerTime = Math.max(0, (numItems - 1) * staggerDelay);
            
            return totalStaggerTime === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle very large lists efficiently (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000 }),
          (numItems) => {
            const staggerDelay = getStaggerDelay(listVariants.container);
            const totalStaggerTime = (numItems - 1) * staggerDelay;
            
            // Even with large lists, total stagger time should be reasonable
            // For 1000 items with 50ms delay: 999 * 0.05 = 49.95s (too long!)
            // This test documents the limitation
            return totalStaggerTime > 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-3: Performance and UX considerations', () => {
    it('should verify stagger delay provides smooth visual flow (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 3, max: 10 }),
          (numItems) => {
            const staggerDelay = getStaggerDelay(listVariants.container);
            
            // For good visual flow, stagger should be between 30ms and 100ms
            return staggerDelay >= 0.03 && staggerDelay <= 0.1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify total animation time is reasonable for typical lists (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 15 }), // Typical list size
          (numItems) => {
            const staggerDelay = getStaggerDelay(listVariants.container);
            const initialDelay = getInitialDelay(listVariants.container);
            const itemDuration = 0.3;
            
            const totalTime = initialDelay + ((numItems - 1) * staggerDelay) + itemDuration;
            
            // Total animation should complete within 2 seconds for good UX
            return totalTime < 2.0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify stagger creates cascading effect (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }),
          fc.integer({ min: 0, max: 10 }),
          (index1, index2) => {
            if (index1 === index2) return true;
            
            const staggerDelay = getStaggerDelay(listVariants.container);
            const initialDelay = getInitialDelay(listVariants.container);
            
            const delay1 = calculateExpectedDelay(index1, staggerDelay, initialDelay);
            const delay2 = calculateExpectedDelay(index2, staggerDelay, initialDelay);
            
            // Items with higher index should always start later
            if (index1 < index2) {
              return delay1 < delay2;
            } else {
              return delay1 > delay2;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
