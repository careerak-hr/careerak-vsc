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
      const testUserId = new mongoose.Types.ObjectId();
      const jobs = Array.from({ length: 10 }, (_, i) => ({
        title: `Job ${i + 1}`,
        description: 'Test job description',
        requirements: 'Test requirements',
        company: { name: 'Test Company', size: 'Medium' },
        location: 'Cairo, Egypt',
        salary: { min: 5000, max: 10000 },
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        skills: ['JavaScript', 'React'],
        status: 'Open',
        postedBy: testUserId
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
      const testUserId = new mongoose.Types.ObjectId();
      const jobs = [
        { title: 'Job 1', description: 'Test desc', requirements: 'Test req', salary: { min: 3000, max: 5000 }, status: 'Open', company: { name: 'Company A' }, location: 'Cairo, Egypt', jobType: 'Full-time', experienceLevel: 'Entry', skills: ['JavaScript'], postedBy: testUserId },
        { title: 'Job 2', description: 'Test desc', requirements: 'Test req', salary: { min: 6000, max: 8000 }, status: 'Open', company: { name: 'Company B' }, location: 'Cairo, Egypt', jobType: 'Full-time', experienceLevel: 'Mid', skills: ['Python'], postedBy: testUserId },
        { title: 'Job 3', description: 'Test desc', requirements: 'Test req', salary: { min: 10000, max: 15000 }, status: 'Open', company: { name: 'Company C' }, location: 'Cairo, Egypt', jobType: 'Full-time', experienceLevel: 'Senior', skills: ['Java'], postedBy: testUserId },
        { title: 'Job 4', description: 'Test desc', requirements: 'Test req', salary: { min: 4000, max: 6000 }, status: 'Open', company: { name: 'Company D' }, location: 'Cairo, Egypt', jobType: 'Full-time', experienceLevel: 'Entry', skills: ['PHP'], postedBy: testUserId },
        { title: 'Job 5', description: 'Test desc', requirements: 'Test req', salary: { min: 12000, max: 18000 }, status: 'Open', company: { name: 'Company E' }, location: 'Cairo, Egypt', jobType: 'Full-time', experienceLevel: 'Senior', skills: ['C++'], postedBy: testUserId }
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
      const testUserId = new mongoose.Types.ObjectId();
      const jobs = [
        { title: 'Job 1', description: 'Test desc', requirements: 'Test req', jobType: 'Full-time', status: 'Open', company: { name: 'Company A' }, location: 'Cairo, Egypt', salary: { min: 5000 }, experienceLevel: 'Mid', skills: ['JavaScript'], postedBy: testUserId },
        { title: 'Job 2', description: 'Test desc', requirements: 'Test req', jobType: 'Part-time', status: 'Open', company: { name: 'Company B' }, location: 'Cairo, Egypt', salary: { min: 3000 }, experienceLevel: 'Entry', skills: ['Python'], postedBy: testUserId },
        { title: 'Job 3', description: 'Test desc', requirements: 'Test req', jobType: 'Contract', status: 'Open', company: { name: 'Company C' }, location: 'Cairo, Egypt', salary: { min: 6000 }, experienceLevel: 'Mid', skills: ['Java'], postedBy: testUserId },
        { title: 'Job 4', description: 'Test desc', requirements: 'Test req', jobType: 'Full-time', status: 'Open', company: { name: 'Company D' }, location: 'Cairo, Egypt', salary: { min: 5500 }, experienceLevel: 'Mid', skills: ['PHP'], postedBy: testUserId },
        { title: 'Job 5', description: 'Test desc', requirements: 'Test req', jobType: 'Temporary', status: 'Open', company: { name: 'Company E' }, location: 'Cairo, Egypt', salary: { min: 7000 }, experienceLevel: 'Senior', skills: ['C++'], postedBy: testUserId }
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
      const testUserId = new mongoose.Types.ObjectId();
      const jobs = [
        { title: 'Job 1', description: 'Test desc', requirements: 'Test req', jobType: 'Full-time', experienceLevel: 'Mid', salary: { min: 5000 }, status: 'Open', company: { name: 'Company A' }, location: 'Cairo, Egypt', skills: ['JavaScript', 'React'], postedBy: testUserId },
        { title: 'Job 2', description: 'Test desc', requirements: 'Test req', jobType: 'Part-time', experienceLevel: 'Entry', salary: { min: 3000 }, status: 'Open', company: { name: 'Company B' }, location: 'Alexandria, Egypt', skills: ['Python'], postedBy: testUserId },
        { title: 'Job 3', description: 'Test desc', requirements: 'Test req', jobType: 'Full-time', experienceLevel: 'Mid', salary: { min: 6000 }, status: 'Open', company: { name: 'Company C' }, location: 'Cairo, Egypt', skills: ['JavaScript', 'Node.js'], postedBy: testUserId },
        { title: 'Job 4', description: 'Test desc', requirements: 'Test req', jobType: 'Contract', experienceLevel: 'Senior', salary: { min: 10000 }, status: 'Open', company: { name: 'Company D' }, location: 'Cairo, Egypt', skills: ['Java'], postedBy: testUserId },
        { title: 'Job 5', description: 'Test desc', requirements: 'Test req', jobType: 'Full-time', experienceLevel: 'Mid', salary: { min: 5500 }, status: 'Open', company: { name: 'Company E' }, location: 'Cairo, Egypt', skills: ['JavaScript', 'Vue'], postedBy: testUserId }
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
      const testUserId = new mongoose.Types.ObjectId();
      const jobs = [
        { title: 'Job 1', description: 'Test desc', requirements: 'Test req', skills: ['JavaScript', 'React', 'Node.js'], status: 'Open', company: { name: 'Company A' }, location: 'Cairo, Egypt', salary: { min: 5000 }, jobType: 'Full-time', experienceLevel: 'Mid', postedBy: testUserId },
        { title: 'Job 2', description: 'Test desc', requirements: 'Test req', skills: ['JavaScript', 'React'], status: 'Open', company: { name: 'Company B' }, location: 'Cairo, Egypt', salary: { min: 4000 }, jobType: 'Full-time', experienceLevel: 'Entry', postedBy: testUserId },
        { title: 'Job 3', description: 'Test desc', requirements: 'Test req', skills: ['JavaScript', 'Node.js'], status: 'Open', company: { name: 'Company C' }, location: 'Cairo, Egypt', salary: { min: 6000 }, jobType: 'Full-time', experienceLevel: 'Mid', postedBy: testUserId },
        { title: 'Job 4', description: 'Test desc', requirements: 'Test req', skills: ['React', 'Node.js'], status: 'Open', company: { name: 'Company D' }, location: 'Cairo, Egypt', salary: { min: 5500 }, jobType: 'Full-time', experienceLevel: 'Mid', postedBy: testUserId },
        { title: 'Job 5', description: 'Test desc', requirements: 'Test req', skills: ['Python', 'Django'], status: 'Open', company: { name: 'Company E' }, location: 'Cairo, Egypt', salary: { min: 5000 }, jobType: 'Full-time', experienceLevel: 'Mid', postedBy: testUserId }
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
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);

      // إنشاء وظائف بتواريخ مختلفة
      const testUserId = new mongoose.Types.ObjectId();
      const jobs = [
        { title: 'Job 1', description: 'Test desc', requirements: 'Test req', createdAt: now, status: 'Open', company: { name: 'Company A' }, location: 'Cairo, Egypt', salary: { min: 5000 }, jobType: 'Full-time', experienceLevel: 'Mid', skills: ['JavaScript'], postedBy: testUserId },
        { title: 'Job 2', description: 'Test desc', requirements: 'Test req', createdAt: yesterday, status: 'Open', company: { name: 'Company B' }, location: 'Cairo, Egypt', salary: { min: 4000 }, jobType: 'Full-time', experienceLevel: 'Entry', skills: ['Python'], postedBy: testUserId },
        { title: 'Job 3', description: 'Test desc', requirements: 'Test req', createdAt: threeDaysAgo, status: 'Open', company: { name: 'Company C' }, location: 'Cairo, Egypt', salary: { min: 6000 }, jobType: 'Full-time', experienceLevel: 'Mid', skills: ['Java'], postedBy: testUserId },
        { title: 'Job 4', description: 'Test desc', requirements: 'Test req', createdAt: lastMonth, status: 'Open', company: { name: 'Company D' }, location: 'Cairo, Egypt', salary: { min: 5500 }, jobType: 'Full-time', experienceLevel: 'Mid', skills: ['PHP'], postedBy: testUserId }
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
      const testUserId = new mongoose.Types.ObjectId();
      const jobs = [
        { title: 'Job 1', description: 'Test desc', requirements: 'Test req', jobType: 'Full-time', status: 'Open', company: { name: 'Company A' }, location: 'Cairo, Egypt', salary: { min: 5000 }, experienceLevel: 'Mid', skills: ['JavaScript'], postedBy: testUserId },
        { title: 'Job 2', description: 'Test desc', requirements: 'Test req', jobType: 'Part-time', status: 'Open', company: { name: 'Company B' }, location: 'Cairo, Egypt', salary: { min: 3000 }, experienceLevel: 'Entry', skills: ['Python'], postedBy: testUserId },
        { title: 'Job 3', description: 'Test desc', requirements: 'Test req', jobType: 'Full-time', status: 'Open', company: { name: 'Company C' }, location: 'Cairo, Egypt', salary: { min: 6000 }, experienceLevel: 'Mid', skills: ['Java'], postedBy: testUserId }
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
      const testUserId = new mongoose.Types.ObjectId();
      const jobs = [
        { title: 'Job 1', description: 'Test desc', requirements: 'Test req', jobType: 'Full-time', experienceLevel: 'Entry', status: 'Open', company: { name: 'Company A' }, location: 'Cairo, Egypt', salary: { min: 3000 }, skills: ['JavaScript'], postedBy: testUserId },
        { title: 'Job 2', description: 'Test desc', requirements: 'Test req', jobType: 'Full-time', experienceLevel: 'Mid', status: 'Open', company: { name: 'Company B' }, location: 'Cairo, Egypt', salary: { min: 5000 }, skills: ['Python'], postedBy: testUserId },
        { title: 'Job 3', description: 'Test desc', requirements: 'Test req', jobType: 'Part-time', experienceLevel: 'Entry', status: 'Open', company: { name: 'Company C' }, location: 'Cairo, Egypt', salary: { min: 2000 }, skills: ['Java'], postedBy: testUserId }
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
      const testUserId = new mongoose.Types.ObjectId();
      const jobs = [
        { 
          title: 'JavaScript Developer', 
          description: 'Frontend developer needed', 
          requirements: 'Test req', 
          jobType: 'Full-time', 
          status: 'Open', 
          company: { name: 'Company A' }, 
          location: 'Cairo, Egypt', 
          salary: { min: 5000 }, 
          experienceLevel: 'Mid', 
          skills: ['JavaScript', 'React'], 
          postedBy: testUserId 
        },
        { 
          title: 'Python Developer', 
          description: 'Backend developer needed', 
          requirements: 'Test req', 
          jobType: 'Full-time', 
          status: 'Open', 
          company: { name: 'Company B' }, 
          location: 'Cairo, Egypt', 
          salary: { min: 6000 }, 
          experienceLevel: 'Mid', 
          skills: ['Python', 'Django'], 
          postedBy: testUserId 
        },
        { 
          title: 'Node.js Engineer', 
          description: 'Full stack developer needed with JavaScript', 
          requirements: 'Test req', 
          jobType: 'Contract', 
          status: 'Open', 
          company: { name: 'Company C' }, 
          location: 'Cairo, Egypt', 
          salary: { min: 7000 }, 
          experienceLevel: 'Senior', 
          skills: ['JavaScript', 'Node.js'], 
          postedBy: testUserId 
        }
      ];

      await JobPosting.insertMany(jobs);

      // البحث النصي مع فلتر (لا حاجة لإنشاء index - موجود مسبقاً في النموذج)
      const result = await searchService.textSearch('JavaScript', {
        type: 'jobs',
        page: 1,
        limit: 20,
        filters: {
          workType: ['Full-time']
        }
      });

      // يجب أن يعيد Job 1 فقط (1 وظيفة Full-time تحتوي على JavaScript)
      expect(result.total).toBe(1);
      expect(result.results.length).toBe(1);
      if (result.results.length > 0) {
        expect(result.results[0].title).toBe('JavaScript Developer');
      }
    });
  });
});
