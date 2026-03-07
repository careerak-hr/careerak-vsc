const jobFilterService = require('../src/services/jobFilterService');

describe('JobFilterService', () => {
  describe('applyFilters', () => {
    it('should apply salary filter correctly', () => {
      const baseQuery = { status: 'Open' };
      const filters = { salaryMin: 5000, salaryMax: 10000 };
      
      const result = jobFilterService.applyFilters(baseQuery, filters, 'jobs');
      
      expect(result).toHaveProperty('salary.min');
      expect(result['salary.min'].$gte).toBe(5000);
      expect(result['salary.min'].$lte).toBe(10000);
    });

    it('should apply work type filter correctly', () => {
      const baseQuery = { status: 'Open' };
      const filters = { workType: ['Full-time', 'Remote'] };
      
      const result = jobFilterService.applyFilters(baseQuery, filters, 'jobs');
      
      expect(result).toHaveProperty('workType');
      expect(result.workType.$in).toEqual(['Full-time', 'Remote']);
    });

    it('should apply experience level filter correctly', () => {
      const baseQuery = { status: 'Open' };
      const filters = { experienceLevel: ['Mid', 'Senior'] };
      
      const result = jobFilterService.applyFilters(baseQuery, filters, 'jobs');
      
      expect(result).toHaveProperty('experienceLevel');
      expect(result.experienceLevel.$in).toEqual(['Mid', 'Senior']);
    });

    it('should apply skills filter with OR logic', () => {
      const baseQuery = { status: 'Open' };
      const filters = { skills: ['JavaScript', 'React'], skillsLogic: 'OR' };
      
      const result = jobFilterService.applyFilters(baseQuery, filters, 'jobs');
      
      expect(result).toHaveProperty('requiredSkills');
      expect(result.requiredSkills.$in).toEqual(['JavaScript', 'React']);
    });

    it('should apply skills filter with AND logic', () => {
      const baseQuery = { status: 'Open' };
      const filters = { skills: ['JavaScript', 'React'], skillsLogic: 'AND' };
      
      const result = jobFilterService.applyFilters(baseQuery, filters, 'jobs');
      
      expect(result).toHaveProperty('requiredSkills');
      expect(result.requiredSkills.$all).toEqual(['JavaScript', 'React']);
    });

    it('should apply location filter correctly', () => {
      const baseQuery = { status: 'Open' };
      const filters = { location: 'Riyadh' };
      
      const result = jobFilterService.applyFilters(baseQuery, filters, 'jobs');
      
      expect(result).toHaveProperty('$or');
      expect(result.$or).toHaveLength(2);
    });

    it('should apply date posted filter correctly', () => {
      const baseQuery = { status: 'Open' };
      const filters = { datePosted: 'week' };
      
      const result = jobFilterService.applyFilters(baseQuery, filters, 'jobs');
      
      expect(result).toHaveProperty('createdAt');
      expect(result.createdAt).toHaveProperty('$gte');
    });

    it('should apply company size filter correctly', () => {
      const baseQuery = { status: 'Open' };
      const filters = { companySize: ['Medium', 'Large'] };
      
      const result = jobFilterService.applyFilters(baseQuery, filters, 'jobs');
      
      expect(result).toHaveProperty('company.size');
      expect(result['company.size'].$in).toEqual(['Medium', 'Large']);
    });
  });

  describe('validateFilters', () => {
    it('should validate salary filters correctly', () => {
      const filters = { salaryMin: 5000, salaryMax: 10000 };
      
      const result = jobFilterService.validateFilters(filters, 'jobs');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid salary range', () => {
      const filters = { salaryMin: 10000, salaryMax: 5000 };
      
      const result = jobFilterService.validateFilters(filters, 'jobs');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('salaryMin cannot be greater than salaryMax');
    });

    it('should reject non-numeric salary', () => {
      const filters = { salaryMin: 'invalid' };
      
      const result = jobFilterService.validateFilters(filters, 'jobs');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('salaryMin must be a number');
    });

    it('should reject non-array work type', () => {
      const filters = { workType: 'Full-time' };
      
      const result = jobFilterService.validateFilters(filters, 'jobs');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('workType must be an array');
    });

    it('should reject invalid skills logic', () => {
      const filters = { skillsLogic: 'INVALID' };
      
      const result = jobFilterService.validateFilters(filters, 'jobs');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('skillsLogic must be either AND or OR');
    });

    it('should reject invalid date posted', () => {
      const filters = { datePosted: 'invalid' };
      
      const result = jobFilterService.validateFilters(filters, 'jobs');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('datePosted must be one of: today, week, month, all');
    });
  });

  describe('getFilterCounts', () => {
    // Note: These tests require a database connection
    // They are integration tests and should be run separately
    
    it('should return counts structure', async () => {
      const baseQuery = { status: 'Open' };
      const filters = {};
      
      const result = await jobFilterService.getFilterCounts(baseQuery, filters, 'jobs');
      
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('withFilters');
      expect(result).toHaveProperty('workType');
      expect(result).toHaveProperty('experienceLevel');
      expect(result).toHaveProperty('companySize');
      expect(result).toHaveProperty('datePosted');
    });
  });
});
