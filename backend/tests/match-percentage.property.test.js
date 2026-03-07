/**
 * Property Test 20: Match Percentage Calculation
 * 
 * Property: For any job posting with required skills and any user profile with skills,
 * the match percentage should equal (number of matching skills / total job required skills) × 100.
 * 
 * Validates: Requirements 6.4
 * Feature: advanced-search-filter
 */

const fc = require('fast-check');
const MatchingEngine = require('../src/services/matchingEngine');

describe('Property 20: Match Percentage Calculation', () => {
  let matchingEngine;

  beforeEach(() => {
    matchingEngine = new MatchingEngine();
  });

  // Arbitrary لتوليد مهارة
  const skillArbitrary = () => fc.constantFrom(
    'JavaScript', 'Python', 'Java', 'React', 'Node.js',
    'MongoDB', 'SQL', 'Docker', 'AWS', 'Git',
    'TypeScript', 'Vue.js', 'Angular', 'Express', 'Django'
  );

  it('should calculate correct match percentage based on skills overlap', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary(), { minLength: 1, maxLength: 10 }).map(arr => [...new Set(arr)]),
        fc.array(skillArbitrary(), { minLength: 1, maxLength: 10 }).map(arr => [...new Set(arr)]),
        (jobSkills, userSkills) => {
          // حساب المطابقة باستخدام MatchingEngine
          const matchScore = matchingEngine.calculateSkillsMatch(jobSkills, userSkills);

          // حساب المطابقة المتوقعة يدوياً
          const matchedSkills = jobSkills.filter(skill =>
            userSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
          );
          const expectedScore = (matchedSkills.length / jobSkills.length) * 100;

          // التحقق من التطابق (مع هامش خطأ صغير للتقريب)
          const difference = Math.abs(matchScore - expectedScore);
          
          if (difference > 0.01) {
            console.log('Failed match calculation:');
            console.log('Job skills:', jobSkills);
            console.log('User skills:', userSkills);
            console.log('Matched skills:', matchedSkills);
            console.log('Expected:', expectedScore);
            console.log('Actual:', matchScore);
            return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return 100% when user has all required skills', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary(), { minLength: 1, maxLength: 10 }).map(arr => [...new Set(arr)]),
        (jobSkills) => {
          // المستخدم لديه جميع المهارات المطلوبة + مهارات إضافية
          const userSkills = [...jobSkills, 'ExtraSkill1', 'ExtraSkill2'];

          const matchScore = matchingEngine.calculateSkillsMatch(jobSkills, userSkills);

          // يجب أن تكون النتيجة 100%
          if (matchScore !== 100) {
            console.log('Failed: Should be 100% when user has all skills');
            console.log('Job skills:', jobSkills);
            console.log('User skills:', userSkills);
            console.log('Match score:', matchScore);
            return false;
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should return 0% when user has no matching skills', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary(), { minLength: 1, maxLength: 5 }).map(arr => [...new Set(arr)]),
        fc.array(skillArbitrary(), { minLength: 1, maxLength: 5 }).map(arr => [...new Set(arr)]),
        (jobSkills, userSkills) => {
          // التأكد من عدم وجود تقاطع
          const intersection = jobSkills.filter(skill =>
            userSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
          );

          // إذا كان هناك تقاطع، نتخطى هذا الاختبار
          if (intersection.length > 0) return true;

          const matchScore = matchingEngine.calculateSkillsMatch(jobSkills, userSkills);

          // يجب أن تكون النتيجة 0%
          if (matchScore !== 0) {
            console.log('Failed: Should be 0% when no matching skills');
            console.log('Job skills:', jobSkills);
            console.log('User skills:', userSkills);
            console.log('Match score:', matchScore);
            return false;
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should return 50% when user has exactly half of required skills', () => {
    const jobSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
    const userSkills = ['JavaScript', 'React']; // نصف المهارات

    const matchScore = matchingEngine.calculateSkillsMatch(jobSkills, userSkills);

    expect(matchScore).toBe(50);
  });

  it('should be case-insensitive', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary(), { minLength: 1, maxLength: 5 }).map(arr => [...new Set(arr)]),
        (skills) => {
          // تحويل المهارات إلى حالات مختلفة
          const jobSkills = skills.map(s => s.toUpperCase());
          const userSkills = skills.map(s => s.toLowerCase());

          const matchScore = matchingEngine.calculateSkillsMatch(jobSkills, userSkills);

          // يجب أن تكون النتيجة 100% (case-insensitive)
          if (matchScore !== 100) {
            console.log('Failed: Should be case-insensitive');
            console.log('Job skills:', jobSkills);
            console.log('User skills:', userSkills);
            console.log('Match score:', matchScore);
            return false;
          }

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should handle empty job skills (no requirements)', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary(), { minLength: 0, maxLength: 10 }),
        (userSkills) => {
          const jobSkills = [];
          const matchScore = matchingEngine.calculateSkillsMatch(jobSkills, userSkills);

          // يجب أن تكون النتيجة 100% (لا توجد متطلبات)
          if (matchScore !== 100) {
            console.log('Failed: Should be 100% when no job requirements');
            console.log('User skills:', userSkills);
            console.log('Match score:', matchScore);
            return false;
          }

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should handle empty user skills', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary(), { minLength: 1, maxLength: 10 }).map(arr => [...new Set(arr)]),
        (jobSkills) => {
          const userSkills = [];
          const matchScore = matchingEngine.calculateSkillsMatch(jobSkills, userSkills);

          // يجب أن تكون النتيجة 0% (المستخدم ليس لديه مهارات)
          if (matchScore !== 0) {
            console.log('Failed: Should be 0% when user has no skills');
            console.log('Job skills:', jobSkills);
            console.log('Match score:', matchScore);
            return false;
          }

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should be monotonic: more matching skills = higher percentage', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary(), { minLength: 3, maxLength: 10 }).map(arr => [...new Set(arr)]),
        (jobSkills) => {
          // تخطي إذا كان عدد المهارات أقل من 3
          if (jobSkills.length < 3) return true;

          // حالة 1: مهارة واحدة
          const userSkills1 = [jobSkills[0]];
          const score1 = matchingEngine.calculateSkillsMatch(jobSkills, userSkills1);

          // حالة 2: مهارتان
          const userSkills2 = [jobSkills[0], jobSkills[1]];
          const score2 = matchingEngine.calculateSkillsMatch(jobSkills, userSkills2);

          // حالة 3: ثلاث مهارات
          const userSkills3 = [jobSkills[0], jobSkills[1], jobSkills[2]];
          const score3 = matchingEngine.calculateSkillsMatch(jobSkills, userSkills3);

          // التحقق: score1 < score2 < score3
          if (!(score1 < score2 && score2 < score3)) {
            console.log('Failed: Should be monotonic');
            console.log('Score 1:', score1);
            console.log('Score 2:', score2);
            console.log('Score 3:', score3);
            return false;
          }

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should calculate overall match percentage correctly', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary(), { minLength: 1, maxLength: 10 }).map(arr => [...new Set(arr)]),
        fc.array(skillArbitrary(), { minLength: 1, maxLength: 10 }).map(arr => [...new Set(arr)]),
        (jobSkills, userSkills) => {
          const job = {
            skills: jobSkills,
            experienceLevel: 'Mid',
            educationLevel: 'Bachelor',
            location: { city: 'Cairo', country: 'Egypt' },
            salary: { min: 5000, max: 10000 },
            workType: 'Full-time'
          };

          const userProfile = {
            skills: userSkills,
            experience: 3,
            education: 'Bachelor',
            location: { city: 'Cairo', country: 'Egypt' },
            expectedSalary: 7000,
            preferredWorkType: ['Full-time']
          };

          const result = matchingEngine.calculateMatchPercentage(job, userProfile);

          // التحقق من وجود النتيجة والتفاصيل
          if (!result || typeof result.matchScore !== 'number') {
            console.log('Failed: Invalid result structure');
            return false;
          }

          // التحقق من أن النتيجة بين 0 و 100
          if (result.matchScore < 0 || result.matchScore > 100) {
            console.log('Failed: Match score out of range');
            console.log('Match score:', result.matchScore);
            return false;
          }

          // التحقق من وجود breakdown
          if (!result.breakdown || typeof result.breakdown.skills !== 'number') {
            console.log('Failed: Invalid breakdown structure');
            return false;
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
