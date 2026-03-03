const filterService = require('../src/services/filterService');

describe('FilterService - Unit Tests', () => {
  
  describe('filterBySalary', () => {
    it('should filter by minimum salary', () => {
      const query = {};
      const result = filterService.filterBySalary(query, 5000, undefined);
      
      expect(result['salary.min']).toBeDefined();
      expect(result['salary.min'].$gte).toBe(5000);
    });

    it('should filter by maximum salary', () => {
      const query = {};
      const result = filterService.filterBySalary(query, undefined, 10000);
      
      expect(result['salary.min']).toBeDefined();
      expect(result['salary.min'].$lte).toBe(10000);
    });

    it('should filter by salary range', () => {
      const query = {};
      const result = filterService.filterBySalary(query, 5000, 10000);
      
      expect(result['salary.min'].$gte).toBe(5000);
      expect(result['salary.min'].$lte).toBe(10000);
    });

    it('should throw error if min > max', () => {
      const query = {};
      
      expect(() => {
        filterService.filterBySalary(query, 10000, 5000);
      }).toThrow('Minimum salary cannot be greater than maximum salary');
    });

    it('should handle zero values', () => {
      const query = {};
      const result = filterService.filterBySalary(query, 0, 0);
      
      expect(result['salary.min'].$gte).toBe(0);
      expect(result['salary.min'].$lte).toBe(0);
    });
  });

  describe('filterByLocation', () => {
    it('should filter by location (city or country)', () => {
      const query = {};
      const result = filterService.filterByLocation(query, 'Cairo');
      
      expect(result.$or).toBeDefined();
      expect(result.$or).toHaveLength(2);
      expect(result.$or[0]['location.city']).toBeDefined();
      expect(result.$or[1]['location.country']).toBeDefined();
    });

    it('should handle empty location', () => {
      const query = {};
      const result = filterService.filterByLocation(query, '');
      
      expect(result.$or).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      const query = {};
      const result = filterService.filterByLocation(query, 'cairo');
      
      expect(result.$or[0]['location.city'].toString()).toContain('i');
    });
  });

  describe('filterByWorkType', () => {
    it('should filter by single work type', () => {
      const query = {};
      const result = filterService.filterByWorkType(query, ['Full-time']);
      
      expect(result.jobType).toBeDefined();
      expect(result.jobType.$in).toContain('Full-time');
    });

    it('should filter by multiple work types', () => {
      const query = {};
      const result = filterService.filterByWorkType(query, ['Full-time', 'Remote']);
      
      expect(result.jobType.$in).toHaveLength(2);
      expect(result.jobType.$in).toContain('Full-time');
      expect(result.jobType.$in).toContain('Remote');
    });

    it('should filter out invalid work types', () => {
      const query = {};
      const result = filterService.filterByWorkType(query, ['Full-time', 'Invalid']);
      
      expect(result.jobType.$in).toHaveLength(1);
      expect(result.jobType.$in).toContain('Full-time');
      expect(result.jobType.$in).not.toContain('Invalid');
    });

    it('should handle empty array', () => {
      const query = {};
      const result = filterService.filterByWorkType(query, []);
      
      expect(result.jobType).toBeUndefined();
    });
  });

  describe('filterByExperienceLevel', () => {
    it('should filter by single experience level', () => {
      const query = {};
      const result = filterService.filterByExperienceLevel(query, ['Mid']);
      
      expect(result.experienceLevel).toBeDefined();
      expect(result.experienceLevel.$in).toContain('Mid');
    });

    it('should filter by multiple experience levels', () => {
      const query = {};
      const result = filterService.filterByExperienceLevel(query, ['Entry', 'Mid', 'Senior']);
      
      expect(result.experienceLevel.$in).toHaveLength(3);
    });

    it('should filter out invalid levels', () => {
      const query = {};
      const result = filterService.filterByExperienceLevel(query, ['Mid', 'Invalid']);
      
      expect(result.experienceLevel.$in).toHaveLength(1);
      expect(result.experienceLevel.$in).toContain('Mid');
    });
  });

  describe('filterBySkills', () => {
    it('should filter by skills with OR logic', () => {
      const query = {};
      const result = filterService.filterBySkills(query, ['JavaScript', 'React'], 'OR');
      
      expect(result.skills).toBeDefined();
      expect(result.skills.$in).toHaveLength(2);
      expect(result.skills.$in).toContain('JavaScript');
      expect(result.skills.$in).toContain('React');
    });

    it('should filter by skills with AND logic', () => {
      const query = {};
      const result = filterService.filterBySkills(query, ['JavaScript', 'React'], 'AND');
      
      expect(result.skills).toBeDefined();
      expect(result.skills.$all).toHaveLength(2);
      expect(result.skills.$all).toContain('JavaScript');
      expect(result.skills.$all).toContain('React');
    });

    it('should trim skill names', () => {
      const query = {};
      const result = filterService.filterBySkills(query, ['  JavaScript  ', ' React '], 'OR');
      
      expect(result.skills.$in).toContain('JavaScript');
      expect(result.skills.$in).toContain('React');
    });

    it('should filter out empty skills', () => {
      const query = {};
      const result = filterService.filterBySkills(query, ['JavaScript', '', '  '], 'OR');
      
      expect(result.skills.$in).toHaveLength(1);
      expect(result.skills.$in).toContain('JavaScript');
    });

    it('should handle empty array', () => {
      const query = {};
      const result = filterService.filterBySkills(query, [], 'OR');
      
      expect(result.skills).toBeUndefined();
    });
  });

  describe('filterByDate', () => {
    it('should filter by today', () => {
      const query = {};
      const result = filterService.filterByDate(query, 'today');
      
      expect(result.createdAt).toBeDefined();
      expect(result.createdAt.$gte).toBeInstanceOf(Date);
    });

    it('should filter by week', () => {
      const query = {};
      const result = filterService.filterByDate(query, 'week');
      
      expect(result.createdAt).toBeDefined();
      expect(result.createdAt.$gte).toBeInstanceOf(Date);
    });

    it('should filter by month', () => {
      const query = {};
      const result = filterService.filterByDate(query, 'month');
      
      expect(result.createdAt).toBeDefined();
      expect(result.createdAt.$gte).toBeInstanceOf(Date);
    });

    it('should not filter for "all"', () => {
      const query = {};
      const result = filterService.filterByDate(query, 'all');
      
      expect(result.createdAt).toBeUndefined();
    });

    it('should handle invalid date range', () => {
      const query = {};
      const result = filterService.filterByDate(query, 'invalid');
      
      expect(result.createdAt).toBeUndefined();
    });
  });

  describe('filterByCompanySize', () => {
    it('should filter by single company size', () => {
      const query = {};
      const result = filterService.filterByCompanySize(query, ['Medium']);
      
      expect(result['company.size']).toBeDefined();
      expect(result['company.size'].$in).toContain('Medium');
    });

    it('should filter by multiple company sizes', () => {
      const query = {};
      const result = filterService.filterByCompanySize(query, ['Small', 'Medium', 'Large']);
      
      expect(result['company.size'].$in).toHaveLength(3);
    });

    it('should filter out invalid sizes', () => {
      const query = {};
      const result = filterService.filterByCompanySize(query, ['Medium', 'Invalid']);
      
      expect(result['company.size'].$in).toHaveLength(1);
      expect(result['company.size'].$in).toContain('Medium');
    });
  });

  describe('applyFilters', () => {
    it('should apply multiple filters together', () => {
      const baseQuery = { status: 'Open' };
      const filters = {
        salaryMin: 5000,
        salaryMax: 10000,
        location: 'Cairo',
        workType: ['Full-time', 'Remote'],
        experienceLevel: ['Mid', 'Senior'],
        skills: ['JavaScript', 'React'],
        skillsLogic: 'AND',
        datePosted: 'week',
        companySize: ['Medium', 'Large']
      };

      const result = filterService.applyFilters(baseQuery, filters, 'jobs');

      expect(result.status).toBe('Open');
      expect(result['salary.min']).toBeDefined();
      expect(result.$or).toBeDefined(); // location
      expect(result.jobType).toBeDefined();
      expect(result.experienceLevel).toBeDefined();
      expect(result.skills).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result['company.size']).toBeDefined();
    });

    it('should handle empty filters', () => {
      const baseQuery = { status: 'Open' };
      const result = filterService.applyFilters(baseQuery, {}, 'jobs');

      expect(result.status).toBe('Open');
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should only apply job-specific filters for jobs', () => {
      const baseQuery = {};
      const filters = {
        salaryMin: 5000,
        workType: ['Full-time']
      };

      const result = filterService.applyFilters(baseQuery, filters, 'jobs');

      expect(result['salary.min']).toBeDefined();
      expect(result.jobType).toBeDefined();
    });

    it('should not apply job-specific filters for courses', () => {
      const baseQuery = {};
      const filters = {
        salaryMin: 5000,
        workType: ['Full-time']
      };

      const result = filterService.applyFilters(baseQuery, filters, 'courses');

      expect(result['salary.min']).toBeUndefined();
      expect(result.jobType).toBeUndefined();
    });
  });

  describe('validateFilters', () => {
    it('should validate correct filters', () => {
      const filters = {
        salaryMin: 5000,
        salaryMax: 10000,
        skills: ['JavaScript', 'React'],
        skillsLogic: 'AND',
        datePosted: 'week'
      };

      const result = filterService.validateFilters(filters, 'jobs');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative salary', () => {
      const filters = {
        salaryMin: -1000
      };

      const result = filterService.validateFilters(filters, 'jobs');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Minimum salary cannot be negative');
    });

    it('should reject min > max salary', () => {
      const filters = {
        salaryMin: 10000,
        salaryMax: 5000
      };

      const result = filterService.validateFilters(filters, 'jobs');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Minimum salary cannot be greater than maximum salary');
    });

    it('should reject non-array skills', () => {
      const filters = {
        skills: 'JavaScript'
      };

      const result = filterService.validateFilters(filters, 'jobs');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Skills must be an array');
    });

    it('should reject too many skills', () => {
      const filters = {
        skills: Array(25).fill('JavaScript')
      };

      const result = filterService.validateFilters(filters, 'jobs');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Maximum 20 skills allowed');
    });

    it('should reject invalid skills logic', () => {
      const filters = {
        skills: ['JavaScript'],
        skillsLogic: 'INVALID'
      };

      const result = filterService.validateFilters(filters, 'jobs');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Skills logic must be either AND or OR');
    });

    it('should reject invalid date range', () => {
      const filters = {
        datePosted: 'invalid'
      };

      const result = filterService.validateFilters(filters, 'jobs');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid date range');
    });
  });

  describe('getDefaultFilters', () => {
    it('should return default filters for jobs', () => {
      const defaults = filterService.getDefaultFilters('jobs');
      
      expect(defaults.query).toBe('');
      expect(defaults.location).toBe('');
      expect(defaults.skills).toEqual([]);
      expect(defaults.skillsLogic).toBe('OR');
      expect(defaults.datePosted).toBe('all');
      expect(defaults.workType).toEqual([]);
      expect(defaults.experienceLevel).toEqual([]);
      expect(defaults.companySize).toEqual([]);
      expect(defaults.salaryMin).toBeUndefined();
      expect(defaults.salaryMax).toBeUndefined();
    });

    it('should return default filters for courses', () => {
      const defaults = filterService.getDefaultFilters('courses');
      
      expect(defaults.query).toBe('');
      expect(defaults.location).toBe('');
      expect(defaults.skills).toEqual([]);
      expect(defaults.level).toEqual([]);
      expect(defaults.duration).toBeUndefined();
      expect(defaults.price).toBeUndefined();
    });
  });

  describe('clearFilters', () => {
    it('should return default filters', () => {
      const cleared = filterService.clearFilters('jobs');
      const defaults = filterService.getDefaultFilters('jobs');
      
      expect(cleared).toEqual(defaults);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false for default filters', () => {
      const defaults = filterService.getDefaultFilters('jobs');
      const hasFilters = filterService.hasActiveFilters(defaults, 'jobs');
      
      expect(hasFilters).toBe(false);
    });

    it('should return true when salary filter is applied', () => {
      const filters = {
        ...filterService.getDefaultFilters('jobs'),
        salaryMin: 5000
      };
      
      const hasFilters = filterService.hasActiveFilters(filters, 'jobs');
      expect(hasFilters).toBe(true);
    });

    it('should return true when location filter is applied', () => {
      const filters = {
        ...filterService.getDefaultFilters('jobs'),
        location: 'Cairo'
      };
      
      const hasFilters = filterService.hasActiveFilters(filters, 'jobs');
      expect(hasFilters).toBe(true);
    });

    it('should return true when skills filter is applied', () => {
      const filters = {
        ...filterService.getDefaultFilters('jobs'),
        skills: ['JavaScript']
      };
      
      const hasFilters = filterService.hasActiveFilters(filters, 'jobs');
      expect(hasFilters).toBe(true);
    });

    it('should return true when workType filter is applied', () => {
      const filters = {
        ...filterService.getDefaultFilters('jobs'),
        workType: ['Full-time']
      };
      
      const hasFilters = filterService.hasActiveFilters(filters, 'jobs');
      expect(hasFilters).toBe(true);
    });

    it('should return true when datePosted is not "all"', () => {
      const filters = {
        ...filterService.getDefaultFilters('jobs'),
        datePosted: 'today'
      };
      
      const hasFilters = filterService.hasActiveFilters(filters, 'jobs');
      expect(hasFilters).toBe(true);
    });

    it('should ignore page, limit, and sort', () => {
      const filters = {
        ...filterService.getDefaultFilters('jobs'),
        page: 2,
        limit: 50,
        sort: 'date'
      };
      
      const hasFilters = filterService.hasActiveFilters(filters, 'jobs');
      expect(hasFilters).toBe(false);
    });

    it('should return true when multiple filters are applied', () => {
      const filters = {
        ...filterService.getDefaultFilters('jobs'),
        location: 'Cairo',
        salaryMin: 5000,
        skills: ['JavaScript', 'React']
      };
      
      const hasFilters = filterService.hasActiveFilters(filters, 'jobs');
      expect(hasFilters).toBe(true);
    });
  });
});
