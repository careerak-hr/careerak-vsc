/**
 * Property-Based Tests for Skills Logic (AND/OR)
 * Feature: advanced-search-filter
 * Property 18: Skills Logic (AND/OR)
 * Validates: Requirements 6.2
 * 
 * Property: When filtering jobs by skills with AND logic, all specified skills
 * must be present. With OR logic, at least one skill must be present.
 */

const fc = require('fast-check');
const filterService = require('../src/services/filterService');
const JobPosting = require('../src/models/JobPosting');
const { User } = require('../src/models/User');
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

describe('Property 18: Skills Logic (AND/OR)', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await JobPosting.deleteMany({});
  });

  // Arbitrary لتوليد مهارة
  const skillArbitrary = () => fc.constantFrom(
    'JavaScript', 'Python', 'Java', 'React', 'Node.js',
    'MongoDB', 'SQL', 'Docker', 'AWS', 'Git'
  );

  // Arbitrary لتوليد وظيفة
  const jobArbitrary = () => fc.record({
    title: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.string({ minLength: 20, maxLength: 200 }),
    requirements: fc.string({ minLength: 20, maxLength: 100 }),
    skills: fc.array(skillArbitrary(), { minLength: 1, maxLength: 5 }),
    company: fc.record({
      name: fc.string({ minLength: 3, maxLength: 30 })
    }),
    location: fc.constantFrom(
      { type: 'Cairo, Egypt', city: 'Cairo', country: 'Egypt' },
      { type: 'Alexandria, Egypt', city: 'Alexandria', country: 'Egypt' },
      { type: 'Giza, Egypt', city: 'Giza', country: 'Egypt' }
    ),
    salary: fc.record({
      min: fc.integer({ min: 3000, max: 10000 }),
      max: fc.integer({ min: 10000, max: 30000 })
    }),
    jobType: fc.constantFrom('Full-time', 'Part-time', 'Contract'),
    experienceLevel: fc.constantFrom('Entry', 'Mid', 'Senior'),
    status: fc.constant('Open'),
    postedBy: fc.constant(new mongoose.Types.ObjectId())
  });

  it('should return only jobs with ALL selected skills when using AND logic', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobArbitrary(), { minLength: 5, maxLength: 20 }),
        fc.array(skillArbitrary(), { minLength: 2, maxLength: 3 }).map(arr => [...new Set(arr)]),
        async (jobs, selectedSkills) => {
          // تخطي إذا كانت المهارات المختارة أقل من 2
          if (selectedSkills.length < 2) return true;

          // إدراج الوظائف في قاعدة البيانات
          await JobPosting.insertMany(jobs);

          // تطبيق فلتر AND
          const query = filterService.applyFilters(
            { status: 'Open' },
            { skills: selectedSkills, skillsLogic: 'AND' },
            'jobs'
          );

          // جلب النتائج
          const results = await JobPosting.find(query).lean();

          // التحقق: كل وظيفة يجب أن تحتوي على جميع المهارات المختارة
          for (const job of results) {
            const jobSkills = job.skills || [];
            const hasAllSkills = selectedSkills.every(skill =>
              jobSkills.includes(skill)
            );
            
            if (!hasAllSkills) {
              console.log('Failed AND logic:');
              console.log('Selected skills:', selectedSkills);
              console.log('Job skills:', jobSkills);
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should return only jobs with AT LEAST ONE selected skill when using OR logic', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobArbitrary(), { minLength: 5, maxLength: 20 }),
        fc.array(skillArbitrary(), { minLength: 2, maxLength: 3 }).map(arr => [...new Set(arr)]),
        async (jobs, selectedSkills) => {
          // تخطي إذا كانت المهارات المختارة أقل من 2
          if (selectedSkills.length < 2) return true;

          // إدراج الوظائف في قاعدة البيانات
          await JobPosting.insertMany(jobs);

          // تطبيق فلتر OR
          const query = filterService.applyFilters(
            { status: 'Open' },
            { skills: selectedSkills, skillsLogic: 'OR' },
            'jobs'
          );

          // جلب النتائج
          const results = await JobPosting.find(query).lean();

          // التحقق: كل وظيفة يجب أن تحتوي على مهارة واحدة على الأقل
          for (const job of results) {
            const jobSkills = job.skills || [];
            const hasAtLeastOne = selectedSkills.some(skill =>
              jobSkills.includes(skill)
            );
            
            if (!hasAtLeastOne) {
              console.log('Failed OR logic:');
              console.log('Selected skills:', selectedSkills);
              console.log('Job skills:', jobSkills);
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should return different results for AND vs OR logic with same skills', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobArbitrary(), { minLength: 10, maxLength: 30 }),
        fc.array(skillArbitrary(), { minLength: 2, maxLength: 3 }).map(arr => [...new Set(arr)]),
        async (jobs, selectedSkills) => {
          // تخطي إذا كانت المهارات المختارة أقل من 2
          if (selectedSkills.length < 2) return true;

          // إدراج الوظائف في قاعدة البيانات
          await JobPosting.insertMany(jobs);

          // تطبيق فلتر AND
          const queryAND = filterService.applyFilters(
            { status: 'Open' },
            { skills: selectedSkills, skillsLogic: 'AND' },
            'jobs'
          );
          const resultsAND = await JobPosting.find(queryAND).lean();

          // تطبيق فلتر OR
          const queryOR = filterService.applyFilters(
            { status: 'Open' },
            { skills: selectedSkills, skillsLogic: 'OR' },
            'jobs'
          );
          const resultsOR = await JobPosting.find(queryOR).lean();

          // التحقق: نتائج OR يجب أن تكون >= نتائج AND
          // (لأن OR أقل تقييداً)
          if (resultsOR.length < resultsAND.length) {
            console.log('Failed: OR results should be >= AND results');
            console.log('AND count:', resultsAND.length);
            console.log('OR count:', resultsOR.length);
            return false;
          }

          // التحقق: كل وظيفة في AND يجب أن تكون في OR
          const orIds = new Set(resultsOR.map(j => j._id.toString()));
          for (const job of resultsAND) {
            if (!orIds.has(job._id.toString())) {
              console.log('Failed: Job in AND not found in OR');
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should handle empty skills array correctly', async () => {
    const jobs = await JobPosting.insertMany([
      {
        title: 'Job 1',
        description: 'Description 1',
        requirements: 'Requirements 1',
        skills: ['JavaScript', 'React'],
        company: { name: 'Company 1' },
        location: { type: 'Cairo, Egypt', city: 'Cairo', country: 'Egypt' },
        salary: { min: 5000, max: 10000 },
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        status: 'Open',
        postedBy: new mongoose.Types.ObjectId()
      }
    ]);

    // فلتر بمهارات فارغة
    const queryAND = filterService.applyFilters(
      { status: 'Open' },
      { skills: [], skillsLogic: 'AND' },
      'jobs'
    );
    const resultsAND = await JobPosting.find(queryAND).lean();

    const queryOR = filterService.applyFilters(
      { status: 'Open' },
      { skills: [], skillsLogic: 'OR' },
      'jobs'
    );
    const resultsOR = await JobPosting.find(queryOR).lean();

    // يجب أن يرجع جميع الوظائف (لا فلتر)
    expect(resultsAND.length).toBe(jobs.length);
    expect(resultsOR.length).toBe(jobs.length);
  });

  it('should handle single skill correctly for both AND and OR', async () => {
    await JobPosting.insertMany([
      {
        title: 'Job 1',
        description: 'Description 1',
        requirements: 'Requirements 1',
        skills: ['JavaScript', 'React'],
        company: { name: 'Company 1' },
        location: { type: 'Cairo, Egypt', city: 'Cairo', country: 'Egypt' },
        salary: { min: 5000, max: 10000 },
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        status: 'Open',
        postedBy: new mongoose.Types.ObjectId()
      },
      {
        title: 'Job 2',
        description: 'Description 2',
        requirements: 'Requirements 2',
        skills: ['Python', 'Django'],
        company: { name: 'Company 2' },
        location: { type: 'Alexandria, Egypt', city: 'Alexandria', country: 'Egypt' },
        salary: { min: 6000, max: 12000 },
        jobType: 'Contract',
        experienceLevel: 'Senior',
        status: 'Open',
        postedBy: new mongoose.Types.ObjectId()
      }
    ]);

    const selectedSkills = ['JavaScript'];

    // فلتر AND
    const queryAND = filterService.applyFilters(
      { status: 'Open' },
      { skills: selectedSkills, skillsLogic: 'AND' },
      'jobs'
    );
    const resultsAND = await JobPosting.find(queryAND).lean();

    // فلتر OR
    const queryOR = filterService.applyFilters(
      { status: 'Open' },
      { skills: selectedSkills, skillsLogic: 'OR' },
      'jobs'
    );
    const resultsOR = await JobPosting.find(queryOR).lean();

    // يجب أن تكون النتائج متطابقة (مهارة واحدة)
    expect(resultsAND.length).toBe(resultsOR.length);
    expect(resultsAND.length).toBe(1);
    expect(resultsAND[0].title).toBe('Job 1');
  });
});
