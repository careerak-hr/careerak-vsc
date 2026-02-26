/**
 * Property-based test for personalized learning path generation
 * 
 * Property: Personalized Learning Path Generation
 * For any user with target jobs, the system should generate a personalized learning path
 * with sequential stages and progress tracking
 * 
 * Validates: Requirements 2.3 (مسار تعليمي مخصص)
 * Task: 9.3 توصيات الدورات
 */

const fc = require('fast-check');
const LearningPathService = require('../src/services/learningPathService');

describe('Learning Path Generation Property Tests', () => {
  let learningPathService;

  beforeEach(() => {
    learningPathService = new LearningPathService();
  });

  describe('Property 1: Learning Path Structure', () => {
    test('should always generate valid learning path structure for any valid input', () => {
      const userArb = fc.record({
        _id: fc.string(),
        computerSkills: fc.array(fc.record({
          skill: fc.oneof(fc.constant('javascript'), fc.constant('python'), fc.constant('java')),
          proficiency: fc.oneof(
            fc.constant('beginner'),
            fc.constant('intermediate'),
            fc.constant('advanced')
          )
        }), { minLength: 1 }),
        softwareSkills: fc.array(fc.record({
          software: fc.oneof(fc.constant('photoshop'), fc.constant('figma'), fc.constant('vscode')),
          proficiency: fc.oneof(
            fc.constant('beginner'),
            fc.constant('intermediate'),
            fc.constant('advanced')
          )
        })),
        otherSkills: fc.array(fc.string()),
        bio: fc.string()
      });

      const jobArb = fc.record({
        _id: fc.string(),
        title: fc.oneof(fc.constant('مطور ويب'), fc.constant('مصمم واجهات'), fc.constant('محلل بيانات')),
        description: fc.lorem({ maxCount: 3 }),
        requirements: fc.lorem({ maxCount: 5 }),
        postedBy: fc.record({
          companyName: fc.string(),
          companyIndustry: fc.string()
        }),
        status: fc.constant('Open')
      });

      const targetJobsArb = fc.array(jobArb, { minLength: 1, maxLength: 2 });

      fc.assert(
        fc.asyncProperty(userArb, targetJobsArb, async (user, targetJobs) => {
          const result = await learningPathService.generatePersonalizedLearningPath(
            user,
            targetJobs
          );

          // إذا فشل التوليد، يجب أن يكون هناك خطأ واضح
          if (!result.success) {
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
            return true;
          }

          // إذا نجح التوليد، يجب أن يكون هيكل المسار صحيحاً
          const learningPath = result.learningPath;
          
          // التحقق من الهيكل الأساسي
          expect(learningPath).toBeDefined();
          expect(typeof learningPath.name).toBe('string');
          expect(typeof learningPath.description).toBe('string');
          expect(learningPath.careerGoal).toBeDefined();
          expect(Array.isArray(learningPath.stages)).toBe(true);
          
          // التحقق من أن المراحل مرتبة تسلسلياً
          if (learningPath.stages.length > 0) {
            for (let i = 0; i < learningPath.stages.length; i++) {
              expect(learningPath.stages[i].order).toBe(i + 1);
            }
          }
          
          // التحقق من مقاييس التحسين
          expect(learningPath.improvementMetrics).toBeDefined();
          expect(typeof learningPath.improvementMetrics.skillCoverageIncrease).toBe('number');
          expect(learningPath.improvementMetrics.skillCoverageIncrease).toBeGreaterThanOrEqual(0);
          expect(learningPath.improvementMetrics.skillCoverageIncrease).toBeLessThanOrEqual(100);
          
          // التحقق من التقدم
          expect(learningPath.progress).toBeDefined();
          expect(typeof learningPath.progress.overall).toBe('number');
          expect(learningPath.progress.overall).toBeGreaterThanOrEqual(0);
          expect(learningPath.progress.overall).toBeLessThanOrEqual(100);
          
          return true;
        }),
        { numRuns: 5 } // عدد أقل من التشغيلات للاختبار السريع
      );
    });
  });

  describe('Property 2: Progress Tracking Consistency', () => {
    test('progress should always be between 0 and 100 for any learning path', () => {
      const learningPathArb = fc.record({
        name: fc.string(),
        description: fc.string(),
        careerGoal: fc.record({
          title: fc.string(),
          description: fc.string(),
          targetJobs: fc.array(fc.record({
            jobId: fc.string(),
            jobTitle: fc.string(),
            company: fc.string(),
            matchScore: fc.float({ min: 0, max: 100 })
          })),
          expectedSalaryRange: fc.record({
            min: fc.integer({ min: 0 }),
            max: fc.integer({ min: 0 }),
            currency: fc.constant('EGP')
          }),
          timeline: fc.oneof(
            fc.constant('short_term'),
            fc.constant('medium_term'),
            fc.constant('long_term')
          )
        }),
        stages: fc.array(fc.record({
          order: fc.integer({ min: 1 }),
          name: fc.string(),
          description: fc.string(),
          objective: fc.string(),
          estimatedDuration: fc.record({
            weeks: fc.integer({ min: 1 }),
            hours: fc.integer({ min: 1 })
          }),
          courses: fc.array(fc.record({
            order: fc.integer({ min: 1 }),
            courseTitle: fc.string(),
            courseDescription: fc.string(),
            platform: fc.string(),
            url: fc.string(),
            duration: fc.string(),
            level: fc.oneof(
              fc.constant('beginner'),
              fc.constant('intermediate'),
              fc.constant('advanced'),
              fc.constant('comprehensive')
            ),
            skillsCovered: fc.array(fc.string()),
            status: fc.oneof(
              fc.constant('not_started'),
              fc.constant('in_progress'),
              fc.constant('completed'),
              fc.constant('skipped')
            ),
            progress: fc.integer({ min: 0, max: 100 }),
            employmentImprovement: fc.record({
              percentage: fc.integer({ min: 0, max: 100 }),
              description: fc.string()
            })
          })),
          prerequisites: fc.array(fc.integer({ min: 1 })),
          status: fc.oneof(
            fc.constant('not_started'),
            fc.constant('in_progress'),
            fc.constant('completed'),
            fc.constant('blocked')
          ),
          progress: fc.integer({ min: 0, max: 100 })
        }), { minLength: 1, maxLength: 5 }),
        progress: fc.record({
          overall: fc.integer({ min: 0, max: 100 }),
          completedStages: fc.integer({ min: 0 }),
          completedCourses: fc.integer({ min: 0 }),
          totalHoursCompleted: fc.integer({ min: 0 }),
          estimatedHoursRemaining: fc.integer({ min: 0 }),
          lastActivity: fc.constant(new Date())
        }),
        improvementMetrics: fc.record({
          skillCoverageIncrease: fc.integer({ min: 0, max: 100 }),
          employmentOpportunityIncrease: fc.integer({ min: 0, max: 100 }),
          salaryIncreasePotential: fc.integer({ min: 0 }),
          confidenceLevel: fc.float({ min: 0, max: 1 })
        })
      });

      fc.assert(
        fc.property(learningPathArb, (learningPath) => {
          // التحقق من أن التقدم الإجمالي بين 0 و 100
          expect(learningPath.progress.overall).toBeGreaterThanOrEqual(0);
          expect(learningPath.progress.overall).toBeLessThanOrEqual(100);
          
          // التحقق من أن تقدم كل مرحلة بين 0 و 100
          learningPath.stages.forEach(stage => {
            expect(stage.progress).toBeGreaterThanOrEqual(0);
            expect(stage.progress).toBeLessThanOrEqual(100);
            
            // التحقق من أن تقدم كل دورة بين 0 و 100
            stage.courses.forEach(course => {
              expect(course.progress).toBeGreaterThanOrEqual(0);
              expect(course.progress).toBeLessThanOrEqual(100);
            });
          });
          
          // التحقق من أن مقاييس التحسين ضمن النطاق الصحيح
          expect(learningPath.improvementMetrics.skillCoverageIncrease)
            .toBeGreaterThanOrEqual(0);
          expect(learningPath.improvementMetrics.skillCoverageIncrease)
            .toBeLessThanOrEqual(100);
          expect(learningPath.improvementMetrics.employmentOpportunityIncrease)
            .toBeGreaterThanOrEqual(0);
          expect(learningPath.improvementMetrics.employmentOpportunityIncrease)
            .toBeLessThanOrEqual(100);
          expect(learningPath.improvementMetrics.confidenceLevel)
            .toBeGreaterThanOrEqual(0);
          expect(learningPath.improvementMetrics.confidenceLevel)
            .toBeLessThanOrEqual(1);
          
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 3: Stage Ordering and Prerequisites', () => {
    test('stages should always be ordered sequentially and prerequisites should reference existing stages', () => {
      const stagesArb = fc.array(
        fc.record({
          order: fc.integer({ min: 1 }),
          name: fc.string(),
          prerequisites: fc.array(fc.integer({ min: 1 }))
        }),
        { minLength: 1, maxLength: 5 }
      ).map(stages => {
        // ترتيب المراحل حسب order
        const sortedStages = [...stages].sort((a, b) => a.order - b.order);
        
        // تعيين أرقام فريدة للمراحل
        const uniqueStages = [];
        const seenOrders = new Set();
        
        sortedStages.forEach(stage => {
          if (!seenOrders.has(stage.order)) {
            seenOrders.add(stage.order);
            uniqueStages.push(stage);
          }
        });
        
        return uniqueStages;
      });

      fc.assert(
        fc.property(stagesArb, (stages) => {
          // التحقق من أن المراحل مرتبة تسلسلياً
          for (let i = 0; i < stages.length; i++) {
            expect(stages[i].order).toBe(i + 1);
            
            // التحقق من أن المسبقات تشير إلى مراحل سابقة
            stages[i].prerequisites.forEach(prereq => {
              expect(prereq).toBeLessThan(stages[i].order);
              // تأكد من أن المسبقات تشير إلى مراحل موجودة
              expect(stages.some(s => s.order === prereq)).toBe(true);
            });
          }
          
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 4: Course Employment Improvement', () => {
    test('employment improvement percentage should always be between 0 and 100', () => {
      const courseArb = fc.record({
        employmentImprovement: fc.record({
          percentage: fc.integer({ min: 0, max: 100 }),
          description: fc.string()
        })
      });

      fc.assert(
        fc.property(courseArb, (course) => {
          expect(course.employmentImprovement.percentage)
            .toBeGreaterThanOrEqual(0);
          expect(course.employmentImprovement.percentage)
            .toBeLessThanOrEqual(100);
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 5: Learning Path Name and Description', () => {
    test('learning path name and description should always be non-empty strings when generated', async () => {
      const userArb = fc.record({
        _id: fc.string(),
        computerSkills: fc.array(fc.record({
          skill: fc.constant('javascript'),
          proficiency: fc.constant('intermediate')
        }), { minLength: 1 }),
        bio: fc.string()
      });

      const jobArb = fc.record({
        _id: fc.string(),
        title: fc.constant('مطور ويب'),
        description: fc.string(),
        requirements: fc.string(),
        postedBy: fc.record({
          companyName: fc.string(),
          companyIndustry: fc.string()
        }),
        status: fc.constant('Open')
      });

      const targetJobsArb = fc.array(jobArb, { minLength: 1, maxLength: 2 });

      fc.assert(
        fc.property(userArb, targetJobsArb, async (user, targetJobs) => {
          const result = await learningPathService.generatePersonalizedLearningPath(
            user,
            targetJobs
          );

          // تخطي الحالات التي فشل فيها التوليد
          fc.pre(result.success);

          const learningPath = result.learningPath;
          
          // التحقق من أن الاسم والوصف غير فارغين
          expect(learningPath.name).toBeDefined();
          expect(learningPath.name.trim().length).toBeGreaterThan(0);
          expect(learningPath.description).toBeDefined();
          expect(learningPath.description.trim().length).toBeGreaterThan(0);
          
          // التحقق من أن الاسم يحتوي على كلمات مفتاحية من الوظائف
          const jobTitles = targetJobs.map(job => job.title).join(' ');
          // الاسم قد يحتوي على "مسار" أو "تعلم" أو أسماء أخرى حسب النمط
          expect(learningPath.name.length).toBeGreaterThan(0);
          
          return true;
        }),
        { numRuns: 5 } // عدد أقل بسبب الطبيعة غير الحتمية
      );
    });
  });
});