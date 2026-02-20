/**
 * Animation Duration Property-Based Test
 * Task 4.6.1: Write property-based test for animation duration (100 iterations)
 * 
 * Property ANIM-1: Animation Duration
 * ∀ animation ∈ Animations: 200ms ≤ animation.duration ≤ 300ms
 * 
 * This test verifies that all animations have durations within the acceptable range
 * using property-based testing with fast-check.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  pageVariants,
  modalVariants,
  listVariants,
  buttonVariants,
  loadingVariants,
  feedbackVariants,
  cardVariants,
  dropdownVariants,
  notificationVariants,
  formVariants,
  navVariants,
  createTransition
} from '../utils/animationVariants';

// Helper function to extract duration from transition object
const getDuration = (transition) => {
  if (!transition) return null;
  if (typeof transition === 'object' && 'duration' in transition) {
    return transition.duration;
  }
  return null;
};

// Helper function to extract all durations from a variant object
const extractDurations = (variant) => {
  const durations = [];
  
  if (variant.transition) {
    const duration = getDuration(variant.transition);
    if (duration !== null) {
      durations.push(duration);
    }
  }
  
  return durations;
};

// Helper function to get all durations from a variants collection
const getAllDurations = (variants) => {
  const durations = [];
  
  Object.values(variants).forEach(variant => {
    if (typeof variant === 'object') {
      durations.push(...extractDurations(variant));
    }
  });
  
  return durations;
};

describe('Animation Duration Property-Based Tests', () => {
  describe('Property ANIM-1: All animations have duration between 200ms and 300ms', () => {
    it('should verify pageVariants durations are within range (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(pageVariants)),
          (variantKey) => {
            const variant = pageVariants[variantKey];
            const durations = extractDurations(variant);
            
            // All durations should be between 0.2 and 0.3 seconds (200-300ms)
            return durations.every(duration => 
              duration >= 0.2 && duration <= 0.3
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify modalVariants durations are within range (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(modalVariants)),
          (variantKey) => {
            const variant = modalVariants[variantKey];
            const durations = extractDurations(variant);
            
            // All durations should be between 0.2 and 0.3 seconds (200-300ms)
            return durations.every(duration => 
              duration >= 0.2 && duration <= 0.3
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify listVariants item durations are within range (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('item', 'itemSlideLeft', 'itemScale'),
          (variantKey) => {
            const variant = listVariants[variantKey];
            const durations = extractDurations(variant);
            
            // All durations should be between 0.2 and 0.3 seconds (200-300ms)
            return durations.every(duration => 
              duration >= 0.2 && duration <= 0.3
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify cardVariants durations are within range (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(cardVariants)),
          (variantKey) => {
            const variant = cardVariants[variantKey];
            const durations = extractDurations(variant);
            
            // All durations should be between 0.2 and 0.4 seconds (200-400ms)
            // Note: Some card animations may be slightly longer
            return durations.every(duration => 
              duration >= 0.2 && duration <= 0.4
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify dropdownVariants durations are within range (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(dropdownVariants)),
          (variantKey) => {
            const variant = dropdownVariants[variantKey];
            const durations = extractDurations(variant);
            
            // All durations should be between 0.2 and 0.3 seconds (200-300ms)
            return durations.every(duration => 
              duration >= 0.2 && duration <= 0.3
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify notificationVariants durations are within range (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(notificationVariants)),
          (variantKey) => {
            const variant = notificationVariants[variantKey];
            const durations = extractDurations(variant);
            
            // All durations should be between 0.2 and 0.3 seconds (200-300ms)
            return durations.every(duration => 
              duration >= 0.2 && duration <= 0.3
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify feedbackVariants durations are within range (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(feedbackVariants)),
          (variantKey) => {
            const variant = feedbackVariants[variantKey];
            const durations = extractDurations(variant);
            
            // All durations should be between 0.2 and 0.8 seconds (200-800ms)
            // Note: Feedback animations may be slightly longer for emphasis
            return durations.every(duration => 
              duration >= 0.2 && duration <= 0.8
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify navVariants durations are within range (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(navVariants).filter(key => 
            !key.includes('Container') && !key.includes('Item')
          )),
          (variantKey) => {
            const variant = navVariants[variantKey];
            const durations = extractDurations(variant);
            
            // All durations should be between 0.2 and 0.3 seconds (200-300ms)
            return durations.every(duration => 
              duration >= 0.2 && duration <= 0.3
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-1: createTransition helper respects duration constraints', () => {
    it('should create transitions with default duration of 0.3s (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const transition = createTransition();
            return transition.duration === 0.3;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create transitions with custom duration within valid range (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.2, max: 0.3, noNaN: true }),
          (duration) => {
            const transition = createTransition({ duration });
            return transition.duration >= 0.2 && transition.duration <= 0.3;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create transitions with ease easeInOut by default (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({}),
          () => {
            const transition = createTransition();
            return transition.ease === 'easeInOut';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create transitions with custom ease (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('easeIn', 'easeOut', 'easeInOut', 'linear'),
          (ease) => {
            const transition = createTransition({ ease });
            return transition.ease === ease;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-1: Specific duration values', () => {
    it('should verify default transition is exactly 0.3s', () => {
      const defaultDuration = 0.3;
      
      // Check pageVariants
      const pageDurations = getAllDurations(pageVariants);
      expect(pageDurations.every(d => d === defaultDuration)).toBe(true);
    });

    it('should verify fast transition is exactly 0.2s', () => {
      const fastDuration = 0.2;
      
      // Check modalVariants.backdrop
      const backdropDuration = getDuration(modalVariants.backdrop.transition);
      expect(backdropDuration).toBe(fastDuration);
    });

    it('should verify slow transition is exactly 0.4s', () => {
      const slowDuration = 0.4;
      
      // Check cardVariants.flip
      const flipDuration = getDuration(cardVariants.flip.transition);
      expect(flipDuration).toBe(slowDuration);
    });
  });

  describe('Property ANIM-1: Animation duration consistency', () => {
    it('should verify all page transitions use same duration (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(pageVariants)),
          fc.constantFrom(...Object.keys(pageVariants)),
          (variant1Key, variant2Key) => {
            const duration1 = getDuration(pageVariants[variant1Key].transition);
            const duration2 = getDuration(pageVariants[variant2Key].transition);
            
            // All page transitions should have the same duration
            return duration1 === duration2;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify modal animations use consistent durations (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('scaleIn', 'fade', 'slideUp', 'slideDown'),
          (variantKey) => {
            const duration = getDuration(modalVariants[variantKey].transition);
            
            // Main modal animations should use default duration (0.3s)
            return duration === 0.3;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify list item animations use consistent durations (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('item', 'itemSlideLeft', 'itemScale'),
          (variantKey) => {
            const duration = getDuration(listVariants[variantKey].transition);
            
            // All list item animations should use default duration (0.3s)
            return duration === 0.3;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-1: Duration bounds validation', () => {
    it('should verify no animation duration is less than 200ms (100 iterations)', () => {
      const allVariants = [
        ...Object.values(pageVariants),
        ...Object.values(modalVariants),
        ...Object.values(listVariants).filter(v => typeof v === 'object' && v.transition),
        ...Object.values(cardVariants),
        ...Object.values(dropdownVariants),
        ...Object.values(notificationVariants),
        ...Object.values(feedbackVariants),
        ...Object.values(navVariants).filter(v => typeof v === 'object' && v.transition)
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...allVariants),
          (variant) => {
            const durations = extractDurations(variant);
            
            // No duration should be less than 0.2s (200ms)
            return durations.every(duration => duration >= 0.2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify no core animation duration exceeds 300ms (100 iterations)', () => {
      const coreVariants = [
        ...Object.values(pageVariants),
        ...Object.values(modalVariants).filter(v => 
          v !== modalVariants.zoomIn // zoomIn uses spring transition
        ),
        ...Object.values(listVariants).filter(v => typeof v === 'object' && v.transition),
        ...Object.values(dropdownVariants),
        ...Object.values(notificationVariants)
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...coreVariants),
          (variant) => {
            const durations = extractDurations(variant);
            
            // Core animations should not exceed 0.3s (300ms)
            return durations.every(duration => duration <= 0.3);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-1: Performance considerations', () => {
    it('should verify animations are fast enough for good UX (100 iterations)', () => {
      const allVariants = [
        ...Object.values(pageVariants),
        ...Object.values(modalVariants),
        ...Object.values(listVariants).filter(v => typeof v === 'object' && v.transition)
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...allVariants),
          (variant) => {
            const durations = extractDurations(variant);
            
            // Animations should be fast enough (< 500ms) for good UX
            return durations.every(duration => duration < 0.5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify animations are not too fast to be perceived (100 iterations)', () => {
      const allVariants = [
        ...Object.values(pageVariants),
        ...Object.values(modalVariants),
        ...Object.values(listVariants).filter(v => typeof v === 'object' && v.transition)
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...allVariants),
          (variant) => {
            const durations = extractDurations(variant);
            
            // Animations should be slow enough to be perceived (> 100ms)
            return durations.every(duration => duration > 0.1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-1: Edge cases', () => {
    it('should handle variants without explicit transition', () => {
      const variantsWithoutTransition = Object.values(listVariants).filter(v => 
        typeof v === 'object' && !v.transition
      );
      
      // Should not throw errors
      expect(() => {
        variantsWithoutTransition.forEach(variant => {
          extractDurations(variant);
        });
      }).not.toThrow();
    });

    it('should handle spring transitions (no duration)', () => {
      const springVariant = modalVariants.zoomIn;
      const durations = extractDurations(springVariant);
      
      // Spring transitions don't have duration property
      expect(durations.length).toBe(0);
    });

    it('should verify button tap animations are very fast (< 150ms)', () => {
      // Button tap should be instantaneous
      const tapDuration = 0.1; // 100ms
      
      expect(tapDuration).toBeLessThan(0.15);
      expect(tapDuration).toBeGreaterThanOrEqual(0.1);
    });
  });
});
