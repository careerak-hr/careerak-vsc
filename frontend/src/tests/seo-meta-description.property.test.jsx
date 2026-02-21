/**
 * SEO Meta Description Property-Based Tests
 * 
 * Property-based tests for validating SEO meta description length requirements
 * using fast-check library.
 * 
 * Requirements:
 * - FR-SEO-2: Unique meta descriptions (150-160 characters)
 * - Property SEO-3: Meta Description
 * - Task 6.6.3: Write property-based test for meta description (100 iterations)
 * 
 * Property SEO-3: Meta Description
 * ∀ page ∈ Pages:
 *   150 ≤ page.description.length ≤ 160
 * 
 * Test: All descriptions within character limit
 */

import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import SEOHead from '../components/SEO/SEOHead';

describe('Property SEO-3: Meta Description', () => {
  /**
   * Helper function to render SEOHead component
   */
  const renderSEOHead = (props) => {
    const helmetContext = {};
    render(
      <HelmetProvider context={helmetContext}>
        <SEOHead {...props} />
      </HelmetProvider>
    );
    return helmetContext.helmet;
  };

  /**
   * Property Test: Descriptions within optimal range (150-160 chars) should not trigger warnings
   * 
   * Validates: Property SEO-3
   * Iterations: 100
   */
  it('should not warn for descriptions within optimal length (150-160 characters)', () => {
    fc.assert(
      fc.property(
        // Generate valid titles (50-60 chars to avoid title warnings)
        fc.string({ minLength: 50, maxLength: 60 }),
        // Generate descriptions between 150-160 characters
        fc.string({ minLength: 150, maxLength: 160 }),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should not warn about description length
          const descriptionWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Description length is')
          );
          expect(descriptionWarnings.length).toBe(0);

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Descriptions shorter than 150 chars should trigger warnings
   * 
   * Validates: Property SEO-3 (boundary condition)
   * Iterations: 100
   */
  it('should warn for descriptions shorter than 150 characters', () => {
    fc.assert(
      fc.property(
        // Generate valid titles
        fc.string({ minLength: 50, maxLength: 60 }),
        // Generate descriptions between 1-149 characters
        fc.string({ minLength: 1, maxLength: 149 }),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should warn about description length
          const descriptionWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Description length is') &&
            call[0].includes(description.length.toString())
          );
          expect(descriptionWarnings.length).toBeGreaterThan(0);

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Descriptions longer than 160 chars should trigger warnings
   * 
   * Validates: Property SEO-3 (boundary condition)
   * Iterations: 100
   */
  it('should warn for descriptions longer than 160 characters', () => {
    fc.assert(
      fc.property(
        // Generate valid titles
        fc.string({ minLength: 50, maxLength: 60 }),
        // Generate descriptions between 161-300 characters
        fc.string({ minLength: 161, maxLength: 300 }),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should warn about description length
          const descriptionWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Description length is') &&
            call[0].includes(description.length.toString())
          );
          expect(descriptionWarnings.length).toBeGreaterThan(0);

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Description length validation is consistent across renders
   * 
   * Validates: Property SEO-3 (idempotence)
   * Iterations: 100
   */
  it('should consistently validate description length across multiple renders', () => {
    fc.assert(
      fc.property(
        // Generate valid titles
        fc.string({ minLength: 50, maxLength: 60 }),
        // Generate descriptions of any length
        fc.string({ minLength: 1, maxLength: 300 }),
        (title, description) => {
          const consoleSpy1 = vi.spyOn(console, 'warn').mockImplementation(() => {});
          
          // First render
          renderSEOHead({ title, description });
          const warnings1 = consoleSpy1.mock.calls.filter(call =>
            call[0].includes('Description length is')
          ).length;
          
          consoleSpy1.mockRestore();

          const consoleSpy2 = vi.spyOn(console, 'warn').mockImplementation(() => {});
          
          // Second render with same props
          renderSEOHead({ title, description });
          const warnings2 = consoleSpy2.mock.calls.filter(call =>
            call[0].includes('Description length is')
          ).length;
          
          consoleSpy2.mockRestore();

          // Should produce same number of warnings
          expect(warnings1).toBe(warnings2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Boundary values (exactly 150 and 160 chars) should not warn
   * 
   * Validates: Property SEO-3 (inclusive boundaries)
   * Iterations: 100
   */
  it('should accept boundary values (150 and 160 characters) without warnings', () => {
    fc.assert(
      fc.property(
        // Generate valid titles
        fc.string({ minLength: 50, maxLength: 60 }),
        // Generate either 150 or 160 character descriptions
        fc.constantFrom(150, 160),
        (title, descriptionLength) => {
          // Create a description of exact length
          const description = 'a'.repeat(descriptionLength);
          
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should not warn about description length
          const descriptionWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Description length is')
          );
          expect(descriptionWarnings.length).toBe(0);

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Description length validation works with multi-byte characters
   * 
   * Validates: Property SEO-3 (Unicode support)
   * Iterations: 100
   */
  it('should correctly validate description length with multi-byte characters', () => {
    fc.assert(
      fc.property(
        // Generate valid titles
        fc.string({ minLength: 50, maxLength: 60 }),
        // Generate descriptions with various characters including Arabic
        fc.oneof(
          fc.string({ minLength: 150, maxLength: 160 }),
          fc.constantFrom(
            'ابدأ رحلتك المهنية مع Careerak. منصة شاملة للتوظيف، الدورات التدريبية، والاستشارات المهنية في العالم العربي. سجل الآن مجاناً واحصل على فرص عمل مميزة!',
            'Start your career journey with Careerak. Comprehensive platform for jobs, training courses, and career consulting in the Arab world. Register now for free!',
            'Commencez votre parcours professionnel avec Careerak. Plateforme complète pour emplois, cours de formation et conseil en carrière. Inscrivez-vous gratuitement!'
          )
        ),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should not warn about description length if within range
          if (description.length >= 150 && description.length <= 160) {
            const descriptionWarnings = consoleSpy.mock.calls.filter(call =>
              call[0].includes('Description length is')
            );
            expect(descriptionWarnings.length).toBe(0);
          }

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Description validation works for any description length
   * 
   * Validates: Property SEO-3 (comprehensive validation)
   * Iterations: 100
   */
  it('should validate description length correctly for any input', () => {
    fc.assert(
      fc.property(
        // Generate valid titles
        fc.string({ minLength: 50, maxLength: 60 }),
        // Generate descriptions of any length (non-empty)
        fc.string({ minLength: 1, maxLength: 300 }).filter(s => s.trim().length > 0),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          const descriptionWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Description length is')
          );

          // Validate warning behavior based on description length
          const descriptionLength = description.length;
          if (descriptionLength >= 150 && descriptionLength <= 160) {
            // Should not warn for optimal length
            expect(descriptionWarnings.length).toBe(0);
          } else {
            // Should warn for non-optimal length
            expect(descriptionWarnings.length).toBeGreaterThan(0);
          }

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Description warnings include actual length
   * 
   * Validates: Property SEO-3 (informative warnings)
   * Iterations: 100
   */
  it('should include actual description length in warning messages', () => {
    fc.assert(
      fc.property(
        // Generate valid titles
        fc.string({ minLength: 50, maxLength: 60 }),
        // Generate descriptions outside optimal range
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 149 }),
          fc.string({ minLength: 161, maxLength: 300 })
        ),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should warn and include the actual length
          const descriptionWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Description length is') &&
            call[0].includes(description.length.toString())
          );
          expect(descriptionWarnings.length).toBeGreaterThan(0);

          // Verify the warning message format
          const warningMessage = descriptionWarnings[0][0];
          expect(warningMessage).toContain('Description length is');
          expect(warningMessage).toContain(description.length.toString());
          expect(warningMessage).toContain('150-160 characters');

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Empty descriptions should trigger warnings
   * 
   * Validates: Property SEO-3 (edge case)
   * Iterations: 100
   */
  it('should warn for empty or very short descriptions', () => {
    fc.assert(
      fc.property(
        // Generate valid titles
        fc.string({ minLength: 50, maxLength: 60 }),
        // Generate very short descriptions (1-10 characters)
        fc.string({ minLength: 1, maxLength: 10 }),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should warn about description length
          const descriptionWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Description length is')
          );
          expect(descriptionWarnings.length).toBeGreaterThan(0);

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Description validation is independent of title validation
   * 
   * Validates: Property SEO-3 (independence)
   * Iterations: 100
   */
  it('should validate description independently of title', () => {
    fc.assert(
      fc.property(
        // Generate titles of any length (may trigger warnings)
        fc.string({ minLength: 1, maxLength: 120 }),
        // Generate valid descriptions
        fc.string({ minLength: 150, maxLength: 160 }),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should not warn about description length (even if title is invalid)
          const descriptionWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Description length is')
          );
          expect(descriptionWarnings.length).toBe(0);

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });
});
