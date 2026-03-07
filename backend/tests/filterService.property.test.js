/**
 * Property-Based Tests for FilterService
 * Tests universal correctness properties with multiple iterations
 */

const fc = require('fast-check');
const FilterService = require('../src/services/filterService');

describe('FilterService - Property-Based Tests', () => {
  let filterService;

  beforeEach(() => {
    filterService = new FilterService();
  });

  /**
   * Property 1: Filter Correctness
   * For any set of courses and any filter criteria, all courses returned
   * should satisfy the specified filter conditions
   */
  describe('Property 1: Filter Correctness', () => {
    it('should only return courses matching level filter', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
          (level) => {
            const query = filterService.buildFilterQuery({ level });
            
            expect(query).toHaveProperty('level', level);
            expect(query).toHaveProperty('status', 'Published');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should only return courses matching category filter', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (category) => {
            const query = filterService.buildFilterQuery({ category });
            
            expect(query).toHaveProperty('category', category);
            expect(query).toHaveProperty('status', 'Published');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should only return courses within duration range', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (min, max) => {
            const [minDuration, maxDuration] = min <= max ? [min, max] : [max, min];
            const query = filterService.buildFilterQuery({ minDuration, maxDuration });
            
            expect(query).toHaveProperty('totalDuration');
            expect(query.totalDuration).toHaveProperty('$gte', minDuration);
            expect(query.totalDuration).toHaveProperty('$lte', maxDuration);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should only return courses matching price filter', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isFree) => {
            const query = filterService.buildFilterQuery({ isFree: isFree.toString() });
            
            expect(query).toHaveProperty('price.isFree', isFree);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should only return courses with minimum rating', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 5 }),
          (minRating) => {
            const query = filterService.buildFilterQuery({ minRating });
            
            expect(query).toHaveProperty('stats.averageRating');
            expect(query['stats.averageRating']).toHaveProperty('$gte', minRating);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Multi-Filter Composition
   * For any combination of multiple filters, all returned courses
   * should satisfy ALL selected filter criteria
   */
  describe('Property 2: Multi-Filter Composition', () => {
    it('should combine all filters correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            level: fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
            category: fc.string({ minLength: 1, maxLength: 50 }),
            minDuration: fc.integer({ min: 1, max: 50 }),
            maxDuration: fc.integer({ min: 51, max: 100 }),
            isFree: fc.boolean(),
            minRating: fc.float({ min: 0, max: 5 })
          }),
          (filters) => {
            const query = filterService.buildFilterQuery(filters);
            
            // All filters should be present
            expect(query).toHaveProperty('level', filters.level);
            expect(query).toHaveProperty('category', filters.category);
            expect(query).toHaveProperty('totalDuration');
            expect(query).toHaveProperty('price.isFree', filters.isFree);
            expect(query).toHaveProperty('stats.averageRating');
            expect(query).toHaveProperty('status', 'Published');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle partial filter combinations', () => {
      fc.assert(
        fc.property(
          fc.record({
            level: fc.option(fc.constantFrom('Beginner', 'Intermediate', 'Advanced')),
            minRating: fc.option(fc.float({ min: 0, max: 5 }))
          }),
          (filters) => {
            const cleanFilters = Object.fromEntries(
              Object.entries(filters).filter(([_, v]) => v !== null)
            );
            const query = filterService.buildFilterQuery(cleanFilters);
            
            // Status should always be present
            expect(query).toHaveProperty('status', 'Published');
            
            // Only specified filters should be present
            if (cleanFilters.level) {
              expect(query).toHaveProperty('level', cleanFilters.level);
            }
            if (cleanFilters.minRating !== undefined) {
              expect(query).toHaveProperty('stats.averageRating');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: Clear Filters Returns All
   * When all filters are cleared, the system should return all published courses
   */
  describe('Property 3: Clear Filters Returns All', () => {
    it('should only filter by status when no filters provided', () => {
      const query = filterService.buildFilterQuery({});
      
      expect(Object.keys(query)).toEqual(['status']);
      expect(query.status).toBe('Published');
    });

    it('should only filter by status for empty filter object', () => {
      fc.assert(
        fc.property(
          fc.constant({}),
          (filters) => {
            const query = filterService.buildFilterQuery(filters);
            
            expect(Object.keys(query)).toEqual(['status']);
            expect(query.status).toBe('Published');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ignore undefined and null filter values', () => {
      fc.assert(
        fc.property(
          fc.record({
            level: fc.constant(undefined),
            category: fc.constant(null),
            minRating: fc.constant(undefined)
          }),
          (filters) => {
            const query = filterService.buildFilterQuery(filters);
            
            expect(Object.keys(query)).toEqual(['status']);
            expect(query.status).toBe('Published');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 23: Sort Order Correctness
   * For any sort option, the returned sort object should correctly
   * order courses by the specified criteria
   */
  describe('Property 23: Sort Order Correctness', () => {
    it('should return correct sort for newest', () => {
      const sort = filterService.buildSortObject('newest');
      expect(sort).toEqual({ publishedAt: -1 });
    });

    it('should return correct sort for popular', () => {
      const sort = filterService.buildSortObject('popular');
      expect(sort).toEqual({ 'stats.totalEnrollments': -1 });
    });

    it('should return correct sort for rating', () => {
      const sort = filterService.buildSortObject('rating');
      expect(sort).toEqual({ 'stats.averageRating': -1 });
    });

    it('should return correct sort for price_low', () => {
      const sort = filterService.buildSortObject('price_low');
      expect(sort).toEqual({ 'price.amount': 1 });
    });

    it('should return correct sort for price_high', () => {
      const sort = filterService.buildSortObject('price_high');
      expect(sort).toEqual({ 'price.amount': -1 });
    });

    it('should default to newest for invalid sort option', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !['newest', 'popular', 'rating', 'price_low', 'price_high'].includes(s)),
          (invalidSort) => {
            const sort = filterService.buildSortObject(invalidSort);
            expect(sort).toEqual({ publishedAt: -1 });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle all valid sort options', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('newest', 'popular', 'rating', 'price_low', 'price_high'),
          (sortOption) => {
            const sort = filterService.buildSortObject(sortOption);
            
            expect(sort).toBeDefined();
            expect(Object.keys(sort).length).toBe(1);
            expect(Object.values(sort)[0]).toMatch(/^-?1$/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional Property: Filter Validation
   * Invalid filter values should be detected and reported
   */
  describe('Additional Property: Filter Validation', () => {
    it('should validate level values', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !['Beginner', 'Intermediate', 'Advanced'].includes(s)),
          (invalidLevel) => {
            const validation = filterService.validateFilters({ level: invalidLevel });
            
            expect(validation.valid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should validate duration range', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 100 }),
          fc.integer({ min: 1, max: 49 }),
          (minDuration, maxDuration) => {
            const validation = filterService.validateFilters({ minDuration, maxDuration });
            
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('minDuration cannot be greater than maxDuration');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should validate rating range', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 5.1, max: 10 }),
          (invalidRating) => {
            const validation = filterService.validateFilters({ minRating: invalidRating });
            
            expect(validation.valid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
