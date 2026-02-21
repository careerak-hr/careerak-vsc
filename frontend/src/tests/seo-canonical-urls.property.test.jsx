/**
 * SEO Canonical URLs Property-Based Tests
 * 
 * Property-based tests for validating canonical URL requirements
 * using fast-check library.
 * 
 * Requirements:
 * - FR-SEO-10: Canonical URLs to prevent duplicate content issues
 * - Property SEO-5: Canonical URLs
 * - Task 6.6.5: Write property-based test for canonical URLs (100 iterations)
 * 
 * Property SEO-5: Canonical URLs
 * ∀ page ∈ Pages:
 *   page.hasCanonical = true AND page.canonical = page.url
 * 
 * Test: All pages have canonical URLs that match the page URL
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import SEOHead from '../components/SEO/SEOHead';

describe('Property SEO-5: Canonical URLs', () => {
  let originalLocation;

  beforeEach(() => {
    // Save original location
    originalLocation = window.location;
  });

  afterEach(() => {
    // Restore original location
    if (originalLocation) {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true
      });
    }
    
    // Clean up document head to avoid test interference
    const canonicalLinks = document.querySelectorAll('link[rel="canonical"]');
    canonicalLinks.forEach(link => link.remove());
    
    const metaTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]');
    metaTags.forEach(meta => meta.remove());
  });

  /**
   * Helper function to render SEOHead component and extract canonical link from DOM
   * Note: react-helmet-async updates the DOM asynchronously
   */
  const renderSEOHead = (props) => {
    const helmetContext = {};
    render(
      <HelmetProvider context={helmetContext}>
        <SEOHead {...props} />
      </HelmetProvider>
    );
    
    // react-helmet-async should update the actual document head
    // Query the DOM directly for the canonical link
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const metaTags = Array.from(document.querySelectorAll('meta'));
    
    return {
      canonical: canonicalLink,
      metaTags: metaTags
    };
  };

  /**
   * Helper function to mock window.location
   */
  const mockLocation = (url) => {
    delete window.location;
    window.location = new URL(url);
  };

  /**
   * Arbitrary generator for valid non-empty strings with alphanumeric characters
   */
  const nonEmptyString = (minLength, maxLength) =>
    fc.string({ minLength, maxLength, unit: fc.constantFrom('a', 'b', 'c', 'd', 'e', ' ') })
      .filter(s => s.trim().length >= minLength * 0.8); // Allow some spaces but ensure mostly content

  /**
   * Arbitrary generator for valid URLs
   */
  const validUrlArbitrary = fc.oneof(
    // Generate URLs with different paths
    fc.constantFrom(
      'https://careerak.com/',
      'https://careerak.com/language',
      'https://careerak.com/entry',
      'https://careerak.com/login',
      'https://careerak.com/auth',
      'https://careerak.com/otp',
      'https://careerak.com/profile',
      'https://careerak.com/jobs',
      'https://careerak.com/post-job',
      'https://careerak.com/courses',
      'https://careerak.com/post-course',
      'https://careerak.com/apply',
      'https://careerak.com/settings',
      'https://careerak.com/policy',
      'https://careerak.com/notifications',
      'https://careerak.com/admin',
      'https://careerak.com/onboarding/individuals',
      'https://careerak.com/onboarding/companies',
      'https://careerak.com/interface/individuals',
      'https://careerak.com/interface/companies'
    ),
    // Generate URLs with query parameters
    fc.record({
      path: fc.constantFrom('/jobs', '/courses', '/profile'),
      id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
        s.replace(/[^0-9a-f]/g, '0').slice(0, 24).padEnd(24, '0')
      ),
      page: fc.integer({ min: 1, max: 100 })
    }).map(({ path, id, page }) => 
      `https://careerak.com${path}?id=${id}&page=${page}`
    )
  );

  /**
   * Property Test: All pages with explicit URL have canonical link
   * 
   * Validates: Property SEO-5
   * Iterations: 100
   */
  it('should render canonical link tag for all pages with explicit URL', () => {
    fc.assert(
      fc.property(
        nonEmptyString(50, 60),
        nonEmptyString(150, 160),
        validUrlArbitrary,
        (title, description, url) => {
          const { canonical } = renderSEOHead({
            title,
            description,
            url
          });

          expect(canonical).toBeDefined();
          expect(canonical.href).toBe(url);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Canonical URL matches the provided URL
   * 
   * Validates: Property SEO-5 (canonical = page.url)
   * Iterations: 100
   */
  it('should set canonical URL equal to the provided page URL', () => {
    fc.assert(
      fc.property(
        nonEmptyString(50, 60),
        nonEmptyString(150, 160),
        validUrlArbitrary,
        (title, description, url) => {
          const { canonical } = renderSEOHead({
            title,
            description,
            url
          });

          // Canonical URL must equal the page URL
          expect(canonical.href).toBe(url);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Pages without explicit URL use window.location.href
   * 
   * Validates: Property SEO-5 (fallback to current URL)
   * Iterations: 100
   */
  it('should use window.location.href when URL is not provided', () => {
    fc.assert(
      fc.property(
        nonEmptyString(50, 60),
        nonEmptyString(150, 160),
        validUrlArbitrary,
        (title, description, currentUrl) => {
          // Mock window.location
          mockLocation(currentUrl);

          const { canonical } = renderSEOHead({
            title,
            description
            // No url prop provided
          });

          // Should use window.location.href
          expect(canonical).toBeDefined();
          expect(canonical.href).toBe(currentUrl);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Canonical URL is consistent across multiple renders
   * 
   * Validates: Property SEO-5 (idempotence)
   * Iterations: 100
   */
  it('should consistently render same canonical URL across multiple renders', () => {
    fc.assert(
      fc.property(
        nonEmptyString(50, 60),
        nonEmptyString(150, 160),
        validUrlArbitrary,
        (title, description, url) => {
          // First render
          const { canonical: canonical1 } = renderSEOHead({
            title,
            description,
            url
          });

          // Second render with same props
          const { canonical: canonical2 } = renderSEOHead({
            title,
            description,
            url
          });

          // Should produce identical canonical URLs
          expect(canonical1.href).toBe(canonical2.href);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Canonical URL is absolute (includes protocol and domain)
   * 
   * Validates: Property SEO-5 (absolute URL requirement)
   * Iterations: 100
   */
  it('should always render absolute canonical URLs', () => {
    fc.assert(
      fc.property(
        nonEmptyString(50, 60),
        nonEmptyString(150, 160),
        validUrlArbitrary,
        (title, description, url) => {
          const { canonical } = renderSEOHead({
            title,
            description,
            url
          });

          // Canonical URL must be absolute
          expect(canonical.href).toMatch(/^https?:\/\//);
          expect(canonical.href).toContain('://');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Canonical URL preserves query parameters
   * 
   * Validates: Property SEO-5 (query parameter handling)
   * Iterations: 100
   */
  it('should preserve query parameters in canonical URL', () => {
    fc.assert(
      fc.property(
        nonEmptyString(50, 60),
        nonEmptyString(150, 160),
        fc.record({
          path: fc.constantFrom('/jobs', '/courses', '/profile'),
          id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
            s.replace(/[^0-9a-f]/g, '0').slice(0, 24).padEnd(24, '0')
          ),
          page: fc.integer({ min: 1, max: 100 })
        }),
        (title, description, { path, id, page }) => {
          const url = `https://careerak.com${path}?id=${id}&page=${page}`;

          const { canonical } = renderSEOHead({
            title,
            description,
            url
          });

          // Canonical URL should preserve query parameters
          expect(canonical.href).toBe(url);
          expect(canonical.href).toContain('?');
          expect(canonical.href).toContain(`id=${id}`);
          expect(canonical.href).toContain(`page=${page}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Only one canonical link tag is rendered
   * 
   * Validates: Property SEO-5 (uniqueness)
   * Iterations: 100
   */
  it('should render exactly one canonical link tag per page', () => {
    fc.assert(
      fc.property(
        nonEmptyString(50, 60),
        nonEmptyString(150, 160),
        validUrlArbitrary,
        (title, description, url) => {
          renderSEOHead({
            title,
            description,
            url
          });

          // Count canonical link tags in the document
          const canonicalTags = document.querySelectorAll('link[rel="canonical"]');

          // Should have exactly one canonical tag
          expect(canonicalTags.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Canonical URL works with different protocols
   * 
   * Validates: Property SEO-5 (protocol handling)
   * Iterations: 100
   */
  it('should handle both http and https protocols correctly', () => {
    fc.assert(
      fc.property(
        nonEmptyString(50, 60),
        nonEmptyString(150, 160),
        fc.record({
          protocol: fc.constantFrom('http', 'https'),
          path: fc.constantFrom('/', '/jobs', '/courses', '/profile')
        }),
        (title, description, { protocol, path }) => {
          const url = `${protocol}://careerak.com${path}`;

          const { canonical } = renderSEOHead({
            title,
            description,
            url
          });

          // Should preserve the protocol
          expect(canonical.href).toBe(url);
          expect(canonical.href).toStartWith(`${protocol}://`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Canonical URL is independent of other meta tags
   * 
   * Validates: Property SEO-5 (independence)
   * Iterations: 100
   */
  it('should render canonical URL independently of other meta tags', () => {
    fc.assert(
      fc.property(
        nonEmptyString(50, 60),
        nonEmptyString(150, 160),
        validUrlArbitrary,
        fc.option(nonEmptyString(10, 100), { nil: undefined }),
        fc.option(fc.webUrl(), { nil: undefined }),
        (title, description, url, keywords, image) => {
          const { canonical } = renderSEOHead({
            title,
            description,
            url,
            keywords,
            image
          });

          // Canonical URL should be present regardless of other props
          expect(canonical).toBeDefined();
          expect(canonical.href).toBe(url);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Canonical URL matches Open Graph URL
   * 
   * Validates: Property SEO-5 (consistency with og:url)
   * Iterations: 100
   */
  it('should match canonical URL with Open Graph og:url', () => {
    fc.assert(
      fc.property(
        nonEmptyString(50, 60),
        nonEmptyString(150, 160),
        validUrlArbitrary,
        (title, description, url) => {
          const { canonical, metaTags } = renderSEOHead({
            title,
            description,
            url
          });

          const ogUrl = metaTags.find(
            tag => tag.getAttribute('property') === 'og:url'
          );

          // Canonical URL should match og:url
          expect(canonical.href).toBe(url);
          expect(ogUrl.getAttribute('content')).toBe(url);
          expect(canonical.href).toBe(ogUrl.getAttribute('content'));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Canonical URL validation is consistent
   * 
   * Validates: Property SEO-5 (validation consistency)
   * Iterations: 100
   */
  it('should consistently validate canonical URL presence', () => {
    fc.assert(
      fc.property(
        nonEmptyString(50, 60),
        nonEmptyString(150, 160),
        validUrlArbitrary,
        (title, description, url) => {
          // Render multiple times
          const { canonical: canonical1 } = renderSEOHead({ title, description, url });
          const { canonical: canonical2 } = renderSEOHead({ title, description, url });
          const { canonical: canonical3 } = renderSEOHead({ title, description, url });

          // All should have canonical tag
          expect(canonical1).toBeDefined();
          expect(canonical2).toBeDefined();
          expect(canonical3).toBeDefined();

          // All should have same href
          expect(canonical1.href).toBe(canonical2.href);
          expect(canonical2.href).toBe(canonical3.href);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Validates: Requirements FR-SEO-10, Property SEO-5
 * Task: 6.6.5 Write property-based test for canonical URLs (100 iterations)
 */
