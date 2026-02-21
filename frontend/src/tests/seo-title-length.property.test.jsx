/**
 * SEO Title Length Property-Based Tests
 * 
 * Property-based tests for validating SEO title length requirements
 * using fast-check library.
 * 
 * Requirements:
 * - FR-SEO-1: Unique, descriptive title tags (50-60 characters)
 * - Property SEO-2: Title Length
 * - Task 6.6.2: Write property-based test for title length (100 iterations)
 * 
 * Property SEO-2: Title Length
 * ∀ page ∈ Pages:
 *   50 ≤ page.title.length ≤ 60
 * 
 * Test: All titles within character limit
 */

import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import SEOHead from '../components/SEO/SEOHead';

describe('Property SEO-2: Title Length', () => {
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
   * Property Test: Titles within optimal range (50-60 chars) should not trigger warnings
   * 
   * Validates: Property SEO-2
   * Iterations: 100
   */
  it('should not warn for titles within optimal length (50-60 characters)', () => {
    fc.assert(
      fc.property(
        // Generate titles between 50-60 characters
        fc.string({ minLength: 50, maxLength: 60 }),
        // Generate valid descriptions (150-160 chars to avoid description warnings)
        fc.string({ minLength: 150, maxLength: 160 }),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should not warn about title length
          const titleWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Title length is')
          );
          expect(titleWarnings.length).toBe(0);

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Titles shorter than 50 chars should trigger warnings
   * 
   * Validates: Property SEO-2 (boundary condition)
   * Iterations: 100
   */
  it('should warn for titles shorter than 50 characters', () => {
    fc.assert(
      fc.property(
        // Generate titles between 1-49 characters
        fc.string({ minLength: 1, maxLength: 49 }),
        // Generate valid descriptions
        fc.string({ minLength: 150, maxLength: 160 }),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should warn about title length
          const titleWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Title length is') &&
            call[0].includes(title.length.toString())
          );
          expect(titleWarnings.length).toBeGreaterThan(0);

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Titles longer than 60 chars should trigger warnings
   * 
   * Validates: Property SEO-2 (boundary condition)
   * Iterations: 100
   */
  it('should warn for titles longer than 60 characters', () => {
    fc.assert(
      fc.property(
        // Generate titles between 61-120 characters
        fc.string({ minLength: 61, maxLength: 120 }),
        // Generate valid descriptions
        fc.string({ minLength: 150, maxLength: 160 }),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should warn about title length
          const titleWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Title length is') &&
            call[0].includes(title.length.toString())
          );
          expect(titleWarnings.length).toBeGreaterThan(0);

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Title length validation is consistent across renders
   * 
   * Validates: Property SEO-2 (idempotence)
   * Iterations: 100
   */
  it('should consistently validate title length across multiple renders', () => {
    fc.assert(
      fc.property(
        // Generate titles of any length
        fc.string({ minLength: 1, maxLength: 120 }),
        // Generate valid descriptions
        fc.string({ minLength: 150, maxLength: 160 }),
        (title, description) => {
          const consoleSpy1 = vi.spyOn(console, 'warn').mockImplementation(() => {});
          
          // First render
          renderSEOHead({ title, description });
          const warnings1 = consoleSpy1.mock.calls.filter(call =>
            call[0].includes('Title length is')
          ).length;
          
          consoleSpy1.mockRestore();

          const consoleSpy2 = vi.spyOn(console, 'warn').mockImplementation(() => {});
          
          // Second render with same props
          renderSEOHead({ title, description });
          const warnings2 = consoleSpy2.mock.calls.filter(call =>
            call[0].includes('Title length is')
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
   * Property Test: Boundary values (exactly 50 and 60 chars) should not warn
   * 
   * Validates: Property SEO-2 (inclusive boundaries)
   * Iterations: 100
   */
  it('should accept boundary values (50 and 60 characters) without warnings', () => {
    fc.assert(
      fc.property(
        // Generate either 50 or 60 character titles
        fc.constantFrom(50, 60),
        // Generate valid descriptions
        fc.string({ minLength: 150, maxLength: 160 }),
        (titleLength, description) => {
          // Create a title of exact length
          const title = 'a'.repeat(titleLength);
          
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should not warn about title length
          const titleWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Title length is')
          );
          expect(titleWarnings.length).toBe(0);

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Title length validation works with multi-byte characters
   * 
   * Validates: Property SEO-2 (Unicode support)
   * Iterations: 100
   */
  it('should correctly validate title length with multi-byte characters', () => {
    fc.assert(
      fc.property(
        // Generate titles with various characters including Arabic
        fc.oneof(
          fc.string({ minLength: 50, maxLength: 60 }),
          fc.constantFrom(
            'صفحة الاختبار - Careerak | اختبار النظام الجديد',
            'Page de test - Careerak | Trouvez votre emploi',
            'Test Page - Careerak | Find Your Perfect Job Today'
          )
        ),
        // Generate valid descriptions
        fc.string({ minLength: 150, maxLength: 160 }),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          // Should not warn about title length if within range
          if (title.length >= 50 && title.length <= 60) {
            const titleWarnings = consoleSpy.mock.calls.filter(call =>
              call[0].includes('Title length is')
            );
            expect(titleWarnings.length).toBe(0);
          }

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Title validation works for any title length
   * 
   * Validates: Property SEO-2 (comprehensive validation)
   * Iterations: 100
   */
  it('should validate title length correctly for any input', () => {
    fc.assert(
      fc.property(
        // Generate titles of any length (non-empty)
        fc.string({ minLength: 1, maxLength: 120 }).filter(s => s.trim().length > 0),
        // Generate valid descriptions (non-empty)
        fc.string({ minLength: 150, maxLength: 160 }).filter(s => s.trim().length >= 150),
        (title, description) => {
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          renderSEOHead({
            title,
            description,
          });

          const titleWarnings = consoleSpy.mock.calls.filter(call =>
            call[0].includes('Title length is')
          );

          // Validate warning behavior based on title length
          const titleLength = title.length;
          if (titleLength >= 50 && titleLength <= 60) {
            // Should not warn for optimal length
            expect(titleWarnings.length).toBe(0);
          } else {
            // Should warn for non-optimal length
            expect(titleWarnings.length).toBeGreaterThan(0);
          }

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });
});
