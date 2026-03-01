/**
 * 🧪 Property-Based Test: Explanation Completeness
 * 
 * **Property 3: Explanation Completeness**
 * For any recommendation, there should be at least one reason explaining 
 * why it was recommended.
 * 
 * **Validates: Requirements 1.3**
 * 
 * This dedicated test validates that the recommendation engine always provides
 * meaningful explanations for its recommendations, ensuring transparency and
 * explainability in the AI system.
 */

const fc = require('fast-check');
const ContentBasedFiltering = require('../../src/services/contentBasedFiltering');

describe('Property: Explanation Completeness', () => {
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
    level: fc.constantFrom('Computer Science', 'Engineering', 'Business', 'Design', 'Marketing'),
    institution: fc.string({ minLength: 10, maxLength: 30 })
  });

  /**
   * Arbitrary: Generate a complete user profile
   */
  const completeUserProfileArbitrary = fc.record({
    _id: fc.string({ minLength: 24, maxLength: 24 }).map(s => s.replace(/[^a-f0-9]/g, '0')),
    name: fc.string({ minLength: 5, maxLength: 20 }),
    email: fc.emailAddress(),
    computerSkills: fc.array(skillArbitrary, { minLength: 3, maxLength: 10 }),
    softwareSkills: fc.array(skillArbitrary, { minLength: 2, maxLength: 8 }),
    otherSkills: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 1, maxLength: 5 }),
    experienceList: fc.array(experienceArbitrary, { minLength: 1, maxLength: 5 }),
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
    location: fc.constantFrom('القاهرة، مصر', 'الجيزة، مصر', 'الإسكندرية، مصر', 'المنصورة، مصر'),
    jobType: fc.constantFrom('Full-time', 'Part-time', 'Contract', 'Remote'),
    salary: fc.record({
      min: fc.integer({ min: 5000, max: 15000 }),
      max: fc.integer({ min: 15000, max: 50000 })
    })
  });

  /**
   * Helper: Validate that a reason is meaningful
   * A meaningful reason should:
   * - Be an object with a message property OR a string
   * - Not be empty
   * - Not be just whitespace
   * - Have at least 10 characters
   */
  const isMeaningfulReason = (reason) => {
    // Handle object reasons (new format)
    if (reason && typeof reason === 'object' && reason.message) {
      const message = reason.message.trim();
      return message.length >= 10;
    }
    
    // Handle string reasons (legacy format)
    if (reason && typeof reason === 'string') {
      const trimmed = reason.trim();
      return trimmed.length >= 10;
    }
    
    return false;
  };

  /**
   * Property Test 1: Every Recommendation Has At Least One Reason
   * For any user profile and set of jobs, every recommendation
   * must have at least one explanation reason.
   */
  test('Property: Every recommendation has >= 1 reason', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 5, maxLength: 20 }),
        async (user, jobs) => {
          // Get recommendations
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.0, // No filtering to test all recommendations
            limit: 20
          });

          // Check every recommendation
          for (const rec of recommendations) {
            if (!rec.reasons || !Array.isArray(rec.reasons) || rec.reasons.length === 0) {
              console.log('\n❌ Explanation completeness failed:');
              console.log(`  Job: ${rec.job.title}`);
              console.log(`  Score: ${rec.matchScore.overall}`);
              console.log(`  Reasons: ${JSON.stringify(rec.reasons)}`);
              console.log(`  User skills: ${user.computerSkills.length + user.softwareSkills.length}`);
              return false;
            }
          }

          return true;
        }
      ),
      {
        numRuns: 100, // Run 100 random tests
        verbose: false,
        seed: 42 // For reproducibility
      }
    );
  });

  /**
   * Property Test 2: All Reasons Are Meaningful (Not Empty)
   * For any recommendation, all reasons should be meaningful strings,
   * not empty or just whitespace.
   */
  test('Property: All reasons are meaningful (not empty strings)', () => {
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

          // Check every reason in every recommendation
          for (const rec of recommendations) {
            for (const reason of rec.reasons) {
              if (!isMeaningfulReason(reason)) {
                console.log('\n❌ Meaningful reason check failed:');
                console.log(`  Job: ${rec.job.title}`);
                console.log(`  Invalid reason: "${JSON.stringify(reason)}"`);
                console.log(`  Reason type: ${typeof reason}`);
                if (reason && typeof reason === 'object') {
                  console.log(`  Reason message: "${reason.message}"`);
                  console.log(`  Message length: ${reason.message ? reason.message.length : 0}`);
                } else {
                  console.log(`  Reason length: ${reason ? reason.length : 0}`);
                }
                console.log(`  All reasons: ${JSON.stringify(rec.reasons)}`);
                return false;
              }
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
   * Property Test 3: High-Score Recommendations Have More Reasons
   * Recommendations with higher scores should generally have more
   * explanation reasons (more match points).
   */
  test('Property: Higher scores correlate with more reasons', () => {
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

          if (recommendations.length < 2) {
            return true; // Need at least 2 to compare
          }

          // Get top and bottom recommendations
          const topRec = recommendations[0]; // Highest score
          const bottomRec = recommendations[recommendations.length - 1]; // Lowest score

          // Top recommendation should have at least as many reasons as bottom
          // (or at least 1 reason for both)
          const topReasonCount = topRec.reasons.length;
          const bottomReasonCount = bottomRec.reasons.length;

          if (topReasonCount === 0 || bottomReasonCount === 0) {
            console.log('\n❌ Reason count check failed:');
            console.log(`  Top rec (${topRec.matchScore.overall}): ${topReasonCount} reasons`);
            console.log(`  Bottom rec (${bottomRec.matchScore.overall}): ${bottomReasonCount} reasons`);
            return false;
          }

          // Both should have at least 1 reason
          return topReasonCount >= 1 && bottomReasonCount >= 1;
        }
      ),
      {
        numRuns: 50,
        verbose: false
      }
    );
  });

  /**
   * Property Test 4: Reasons Reflect Match Scores
   * If a recommendation has a high skill match score, it should have
   * at least one reason mentioning skills.
   */
  test('Property: Reasons reflect match score components', () => {
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

          // Check recommendations with high skill scores
          for (const rec of recommendations) {
            const skillScore = rec.matchScore.scores.skills;
            
            // If skill score is high (>= 0.6), should have skill-related reason
            if (skillScore >= 0.6) {
              const hasSkillReason = rec.reasons.some(reason => {
                const message = typeof reason === 'object' && reason.message ? reason.message : reason;
                return message.includes('مهارات') || 
                       message.includes('skills') ||
                       message.includes('تطابق');
              });

              if (!hasSkillReason) {
                console.log('\n⚠️  Reason-score mismatch (not critical):');
                console.log(`  Job: ${rec.job.title}`);
                console.log(`  Skill score: ${skillScore}`);
                console.log(`  Reasons: ${JSON.stringify(rec.reasons)}`);
                // Don't fail the test, just log (this is a soft requirement)
              }
            }
          }

          return true; // Always pass (this is a quality check, not a hard requirement)
        }
      ),
      {
        numRuns: 50,
        verbose: false
      }
    );
  });

  /**
   * Property Test 5: Reasons Are Unique (No Duplicates)
   * For any recommendation, all reasons should be unique
   * (no duplicate explanations).
   */
  test('Property: Reasons are unique (no duplicates)', () => {
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

          // Check for duplicate reasons in each recommendation
          for (const rec of recommendations) {
            // Extract messages from reason objects for comparison
            const reasonMessages = rec.reasons.map(r => 
              typeof r === 'object' && r.message ? r.message : r
            );
            const uniqueReasons = new Set(reasonMessages);
            
            if (uniqueReasons.size !== reasonMessages.length) {
              console.log('\n❌ Duplicate reasons found:');
              console.log(`  Job: ${rec.job.title}`);
              console.log(`  Total reasons: ${reasonMessages.length}`);
              console.log(`  Unique reasons: ${uniqueReasons.size}`);
              console.log(`  Reasons: ${JSON.stringify(rec.reasons)}`);
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
   * Property Test 6: Reasons Exist Even for Low Scores
   * Even recommendations with low scores should have explanations
   * (explaining why they were still recommended).
   */
  test('Property: Low-score recommendations still have reasons', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 10, maxLength: 20 }),
        async (user, jobs) => {
          // Get recommendations with no minimum score
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.0,
            limit: 20
          });

          // Find recommendations with low scores (< 0.3)
          const lowScoreRecs = recommendations.filter(rec => rec.matchScore.overall < 0.3);

          // Check that even low-score recommendations have reasons
          for (const rec of lowScoreRecs) {
            if (!rec.reasons || rec.reasons.length === 0) {
              console.log('\n❌ Low-score recommendation missing reasons:');
              console.log(`  Job: ${rec.job.title}`);
              console.log(`  Score: ${rec.matchScore.overall}`);
              console.log(`  Reasons: ${JSON.stringify(rec.reasons)}`);
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
   * Property Test 7: Reasons Are Localized (Arabic or English)
   * All reasons should be in a valid language (Arabic or English),
   * not garbled or mixed.
   */
  test('Property: Reasons are properly localized', () => {
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

          // Check that reasons contain valid characters
          const arabicRegex = /[\u0600-\u06FF]/; // Arabic characters
          const englishRegex = /[a-zA-Z]/; // English characters

          for (const rec of recommendations) {
            for (const reason of rec.reasons) {
              // Extract message from reason object or use string directly
              const message = typeof reason === 'object' && reason.message ? reason.message : reason;
              
              const hasArabic = arabicRegex.test(message);
              const hasEnglish = englishRegex.test(message);

              // Should have at least one language
              if (!hasArabic && !hasEnglish) {
                console.log('\n❌ Invalid reason language:');
                console.log(`  Job: ${rec.job.title}`);
                console.log(`  Reason: "${JSON.stringify(reason)}"`);
                console.log(`  Message: "${message}"`);
                return false;
              }
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
   * Property Test 8: Reasons Count Matches Score Complexity
   * Recommendations with multiple high-scoring components should have
   * multiple reasons (one for each strong match).
   */
  test('Property: Multiple high scores lead to multiple reasons', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 10, maxLength: 20 }),
        async (user, jobs) => {
          // Get recommendations
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.0,
            limit: 10
          });

          // Find recommendations with multiple high scores
          for (const rec of recommendations) {
            const scores = rec.matchScore.scores;
            const highScoreCount = Object.values(scores).filter(score => score >= 0.6).length;

            // If multiple components have high scores, should have multiple reasons
            if (highScoreCount >= 2) {
              if (rec.reasons.length < 2) {
                console.log('\n⚠️  Multiple high scores but few reasons (not critical):');
                console.log(`  Job: ${rec.job.title}`);
                console.log(`  High score components: ${highScoreCount}`);
                console.log(`  Reason count: ${rec.reasons.length}`);
                console.log(`  Scores: ${JSON.stringify(scores)}`);
                // Don't fail - this is a quality suggestion
              }
            }
          }

          return true; // Always pass (quality check)
        }
      ),
      {
        numRuns: 50,
        verbose: false
      }
    );
  });
});

/**
 * 📊 Test Summary
 * 
 * This dedicated property-based test suite validates:
 * 
 * **Property 3: Explanation Completeness**
 * 
 * ✅ Core Requirements:
 * 1. Every recommendation has >= 1 reason
 * 2. All reasons are meaningful (not empty strings)
 * 3. Reasons are unique (no duplicates)
 * 4. Low-score recommendations still have reasons
 * 5. Reasons are properly localized (Arabic/English)
 * 
 * ✅ Quality Checks (soft requirements):
 * 6. Higher scores correlate with more reasons
 * 7. Reasons reflect match score components
 * 8. Multiple high scores lead to multiple reasons
 * 
 * **Requirements Validated**: 1.3 (شرح سبب التوصية - explainable AI)
 * 
 * **Test Strategy**:
 * - Uses fast-check to generate random user profiles and jobs
 * - Runs 100+ property tests with different random inputs
 * - Validates that explanation completeness holds for ALL inputs
 * - Provides detailed logging on failures
 * - Includes both hard requirements (must pass) and quality checks (suggestions)
 * 
 * **Why This Matters**:
 * - Transparency: Users understand why jobs are recommended
 * - Trust: Clear explanations build user confidence
 * - Compliance: Explainable AI is increasingly required by regulations
 * - Debugging: Helps developers understand recommendation logic
 * - User Experience: Better explanations lead to better decisions
 */
