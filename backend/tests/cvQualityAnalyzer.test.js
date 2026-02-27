/**
 * CV Quality Analyzer Tests
 * اختبارات خدمة تحليل جودة السيرة الذاتية
 */

const cvQualityAnalyzer = require('../src/services/cvQualityAnalyzer');

describe('CV Quality Analyzer Service', () => {
  // بيانات اختبار - CV ممتاز
  const excellentCV = {
    success: true,
    data: {
      rawText: 'A' + 'a'.repeat(1500), // طول مثالي
      contactInfo: {
        emails: ['test@example.com'],
        phones: ['+1234567890'],
        linkedin: 'linkedin.com/in/test',
        github: 'github.com/test',
      },
      skills: [
        'JavaScript', 'Python', 'React', 'Node.js', 'MongoDB',
        'Docker', 'AWS', 'Git', 'TypeScript', 'Express',
      ],
      experience: [
        {
          title: 'Senior Developer',
          period: '2020 - 2023',
          description: 'Led development team and implemented new features using React and Node.js. Managed cloud infrastructure on AWS.',
        },
        {
          title: 'Full Stack Developer',
          period: '2018 - 2020',
          description: 'Developed web applications using JavaScript, Python, and various frameworks.',
        },
        {
          title: 'Junior Developer',
          period: '2016 - 2018',
          description: 'Started career as junior developer, learned modern web technologies.',
        },
      ],
      education: [
        {
          degree: 'Bachelor',
          institution: 'University of Technology',
          year: '2016',
        },
        {
          degree: 'Master',
          institution: 'Tech Institute',
          year: '2018',
        },
      ],
      totalExperience: 7,
      extractedAt: new Date(),
    },
    stats: {
      skillsCount: 10,
      experienceCount: 3,
      educationCount: 2,
      totalExperienceYears: 7,
    },
  };

  // بيانات اختبار - CV ضعيف
  const poorCV = {
    success: true,
    data: {
      rawText: 'Short CV',
      contactInfo: {
        emails: [],
        phones: [],
        linkedin: null,
        github: null,
      },
      skills: [],
      experience: [],
      education: [],
      totalExperience: 0,
      extractedAt: new Date(),
    },
    stats: {
      skillsCount: 0,
      experienceCount: 0,
      educationCount: 0,
      totalExperienceYears: 0,
    },
  };

  // بيانات اختبار - CV متوسط
  const averageCV = {
    success: true,
    data: {
      rawText: 'A' + 'a'.repeat(800),
      contactInfo: {
        emails: ['test@example.com'],
        phones: ['+1234567890'],
        linkedin: null,
        github: null,
      },
      skills: ['JavaScript', 'HTML', 'CSS', 'React', 'Node.js'],
      experience: [
        {
          title: 'Developer',
          period: '2020 - 2023',
          description: 'Worked on web development projects.',
        },
      ],
      education: [
        {
          degree: 'Bachelor',
          institution: 'University',
          year: '2020',
        },
      ],
      totalExperience: 3,
      extractedAt: new Date(),
    },
    stats: {
      skillsCount: 5,
      experienceCount: 1,
      educationCount: 1,
      totalExperienceYears: 3,
    },
  };

  describe('analyzeQuality', () => {
    test('يجب أن يعطي درجة عالية لـ CV ممتاز', () => {
      const result = cvQualityAnalyzer.analyzeQuality(excellentCV);

      expect(result).toHaveProperty('overallScore');
      expect(result.overallScore).toBeGreaterThanOrEqual(80);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.rating).toBe('جيد جداً');
    });

    test('يجب أن يعطي درجة منخفضة لـ CV ضعيف', () => {
      const result = cvQualityAnalyzer.analyzeQuality(poorCV);

      expect(result.overallScore).toBeLessThan(30);
      expect(['ضعيف', 'ضعيف جداً']).toContain(result.rating);
    });

    test('يجب أن يعطي درجة متوسطة لـ CV متوسط', () => {
      const result = cvQualityAnalyzer.analyzeQuality(averageCV);

      expect(result.overallScore).toBeGreaterThanOrEqual(50);
      expect(result.overallScore).toBeLessThan(80);
      expect(['مقبول', 'جيد']).toContain(result.rating);
    });

    test('يجب أن يحتوي على جميع الحقول المطلوبة', () => {
      const result = cvQualityAnalyzer.analyzeQuality(excellentCV);

      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('rating');
      expect(result).toHaveProperty('scores');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('analyzedAt');
    });

    test('يجب أن تكون الدرجات بين 0 و 100', () => {
      const result = cvQualityAnalyzer.analyzeQuality(excellentCV);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.scores.contactInfo).toBeGreaterThanOrEqual(0);
      expect(result.scores.contactInfo).toBeLessThanOrEqual(100);
      expect(result.scores.skills).toBeGreaterThanOrEqual(0);
      expect(result.scores.skills).toBeLessThanOrEqual(100);
    });
  });

  describe('scoreContactInfo', () => {
    test('يجب أن يعطي 100 لمعلومات اتصال كاملة', () => {
      const score = cvQualityAnalyzer.scoreContactInfo({
        emails: ['test@example.com'],
        phones: ['+1234567890'],
        linkedin: 'linkedin.com/in/test',
        github: 'github.com/test',
      });

      expect(score).toBe(100);
    });

    test('يجب أن يعطي 0 لمعلومات اتصال فارغة', () => {
      const score = cvQualityAnalyzer.scoreContactInfo({
        emails: [],
        phones: [],
        linkedin: null,
        github: null,
      });

      expect(score).toBe(0);
    });

    test('يجب أن يعطي 70 لبريد وهاتف فقط', () => {
      const score = cvQualityAnalyzer.scoreContactInfo({
        emails: ['test@example.com'],
        phones: ['+1234567890'],
        linkedin: null,
        github: null,
      });

      expect(score).toBe(70);
    });
  });

  describe('scoreSkills', () => {
    test('يجب أن يعطي 0 لعدم وجود مهارات', () => {
      const score = cvQualityAnalyzer.scoreSkills(0);
      expect(score).toBe(0);
    });

    test('يجب أن يعطي درجة عالية للعدد المثالي من المهارات', () => {
      const score = cvQualityAnalyzer.scoreSkills(10);
      expect(score).toBeGreaterThanOrEqual(80);
    });

    test('يجب أن يخصم نقاط للمهارات الكثيرة جداً', () => {
      const score = cvQualityAnalyzer.scoreSkills(30);
      expect(score).toBeLessThan(100);
    });
  });

  describe('identifyStrengths', () => {
    test('يجب أن يحدد نقاط القوة في CV ممتاز', () => {
      const scores = {
        contactInfo: 100,
        skills: 90,
        experience: 85,
        education: 90,
        formatting: 80,
        completeness: 100,
      };

      const strengths = cvQualityAnalyzer.identifyStrengths(scores, excellentCV.data);

      expect(strengths.length).toBeGreaterThan(0);
      expect(strengths[0]).toHaveProperty('category');
      expect(strengths[0]).toHaveProperty('description');
      expect(strengths[0]).toHaveProperty('score');
    });

    test('يجب ألا يحدد نقاط قوة في CV ضعيف', () => {
      const scores = {
        contactInfo: 0,
        skills: 0,
        experience: 0,
        education: 0,
        formatting: 30,
        completeness: 0,
      };

      const strengths = cvQualityAnalyzer.identifyStrengths(scores, poorCV.data);

      expect(strengths.length).toBe(0);
    });
  });

  describe('identifyWeaknesses', () => {
    test('يجب أن يحدد نقاط الضعف في CV ضعيف', () => {
      const scores = {
        contactInfo: 0,
        skills: 0,
        experience: 0,
        education: 0,
        formatting: 30,
        completeness: 0,
      };

      const weaknesses = cvQualityAnalyzer.identifyWeaknesses(scores, poorCV.data);

      expect(weaknesses.length).toBeGreaterThan(0);
      expect(weaknesses[0]).toHaveProperty('category');
      expect(weaknesses[0]).toHaveProperty('description');
      expect(weaknesses[0]).toHaveProperty('score');
      expect(weaknesses[0]).toHaveProperty('severity');
    });

    test('يجب ألا يحدد نقاط ضعف في CV ممتاز', () => {
      const scores = {
        contactInfo: 100,
        skills: 90,
        experience: 85,
        education: 90,
        formatting: 80,
        completeness: 100,
      };

      const weaknesses = cvQualityAnalyzer.identifyWeaknesses(scores, excellentCV.data);

      expect(weaknesses.length).toBe(0);
    });
  });

  describe('generateRecommendations', () => {
    test('يجب أن يولد توصيات لـ CV ضعيف', () => {
      const scores = {
        contactInfo: 40,
        skills: 20,
        experience: 0,
        education: 0,
        formatting: 30,
        completeness: 20,
      };

      const recommendations = cvQualityAnalyzer.generateRecommendations(
        scores,
        poorCV.data,
        poorCV.stats
      );

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('priority');
      expect(recommendations[0]).toHaveProperty('category');
      expect(recommendations[0]).toHaveProperty('suggestion');
      expect(recommendations[0]).toHaveProperty('impact');
      expect(recommendations[0]).toHaveProperty('estimatedImprovement');
    });

    test('يجب أن تكون التوصيات مرتبة حسب الأولوية', () => {
      const scores = {
        contactInfo: 40,
        skills: 20,
        experience: 0,
        education: 0,
        formatting: 30,
        completeness: 20,
      };

      const recommendations = cvQualityAnalyzer.generateRecommendations(
        scores,
        poorCV.data,
        poorCV.stats
      );

      const priorityOrder = { high: 3, medium: 2, low: 1 };

      for (let i = 0; i < recommendations.length - 1; i++) {
        const currentPriority = priorityOrder[recommendations[i].priority];
        const nextPriority = priorityOrder[recommendations[i + 1].priority];
        expect(currentPriority).toBeGreaterThanOrEqual(nextPriority);
      }
    });

    test('يجب أن يولد توصيات قليلة لـ CV ممتاز', () => {
      const scores = {
        contactInfo: 100,
        skills: 90,
        experience: 85,
        education: 90,
        formatting: 80,
        completeness: 100,
      };

      const recommendations = cvQualityAnalyzer.generateRecommendations(
        scores,
        excellentCV.data,
        excellentCV.stats
      );

      expect(recommendations.length).toBeLessThan(3);
    });
  });

  describe('getRating', () => {
    test('يجب أن يعطي "ممتاز" للدرجات 90+', () => {
      expect(cvQualityAnalyzer.getRating(95)).toBe('ممتاز');
      expect(cvQualityAnalyzer.getRating(90)).toBe('ممتاز');
    });

    test('يجب أن يعطي "جيد جداً" للدرجات 80-89', () => {
      expect(cvQualityAnalyzer.getRating(85)).toBe('جيد جداً');
      expect(cvQualityAnalyzer.getRating(80)).toBe('جيد جداً');
    });

    test('يجب أن يعطي "جيد" للدرجات 70-79', () => {
      expect(cvQualityAnalyzer.getRating(75)).toBe('جيد');
      expect(cvQualityAnalyzer.getRating(70)).toBe('جيد');
    });

    test('يجب أن يعطي "مقبول" للدرجات 60-69', () => {
      expect(cvQualityAnalyzer.getRating(65)).toBe('مقبول');
      expect(cvQualityAnalyzer.getRating(60)).toBe('مقبول');
    });

    test('يجب أن يعطي "ضعيف" للدرجات 50-59', () => {
      expect(cvQualityAnalyzer.getRating(55)).toBe('ضعيف');
      expect(cvQualityAnalyzer.getRating(50)).toBe('ضعيف');
    });

    test('يجب أن يعطي "ضعيف جداً" للدرجات أقل من 50', () => {
      expect(cvQualityAnalyzer.getRating(40)).toBe('ضعيف جداً');
      expect(cvQualityAnalyzer.getRating(0)).toBe('ضعيف جداً');
    });
  });
});
