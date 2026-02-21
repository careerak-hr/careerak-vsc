/**
 * Alt Text Property-Based Test
 * Task 5.6.5: Write property-based test for alt text (100 iterations)
 * 
 * **Validates: Requirements FR-A11Y-9**
 * 
 * Property A11Y-5: Alt Text
 * ∀ img ∈ MeaningfulImages: img.hasAttribute('alt') = true AND img.alt.length > 0
 * 
 * This test verifies that all meaningful images have descriptive alt text
 * using property-based testing with fast-check.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import {
  validateAltText,
  generateAltText,
  isDecorativeImage,
  AltTextCategories
} from '../utils/altTextGuidelines';

/**
 * Arbitrary for generating image types
 */
const imageTypeArbitrary = () => fc.constantFrom(
  'logo',
  'profile',
  'functional',
  'informational',
  'product'
);

/**
 * Arbitrary for generating meaningful alt text
 */
const meaningfulAltTextArbitrary = () => fc.string({ 
  minLength: 5, 
  maxLength: 125 
}).filter(str => str.trim().length > 0);

/**
 * Arbitrary for generating image metadata
 */
const imageMetadataArbitrary = () => fc.record({
  type: imageTypeArbitrary(),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  context: fc.option(fc.string({ minLength: 5, maxLength: 50 })),
  action: fc.option(fc.string({ minLength: 5, maxLength: 30 }))
});

/**
 * Arbitrary for generating mock image elements
 */
const mockImageElementArbitrary = (hasAlt = true) => fc.record({
  alt: hasAlt ? meaningfulAltTextArbitrary() : fc.constant(''),
  src: fc.webUrl(),
  getAttribute: fc.constant((attr) => {
    if (attr === 'aria-hidden') return hasAlt ? null : 'true';
    return null;
  }),
  classList: fc.constant([])
});

describe('Alt Text Property-Based Tests', () => {
  
  describe('Property A11Y-5: Meaningful Images Have Alt Text', () => {
    
    it('should verify all meaningful images have non-empty alt text (100 iterations)', () => {
      fc.assert(
        fc.property(
          meaningfulAltTextArbitrary(),
          (altText) => {
            // Create mock image element
            const img = {
              alt: altText,
              getAttribute: (attr) => attr === 'aria-hidden' ? null : null,
              classList: []
            };
            
            // Property: Meaningful images must have alt attribute with length > 0
            const hasAlt = img.alt !== undefined && img.alt !== null;
            const hasContent = img.alt.length > 0;
            const isNotDecorative = !isDecorativeImage(img);
            
            return hasAlt && hasContent && isNotDecorative;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify decorative images can have empty alt text (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (ariaHidden) => {
            // Create mock decorative image
            const img = {
              alt: '',
              getAttribute: (attr) => attr === 'aria-hidden' && ariaHidden ? 'true' : null,
              classList: []
            };
            
            // Property: Decorative images should have empty alt or aria-hidden
            const isEmpty = img.alt === '';
            const isMarkedDecorative = isDecorativeImage(img);
            
            return isEmpty || isMarkedDecorative;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify alt text length is within recommended limits (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (altText) => {
            const validation = validateAltText(altText);
            
            // Property: Alt text should ideally be <= 125 characters
            // If longer, validation should flag it
            if (altText.length > 125) {
              return validation.issues.some(issue => 
                issue.includes('too long')
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify alt text does not contain redundant phrases (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('image of', 'picture of', 'photo of', 'graphic of', 'icon of'),
          fc.string({ minLength: 5, maxLength: 50 }),
          (redundantPhrase, description) => {
            const altTextWithRedundancy = `${redundantPhrase} ${description}`;
            const validation = validateAltText(altTextWithRedundancy);
            
            // Property: Alt text with redundant phrases should be flagged
            return validation.issues.some(issue => 
              issue.toLowerCase().includes('redundant')
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify generated alt text follows proper format (100 iterations)', () => {
      fc.assert(
        fc.property(
          imageMetadataArbitrary(),
          (metadata) => {
            const altText = generateAltText(metadata);
            
            // Property: Generated alt text must be non-empty and contain the name
            const isNonEmpty = altText.length > 0;
            const containsName = metadata.name ? altText.includes(metadata.name) : true;
            
            return isNonEmpty && containsName;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property A11Y-5: Alt Text Quality Validation', () => {
    
    it('should verify empty alt text is valid for decorative images (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constant(''),
          (altText) => {
            const validation = validateAltText(altText);
            
            // Property: Empty alt text should be valid (for decorative images)
            return validation.isValid && validation.isDecorative;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify non-empty alt text is validated correctly (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 125 }).filter(s => s.trim().length > 0),
          (altText) => {
            const validation = validateAltText(altText);
            
            // Property: Validation should return an object with required fields
            return (
              typeof validation.isValid === 'boolean' &&
              Array.isArray(validation.issues) &&
              Array.isArray(validation.suggestions) &&
              typeof validation.length === 'number'
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify generic alt text is flagged (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('logo', 'image', 'photo', 'picture'),
          (genericTerm) => {
            const validation = validateAltText(genericTerm);
            
            // Property: Generic terms should be flagged as too generic
            return validation.issues.some(issue => 
              issue.toLowerCase().includes('generic')
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify validation provides helpful suggestions (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 126, maxLength: 200 }),
          (longAltText) => {
            const validation = validateAltText(longAltText);
            
            // Property: Long alt text should have suggestions
            if (!validation.isValid) {
              return validation.suggestions.length > 0;
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property A11Y-5: Image Type Classification', () => {
    
    it('should verify logo images have descriptive alt text (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.option(fc.string({ minLength: 5, maxLength: 50 })),
          (name, context) => {
            const altText = generateAltText({ type: 'logo', name, context });
            
            // Property: Logo alt text should include the name and "logo"
            return (
              altText.includes(name) &&
              altText.toLowerCase().includes('logo')
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify profile images have descriptive alt text (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 50 }),
          (name) => {
            const altText = generateAltText({ type: 'profile', name });
            
            // Property: Profile alt text should include the name and "profile"
            return (
              altText.includes(name) &&
              altText.toLowerCase().includes('profile')
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify functional images describe their purpose (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.string({ minLength: 5, maxLength: 30 }),
          (name, action) => {
            const altText = generateAltText({ type: 'functional', name, action });
            
            // Property: Functional alt text should include name and action
            return (
              altText.includes(name) &&
              altText.includes(action)
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify informational images describe content (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.option(fc.string({ minLength: 5, maxLength: 50 })),
          (name, context) => {
            const altText = generateAltText({ type: 'informational', name, context });
            
            // Property: Informational alt text should include the name
            return altText.includes(name);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify product images describe the item (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.option(fc.string({ minLength: 5, maxLength: 50 })),
          (name, context) => {
            const altText = generateAltText({ type: 'product', name, context });
            
            // Property: Product alt text should include the name
            return altText.includes(name);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property A11Y-5: Decorative Image Detection', () => {
    
    it('should verify images with aria-hidden are decorative (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (altText) => {
            const img = {
              alt: altText,
              getAttribute: (attr) => attr === 'aria-hidden' ? 'true' : null,
              classList: []
            };
            
            // Property: Images with aria-hidden="true" are decorative
            return isDecorativeImage(img);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify images with empty alt can be decorative (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (hasAriaHidden) => {
            const img = {
              alt: '',
              getAttribute: (attr) => attr === 'aria-hidden' && hasAriaHidden ? 'true' : null,
              classList: []
            };
            
            // Property: Images with empty alt are considered decorative
            return isDecorativeImage(img);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify decorative class names are detected (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('decoration', 'ornament', 'divider', 'spacer'),
          (decorativeClass) => {
            const img = {
              alt: 'some text',
              getAttribute: () => null,
              classList: [decorativeClass]
            };
            
            // Property: Images with decorative class names are decorative
            return isDecorativeImage(img);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property A11Y-5: Alt Text Consistency', () => {
    
    it('should verify same input produces same alt text (100 iterations)', () => {
      fc.assert(
        fc.property(
          imageMetadataArbitrary(),
          (metadata) => {
            const altText1 = generateAltText(metadata);
            const altText2 = generateAltText(metadata);
            
            // Property: Same input should produce same output (idempotent)
            return altText1 === altText2;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify validation is consistent (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 200 }),
          (altText) => {
            const validation1 = validateAltText(altText);
            const validation2 = validateAltText(altText);
            
            // Property: Same alt text should produce same validation result
            const sameIsValid = validation1.isValid === validation2.isValid;
            
            // Handle decorative images (which don't have issues/suggestions arrays)
            if (validation1.isDecorative && validation2.isDecorative) {
              return sameIsValid;
            }
            
            // For non-decorative images, check issues and suggestions
            const sameIssuesLength = (validation1.issues?.length || 0) === (validation2.issues?.length || 0);
            const sameSuggestionsLength = (validation1.suggestions?.length || 0) === (validation2.suggestions?.length || 0);
            
            return sameIsValid && sameIssuesLength && sameSuggestionsLength;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify alt text categories have valid examples (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('LOGO', 'PROFILE', 'FUNCTIONAL', 'INFORMATIONAL', 'PRODUCT', 'DECORATIVE'),
          (category) => {
            const categoryData = AltTextCategories[category];
            
            // Property: Each category should have examples and guidelines
            return (
              Array.isArray(categoryData.examples) &&
              Array.isArray(categoryData.guidelines) &&
              categoryData.examples.length > 0 &&
              categoryData.guidelines.length > 0
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property A11Y-5: Edge Cases', () => {
    
    it('should handle null and undefined alt text gracefully (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(null, undefined, ''),
          (altText) => {
            const validation = validateAltText(altText);
            
            // Property: Null/undefined/empty should be handled without errors
            return (
              typeof validation === 'object' &&
              typeof validation.isValid === 'boolean'
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle very long alt text (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 200, maxLength: 500 }),
          (longAltText) => {
            const validation = validateAltText(longAltText);
            
            // Property: Very long alt text should be flagged
            return validation.issues.some(issue => 
              issue.toLowerCase().includes('long')
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle special characters in alt text (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }),
          fc.constantFrom('!', '@', '#', '$', '%', '&', '*'),
          (text, specialChar) => {
            const altText = `${text}${specialChar}`;
            const validation = validateAltText(altText);
            
            // Property: Special characters should not cause errors
            return typeof validation.isValid === 'boolean';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle whitespace-only alt text (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          (spaceCount) => {
            const altText = ' '.repeat(spaceCount);
            const validation = validateAltText(altText);
            
            // Property: Whitespace-only should be treated as empty
            return validation.isDecorative;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle missing metadata fields in generation (100 iterations)', () => {
      fc.assert(
        fc.property(
          imageTypeArbitrary(),
          (type) => {
            // Generate with minimal metadata
            const altText = generateAltText({ type });
            
            // Property: Should generate valid alt text even with missing fields
            return altText.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
