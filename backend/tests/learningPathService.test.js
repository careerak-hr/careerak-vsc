/**
 * اختبار خدمة مسارات التعلم المخصصة
 * 
 * Property: Personalized Learning Path Generation
 * For any user with target jobs, the system should generate a personalized learning path
 * with sequential stages and progress tracking
 * 
 * Validates: Requirements 2.3 (مسار تعليمي مخصص)
 * Task: 9.3 توصيات الدورات
 */

const LearningPathService = require('../src/services/learningPathService');

describe('Learning Path Service', () => {
  let learningPathService;

  beforeEach(() => {
    learningPathService = new LearningPathService();
  });

  describe('Personalized Learning Path Generation', () => {
    test('should generate learning path for user with target jobs', async () => {
      // بيانات مستخدم
      const user = {
        _id: 'user_001',
        computerSkills: [
          { skill: 'javascript', proficiency: 'intermediate' },
          { skill: 'html', proficiency: 'beginner' }
        ],
        softwareSkills: [
          { software: 'photoshop', proficiency: 'intermediate' }
        ],
        otherSkills: ['communication'],
        bio: 'مطور ويب مبتدئ'
      };

      // بيانات وظائف مستهدفة
      const targetJobs = [
        {
          _id: 'job_001',
          title: 'مطور ويب متقدم',
          description: 'مطلوب مطور ويب متقدم مع خبرة في React و Node.js',
          requirements: 'خبرة في React, Node.js, MongoDB, TypeScript',
          postedBy: {
            companyName: 'شركة التكنولوجيا',
            companyIndustry: 'تكنولوجيا'
          },
          status: 'Open'
        },
        {
          _id: 'job_002',
          title: 'مطور تطبيقات ويب',
          description: 'مطلوب مطور تطبيقات ويب',
          requirements: 'JavaScript, React, CSS, HTML',
          postedBy: {
            companyName: 'شركة البرمجيات',
            companyIndustry: 'برمجيات'
          },
          status: 'Open'
        }
      ];

      // توليد مسار التعلم
      const result = await learningPathService.generatePersonalizedLearningPath(
        user,
        targetJobs,
        { weeklyHours: 10 }
      );

      // التحقق من النجاح
      expect(result.success).toBe(true);
      expect(result.learningPath).toBeDefined();
      expect(result.analysis).toBeDefined();

      // التحقق من هيكل مسار التعلم
      const learningPath = result.learningPath;
      expect(learningPath.name).toBeDefined();
      expect(learningPath.description).toBeDefined();
      expect(learningPath.careerGoal).toBeDefined();
      expect(learningPath.stages).toBeDefined();
      expect(Array.isArray(learningPath.stages)).toBe(true);
      expect(learningPath.stages.length).toBeGreaterThan(0);

      // التحقق من الهدف المهني
      expect(learningPath.careerGoal.title).toBeDefined();
      expect(learningPath.careerGoal.targetJobs).toBeDefined();
      expect(Array.isArray(learningPath.careerGoal.targetJobs)).toBe(true);
      expect(learningPath.careerGoal.targetJobs.length).toBeGreaterThan(0);

      // التحقق من المراحل
      learningPath.stages.forEach((stage, index) => {
        expect(stage.order).toBe(index + 1);
        expect(stage.name).toBeDefined();
        expect(stage.description).toBeDefined();
        expect(stage.courses).toBeDefined();
        expect(Array.isArray(stage.courses)).toBe(true);
        expect(stage.status).toBe('not_started');
        expect(stage.progress).toBe(0);

        // التحقق من الدورات في كل مرحلة
        if (stage.courses.length > 0) {
          stage.courses.forEach((course, courseIndex) => {
            expect(course.order).toBe(courseIndex + 1);
            expect(course.courseTitle).toBeDefined();
            expect(course.status).toBe('not_started');
            expect(course.progress).toBe(0);
            expect(course.employmentImprovement).toBeDefined();
          });
        }
      });

      // التحقق من مقاييس التحسين
      expect(learningPath.improvementMetrics).toBeDefined();
      expect(learningPath.improvementMetrics.skillCoverageIncrease).toBeGreaterThanOrEqual(0);
      expect(learningPath.improvementMetrics.employmentOpportunityIncrease).toBeGreaterThanOrEqual(0);
      expect(learningPath.improvementMetrics.confidenceLevel).toBeGreaterThanOrEqual(0);
      expect(learningPath.improvementMetrics.confidenceLevel).toBeLessThanOrEqual(1);

      // التحقق من التوصيات التالية
      expect(learningPath.nextRecommendations).toBeDefined();
      expect(Array.isArray(learningPath.nextRecommendations)).toBe(true);

      // التحقق من الإعدادات
      expect(learningPath.settings).toBeDefined();
      expect(learningPath.settings.notifications).toBeDefined();
      expect(learningPath.settings.pace).toBeDefined();
      expect(learningPath.settings.weeklyHours).toBe(10);

      // التحقق من التقدم
      expect(learningPath.progress).toBeDefined();
      expect(learningPath.progress.overall).toBe(0);
      expect(learningPath.progress.estimatedHoursRemaining).toBeGreaterThan(0);

      // التحقق من تاريخ الاكتمال المستهدف
      expect(learningPath.targetCompletionDate).toBeDefined();
    });

    test('should handle user with no skills', async () => {
      // بيانات مستخدم بدون مهارات
      const user = {
        _id: 'user_002',
        computerSkills: [],
        softwareSkills: [],
        otherSkills: [],
        bio: ''
      };

      // بيانات وظيفة بسيطة
      const targetJobs = [
        {
          _id: 'job_003',
          title: 'مساعد إداري',
          description: 'مطلوب مساعد إداري',
          requirements: 'مهارات تواصل، تنظيم، مايكروسوفت أوفيس',
          postedBy: {
            companyName: 'شركة الخدمات',
            companyIndustry: 'خدمات'
          },
          status: 'Open'
        }
      ];

      // توليد مسار التعلم
      const result = await learningPathService.generatePersonalizedLearningPath(
        user,
        targetJobs
      );

      // التحقق من النجاح
      expect(result.success).toBe(true);
      expect(result.learningPath).toBeDefined();

      // التحقق من أن المسار يحتوي على مراحل
      expect(result.learningPath.stages.length).toBeGreaterThan(0);

      // التحقق من أن مقاييس التحسين موجودة
      expect(result.learningPath.improvementMetrics).toBeDefined();
    });

    test('should handle empty target jobs', async () => {
      // بيانات مستخدم
      const user = {
        _id: 'user_003',
        computerSkills: [
          { skill: 'javascript', proficiency: 'intermediate' }
        ],
        bio: 'مطور جافاسكريبت'
      };

      // قائمة وظائف فارغة
      const targetJobs = [];

      // توليد مسار التعلم
      const result = await learningPathService.generatePersonalizedLearningPath(
        user,
        targetJobs
      );

      // يجب أن يفشل التوليد أو يعيد مساراً افتراضياً
      // في حالتنا، سيفشل لأنه لا توجد وظائف مستهدفة
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should organize courses into sequential stages', async () => {
      // بيانات مستخ��م
      const user = {
        _id: 'user_004',
        computerSkills: [
          { skill: 'python', proficiency: 'beginner' }
        ],
        bio: 'مطور بايثون مبتدئ'
      };

      // بيانات وظائف
      const targetJobs = [
        {
          _id: 'job_004',
          title: 'عالم بيانات',
          description: 'مطلوب عالم بيانات مع خبرة في Python و Machine Learning',
          requirements: 'Python, Pandas, NumPy, Scikit-learn, SQL',
          postedBy: {
            companyName: 'شركة البيانات',
            companyIndustry: 'بيانات'
          },
          status: 'Open'
        }
      ];

      // توليد مسار التعلم
      const result = await learningPathService.generatePersonalizedLearningPath(
        user,
        targetJobs
      );

      // التحقق من النجاح
      expect(result.success).toBe(true);
      expect(result.learningPath).toBeDefined();

      // التحقق من أن المراحل مرتبة تسلسلياً
      const stages = result.learningPath.stages;
      for (let i = 0; i < stages.length; i++) {
        expect(stages[i].order).toBe(i + 1);
        
        // التحقق من المسبقات (إذا كانت موجودة)
        if (stages[i].prerequisites && stages[i].prerequisites.length > 0) {
          stages[i].prerequisites.forEach(prereq => {
            expect(prereq).toBeLessThan(stages[i].order);
          });
        }
      }

      // التحقق من أن المرحلة الأولى ليس لها مسبقات
      if (stages[0].prerequisites) {
        expect(stages[0].prerequisites.length).toBe(0);
      }
    });

    test('should calculate improvement metrics correctly', async () => {
      // بيانات مستخدم
      const user = {
        _id: 'user_005',
        computerSkills: [
          { skill: 'javascript', proficiency: 'intermediate' },
          { skill: 'html', proficiency: 'beginner' },
          { skill: 'css', proficiency: 'beginner' }
        ],
        bio: 'مطور ويب'
      };

      // بيانات وظائف
      const targetJobs = [
        {
          _id: 'job_005',
          title: 'مطور ويب كامل',
          description: 'مطلوب مطور ويب كامل',
          requirements: 'JavaScript, React, Node.js, MongoDB, HTML, CSS',
          postedBy: {
            companyName: 'شركة الويب',
            companyIndustry: 'ويب'
          },
          status: 'Open'
        }
      ];

      // توليد مسار التعلم
      const result = await learningPathService.generatePersonalizedLearningPath(
        user,
        targetJobs
      );

      // التحقق من النجاح
      expect(result.success).toBe(true);
      expect(result.learningPath).toBeDefined();

      // التحقق من مقاييس التحسين
      const metrics = result.learningPath.improvementMetrics;
      expect(metrics.skillCoverageIncrease).toBeGreaterThanOrEqual(0);
      expect(metrics.skillCoverageIncrease).toBeLessThanOrEqual(100);
      expect(metrics.employmentOpportunityIncrease).toBeGreaterThanOrEqual(0);
      expect(metrics.employmentOpportunityIncrease).toBeLessThanOrEqual(100);
      expect(metrics.salaryIncreasePotential).toBeGreaterThanOrEqual(0);
      expect(metrics.confidenceLevel).toBeGreaterThanOrEqual(0);
      expect(metrics.confidenceLevel).toBeLessThanOrEqual(1);
    });

    test('should generate appropriate path pattern based on skill gaps', async () => {
      // بيانات مستخدم مع فجوات كبيرة
      const userWithLargeGaps = {
        _id: 'user_006',
        computerSkills: [
          { skill: 'javascript', proficiency: 'beginner' }
        ],
        bio: 'مبتدئ'
      };

      // بيانات مستخدم مع فجوات صغيرة
      const userWithSmallGaps = {
        _id: 'user_007',
        computerSkills: [
          { skill: 'javascript', proficiency: 'advanced' },
          { skill: 'react', proficiency: 'intermediate' },
          { skill: 'nodejs', proficiency: 'intermediate' },
          { skill: 'mongodb', proficiency: 'beginner' }
        ],
        bio: 'مطور متقدم'
      };

      // نفس الوظائف لكلا المستخدمين
      const targetJobs = [
        {
          _id: 'job_006',
          title: 'مطور ويب متقدم',
          description: 'مطلوب مطور ويب متقدم',
          requirements: 'JavaScript, React, Node.js, MongoDB, TypeScript, AWS',
          postedBy: {
            companyName: 'شركة التكنولوجيا',
            companyIndustry: 'تكنولوجيا'
          },
          status: 'Open'
        }
      ];

      // توليد مسار للمستخدم مع فجوات كبيرة
      const result1 = await learningPathService.generatePersonalizedLearningPath(
        userWithLargeGaps,
        targetJobs
      );

      // توليد مسار للمستخدم مع فجوات صغيرة
      const result2 = await learningPathService.generatePersonalizedLearningPath(
        userWithSmallGaps,
        targetJobs
      );

      // التحقق من النجاح
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // التحقق من أن أنماط المسارات مختلفة
      // (قد يكون من الصعب التنبؤ بالنمط الدقيق، ولكن يمكننا التحقق من وجوده)
      expect(result1.analysis.pathPattern).toBeDefined();
      expect(result2.analysis.pathPattern).toBeDefined();

      // التحقق من أن مقاييس التحسين مختلفة
      expect(result1.learningPath.improvementMetrics.skillCoverageIncrease)
        .not.toBe(result2.learningPath.improvementMetrics.skillCoverageIncrease);
    });
  });

  describe('Helper Methods', () => {
    test('aggregateMissingSkills should combine skills from multiple analyses', () => {
      const skillGapAnalyses = [
        {
          jobId: 'job_001',
          jobTitle: 'مطور ويب',
          missingSkills: [
            { name: 'react', importance: 0.8, category: 'programming', priority: 0.9 },
            { name: 'nodejs', importance: 0.7, category: 'programming', priority: 0.8 }
          ]
        },
        {
          jobId: 'job_002',
          jobTitle: 'مطور تطبيقات',
          missingSkills: [
            { name: 'react', importance: 0.9, category: 'programming', priority: 0.95 },
            { name: 'typescript', importance: 0.6, category: 'programming', priority: 0.7 }
          ]
        }
      ];

      const aggregatedSkills = learningPathService.aggregateMissingSkills(skillGapAnalyses);

      // التحقق من تجميع المهارات
      expect(aggregatedSkills.length).toBe(3); // react, nodejs, typescript
      
      // التحقق من أن react موجودة مرة واحدة مع أعلى أهمية
      const reactSkill = aggregatedSkills.find(s => s.name === 'react');
      expect(reactSkill).toBeDefined();
      expect(reactSkill.frequency).toBe(2);
      expect(reactSkill.importance).toBe(0.9); // أعلى أهمية
      expect(reactSkill.priority).toBe(0.95); // أعلى أولوية
      expect(reactSkill.requiredByJobs.length).toBe(2);

      // التحقق من الترتيب حسب الأولوية
      expect(aggregatedSkills[0].priority).toBeGreaterThanOrEqual(aggregatedSkills[1].priority);
      expect(aggregatedSkills[1].priority).toBeGreaterThanOrEqual(aggregatedSkills[2].priority);
    });

    test('determineTargetLevel should assign appropriate target level', () => {
      expect(learningPathService.determineTargetLevel(0.9, 0.95)).toBe('advanced');
      expect(learningPathService.determineTargetLevel(0.7, 0.65)).toBe('intermediate');
      expect(learningPathService.determineTargetLevel(0.4, 0.5)).toBe('beginner');
      expect(learningPathService.determineTargetLevel(0.6, 0.8)).toBe('advanced'); // أولوية عالية
      expect(learningPathService.determineTargetLevel(0.8, 0.5)).toBe('advanced'); // أهمية عالية
    });

    test('calculateStageDuration should sum course hours', () => {
      const courses = [
        { duration: '30 ساعة' },
        { duration: '20 ساعة' },
        { duration: '25 ساعة' },
        { duration: 'غير محدد' } // سيتم استخدام القيمة الافتراضية
      ];

      const duration = learningPathService.calculateStageDuration(courses);
      
      // 30 + 20 + 25 + 20 (افتراضي) = 95 ساعة
      expect(duration.hours).toBe(95);
      expect(duration.weeks).toBe(10); // 95 / 10 = 9.5، مقربة إلى 10
    });

    test('calculateTargetCompletionDate should calculate date based on hours', () => {
      const totalHours = 100;
      const weeklyHours = 10;
      const targetDate = learningPathService.calculateTargetCompletionDate(totalHours, weeklyHours);
      
      expect(targetDate).toBeInstanceOf(Date);
      
      // التحقق من أن التاريخ في المستقبل
      expect(targetDate.getTime()).toBeGreaterThan(Date.now());
      
      // التحقق من أن التاريخ تقريباً بعد 10 أسابيع (100 ساعة / 10 ساعات أسبوعياً)
      const expectedWeeks = 10;
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + (expectedWeeks * 7));
      
      // السماح بفرق يوم واحد بسبب التقريب
      const dayDiff = Math.abs(targetDate.getDate() - expectedDate.getDate());
      expect(dayDiff).toBeLessThanOrEqual(1);
    });
  });
});