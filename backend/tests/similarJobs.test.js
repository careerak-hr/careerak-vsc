const similarJobsService = require('../src/services/similarJobsService');

describe('Similar Jobs Service', () => {
  describe('calculateSkillSimilarity', () => {
    test('should return 1 for identical skills', () => {
      const skills1 = ['JavaScript', 'React', 'Node.js'];
      const skills2 = ['JavaScript', 'React', 'Node.js'];
      const similarity = similarJobsService.calculateSkillSimilarity(skills1, skills2);
      expect(similarity).toBe(1);
    });

    test('should return 0 for completely different skills', () => {
      const skills1 = ['JavaScript', 'React'];
      const skills2 = ['Python', 'Django'];
      const similarity = similarJobsService.calculateSkillSimilarity(skills1, skills2);
      expect(similarity).toBe(0);
    });

    test('should calculate partial similarity correctly', () => {
      const skills1 = ['JavaScript', 'React', 'Node.js'];
      const skills2 = ['JavaScript', 'Python'];
      const similarity = similarJobsService.calculateSkillSimilarity(skills1, skills2);
      // Common: 1 (JavaScript), Total unique: 4
      expect(similarity).toBe(0.25);
    });

    test('should be case-insensitive', () => {
      const skills1 = ['javascript', 'REACT'];
      const skills2 = ['JavaScript', 'react'];
      const similarity = similarJobsService.calculateSkillSimilarity(skills1, skills2);
      expect(similarity).toBe(1);
    });

    test('should handle empty arrays', () => {
      const similarity = similarJobsService.calculateSkillSimilarity([], []);
      expect(similarity).toBe(0);
    });
  });

  describe('calculateLocationSimilarity', () => {
    test('should return 1 for same city', () => {
      const location1 = { city: 'Riyadh', country: 'Saudi Arabia' };
      const location2 = { city: 'Riyadh', country: 'Saudi Arabia' };
      const similarity = similarJobsService.calculateLocationSimilarity(location1, location2);
      expect(similarity).toBe(1);
    });

    test('should return 0.5 for same country, different city', () => {
      const location1 = { city: 'Riyadh', country: 'Saudi Arabia' };
      const location2 = { city: 'Jeddah', country: 'Saudi Arabia' };
      const similarity = similarJobsService.calculateLocationSimilarity(location1, location2);
      expect(similarity).toBe(0.5);
    });

    test('should return 0 for different countries', () => {
      const location1 = { city: 'Riyadh', country: 'Saudi Arabia' };
      const location2 = { city: 'Dubai', country: 'UAE' };
      const similarity = similarJobsService.calculateLocationSimilarity(location1, location2);
      expect(similarity).toBe(0);
    });

    test('should handle null locations', () => {
      const similarity = similarJobsService.calculateLocationSimilarity(null, null);
      expect(similarity).toBe(0);
    });
  });

  describe('calculateSalarySimilarity', () => {
    test('should return 1 for identical salaries', () => {
      const salary1 = { min: 5000, max: 6000 };
      const salary2 = { min: 5000, max: 6000 };
      const similarity = similarJobsService.calculateSalarySimilarity(salary1, salary2);
      expect(similarity).toBe(1);
    });

    test('should return high similarity for close salaries', () => {
      const salary1 = { min: 5000, max: 6000 };
      const salary2 = { min: 5200, max: 6200 };
      const similarity = similarJobsService.calculateSalarySimilarity(salary1, salary2);
      expect(similarity).toBeGreaterThan(0.9);
    });

    test('should return low similarity for very different salaries', () => {
      const salary1 = { min: 5000, max: 6000 };
      const salary2 = { min: 15000, max: 20000 };
      const similarity = similarJobsService.calculateSalarySimilarity(salary1, salary2);
      expect(similarity).toBeLessThan(0.5);
    });

    test('should handle missing salary objects', () => {
      const similarity = similarJobsService.calculateSalarySimilarity(null, { min: 5000, max: 6000 });
      expect(similarity).toBe(0);
    });

    test('should handle salary with only min', () => {
      const salary1 = { min: 5000 };
      const salary2 = { min: 5500 };
      const similarity = similarJobsService.calculateSalarySimilarity(salary1, salary2);
      expect(similarity).toBeGreaterThan(0.9);
    });
  });

  describe('calculateSimilarity', () => {
    test('should return 100 for identical jobs', () => {
      const job = {
        postingType: 'Permanent Job',
        skills: ['JavaScript', 'React'],
        location: { city: 'Riyadh', country: 'Saudi Arabia' },
        salary: { min: 5000, max: 6000 }
      };
      const similarity = similarJobsService.calculateSimilarity(job, job);
      expect(similarity).toBe(100);
    });

    test('should return 40 for same posting type only', () => {
      const job1 = {
        postingType: 'Permanent Job',
        skills: ['JavaScript'],
        location: { city: 'Riyadh', country: 'Saudi Arabia' },
        salary: { min: 5000, max: 6000 }
      };
      const job2 = {
        postingType: 'Permanent Job',
        skills: ['Python'],
        location: { city: 'Dubai', country: 'UAE' },
        salary: { min: 10000, max: 12000 }
      };
      const similarity = similarJobsService.calculateSimilarity(job1, job2);
      // PostingType: 40, Skills: 0, Location: 0, Salary: ~5
      expect(similarity).toBeGreaterThanOrEqual(40);
      expect(similarity).toBeLessThan(50);
    });

    test('should calculate weighted similarity correctly', () => {
      const job1 = {
        postingType: 'Permanent Job',
        skills: ['JavaScript', 'React'],
        location: { city: 'Riyadh', country: 'Saudi Arabia' },
        salary: { min: 5000, max: 6000 }
      };
      const job2 = {
        postingType: 'Permanent Job',
        skills: ['JavaScript', 'React'],
        location: { city: 'Riyadh', country: 'Saudi Arabia' },
        salary: { min: 5200, max: 6200 }
      };
      const similarity = similarJobsService.calculateSimilarity(job1, job2);
      // PostingType: 40, Skills: 30, Location: 15, Salary: ~14
      expect(similarity).toBeGreaterThan(95);
    });

    test('should return score >= 40 for relevant jobs', () => {
      const job1 = {
        postingType: 'Permanent Job',
        skills: ['JavaScript', 'React', 'Node.js'],
        location: { city: 'Riyadh', country: 'Saudi Arabia' },
        salary: { min: 5000, max: 6000 }
      };
      const job2 = {
        postingType: 'Permanent Job',
        skills: ['JavaScript', 'Vue.js'],
        location: { city: 'Jeddah', country: 'Saudi Arabia' },
        salary: { min: 5100, max: 6100 }
      };
      const similarity = similarJobsService.calculateSimilarity(job1, job2);
      expect(similarity).toBeGreaterThanOrEqual(40);
    });
  });
});
