/**
 * Acceptance Probability Service Tests
 * 
 * اختبارات خدمة احتمالية القبول
 */

const AcceptanceProbabilityService = require('../src/services/acceptanceProbabilityService');

describe('AcceptanceProbabilityService', () => {
  let service;

  beforeEach(() => {
    service = new AcceptanceProbabilityService();
  });

  describe('calculateAcceptanceProbability', () => {
    it('should calculate high probability for perfect match', async () => {
      const user = {
        skills: [
          { name: 'JavaScript', proficiency: 'expert' },
          { name: 'React', proficiency: 'expert' },
          { name: 'Node.js', proficiency: 'expert' }
        ],
        experience: [
          { title: 'Senior Developer', years: 5 }
        ],
        education: [
          { degree: 'Bachelor', field: 'Computer Science', level: 'bachelor' }
        ],
        location: { city: 'Riyadh', country: 'Saudi Arabia' },
        preferences: {
          salary: { min: 8000, max: 15000 },
          jobType: ['full-time']
        }
      };

      const job = {
        title: 'Senior React Developer',
        requiredSkills: ['JavaScript', 'React', 'Node.js'],
        preferredSkills: [],
        experienceRequired: '5 سنوات',
        experienceLevel: 'senior',
        educationRequired: 'bachelor',
        location: 'Riyadh, Saudi Arabia',
        salary: 12000,
        type: 'full-time',
        applicantCount: 5
      };

      const result = await service.calculateAcceptanceProbability(user, job);

      expect(result.probability).toBeGreaterThanOrEqual(70);
      expect(result.level).toBe('high');
      expect(result.factors).toBeInstanceOf(Array);
      expect(result.factors.length).toBeGreaterThan(0);
    });

    it('should calculate medium probability for partial match', async () => {
      const user = {
        skills: [
          { name: 'JavaScript', proficiency: 'intermediate' },
          { name: 'React', proficiency: 'beginner' }
        ],
        experience: [
          { title: 'Junior Developer', years: 2 }
        ],
        education: [
          { degree: 'Bachelor', field: 'Computer Science', level: 'bachelor' }
        ],
        location: { city: 'Jeddah', country: 'Saudi Arabia' },
        preferences: {
          salary: { min: 5000, max: 8000 },
          jobType: ['full-time']
        }
      };

      const job = {
        title: 'Senior React Developer',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        preferredSkills: ['GraphQL'],
        experienceRequired: '5 سنوات',
        experienceLevel: 'senior',
        educationRequired: 'bachelor',
        location: 'Riyadh, Saudi Arabia',
        salary: 12000,
        type: 'full-time',
        applicantCount: 50
      };

      const result = await service.calculateAcceptanceProbability(user, job);

      expect(result.probability).toBeGreaterThanOrEqual(40);
      expect(result.probability).toBeLessThan(70);
      expect(result.level).toBe('medium');
    });

    it('should calculate low probability for poor match', async () => {
      const user = {
        skills: [
          { name: 'Python', proficiency: 'beginner' },
          { name: 'Django', proficiency: 'beginner' }
        ],
        experience: [
          { title: 'Intern', years: 0.5 }
        ],
        education: [
          { degree: 'High School', level: 'high_school' }
        ],
        location: { city: 'Dammam', country: 'Saudi Arabia' },
        preferences: {
          salary: { min: 3000, max: 5000 },
          jobType: ['part-time']
        }
      };

      const job = {
        title: 'Senior React Developer',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        preferredSkills: ['GraphQL', 'AWS'],
        experienceRequired: '5 سنوات',
        experienceLevel: 'senior',
        educationRequired: 'bachelor',
        location: 'Riyadh, Saudi Arabia',
        salary: 12000,
        type: 'full-time',
        applicantCount: 100
      };

      const result = await service.calculateAcceptanceProbability(user, job);

      expect(result.probability).toBeLessThan(40);
      expect(result.level).toBe('low');
    });
  });

  describe('calculateCompetitionFactor', () => {
    it('should return 1.0 for no applicants', () => {
      const job = { applicantCount: 0 };
      const factor = service.calculateCompetitionFactor(job);
      expect(factor).toBe(1.0);
    });

    it('should return 0.9 for few applicants', () => {
      const job = { applicantCount: 5 };
      const factor = service.calculateCompetitionFactor(job);
      expect(factor).toBe(0.9);
    });

    it('should return 0.3 for many applicants', () => {
      const job = { applicantCount: 150 };
      const factor = service.calculateCompetitionFactor(job);
      expect(factor).toBe(0.3);
    });
  });

  describe('calculateExperienceFactor', () => {
    it('should return 1.0 when experience exceeds requirement', () => {
      const user = {
        experience: [
          { years: 6 }
        ]
      };
      const job = {
        experienceRequired: '3 سنوات'
      };
      const factor = service.calculateExperienceFactor(user, job);
      expect(factor).toBe(1.0);
    });

    it('should return 0.9 when experience matches requirement', () => {
      const user = {
        experience: [
          { years: 3 }
        ]
      };
      const job = {
        experienceRequired: '3 سنوات'
      };
      const factor = service.calculateExperienceFactor(user, job);
      expect(factor).toBe(0.9);
    });

    it('should return lower value when experience is less', () => {
      const user = {
        experience: [
          { years: 1 }
        ]
      };
      const job = {
        experienceRequired: '5 سنوات'
      };
      const factor = service.calculateExperienceFactor(user, job);
      expect(factor).toBeLessThan(0.5);
    });
  });

  describe('calculateSkillsFactor', () => {
    it('should return 1.0 when all required skills are present', () => {
      const user = {
        skills: [
          { name: 'JavaScript', proficiency: 'expert' },
          { name: 'React', proficiency: 'expert' },
          { name: 'Node.js', proficiency: 'expert' }
        ]
      };
      const job = {
        requiredSkills: ['JavaScript', 'React', 'Node.js'],
        preferredSkills: []
      };
      const factor = service.calculateSkillsFactor(user, job);
      expect(factor).toBeGreaterThanOrEqual(0.8);
    });

    it('should return lower value when some skills are missing', () => {
      const user = {
        skills: [
          { name: 'JavaScript', proficiency: 'intermediate' }
        ]
      };
      const job = {
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        preferredSkills: []
      };
      const factor = service.calculateSkillsFactor(user, job);
      expect(factor).toBeLessThan(0.5);
    });
  });

  describe('getProbabilityLevel', () => {
    it('should return "high" for probability >= 70', () => {
      expect(service.getProbabilityLevel(75)).toBe('high');
      expect(service.getProbabilityLevel(90)).toBe('high');
    });

    it('should return "medium" for probability 40-70', () => {
      expect(service.getProbabilityLevel(50)).toBe('medium');
      expect(service.getProbabilityLevel(65)).toBe('medium');
    });

    it('should return "low" for probability < 40', () => {
      expect(service.getProbabilityLevel(30)).toBe('low');
      expect(service.getProbabilityLevel(10)).toBe('low');
    });
  });

  describe('generateFactors', () => {
    it('should generate positive factors for high match', () => {
      const data = {
        matchScore: 85,
        skillsFactor: 0.9,
        experienceFactor: 0.95,
        competitionFactor: 0.9,
        educationFactor: 1.0,
        level: 'high'
      };
      const factors = service.generateFactors(data);
      
      expect(factors).toBeInstanceOf(Array);
      expect(factors.length).toBeGreaterThan(0);
      expect(factors.length).toBeLessThanOrEqual(4);
      expect(factors.some(f => f.includes('تطابق'))).toBe(true);
    });

    it('should generate improvement suggestions for low match', () => {
      const data = {
        matchScore: 30,
        skillsFactor: 0.3,
        experienceFactor: 0.4,
        competitionFactor: 0.3,
        educationFactor: 0.4,
        level: 'low'
      };
      const factors = service.generateFactors(data);
      
      expect(factors).toBeInstanceOf(Array);
      expect(factors.some(f => f.includes('ينقصك') || f.includes('أقل'))).toBe(true);
    });
  });

  describe('calculateBulkProbabilities', () => {
    it('should calculate probabilities for multiple jobs', async () => {
      const user = {
        skills: [
          { name: 'JavaScript', proficiency: 'expert' }
        ],
        experience: [
          { years: 3 }
        ],
        education: [
          { level: 'bachelor' }
        ],
        location: { city: 'Riyadh' },
        preferences: { salary: { min: 5000 }, jobType: ['full-time'] }
      };

      const jobs = [
        {
          _id: 'job1',
          title: 'Developer 1',
          requiredSkills: ['JavaScript'],
          experienceRequired: '3 سنوات',
          applicantCount: 10
        },
        {
          _id: 'job2',
          title: 'Developer 2',
          requiredSkills: ['JavaScript', 'React'],
          experienceRequired: '5 سنوات',
          applicantCount: 50
        }
      ];

      const results = await service.calculateBulkProbabilities(user, jobs);

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(2);
      expect(results[0].jobId).toBe('job1');
      expect(results[1].jobId).toBe('job2');
      expect(results[0].probability).toBeDefined();
      expect(results[1].probability).toBeDefined();
    });
  });
});
