/**
 * Property-Based Tests for Clear Filters Reset
 * 
 * Feature: advanced-search-filter
 * Property 7: Clear Filters Reset
 * Validates: Requirements 2.5
 * 
 * Property Statement:
 * For any state with applied filters, when the "clear filters" action is triggered,
 * the resulting state should be equivalent to the default state with no filters applied.
 */

const fc = require('fast-check');

// ==================== Default State ====================

/**
 * الحالة الافتراضية للفلاتر (بدون أي فلاتر مطبقة)
 */
const DEFAULT_FILTER_STATE = {
  q: '',
  location: '',
  salaryMin: null,
  salaryMax: null,
  workType: [],
  experienceLevel: [],
  skills: [],
  skillsLogic: 'OR',
  datePosted: 'all',
  companySize: [],
  page: 1,
  limit: 20,
  sort: 'relevance'
};

/**
 * دالة مسح الفلاتر - تعيد الحالة للوضع الافتراضي
 */
function clearFilters(currentState) {
  return { ...DEFAULT_FILTER_STATE };
}

/**
 * دالة تطبيق الفلاتر - تدمج الفلاتر الجديدة مع الحالة الحالية
 */
function applyFilters(currentState, newFilters) {
  return {
    ...currentState,
    ...newFilters
  };
}

/**
 * مقارنة عميقة لكائنين
 */
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || 
      obj1 === null || obj2 === null) {
    return false;
  }
  
  const keys1 = Object.keys(obj1).sort();
  const keys2 = Object.keys(obj2).sort();
  
  if (keys1.length !== keys2.length) return false;
  if (keys1.join(',') !== keys2.join(',')) return false;
  
  for (const key of keys1) {
    if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
      if (obj1[key].length !== obj2[key].length) return false;
      if (obj1[key].join(',') !== obj2[key].join(',')) return false;
    } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (!deepEqual(obj1[key], obj2[key])) return false;
    } else if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
}

// ==================== Arbitraries ====================

/**
 * Arbitrary لتوليد حالة فلاتر عشوائية
 */
const filterStateArbitrary = () => fc.record({
  q: fc.option(
    fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0),
    { nil: '' }
  ),
  location: fc.option(
    fc.oneof(
      fc.constant('Cairo'),
      fc.constant('Alexandria'),
      fc.constant('Giza'),
      fc.constant('Mansoura')
    ),
    { nil: '' }
  ),
  salaryMin: fc.option(
    fc.integer({ min: 5000, max: 15000 }),
    { nil: null }
  ),
  salaryMax: fc.option(
    fc.integer({ min: 15000, max: 30000 }),
    { nil: null }
  ),
  workType: fc.option(
    fc.array(
      fc.oneof(
        fc.constant('Full-time'),
        fc.constant('Part-time'),
        fc.constant('Remote'),
        fc.constant('Hybrid')
      ),
      { minLength: 1, maxLength: 3 }
    ),
    { nil: [] }
  ),
  experienceLevel: fc.option(
    fc.array(
      fc.oneof(
        fc.constant('Entry'),
        fc.constant('Mid'),
        fc.constant('Senior'),
        fc.constant('Lead')
      ),
      { minLength: 1, maxLength: 3 }
    ),
    { nil: [] }
  ),
  skills: fc.option(
    fc.array(
      fc.oneof(
        fc.constant('JavaScript'),
        fc.constant('React'),
        fc.constant('Node.js'),
        fc.constant('Python'),
        fc.constant('Java')
      ),
      { minLength: 1, maxLength: 5 }
    ),
    { nil: [] }
  ),
  skillsLogic: fc.oneof(
    fc.constant('AND'),
    fc.constant('OR')
  ),
  datePosted: fc.oneof(
    fc.constant('today'),
    fc.constant('week'),
    fc.constant('month'),
    fc.constant('all')
  ),
  companySize: fc.option(
    fc.array(
      fc.oneof(
        fc.constant('Small'),
        fc.constant('Medium'),
        fc.constant('Large')
      ),
      { minLength: 1, maxLength: 2 }
    ),
    { nil: [] }
  ),
  page: fc.integer({ min: 1, max: 10 }),
  limit: fc.oneof(
    fc.constant(10),
    fc.constant(20),
    fc.constant(50)
  ),
  sort: fc.oneof(
    fc.constant('relevance'),
    fc.constant('date'),
    fc.constant('salary')
  )
});

/**
 * Arbitrary لتوليد فلاتر جزئية (بعض الحقول فقط)
 */
const partialFiltersArbitrary = () => fc.record({
  q: fc.option(
    fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0),
    { nil: undefined }
  ),
  location: fc.option(
    fc.string({ minLength: 1, maxLength: 30 }),
    { nil: undefined }
  ),
  salaryMin: fc.option(
    fc.integer({ min: 5000, max: 15000 }),
    { nil: undefined }
  ),
  salaryMax: fc.option(
    fc.integer({ min: 15000, max: 30000 }),
    { nil: undefined }
  ),
  workType: fc.option(
    fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
    { nil: undefined }
  ),
  skills: fc.option(
    fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
    { nil: undefined }
  )
}, { requiredKeys: [] });

// ==================== Property Tests ====================

describe('Clear Filters Reset - Property Tests', () => {
  
  // Feature: advanced-search-filter, Property 7: Clear Filters Reset
  describe('Property 7: Basic Clear Filters Behavior', () => {
    
    it('should reset to default state after clearing any filter state', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          (filterState) => {
            // تطبيق الفلاتر
            const stateWithFilters = applyFilters(DEFAULT_FILTER_STATE, filterState);
            
            // مسح الفلاتر
            const clearedState = clearFilters(stateWithFilters);
            
            // التحقق: الحالة بعد المسح يجب أن تساوي الحالة الافتراضية
            return deepEqual(clearedState, DEFAULT_FILTER_STATE);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
    
    it('should reset to default state regardless of how many filters were applied', () => {
      fc.assert(
        fc.property(
          fc.array(partialFiltersArbitrary(), { minLength: 1, maxLength: 5 }),
          (filterSequence) => {
            // تطبيق عدة فلاتر بالتتابع
            let currentState = DEFAULT_FILTER_STATE;
            
            filterSequence.forEach(filters => {
              currentState = applyFilters(currentState, filters);
            });
            
            // مسح الفلاتر
            const clearedState = clearFilters(currentState);
            
            // التحقق: الحالة بعد المسح يجب أن تساوي الحالة الافتراضية
            return deepEqual(clearedState, DEFAULT_FILTER_STATE);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
    
    it('should be idempotent (clearing multiple times gives same result)', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          (filterState) => {
            // تطبيق الفلاتر
            const stateWithFilters = applyFilters(DEFAULT_FILTER_STATE, filterState);
            
            // مسح الفلاتر عدة مرات
            const cleared1 = clearFilters(stateWithFilters);
            const cleared2 = clearFilters(cleared1);
            const cleared3 = clearFilters(cleared2);
            
            // التحقق: جميع النتائج يجب أن تكون متطابقة
            return deepEqual(cleared1, cleared2) && 
                   deepEqual(cleared2, cleared3) &&
                   deepEqual(cleared1, DEFAULT_FILTER_STATE);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
  });
  
  describe('Property 7: Clear Filters with Specific Filter Types', () => {
    
    it('should clear text filters (q, location)', () => {
      fc.assert(
        fc.property(
          fc.record({
            q: fc.string({ minLength: 1, maxLength: 50 })
              .filter(s => s.trim().length > 0),
            location: fc.string({ minLength: 1, maxLength: 30 })
          }),
          (textFilters) => {
            const stateWithFilters = applyFilters(DEFAULT_FILTER_STATE, textFilters);
            const clearedState = clearFilters(stateWithFilters);
            
            return clearedState.q === DEFAULT_FILTER_STATE.q &&
                   clearedState.location === DEFAULT_FILTER_STATE.location;
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
    
    it('should clear numeric filters (salaryMin, salaryMax)', () => {
      fc.assert(
        fc.property(
          fc.record({
            salaryMin: fc.integer({ min: 5000, max: 15000 }),
            salaryMax: fc.integer({ min: 15000, max: 30000 })
          }),
          (numericFilters) => {
            const stateWithFilters = applyFilters(DEFAULT_FILTER_STATE, numericFilters);
            const clearedState = clearFilters(stateWithFilters);
            
            return clearedState.salaryMin === DEFAULT_FILTER_STATE.salaryMin &&
                   clearedState.salaryMax === DEFAULT_FILTER_STATE.salaryMax;
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
    
    it('should clear array filters (workType, skills, etc.)', () => {
      fc.assert(
        fc.property(
          fc.record({
            workType: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
            experienceLevel: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
            skills: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
            companySize: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 2 })
          }),
          (arrayFilters) => {
            const stateWithFilters = applyFilters(DEFAULT_FILTER_STATE, arrayFilters);
            const clearedState = clearFilters(stateWithFilters);
            
            return clearedState.workType.length === 0 &&
                   clearedState.experienceLevel.length === 0 &&
                   clearedState.skills.length === 0 &&
                   clearedState.companySize.length === 0;
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
    
    it('should clear enum filters (skillsLogic, datePosted, sort)', () => {
      fc.assert(
        fc.property(
          fc.record({
            skillsLogic: fc.oneof(fc.constant('AND'), fc.constant('OR')),
            datePosted: fc.oneof(fc.constant('today'), fc.constant('week'), fc.constant('month')),
            sort: fc.oneof(fc.constant('date'), fc.constant('salary'))
          }),
          (enumFilters) => {
            const stateWithFilters = applyFilters(DEFAULT_FILTER_STATE, enumFilters);
            const clearedState = clearFilters(stateWithFilters);
            
            return clearedState.skillsLogic === DEFAULT_FILTER_STATE.skillsLogic &&
                   clearedState.datePosted === DEFAULT_FILTER_STATE.datePosted &&
                   clearedState.sort === DEFAULT_FILTER_STATE.sort;
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
    
    it('should clear pagination state (page, limit)', () => {
      fc.assert(
        fc.property(
          fc.record({
            page: fc.integer({ min: 2, max: 10 }),
            limit: fc.oneof(fc.constant(10), fc.constant(50))
          }),
          (paginationFilters) => {
            const stateWithFilters = applyFilters(DEFAULT_FILTER_STATE, paginationFilters);
            const clearedState = clearFilters(stateWithFilters);
            
            return clearedState.page === DEFAULT_FILTER_STATE.page &&
                   clearedState.limit === DEFAULT_FILTER_STATE.limit;
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
  });
  
  describe('Property 7: Clear Filters Preserves Default Values', () => {
    
    it('should preserve default string values', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          (filterState) => {
            const clearedState = clearFilters(filterState);
            
            return typeof clearedState.q === 'string' &&
                   typeof clearedState.location === 'string' &&
                   clearedState.q === '' &&
                   clearedState.location === '';
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
    
    it('should preserve default null values', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          (filterState) => {
            const clearedState = clearFilters(filterState);
            
            return clearedState.salaryMin === null &&
                   clearedState.salaryMax === null;
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
    
    it('should preserve default array values', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          (filterState) => {
            const clearedState = clearFilters(filterState);
            
            return Array.isArray(clearedState.workType) &&
                   Array.isArray(clearedState.experienceLevel) &&
                   Array.isArray(clearedState.skills) &&
                   Array.isArray(clearedState.companySize) &&
                   clearedState.workType.length === 0 &&
                   clearedState.experienceLevel.length === 0 &&
                   clearedState.skills.length === 0 &&
                   clearedState.companySize.length === 0;
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
    
    it('should preserve default enum values', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          (filterState) => {
            const clearedState = clearFilters(filterState);
            
            return clearedState.skillsLogic === 'OR' &&
                   clearedState.datePosted === 'all' &&
                   clearedState.sort === 'relevance';
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
    
    it('should preserve default pagination values', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          (filterState) => {
            const clearedState = clearFilters(filterState);
            
            return clearedState.page === 1 &&
                   clearedState.limit === 20;
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
  });
  
  describe('Property 7: Clear Filters Edge Cases', () => {
    
    it('should handle clearing already default state', () => {
      const clearedState = clearFilters(DEFAULT_FILTER_STATE);
      
      expect(deepEqual(clearedState, DEFAULT_FILTER_STATE)).toBe(true);
    });
    
    it('should handle clearing state with undefined values', () => {
      const stateWithUndefined = {
        ...DEFAULT_FILTER_STATE,
        q: undefined,
        location: undefined,
        salaryMin: undefined
      };
      
      const clearedState = clearFilters(stateWithUndefined);
      
      expect(deepEqual(clearedState, DEFAULT_FILTER_STATE)).toBe(true);
    });
    
    it('should handle clearing state with extra properties', () => {
      const stateWithExtra = {
        ...DEFAULT_FILTER_STATE,
        extraProp1: 'value1',
        extraProp2: 123
      };
      
      const clearedState = clearFilters(stateWithExtra);
      
      // يجب أن تحتوي فقط على الخصائص الافتراضية
      expect(Object.keys(clearedState).sort()).toEqual(Object.keys(DEFAULT_FILTER_STATE).sort());
      expect(deepEqual(clearedState, DEFAULT_FILTER_STATE)).toBe(true);
    });
    
    it('should handle clearing state with missing properties', () => {
      const stateWithMissing = {
        q: 'developer',
        location: 'Cairo'
        // باقي الخصائص مفقودة
      };
      
      const clearedState = clearFilters(stateWithMissing);
      
      expect(deepEqual(clearedState, DEFAULT_FILTER_STATE)).toBe(true);
    });
    
    it('should handle clearing state with null', () => {
      const clearedState = clearFilters(null);
      
      expect(deepEqual(clearedState, DEFAULT_FILTER_STATE)).toBe(true);
    });
    
    it('should handle clearing state with empty object', () => {
      const clearedState = clearFilters({});
      
      expect(deepEqual(clearedState, DEFAULT_FILTER_STATE)).toBe(true);
    });
  });
  
  describe('Property 7: Clear Filters Consistency', () => {
    
    it('should produce same result regardless of input state', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          filterStateArbitrary(),
          (state1, state2) => {
            const cleared1 = clearFilters(state1);
            const cleared2 = clearFilters(state2);
            
            // كلا النتيجتين يجب أن تكونا متطابقتين
            return deepEqual(cleared1, cleared2) &&
                   deepEqual(cleared1, DEFAULT_FILTER_STATE);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
    
    it('should be deterministic (same input always gives same output)', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          (filterState) => {
            const cleared1 = clearFilters(filterState);
            const cleared2 = clearFilters(filterState);
            const cleared3 = clearFilters(filterState);
            
            return deepEqual(cleared1, cleared2) &&
                   deepEqual(cleared2, cleared3);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
  });
  
  describe('Property 7: Clear Filters Integration', () => {
    
    it('should work correctly in apply-clear-apply cycle', () => {
      fc.assert(
        fc.property(
          partialFiltersArbitrary(),
          partialFiltersArbitrary(),
          (filters1, filters2) => {
            // تطبيق فلاتر
            let state = applyFilters(DEFAULT_FILTER_STATE, filters1);
            
            // مسح الفلاتر
            state = clearFilters(state);
            
            // تطبيق فلاتر جديدة
            state = applyFilters(state, filters2);
            
            // يجب أن تحتوي فقط على filters2 (بدون آثار من filters1)
            const expectedState = applyFilters(DEFAULT_FILTER_STATE, filters2);
            
            return deepEqual(state, expectedState);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
    
    it('should not affect subsequent filter applications', () => {
      fc.assert(
        fc.property(
          filterStateArbitrary(),
          partialFiltersArbitrary(),
          (initialState, newFilters) => {
            // مسح الفلاتر
            const clearedState = clearFilters(initialState);
            
            // تطبيق فلاتر جديدة
            const stateWithNewFilters = applyFilters(clearedState, newFilters);
            
            // يجب أن تكون النتيجة مطابقة لتطبيق الفلاتر على الحالة الافتراضية
            const expectedState = applyFilters(DEFAULT_FILTER_STATE, newFilters);
            
            return deepEqual(stateWithNewFilters, expectedState);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
  });
});
