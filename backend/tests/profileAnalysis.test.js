/**
 * Profile Analysis Service Tests
 * اختبارات خدمة تحليل الملف الشخصي
 */

const {
  calculateCompletenessScore,
  analyzeStrengths,
  analyzeWeaknesses,
  generateSuggestions
} = require('../src/services/profileAnalysisService');

describe('Profile Analysis Service', () => {
  
  describe('calculateCompletenessScore', () => {
    test('should return 0% for empty profile', () => {
      const user = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        educationList: [],
        experienceList: [],
        computerSkills: [],
        softwareSkills: [],
        languages: [],
        trainingList: []
      };

      const result = calculateCompletenessScore(user);
      expect(result.score).toBeLessThan(20);
      expect(result.level).toBe('very_poor');
    });

    test('should return 100% for complete profile', () => {
      const user = {
        firstName: 'أحمد',
        lastName: 'محمد',
        email: 'ahmad@example.com',
        phone: '+201234567890',
        country: 'مصر',
        city: 'القاهرة',
        gender: 'male',
        birthDate: new Date('1990-01-01'),
        educationList: [{ degree: 'بكالوريوس', institution: 'جامعة القاهرة' }],
        experienceList: [{ company: 'شركة ABC', position: 'مطور' }],
        computerSkills: [{ skill: 'JavaScript', proficiency: 'advanced' }],
        softwareSkills: [{ software: 'VS Code', proficiency: 'expert' }],
        languages: [{ language: 'العربية', proficiency: 'native' }],
        otherSkills: ['التواصل'],
        trainingList: [{ courseName: 'React', provider: 'Udemy' }],
        specialization: 'تطوير الويب',
        interests: ['البرمجة', 'التصميم'],
        bio: 'مطور ويب متخصص في React و Node.js',
        cvFile: 'cv.pdf',
        profileImage: 'profile.jpg'
      };

      const result = calculateCompletenessScore(user);
      expect(result.score).toBeGreaterThan(90);
      expect(result.level).toBe('excellent');
    });

    test('should calculate correct category scores', () => {
      const user = {
        firstName: 'أحمد',
        lastName: 'محمد',
        email: 'ahmad@example.com',
        phone: '+201234567890',
        country: 'مصر',
        city: 'القاهرة',
        gender: 'male',
        birthDate: new Date('1990-01-01'),
        educationList: [],
        experienceList: [],
        computerSkills: [],
        softwareSkills: [],
        languages: [],
        trainingList: []
      };

      const result = calculateCompletenessScore(user);
      
      // Basic info should be high (7 out of 8 fields filled = 87.5%)
      expect(result.details.basic.percentage).toBeGreaterThan(80);
      
      // Education should be 0% (empty array)
      expect(result.details.education.percentage).toBe(0);
    });
  });

  describe('analyzeStrengths', () => {
    test('should identify extensive experience', () => {
      const user = {
        experienceList: [
          { company: 'A', position: 'Dev' },
          { company: 'B', position: 'Dev' },
          { company: 'C', position: 'Dev' }
        ]
      };

      const strengths = analyzeStrengths(user);
      const experienceStrength = strengths.find(s => s.category === 'experience');
      
      expect(experienceStrength).toBeDefined();
      expect(experienceStrength.impact).toBe('high');
    });

    test('should identify diverse skills', () => {
      const user = {
        computerSkills: [
          { skill: 'JS' },
          { skill: 'Python' },
          { skill: 'Java' }
        ],
        softwareSkills: [
          { software: 'VS Code' },
          { software: 'Git' }
        ],
        otherSkills: ['Communication']
      };

      const strengths = analyzeStrengths(user);
      const skillsStrength = strengths.find(s => s.category === 'skills');
      
      expect(skillsStrength).toBeDefined();
      expect(skillsStrength.title).toContain('مهارات متنوعة');
    });

    test('should identify multilingual ability', () => {
      const user = {
        languages: [
          { language: 'العربية', proficiency: 'native' },
          { language: 'English', proficiency: 'advanced' }
        ]
      };

      const strengths = analyzeStrengths(user);
      const languageStrength = strengths.find(s => s.category === 'languages');
      
      expect(languageStrength).toBeDefined();
      expect(languageStrength.impact).toBe('medium');
    });
  });

  describe('analyzeWeaknesses', () => {
    test('should identify missing basic info', () => {
      const user = {
        firstName: 'أحمد',
        lastName: '',
        email: '',
        phone: '+201234567890'
      };

      const completenessScore = calculateCompletenessScore(user);
      const weaknesses = analyzeWeaknesses(user, completenessScore);
      
      const basicWeakness = weaknesses.find(w => w.category === 'basic');
      expect(basicWeakness).toBeDefined();
      expect(basicWeakness.impact).toBe('high');
    });

    test('should identify missing experience', () => {
      const user = {
        experienceList: []
      };

      const completenessScore = calculateCompletenessScore(user);
      const weaknesses = analyzeWeaknesses(user, completenessScore);
      
      const expWeakness = weaknesses.find(w => w.category === 'experience');
      expect(expWeakness).toBeDefined();
      expect(expWeakness.title).toContain('لا توجد خبرة');
    });

    test('should identify missing CV', () => {
      const user = {
        cvFile: null
      };

      const completenessScore = calculateCompletenessScore(user);
      const weaknesses = analyzeWeaknesses(user, completenessScore);
      
      const cvWeakness = weaknesses.find(w => w.category === 'cv');
      expect(cvWeakness).toBeDefined();
      expect(cvWeakness.impact).toBe('medium');
    });
  });

  describe('generateSuggestions', () => {
    test('should generate suggestions based on weaknesses', () => {
      const user = {
        firstName: 'أحمد',
        lastName: 'محمد',
        experienceList: [],
        educationList: [],
        computerSkills: []
      };

      const completenessScore = calculateCompletenessScore(user);
      const weaknesses = analyzeWeaknesses(user, completenessScore);
      const suggestions = generateSuggestions(user, completenessScore, weaknesses);
      
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Should have high priority suggestions first
      expect(suggestions[0].priority).toBe('high');
    });

    test('should suggest adding specialization', () => {
      const user = {
        firstName: 'أحمد',
        lastName: 'محمد',
        specialization: null
      };

      const completenessScore = calculateCompletenessScore(user);
      const weaknesses = analyzeWeaknesses(user, completenessScore);
      const suggestions = generateSuggestions(user, completenessScore, weaknesses);
      
      const specSuggestion = suggestions.find(s => s.category === 'specialization');
      expect(specSuggestion).toBeDefined();
      expect(specSuggestion.priority).toBe('medium');
    });

    test('should suggest adding bio', () => {
      const user = {
        firstName: 'أحمد',
        lastName: 'محمد',
        bio: ''
      };

      const completenessScore = calculateCompletenessScore(user);
      const weaknesses = analyzeWeaknesses(user, completenessScore);
      const suggestions = generateSuggestions(user, completenessScore, weaknesses);
      
      const bioSuggestion = suggestions.find(s => s.category === 'bio');
      expect(bioSuggestion).toBeDefined();
      expect(bioSuggestion.estimatedImpact).toBe(20);
    });

    test('should sort suggestions by priority', () => {
      const user = {
        firstName: 'أحمد',
        lastName: 'محمد',
        experienceList: [],
        interests: [],
        bio: ''
      };

      const completenessScore = calculateCompletenessScore(user);
      const weaknesses = analyzeWeaknesses(user, completenessScore);
      const suggestions = generateSuggestions(user, completenessScore, weaknesses);
      
      // First suggestion should be high priority
      expect(suggestions[0].priority).toBe('high');
      
      // Last suggestion should be low or medium priority
      const lastPriority = suggestions[suggestions.length - 1].priority;
      expect(['low', 'medium']).toContain(lastPriority);
    });
  });
});
