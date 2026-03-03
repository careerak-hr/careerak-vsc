import {
  serializeFiltersToURL,
  deserializeFiltersFromURL,
  createShareableLink,
  areFiltersEqual
} from '../filterUrlSerializer';

describe('Filter URL Serialization', () => {
  
  describe('serializeFiltersToURL', () => {
    
    it('should serialize simple string filters', () => {
      const filters = {
        q: 'developer',
        location: 'Cairo'
      };
      
      const result = serializeFiltersToURL(filters);
      
      expect(result).toContain('q=developer');
      expect(result).toContain('location=Cairo');
    });

    it('should serialize number filters', () => {
      const filters = {
        salaryMin: 5000,
        salaryMax: 10000
      };
      
      const result = serializeFiltersToURL(filters);
      
      expect(result).toContain('salaryMin=5000');
      expect(result).toContain('salaryMax=10000');
    });

    it('should serialize array filters', () => {
      const filters = {
        workType: ['remote', 'hybrid'],
        skills: ['JavaScript', 'React']
      };
      
      const result = serializeFiltersToURL(filters);
      
      expect(result).toContain('workType=remote%2Chybrid');
      expect(result).toContain('skills=JavaScript%2CReact');
    });

    it('should serialize nested object filters', () => {
      const filters = {
        salary: {
          min: 5000,
          max: 10000
        }
      };
      
      const result = serializeFiltersToURL(filters);
      
      expect(result).toContain('salary.min=5000');
      expect(result).toContain('salary.max=10000');
    });

    it('should skip null, undefined, and empty values', () => {
      const filters = {
        q: 'developer',
        location: null,
        workType: undefined,
        skills: '',
        experienceLevel: []
      };
      
      const result = serializeFiltersToURL(filters);
      
      expect(result).toBe('q=developer');
    });

    it('should handle empty filters object', () => {
      const result = serializeFiltersToURL({});
      expect(result).toBe('');
    });

    it('should handle null input', () => {
      const result = serializeFiltersToURL(null);
      expect(result).toBe('');
    });

    it('should handle complex mixed filters', () => {
      const filters = {
        q: 'developer',
        location: 'Cairo',
        salary: {
          min: 5000,
          max: 10000
        },
        workType: ['remote', 'hybrid'],
        experienceLevel: ['mid', 'senior'],
        datePosted: 'week'
      };
      
      const result = serializeFiltersToURL(filters);
      
      expect(result).toContain('q=developer');
      expect(result).toContain('location=Cairo');
      expect(result).toContain('salary.min=5000');
      expect(result).toContain('salary.max=10000');
      expect(result).toContain('workType=remote%2Chybrid');
      expect(result).toContain('experienceLevel=mid%2Csenior');
      expect(result).toContain('datePosted=week');
    });
  });

  describe('deserializeFiltersFromURL', () => {
    
    it('should deserialize simple string filters', () => {
      const queryString = 'q=developer&location=Cairo';
      
      const result = deserializeFiltersFromURL(queryString);
      
      expect(result).toEqual({
        q: 'developer',
        location: 'Cairo'
      });
    });

    it('should deserialize number filters', () => {
      const queryString = 'salaryMin=5000&salaryMax=10000';
      
      const result = deserializeFiltersFromURL(queryString);
      
      expect(result).toEqual({
        salaryMin: 5000,
        salaryMax: 10000
      });
    });

    it('should deserialize array filters', () => {
      const queryString = 'workType=remote,hybrid&skills=JavaScript,React';
      
      const result = deserializeFiltersFromURL(queryString);
      
      expect(result).toEqual({
        workType: ['remote', 'hybrid'],
        skills: ['JavaScript', 'React']
      });
    });

    it('should deserialize nested object filters', () => {
      const queryString = 'salary.min=5000&salary.max=10000';
      
      const result = deserializeFiltersFromURL(queryString);
      
      expect(result).toEqual({
        salary: {
          min: 5000,
          max: 10000
        }
      });
    });

    it('should handle query string with leading question mark', () => {
      const queryString = '?q=developer&location=Cairo';
      
      const result = deserializeFiltersFromURL(queryString);
      
      expect(result).toEqual({
        q: 'developer',
        location: 'Cairo'
      });
    });

    it('should handle empty query string', () => {
      const result = deserializeFiltersFromURL('');
      expect(result).toEqual({});
    });

    it('should handle null input', () => {
      const result = deserializeFiltersFromURL(null);
      expect(result).toEqual({});
    });

    it('should handle URL-encoded values', () => {
      const queryString = 'q=senior%20developer&location=New%20York';
      
      const result = deserializeFiltersFromURL(queryString);
      
      expect(result).toEqual({
        q: 'senior developer',
        location: 'New York'
      });
    });

    it('should handle complex mixed filters', () => {
      const queryString = 'q=developer&location=Cairo&salary.min=5000&salary.max=10000&workType=remote,hybrid&experienceLevel=mid,senior&datePosted=week';
      
      const result = deserializeFiltersFromURL(queryString);
      
      expect(result).toEqual({
        q: 'developer',
        location: 'Cairo',
        salary: {
          min: 5000,
          max: 10000
        },
        workType: ['remote', 'hybrid'],
        experienceLevel: ['mid', 'senior'],
        datePosted: 'week'
      });
    });
  });

  describe('Round-trip (serialize → deserialize)', () => {
    
    it('should maintain filter integrity through round-trip', () => {
      const originalFilters = {
        q: 'developer',
        location: 'Cairo',
        salary: {
          min: 5000,
          max: 10000
        },
        workType: ['remote', 'hybrid'],
        experienceLevel: ['mid', 'senior'],
        datePosted: 'week'
      };
      
      const serialized = serializeFiltersToURL(originalFilters);
      const deserialized = deserializeFiltersFromURL(serialized);
      
      expect(deserialized).toEqual(originalFilters);
    });

    it('should handle multiple round-trips', () => {
      const originalFilters = {
        q: 'developer',
        workType: ['remote'],
        salary: { min: 5000 }
      };
      
      // Round-trip 1
      let serialized = serializeFiltersToURL(originalFilters);
      let deserialized = deserializeFiltersFromURL(serialized);
      expect(deserialized).toEqual(originalFilters);
      
      // Round-trip 2
      serialized = serializeFiltersToURL(deserialized);
      deserialized = deserializeFiltersFromURL(serialized);
      expect(deserialized).toEqual(originalFilters);
      
      // Round-trip 3
      serialized = serializeFiltersToURL(deserialized);
      deserialized = deserializeFiltersFromURL(serialized);
      expect(deserialized).toEqual(originalFilters);
    });

    it('should handle edge cases in round-trip', () => {
      const edgeCases = [
        { q: 'test with spaces' },
        { skills: ['C++', 'C#', '.NET'] },
        { salary: { min: 0, max: 999999 } },
        { workType: ['remote'] },
        { datePosted: 'today' }
      ];
      
      edgeCases.forEach(filters => {
        const serialized = serializeFiltersToURL(filters);
        const deserialized = deserializeFiltersFromURL(serialized);
        expect(deserialized).toEqual(filters);
      });
    });
  });

  describe('createShareableLink', () => {
    
    it('should create a full URL with filters', () => {
      // Mock window.location
      delete window.location;
      window.location = {
        origin: 'https://careerak.com',
        pathname: '/job-postings'
      };
      
      const filters = {
        q: 'developer',
        location: 'Cairo'
      };
      
      const result = createShareableLink(filters);
      
      expect(result).toContain('https://careerak.com/job-postings');
      expect(result).toContain('q=developer');
      expect(result).toContain('location=Cairo');
    });

    it('should handle custom base path', () => {
      delete window.location;
      window.location = {
        origin: 'https://careerak.com',
        pathname: '/current-page'
      };
      
      const filters = { q: 'test' };
      const result = createShareableLink(filters, '/custom-path');
      
      expect(result).toContain('https://careerak.com/custom-path');
      expect(result).toContain('q=test');
    });

    it('should return base URL when no filters', () => {
      delete window.location;
      window.location = {
        origin: 'https://careerak.com',
        pathname: '/job-postings'
      };
      
      const result = createShareableLink({});
      
      expect(result).toBe('https://careerak.com/job-postings');
    });
  });

  describe('areFiltersEqual', () => {
    
    it('should return true for identical filters', () => {
      const filters1 = {
        q: 'developer',
        location: 'Cairo',
        workType: ['remote']
      };
      
      const filters2 = {
        q: 'developer',
        location: 'Cairo',
        workType: ['remote']
      };
      
      expect(areFiltersEqual(filters1, filters2)).toBe(true);
    });

    it('should return false for different filters', () => {
      const filters1 = {
        q: 'developer',
        location: 'Cairo'
      };
      
      const filters2 = {
        q: 'designer',
        location: 'Cairo'
      };
      
      expect(areFiltersEqual(filters1, filters2)).toBe(false);
    });

    it('should ignore order of properties', () => {
      const filters1 = {
        q: 'developer',
        location: 'Cairo'
      };
      
      const filters2 = {
        location: 'Cairo',
        q: 'developer'
      };
      
      expect(areFiltersEqual(filters1, filters2)).toBe(true);
    });

    it('should handle empty filters', () => {
      expect(areFiltersEqual({}, {})).toBe(true);
      expect(areFiltersEqual({ q: 'test' }, {})).toBe(false);
    });
  });
});
