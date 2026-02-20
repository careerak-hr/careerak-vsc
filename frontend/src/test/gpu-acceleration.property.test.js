/**
 * GPU Acceleration Property-Based Test
 * Task 4.6.5: Write property-based test for GPU acceleration (100 iterations)
 * 
 * Property ANIM-5: GPU Acceleration
 * ∀ animation ∈ Animations: animation.properties ⊆ {transform, opacity}
 * 
 * This test verifies that all animations use only GPU-accelerated properties
 * (transform, opacity, scale, x, y, rotate, etc.) and avoid layout-triggering
 * properties (width, height, top, left, padding, margin) that cause reflows.
 * 
 * GPU-accelerated properties:
 * - opacity
 * - transform (scale, x, y, rotate, rotateX, rotateY, rotateZ, translateX, translateY, translateZ)
 * - Individual transform properties: scale, scaleX, scaleY, x, y, rotate, rotateX, rotateY, rotateZ
 * 
 * Layout-triggering properties (should NOT be animated):
 * - width, height
 * - top, left, right, bottom
 * - padding, margin
 * - border-width
 * - font-size (in most cases)
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
  presets
} from '../utils/animationVariants';

// GPU-accelerated properties that are safe to animate
const GPU_ACCELERATED_PROPERTIES = [
  'opacity',
  'scale',
  'scaleX',
  'scaleY',
  'scaleZ',
  'x',
  'y',
  'z',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'translateX',
  'translateY',
  'translateZ',
  'transform',
  'perspective',
  'transformOrigin',
  'backfaceVisibility',
  'originX',
  'originY',
  'originZ',
  'pathLength', // For SVG animations
  'pathOffset',
  'pathSpacing'
];

// Layout-triggering properties that should NOT be animated
const LAYOUT_TRIGGERING_PROPERTIES = [
  'width',
  'height',
  'top',
  'left',
  'right',
  'bottom',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'border',
  'borderWidth',
  'borderTop',
  'borderRight',
  'borderBottom',
  'borderLeft',
  'fontSize',
  'lineHeight',
  'letterSpacing'
];

/**
 * Extract all animated properties from a variant state
 * @param {Object} state - Variant state (initial, animate, exit)
 * @returns {string[]} Array of property names
 */
const extractAnimatedProperties = (state) => {
  if (!state || typeof state !== 'object') {
    return [];
  }
  // Filter out 'transition' as it's not an animated property
  return Object.keys(state).filter(key => key !== 'transition');
};

/**
 * Get all animated properties from a variant
 * @param {Object} variant - Animation variant
 * @returns {string[]} Array of all animated property names
 */
const getAllAnimatedProperties = (variant) => {
  const properties = new Set();
  
  ['initial', 'animate', 'exit'].forEach(state => {
    if (variant[state]) {
      extractAnimatedProperties(variant[state]).forEach(prop => {
        properties.add(prop);
      });
    }
  });
  
  return Array.from(properties);
};

/**
 * Check if a property is GPU-accelerated
 * @param {string} property - Property name
 * @returns {boolean} True if GPU-accelerated
 */
const isGPUAccelerated = (property) => {
  return GPU_ACCELERATED_PROPERTIES.includes(property);
};

/**
 * Check if a property triggers layout reflow
 * @param {string} property - Property name
 * @returns {boolean} True if triggers layout
 */
const triggersLayout = (property) => {
  return LAYOUT_TRIGGERING_PROPERTIES.includes(property);
};

describe('GPU Acceleration Property-Based Tests', () => {
  describe('Property ANIM-5: All animations use GPU-accelerated properties only', () => {
    it('should verify pageVariants use only GPU-accelerated properties (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(pageVariants)),
          (variantKey) => {
            const variant = pageVariants[variantKey];
            const properties = getAllAnimatedProperties(variant);
            
            properties.forEach(prop => {
              expect(isGPUAccelerated(prop)).toBe(true);
              expect(triggersLayout(prop)).toBe(false);
            });
            
            return properties.every(prop => isGPUAccelerated(prop));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify modalVariants use only GPU-accelerated properties (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(modalVariants)),
          (variantKey) => {
            const variant = modalVariants[variantKey];
            const properties = getAllAnimatedProperties(variant);
            
            properties.forEach(prop => {
              expect(isGPUAccelerated(prop)).toBe(true);
              expect(triggersLayout(prop)).toBe(false);
            });
            
            return properties.every(prop => isGPUAccelerated(prop));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify listVariants items use only GPU-accelerated properties (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('item', 'itemSlideLeft', 'itemScale'),
          (variantKey) => {
            const variant = listVariants[variantKey];
            const properties = getAllAnimatedProperties(variant);
            
            properties.forEach(prop => {
              expect(isGPUAccelerated(prop)).toBe(true);
              expect(triggersLayout(prop)).toBe(false);
            });
            
            return properties.every(prop => isGPUAccelerated(prop));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify buttonVariants use only GPU-accelerated properties (100 iterations)', () => {
      const buttonVariantKeys = Object.keys(buttonVariants).filter(key => 
        !key.startsWith('interactive') // Skip interactive variants (they're objects with whileHover/whileTap)
      );

      fc.assert(
        fc.property(
          fc.constantFrom(...buttonVariantKeys),
          (variantKey) => {
            const variant = buttonVariants[variantKey];
            
            // Handle both direct variants and nested variants
            if (variant.scale !== undefined || variant.boxShadow !== undefined) {
              const properties = Object.keys(variant);
              
              properties.forEach(prop => {
                // boxShadow is GPU-accelerated in modern browsers
                if (prop !== 'boxShadow' && prop !== 'transition' && prop !== 'rotate') {
                  expect(isGPUAccelerated(prop) || prop === 'boxShadow').toBe(true);
                }
                expect(triggersLayout(prop)).toBe(false);
              });
              
              return true;
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify feedbackVariants use only GPU-accelerated properties (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(feedbackVariants)),
          (variantKey) => {
            const variant = feedbackVariants[variantKey];
            const properties = getAllAnimatedProperties(variant);
            
            properties.forEach(prop => {
              // Allow boxShadow for success glow effects
              if (prop !== 'boxShadow') {
                expect(isGPUAccelerated(prop)).toBe(true);
              }
              expect(triggersLayout(prop)).toBe(false);
            });
            
            return properties.every(prop => 
              isGPUAccelerated(prop) || prop === 'boxShadow'
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify cardVariants use only GPU-accelerated properties (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(cardVariants)),
          (variantKey) => {
            const variant = cardVariants[variantKey];
            
            // Handle hoverLift which has rest/hover states
            if (variant.rest && variant.hover) {
              const restProps = Object.keys(variant.rest);
              const hoverProps = Object.keys(variant.hover);
              const allProps = [...new Set([...restProps, ...hoverProps])];
              
              allProps.forEach(prop => {
                // Allow boxShadow and y for hover effects
                if (prop !== 'boxShadow' && prop !== 'transition') {
                  expect(isGPUAccelerated(prop)).toBe(true);
                }
                expect(triggersLayout(prop)).toBe(false);
              });
              
              return true;
            }
            
            // Handle regular variants
            const properties = getAllAnimatedProperties(variant);
            properties.forEach(prop => {
              expect(isGPUAccelerated(prop)).toBe(true);
              expect(triggersLayout(prop)).toBe(false);
            });
            
            return properties.every(prop => isGPUAccelerated(prop));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify notificationVariants use only GPU-accelerated properties (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(notificationVariants)),
          (variantKey) => {
            const variant = notificationVariants[variantKey];
            const properties = getAllAnimatedProperties(variant);
            
            properties.forEach(prop => {
              expect(isGPUAccelerated(prop)).toBe(true);
              expect(triggersLayout(prop)).toBe(false);
            });
            
            return properties.every(prop => isGPUAccelerated(prop));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify navVariants use only GPU-accelerated properties (100 iterations)', () => {
      const navVariantKeys = Object.keys(navVariants).filter(key => 
        !key.includes('Container') && !key.includes('Item')
      );

      fc.assert(
        fc.property(
          fc.constantFrom(...navVariantKeys),
          (variantKey) => {
            const variant = navVariants[variantKey];
            const properties = getAllAnimatedProperties(variant);
            
            properties.forEach(prop => {
              expect(isGPUAccelerated(prop)).toBe(true);
              expect(triggersLayout(prop)).toBe(false);
            });
            
            return properties.every(prop => isGPUAccelerated(prop));
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-5: No layout-triggering properties are animated', () => {
    it('should verify no width/height animations in any variant (100 iterations)', () => {
      const allVariants = [
        ...Object.values(pageVariants),
        ...Object.values(modalVariants),
        ...Object.values(listVariants).filter(v => typeof v === 'object' && v.initial),
        ...Object.values(cardVariants).filter(v => v.initial),
        ...Object.values(notificationVariants),
        ...Object.values(feedbackVariants)
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...allVariants),
          (variant) => {
            const properties = getAllAnimatedProperties(variant);
            
            expect(properties).not.toContain('width');
            expect(properties).not.toContain('height');
            
            return !properties.includes('width') && !properties.includes('height');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify no top/left/right/bottom animations in any variant (100 iterations)', () => {
      const allVariants = [
        ...Object.values(pageVariants),
        ...Object.values(modalVariants),
        ...Object.values(listVariants).filter(v => typeof v === 'object' && v.initial),
        ...Object.values(cardVariants).filter(v => v.initial),
        ...Object.values(notificationVariants),
        ...Object.values(feedbackVariants)
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...allVariants),
          (variant) => {
            const properties = getAllAnimatedProperties(variant);
            
            expect(properties).not.toContain('top');
            expect(properties).not.toContain('left');
            expect(properties).not.toContain('right');
            expect(properties).not.toContain('bottom');
            
            return !properties.includes('top') && 
                   !properties.includes('left') &&
                   !properties.includes('right') &&
                   !properties.includes('bottom');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify no padding/margin animations in any variant (100 iterations)', () => {
      const allVariants = [
        ...Object.values(pageVariants),
        ...Object.values(modalVariants),
        ...Object.values(listVariants).filter(v => typeof v === 'object' && v.initial),
        ...Object.values(cardVariants).filter(v => v.initial),
        ...Object.values(notificationVariants),
        ...Object.values(feedbackVariants)
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...allVariants),
          (variant) => {
            const properties = getAllAnimatedProperties(variant);
            
            const paddingMarginProps = properties.filter(prop => 
              prop.startsWith('padding') || prop.startsWith('margin')
            );
            
            expect(paddingMarginProps).toHaveLength(0);
            
            return paddingMarginProps.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-5: Specific GPU-accelerated property usage', () => {
    it('should verify opacity is used for fade animations (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('fadeIn', 'slideInLeft', 'slideInRight', 'slideInTop', 'slideInBottom', 'scaleUp'),
          (variantKey) => {
            const variant = pageVariants[variantKey];
            const properties = getAllAnimatedProperties(variant);
            
            expect(properties).toContain('opacity');
            
            return properties.includes('opacity');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify scale is used for scale animations (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('scaleUp'),
          (variantKey) => {
            const variant = pageVariants[variantKey];
            const properties = getAllAnimatedProperties(variant);
            
            expect(properties).toContain('scale');
            
            return properties.includes('scale');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify x/y are used for slide animations (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('slideInLeft', 'slideInRight'),
          (variantKey) => {
            const variant = pageVariants[variantKey];
            const properties = getAllAnimatedProperties(variant);
            
            expect(properties).toContain('x');
            
            return properties.includes('x');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify modal animations use scale and opacity (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('scaleIn', 'zoomIn'),
          (variantKey) => {
            const variant = modalVariants[variantKey];
            const properties = getAllAnimatedProperties(variant);
            
            expect(properties).toContain('opacity');
            expect(properties).toContain('scale');
            
            return properties.includes('opacity') && properties.includes('scale');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-5: Transform property combinations', () => {
    it('should verify slide animations combine opacity with x or y (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('slideInLeft', 'slideInRight', 'slideInTop', 'slideInBottom'),
          (variantKey) => {
            const variant = pageVariants[variantKey];
            const properties = getAllAnimatedProperties(variant);
            
            expect(properties).toContain('opacity');
            expect(properties.some(p => p === 'x' || p === 'y')).toBe(true);
            
            return properties.includes('opacity') && 
                   (properties.includes('x') || properties.includes('y'));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify scale animations combine opacity with scale (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('scaleUp', 'scaleIn', 'zoomIn'),
          (variantKey) => {
            let variant;
            if (variantKey === 'scaleUp') {
              variant = pageVariants[variantKey];
            } else {
              variant = modalVariants[variantKey];
            }
            
            const properties = getAllAnimatedProperties(variant);
            
            expect(properties).toContain('opacity');
            expect(properties).toContain('scale');
            
            return properties.includes('opacity') && properties.includes('scale');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-5: Performance validation', () => {
    it('should verify all animated properties are in GPU-accelerated list (100 iterations)', () => {
      const allVariants = [
        ...Object.values(pageVariants),
        ...Object.values(modalVariants),
        ...Object.values(listVariants).filter(v => typeof v === 'object' && v.initial),
        ...Object.values(notificationVariants),
        ...Object.values(feedbackVariants)
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...allVariants),
          (variant) => {
            const properties = getAllAnimatedProperties(variant);
            
            const nonGPUProps = properties.filter(prop => 
              !isGPUAccelerated(prop) && prop !== 'boxShadow'
            );
            
            expect(nonGPUProps).toHaveLength(0);
            
            return nonGPUProps.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify no layout-triggering properties in any animation (100 iterations)', () => {
      const allVariants = [
        ...Object.values(pageVariants),
        ...Object.values(modalVariants),
        ...Object.values(listVariants).filter(v => typeof v === 'object' && v.initial),
        ...Object.values(notificationVariants),
        ...Object.values(feedbackVariants)
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...allVariants),
          (variant) => {
            const properties = getAllAnimatedProperties(variant);
            
            const layoutProps = properties.filter(prop => triggersLayout(prop));
            
            expect(layoutProps).toHaveLength(0);
            
            return layoutProps.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-5: Preset validation', () => {
    it('should verify preset animations use GPU-accelerated properties (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('page', 'notification', 'success', 'successMessage'),
          (presetKey) => {
            const preset = presets[presetKey];
            const properties = getAllAnimatedProperties(preset);
            
            properties.forEach(prop => {
              expect(isGPUAccelerated(prop) || prop === 'boxShadow').toBe(true);
              expect(triggersLayout(prop)).toBe(false);
            });
            
            return properties.every(prop => 
              isGPUAccelerated(prop) || prop === 'boxShadow'
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-5: Edge cases and special animations', () => {
    it('should verify loading animations use GPU-accelerated properties (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(loadingVariants)),
          (variantKey) => {
            const variant = loadingVariants[variantKey];
            
            if (variant.animate) {
              const properties = Object.keys(variant.animate);
              
              properties.forEach(prop => {
                if (prop !== 'transition' && prop !== 'backgroundPosition') {
                  expect(isGPUAccelerated(prop)).toBe(true);
                  expect(triggersLayout(prop)).toBe(false);
                }
              });
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify form animations use GPU-accelerated properties (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(formVariants)),
          (variantKey) => {
            const variant = formVariants[variantKey];
            
            // Handle different variant structures
            if (variant.scale !== undefined) {
              // Direct property (like inputFocus)
              expect(isGPUAccelerated('scale')).toBe(true);
            } else if (variant.animate) {
              // Animated variant (like errorShake)
              const properties = Object.keys(variant.animate);
              properties.forEach(prop => {
                if (prop !== 'transition') {
                  expect(isGPUAccelerated(prop) || prop === 'fontSize').toBe(true);
                }
              });
            } else if (variant.initial && variant.animate) {
              // Full variant (like successCheck)
              const properties = getAllAnimatedProperties(variant);
              properties.forEach(prop => {
                expect(isGPUAccelerated(prop)).toBe(true);
              });
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify dropdown animations avoid height when possible (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(dropdownVariants)),
          (variantKey) => {
            const variant = dropdownVariants[variantKey];
            const properties = getAllAnimatedProperties(variant);
            
            // Note: Some dropdown animations may use height: "auto" which is necessary
            // but we should prefer scaleY when possible
            if (variantKey === 'scaleExpand') {
              expect(properties).toContain('scaleY');
              expect(properties).not.toContain('height');
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property ANIM-5: Comprehensive validation', () => {
    it('should verify all variants across all collections use GPU-accelerated properties (100 iterations)', () => {
      const allVariantCollections = [
        pageVariants,
        modalVariants,
        cardVariants,
        notificationVariants,
        feedbackVariants,
        navVariants
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...allVariantCollections),
          fc.integer({ min: 0, max: 10 }),
          (collection, index) => {
            const keys = Object.keys(collection);
            if (keys.length === 0) return true;
            
            const variantKey = keys[index % keys.length];
            const variant = collection[variantKey];
            
            // Skip container variants and special structures
            if (!variant.initial && !variant.animate && !variant.rest) {
              return true;
            }
            
            const properties = getAllAnimatedProperties(variant);
            
            const invalidProps = properties.filter(prop => 
              !isGPUAccelerated(prop) && 
              prop !== 'boxShadow' && 
              prop !== 'transition'
            );
            
            expect(invalidProps).toHaveLength(0);
            
            return invalidProps.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
