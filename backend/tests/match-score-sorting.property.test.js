/**
 * Property Test 19: Match Score Sorting
 * 
 * Property: For any search results with calculated match scores,
 * the results should be sorted in descending order by match score (highest match first).
 * 
 * Validates: Requirements 6.3
 * Feature: advanced-search-filter
 */

const fc = require('fast-check');
const MatchingEngine = require('../src/services/matchingEngine');

describe('Property 19: Match Score Sorting', () => {
  let matchingEngine;

  beforeEach(() => {
    matchingEngine = new MatchingEngine();
  });

  // Arbitrary لتوليد مهارة
  const skillArbitrary = () => fc.constantFrom(
    'JavaScript', 'Python', 'Java', 'React', 'Node.js',
    'MongoDB', 'SQL', 'Docker', 'AWS', 'Git'
  );

  // Arbitrary لتوليد وظيفة
  const jobArbitrary = () => fc.record({
    _id: fc.string({ minLength: 24, maxLength: 24 }),
    title: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.string({ minLength: 20, maxLength: 200 }),
    skills: fc.array(skillArbitrary(), { minLength: 1, maxLength: 5 }),
    experienceLevel: fc.constantFrom('Entry', 'Mid', 'Senior'),
    educationLevel: fc.constantFrom('Bachelor', 'Master', 'PhD'),
    location: fc.record({
      city: fc.constantFrom('Cairo', 'Alexandria', 'Giza'),
      country: fc.constant('Egypt')
    }),
    salary: fc.record({
      min: fc.integer({ min: 3000, max: 10000 }),
      max: fc.integer({ min: 10000, max: 30000 })
    }),
    workType: fc.constantFrom('Full-time', 'Part-time', 'Remote'),
    toObject: fc.constant(function() { return this; })
  });

  // Arbitrary لملف المستخدم
  const userProfileArbitrary = () => fc.record({
    skills: fc.array(skillArbitrary(), { minLength: 1, maxLength: 8 }),
    experience: fc.integer({ min: 0, max: 15 }),
    education: fc.constantFrom('Bachelor', 'Master', 'PhD'),
    location: fc.record({
      city: fc.constantFrom('Cairo', 'Alexandria', 'Giza'),
      country: fc.constant('Egypt')
    }),
    expectedSalary: fc.integer({ min: 5000, max: 20000 }),
    preferredWorkType: fc.array(
      fc.constantFrom('Full-time', 'Part-time', 'Remote'),
      { minLength: 1, maxLength: 3 }
    )
  });

  it('should sort results in descending order by match score', () => {
    fc.assert(
      fc.property(
        fc.array(jobArbitrary(), { minLength: 3, maxLength: 20 }),
        userProfileArbitrary(),
        (jobs, userProfile) => {
          // ترتيب الوظائف حسب المطابقة
          const rankedJobs = matchingEngine.rankByMatch(jobs, userProfile);

          // التحقق: كل وظيفة يجب أن يكون لها matchScore
          for (const job of rankedJobs) {
            if (typeof job.matchScore !== 'number') {
              console.log('Failed: Missing matchScore');
              return false;
            }
          }

          // التحقق: الترتيب تنازلي
          for (let i = 0; i < rankedJobs.length - 1; i++) {
            if (rankedJobs[i].matchScore < rankedJobs[i + 1].matchScore) {
              console.log('Failed: Not sorted in descending order');
              console.log(`Job ${i} score:`, rankedJobs[i].matchScore);
              console.log(`Job ${i+1} score:`, rankedJobs[i + 1].matchScore);
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should preserve all jobs in the sorted results', () => {
    fc.assert(
      fc.property(
        fc.array(jobArbitrary(), { minLength: 5, maxLength: 15 }),
        userProfileArbitrary(),
        (jobs, userProfile) => {
          const rankedJobs = matchingEngine.rankByMatch(jobs, userProfile);

          // التحقق: نفس العدد
          if (rankedJobs.length !== jobs.length) {
            console.log('Failed: Different number of jobs');
            console.log('Original:', jobs.length);
            console.log('Ranked:', rankedJobs.length);
            return false;
          }

          // التحقق: جميع الوظائف موجودة
          const originalIds = new Set(jobs.map(j => j._id));
          const rankedIds = new Set(rankedJobs.map(j => j._id));

          for (const id of originalIds) {
            if (!rankedIds.has(id)) {
              console.log('Failed: Missing job in ranked results');
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should add matchScore, matchBreakdown, and matchDetails to each job', () => {
    fc.assert(
      fc.property(
        fc.array(jobArbitrary(), { minLength: 2, maxLength: 10 }),
        userProfileArbitrary(),
        (jobs, userProfile) => {
          const rankedJobs = matchingEngine.rankByMatch(jobs, userProfile);

          // التحقق: كل وظيفة يجب أن تحتوي على الحقول الجديدة
          for (const job of rankedJobs) {
            if (typeof job.matchScore !== 'number') {
              console.log('Failed: Missing matchScore');
              return false;
            }

            if (!job.matchBreakdown || typeof job.matchBreakdown !== 'object') {
              console.log('Failed: Missing or invalid matchBreakdown');
              return false;
            }

            if (!Array.isArray(job.matchDetails)) {
              console.log('Failed: Missing or invalid matchDetails');
              return false;
            }

            // التحقق من breakdown
            const requiredKeys = ['skills', 'experience', 'education', 'location', 'salary', 'workType'];
            for (const key of requiredKeys) {
              if (typeof job.matchBreakdown[key] !== 'number') {
                console.log(`Failed: Missing or invalid breakdown.${key}`);
                return false;
              }
            }
          }

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should handle jobs with identical match scores', () => {
    // إنشاء وظائف متطابقة
    const identicalJob = {
      _id: '123456789012345678901234',
      title: 'Software Engineer',
      description: 'Great opportunity',
      skills: ['JavaScript', 'React'],
      experienceLevel: 'Mid',
      educationLevel: 'Bachelor',
      location: { city: 'Cairo', country: 'Egypt' },
      salary: { min: 5000, max: 10000 },
      workType: 'Full-time',
      toObject: function() { return this; }
    };

    const jobs = [
      { ...identicalJob, _id: '111111111111111111111111' },
      { ...identicalJob, _id: '222222222222222222222222' },
      { ...identicalJob, _id: '333333333333333333333333' }
    ];

    const userProfile = {
      skills: ['JavaScript', 'React'],
      experience: 3,
      education: 'Bachelor',
      location: { city: 'Cairo', country: 'Egypt' },
      expectedSalary: 7000,
      preferredWorkType: ['Full-time']
    };

    const rankedJobs = matchingEngine.rankByMatch(jobs, userProfile);

    // التحقق: جميع الوظائف يجب أن يكون لها نفس matchScore
    const firstScore = rankedJobs[0].matchScore;
    for (const job of rankedJobs) {
      expect(job.matchScore).toBe(firstScore);
    }

    // التحقق: جميع الوظائف موجودة
    expect(rankedJobs.length).toBe(3);
  });

  it('should maintain stable sort for equal scores', () => {
    fc.assert(
      fc.property(
        fc.array(jobArbitrary(), { minLength: 5, maxLength: 10 }),
        userProfileArbitrary(),
        (jobs, userProfile) => {
          // ترتيب مرتين
          const ranked1 = matchingEngine.rankByMatch(jobs, userProfile);
          const ranked2 = matchingEngine.rankByMatch(jobs, userProfile);

          // التحقق: نفس الترتيب
          for (let i = 0; i < ranked1.length; i++) {
            if (ranked1[i]._id !== ranked2[i]._id) {
              // إذا كانت النتائج مختلفة، تحقق من أن matchScore مختلف
              if (ranked1[i].matchScore === ranked2[i].matchScore) {
                console.log('Failed: Unstable sort for equal scores');
                return false;
              }
            }
          }

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should handle edge case: single job', () => {
    const job = {
      _id: '123456789012345678901234',
      title: 'Software Engineer',
      description: 'Great opportunity',
      skills: ['JavaScript'],
      experienceLevel: 'Mid',
      educationLevel: 'Bachelor',
      location: { city: 'Cairo', country: 'Egypt' },
      salary: { min: 5000, max: 10000 },
      workType: 'Full-time',
      toObject: function() { return this; }
    };

    const userProfile = {
      skills: ['JavaScript'],
      experience: 3,
      education: 'Bachelor',
      location: { city: 'Cairo', country: 'Egypt' },
      expectedSalary: 7000,
      preferredWorkType: ['Full-time']
    };

    const rankedJobs = matchingEngine.rankByMatch([job], userProfile);

    expect(rankedJobs.length).toBe(1);
    expect(rankedJobs[0]._id).toBe(job._id);
    expect(typeof rankedJobs[0].matchScore).toBe('number');
  });

  it('should handle edge case: empty jobs array', () => {
    const userProfile = {
      skills: ['JavaScript'],
      experience: 3,
      education: 'Bachelor',
      location: { city: 'Cairo', country: 'Egypt' },
      expectedSalary: 7000,
      preferredWorkType: ['Full-time']
    };

    const rankedJobs = matchingEngine.rankByMatch([], userProfile);

    expect(rankedJobs.length).toBe(0);
  });

  it('should produce consistent results for same input', () => {
    fc.assert(
      fc.property(
        fc.array(jobArbitrary(), { minLength: 3, maxLength: 10 }),
        userProfileArbitrary(),
        (jobs, userProfile) => {
          // ترتيب عدة مرات
          const ranked1 = matchingEngine.rankByMatch(jobs, userProfile);
          const ranked2 = matchingEngine.rankByMatch(jobs, userProfile);
          const ranked3 = matchingEngine.rankByMatch(jobs, userProfile);

          // التحقق: نفس matchScores
          for (let i = 0; i < ranked1.length; i++) {
            if (ranked1[i].matchScore !== ranked2[i].matchScore ||
                ranked2[i].matchScore !== ranked3[i].matchScore) {
              console.log('Failed: Inconsistent match scores');
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });
});
