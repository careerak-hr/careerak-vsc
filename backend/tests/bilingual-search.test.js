/**
 * اختبارات دعم البحث بالعربية والإنجليزية
 * Feature: advanced-search-filter
 * Property 3: Bilingual Search Support
 * Validates: Requirements 1.4
 */

const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const searchService = require('../src/services/searchService');

describe('Bilingual Search Support', () => {
  let testUserId;
  let arabicJob;
  let englishJob;
  let mixedJob;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    testUserId = new mongoose.Types.ObjectId();
  });

  beforeEach(async () => {
    // تنظيف البيانات قبل كل اختبار
    await JobPosting.deleteMany({});

    // إنشاء وظائف اختبارية
    arabicJob = await JobPosting.create({
      title: 'مطور ويب',
      description: 'نبحث عن مطور ويب محترف للعمل على مشاريع متنوعة',
      requirements: 'خبرة في تطوير المواقع',
      skills: ['جافاسكريبت', 'رياكت', 'نود جي اس'],
      company: { name: 'شركة التقنية', size: 'Medium' },
      location: 'القاهرة',
      salary: { min: 5000, max: 8000 },
      jobType: 'Full-time',
      experienceLevel: 'Mid',
      postedBy: testUserId,
      status: 'Open'
    });

    englishJob = await JobPosting.create({
      title: 'Web Developer',
      description: 'Looking for a professional web developer to work on various projects',
      requirements: 'Experience in web development',
      skills: ['JavaScript', 'React', 'Node.js'],
      company: { name: 'Tech Company', size: 'Medium' },
      location: 'Cairo',
      salary: { min: 5000, max: 8000 },
      jobType: 'Full-time',
      experienceLevel: 'Mid',
      postedBy: testUserId,
      status: 'Open'
    });

    mixedJob = await JobPosting.create({
      title: 'Full Stack Developer - مطور متكامل',
      description: 'We are looking for a full stack developer / نبحث عن مطور متكامل',
      requirements: 'Experience with frontend and backend / خبرة في الواجهة الأمامية والخلفية',
      skills: ['JavaScript', 'جافاسكريبت', 'React', 'رياكت', 'MongoDB'],
      company: { name: 'Global Tech / التقنية العالمية', size: 'Large' },
      location: 'Dubai / دبي',
      salary: { min: 8000, max: 12000 },
      jobType: 'Full-time',
      experienceLevel: 'Senior',
      postedBy: testUserId,
      status: 'Open'
    });

    // الانتظار قليلاً للتأكد من فهرسة النصوص
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await JobPosting.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Arabic Search', () => {
    test('should find jobs with Arabic query in title', async () => {
      const results = await searchService.textSearch('مطور', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      expect(results.results.length).toBeGreaterThan(0);
      expect(results.total).toBeGreaterThan(0);
      
      // التحقق من أن النتائج تحتوي على الوظائف العربية أو المختلطة
      const foundArabic = results.results.some(job => 
        job.title.includes('مطور')
      );
      expect(foundArabic).toBe(true);
    });

    test('should find jobs with Arabic query in description', async () => {
      const results = await searchService.textSearch('نبحث', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      expect(results.results.length).toBeGreaterThan(0);
      const foundArabic = results.results.some(job => 
        job.description && job.description.includes('نبحث')
      );
      expect(foundArabic).toBe(true);
    });

    test('should find jobs with Arabic query in skills', async () => {
      const results = await searchService.textSearch('جافاسكريبت', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      expect(results.results.length).toBeGreaterThan(0);
      const foundArabic = results.results.some(job => 
        job.skills && job.skills.some(skill => skill.includes('جافاسكريبت'))
      );
      expect(foundArabic).toBe(true);
    });

    test('should find jobs with Arabic query in company name', async () => {
      const results = await searchService.textSearch('التقنية', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      expect(results.results.length).toBeGreaterThan(0);
      const foundArabic = results.results.some(job => 
        job.company && job.company.name && job.company.name.includes('التقنية')
      );
      expect(foundArabic).toBe(true);
    });
  });

  describe('English Search', () => {
    test('should find jobs with English query in title', async () => {
      const results = await searchService.textSearch('Developer', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      expect(results.results.length).toBeGreaterThan(0);
      expect(results.total).toBeGreaterThan(0);
      
      const foundEnglish = results.results.some(job => 
        job.title.toLowerCase().includes('developer')
      );
      expect(foundEnglish).toBe(true);
    });

    test('should find jobs with English query in description', async () => {
      const results = await searchService.textSearch('professional', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      expect(results.results.length).toBeGreaterThan(0);
      const foundEnglish = results.results.some(job => 
        job.description && job.description.toLowerCase().includes('professional')
      );
      expect(foundEnglish).toBe(true);
    });

    test('should find jobs with English query in skills', async () => {
      const results = await searchService.textSearch('JavaScript', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      expect(results.results.length).toBeGreaterThan(0);
      const foundEnglish = results.results.some(job => 
        job.skills && job.skills.some(skill => 
          skill.toLowerCase().includes('javascript')
        )
      );
      expect(foundEnglish).toBe(true);
    });

    test('should find jobs with English query in company name', async () => {
      const results = await searchService.textSearch('Tech', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      expect(results.results.length).toBeGreaterThan(0);
      const foundEnglish = results.results.some(job => 
        job.company && job.company.name && 
        job.company.name.toLowerCase().includes('tech')
      );
      expect(foundEnglish).toBe(true);
    });
  });

  describe('Mixed Language Search', () => {
    test('should handle mixed Arabic and English in same query', async () => {
      const results = await searchService.textSearch('مطور Developer', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      expect(results.results.length).toBeGreaterThan(0);
      // يجب أن يجد الوظائف التي تحتوي على أي من الكلمتين
      expect(results.total).toBeGreaterThanOrEqual(1);
    });

    test('should find mixed language job with Arabic query', async () => {
      const results = await searchService.textSearch('متكامل', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      expect(results.results.length).toBeGreaterThan(0);
      const foundMixed = results.results.some(job => 
        job.title.includes('متكامل')
      );
      expect(foundMixed).toBe(true);
    });

    test('should find mixed language job with English query', async () => {
      const results = await searchService.textSearch('Full Stack', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      expect(results.results.length).toBeGreaterThan(0);
      const foundMixed = results.results.some(job => 
        job.title.toLowerCase().includes('full stack')
      );
      expect(foundMixed).toBe(true);
    });
  });

  describe('Case Insensitivity', () => {
    test('should be case insensitive for English queries', async () => {
      const lowerResults = await searchService.textSearch('developer', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      const upperResults = await searchService.textSearch('DEVELOPER', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      const mixedResults = await searchService.textSearch('DeVeLoPeR', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      // يجب أن تعطي نفس عدد النتائج تقريباً
      expect(lowerResults.total).toBe(upperResults.total);
      expect(lowerResults.total).toBe(mixedResults.total);
    });
  });

  describe('Empty and Invalid Queries', () => {
    test('should handle empty query gracefully', async () => {
      await expect(async () => {
        await searchService.textSearch('', {
          type: 'jobs',
          page: 1,
          limit: 10
        });
      }).rejects.toThrow();
    });

    test('should handle whitespace-only query gracefully', async () => {
      await expect(async () => {
        await searchService.textSearch('   ', {
          type: 'jobs',
          page: 1,
          limit: 10
        });
      }).rejects.toThrow();
    });

    test('should handle special characters in query', async () => {
      const results = await searchService.textSearch('C++', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      // يجب أن يعمل بدون أخطاء حتى لو لم يجد نتائج
      expect(results).toBeDefined();
      expect(results.results).toBeDefined();
    });
  });

  describe('Pagination', () => {
    test('should support pagination for Arabic results', async () => {
      // إنشاء وظائف إضافية
      for (let i = 0; i < 15; i++) {
        await JobPosting.create({
          title: `مطور ويب ${i}`,
          description: 'وصف الوظيفة',
          requirements: 'المتطلبات',
          skills: ['جافاسكريبت'],
          company: { name: 'شركة', size: 'Medium' },
          location: 'القاهرة',
          salary: { min: 5000, max: 8000 },
          jobType: 'Full-time',
          experienceLevel: 'Mid',
          postedBy: testUserId,
          status: 'Open'
        });
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const page1 = await searchService.textSearch('مطور', {
        type: 'jobs',
        page: 1,
        limit: 10
      });

      const page2 = await searchService.textSearch('مطور', {
        type: 'jobs',
        page: 2,
        limit: 10
      });

      expect(page1.results.length).toBeLessThanOrEqual(10);
      expect(page1.page).toBe(1);
      expect(page2.page).toBe(2);
      expect(page1.total).toBeGreaterThan(10);
    });
  });

  describe('Sorting', () => {
    test('should support relevance sorting for Arabic queries', async () => {
      const results = await searchService.textSearch('مطور', {
        type: 'jobs',
        page: 1,
        limit: 10,
        sort: 'relevance'
      });

      expect(results.results.length).toBeGreaterThan(0);
      // النتائج الأكثر صلة يجب أن تكون أولاً
    });

    test('should support date sorting for Arabic queries', async () => {
      const results = await searchService.textSearch('مطور', {
        type: 'jobs',
        page: 1,
        limit: 10,
        sort: 'date'
      });

      expect(results.results.length).toBeGreaterThan(0);
      
      // التحقق من الترتيب حسب التاريخ
      if (results.results.length > 1) {
        const dates = results.results.map(job => new Date(job.createdAt));
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
        }
      }
    });
  });
});
