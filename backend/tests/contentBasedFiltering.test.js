/**
 * 🧪 Content-Based Filtering Tests
 * اختبارات وحدة التصفية القائمة على المحتوى
 */

const ContentBasedFiltering = require('../src/services/contentBasedFiltering');

describe('ContentBasedFiltering Service', () => {
  let contentBasedFiltering;

  beforeAll(() => {
    contentBasedFiltering = new ContentBasedFiltering();
  });

  describe('Feature Extraction', () => {
    test('should extract user skills correctly', () => {
      const user = {
        computerSkills: [
          { skill: 'JavaScript', proficiency: 'advanced' },
          { skill: 'Python', proficiency: 'intermediate' }
        ],
        softwareSkills: [
          { software: 'Photoshop', proficiency: 'beginner' }
        ],
        otherSkills: ['Project Management', 'Team Leadership']
      };

      const features = contentBasedFiltering.extractUserSkills(user);
      
      expect(features).toHaveLength(5);
      expect(features[0]).toMatchObject({
        name: 'JavaScript',
        proficiency: 'advanced',
        category: 'computer'
      });
      // Check that Team Leadership skill exists (order doesn't matter)
      const teamLeadershipSkill = features.find(skill => skill.name === 'Team Leadership');
      expect(teamLeadershipSkill).toMatchObject({
        name: 'Team Leadership',
        proficiency: 'intermediate',
        category: 'other'
      });
    });

    test('should extract user experience correctly', () => {
      const user = {
        experienceList: [
          {
            company: 'Tech Corp',
            position: 'Senior Developer',
            from: new Date('2020-01-01'),
            to: new Date('2023-12-31')
          },
          {
            company: 'Startup Inc',
            position: 'Junior Developer',
            from: new Date('2018-06-01'),
            to: new Date('2019-12-31')
          }
        ]
      };

      const experience = contentBasedFiltering.extractUserExperience(user);
      
      expect(experience.totalYears).toBeGreaterThan(3);
      expect(experience.positions).toContain('Senior Developer');
      expect(experience.companies).toContain('Tech Corp');
    });

    test('should extract user education correctly', () => {
      const user = {
        educationList: [
          {
            degree: 'بكالوريوس',
            level: 'Computer Science',
            institution: 'University of Cairo'
          },
          {
            degree: 'ماجستير',
            level: 'Software Engineering',
            institution: 'University of Alexandria'
          }
        ]
      };

      const education = contentBasedFiltering.extractUserEducation(user);
      
      expect(education.highestDegree).toBe('ماجستير');
      expect(education.fields).toContain('Computer Science');
      expect(education.institutions).toContain('University of Cairo');
    });
  });

  describe('Similarity Calculation', () => {
    test('should calculate skills similarity correctly', () => {
      const userSkills = [
        { name: 'JavaScript', proficiency: 'advanced', category: 'programming' },
        { name: 'Python', proficiency: 'intermediate', category: 'programming' }
      ];

      const jobSkills = [
        { name: 'JavaScript', importance: 1.0, category: 'programming' },
        { name: 'React', importance: 0.8, category: 'frontend' }
      ];

      const similarity = contentBasedFiltering.calculateSkillsSimilarity(userSkills, jobSkills);
      
      // يجب أن يكون التشابه بين 0 و 1
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
      // يجب أن يكون هناك بعض التشابه بسبب JavaScript
      expect(similarity).toBeGreaterThan(0);
    });

    test('should calculate experience similarity correctly', () => {
      const userExperience = {
        totalYears: 5
      };

      const jobExperience = {
        minYears: 3,
        level: 'متقدم'
      };

      const similarity = contentBasedFiltering.calculateExperienceSimilarity(userExperience, jobExperience);
      
      // 5 سنوات مقابل 3 سنوات مطلوبة = 1.0 (كفاية أو أكثر)
      expect(similarity).toBe(1.0);
    });

    test('should calculate education similarity correctly', () => {
      const userEducation = {
        highestDegree: 'ماجستير'
      };

      const jobEducation = {
        requiredDegree: 'بكالوريوس'
      };

      const similarity = contentBasedFiltering.calculateEducationSimilarity(userEducation, jobEducation);
      
      // ماجستير مقابل بكالوريوس مطلوب = 1.0 (مؤهل أعلى)
      expect(similarity).toBe(1.0);
    });
  });

  describe('Overall Score Calculation', () => {
    test('should calculate overall score correctly with weights', () => {
      const scores = {
        skills: 0.8,
        experience: 0.9,
        education: 0.7,
        location: 0.6,
        salary: 0.5,
        jobType: 0.4
      };

      const overallScore = contentBasedFiltering.calculateOverallScore(scores);
      
      // الحساب: (0.8*0.35 + 0.9*0.25 + 0.7*0.15 + 0.6*0.10 + 0.5*0.10 + 0.4*0.05) / 1.0
      const expected = (0.8*0.35 + 0.9*0.25 + 0.7*0.15 + 0.6*0.10 + 0.5*0.10 + 0.4*0.05);
      
      expect(overallScore).toBeCloseTo(expected, 2);
      expect(overallScore).toBeGreaterThanOrEqual(0);
      expect(overallScore).toBeLessThanOrEqual(1);
    });

    test('should return 0 for empty scores', () => {
      const scores = {};
      const overallScore = contentBasedFiltering.calculateOverallScore(scores);
      
      expect(overallScore).toBe(0);
    });
  });

  describe('Job Ranking', () => {
    test('should rank jobs by match score', async () => {
      const user = {
        computerSkills: [{ skill: 'JavaScript', proficiency: 'advanced' }],
        experienceList: [{ from: new Date('2020-01-01'), to: new Date('2023-12-31') }],
        educationList: [{ degree: 'بكالوريوس' }],
        city: 'القاهرة',
        country: 'مصر'
      };

      const jobs = [
        {
          _id: '1',
          title: 'Frontend Developer',
          description: 'تطوير واجهات باستخدام JavaScript و React',
          requirements: 'خبرة 3 سنوات في JavaScript',
          location: 'القاهرة، مصر',
          salary: { min: 10000, max: 20000 },
          jobType: 'Full-time'
        },
        {
          _id: '2',
          title: 'Backend Developer',
          description: 'تطوير APIs باستخدام Python',
          requirements: 'خبرة 5 سنوات في Python',
          location: 'الإسكندرية، مصر',
          salary: { min: 15000, max: 25000 },
          jobType: 'Full-time'
        }
      ];

      const rankedJobs = await contentBasedFiltering.rankJobsByMatch(user, jobs);
      
      expect(rankedJobs).toHaveLength(2);
      expect(rankedJobs[0].matchScore.overall).toBeGreaterThanOrEqual(0);
      expect(rankedJobs[0].matchScore.overall).toBeLessThanOrEqual(1);
      expect(rankedJobs[0].matchScore.percentage).toBeGreaterThanOrEqual(0);
      expect(rankedJobs[0].matchScore.percentage).toBeLessThanOrEqual(100);
      
      // يجب أن تكون الوظائف مرتبة تنازلياً
      expect(rankedJobs[0].matchScore.overall).toBeGreaterThanOrEqual(rankedJobs[1].matchScore.overall);
    });

    test('should filter jobs by minimum score', async () => {
      const user = {
        computerSkills: [{ skill: 'JavaScript', proficiency: 'advanced' }],
        experienceList: [],
        educationList: [],
        city: 'القاهرة',
        country: 'مصر'
      };

      const jobs = [
        {
          _id: '1',
          title: 'JavaScript Developer',
          description: 'تطوير باستخدام JavaScript',
          requirements: 'خبرة في JavaScript',
          location: 'القاهرة',
          salary: null,
          jobType: 'Full-time'
        },
        {
          _id: '2',
          title: 'Python Developer',
          description: 'تطوير باستخدام Python',
          requirements: 'خبرة في Python',
          location: 'نيويورك',
          salary: null,
          jobType: 'Full-time'
        }
      ];

      const rankedJobs = await contentBasedFiltering.rankJobsByMatch(user, jobs, { minScore: 0.7 });
      
      // يجب أن يمرر فقط الوظائف ذات النسبة 0.7 أو أعلى
      rankedJobs.forEach(job => {
        expect(job.matchScore.overall).toBeGreaterThanOrEqual(0.7);
      });
    });
  });

  describe('Helper Methods', () => {
    test('should check if skills are similar', () => {
      expect(contentBasedFiltering.areSkillsSimilar('JavaScript', 'javascript')).toBe(true);
      expect(contentBasedFiltering.areSkillsSimilar('JavaScript', 'js')).toBe(true);
      expect(contentBasedFiltering.areSkillsSimilar('JavaScript', 'Python')).toBe(false);
    });

    test('should get proficiency score', () => {
      expect(contentBasedFiltering.getProficiencyScore('expert')).toBe(1.0);
      expect(contentBasedFiltering.getProficiencyScore('advanced')).toBe(0.8);
      expect(contentBasedFiltering.getProficiencyScore('intermediate')).toBe(0.6);
      expect(contentBasedFiltering.getProficiencyScore('beginner')).toBe(0.4);
      expect(contentBasedFiltering.getProficiencyScore('unknown')).toBe(0.5);
    });

    test('should get experience level', () => {
      expect(contentBasedFiltering.getExperienceLevel(12)).toBe('خبير');
      expect(contentBasedFiltering.getExperienceLevel(7)).toBe('متقدم');
      expect(contentBasedFiltering.getExperienceLevel(3)).toBe('متوسط');
      expect(contentBasedFiltering.getExperienceLevel(1.5)).toBe('مبتدئ');
      expect(contentBasedFiltering.getExperienceLevel(0.5)).toBe('لا خبرة');
      expect(contentBasedFiltering.getExperienceLevel(0)).toBe('لا خبرة');
    });
  });
});