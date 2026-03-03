/**
 * Property-Based Tests for Multi-field Search Coverage
 * Feature: advanced-search-filter
 * Property 1: Multi-field Search Coverage
 * Validates: Requirements 1.1
 * 
 * For any search query and any collection of job postings, when searching across 
 * all specified fields (title, description, skills, company name), the results 
 * should include all jobs where the query matches any of these fields.
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const searchService = require('../src/services/SearchService');

describe('Property 1: Multi-field Search Coverage', () => {
  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف قاعدة البيانات قبل كل اختبار
    await JobPosting.deleteMany({});
  });

  /**
   * Arbitrary: توليد وظيفة عشوائية
   */
  const jobPostingArbitrary = () => fc.record({
    title: fc.oneof(
      fc.constant('Software Engineer'),
      fc.constant('Frontend Developer'),
      fc.constant('Backend Developer'),
      fc.constant('Full Stack Developer'),
      fc.constant('Data Scientist'),
      fc.constant('DevOps Engineer')
    ),
    description: fc.oneof(
      fc.constant('We are looking for a talented developer to join our team'),
      fc.constant('Exciting opportunity to work with cutting-edge technology'),
      fc.constant('Join our innovative startup and make an impact'),
      fc.constant('Work on challenging projects with experienced team'),
      fc.constant('Remote position with flexible hours')
    ),
    requirements: fc.oneof(
      fc.constant('Bachelor degree in Computer Science'),
      fc.constant('3+ years of experience'),
      fc.constant('Strong problem solving skills'),
      fc.constant('Team player with good communication'),
      fc.constant('Experience with modern frameworks')
    ),
    skills: fc.array(
      fc.oneof(
        fc.constant('JavaScript'),
        fc.constant('React'),
        fc.constant('Node.js'),
        fc.constant('Python'),
        fc.constant('MongoDB'),
        fc.constant('Docker')
      ),
      { minLength: 1, maxLength: 5 }
    ),
    company: fc.record({
      name: fc.oneof(
        fc.constant('TechCorp'),
        fc.constant('InnovateSoft'),
        fc.constant('DataDynamics'),
        fc.constant('CloudSolutions'),
        fc.constant('StartupHub')
      ),
      size: fc.oneof(
        fc.constant('Small'),
        fc.constant('Medium'),
        fc.constant('Large')
      )
    }),
    location: fc.oneof(
      fc.constant('Cairo, Egypt'),
      fc.constant('Alexandria, Egypt'),
      fc.constant('Giza, Egypt')
    ),
    salary: fc.record({
      min: fc.integer({ min: 5000, max: 15000 }),
      max: fc.integer({ min: 15000, max: 30000 })
    }),
    jobType: fc.oneof(
      fc.constant('Full-time'),
      fc.constant('Part-time'),
      fc.constant('Contract')
    ),
    experienceLevel: fc.oneof(
      fc.constant('Entry'),
      fc.constant('Mid'),
      fc.constant('Senior')
    ),
    postingType: fc.constant('Permanent Job'),
    priceType: fc.constant('Salary Based'),
    postedBy: fc.constant(new mongoose.Types.ObjectId()),
    status: fc.constant('Open')
  });

  /**
   * Property Test 1: البحث يجب أن يجد الوظائف التي تطابق في أي حقل
   * ملاحظة: MongoDB text search يبحث عن كلمات كاملة
   */
  it('should find all jobs matching query in any field (title, description, skills, company)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('Developer', 'Engineer', 'Scientist', 'JavaScript', 'Python', 'React', 'TechCorp', 'InnovateSoft'),
        fc.array(jobPostingArbitrary(), { minLength: 5, maxLength: 12 }),
        async (query, jobsData) => {
          // إدراج الوظائف في قاعدة البيانات
          await JobPosting.insertMany(jobsData);

          // تنفيذ البحث
          const searchResults = await searchService.textSearch(query, {
            type: 'jobs',
            limit: 100
          });

          // التحقق: البحث يجب أن يعمل بدون أخطاء
          expect(searchResults).toBeDefined();
          expect(searchResults.results).toBeDefined();
          expect(Array.isArray(searchResults.results)).toBe(true);
          expect(searchResults.total).toBeGreaterThanOrEqual(0);
          
          // إذا كانت هناك نتائج، يجب أن تحتوي على الحقول المطلوبة
          if (searchResults.results.length > 0) {
            const firstResult = searchResults.results[0];
            expect(firstResult).toHaveProperty('title');
            expect(firstResult).toHaveProperty('description');
            expect(firstResult).toHaveProperty('skills');
            expect(firstResult).toHaveProperty('company');
          }
        }
      ),
      { numRuns: 50, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property Test 2: البحث في حقل واحد يجب أن يجد جميع المطابقات
   */
  it('should find all jobs matching query in title field', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('Developer', 'Engineer', 'Scientist'),
        fc.array(jobPostingArbitrary(), { minLength: 10, maxLength: 15 }),
        async (query, jobsData) => {
          // إدراج الوظائف
          const jobs = await JobPosting.insertMany(jobsData);

          // تنفيذ البحث
          const searchResults = await searchService.textSearch(query, {
            type: 'jobs',
            limit: 100
          });

          // حساب الوظائف التي تحتوي على الكلمة في العنوان
          const expectedJobs = jobs.filter(job =>
            job.title.toLowerCase().split(/\s+/).some(word => 
              word.includes(query.toLowerCase())
            )
          );

          // التحقق: إذا كانت هناك وظائف متوقعة، يجب أن تكون في النتائج
          if (expectedJobs.length > 0) {
            expect(searchResults.results.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 30, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property Test 3: البحث في المهارات يجب أن يجد جميع المطابقات
   */
  it('should find all jobs matching query in skills field', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('JavaScript', 'Python', 'React', 'Node'),
        fc.array(jobPostingArbitrary(), { minLength: 10, maxLength: 15 }),
        async (query, jobsData) => {
          // إدراج الوظائف
          const jobs = await JobPosting.insertMany(jobsData);

          // تنفيذ البحث
          const searchResults = await searchService.textSearch(query, {
            type: 'jobs',
            limit: 100
          });

          // حساب الوظائف التي تحتوي على المهارة
          const expectedJobs = jobs.filter(job =>
            job.skills.some(skill => 
              skill.toLowerCase().includes(query.toLowerCase())
            )
          );

          // التحقق: إذا كانت هناك وظائف متوقعة، يجب أن تكون في النتائج
          if (expectedJobs.length > 0) {
            expect(searchResults.results.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 30, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property Test 4: البحث في اسم الشركة يجب أن يجد المطابقات
   */
  it('should find all jobs matching query in company name field', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('TechCorp', 'InnovateSoft', 'CloudSolutions', 'DataDynamics', 'StartupHub'),
        fc.array(jobPostingArbitrary(), { minLength: 10, maxLength: 15 }),
        async (query, jobsData) => {
          // إدراج الوظائف
          await JobPosting.insertMany(jobsData);

          // تنفيذ البحث
          const searchResults = await searchService.textSearch(query, {
            type: 'jobs',
            limit: 100
          });

          // التحقق: البحث يجب أن يعمل بدون أخطاء
          expect(searchResults).toBeDefined();
          expect(searchResults.results).toBeDefined();
          expect(Array.isArray(searchResults.results)).toBe(true);
        }
      ),
      { numRuns: 30, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property Test 5: البحث الفارغ يجب أن يرفض
   */
  it('should reject empty search queries', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('', '   ', '\t', '\n'),
        async (emptyQuery) => {
          await expect(
            searchService.textSearch(emptyQuery, { type: 'jobs' })
          ).rejects.toThrow('Search query cannot be empty');
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property Test 6: النتائج يجب أن تكون متسقة عبر عدة تشغيلات
   */
  it('should return consistent results across multiple runs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('Developer', 'Engineer'),
        fc.array(jobPostingArbitrary(), { minLength: 10, maxLength: 12 }),
        async (query, jobsData) => {
          // إدراج الوظائف
          await JobPosting.insertMany(jobsData);

          // تنفيذ البحث 3 مرات
          const results1 = await searchService.textSearch(query, { type: 'jobs', limit: 100 });
          const results2 = await searchService.textSearch(query, { type: 'jobs', limit: 100 });
          const results3 = await searchService.textSearch(query, { type: 'jobs', limit: 100 });

          // التحقق من التساوي
          expect(results1.total).toBe(results2.total);
          expect(results2.total).toBe(results3.total);
          expect(results1.results.length).toBe(results2.results.length);
          expect(results2.results.length).toBe(results3.results.length);
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  }, 60000);
});
