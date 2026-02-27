/**
 * CV Improvement Suggestions Service Tests
 * اختبارات خدمة اقتراحات تحسين السيرة الذاتية
 */

const cvImprovementSuggestions = require('../src/services/cvImprovementSuggestions');

describe('CV Improvement Suggestions Service', () => {
  // بيانات اختبار
  const mockParsedCV = {
    success: true,
    data: {
      rawText: 'Software Developer\nExperience: Worked on web applications\nEducation: Bachelor in Computer Science\nSkills: JavaScript, React, Node.js',
      contactInfo: {
        emails: ['test@example.com'],
        phones: ['+1234567890'],
        linkedin: null,
        github: null,
      },
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: [
        {
          title: 'Software Developer',
          period: '2020 - 2023',
          description: 'Worked on web applications',
        },
      ],
      education: [
        {
          degree: 'Bachelor',
          institution: 'Computer Science University',
          year: '2020',
        },
      ],
      totalExperience: 3,
      extractedAt: new Date(),
    },
    stats: {
      skillsCount: 3,
      experienceCount: 1,
      educationCount: 1,
      totalExperienceYears: 3,
    },
  };

  const mockQualityAnalysis = {
    overallScore: 65,
    rating: 'مقبول',
    scores: {
      contactInfo: 70,
      skills: 50,
      experience: 60,
      education: 80,
      formatting: 60,
      completeness: 80,
    },
    strengths: [],
    weaknesses: [],
    recommendations: [],
  };

  describe('detectField', () => {
    test('يجب أن يحدد مجال تطوير البرمجيات', () => {
      const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'Git'];
      const field = cvImprovementSuggestions.detectField(skills);
      expect(field).toBe('software_development');
    });

    test('يجب أن يحدد مجال علم البيانات', () => {
      const skills = ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'SQL'];
      const field = cvImprovementSuggestions.detectField(skills);
      expect(field).toBe('data_science');
    });

    test('يجب أن يحدد مجال تطوير الويب', () => {
      const skills = ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design'];
      const field = cvImprovementSuggestions.detectField(skills);
      expect(field).toBe('web_development');
    });

    test('يجب أن يرجع general للمهارات غير المحددة', () => {
      const skills = ['Communication', 'Leadership', 'Project Management'];
      const field = cvImprovementSuggestions.detectField(skills);
      expect(field).toBe('general');
    });
  });

  describe('analyzeExperienceQuality', () => {
    test('يجب أن يكتشف وصف خبرة قصير', () => {
      const experiences = [
        {
          title: 'Developer',
          period: '2020-2023',
          description: 'Short description',
        },
      ];

      const result = cvImprovementSuggestions.analyzeExperienceQuality(experiences);
      
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('short_description');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    test('يجب أن يكتشف غياب الأفعال القوية', () => {
      const experiences = [
        {
          title: 'Developer',
          period: '2020-2023',
          description: 'I was responsible for maintaining the application and fixing bugs. I also helped with testing.',
        },
      ];

      const result = cvImprovementSuggestions.analyzeExperienceQuality(experiences);
      
      const actionVerbSuggestion = result.suggestions.find(s => 
        s.suggestion.includes('أفعال قوية')
      );
      expect(actionVerbSuggestion).toBeDefined();
    });

    test('يجب أن يكتشف غياب المقاييس الكمية', () => {
      const experiences = [
        {
          title: 'Developer',
          period: '2020-2023',
          description: 'Developed web applications using React and Node.js. Worked with a team to deliver projects.',
        },
      ];

      const result = cvImprovementSuggestions.analyzeExperienceQuality(experiences);
      
      const metricsSuggestion = result.suggestions.find(s => 
        s.suggestion.includes('مقاييس كمية')
      );
      expect(metricsSuggestion).toBeDefined();
    });

    test('يجب أن يكتشف غياب التقنيات المستخدمة', () => {
      const experiences = [
        {
          title: 'Developer',
          period: '2020-2023',
          description: 'Developed applications and improved performance by 50%. Led a team of 5 developers.',
        },
      ];

      const result = cvImprovementSuggestions.analyzeExperienceQuality(experiences);
      
      const techSuggestion = result.suggestions.find(s => 
        s.suggestion.includes('التقنيات والأدوات')
      );
      expect(techSuggestion).toBeDefined();
    });
  });

  describe('compareWithIndustryStandards', () => {
    test('يجب أن يقارن مع معايير تطوير البرمجيات', () => {
      const result = cvImprovementSuggestions.compareWithIndustryStandards(
        mockParsedCV,
        'software_development'
      );

      expect(result.comparison).toBeDefined();
      expect(result.comparison.field).toBe('software_development');
      expect(result.comparison.meetsStandards).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    test('يجب أن يحدد المهارات المطلوبة المفقودة', () => {
      const result = cvImprovementSuggestions.compareWithIndustryStandards(
        mockParsedCV,
        'software_development'
      );

      const missingSkillsSuggestion = result.suggestions.find(s => 
        s.category === 'معايير الصناعة' && s.suggestion.includes('مهارات مطلوبة مفقودة')
      );
      
      // يجب أن يجد مهارات مفقودة (Git, SQL)
      expect(missingSkillsSuggestion).toBeDefined();
    });

    test('يجب أن يقترح المهارات الموصى بها', () => {
      const result = cvImprovementSuggestions.compareWithIndustryStandards(
        mockParsedCV,
        'software_development'
      );

      const recommendedSkillsSuggestion = result.suggestions.find(s => 
        s.category === 'معايير الصناعة' && s.suggestion.includes('مهارات موصى بها')
      );
      
      expect(recommendedSkillsSuggestion).toBeDefined();
    });

    test('يجب أن يحدد نقص عدد المهارات', () => {
      const result = cvImprovementSuggestions.compareWithIndustryStandards(
        mockParsedCV,
        'software_development'
      );

      const skillsCountSuggestion = result.suggestions.find(s => 
        s.suggestion.includes('عدد المهارات')
      );
      
      // 3 مهارات أقل من الحد الأدنى (8)
      expect(skillsCountSuggestion).toBeDefined();
      expect(skillsCountSuggestion.priority).toBe('high');
    });
  });

  describe('generateGeneralSuggestions', () => {
    test('يجب أن يقترح إضافة LinkedIn', () => {
      const result = cvImprovementSuggestions.generateGeneralSuggestions(
        mockParsedCV,
        mockQualityAnalysis
      );

      const linkedinSuggestion = result.find(s => 
        s.suggestion.includes('LinkedIn')
      );
      
      expect(linkedinSuggestion).toBeDefined();
      expect(linkedinSuggestion.priority).toBe('medium');
    });

    test('يجب أن يقترح إضافة GitHub للمجالات التقنية', () => {
      const result = cvImprovementSuggestions.generateGeneralSuggestions(
        mockParsedCV,
        mockQualityAnalysis
      );

      const githubSuggestion = result.find(s => 
        s.suggestion.includes('GitHub')
      );
      
      expect(githubSuggestion).toBeDefined();
    });

    test('يجب أن يقترح إضافة ملخص شخصي', () => {
      const result = cvImprovementSuggestions.generateGeneralSuggestions(
        mockParsedCV,
        mockQualityAnalysis
      );

      const summarySuggestion = result.find(s => 
        s.category === 'الملخص الشخصي'
      );
      
      expect(summarySuggestion).toBeDefined();
      expect(summarySuggestion.priority).toBe('high');
    });
  });

  describe('generateImprovementSuggestions', () => {
    test('يجب أن يولد اقتراحات شاملة', () => {
      const result = cvImprovementSuggestions.generateImprovementSuggestions(
        mockParsedCV,
        mockQualityAnalysis
      );

      expect(result).toBeDefined();
      expect(result.totalSuggestions).toBeGreaterThan(0);
      expect(result.detectedField).toBeDefined();
      expect(result.fieldName).toBeDefined();
      expect(result.industryComparison).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.summary).toBeDefined();
    });

    test('يجب أن يرتب الاقتراحات حسب الأولوية', () => {
      const result = cvImprovementSuggestions.generateImprovementSuggestions(
        mockParsedCV,
        mockQualityAnalysis
      );

      const priorities = result.suggestions.map(s => s.priority);
      
      // التحقق من أن الأولويات العالية تأتي أولاً
      let lastPriorityValue = 3; // high = 3
      for (const priority of priorities) {
        const currentValue = priority === 'high' ? 3 : priority === 'medium' ? 2 : 1;
        expect(currentValue).toBeLessThanOrEqual(lastPriorityValue);
        lastPriorityValue = currentValue;
      }
    });

    test('يجب أن يحتوي الملخص على معلومات صحيحة', () => {
      const result = cvImprovementSuggestions.generateImprovementSuggestions(
        mockParsedCV,
        mockQualityAnalysis
      );

      expect(result.summary.totalSuggestions).toBe(result.suggestions.length);
      expect(result.summary.byPriority).toBeDefined();
      expect(result.summary.byPriority.high).toBeGreaterThanOrEqual(0);
      expect(result.summary.byPriority.medium).toBeGreaterThanOrEqual(0);
      expect(result.summary.byPriority.low).toBeGreaterThanOrEqual(0);
      expect(result.summary.estimatedTotalImprovement).toBeGreaterThan(0);
      expect(result.summary.topPriorities).toBeInstanceOf(Array);
      expect(result.summary.topPriorities.length).toBeLessThanOrEqual(3);
    });

    test('يجب أن يزيل الاقتراحات المكررة', () => {
      const result = cvImprovementSuggestions.generateImprovementSuggestions(
        mockParsedCV,
        mockQualityAnalysis
      );

      // التحقق من عدم وجود اقتراحات مكررة
      const suggestionKeys = result.suggestions.map(s => 
        `${s.category}-${s.suggestion}`
      );
      const uniqueKeys = new Set(suggestionKeys);
      
      expect(suggestionKeys.length).toBe(uniqueKeys.size);
    });

    test('يجب أن تكون جميع الاقتراحات قابلة للتنفيذ أو تحتوي على ملاحظة', () => {
      const result = cvImprovementSuggestions.generateImprovementSuggestions(
        mockParsedCV,
        mockQualityAnalysis
      );

      result.suggestions.forEach(suggestion => {
        expect(suggestion.actionable !== undefined).toBe(true);
        if (!suggestion.actionable) {
          expect(suggestion.note).toBeDefined();
        }
      });
    });
  });

  describe('getFieldName', () => {
    test('يجب أن يرجع الاسم العربي للمجال', () => {
      expect(cvImprovementSuggestions.getFieldName('software_development')).toBe('تطوير البرمجيات');
      expect(cvImprovementSuggestions.getFieldName('data_science')).toBe('علم البيانات');
      expect(cvImprovementSuggestions.getFieldName('web_development')).toBe('تطوير الويب');
      expect(cvImprovementSuggestions.getFieldName('mobile_development')).toBe('تطوير تطبيقات الموبايل');
      expect(cvImprovementSuggestions.getFieldName('devops')).toBe('DevOps');
      expect(cvImprovementSuggestions.getFieldName('general')).toBe('عام');
    });
  });

  describe('isTechField', () => {
    test('يجب أن يحدد المجالات التقنية', () => {
      expect(cvImprovementSuggestions.isTechField(['JavaScript', 'Python'])).toBe(true);
      expect(cvImprovementSuggestions.isTechField(['Programming', 'Development'])).toBe(true);
      expect(cvImprovementSuggestions.isTechField(['برمجة', 'تطوير'])).toBe(true);
    });

    test('يجب أن يحدد المجالات غير التقنية', () => {
      expect(cvImprovementSuggestions.isTechField(['Communication', 'Leadership'])).toBe(false);
      expect(cvImprovementSuggestions.isTechField(['Marketing', 'Sales'])).toBe(false);
    });
  });
});
