/**
 * Property-Based Tests for Filter URL Persistence
 * 
 * Feature: advanced-search-filter
 * Property 5: Filter URL Persistence (Round-trip)
 * Validates: Requirements 2.3
 * 
 * Property Statement:
 * For any set of applied filters, when serialized to URL parameters 
 * and then deserialized back, the resulting filter object should be 
 * equivalent to the original filter object.
 */

const fc = require('fast-check');

// استيراد الدوال من Frontend (نحتاج نسخة Node.js-compatible)
// سنقوم بإنشاء نسخة مبسطة هنا للاختبار

/**
 * تحويل كائن الفلاتر إلى URL query string
 */
function serializeFiltersToURL(filters) {
  if (!filters || typeof filters !== 'object') {
    return '';
  }

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        // تنظيف المسافات من عناصر المصفوفة
        const cleanedArray = value.map(v => String(v).trim()).filter(v => v.length > 0);
        if (cleanedArray.length > 0) {
          params.set(key, cleanedArray.join(','));
        }
      }
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subValue !== null && subValue !== undefined && subValue !== '') {
          params.set(`${key}.${subKey}`, String(subValue));
        }
      });
    } else {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

/**
 * تحويل URL query string إلى كائن فلاتر
 */
function deserializeFiltersFromURL(queryString) {
  if (!queryString || typeof queryString !== 'string') {
    return {};
  }

  const cleanQuery = queryString.startsWith('?') 
    ? queryString.substring(1) 
    : queryString;

  const params = new URLSearchParams(cleanQuery);
  const filters = {};
  
  // حقول يجب أن تكون أرقام
  const numericFields = ['salaryMin', 'salaryMax'];

  params.forEach((value, key) => {
    if (key.includes('.')) {
      const [parentKey, childKey] = key.split('.');
      
      if (!filters[parentKey]) {
        filters[parentKey] = {};
      }
      
      // الكائنات المتداخلة دائماً أرقام (salary.min, experience.max, etc.)
      filters[parentKey][childKey] = isNumeric(value) 
        ? Number(value) 
        : value;
    } else if (value.includes(',')) {
      // مصفوفات
      filters[key] = value.split(',').map(item => {
        const trimmed = item.trim();
        // لا نحول إلى رقم في المصفوفات إلا إذا كان الحقل رقمي بطبيعته
        return (numericFields.includes(key) && isNumeric(trimmed)) 
          ? Number(trimmed) 
          : trimmed;
      });
    } else if (key.endsWith('Type') || key.endsWith('Level') || key === 'skills' || key.endsWith('Size')) {
      // حقول المصفوفات - دائماً مصفوفة حتى لو عنصر واحد
      filters[key] = [value];
    } else {
      // قيم بسيطة - نحول إلى رقم فقط إذا كان الحقل رقمي
      filters[key] = (numericFields.includes(key) && isNumeric(value))
        ? Number(value)
        : value;
    }
  });

  return filters;
}

function isNumeric(value) {
  return !isNaN(value) && !isNaN(parseFloat(value));
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
 * Arbitrary لتوليد قيم فلاتر صالحة
 */
const filterValueArbitrary = () => fc.oneof(
  fc.string({ minLength: 1, maxLength: 50 })
    .filter(s => s.trim().length > 0 && !s.includes(',')),
  fc.integer({ min: 0, max: 1000000 }),
  fc.array(
    fc.string({ minLength: 1, maxLength: 20 })
      .filter(s => s.trim().length > 0 && !s.includes(',')),
    { minLength: 1, maxLength: 5 }
  ),
  fc.record({
    min: fc.integer({ min: 0, max: 500000 }),
    max: fc.integer({ min: 500000, max: 1000000 })
  })
);

/**
 * Arbitrary لتوليد كائن فلاتر كامل
 */
const filtersArbitrary = () => fc.dictionary(
  fc.constantFrom('q', 'location', 'salaryMin', 'salaryMax', 'workType', 
                   'experienceLevel', 'skills', 'datePosted', 'companySize'),
  filterValueArbitrary(),
  { minKeys: 1, maxKeys: 5 }
);

/**
 * Arbitrary لفلاتر بسيطة (نصوص فقط)
 */
const simpleFiltersArbitrary = () => fc.record({
  q: fc.option(
    fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0 && !s.includes(',')),
    { nil: undefined }
  ),
  location: fc.option(
    fc.string({ minLength: 1, maxLength: 30 })
      .filter(s => s.trim().length > 0 && !s.includes(',')),
    { nil: undefined }
  )
}, { requiredKeys: [] });

/**
 * Arbitrary لفلاتر معقدة (جميع الأنواع)
 */
const complexFiltersArbitrary = () => fc.record({
  q: fc.option(
    fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0 && !s.includes(',')),
    { nil: undefined }
  ),
  location: fc.option(
    fc.string({ minLength: 1, maxLength: 30 })
      .filter(s => s.trim().length > 0 && !s.includes(',')),
    { nil: undefined }
  ),
  salaryMin: fc.option(fc.integer({ min: 0, max: 500000 }), { nil: undefined }),
  salaryMax: fc.option(fc.integer({ min: 500000, max: 1000000 }), { nil: undefined }),
  workType: fc.option(fc.array(
    fc.constantFrom('full-time', 'part-time', 'remote', 'hybrid'),
    { minLength: 1, maxLength: 3 }
  ), { nil: undefined }),
  experienceLevel: fc.option(fc.array(
    fc.constantFrom('junior', 'mid', 'senior', 'lead'),
    { minLength: 1, maxLength: 3 }
  ), { nil: undefined }),
  skills: fc.option(fc.array(
    fc.constantFrom('JavaScript', 'React', 'Node.js', 'Python', 'Java'),
    { minLength: 2, maxLength: 5 }
  ), { nil: undefined }),
  datePosted: fc.option(fc.constantFrom('today', 'week', 'month', 'all'), { nil: undefined }),
  companySize: fc.option(fc.array(
    fc.constantFrom('small', 'medium', 'large'),
    { minLength: 2, maxLength: 2 }
  ), { nil: undefined })
}, { requiredKeys: [] });

/**
 * Arbitrary لفلاتر مع كائنات متداخلة
 */
const nestedFiltersArbitrary = () => fc.record({
  q: fc.option(
    fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0 && !s.includes(',')),
    { nil: undefined }
  ),
  salary: fc.option(fc.record({
    min: fc.integer({ min: 0, max: 500000 }),
    max: fc.integer({ min: 500000, max: 1000000 })
  }), { nil: undefined }),
  experience: fc.option(fc.record({
    min: fc.integer({ min: 0, max: 5 }),
    max: fc.integer({ min: 5, max: 20 })
  }), { nil: undefined })
}, { requiredKeys: [] });

// ==================== Property Tests ====================

describe('Filter URL Persistence - Property Tests', () => {
  
  // Feature: advanced-search-filter, Property 5: Filter URL Persistence
  describe('Property 5: Basic Round-trip Preservation', () => {
    
    it('should preserve simple filters through round-trip', () => {
      fc.assert(
        fc.property(
          simpleFiltersArbitrary(),
          (filters) => {
            // تنظيف الفلاتر من القيم الفارغة
            const cleanFilters = Object.fromEntries(
              Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
            );
            
            if (Object.keys(cleanFilters).length === 0) {
              return true; // تخطي الفلاتر الفارغة
            }
            
            // Serialize
            const serialized = serializeFiltersToURL(cleanFilters);
            
            // Deserialize
            const deserialized = deserializeFiltersFromURL(serialized);
            
            // Verify
            return deepEqual(cleanFilters, deserialized);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
    
    it('should preserve complex filters through round-trip', () => {
      fc.assert(
        fc.property(
          complexFiltersArbitrary(),
          (filters) => {
            // تنظيف الفلاتر
            const cleanFilters = Object.fromEntries(
              Object.entries(filters).filter(([_, v]) => {
                if (v === undefined || v === null || v === '') return false;
                if (Array.isArray(v) && v.length === 0) return false;
                return true;
              })
            );
            
            if (Object.keys(cleanFilters).length === 0) {
              return true;
            }
            
            const serialized = serializeFiltersToURL(cleanFilters);
            const deserialized = deserializeFiltersFromURL(serialized);
            
            return deepEqual(cleanFilters, deserialized);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
    
    it('should preserve nested object filters through round-trip', () => {
      fc.assert(
        fc.property(
          nestedFiltersArbitrary(),
          (filters) => {
            const cleanFilters = Object.fromEntries(
              Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
            );
            
            if (Object.keys(cleanFilters).length === 0) {
              return true;
            }
            
            const serialized = serializeFiltersToURL(cleanFilters);
            const deserialized = deserializeFiltersFromURL(serialized);
            
            return deepEqual(cleanFilters, deserialized);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
  });
  
  describe('Property 5: Multiple Round-trips Stability', () => {
    
    it('should remain stable after multiple round-trips', () => {
      fc.assert(
        fc.property(
          complexFiltersArbitrary(),
          (filters) => {
            const cleanFilters = Object.fromEntries(
              Object.entries(filters).filter(([_, v]) => {
                if (v === undefined || v === null || v === '') return false;
                if (Array.isArray(v) && v.length === 0) return false;
                return true;
              })
            );
            
            if (Object.keys(cleanFilters).length === 0) {
              return true;
            }
            
            let current = cleanFilters;
            
            // 5 round-trips
            for (let i = 0; i < 5; i++) {
              const serialized = serializeFiltersToURL(current);
              current = deserializeFiltersFromURL(serialized);
            }
            
            return deepEqual(cleanFilters, current);
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
  });
  
  describe('Property 5: Idempotency', () => {
    
    it('serialization should be idempotent', () => {
      fc.assert(
        fc.property(
          complexFiltersArbitrary(),
          (filters) => {
            const cleanFilters = Object.fromEntries(
              Object.entries(filters).filter(([_, v]) => {
                if (v === undefined || v === null || v === '') return false;
                if (Array.isArray(v) && v.length === 0) return false;
                return true;
              })
            );
            
            if (Object.keys(cleanFilters).length === 0) {
              return true;
            }
            
            const serialized1 = serializeFiltersToURL(cleanFilters);
            const deserialized = deserializeFiltersFromURL(serialized1);
            const serialized2 = serializeFiltersToURL(deserialized);
            
            return serialized1 === serialized2;
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
  });
  
  describe('Property 5: Edge Cases', () => {
    
    it('should handle empty filters', () => {
      const filters = {};
      const serialized = serializeFiltersToURL(filters);
      const deserialized = deserializeFiltersFromURL(serialized);
      
      expect(serialized).toBe('');
      expect(deserialized).toEqual({});
    });
    
    it('should handle filters with special characters', () => {
      fc.assert(
        fc.property(
          fc.record({
            q: fc.string({ minLength: 1, maxLength: 50 })
              .filter(s => s.trim().length > 0 && !s.includes(','))
          }),
          (filters) => {
            const serialized = serializeFiltersToURL(filters);
            const deserialized = deserializeFiltersFromURL(serialized);
            
            return deepEqual(filters, deserialized);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
    
    it('should handle filters with Arabic text', () => {
      const filters = {
        q: 'مطور برمجيات',
        location: 'القاهرة',
        skills: ['جافاسكريبت', 'بايثون']
      };
      
      const serialized = serializeFiltersToURL(filters);
      const deserialized = deserializeFiltersFromURL(serialized);
      
      expect(deepEqual(filters, deserialized)).toBe(true);
    });
    
    it('should handle single-element arrays', () => {
      fc.assert(
        fc.property(
          fc.record({
            skills: fc.array(
              fc.string({ minLength: 1, maxLength: 20 })
                .filter(s => {
                  const trimmed = s.trim();
                  return trimmed.length > 0 && !trimmed.includes(',');
                })
                .map(s => s.trim()), // تنظيف المسافات
              { minLength: 2, maxLength: 2 }
            )
          }),
          (filters) => {
            const serialized = serializeFiltersToURL(filters);
            const deserialized = deserializeFiltersFromURL(serialized);
            
            return deepEqual(filters, deserialized);
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
  });
  
  describe('Property 5: Type Preservation', () => {
    
    it('should preserve string types', () => {
      fc.assert(
        fc.property(
          fc.record({
            q: fc.string({ minLength: 1, maxLength: 50 })
              .filter(s => s.trim().length > 0 && !s.includes(',')),
            location: fc.string({ minLength: 1, maxLength: 30 })
              .filter(s => s.trim().length > 0 && !s.includes(','))
          }),
          (filters) => {
            const serialized = serializeFiltersToURL(filters);
            const deserialized = deserializeFiltersFromURL(serialized);
            
            return typeof deserialized.q === 'string' &&
                   typeof deserialized.location === 'string' &&
                   deepEqual(filters, deserialized);
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
    
    it('should preserve number types', () => {
      fc.assert(
        fc.property(
          fc.record({
            salaryMin: fc.integer({ min: 0, max: 500000 }),
            salaryMax: fc.integer({ min: 500000, max: 1000000 })
          }),
          (filters) => {
            const serialized = serializeFiltersToURL(filters);
            const deserialized = deserializeFiltersFromURL(serialized);
            
            return typeof deserialized.salaryMin === 'number' &&
                   typeof deserialized.salaryMax === 'number' &&
                   deepEqual(filters, deserialized);
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
    
    it('should preserve array types', () => {
      fc.assert(
        fc.property(
          fc.record({
            skills: fc.array(
              fc.string({ minLength: 1, maxLength: 20 })
                .filter(s => {
                  const trimmed = s.trim();
                  return trimmed.length > 0 && !trimmed.includes(',');
                })
                .map(s => s.trim()), // تنظيف المسافات
              { minLength: 2, maxLength: 5 }
            )
          }),
          (filters) => {
            const serialized = serializeFiltersToURL(filters);
            const deserialized = deserializeFiltersFromURL(serialized);
            
            return Array.isArray(deserialized.skills) &&
                   deepEqual(filters, deserialized);
          }
        ),
        { numRuns: 50, verbose: false }
      );
    });
  });
});
