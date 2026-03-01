/**
 * 🧪 Property-Based Test: Recommendation Relevance
 * 
 * Property 1: For any user with a complete profile, at least 75% of recommended jobs
 * should match their skills and experience level.
 * 
 * Validates: Requirements 1.1 (توصيات مخصصة بناءً على: المهارات، الخبرة، التعليم، الموقع)
 * 
 * This test uses fast-check to generate random user profiles and job postings,
 * then validates that the recommendation engine produces relevant recommendations.
 */

const fc = require('fast-check');
const ContentBasedFiltering = require('../../src/services/contentBasedFiltering');

describe('Property Test: Recommendation Relevance', () => {
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
        'mongodb', 'postgresql', 'mysql', 'redis', 'docker'
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
      'Project Manager', 'Designer', 'Marketing Manager'
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
    _id: fc.string({ minLength: 24, maxLength: 24 }),
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
    _id: fc.string({ minLength: 24, maxLength: 24 }),
    title: fc.constantFrom(
      'Software Engineer', 'Senior Developer', 'Frontend Developer',
      'Backend Developer', 'Full Stack Developer', 'Mobile Developer',
      'UI/UX Designer', 'Marketing Manager', 'Project Manager'
    ),
    description: fc.string({ minLength: 50, maxLength: 200 }),
    requirements: fc.string({ minLength: 50, maxLength: 200 }),
    location: fc.constantFrom('القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة'),
    salary: fc.record({
      min: fc.integer({ min: 5000, max: 15000 }),
      max: fc.integer({ min: 15000, max: 30000 })
    }),
    jobType: fc.constantFrom('Full-time', 'Part-time', 'Contract', 'Remote')
  });

  /**
   * Helper: Check if a job matches user's skills
   */
  function jobMatchesUserSkills(user, job) {
    const userSkills = [
      ...(user.computerSkills || []).map(s => s.name.toLowerCase()),
      ...(user.softwareSkills || []).map(s => s.name.toLowerCase()),
      ...(user.otherSkills || []).map(s => s.toLowerCase())
    ];

    const jobText = `${job.title} ${job.description} ${job.requirements}`.toLowerCase();

    // Check if at least one user skill is mentioned in the job
    return userSkills.some(skill => jobText.includes(skill));
  }

  /**
   * Helper: Check if a job matches user's experience level
   */
  function jobMatchesUserExperience(user, job) {
    if (!user.experienceList || user.experienceList.length === 0) {
      return false;
    }

    // Calculate total years of experience
    let totalYears = 0;
    user.experienceList.forEach(exp => {
      if (exp.from && exp.to) {
        const years = (new Date(exp.to) - new Date(exp.from)) / (1000 * 60 * 60 * 24 * 365.25);
        totalYears += Math.max(0, years);
      }
    });

    // Extract required experience from job
    const jobText = `${job.requirements || ''}`.toLowerCase();
    const experienceMatch = jobText.match(/(\d+)\s*(year|سنة|عام)/i);
    const requiredYears = experienceMatch ? parseInt(experienceMatch[1]) : 0;

    // User should have at least 80% of required experience
    return totalYears >= requiredYears * 0.8;
  }

  /**
   * Helper: Check if a job is relevant to the user
   */
  function isJobRelevant(user, job) {
    const matchesSkills = jobMatchesUserSkills(user, job);
    const matchesExperience = jobMatchesUserExperience(user, job);

    // A job is relevant if it matches skills OR experience
    return matchesSkills || matchesExperience;
  }

  /**
   * Property Test 1: At least 75% of recommendations should be relevant
   */
  it('should recommend at least 75% relevant jobs for any complete user profile', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 10, maxLength: 20 }),
        async (user, jobs) => {
          // Run the recommendation engine
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore: 0.1, // Accept low scores to test relevance
            limit: 10
          });

          // Count relevant recommendations
          let relevantCount = 0;
          recommendations.forEach(rec => {
            if (isJobRelevant(user, rec.job)) {
              relevantCount++;
            }
          });

          // Calculate relevance percentage
          const relevancePercentage = recommendations.length > 0
            ? (relevantCount / recommendations.length) * 100
            : 0;

          // Property: At least 75% should be relevant
          return relevancePercentage >= 75;
        }
      ),
      {
        numRuns: 50, // Run 50 random tests
        verbose: true,
        seed: 42 // For reproducibility
      }
    );
  });

  /**
   * Property Test 2: Higher scored recommendations should be more relevant
   */
  it('should rank more relevant jobs higher', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 10, maxLength: 20 }),
        async (user, jobs) => {
          // Run the recommendation engine
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs, {
            limit: 10
          });

          if (recommendations.length < 2) return true; // Skip if too few recommendations

          // Check if top recommendations are more relevant than bottom ones
          const topHalf = recommendations.slice(0, Math.floor(recommendations.length / 2));
          const bottomHalf = recommendations.slice(Math.floor(recommendations.length / 2));

          const topRelevantCount = topHalf.filter(rec => isJobRelevant(user, rec.job)).length;
          const bottomRelevantCount = bottomHalf.filter(rec => isJobRelevant(user, rec.job)).length;

          const topRelevanceRate = topRelevantCount / topHalf.length;
          const bottomRelevanceRate = bottomRelevantCount / bottomHalf.length;

          // Property: Top half should have higher or equal relevance rate
          return topRelevanceRate >= bottomRelevanceRate;
        }
      ),
      {
        numRuns: 50,
        verbose: true,
        seed: 42
      }
    );
  });

  /**
   * Property Test 3: Recommendations should have valid scores (0-100)
   */
  it('should assign valid match scores (0-100) to all recommendations', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 5, maxLength: 15 }),
        async (user, jobs) => {
          // Run the recommendation engine
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs);

          // Property: All scores should be between 0 and 100
          return recommendations.every(rec => {
            return rec.matchScore.percentage >= 0 && rec.matchScore.percentage <= 100;
          });
        }
      ),
      {
        numRuns: 50,
        verbose: true,
        seed: 42
      }
    );
  });

  /**
   * Property Test 4: Recommendations should be sorted by score (descending)
   */
  it('should sort recommendations by match score in descending order', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 5, maxLength: 15 }),
        async (user, jobs) => {
          // Run the recommendation engine
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs);

          // Property: Each recommendation should have a score >= the next one
          for (let i = 0; i < recommendations.length - 1; i++) {
            if (recommendations[i].matchScore.overall < recommendations[i + 1].matchScore.overall) {
              return false;
            }
          }

          return true;
        }
      ),
      {
        numRuns: 50,
        verbose: true,
        seed: 42
      }
    );
  });

  /**
   * Property Test 5: Each recommendation should have at least one reason
   */
  it('should provide at least one reason for each recommendation', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 5, maxLength: 15 }),
        async (user, jobs) => {
          // Run the recommendation engine
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs);

          // Property: All recommendations should have at least one reason
          return recommendations.every(rec => {
            return rec.reasons && rec.reasons.length > 0;
          });
        }
      ),
      {
        numRuns: 50,
        verbose: true,
        seed: 42
      }
    );
  });

  /**
   * Property Test 6: Users with more skills should get more relevant recommendations
   */
  it('should provide more relevant recommendations for users with more skills', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 10, maxLength: 20 }),
        async (user, jobs) => {
          // Create a user with fewer skills
          const userWithFewerSkills = {
            ...user,
            computerSkills: user.computerSkills.slice(0, 2),
            softwareSkills: user.softwareSkills.slice(0, 1),
            otherSkills: user.otherSkills.slice(0, 1)
          };

          // Get recommendations for both users
          const recsOriginal = await recommendationEngine.rankJobsByMatch(user, jobs, { limit: 10 });
          const recsFewerSkills = await recommendationEngine.rankJobsByMatch(userWithFewerSkills, jobs, { limit: 10 });

          // Count relevant recommendations
          const relevantOriginal = recsOriginal.filter(rec => isJobRelevant(user, rec.job)).length;
          const relevantFewerSkills = recsFewerSkills.filter(rec => isJobRelevant(userWithFewerSkills, rec.job)).length;

          // Property: User with more skills should get at least as many relevant recommendations
          return relevantOriginal >= relevantFewerSkills;
        }
      ),
      {
        numRuns: 30,
        verbose: true,
        seed: 42
      }
    );
  });

  /**
   * Property Test 7: Recommendations should respect minimum score threshold
   */
  it('should only return recommendations above the minimum score threshold', () => {
    fc.assert(
      fc.property(
        completeUserProfileArbitrary,
        fc.array(jobPostingArbitrary, { minLength: 10, maxLength: 20 }),
        fc.double({ min: 0.3, max: 0.7 }),
        async (user, jobs, minScore) => {
          // Run the recommendation engine with minScore
          const recommendations = await recommendationEngine.rankJobsByMatch(user, jobs, {
            minScore
          });

          // Property: All recommendations should have score >= minScore
          return recommendations.every(rec => {
            return rec.matchScore.overall >= minScore;
          });
        }
      ),
      {
        numRuns: 50,
        verbose: true,
        seed: 42
      }
    );
  });
});
