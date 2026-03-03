/**
 * اختبارات دقة عداد النتائج
 * Property 6: Result Count Accuracy
 * Validates: Requirements 2.4
 */

const searchService = require('../src/services/searchService');
const filterService = require('../src/services/filterService');
const JobPosting = require('../src/models/JobPosting');
const EducationalCourse = require('../src/models/EducationalCourse');
const mongoose = require('mongoose');

describe('Result Count Accuracy Tests', () => {
  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Unit Tests - Result Count Accuracy', () => {
    beforeEach(async () => {
      // تنظيف قاعدة البيانات
      await JobPosting.deleteMany({});
      await EducationalCourse.deleteMany({});
    });

    test('should return accurate count with no filters', async () => {
      // إنشاء 10 وظائف
      const jobs = Array.from({ length: 10 }, (_, i) => ({
        title: `Job ${i + 1}`,
        description: 'Test job description',
        company: { name: 'Test Company', size: 'Medium' },
        location: { city: 'Cairo', country: 'Egypt' },
        salary: { min: 5000, max: 10000 },
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        skills: ['JavaScript', 'React'],
        status: 'Open'
      }));

      await JobPosting.insertMany(jobs);

      // البحث بدون فلاتر
      const result = await searchService.filterOnly({
        type: 'jobs',
        page: 1,
        limit: 20,
        filters: {}
      });

      // التحقق من دقة العداد
      expect(result.total).toBe(10);
      expect(result.results.length).toBe(10);
    });

    test('should return accurate count with salary filter', async () => {
      // إنشاء وظائف برواتب مختلفة
      const jobs = [
        { title: 'Job 1', salary: { min: 3000, max: 5000 }, status: 'Open', company: { name: 'Company A' }, location: { city: 'Cairo' }, jobType: 'Full-time', experienceLevel: 'Entry', skills: ['JavaScript'] },
        { title: 'Job 2', salary: { min: 6000, max: 8000 }, status: 'Open', company: { name: 'Company B' }, location: { city: 'Cairo' }, jobType: 'Full-time', experienceLevel: 'Mid', skills: ['Python'] },
        { title: 'Job 3', salary: { min: 10000, max: 15000 }, status: 'Open', company: { name: 'Company C' }, location: { city: 'Cairo' }, jobType: 'Full-time', experienceLevel: 'Senior', skills: ['Java'] },
        { title: 'Job 4', salary: { min: 4000, max: 6000 }, status: 'Open', company: { name: 'Company D' }, location: { city: 'Cairo' }, jobType: 'Full-time', experienceLevel: 'Entry', skills: ['PHP'] },
        { title: 'Job 5', salary: { min: 12000, max: 18000 }, status: 'Open', company: { name: 'Company E' }, location: { city: 'Cairo' }, jobType: 'Full-time', experienceLevel: 'Senior', skills: ['C++'] }
      ];

      await JobPosting.insertMany(jobs);

      // البحث مع فلتر الراتب (5000-10000)
      const result = await searchService.filterOnly({
        type: 'jobs',
        page: 1,
        limit: 20,
        filters: {
          salaryMin: 5000,
          salaryMax: 10000
        }
      });

      // يجب أن يعيد Job 2 و Job 4 فقط (2 وظائف)
      expect(result.total).toBe(2);
      expect(result.results.length).toBe(2);
    });

    test('should return accurate count with work type filter', async () => {
      // إنشاء وظائف بأنواع عمل مختلفة
      const jobs = [
        { title: 'Job 1', jobType: 'Full-time', status: 'Open', company: { name: 'Company A' }, location: { city: 'Cairo' }, salary: { min: 5000 }, experienceLevel: 'Mid', skills: ['JavaScript'] },
        { title: 'Job 2', jobType: 'Part-time', status: 'Open', company: { name: 'Company B' }, location: { city: 'Cairo' }, salary: { min: 3000 }, experienceLevel: 'Entry', skills: ['Python'] },
        { title: 'Job 3', jobType: 'Remote', status: 'Open', company: { name: 'Company C' }, location: { city: 'Cairo' }, salary: { min: 6000 }, experienceLevel: 'Mid', skills: ['Java'] },
        { title: 'Job 4', jobType: 'Full-time', status: 'Open', company: { name: 'Company D' }, location: { city: 'Cairo' }, salary: { min: 5500 }, experienceLevel: 'Mid', skills: ['PHP'] },
        { title: 'Job 5', jobType: 'Hybrid', status: 'Open', company: { name: 'Company E' }, location: { city: 'Cairo' }, salary: { min: 7000 }, experienceLevel: 'Senior', skills: ['C++'] }
      ];

      await JobPosting.insertMany(jobs);

      // البحث مع فلتر نوع العمل (Full-time)
      const result = await searchService.filterOnly({
        type: 'jobs',
        page: 1,
        limit: 20,
        filters: {
          workType: ['Full-time']
        }
      });

      // يجب أن يعيد Job 1 و Job 4 فقط (2 وظائف)
      expect(result.total).toBe(2);
      expect(result.results.length).toBe(2);
    });

    test('should return accurate count with multiple filters', async () => {
      // إنشاء وظائف متنوعة
      const jobs = [
        { title: 'Job 1', jobType: 'Full-time', experienceLevel: 'Mid', salary: { min: 5000 }, status: 'Open', company: { name: 'Company A' }, location: { city: 'Cairo' }, skills: ['JavaScript', 'React'] },
        { title: 'Job 2', jobType: 'Part-time', experienceLevel: 'Entry', salary: { min: 3000 }, status: 'Open', company: { name: 'Company B' }, location: { city: 'Alexandria' }, skills: ['Python'] },
        { title: 'Job 3', jobType: 'Full-time', experienceLevel: 'Mid', salary: { min: 6000 }, status: 'Open', company: { name: 'Company C' }, location: { city: 'Cairo' }, skills: ['JavaScript', 'Node.js'] },
        { title: 'Job 4', jobType: 'Remote', experienceLevel: 'Senior', salary: { min: 10000 }, status: 'Open', company: { name: 'Company D' }, location: { city: 'Cairo' }, skills: ['Java'] },
        { title: 'Job 5', jobType: 'Full-time', experienceLevel: 'Mid', salary: { min: 5500 }, status: 'Open', company: { name: 'Company E' }, location: { city: 'Cairo' }, skills: ['JavaScript', 'Vue'] }
      ];

      await JobPosting.insertMany(jobs);

      // البحث مع فلاتر متعددة
      const result = await searchService.filterOnly({
        type: 'jobs',
        page: 1,
        limit: 20,
        filters: {
          workType: ['Full-time'],
          experienceLevel: ['Mid'],
          skills: ['JavaScript'],
          skillsLogic: 'OR'
        }
      });

      // يجب أن يعيد Job 1, Job 3, Job 5 (3 وظائف)
      expect(result.total).toBe(3);
      expect(result.results.length).toBe(3);
    });

    test('should return accurate count with skills AND logic', async () => {
      // إنشاء وظائف بمهارات مختلفة
      const jobs = [
        { title: 'Job 1', skills: ['JavaScript', 'React', 'Node.js'], status: 'Open', company: { name: 'Company A' }, location: { city: 'Cairo' }, salary: { min: 5000 }, jobType: 'Full-time', experienceLevel: 'Mid' },
        { title: 'Job 2', skills: ['JavaScript', 'React'], status: 'Open', company: { name: 'Company B' }, location: { city: 'Cairo' }, salary: { min: 4000 }, jobType: 'Full-time', experienceLevel: 'Entry' },
        { title: 'Job 3', skills: ['JavaScript', 'Node.js'], status: 'Open', company: { name: 'Company C' }, location: { city: 'Cairo' }, salary: { min: 6000 }, jobType: 'Full-time', experienceLevel: 'Mid' },
        { title: 'Job 4', skills: ['React', 'Node.js'], status: 'Open', company: { name: 'Company D' }, location: { city: 'Cairo' }, salary: { min: 5500 }, jobType: 'Full-time', experienceLevel: 'Mid' },
        { title: 'Job 5', skills: ['Python', 'Django'], status: 'Open', company: { name: 'Company E' }, location: { city: 'Cairo' }, salary: { min: 5000 }, jobType: 'Full-time', experienceLevel: 'Mid' }
      ];

      await JobPosting.insertMany(jobs);

      // البحث مع منطق AND (يجب توفر جميع المهارات)
      const result = await searchService.filterOnly({
        type: 'jobs',
        page: 1,
        limit: 20,
        filters: {
          skills: ['JavaScript', 'React', 'Node.js'],
          skillsLogic: 'AND'
        }
      });

      // يجب أن يعيد Job 1 فقط (1 وظيفة)
      expect(result.total).toBe(1);
      expect(result.results.length).toBe(1);
    });

    test('should return accurate count with date filter', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);

      // إنشاء وظائف بتواريخ مختلفة
      const jobs = [
        { title: 'Job 1', createdAt: now, status: 'Open', company: { name: 'Company A' }, location: { city: 'Cairo' }, salary: { min: 5000 }, jobType: 'Full-time', experienceLevel: 'Mid', skills: ['JavaScript'] },
        { title: 'Job 2', createdAt: yesterday, status: 'Open', company: { name: 'Company B' }, location: { city: 'Cairo' }, salary: { min: 4000 }, jobType: 'Full-time', experienceLevel: 'Entry', skills: ['Python'] },
        { title: 'Job 3', createdAt: lastWeek, status: 'Open', company: { name: 'Company C' }, location: { city: 'Cairo' }, salary: { min: 6000 }, jobType: 'Full-time', experienceLevel: 'Mid', skills: ['Java'] },
        { title: 'Job 4', createdAt: lastMonth, status: 'Open', company: { name: 'Company D' }, location: { city: 'Cairo' }, salary: { min: 5500 }, jobType: 'Full-time', experienceLevel: 'Mid', skills: ['PHP'] }
      ];

      await JobPosting.insertMany(jobs);

      // البحث عن وظائف آخر أسبوع
      const result = await searchService.filterOnly({
        type: 'jobs',
        page: 1,
        limit: 20,
        filters: {
          datePosted: 'week'
        }
      });

      // يجب أن يعيد Job 1, Job 2, Job 3 (3 وظائف)
      expect(result.total).toBe(3);
      expect(result.results.length).toBe(3);
    });

    test('should include filter counts in response', async () => {
      // إنشاء وظائف متنوعة
      const jobs = [
        { title: 'Job 1', jobType: 'Full-time', status: 'Open', company: { name: 'Company A' }, location: { city: 'Cairo' }, salary: { min: 5000 }, experienceLevel: 'Mid', skills: ['JavaScript'] },
        { title: 'Job 2', jobType: 'Part-time', status: 'Open', company: { name: 'Company B' }, location: { city: 'Cairo' }, salary: { min: 3000 }, experienceLevel: 'Entry', skills: ['Python'] },
        { title: 'Job 3', jobType: 'Full-time', status: 'Open', company: { name: 'Company C' }, location: { city: 'Cairo' }, salary: { min: 6000 }, experienceLevel: 'Mid', skills: ['Java'] }
      ];

      await JobPosting.insertMany(jobs);

      // البحث مع فلتر
      const result = await searchService.filterOnly({
        type: 'jobs',
        page: 1,
        limit: 20,
        filters: {
          workType: ['Full-time']
        }
      });

      // التحقق من وجود filter counts
      expect(result.filters).toBeDefined();
      expect(result.filters.counts).toBeDefined();
      expect(result.filters.counts.total).toBe(3); // إجمالي الوظائف
      expect(result.filters.counts.withFilters).toBe(2); // مع الفلتر المطبق
    });

    test('should update count when filter changes', async () => {
      // إنشاء وظائف
      const jobs = [
        { title: 'Job 1', jobType: 'Full-time', experienceLevel: 'Entry', status: 'Open', company: { name: 'Company A' }, location: { city: 'Cairo' }, salary: { min: 3000 }, skills: ['JavaScript'] },
        { title: 'Job 2', jobType: 'Full-time', experienceLevel: 'Mid', status: 'Open', company: { name: 'Company B' }, location: { city: 'Cairo' }, salary: { min: 5000 }, skills: ['Python'] },
        { title: 'Job 3', jobType: 'Part-time', experienceLevel: 'Entry', status: 'Open', company: { name: 'Company C' }, location: { city: 'Cairo' }, salary: { min: 2000 }, skills: ['Java'] }
      ];

      await JobPosting.insertMany(jobs);

      // البحث بدون فلتر
      const result1 = await searchService.filterOnly({
        type: 'jobs',
        page: 1,
        limit: 20,
        filters: {}
      });

      expect(result1.total).toBe(3);

      // البحث مع فلتر نوع العمل
      const result2 = await searchService.filterOnly({
        type: 'jobs',
        page: 1,
        limit: 20,
        filters: {
          workType: ['Full-time']
        }
      });

      expect(result2.total).toBe(2);

      // البحث مع فلترين
      const result3 = await searchService.filterOnly({
        type: 'jobs',
        page: 1,
        limit: 20,
        filters: {
          workType: ['Full-time'],
          experienceLevel: ['Mid']
        }
      });

      expect(result3.total).toBe(1);
    });
  });

  describe('Integration Tests - Result Count with Text Search', () => {
    beforeEach(async () => {
      await JobPosting.deleteMany({});
    });

    test('should return accurate count with text search and filters', async () => {
      // إنشاء وظائف
      const jobs = [
        { title: 'JavaScript Developer', description: 'Frontend developer needed', jobType: 'Full-time', status: 'Open', company: { name: 'Company A' }, location: { city: 'Cairo' }, salary: { min: 5000 }, experienceLevel: 'Mid', skills: ['JavaScript', 'React'] },
        { title: 'Python Developer', description: 'Backend developer needed', jobType: 'Full-time', status: 'Open', company: { name: 'Company B' }, location: { city: 'Cairo' }, salary: { min: 6000 }, experienceLevel: 'Mid', skills: ['Python', 'Django'] },
        { title: 'JavaScript Engineer', description: 'Full stack developer needed', jobType: 'Remote', status: 'Open', company: { name: 'Company C' }, location: { city: 'Cairo' }, salary: { min: 7000 }, experienceLevel: 'Senior', skills: ['JavaScript', 'Node.js'] }
      ];

      await JobPosting.insertMany(jobs);

      // إنشاء text index
      await JobPosting.collection.createIndex({
        title: 'text',
        description: 'text',
        skills: 'text'
      });

      // البحث النصي مع فلتر
      const result = await searchService.textSearch('JavaScript', {
        type: 'jobs',
        page: 1,
        limit: 20,
        filters: {
          jobType: ['Full-time']
        }
      });

      // يجب أن يعيد Job 1 فقط (1 وظيفة)
      expect(result.total).toBe(1);
      expect(result.results.length).toBe(1);
    });
  });
});
