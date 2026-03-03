/**
 * Property-Based Tests for Multiple Filter Application
 * Feature: advanced-search-filter
 * Property 4: Multiple Filter Application
 * Validates: Requirements 2.2
 * 
 * For any combination of filters (salary, location, work type, experience, skills, 
 * date, company size), when applied simultaneously, the results should satisfy all 
 * filter conditions (AND logic between different filter types).
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const filterService = require('../src/services/FilterService');

describe('Property 4: Multiple Filter Application', () => {
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
      fc.constant('Join our innovative startup and make an impact')
    ),
    requirements: fc.constant('Bachelor degree in Computer Science'),
    skills: fc.array(
      fc.oneof(
        fc.constant('JavaScript'),
        fc.constant('React'),
        fc.constant('Node.js'),
        fc.constant('Python'),
        fc.constant('MongoDB'),
        fc.constant('Docker'),
        fc.constant('TypeScript'),
        fc.constant('Vue.js')
      ),
      { minLength: 2, maxLength: 5 }
    ),
    company: fc.record({
      name: fc.oneof(
        fc.constant('TechCorp'),
        fc.constant('InnovateSoft'),
        fc.constant('DataDynamics')
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
      fc.constant('Giza, Egypt'),
      fc.constant('Mansoura, Egypt')
    ),
    salary: fc.record({
      min: fc.integer({ min: 5000, max: 15000 }),
      max: fc.integer({ min: 15000, max: 30000 })
    }),
    jobType: fc.oneof(
      fc.constant('Full-time'),
      fc.constant('Part-time'),
      fc.constant('Contract'),
      fc.constant('Temporary')
    ),
    experienceLevel: fc.oneof(
      fc.constant('Entry'),
      fc.constant('Mid'),
      fc.constant('Senior')
    ),
    postingType: fc.constant('Permanent Job'),
    priceType: fc.constant('Salary Based'),
    postedBy: fc.constant(new mongoose.Types.ObjectId()),
    status: fc.constant('Open'),
    createdAt: fc.date({ 
      min: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // آخر 90 يوم
      max: new Date() 
    }).filter(date => !isNaN(date.getTime())) // تصفية التواريخ غير الصالحة
  });

  /**
   * Arbitrary: توليد فلاتر عشوائية
   */
  const filtersArbitrary = () => fc.record({
    salaryMin: fc.option(fc.integer({ min: 5000, max: 10000 }), { nil: undefined }),
    salaryMax: fc.option(fc.integer({ min: 10001, max: 25000 }), { nil: undefined }), // تأكد أن max > min
    location: fc.option(
      fc.oneof(
        fc.constant('Cairo'),
        fc.constant('Alexandria'),
        fc.constant('Giza')
      ),
      { nil: undefined }
    ),
    workType: fc.option(
      fc.array(
        fc.oneof(
          fc.constant('Full-time'),
          fc.constant('Part-time'),
          fc.constant('Contract'),
          fc.constant('Temporary')
        ),
        { minLength: 1, maxLength: 2 }
      ),
      { nil: undefined }
    ),
    experienceLevel: fc.option(
      fc.array(
        fc.oneof(
          fc.constant('Entry'),
          fc.constant('Mid'),
          fc.constant('Senior')
        ),
        { minLength: 1, maxLength: 2 }
      ),
      { nil: undefined }
    ),
    skills: fc.option(
      fc.array(
        fc.oneof(
          fc.constant('JavaScript'),
          fc.constant('React'),
          fc.constant('Python')
        ),
        { minLength: 1, maxLength: 2 }
      ),
      { nil: undefined }
    ),
    skillsLogic: fc.option(
      fc.oneof(fc.constant('AND'), fc.constant('OR')),
      { nil: 'OR' }
    ),
    datePosted: fc.option(
      fc.oneof(
        fc.constant('today'),
        fc.constant('week'),
        fc.constant('month')
      ),
      { nil: undefined }
    ),
    companySize: fc.option(
      fc.array(
        fc.oneof(
          fc.constant('Small'),
          fc.constant('Medium'),
          fc.constant('Large')
        ),
        { minLength: 1, maxLength: 2 }
      ),
      { nil: undefined }
    )
  });

  /**
   * Property Test 1: تطبيق فلاتر متعددة يجب أن يرجع نتائج تحقق جميع الشروط
   */
  it('should return results that satisfy all filter conditions (AND logic)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobPostingArbitrary(), { minLength: 20, maxLength: 30 }),
        filtersArbitrary(),
        async (jobsData, filters) => {
          // إدراج الوظائف في قاعدة البيانات
          const jobs = await JobPosting.insertMany(jobsData);

          // تطبيق الفلاتر
          const baseQuery = { status: 'Open' };
          const filteredQuery = filterService.applyFilters(baseQuery, filters, 'jobs');

          // تنفيذ الاستعلام
          const results = await JobPosting.find(filteredQuery);

          // التحقق: كل نتيجة يجب أن تحقق جميع الفلاتر
          results.forEach(job => {
            // فلتر الراتب
            if (filters.salaryMin !== undefined) {
              expect(job.salary.max).toBeGreaterThanOrEqual(filters.salaryMin);
            }
            if (filters.salaryMax !== undefined) {
              expect(job.salary.min).toBeLessThanOrEqual(filters.salaryMax);
            }

            // فلتر الموقع
            if (filters.location) {
              expect(job.location.toLowerCase()).toContain(filters.location.toLowerCase());
            }

            // فلتر نوع العمل
            if (filters.workType && filters.workType.length > 0) {
              expect(filters.workType).toContain(job.jobType);
            }

            // فلتر مستوى الخبرة
            if (filters.experienceLevel && filters.experienceLevel.length > 0) {
              expect(filters.experienceLevel).toContain(job.experienceLevel);
            }

            // فلتر المهارات
            if (filters.skills && filters.skills.length > 0) {
              if (filters.skillsLogic === 'AND') {
                // يجب توفر جميع المهارات
                filters.skills.forEach(skill => {
                  expect(job.skills).toContain(skill);
                });
              } else {
                // يكفي توفر أي مهارة
                const hasAnySkill = filters.skills.some(skill => job.skills.includes(skill));
                expect(hasAnySkill).toBe(true);
              }
            }

            // فلتر حجم الشركة
            if (filters.companySize && filters.companySize.length > 0) {
              expect(filters.companySize).toContain(job.company.size);
            }

            // فلتر تاريخ النشر
            if (filters.datePosted) {
              const now = new Date();
              const jobDate = new Date(job.createdAt);
              const diffDays = Math.floor((now - jobDate) / (1000 * 60 * 60 * 24));

              if (filters.datePosted === 'today') {
                expect(diffDays).toBeLessThanOrEqual(1);
              } else if (filters.datePosted === 'week') {
                expect(diffDays).toBeLessThanOrEqual(7);
              } else if (filters.datePosted === 'month') {
                expect(diffDays).toBeLessThanOrEqual(30);
              }
            }
          });
        }
      ),
      { numRuns: 50, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property Test 2: تطبيق فلتر واحد يجب أن يعمل بشكل صحيح
   */
  it('should correctly apply single filter', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobPostingArbitrary(), { minLength: 15, maxLength: 20 }),
        fc.oneof(
          fc.record({ salaryMin: fc.integer({ min: 8000, max: 12000 }) }),
          fc.record({ location: fc.constant('Cairo') }),
          fc.record({ workType: fc.constant(['Full-time']) }),
          fc.record({ experienceLevel: fc.constant(['Mid']) }),
          fc.record({ skills: fc.constant(['JavaScript']), skillsLogic: fc.constant('OR') })
        ),
        async (jobsData, singleFilter) => {
          // إدراج الوظائف
          await JobPosting.insertMany(jobsData);

          // تطبيق الفلتر الواحد
          const baseQuery = { status: 'Open' };
          const filteredQuery = filterService.applyFilters(baseQuery, singleFilter, 'jobs');

          // تنفيذ الاستعلام
          const results = await JobPosting.find(filteredQuery);

          // التحقق: النتائج يجب أن تكون مصفوفة
          expect(Array.isArray(results)).toBe(true);
          expect(results.length).toBeGreaterThanOrEqual(0);

          // التحقق: كل نتيجة تحقق الفلتر
          results.forEach(job => {
            if (singleFilter.salaryMin) {
              expect(job.salary.max).toBeGreaterThanOrEqual(singleFilter.salaryMin);
            }
            if (singleFilter.location) {
              expect(job.location.toLowerCase()).toContain(singleFilter.location.toLowerCase());
            }
            if (singleFilter.workType) {
              expect(singleFilter.workType).toContain(job.jobType);
            }
            if (singleFilter.experienceLevel) {
              expect(singleFilter.experienceLevel).toContain(job.experienceLevel);
            }
            if (singleFilter.skills) {
              const hasSkill = singleFilter.skills.some(skill => job.skills.includes(skill));
              expect(hasSkill).toBe(true);
            }
          });
        }
      ),
      { numRuns: 30, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property Test 3: فلاتر متعددة يجب أن تقلل عدد النتائج أو تبقيه كما هو
   */
  it('should reduce or maintain result count when adding more filters', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobPostingArbitrary(), { minLength: 20, maxLength: 25 }),
        async (jobsData) => {
          // إدراج الوظائف
          await JobPosting.insertMany(jobsData);

          const baseQuery = { status: 'Open' };

          // بدون فلاتر
          const noFilters = await JobPosting.find(baseQuery);

          // فلتر واحد
          const oneFilter = filterService.applyFilters(baseQuery, { 
            experienceLevel: ['Mid', 'Senior'] 
          }, 'jobs');
          const oneFilterResults = await JobPosting.find(oneFilter);

          // فلترين
          const twoFilters = filterService.applyFilters(baseQuery, {
            experienceLevel: ['Mid', 'Senior'],
            workType: ['Full-time']
          }, 'jobs');
          const twoFiltersResults = await JobPosting.find(twoFilters);

          // ثلاثة فلاتر
          const threeFilters = filterService.applyFilters(baseQuery, {
            experienceLevel: ['Mid', 'Senior'],
            workType: ['Full-time'],
            salaryMin: 8000
          }, 'jobs');
          const threeFiltersResults = await JobPosting.find(threeFilters);

          // التحقق: عدد النتائج يجب أن يقل أو يبقى كما هو
          expect(oneFilterResults.length).toBeLessThanOrEqual(noFilters.length);
          expect(twoFiltersResults.length).toBeLessThanOrEqual(oneFilterResults.length);
          expect(threeFiltersResults.length).toBeLessThanOrEqual(twoFiltersResults.length);
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property Test 4: فلاتر متناقضة يجب أن ترجع نتائج فارغة
   */
  it('should return empty results for contradictory filters', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobPostingArbitrary(), { minLength: 15, maxLength: 20 }),
        async (jobsData) => {
          // إدراج الوظائف
          await JobPosting.insertMany(jobsData);

          // فلاتر متناقضة: راتب أدنى أكبر من الأقصى
          const contradictoryFilters = {
            salaryMin: 25000,
            salaryMax: 10000
          };

          const baseQuery = { status: 'Open' };
          const filteredQuery = filterService.applyFilters(baseQuery, contradictoryFilters, 'jobs');
          const results = await JobPosting.find(filteredQuery);

          // التحقق: يجب أن تكون النتائج فارغة
          expect(results.length).toBe(0);
        }
      ),
      { numRuns: 15, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property Test 5: فلاتر فارغة يجب أن ترجع جميع النتائج
   */
  it('should return all results when no filters are applied', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobPostingArbitrary(), { minLength: 10, maxLength: 15 }),
        async (jobsData) => {
          // تنظيف قبل الاختبار
          await JobPosting.deleteMany({});
          
          // إدراج الوظائف
          const jobs = await JobPosting.insertMany(jobsData);

          // بدون فلاتر
          const baseQuery = { status: 'Open' };
          const filteredQuery = filterService.applyFilters(baseQuery, {}, 'jobs');
          const results = await JobPosting.find(filteredQuery);

          // التحقق: يجب أن ترجع جميع الوظائف
          expect(results.length).toBe(jobs.length);
          
          // تنظيف بعد الاختبار
          await JobPosting.deleteMany({});
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property Test 6: منطق AND للمهارات يجب أن يتطلب جميع المهارات
   */
  it('should require all skills when using AND logic', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobPostingArbitrary(), { minLength: 15, maxLength: 20 }),
        fc.array(
          fc.oneof(
            fc.constant('JavaScript'),
            fc.constant('React'),
            fc.constant('Node.js')
          ),
          { minLength: 2, maxLength: 3 }
        ),
        async (jobsData, requiredSkills) => {
          // إدراج الوظائف
          await JobPosting.insertMany(jobsData);

          // تطبيق فلتر المهارات مع منطق AND
          const filters = {
            skills: requiredSkills,
            skillsLogic: 'AND'
          };

          const baseQuery = { status: 'Open' };
          const filteredQuery = filterService.applyFilters(baseQuery, filters, 'jobs');
          const results = await JobPosting.find(filteredQuery);

          // التحقق: كل نتيجة يجب أن تحتوي على جميع المهارات المطلوبة
          results.forEach(job => {
            requiredSkills.forEach(skill => {
              expect(job.skills).toContain(skill);
            });
          });
        }
      ),
      { numRuns: 25, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property Test 7: منطق OR للمهارات يجب أن يتطلب أي مهارة
   */
  it('should require any skill when using OR logic', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobPostingArbitrary(), { minLength: 15, maxLength: 20 }),
        fc.array(
          fc.oneof(
            fc.constant('JavaScript'),
            fc.constant('Python'),
            fc.constant('Docker')
          ),
          { minLength: 2, maxLength: 3 }
        ),
        async (jobsData, anySkills) => {
          // إدراج الوظائف
          await JobPosting.insertMany(jobsData);

          // تطبيق فلتر المهارات مع منطق OR
          const filters = {
            skills: anySkills,
            skillsLogic: 'OR'
          };

          const baseQuery = { status: 'Open' };
          const filteredQuery = filterService.applyFilters(baseQuery, filters, 'jobs');
          const results = await JobPosting.find(filteredQuery);

          // التحقق: كل نتيجة يجب أن تحتوي على أي مهارة من المطلوبة
          results.forEach(job => {
            const hasAnySkill = anySkills.some(skill => job.skills.includes(skill));
            expect(hasAnySkill).toBe(true);
          });
        }
      ),
      { numRuns: 25, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property Test 8: النتائج يجب أن تكون متسقة عبر عدة تشغيلات
   */
  it('should return consistent results across multiple runs with same filters', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobPostingArbitrary(), { minLength: 15, maxLength: 20 }),
        filtersArbitrary(),
        async (jobsData, filters) => {
          // إدراج الوظائف
          await JobPosting.insertMany(jobsData);

          const baseQuery = { status: 'Open' };
          const filteredQuery = filterService.applyFilters(baseQuery, filters, 'jobs');

          // تنفيذ الاستعلام 3 مرات
          const results1 = await JobPosting.find(filteredQuery);
          const results2 = await JobPosting.find(filteredQuery);
          const results3 = await JobPosting.find(filteredQuery);

          // التحقق: النتائج يجب أن تكون متطابقة
          expect(results1.length).toBe(results2.length);
          expect(results2.length).toBe(results3.length);

          // التحقق: نفس الوظائف في كل مرة
          const ids1 = results1.map(j => j._id.toString()).sort();
          const ids2 = results2.map(j => j._id.toString()).sort();
          const ids3 = results3.map(j => j._id.toString()).sort();

          expect(ids1).toEqual(ids2);
          expect(ids2).toEqual(ids3);
        }
      ),
      { numRuns: 20, timeout: 30000 }
    );
  }, 60000);
});
