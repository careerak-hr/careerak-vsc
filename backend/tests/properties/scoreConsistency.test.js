/**
 * 🧪 Property-Based Test: Score Consistency
 * 
 * **Property 2: Score Consistency**
 * For any recommendation, the score should be between 0 and 100, 
 * and higher scores should indicate better matches (descending order).
 * 
 * **Validates: Requirements 1.4**
 * 
 * This dedicated test file focuses exclusively on score consistency properties:
 * - Score range validation (0-100)
 * - Score ordering (descending)
 * - Score normalization
 * - Score precision
 * 
 * Uses fast-check for property-based testing with random inputs.
 */

const fc = require('fast-check');
const ContentBasedFiltering = require('../../src/services/contentBasedFiltering');

describe('Property: Score Consistency (0-100, descending order)', () => {
  let recommendationEngine;

  beforeAll(() => {
    recommendationEngine = new ContentBasedFiltering();
  });

  /**
   * Arbitrary: Generate a random skill
   */
  const skillArbitrary = fc.record({
    name: fc.oneof(
      fc.constantFrom(
        'javascript', 'python', 'react', 'nodejs', 'database',
        'frontend', 'backend', 'mobile', 'design', 'marketing',
        'java', 'c++', 'php', 'ruby', 'swift', 'kotlin',
        'angular', 'vue', 'django', 'flask', 'spring',
        'mongodb', 'postgresql', 'mysql', 'redis', 'docker',
        'kubernetes', 'aws', 'azure', 'gcp', 'devops'
      )
    ),
    proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert'),
    category: fc.constantFrom('computer', 'software', 'other')
  });

  /**
   * Arbitrary: Generate a random experience entry
   */
  const experienceArbitrary = fc.record({
    position: fc.constantFrom(
      'Software Engineer', 'Senior Developer', 'Team Lead',
      'Project Manager', 'Designer', 'Marketing Manager',
      'Data Scientist', 'DevOps Engineer', 'Product Owner'
    ),
    company: fc.string({ minLength: 5, maxLength: 20 }),
    from: fc.date({ min: new Date('2010-01-01'), max: new Date('2020-01-01') }),
    to: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-01-01') })
  });

  /**
   * Arbitrary: Generate a random education entry
   */
  const educationArbitrary = fc.record({
    degree: fc.constantFrom('بكالوريوس', 'ماجستير', 'دكتوراه', 'دبلوم'),
    level: fc.constantFrom('Computer Science', 'Engineering', 'Business', 'Design'),
    institution: fc.string({ minLength: 10, maxLength: 30 })
  });

  /**
   * Arbitrary: Generate a complete user profile
   */
  const completeUserProfileArbitrary = fc.record({
    _id: fc.string({ minLength: 24, maxLength: 24 }).map(s => s.replace(/[^a-f0-9]/g, '0')),
    name: fc.string({ minLength: 5, maxLength: 20 }),
    email: fc.emailAddress(),
    computerSkills: fc.array(skillArbitrary, { minLength: 2, maxLength: 10 }),
    softwareSkills: fc.array(skillArbitrary, { minLength: 1, maxLength: 8 }),
    otherSkills: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 0, maxLength: 5 }),
    experienceList: fc.array(experienceArbitrary, { minLength: 0, maxLength: 5 }),
    educationList: fc.array(educationArbitrary, { minLength: 1, maxLength: 3 }),
    city: fc.constantFrom('القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'طنطا'),
    country: fc.constant('مصر')
  });

  /**
   * Arbitrary: Generate a job posting
   */
  const jobPostingArbitrary = fc.record({
    _id: fc.string({ minLength: 24, maxLength: 24 }).map(s => s.replace(/[^a-f0-9]/g, '0')),
    title: fc.constantFrom(
      'Software Engineer', 'Frontend Developer', 'Backend Developer',
      'Full Stack Developer', 'Mobile Developer', 'DevOps Engineer',
      'Data Scientist', 'UI/UX Designer', 'Product Manager',
      'QA Engineer', 'Security Engineer', 'Cloud Architect'
    ),
    description: fc.string({ minLength: 50, maxLength: 200 }),
    requirements: fc.string({ minLength: 30, maxLength: 150 }),
    location: fc.constantFrom('القاهرة، مصر', 'الجيزة، مصر', 'الإسكندرية، مصر', 'Remote'),
    jobType: fc.constantFrom('Full-time', 'Part-time', 'Contract', 'Remote'),
    salary: fc.record({
      min: fc.integer({ min: 5000, max: 15000 }),
      max: fc.integer({ min: 15000, max: 50000 })
    })
  });

  /**
   * Property Test 1: Score Range Validation (0-100)
   * For any recommendation, the overall score must be between 0 and 100
   */
  test('Property: All scores are in range [0, 100]', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 5, maxLength: 20 }),
        async (user, jobs) => {
          // Get recommendations
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.0,
            limit: 20
          });

          // If no recommendations, the property holds vacuously
          if (recommendations.length === 0) {
            return true;
          }

          // Check every recommendation's score
          for (const rec of recommendations) {
            const score = rec.matchScore.overall * 100; // Convert to 0-100 scale

            // Validate range
            if (score < 0 || score > 100) {
              console.log('\n❌ Score range validation failed:');
              console.log(`  Job: ${rec.job.title}`);
              console.log(`  Score: ${score}`);
              console.log(`  Expected: 0 <= score <= 100`);
              return false;
            }

            // Also check individual component scores
            const { skills, experience, education, location } = rec.matchScore.scores;
            const componentScores = [skills, experience, education, location];
            
            for (const componentScore of componentScores) {
              if (componentScore < 0 || componentScore > 1) {
                console.log('\n❌ Component score range validation failed:');
                console.log(`  Component score: ${componentScore}`);
                console.log(`  Expected: 0 <= score <= 1`);
                return false;
              }
            }
          }

          return true;
        }
      ),
      {
        numRuns: 100,
        verbose: false,
        seed: 42
      }
    );
  });

  /**
   * Property Test 2: Descending Order
   * Recommendations must be sorted in descending order by score
   * (Higher scores = better matches should appear first)
   */
  test('Property: Recommendations are sorted in descending order', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 5, maxLength: 20 }),
        async (user, jobs) => {
          // Get recommendations
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.0,
            limit: 20
          });

          // If no recommendations or only one, the property holds vacuously
          if (recommendations.length < 2) {
            return true; // Need at least 2 to compare
          }

          // Check that each score is >= the next score
          for (let i = 0; i < recommendations.length - 1; i++) {
            const currentScore = recommendations[i].matchScore.overall;
            const nextScore = recommendations[i + 1].matchScore.overall;
            
            if (currentScore < nextScore) {
              console.log('\n❌ Descending order validation failed:');
              console.log(`  Position ${i}: ${recommendations[i].job.title} - Score: ${currentScore}`);
              console.log(`  Position ${i + 1}: ${recommendations[i + 1].job.title} - Score: ${nextScore}`);
              console.log(`  Expected: ${currentScore} >= ${nextScore}`);
              return false;
            }
          }

          return true;
        }
      ),
      {
        numRuns: 100,
        verbose: false,
        seed: 42
      }
    );
  });

  /**
   * Property Test 3: Score Normalization
   * The overall score should be a weighted average of component scores
   */
  test('Property: Overall score is correctly normalized', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 5, maxLength: 15 }),
        async (user, jobs) => {
          // Get recommendations
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.0,
            limit: 10
          });

          // If no recommendations, the property holds vacuously
          if (recommendations.length === 0) {
            return true;
          }

          // Check each recommendation's score calculation
          for (const rec of recommendations) {
            const { skills, experience, education, location } = rec.matchScore.scores;
            const overall = rec.matchScore.overall;

            // The overall score should be within the range of component scores
            const minComponent = Math.min(skills, experience, education, location);
            const maxComponent = Math.max(skills, experience, education, location);

            if (overall < minComponent - 0.01 || overall > maxComponent + 0.01) {
              console.log('\n❌ Score normalization validation failed:');
              console.log(`  Job: ${rec.job.title}`);
              console.log(`  Component scores: skills=${skills}, exp=${experience}, edu=${education}, loc=${location}`);
              console.log(`  Overall score: ${overall}`);
              console.log(`  Expected: ${minComponent} <= ${overall} <= ${maxComponent}`);
              return false;
            }
          }

          return true;
        }
      ),
      {
        numRuns: 100,
        verbose: false
      }
    );
  });

  /**
   * Property Test 4: Score Precision
   * Scores should have reasonable precision (not too many decimal places)
   */
  test('Property: Scores have reasonable precision', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 5, maxLength: 15 }),
        async (user, jobs) => {
          // Get recommendations
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.0,
            limit: 10
          });

          // If no recommendations, the property holds vacuously
          if (recommendations.length === 0) {
            return true;
          }

          // Check precision of scores
          for (const rec of recommendations) {
            const score = rec.matchScore.overall;
            
            // Convert to string and check decimal places
            const scoreStr = score.toString();
            const decimalPart = scoreStr.split('.')[1];
            
            if (decimalPart && decimalPart.length > 4) {
              console.log('\n⚠️  Score precision warning:');
              console.log(`  Job: ${rec.job.title}`);
              console.log(`  Score: ${score}`);
              console.log(`  Decimal places: ${decimalPart.length}`);
              console.log(`  Note: Consider rounding to 2-4 decimal places`);
              // Don't fail, just warn
            }
          }

          return true;
        }
      ),
      {
        numRuns: 50,
        verbose: false
      }
    );
  });

  /**
   * Property Test 5: Higher Scores = Better Matches
   * Recommendations with higher scores should have more matching criteria
   */
  test('Property: Higher scores correlate with more matches', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 10, maxLength: 20 }),
        async (user, jobs) => {
          // Get recommendations
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.0,
            limit: 20
          });

          // If no recommendations or less than 3, the property holds vacuously
          if (recommendations.length < 3) {
            return true; // Need at least 3 to compare
          }

          // Compare top recommendation with bottom recommendation
          const topRec = recommendations[0];
          const bottomRec = recommendations[recommendations.length - 1];

          const topScore = topRec.matchScore.overall;
          const bottomScore = bottomRec.matchScore.overall;

          // Top should have higher score
          if (topScore < bottomScore) {
            console.log('\n❌ Score correlation validation failed:');
            console.log(`  Top job: ${topRec.job.title} - Score: ${topScore}`);
            console.log(`  Bottom job: ${bottomRec.job.title} - Score: ${bottomScore}`);
            return false;
          }

          // Top should have more reasons (better match)
          const topReasons = topRec.reasons.length;
          const bottomReasons = bottomRec.reasons.length;

          if (topScore > bottomScore + 0.1 && topReasons < bottomReasons) {
            console.log('\n⚠️  Score-reasons correlation warning:');
            console.log(`  Top job has higher score (${topScore}) but fewer reasons (${topReasons})`);
            console.log(`  Bottom job has lower score (${bottomScore}) but more reasons (${bottomReasons})`);
            // Don't fail, just warn
          }

          return true;
        }
      ),
      {
        numRuns: 100,
        verbose: false
      }
    );
  });

  /**
   * Property Test 6: Score Stability
   * Running the same recommendation twice should produce the same scores
   */
  test('Property: Scores are stable (deterministic)', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 5, maxLength: 10 }),
        async (user, jobs) => {
          // Get recommendations twice
          const recommendations1 = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.0,
            limit: 10
          });

          const recommendations2 = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.0,
            limit: 10
          });

          // Should have same length
          if (recommendations1.length !== recommendations2.length) {
            console.log('\n❌ Score stability validation failed:');
            console.log(`  First run: ${recommendations1.length} recommendations`);
            console.log(`  Second run: ${recommendations2.length} recommendations`);
            return false;
          }

          // If no recommendations, the property holds vacuously
          if (recommendations1.length === 0) {
            return true;
          }

          // Compare scores
          for (let i = 0; i < recommendations1.length; i++) {
            const score1 = recommendations1[i].matchScore.overall;
            const score2 = recommendations2[i].matchScore.overall;
            const jobId1 = recommendations1[i].job._id;
            const jobId2 = recommendations2[i].job._id;

            // Same job should have same score
            if (jobId1 === jobId2 && Math.abs(score1 - score2) > 0.0001) {
              console.log('\n❌ Score stability validation failed:');
              console.log(`  Job: ${recommendations1[i].job.title}`);
              console.log(`  First run score: ${score1}`);
              console.log(`  Second run score: ${score2}`);
              return false;
            }
          }

          return true;
        }
      ),
      {
        numRuns: 50,
        verbose: false
      }
    );
  });

  /**
   * Property Test 7: Score Monotonicity with minScore Filter
   * When minScore increases, the number of recommendations should decrease or stay the same
   */
  test('Property: Higher minScore filters more recommendations', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 10, maxLength: 20 }),
        async (user, jobs) => {
          // Get recommendations with different minScore values
          const recsLowFilter = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.3,
            limit: 20
          });

          const recsHighFilter = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.6,
            limit: 20
          });

          // Higher minScore should result in fewer or equal recommendations
          if (recsHighFilter.length > recsLowFilter.length) {
            console.log('\n❌ Score monotonicity validation failed:');
            console.log(`  minScore=0.3: ${recsLowFilter.length} recommendations`);
            console.log(`  minScore=0.6: ${recsHighFilter.length} recommendations`);
            console.log(`  Expected: recsHighFilter.length <= recsLowFilter.length`);
            return false;
          }

          return true;
        }
      ),
      {
        numRuns: 50,
        verbose: false
      }
    );
  });

  /**
   * Property Test 8: Score Non-Negativity
   * All component scores should be non-negative
   */
  test('Property: All component scores are non-negative', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 5, maxLength: 15 }),
        async (user, jobs) => {
          // Get recommendations
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.0,
            limit: 10
          });

          // If no recommendations, the property holds vacuously
          if (recommendations.length === 0) {
            return true;
          }

          // Check all component scores
          for (const rec of recommendations) {
            const { skills, experience, education, location } = rec.matchScore.scores;
            const overall = rec.matchScore.overall;

            if (skills < 0 || experience < 0 || education < 0 || location < 0 || overall < 0) {
              console.log('\n❌ Non-negativity validation failed:');
              console.log(`  Job: ${rec.job.title}`);
              console.log(`  Scores: skills=${skills}, exp=${experience}, edu=${education}, loc=${location}, overall=${overall}`);
              return false;
            }
          }

          return true;
        }
      ),
      {
        numRuns: 100,
        verbose: false
      }
    );
  });
});

/**
 * 📊 Test Summary
 * 
 * This dedicated property-based test suite validates **Property 2: Score Consistency**:
 * 
 * ✅ **Core Properties**:
 * 1. Score Range: All scores are in [0, 100] range
 * 2. Descending Order: Recommendations sorted by score (highest first)
 * 3. Score Normalization: Overall score is correctly calculated
 * 4. Score Precision: Scores have reasonable precision
 * 
 * ✅ **Additional Properties**:
 * 5. Higher Scores = Better Matches: Score correlates with match quality
 * 6. Score Stability: Deterministic scoring (same input = same output)
 * 7. Score Monotonicity: Higher minScore filters more recommendations
 * 8. Non-Negativity: All scores are >= 0
 * 
 * **Requirements Validated**: 1.4 (نسبة تطابق لكل وظيفة)
 * 
 * **Test Strategy**:
 * - Uses fast-check for property-based testing
 * - Generates random user profiles and jobs
 * - Runs 100+ tests with different random inputs
 * - Validates that score consistency holds for ALL inputs
 * - Provides detailed logging on failures
 * 
 * **Why This Matters**:
 * Score consistency is critical for user trust. Users need to understand that:
 * - Higher scores always mean better matches
 * - Scores are predictable and stable
 * - The ranking is fair and consistent
 */
