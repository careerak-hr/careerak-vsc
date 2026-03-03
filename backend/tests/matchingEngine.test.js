const MatchingEngine = require('../src/services/matchingEngine');

describe('MatchingEngine', () => {
  let matchingEngine;

  beforeEach(() => {
    matchingEngine = new MatchingEngine();
  });

  describe('calculateSkillsMatch', () => {
    it('should return 100 when no skills required', () => {
      const result = matchingEngine.calculateSkillsMatch([], ['JavaScript', 'React']);
      expect(result).toBe(100);
    });

    it('should return 0 when user has no skills', () => {
      const result = matchingEngine.calculateSkillsMatch(['JavaScript', 'React'], []);
      expect(result).toBe(0);
    });

    it('should return 100 when all skills match', () => {
      const jobSkills = ['JavaScript', 'React', 'Node.js'];
      const userSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
      const result = matchingEngine.calculateSkillsMatch(jobSkills, userSkills);
      expect(result).toBe(100);
    });

    it('should return 50 when half skills match', () => {
      const jobSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
      const userSkills = ['JavaScript', 'React'];
      const result = matchingEngine.calculateSkillsMatch(jobSkills, userSkills);
      expect(result).toBe(50);
    });

    it('should be case insensitive', () => {
      const jobSkills = ['JavaScript', 'REACT'];
      const userSkills = ['javascript', 'react'];
      const result = matchingEngine.calculateSkillsMatch(jobSkills, userSkills);
      expect(result).toBe(100);
    });
  });

  describe('calculateExperienceMatch', () => {
    it('should return 100 when no experience required', () => {
      const result = matchingEngine.calculateExperienceMatch(null, 5);
      expect(result).toBe(100);
    });

    it('should return 50 when user experience is undefined', () => {
      const result = matchingEngine.calculateExperienceMatch('mid', undefined);
      expect(result).toBe(50);
    });

    it('should return 100 for entry level with 0-2 years', () => {
      expect(matchingEngine.calculateExperienceMatch('entry', 0)).toBe(100);
      expect(matchingEngine.calculateExperienceMatch('entry', 1)).toBe(100);
      expect(matchingEngine.calculateExperienceMatch('entry', 2)).toBe(100);
    });

    it('should return 100 for mid level with 3-5 years', () => {
      expect(matchingEngine.calculateExperienceMatch('mid', 3)).toBe(100);
      expect(matchingEngine.calculateExperienceMatch('mid', 4)).toBe(100);
      expect(matchingEngine.calculateExperienceMatch('mid', 5)).toBe(100);
    });

    it('should return 70 for close experience (within 2 years)', () => {
      const result = matchingEngine.calculateExperienceMatch('mid', 2); // mid needs 3-5
      expect(result).toBe(70);
    });

    it('should return 40 for somewhat close experience (within 3-4 years)', () => {
      const result = matchingEngine.calculateExperienceMatch('senior', 1); // senior needs 5-10, distance is 4
      expect(result).toBe(40);
    });
  });

  describe('calculateEducationMatch', () => {
    it('should return 100 when no education required', () => {
      const result = matchingEngine.calculateEducationMatch(null, 'bachelor');
      expect(result).toBe(100);
    });

    it('should return 50 when user education is undefined', () => {
      const result = matchingEngine.calculateEducationMatch('bachelor', undefined);
      expect(result).toBe(50);
    });

    it('should return 100 when user has same or higher education', () => {
      expect(matchingEngine.calculateEducationMatch('bachelor', 'bachelor')).toBe(100);
      expect(matchingEngine.calculateEducationMatch('bachelor', 'master')).toBe(100);
      expect(matchingEngine.calculateEducationMatch('bachelor', 'phd')).toBe(100);
    });

    it('should return 70 when user is one level below', () => {
      const result = matchingEngine.calculateEducationMatch('bachelor', 'diploma');
      expect(result).toBe(70);
    });

    it('should return 40 when user is two levels below', () => {
      const result = matchingEngine.calculateEducationMatch('bachelor', 'high_school');
      expect(result).toBe(40);
    });
  });

  describe('calculateLocationMatch', () => {
    it('should return 50 when location is missing', () => {
      expect(matchingEngine.calculateLocationMatch(null, { city: 'Cairo' })).toBe(50);
      expect(matchingEngine.calculateLocationMatch({ city: 'Cairo' }, null)).toBe(50);
    });

    it('should return 100 for same city', () => {
      const jobLocation = { city: 'Cairo', country: 'Egypt' };
      const userLocation = { city: 'Cairo', country: 'Egypt' };
      const result = matchingEngine.calculateLocationMatch(jobLocation, userLocation);
      expect(result).toBe(100);
    });

    it('should return 70 for same country, different city', () => {
      const jobLocation = { city: 'Cairo', country: 'Egypt' };
      const userLocation = { city: 'Alexandria', country: 'Egypt' };
      const result = matchingEngine.calculateLocationMatch(jobLocation, userLocation);
      expect(result).toBe(70);
    });

    it('should return 100 for remote jobs', () => {
      const jobLocation = { remote: true };
      const userLocation = { city: 'Cairo', country: 'Egypt' };
      const result = matchingEngine.calculateLocationMatch(jobLocation, userLocation);
      expect(result).toBe(100);
    });

    it('should be case insensitive', () => {
      const jobLocation = { city: 'CAIRO', country: 'EGYPT' };
      const userLocation = { city: 'cairo', country: 'egypt' };
      const result = matchingEngine.calculateLocationMatch(jobLocation, userLocation);
      expect(result).toBe(100);
    });
  });

  describe('calculateSalaryMatch', () => {
    it('should return 50 when salary is missing', () => {
      expect(matchingEngine.calculateSalaryMatch(null, 5000)).toBe(50);
      expect(matchingEngine.calculateSalaryMatch({ min: 5000, max: 8000 }, null)).toBe(50);
    });

    it('should return 100 when expected salary is within range', () => {
      const jobSalary = { min: 5000, max: 8000 };
      expect(matchingEngine.calculateSalaryMatch(jobSalary, 5000)).toBe(100);
      expect(matchingEngine.calculateSalaryMatch(jobSalary, 6500)).toBe(100);
      expect(matchingEngine.calculateSalaryMatch(jobSalary, 8000)).toBe(100);
    });

    it('should return high score when expected salary is below range', () => {
      const jobSalary = { min: 5000, max: 8000 };
      const result = matchingEngine.calculateSalaryMatch(jobSalary, 4500); // 10% below
      expect(result).toBeGreaterThanOrEqual(80);
    });

    it('should return lower score when expected salary is above range', () => {
      const jobSalary = { min: 5000, max: 8000 };
      const result = matchingEngine.calculateSalaryMatch(jobSalary, 9000); // 12.5% above
      expect(result).toBeLessThan(70);
    });
  });

  describe('calculateWorkTypeMatch', () => {
    it('should return 100 when no work type required', () => {
      const result = matchingEngine.calculateWorkTypeMatch(null, ['full-time']);
      expect(result).toBe(100);
    });

    it('should return 50 when user has no preferences', () => {
      const result = matchingEngine.calculateWorkTypeMatch('full-time', []);
      expect(result).toBe(50);
    });

    it('should return 100 when work type matches', () => {
      const result = matchingEngine.calculateWorkTypeMatch('full-time', ['full-time', 'remote']);
      expect(result).toBe(100);
    });

    it('should return 30 when work type does not match', () => {
      const result = matchingEngine.calculateWorkTypeMatch('full-time', ['part-time', 'remote']);
      expect(result).toBe(30);
    });

    it('should be case insensitive', () => {
      const result = matchingEngine.calculateWorkTypeMatch('FULL-TIME', ['full-time']);
      expect(result).toBe(100);
    });
  });

  describe('calculateMatchPercentage', () => {
    it('should calculate overall match score', () => {
      const job = {
        skills: ['JavaScript', 'React'],
        experienceLevel: 'mid',
        educationLevel: 'bachelor',
        location: { city: 'Cairo', country: 'Egypt' },
        salary: { min: 5000, max: 8000 },
        workType: 'full-time'
      };

      const userProfile = {
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: 4,
        education: 'bachelor',
        location: { city: 'Cairo', country: 'Egypt' },
        expectedSalary: 6000,
        preferredWorkType: ['full-time']
      };

      const result = matchingEngine.calculateMatchPercentage(job, userProfile);

      expect(result).toHaveProperty('matchScore');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('details');
      expect(result.matchScore).toBeGreaterThan(80); // Should be high match
      expect(result.breakdown.skills).toBe(100);
      expect(result.breakdown.experience).toBe(100);
      expect(result.breakdown.education).toBe(100);
      expect(result.breakdown.location).toBe(100);
      expect(result.breakdown.workType).toBe(100);
    });

    it('should return lower score for poor match', () => {
      const job = {
        skills: ['Python', 'Django', 'PostgreSQL'],
        experienceLevel: 'senior',
        educationLevel: 'master',
        location: { city: 'New York', country: 'USA' },
        salary: { min: 10000, max: 15000 },
        workType: 'full-time'
      };

      const userProfile = {
        skills: ['JavaScript', 'React'],
        experience: 2,
        education: 'bachelor',
        location: { city: 'Cairo', country: 'Egypt' },
        expectedSalary: 5000,
        preferredWorkType: ['remote']
      };

      const result = matchingEngine.calculateMatchPercentage(job, userProfile);

      expect(result.matchScore).toBeLessThan(50); // Should be low match
    });
  });

  describe('rankByMatch', () => {
    it('should sort jobs by match score descending', () => {
      const jobs = [
        {
          _id: '1',
          title: 'Job 1',
          skills: ['JavaScript'],
          experienceLevel: 'entry',
          toObject: function() { return { ...this }; }
        },
        {
          _id: '2',
          title: 'Job 2',
          skills: ['JavaScript', 'React', 'Node.js'],
          experienceLevel: 'mid',
          toObject: function() { return { ...this }; }
        },
        {
          _id: '3',
          title: 'Job 3',
          skills: ['Python'],
          experienceLevel: 'senior',
          toObject: function() { return { ...this }; }
        }
      ];

      const userProfile = {
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: 4
      };

      const ranked = matchingEngine.rankByMatch(jobs, userProfile);

      expect(ranked).toHaveLength(3);
      expect(ranked[0].matchScore).toBeGreaterThan(ranked[1].matchScore);
      expect(ranked[1].matchScore).toBeGreaterThan(ranked[2].matchScore);
      expect(ranked[0]._id).toBe('2'); // Job 2 should be first (best match)
    });

    it('should add match score and details to each job', () => {
      const jobs = [
        {
          _id: '1',
          title: 'Job 1',
          skills: ['JavaScript', 'React'],
          toObject: function() { return { ...this }; }
        }
      ];

      const userProfile = {
        skills: ['JavaScript', 'React']
      };

      const ranked = matchingEngine.rankByMatch(jobs, userProfile);

      expect(ranked[0]).toHaveProperty('matchScore');
      expect(ranked[0]).toHaveProperty('matchBreakdown');
      expect(ranked[0]).toHaveProperty('matchDetails');
      expect(Array.isArray(ranked[0].matchDetails)).toBe(true);
    });
  });

  describe('updateWeights', () => {
    it('should update weights successfully', () => {
      const newWeights = {
        skills: 40,
        experience: 30,
        education: 10,
        location: 10,
        salary: 5,
        workType: 5
      };

      matchingEngine.updateWeights(newWeights);
      const weights = matchingEngine.getWeights();

      expect(weights.skills).toBe(40);
      expect(weights.experience).toBe(30);
    });

    it('should throw error if weights do not sum to 100', () => {
      const invalidWeights = {
        skills: 50,
        experience: 30,
        education: 10,
        location: 10,
        salary: 5,
        workType: 5
      };

      expect(() => {
        matchingEngine.updateWeights(invalidWeights);
      }).toThrow('مجموع الأوزان يجب أن يساوي 100');
    });
  });

  describe('generateMatchDetails', () => {
    it('should generate details for high match', () => {
      const breakdown = {
        skills: 90,
        experience: 85,
        education: 80,
        location: 95,
        salary: 90,
        workType: 100
      };

      const details = matchingEngine.generateMatchDetails(breakdown);

      expect(Array.isArray(details)).toBe(true);
      expect(details.length).toBeGreaterThan(0);
      expect(details.some(d => d.includes('مهارات'))).toBe(true);
    });

    it('should generate appropriate details for medium match', () => {
      const breakdown = {
        skills: 65,
        experience: 60,
        education: 50,
        location: 40,
        salary: 55,
        workType: 30
      };

      const details = matchingEngine.generateMatchDetails(breakdown);

      expect(Array.isArray(details)).toBe(true);
      // Should have some details but not all
      expect(details.length).toBeLessThan(6);
    });
  });
});
