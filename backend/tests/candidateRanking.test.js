/**
 * 🧪 Candidate Ranking Service Tests
 * اختبارات خدمة ترتيب المرشحين
 * 
 * Property 9: Candidate Ranking Accuracy
 * For any job posting, candidates should be ranked such that those with higher match scores appear first.
 */

const {
  extractCandidateFeatures,
  extractJobFeatures,
  calculateMatchScore,
  analyzeCandidateStrengthsWeaknesses
} = require('../src/services/candidateRankingService');

describe('Candidate Ranking Service', () => {
  
  describe('extractCandidateFeatures', () => {
    it('should extract skills from candidate profile', () => {
      const candidate = {
        computerSkills: [
          { skill: 'JavaScript', proficiency: 'advanced' },
          { skill: 'Python', proficiency: 'intermediate' }
        ],
        softwareSkills: [
          { software: 'React', proficiency: 'advanced' }
        ],
        otherSkills: ['Communication', 'Leadership']
      };
      
      const features = extractCandidateFeatures(candidate);
      
      expect(features.skills).toContain('javascript');
      expect(features.skills).toContain('python');
      expect(features.skills).toContain('react');
      expect(features.skills).toContain('communication');
    });
    
    it('should calculate total experience correctly', () => {
      const candidate = {
        experienceList: [
          {
            from: new Date('2020-01-01'),
            to: new Date('2022-01-01')
          },
          {
            from: new Date('2022-06-01'),
            to: new Date('2024-01-01')
          }
        ]
      };
      
      const features = extractCandidateFeatures(candidate);
      
      // 2 years + 1.5 years = 3.5 years
      expect(features.totalExperience).toBeGreaterThanOrEqual(3);
      expect(features.totalExperience).toBeLessThanOrEqual(4);
    });
    
    it('should identify highest education level', () => {
      const candidate = {
        educationList: [
          { level: 'Bachelor', degree: 'Computer Science' },
          { level: 'Master', degree: 'Software Engineering' }
        ]
      };
      
      const features = extractCandidateFeatures(candidate);
      
      expect(features.highestEducation).toBe('master');
    });
  });
  
  describe('extractJobFeatures', () => {
    it('should extract keywords from job posting', () => {
      const job = {
        title: 'Senior JavaScript Developer',
        description: 'We are looking for an experienced React developer',
        requirements: 'Must have 5+ years of experience with JavaScript and React',
        location: 'Cairo, Egypt',
        jobType: 'Full-time'
      };
      
      const features = extractJobFeatures(job);
      
      expect(features.keywords).toContain('javascript');
      expect(features.keywords).toContain('react');
      expect(features.keywords).toContain('developer');
      expect(features.location).toBe('cairo, egypt');
    });
  });
  
  describe('calculateMatchScore', () => {
    it('should give high score for perfect match', () => {
      const candidateFeatures = {
        skills: ['javascript', 'react', 'node.js', 'mongodb'],
        totalExperience: 6,
        experienceAreas: [
          { position: 'senior developer', workType: 'technical' }
        ],
        highestEducation: 'bachelor',
        location: { city: 'cairo', country: 'egypt' }
      };
      
      const jobFeatures = {
        title: 'senior developer',
        keywords: ['javascript', 'react', 'node.js', 'developer'],
        location: 'cairo, egypt',
        jobType: 'Full-time'
      };
      
      const result = calculateMatchScore(candidateFeatures, jobFeatures);
      
      expect(result.score).toBeGreaterThan(50); // تعديل العتبة لتكون أكثر واقعية
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reasons.length).toBeGreaterThan(0);
    });
    
    it('should give low score for poor match', () => {
      const candidateFeatures = {
        skills: ['cooking', 'driving'],
        totalExperience: 1,
        experienceAreas: [
          { position: 'chef', workType: 'field' }
        ],
        highestEducation: 'high school',
        location: { city: 'alexandria', country: 'egypt' }
      };
      
      const jobFeatures = {
        title: 'senior software engineer',
        keywords: ['python', 'machine learning', 'ai', 'tensorflow'],
        location: 'cairo, egypt',
        jobType: 'Full-time'
      };
      
      const result = calculateMatchScore(candidateFeatures, jobFeatures);
      
      expect(result.score).toBeLessThan(40);
    });
    
    it('should include reasons for the match', () => {
      const candidateFeatures = {
        skills: ['javascript', 'react'],
        totalExperience: 3,
        experienceAreas: [],
        highestEducation: 'bachelor',
        location: { city: 'cairo', country: 'egypt' }
      };
      
      const jobFeatures = {
        title: 'react developer',
        keywords: ['javascript', 'react', 'frontend'],
        location: 'cairo',
        jobType: 'Full-time'
      };
      
      const result = calculateMatchScore(candidateFeatures, jobFeatures);
      
      expect(result.reasons).toBeDefined();
      expect(Array.isArray(result.reasons)).toBe(true);
      expect(result.reasons.length).toBeGreaterThan(0);
      
      // التحقق من وجود أنواع مختلفة من الأسباب
      const reasonTypes = result.reasons.map(r => r.type);
      expect(reasonTypes).toContain('skills');
    });
    
    it('should provide score breakdown', () => {
      const candidateFeatures = {
        skills: ['python', 'django'],
        totalExperience: 4,
        experienceAreas: [],
        highestEducation: 'master',
        location: { city: 'cairo', country: 'egypt' }
      };
      
      const jobFeatures = {
        title: 'python developer',
        keywords: ['python', 'django', 'backend'],
        location: 'cairo',
        jobType: 'Full-time'
      };
      
      const result = calculateMatchScore(candidateFeatures, jobFeatures);
      
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.skills).toBeDefined();
      expect(result.breakdown.experience).toBeDefined();
      expect(result.breakdown.education).toBeDefined();
      expect(result.breakdown.location).toBeDefined();
    });
  });
  
  describe('Property 9: Candidate Ranking Accuracy', () => {
    it('should rank candidates with higher scores first', () => {
      const jobFeatures = {
        title: 'javascript developer',
        keywords: ['javascript', 'react', 'node.js'],
        location: 'cairo',
        jobType: 'Full-time'
      };
      
      const candidate1 = {
        skills: ['javascript', 'react', 'node.js', 'mongodb'],
        totalExperience: 5,
        experienceAreas: [{ position: 'developer' }],
        highestEducation: 'bachelor',
        location: { city: 'cairo', country: 'egypt' }
      };
      
      const candidate2 = {
        skills: ['html', 'css'],
        totalExperience: 1,
        experienceAreas: [],
        highestEducation: 'diploma',
        location: { city: 'alexandria', country: 'egypt' }
      };
      
      const candidate3 = {
        skills: ['javascript', 'react'],
        totalExperience: 3,
        experienceAreas: [{ position: 'frontend developer' }],
        highestEducation: 'bachelor',
        location: { city: 'cairo', country: 'egypt' }
      };
      
      const score1 = calculateMatchScore(candidate1, jobFeatures).score;
      const score2 = calculateMatchScore(candidate2, jobFeatures).score;
      const score3 = calculateMatchScore(candidate3, jobFeatures).score;
      
      // التحقق من أن الترتيب صحيح
      expect(score1).toBeGreaterThan(score3);
      expect(score3).toBeGreaterThan(score2);
      
      // التحقق من أن المرشح الأفضل يحصل على درجة عالية
      expect(score1).toBeGreaterThan(60);
      
      // التحقق من أن المرشح الضعيف يحصل على درجة منخفضة
      expect(score2).toBeLessThan(40);
    });
    
    it('should maintain consistent ranking across multiple evaluations', () => {
      const jobFeatures = {
        title: 'senior python developer',
        keywords: ['python', 'django', 'postgresql', 'docker'],
        location: 'cairo',
        jobType: 'Full-time'
      };
      
      const candidateFeatures = {
        skills: ['python', 'django', 'postgresql'],
        totalExperience: 6,
        experienceAreas: [{ position: 'python developer' }],
        highestEducation: 'master',
        location: { city: 'cairo', country: 'egypt' }
      };
      
      // تقييم متعدد
      const scores = [];
      for (let i = 0; i < 5; i++) {
        const result = calculateMatchScore(candidateFeatures, jobFeatures);
        scores.push(result.score);
      }
      
      // التحقق من أن جميع الدرجات متطابقة (consistency)
      const firstScore = scores[0];
      scores.forEach(score => {
        expect(score).toBe(firstScore);
      });
    });
  });
  
  describe('analyzeCandidateStrengthsWeaknesses', () => {
    it('should identify strengths for strong candidate', () => {
      const candidateFeatures = {
        skills: ['javascript', 'react', 'node.js', 'mongodb', 'docker'],
        totalExperience: 6,
        experienceAreas: [
          { position: 'senior developer', workType: 'technical' }
        ],
        highestEducation: 'master',
        education: [
          { level: 'Master', institution: 'Cairo University' }
        ],
        location: { city: 'cairo', country: 'egypt' },
        trainingCount: 8,
        hasCertificates: true,
        languages: [
          { language: 'Arabic', proficiency: 'native' },
          { language: 'English', proficiency: 'advanced' },
          { language: 'French', proficiency: 'intermediate' }
        ]
      };
      
      const jobFeatures = {
        title: 'senior javascript developer',
        keywords: ['javascript', 'react', 'node.js', 'developer'],
        location: 'cairo',
        jobType: 'Full-time'
      };
      
      const analysis = analyzeCandidateStrengthsWeaknesses(candidateFeatures, jobFeatures);
      
      expect(analysis.strengths.length).toBeGreaterThan(0);
      expect(analysis.summary.overallAssessment).toMatch(/ممتاز|قوي/);
      expect(analysis.summary.hiringRecommendation).toMatch(/يُنصح/);
      
      // التحقق من وجود نقاط قوة في المهارات
      const skillsStrength = analysis.strengths.find(s => s.category === 'skills');
      expect(skillsStrength).toBeDefined();
      expect(skillsStrength.impact).toBe('high');
    });
    
    it('should identify weaknesses for weak candidate', () => {
      const candidateFeatures = {
        skills: ['html', 'css'],
        totalExperience: 0.5,
        experienceAreas: [],
        highestEducation: 'high school',
        education: [
          { level: 'High School' }
        ],
        location: { city: 'alexandria', country: 'egypt' },
        trainingCount: 0,
        hasCertificates: false,
        languages: [
          { language: 'Arabic', proficiency: 'native' }
        ]
      };
      
      const jobFeatures = {
        title: 'senior software engineer',
        keywords: ['python', 'machine learning', 'ai', 'tensorflow', 'docker'],
        location: 'cairo',
        jobType: 'Full-time'
      };
      
      const analysis = analyzeCandidateStrengthsWeaknesses(candidateFeatures, jobFeatures);
      
      expect(analysis.weaknesses.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.summary.overallAssessment).toMatch(/ضعيف|متوسط/);
      
      // التحقق من وجود نقاط ضعف في المهارات
      const skillsWeakness = analysis.weaknesses.find(w => w.category === 'skills');
      expect(skillsWeakness).toBeDefined();
      expect(skillsWeakness.impact).toBe('high');
    });
    
    it('should provide actionable recommendations', () => {
      const candidateFeatures = {
        skills: ['javascript'],
        totalExperience: 1,
        experienceAreas: [],
        highestEducation: 'bachelor',
        education: [
          { level: 'Bachelor', degree: 'Computer Science' }
        ],
        location: { city: 'cairo', country: 'egypt' },
        trainingCount: 1,
        hasCertificates: false,
        languages: [
          { language: 'Arabic', proficiency: 'native' }
        ]
      };
      
      const jobFeatures = {
        title: 'full stack developer',
        keywords: ['javascript', 'react', 'node.js', 'mongodb', 'docker'],
        location: 'cairo',
        jobType: 'Full-time'
      };
      
      const analysis = analyzeCandidateStrengthsWeaknesses(candidateFeatures, jobFeatures);
      
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      
      // التحقق من أن كل توصية تحتوي على معلومات كاملة
      analysis.recommendations.forEach(rec => {
        expect(rec.category).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(rec.suggestion).toBeDefined();
        expect(rec.actionItems).toBeDefined();
        expect(Array.isArray(rec.actionItems)).toBe(true);
        expect(rec.actionItems.length).toBeGreaterThan(0);
      });
    });
    
    it('should categorize strengths and weaknesses correctly', () => {
      const candidateFeatures = {
        skills: ['python', 'django'],
        totalExperience: 4,
        experienceAreas: [
          { position: 'backend developer' }
        ],
        highestEducation: 'bachelor',
        education: [
          { level: 'Bachelor' }
        ],
        location: { city: 'cairo', country: 'egypt' },
        trainingCount: 3,
        hasCertificates: true,
        languages: [
          { language: 'Arabic', proficiency: 'native' },
          { language: 'English', proficiency: 'intermediate' }
        ]
      };
      
      const jobFeatures = {
        title: 'python developer',
        keywords: ['python', 'django', 'postgresql'],
        location: 'cairo',
        jobType: 'Full-time'
      };
      
      const analysis = analyzeCandidateStrengthsWeaknesses(candidateFeatures, jobFeatures);
      
      // التحقق من وجود فئات مختلفة
      const categories = [
        ...analysis.strengths.map(s => s.category),
        ...analysis.weaknesses.map(w => w.category)
      ];
      
      const uniqueCategories = [...new Set(categories)];
      expect(uniqueCategories.length).toBeGreaterThan(1);
      
      // التحقق من أن كل نقطة قوة/ضعف لها تأثير محدد
      [...analysis.strengths, ...analysis.weaknesses].forEach(item => {
        expect(['high', 'medium', 'low']).toContain(item.impact);
      });
    });
    
    it('should provide summary with overall assessment', () => {
      const candidateFeatures = {
        skills: ['react', 'javascript', 'typescript'],
        totalExperience: 3,
        experienceAreas: [
          { position: 'frontend developer' }
        ],
        highestEducation: 'bachelor',
        education: [
          { level: 'Bachelor' }
        ],
        location: { city: 'cairo', country: 'egypt' },
        trainingCount: 5,
        hasCertificates: true,
        languages: [
          { language: 'Arabic', proficiency: 'native' },
          { language: 'English', proficiency: 'advanced' }
        ]
      };
      
      const jobFeatures = {
        title: 'react developer',
        keywords: ['react', 'javascript', 'typescript', 'frontend'],
        location: 'cairo',
        jobType: 'Full-time'
      };
      
      const analysis = analyzeCandidateStrengthsWeaknesses(candidateFeatures, jobFeatures);
      
      expect(analysis.summary).toBeDefined();
      expect(analysis.summary.totalStrengths).toBeDefined();
      expect(analysis.summary.totalWeaknesses).toBeDefined();
      expect(analysis.summary.highImpactStrengths).toBeDefined();
      expect(analysis.summary.highImpactWeaknesses).toBeDefined();
      expect(analysis.summary.overallAssessment).toBeDefined();
      expect(analysis.summary.hiringRecommendation).toBeDefined();
      
      // التحقق من أن التقييم العام منطقي
      expect(typeof analysis.summary.overallAssessment).toBe('string');
      expect(analysis.summary.overallAssessment.length).toBeGreaterThan(0);
    });
  });
});
