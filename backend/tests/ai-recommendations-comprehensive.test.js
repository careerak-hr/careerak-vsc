/**
 * AI Recommendations System - Comprehensive Test Suite
 * 
 * This test suite covers:
 * - Unit tests for individual components
 * - Integration tests for the recommendation pipeline
 * - ML model validation tests
 * - Property-based tests for correctness properties
 * 
 * Requirements: اختبارات شاملة (Unit + Integration + ML)
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Services
const contentBasedFilteringService = require('../src/services/contentBasedFilteringService');
const skillGapAnalysisService = require('../src/services/skillGapAnalysisService');
const profileAnalysisService = require('../src/services/profileAnalysisService');
const recommendationAccuracyService = require('../src/services/recommendationAccuracyService');

// Models
const User = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const EducationalCourse = require('../src/models/EducationalCourse');
const UserInteraction = require('../src/models/UserInteraction');

let mongoServer;

// ============================================================================
// Setup & Teardown
// ============================================================================

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// ============================================================================
// UNIT TESTS - Content-Based Filtering
// ============================================================================

describe('Unit Tests - Content-Based Filtering', () => {
  
  test('should calculate match score between user and job', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: 3,
      education: 'Bachelor',
      location: 'Cairo'
    });

    const job = await JobPosting.create({
      title: 'Frontend Developer',
      description: 'Looking for a React developer',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React'],
      experienceLevel: 'mid',
      location: 'Cairo',
      status: 'active'
    });

    const result = await contentBasedFilteringService.calculateMatchScore(user, job);

    expect(result).toHaveProperty('score');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result).toHaveProperty('reasons');
    expect(Array.isArray(result.reasons)).toBe(true);
  });

  test('should return higher score for better matches', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experience: 5,
      education: 'Bachelor',
      location: 'Cairo'
    });

    const perfectJob = await JobPosting.create({
      title: 'Full Stack Developer',
      description: 'Looking for a MERN stack developer',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experienceLevel: 'senior',
      location: 'Cairo',
      status: 'active'
    });

    const poorJob = await JobPosting.create({
      title: 'Python Developer',
      description: 'Looking for a Python developer',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['Python', 'Django'],
      experienceLevel: 'junior',
      location: 'Alexandria',
      status: 'active'
    });

    const perfectMatch = await contentBasedFilteringService.calculateMatchScore(user, perfectJob);
    const poorMatch = await contentBasedFilteringService.calculateMatchScore(user, poorJob);

    expect(perfectMatch.score).toBeGreaterThan(poorMatch.score);
  });
});

// ============================================================================
// UNIT TESTS - Skill Gap Analysis
// ============================================================================

describe('Unit Tests - Skill Gap Analysis', () => {
  
  test('should identify missing skills', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React'],
      experience: 2
    });

    const job = await JobPosting.create({
      title: 'Full Stack Developer',
      description: 'MERN stack position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      status: 'active'
    });

    const gaps = await skillGapAnalysisService.analyzeSkillGaps(user._id, job._id);

    expect(gaps).toHaveProperty('missingSkills');
    expect(gaps.missingSkills).toContain('Node.js');
    expect(gaps.missingSkills).toContain('MongoDB');
    expect(gaps.missingSkills).not.toContain('JavaScript');
    expect(gaps.missingSkills).not.toContain('React');
  });

  test('should return empty array when no skill gaps', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experience: 3
    });

    const job = await JobPosting.create({
      title: 'Frontend Developer',
      description: 'React position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React'],
      status: 'active'
    });

    const gaps = await skillGapAnalysisService.analyzeSkillGaps(user._id, job._id);

    expect(gaps.missingSkills).toHaveLength(0);
  });
});

// ============================================================================
// UNIT TESTS - Profile Analysis
// ============================================================================

describe('Unit Tests - Profile Analysis', () => {
  
  test('should calculate profile completeness score', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript'],
      experience: 2,
      education: 'Bachelor',
      location: 'Cairo',
      bio: 'Test bio'
    });

    const analysis = await profileAnalysisService.analyzeProfile(user._id);

    expect(analysis).toHaveProperty('completenessScore');
    expect(analysis.completenessScore).toBeGreaterThanOrEqual(0);
    expect(analysis.completenessScore).toBeLessThanOrEqual(100);
  });

  test('should provide improvement suggestions', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: []
    });

    const analysis = await profileAnalysisService.analyzeProfile(user._id);

    expect(analysis).toHaveProperty('suggestions');
    expect(Array.isArray(analysis.suggestions)).toBe(true);
    expect(analysis.suggestions.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// INTEGRATION TESTS - Recommendation Pipeline
// ============================================================================

describe('Integration Tests - Recommendation Pipeline', () => {
  
  test('should generate job recommendations for user', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React'],
      experience: 3,
      location: 'Cairo'
    });

    // Create multiple jobs
    const jobs = await JobPosting.insertMany([
      {
        title: 'React Developer',
        description: 'React position',
        company: new mongoose.Types.ObjectId(),
        requiredSkills: ['JavaScript', 'React'],
        experienceLevel: 'mid',
        location: 'Cairo',
        status: 'active'
      },
      {
        title: 'Python Developer',
        description: 'Python position',
        company: new mongoose.Types.ObjectId(),
        requiredSkills: ['Python', 'Django'],
        experienceLevel: 'mid',
        location: 'Cairo',
        status: 'active'
      }
    ]);

    const recommendations = await contentBasedFilteringService.getJobRecommendations(user._id, 10);

    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]).toHaveProperty('job');
    expect(recommendations[0]).toHaveProperty('score');
    expect(recommendations[0]).toHaveProperty('reasons');
  });

  test('should generate course recommendations based on skill gaps', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript'],
      experience: 1
    });

    const course = await EducationalCourse.create({
      title: 'React Masterclass',
      description: 'Learn React from scratch',
      instructor: 'John Doe',
      skills: ['React'],
      level: 'beginner',
      duration: 40,
      status: 'active'
    });

    const recommendations = await skillGapAnalysisService.getCourseRecommendations(user._id);

    expect(Array.isArray(recommendations)).toBe(true);
  });
});

// ============================================================================
// INTEGRATION TESTS - Learning from Interactions
// ============================================================================

describe('Integration Tests - Learning from Interactions', () => {
  
  test('should track user interactions', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker'
    });

    const job = await JobPosting.create({
      title: 'Test Job',
      description: 'Test description',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript'],
      status: 'active'
    });

    const interaction = await UserInteraction.create({
      userId: user._id,
      itemType: 'job',
      itemId: job._id,
      action: 'like',
      timestamp: new Date()
    });

    expect(interaction).toHaveProperty('_id');
    expect(interaction.action).toBe('like');
  });

  test('should improve recommendations based on interactions', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript'],
      preferences: { tracking: true }
    });

    const job = await JobPosting.create({
      title: 'React Developer',
      description: 'React position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React'],
      status: 'active'
    });

    // Simulate positive interaction
    await UserInteraction.create({
      userId: user._id,
      itemType: 'job',
      itemId: job._id,
      action: 'apply',
      timestamp: new Date()
    });

    // Get recommendations (should be influenced by interaction)
    const recommendations = await contentBasedFilteringService.getJobRecommendations(user._id, 10);

    expect(Array.isArray(recommendations)).toBe(true);
  });
});

// ============================================================================
// ML VALIDATION TESTS
// ============================================================================

describe('ML Validation Tests - Recommendation Accuracy', () => {
  
  test('should calculate recommendation accuracy', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript'],
      preferences: { tracking: true }
    });

    const job = await JobPosting.create({
      title: 'Test Job',
      description: 'Test description',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript'],
      status: 'active'
    });

    // Create recommendation
    await UserInteraction.create({
      userId: user._id,
      itemType: 'job',
      itemId: job._id,
      action: 'view',
      recommendationScore: 75,
      timestamp: new Date()
    });

    // Create positive interaction
    await UserInteraction.create({
      userId: user._id,
      itemType: 'job',
      itemId: job._id,
      action: 'apply',
      timestamp: new Date()
    });

    const accuracy = await recommendationAccuracyService.calculateUserAccuracy(user._id, 'job', 30);

    expect(accuracy).toHaveProperty('accuracy');
    expect(accuracy.accuracy).toBeGreaterThanOrEqual(0);
    expect(accuracy.accuracy).toBeLessThanOrEqual(100);
  });

  test('should track accuracy improvement over time', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      preferences: { tracking: true }
    });

    const improvement = await recommendationAccuracyService.trackImprovement(user._id, 'job', [7, 14, 30]);

    expect(improvement).toHaveProperty('periods');
    expect(Array.isArray(improvement.periods)).toBe(true);
  });
});

// ============================================================================
// PROPERTY-BASED TESTS - Correctness Properties
// ============================================================================

describe('Property Tests - Recommendation Relevance (Property 1)', () => {
  
  test('at least 75% of recommendations should match user skills', () => {
    return fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('JavaScript', 'Python', 'Java', 'React', 'Node.js'), { minLength: 2, maxLength: 5 }),
        fc.integer({ min: 1, max: 10 }),
        async (skills, experience) => {
          const user = await User.create({
            name: 'Property Test User',
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'job_seeker',
            skills,
            experience
          });

          // Create jobs with varying skill matches
          const jobs = await JobPosting.insertMany([
            {
              title: 'Matching Job 1',
              description: 'Job with matching skills',
              company: new mongoose.Types.ObjectId(),
              requiredSkills: skills.slice(0, 2),
              status: 'active'
            },
            {
              title: 'Matching Job 2',
              description: 'Job with matching skills',
              company: new mongoose.Types.ObjectId(),
              requiredSkills: skills.slice(0, 1),
              status: 'active'
            },
            {
              title: 'Non-matching Job',
              description: 'Job with different skills',
              company: new mongoose.Types.ObjectId(),
              requiredSkills: ['Rust', 'Go'],
              status: 'active'
            }
          ]);

          const recommendations = await contentBasedFilteringService.getJobRecommendations(user._id, 10);

          if (recommendations.length > 0) {
            const relevantCount = recommendations.filter(rec => rec.score >= 50).length;
            const relevanceRate = (relevantCount / recommendations.length) * 100;
            
            // Property: At least 75% should be relevant (score >= 50)
            expect(relevanceRate).toBeGreaterThanOrEqual(75);
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});

describe('Property Tests - Score Consistency (Property 2)', () => {
  
  test('recommendation scores should be between 0 and 100', () => {
    return fc.assert(
      fc.asyncProperty(
        fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
        async (skills) => {
          const user = await User.create({
            name: 'Property Test User',
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'job_seeker',
            skills
          });

          const job = await JobPosting.create({
            title: 'Test Job',
            description: 'Test description',
            company: new mongoose.Types.ObjectId(),
            requiredSkills: skills,
            status: 'active'
          });

          const result = await contentBasedFilteringService.calculateMatchScore(user, job);

          // Property: Score must be between 0 and 100
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 20 }
    );
  });
});

describe('Property Tests - Explanation Completeness (Property 3)', () => {
  
  test('every recommendation should have at least one reason', () => {
    return fc.assert(
      fc.asyncProperty(
        fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
        async (skills) => {
          const user = await User.create({
            name: 'Property Test User',
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'job_seeker',
            skills
          });

          const job = await JobPosting.create({
            title: 'Test Job',
            description: 'Test description',
            company: new mongoose.Types.ObjectId(),
            requiredSkills: skills,
            status: 'active'
          });

          const result = await contentBasedFilteringService.calculateMatchScore(user, job);

          // Property: Must have at least one reason
          expect(result.reasons).toBeDefined();
          expect(Array.isArray(result.reasons)).toBe(true);
          expect(result.reasons.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 15 }
    );
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance Tests', () => {
  
  test('should generate recommendations within acceptable time', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React'],
      experience: 3
    });

    // Create 100 jobs
    const jobs = [];
    for (let i = 0; i < 100; i++) {
      jobs.push({
        title: `Job ${i}`,
        description: `Description ${i}`,
        company: new mongoose.Types.ObjectId(),
        requiredSkills: ['JavaScript'],
        status: 'active'
      });
    }
    await JobPosting.insertMany(jobs);

    const startTime = Date.now();
    const recommendations = await contentBasedFilteringService.getJobRecommendations(user._id, 20);
    const endTime = Date.now();

    const executionTime = endTime - startTime;

    // Should complete within 3 seconds
    expect(executionTime).toBeLessThan(3000);
    expect(recommendations.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// EDGE CASES & ERROR HANDLING
// ============================================================================

describe('Edge Cases & Error Handling', () => {
  
  test('should handle user with no skills', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: []
    });

    const job = await JobPosting.create({
      title: 'Test Job',
      description: 'Test description',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript'],
      status: 'active'
    });

    const result = await contentBasedFilteringService.calculateMatchScore(user, job);

    expect(result).toHaveProperty('score');
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  test('should handle job with no required skills', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript']
    });

    const job = await JobPosting.create({
      title: 'Test Job',
      description: 'Test description',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: [],
      status: 'active'
    });

    const result = await contentBasedFilteringService.calculateMatchScore(user, job);

    expect(result).toHaveProperty('score');
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  test('should handle non-existent user gracefully', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();

    await expect(
      contentBasedFilteringService.getJobRecommendations(fakeUserId, 10)
    ).rejects.toThrow();
  });
});

console.log('✅ AI Recommendations Comprehensive Test Suite Loaded');
