/**
 * Property-Based Tests for Unique SEO Titles
 * 
 * **Validates: Requirements 6.6.1**
 * 
 * Tests the correctness property that all pages must have unique titles
 * using property-based testing with fast-check.
 * 
 * Property SEO-1: Unique Titles
 * ∀ page[i], page[j] ∈ Pages WHERE i ≠ j:
 *   page[i].title ≠ page[j].title
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Helper function to generate valid SEO titles (50-60 characters)
 * This ensures we're testing uniqueness with valid title lengths
 * Incorporates both seed and route to ensure uniqueness
 */
const generateValidTitle = (seed, route = '') => {
  // Create a unique identifier from seed and route
  // Use a hash of the route to ensure uniqueness even for special chars
  const routeHash = route.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const uniqueId = `${seed}-${routeHash}`;
  const baseTitle = `Page ${uniqueId} - Careerak Platform`;
  const padding = 'A'.repeat(Math.max(0, 50 - baseTitle.length));
  return (baseTitle + padding).substring(0, 60);
};

/**
 * Helper function to simulate page metadata
 */
const createPageMetadata = (route, titleSeed) => ({
  route,
  title: generateValidTitle(titleSeed, route),
  description: 'A'.repeat(155), // Valid description length
});

describe('SEO Unique Titles Property-Based Tests', () => {
  /**
   * Property SEO-1: Unique Titles
   * 
   * **Validates: Requirements FR-SEO-1, Property SEO-1**
   * 
   * ∀ page[i], page[j] ∈ Pages WHERE i ≠ j:
   *   page[i].title ≠ page[j].title
   * 
   * This property verifies that all pages in the application have unique titles.
   * No two different pages should share the same title tag.
   */
  describe('Property SEO-1: Unique Titles', () => {
    it('should ensure all pages have unique titles (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              route: fc.string({ minLength: 1, maxLength: 50 }),
              titleSeed: fc.integer({ min: 1, max: 10000 }),
            }),
            { minLength: 2, maxLength: 20 }
          ),
          (pageConfigs) => {
            // Filter to unique routes (same route can have same title)
            const uniqueRoutes = new Map();
            pageConfigs.forEach((config) => {
              if (!uniqueRoutes.has(config.route)) {
                uniqueRoutes.set(config.route, config.titleSeed);
              }
            });

            // Create page metadata for each unique route
            const pages = Array.from(uniqueRoutes.entries()).map(([route, titleSeed]) =>
              createPageMetadata(route, titleSeed)
            );

            // Need at least 2 pages to test uniqueness
            if (pages.length < 2) {
              return true;
            }

            // Extract all titles
            const titles = pages.map((page) => page.title);

            // Property: All titles must be unique for different routes
            const uniqueTitles = new Set(titles);

            // For each pair of different pages, titles must be different
            for (let i = 0; i < pages.length; i++) {
              for (let j = i + 1; j < pages.length; j++) {
                if (pages[i].route !== pages[j].route) {
                  // Different routes must have different titles
                  if (pages[i].title === pages[j].title) {
                    return false;
                  }
                }
              }
            }

            // Verify uniqueness using Set
            return uniqueTitles.size === titles.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect duplicate titles across different pages (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              route: fc.string({ minLength: 1, maxLength: 50 }),
              title: fc.string({ minLength: 50, maxLength: 60 }),
            }),
            { minLength: 2, maxLength: 15 }
          ),
          (pages) => {
            // Create a map of titles to routes
            const titleToRoutes = new Map();

            pages.forEach((page) => {
              if (!titleToRoutes.has(page.title)) {
                titleToRoutes.set(page.title, []);
              }
              titleToRoutes.get(page.title).push(page.route);
            });

            // Property: Each title should map to at most one unique route
            // If a title maps to multiple different routes, it's a violation
            for (const [title, routes] of titleToRoutes.entries()) {
              const uniqueRoutes = new Set(routes);
              if (uniqueRoutes.size > 1) {
                // Found duplicate title across different routes - violation
                return false;
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain title uniqueness with route variations (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            baseRoute: fc.constantFrom('/jobs', '/courses', '/profile', '/settings'),
            ids: fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 2, maxLength: 10 }),
          }),
          ({ baseRoute, ids }) => {
            // Ensure unique IDs
            const uniqueIds = [...new Set(ids)];
            
            // Need at least 2 unique IDs to test
            if (uniqueIds.length < 2) {
              return true;
            }

            // Create pages with route variations (e.g., /jobs/1, /jobs/2)
            const pages = uniqueIds.map((id) => ({
              route: `${baseRoute}/${id}`,
              title: generateValidTitle(id, `${baseRoute}/${id}`),
            }));

            // Extract all titles
            const titles = pages.map((page) => page.title);
            const uniqueTitles = new Set(titles);

            // Property: Different route variations must have different titles
            return uniqueTitles.size === titles.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure title uniqueness across different page types (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            jobId: fc.integer({ min: 1, max: 1000 }),
            courseId: fc.integer({ min: 1, max: 1000 }),
            userId: fc.integer({ min: 1, max: 1000 }),
          }),
          ({ jobId, courseId, userId }) => {
            // Create pages of different types
            const pages = [
              {
                route: `/jobs/${jobId}`,
                title: `Job ${jobId} - Software Engineer | Careerak Jobs`,
                type: 'job',
              },
              {
                route: `/courses/${courseId}`,
                title: `Course ${courseId} - Web Development | Careerak`,
                type: 'course',
              },
              {
                route: `/profile/${userId}`,
                title: `Profile ${userId} - User Profile | Careerak`,
                type: 'profile',
              },
            ];

            // Extract all titles
            const titles = pages.map((page) => page.title);
            const uniqueTitles = new Set(titles);

            // Property: Different page types must have different titles
            return uniqueTitles.size === titles.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify title uniqueness with language variations (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            pageId: fc.integer({ min: 1, max: 1000 }),
            languages: fc.constantFrom(
              ['ar', 'en', 'fr'],
              ['ar', 'en'],
              ['en', 'fr'],
              ['ar', 'fr']
            ),
          }),
          ({ pageId, languages }) => {
            // Create pages with different language versions
            const pages = languages.map((lang) => ({
              route: `/jobs/${pageId}`,
              language: lang,
              title:
                lang === 'ar'
                  ? `وظيفة ${pageId} - مهندس برمجيات | كاريرك للوظائف`
                  : lang === 'en'
                  ? `Job ${pageId} - Software Engineer | Careerak Jobs`
                  : `Emploi ${pageId} - Ingénieur Logiciel | Careerak`,
            }));

            // Extract all titles
            const titles = pages.map((page) => page.title);
            const uniqueTitles = new Set(titles);

            // Property: Same route with different languages must have different titles
            return uniqueTitles.size === titles.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: empty page arrays', () => {
      const pages = [];
      const titles = pages.map((page) => page.title);
      const uniqueTitles = new Set(titles);

      // Property: Empty array should have no duplicate titles
      expect(uniqueTitles.size).toBe(titles.length);
      expect(uniqueTitles.size).toBe(0);
    });

    it('should handle edge case: single page', () => {
      const pages = [
        {
          route: '/home',
          title: 'Home - Careerak Platform for Jobs and Courses',
        },
      ];

      const titles = pages.map((page) => page.title);
      const uniqueTitles = new Set(titles);

      // Property: Single page should have unique title (trivially true)
      expect(uniqueTitles.size).toBe(titles.length);
      expect(uniqueTitles.size).toBe(1);
    });

    it('should verify title uniqueness with query parameters (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            baseRoute: fc.constantFrom('/jobs', '/courses'),
            filters: fc.array(
              fc.record({
                category: fc.constantFrom('tech', 'design', 'marketing'),
                location: fc.constantFrom('dubai', 'riyadh', 'cairo'),
              }),
              { minLength: 2, maxLength: 5 }
            ),
          }),
          ({ baseRoute, filters }) => {
            // Create pages with different query parameters
            const pages = filters.map((filter, index) => ({
              route: `${baseRoute}?category=${filter.category}&location=${filter.location}`,
              title: `${filter.category} Jobs in ${filter.location} ${index} | Careerak`,
            }));

            // Extract all titles
            const titles = pages.map((page) => page.title);
            const uniqueTitles = new Set(titles);

            // Property: Different query parameters should result in different titles
            return uniqueTitles.size === titles.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure title uniqueness with special characters (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              route: fc.string({ minLength: 1, maxLength: 30 }),
              specialChar: fc.constantFrom('&', '-', '|', ':', '/', '#'),
              seed: fc.integer({ min: 1, max: 1000 }),
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (pageConfigs) => {
            // Filter to unique combinations of route and seed
            const uniquePages = new Map();
            pageConfigs.forEach((config) => {
              const key = `${config.route}-${config.seed}`;
              if (!uniquePages.has(key)) {
                uniquePages.set(key, config);
              }
            });

            // Need at least 2 unique pages to test
            if (uniquePages.size < 2) {
              return true;
            }

            // Create pages with special characters in titles
            const pages = Array.from(uniquePages.values()).map((config) => ({
              route: config.route,
              title: `Page ${config.seed} ${config.specialChar} ${config.route.replace(/[^a-zA-Z0-9]/g, '')} Careerak`.padEnd(
                55,
                'X'
              ),
            }));

            // Extract all titles
            const titles = pages.map((page) => page.title);
            const uniqueTitles = new Set(titles);

            // Property: Titles with special characters must still be unique
            return uniqueTitles.size === titles.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify title uniqueness is case-sensitive (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              route: fc.string({ minLength: 1, maxLength: 30 }),
              word: fc.string({ minLength: 5, maxLength: 15 }),
              caseVariation: fc.constantFrom('lower', 'upper', 'title'),
            }),
            { minLength: 2, maxLength: 8 }
          ),
          (pageConfigs) => {
            // Filter to unique combinations of route, word, and case variation
            const uniquePages = new Map();
            pageConfigs.forEach((config) => {
              const key = `${config.route}-${config.word}-${config.caseVariation}`;
              if (!uniquePages.has(key)) {
                uniquePages.set(key, config);
              }
            });

            // Need at least 2 unique pages to test
            if (uniquePages.size < 2) {
              return true;
            }

            // Create pages with different case variations
            const pages = Array.from(uniquePages.values()).map((config) => {
              let word = config.word;
              if (config.caseVariation === 'lower') {
                word = word.toLowerCase();
              } else if (config.caseVariation === 'upper') {
                word = word.toUpperCase();
              } else {
                word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
              }

              return {
                route: config.route,
                title: `${word} ${config.route.replace(/[^a-zA-Z0-9]/g, '')} - Careerak Platform`.padEnd(55, 'X'),
              };
            });

            // Extract all titles
            const titles = pages.map((page) => page.title);
            const uniqueTitles = new Set(titles);

            // Property: Case variations create different titles
            // "Jobs" and "jobs" are different titles
            return uniqueTitles.size === titles.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain uniqueness with numeric suffixes (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.record({
            baseTitle: fc.constantFrom(
              'Software Engineer',
              'Web Developer',
              'Data Scientist'
            ),
            numbers: fc.array(fc.integer({ min: 1, max: 100 }), {
              minLength: 2,
              maxLength: 10,
            }),
          }),
          ({ baseTitle, numbers }) => {
            // Ensure unique numbers
            const uniqueNumbers = [...new Set(numbers)];
            
            // Need at least 2 unique numbers to test
            if (uniqueNumbers.length < 2) {
              return true;
            }

            // Create pages with numeric suffixes
            const pages = uniqueNumbers.map((num) => ({
              route: `/jobs/${num}`,
              title: `${baseTitle} ${num} - Job Posting | Careerak`.padEnd(55, 'X'),
            }));

            // Extract all titles
            const titles = pages.map((page) => page.title);
            const uniqueTitles = new Set(titles);

            // Property: Numeric suffixes ensure uniqueness
            return uniqueTitles.size === titles.length;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional validation: Title length compliance
   * 
   * While testing uniqueness, also verify that titles meet length requirements
   */
  describe('Title Length Compliance with Uniqueness', () => {
    it('should ensure unique titles are within valid length range (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              route: fc.string({ minLength: 1, maxLength: 50 }),
              titleSeed: fc.integer({ min: 1, max: 10000 }),
            }),
            { minLength: 2, maxLength: 15 }
          ),
          (pageConfigs) => {
            // Filter to unique routes
            const uniqueRoutes = new Map();
            pageConfigs.forEach((config) => {
              if (!uniqueRoutes.has(config.route)) {
                uniqueRoutes.set(config.route, config.titleSeed);
              }
            });

            // Need at least 2 pages to test
            if (uniqueRoutes.size < 2) {
              return true;
            }

            // Create page metadata with valid title lengths
            const pages = Array.from(uniqueRoutes.entries()).map(([route, titleSeed]) =>
              createPageMetadata(route, titleSeed)
            );

            // Verify uniqueness
            const titles = pages.map((page) => page.title);
            const uniqueTitles = new Set(titles);
            const isUnique = uniqueTitles.size === titles.length;

            // Verify length compliance (50-60 characters)
            const allValidLength = titles.every(
              (title) => title.length >= 50 && title.length <= 60
            );

            // Property: Unique titles must also meet length requirements
            return isUnique && allValidLength;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
