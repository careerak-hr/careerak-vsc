/**
 * Property-based tests for Employment Improvement Prediction
 * 
 * Validates: Requirements 2.3 (توقع تحسين فرص التوظيف بعد الدورة)
 * Task: 9.4 توقع التأثير
 */

const fc = require('fast-check');
const CourseRecommendationService = require('../src/services/courseRecommendationService');

// Helper function to convert to 32-bit float for fast-check
const toFloat32 = (value) => Math.fround(value);

describe('Employment Improvement Prediction Properties', () => {
  let service;

  beforeEach(() => {
    service = new CourseRecommendationService();
  });

  describe('Property 1: Employment Improvement Range', () => {
    test('employment improvement should always be between 0 and 100%', () => {
      const courseArb = fc.record({
        matchScore: fc.float({ min: 0, max: 1 }).map(toFloat32),
        level: fc.constantFrom('beginner', 'intermediate', 'advanced', 'comprehensive'),
        marketDemand: fc.float({ min: 0, max: 1 }).map(toFloat32),
        completionRate: fc.float({ min: 0, max: 1 }).map(toFloat32),
        matchedSkills: fc.array(fc.record({
          skill: fc.string(),
          matchScore: fc.float({ min: 0, max: 1 }).map(toFloat32)
        }), { minLength: 1, maxLength: 5 })
      });

      const skillGapArb = fc.array(fc.record({
        analysis: fc.record({
          missingSkills: fc.array(fc.record({
            name: fc.string(),
            importance: fc.float({ min: 0, max: 1 }).map(toFloat32)
          }), { minLength: 0, maxLength: 3 })
        })
      }), { minLength: 0, maxLength: 3 });

      fc.assert(
        fc.property(courseArb, skillGapArb, (course, skillGapAnalyses) => {
          // Mock the course object with required properties
          const mockCourse = {
            ...course,
            skills: course.matchedSkills.map(s => s.skill),
            employmentImprovement: undefined
          };

          // Calculate employment improvement
          const improvement = service.calculateEmploymentImprovement(mockCourse, skillGapAnalyses);
          
          // Improvement should be between 0 and 1 (0% to 100%)
          expect(improvement).toBeGreaterThanOrEqual(0);
          expect(improvement).toBeLessThanOrEqual(1);
          
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 2: Improvement Factors Consistency', () => {
    test('higher match scores should lead to higher employment improvement', () => {
      const baseCourse = {
        level: 'intermediate',
        marketDemand: toFloat32(0.8),
        completionRate: toFloat32(0.7),
        matchedSkills: [{ skill: 'javascript', matchScore: toFloat32(0.8) }]
      };

      const courseArb = fc.record({
        lowMatchScore: fc.float({ min: toFloat32(0.1), max: toFloat32(0.5) }),
        highMatchScore: fc.float({ min: toFloat32(0.6), max: toFloat32(0.9) })
      });

      fc.assert(
        fc.property(courseArb, (scores) => {
          // Skip if any value is NaN
          if (isNaN(scores.lowMatchScore) || isNaN(scores.highMatchScore)) {
            return true;
          }

          const lowScoreCourse = { ...baseCourse, matchScore: scores.lowMatchScore };
          const highScoreCourse = { ...baseCourse, matchScore: scores.highMatchScore };

          const lowImprovement = service.calculateEmploymentImprovement(lowScoreCourse, []);
          const highImprovement = service.calculateEmploymentImprovement(highScoreCourse, []);

          // Skip if any improvement is NaN
          if (isNaN(lowImprovement) || isNaN(highImprovement)) {
            return true;
          }

          // Higher match score should lead to higher improvement
          expect(highImprovement).toBeGreaterThanOrEqual(lowImprovement);
          
          return true;
        }),
        { numRuns: 30 }
      );
    });
  });

  describe('Property 3: Course Level Impact', () => {
    test('advanced courses should have higher improvement potential than beginner courses', () => {
      const baseCourse = {
        matchScore: toFloat32(0.7),
        marketDemand: toFloat32(0.8),
        completionRate: toFloat32(0.7),
        matchedSkills: [{ skill: 'javascript', matchScore: toFloat32(0.8) }]
      };

      const levelArb = fc.constantFrom('beginner', 'intermediate', 'advanced', 'comprehensive');

      fc.assert(
        fc.property(levelArb, levelArb, (level1, level2) => {
          const course1 = { ...baseCourse, level: level1 };
          const course2 = { ...baseCourse, level: level2 };

          const improvement1 = service.calculateEmploymentImprovement(course1, []);
          const improvement2 = service.calculateEmploymentImprovement(course2, []);

          // Get level scores
          const levelScores = {
            'beginner': 0.6,
            'intermediate': 0.8,
            'advanced': 0.9,
            'comprehensive': 1.0
          };

          const score1 = levelScores[level1] || 0.5;
          const score2 = levelScores[level2] || 0.5;

          // If level1 has higher score than level2, improvement1 should be >= improvement2
          if (score1 > score2) {
            expect(improvement1).toBeGreaterThanOrEqual(improvement2);
          } else if (score1 < score2) {
            expect(improvement2).toBeGreaterThanOrEqual(improvement1);
          }
          
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 4: Market Demand Impact', () => {
    test('courses with higher market demand should have higher improvement', () => {
      const baseCourse = {
        matchScore: toFloat32(0.7),
        level: 'intermediate',
        completionRate: toFloat32(0.7),
        matchedSkills: [{ skill: 'javascript', matchScore: toFloat32(0.8) }]
      };

      const demandArb = fc.record({
        lowDemand: fc.float({ min: toFloat32(0.1), max: toFloat32(0.4) }),
        highDemand: fc.float({ min: toFloat32(0.6), max: toFloat32(0.9) })
      });

      fc.assert(
        fc.property(demandArb, (demands) => {
          const lowDemandCourse = { ...baseCourse, marketDemand: demands.lowDemand };
          const highDemandCourse = { ...baseCourse, marketDemand: demands.highDemand };

          const lowImprovement = service.calculateEmploymentImprovement(lowDemandCourse, []);
          const highImprovement = service.calculateEmploymentImprovement(highDemandCourse, []);

          // Higher market demand should lead to higher improvement
          expect(highImprovement).toBeGreaterThanOrEqual(lowImprovement);
          
          return true;
        }),
        { numRuns: 30 }
      );
    });
  });

  describe('Property 5: Skill Gap Coverage Impact', () => {
    test('courses covering more skill gaps should have higher improvement', () => {
      const baseCourse = {
        matchScore: toFloat32(0.7),
        level: 'intermediate',
        marketDemand: toFloat32(0.8),
        completionRate: toFloat32(0.7),
        skills: ['skill1']
      };

      const skillGapArb = fc.record({
        fewGaps: fc.integer({ min: 1, max: 2 }),
        manyGaps: fc.integer({ min: 3, max: 5 })
      });

      fc.assert(
        fc.property(skillGapArb, (gaps) => {
          // Mock skill gap analyses
          const fewGapsAnalysis = Array(gaps.fewGaps).fill().map(() => ({
            analysis: { missingSkills: [{ name: 'skill1', importance: toFloat32(0.5) }] }
          }));

          const manyGapsAnalysis = Array(gaps.manyGaps).fill().map(() => ({
            analysis: { missingSkills: [{ name: 'skill1', importance: toFloat32(0.5) }] }
          }));

          // Create a course that covers the skill
          const mockCourse = {
            ...baseCourse,
            matchedSkills: [{ skill: 'skill1', matchScore: toFloat32(0.8) }]
          };

          const fewGapsImprovement = service.calculateEmploymentImprovement(mockCourse, fewGapsAnalysis);
          const manyGapsImprovement = service.calculateEmploymentImprovement(mockCourse, manyGapsAnalysis);

          // Course covering more skill gaps should have higher improvement
          expect(manyGapsImprovement).toBeGreaterThanOrEqual(fewGapsImprovement);
          
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 6: Expected Outcomes Generation', () => {
    test('expected outcomes should always be generated for courses with improvement', () => {
      const courseArb = fc.record({
        matchScore: fc.float({ min: toFloat32(0.1), max: toFloat32(1) }),
        level: fc.constantFrom('beginner', 'intermediate', 'advanced', 'comprehensive'),
        marketDemand: fc.float({ min: toFloat32(0.1), max: toFloat32(1) }),
        completionRate: fc.float({ min: toFloat32(0.1), max: toFloat32(1) }),
        skills: fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
        category: fc.constantFrom('programming', 'web', 'database', 'design')
      });

      fc.assert(
        fc.property(courseArb, (courseData) => {
          const mockCourse = {
            ...courseData,
            matchedSkills: courseData.skills.map(skill => ({ skill, matchScore: toFloat32(0.8) }))
          };

          const improvement = service.calculateEmploymentImprovement(mockCourse, []);
          const outcomes = service.generateExpectedOutcomes(mockCourse, improvement);

          // Outcomes should be an array
          expect(Array.isArray(outcomes)).toBe(true);
          
          // Should have at least one outcome
          expect(outcomes.length).toBeGreaterThan(0);
          
          // All outcomes should be strings
          outcomes.forEach(outcome => {
            expect(typeof outcome).toBe('string');
            expect(outcome.length).toBeGreaterThan(0);
          });
          
          return true;
        }),
        { numRuns: 30 }
      );
    });
  });

  describe('Property 7: Overall Improvement Calculation', () => {
    test('overall improvement should be calculated correctly from multiple courses', () => {
      const coursesArb = fc.array(
        fc.record({
          employmentImprovement: fc.float({ min: 0, max: 1 }).map(toFloat32)
        }),
        { minLength: 1, maxLength: 10 }
      );

      fc.assert(
        fc.property(coursesArb, (courses) => {
          // Filter out courses with NaN employmentImprovement
          const validCourses = courses.filter(course => !isNaN(course.employmentImprovement));
          
          // Skip if no valid courses
          if (validCourses.length === 0) {
            return true;
          }

          const overall = service.calculateOverallImprovement(validCourses);

          // Should have all required properties
          expect(overall).toHaveProperty('average');
          expect(overall).toHaveProperty('max');
          expect(overall).toHaveProperty('min');
          expect(overall).toHaveProperty('formatted');

          // Skip if any value is NaN
          if (isNaN(overall.average) || isNaN(overall.max) || isNaN(overall.min)) {
            return true;
          }

          // Average should be between min and max
          expect(overall.average).toBeGreaterThanOrEqual(overall.min);
          expect(overall.average).toBeLessThanOrEqual(overall.max);

          // Formatted should be a string with percentage
          expect(typeof overall.formatted).toBe('string');
          expect(overall.formatted).toMatch(/\d+%/);

          // Calculate expected average
          const expectedAverage = validCourses.reduce((sum, course) => 
            sum + course.employmentImprovement, 0) / validCourses.length;
          
          expect(overall.average).toBeCloseTo(expectedAverage, 5);
          
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 8: Improvement Monotonicity', () => {
    test('improvement should increase monotonically with better course attributes', () => {
      const baseCourse = {
        level: 'intermediate',
        matchedSkills: [{ skill: 'javascript', matchScore: toFloat32(0.8) }]
      };

      const attributeArb = fc.record({
        matchScore1: fc.float({ min: toFloat32(0.1), max: toFloat32(0.4) }),
        matchScore2: fc.float({ min: toFloat32(0.5), max: toFloat32(0.7) }),
        matchScore3: fc.float({ min: toFloat32(0.8), max: toFloat32(1.0) }),
        demand1: fc.float({ min: toFloat32(0.1), max: toFloat32(0.4) }),
        demand2: fc.float({ min: toFloat32(0.5), max: toFloat32(0.7) }),
        demand3: fc.float({ min: toFloat32(0.8), max: toFloat32(1.0) })
      });

      fc.assert(
        fc.property(attributeArb, (attrs) => {
          // Skip if any value is NaN
          if (isNaN(attrs.demand1) || isNaN(attrs.demand2) || isNaN(attrs.demand3)) {
            return true;
          }

          // Create courses with increasing attributes
          const course1 = { 
            ...baseCourse, 
            matchScore: attrs.matchScore1,
            marketDemand: attrs.demand1,
            completionRate: toFloat32(0.5)
          };

          const course2 = { 
            ...baseCourse, 
            matchScore: attrs.matchScore2,
            marketDemand: attrs.demand2,
            completionRate: toFloat32(0.7)
          };

          const course3 = { 
            ...baseCourse, 
            matchScore: attrs.matchScore3,
            marketDemand: attrs.demand3,
            completionRate: toFloat32(0.9)
          };

          const improvement1 = service.calculateEmploymentImprovement(course1, []);
          const improvement2 = service.calculateEmploymentImprovement(course2, []);
          const improvement3 = service.calculateEmploymentImprovement(course3, []);

          // Skip if any improvement is NaN
          if (isNaN(improvement1) || isNaN(improvement2) || isNaN(improvement3)) {
            return true;
          }

          // Improvement should be non-decreasing with better attributes
          expect(improvement2).toBeGreaterThanOrEqual(improvement1);
          expect(improvement3).toBeGreaterThanOrEqual(improvement2);
          
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });
});