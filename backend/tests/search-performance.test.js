const searchService = require('../src/services/searchService');
const JobPosting = require('../src/models/JobPosting');
const mongoose = require('mongoose');
const { performance } = require('perf_hooks');

/**
 * اختبارات الأداء لنظام البحث
 * المتطلب: النتائج يجب أن تظهر خلال أقل من 500ms
 */

describe('Search Performance Tests', () => {
  let testJobs = [];

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // إنشاء بيانات اختبار
    await JobPosting.deleteMany({});
    
    const jobsData = [];
    for (let i = 0; i < 100; i++) {
      jobsData.push({
        title: `Software Developer ${i}`,
        description: `Looking for a talented developer with experience in JavaScript, React, Node.js`,
        requirements: `Bachelor's degree in Computer Science or related field`,
        postingType: 'Permanent Job',
        priceType: 'Salary Based',
        salary: { min: 3000 + (i * 100), max: 5000 + (i * 100) },
        location: i % 2 === 0 ? 'Cairo' : 'Alexandria',
        jobType: ['Full-time', 'Part-time', 'Contract'][i % 3],
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        company: {
          name: `Tech Company ${i}`,
          size: ['Small', 'Medium', 'Large'][i % 3]
        },
        experienceLevel: ['Entry', 'Mid', 'Senior', 'Expert'][i % 4],
        postedBy: new mongoose.Types.ObjectId(),
        status: 'Open',
        createdAt: new Date(Date.now() - (i * 86400000)) // تواريخ مختلفة
      });
    }

    testJobs = await JobPosting.insertMany(jobsData);
  });

  afterAll(async () => {
    // تنظيف البيانات
    await JobPosting.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Text Search Performance', () => {
    test('should return results in less than 500ms for simple query', async () => {
      const startTime = performance.now();
      
      const result = await searchService.textSearch('developer', {
        page: 1,
        limit: 10
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.data.results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(500); // يجب أن يكون أقل من 500ms
      
      console.log(`✓ Text search completed in ${duration.toFixed(2)}ms`);
    });

    test('should return results in less than 500ms for Arabic query', async () => {
      // إضافة وظيفة بالعربية
      await JobPosting.create({
        title: 'مطور برمجيات',
        description: 'نبحث عن مطور برمجيات محترف',
        requirements: 'خبرة في JavaScript و React',
        postingType: 'Permanent Job',
        priceType: 'Salary Based',
        salary: { min: 4000, max: 6000 },
        location: 'القاهرة',
        jobType: 'Full-time',
        skills: ['JavaScript', 'React'],
        company: { name: 'شركة تقنية', size: 'Medium' },
        experienceLevel: 'Mid',
        postedBy: new mongoose.Types.ObjectId(),
        status: 'Open'
      });

      const startTime = performance.now();
      
      const result = await searchService.textSearch('مطور', {
        page: 1,
        limit: 10
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Arabic search completed in ${duration.toFixed(2)}ms`);
    });

    test('should return results in less than 500ms with pagination', async () => {
      const startTime = performance.now();
      
      const result = await searchService.textSearch('JavaScript', {
        page: 2,
        limit: 20
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Paginated search completed in ${duration.toFixed(2)}ms`);
    });

    test('should return results in less than 500ms with sorting', async () => {
      const startTime = performance.now();
      
      const result = await searchService.textSearch('developer', {
        page: 1,
        limit: 10,
        sort: 'salary'
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Sorted search completed in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Multi-field Search Performance', () => {
    test('should search in multiple fields in less than 500ms', async () => {
      const startTime = performance.now();
      
      const result = await searchService.searchInFields('JavaScript', 
        ['title', 'description', 'skills'], 
        { page: 1, limit: 10 }
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.data.results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Multi-field search completed in ${duration.toFixed(2)}ms`);
    });

    test('should search in company name in less than 500ms', async () => {
      const startTime = performance.now();
      
      const result = await searchService.searchInFields('Tech Company', 
        ['company.name'], 
        { page: 1, limit: 10 }
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Company name search completed in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Advanced Search with Filters Performance', () => {
    test('should search with filters in less than 500ms', async () => {
      const startTime = performance.now();
      
      const result = await searchService.searchWithFilters('developer', {
        location: 'Cairo',
        jobType: ['Full-time'],
        experienceLevel: ['Mid', 'Senior'],
        salaryMin: 4000,
        salaryMax: 8000
      }, {
        page: 1,
        limit: 10
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Filtered search completed in ${duration.toFixed(2)}ms`);
    });

    test('should search with skills filter (AND logic) in less than 500ms', async () => {
      const startTime = performance.now();
      
      const result = await searchService.searchWithFilters('', {
        skills: ['JavaScript', 'React'],
        skillsLogic: 'AND'
      }, {
        page: 1,
        limit: 10
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Skills AND search completed in ${duration.toFixed(2)}ms`);
    });

    test('should search with skills filter (OR logic) in less than 500ms', async () => {
      const startTime = performance.now();
      
      const result = await searchService.searchWithFilters('', {
        skills: ['JavaScript', 'Python', 'Java'],
        skillsLogic: 'OR'
      }, {
        page: 1,
        limit: 10
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Skills OR search completed in ${duration.toFixed(2)}ms`);
    });

    test('should search with date filter in less than 500ms', async () => {
      const startTime = performance.now();
      
      const result = await searchService.searchWithFilters('developer', {
        datePosted: 'week'
      }, {
        page: 1,
        limit: 10
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Date filtered search completed in ${duration.toFixed(2)}ms`);
    });

    test('should search with multiple filters in less than 500ms', async () => {
      const startTime = performance.now();
      
      const result = await searchService.searchWithFilters('developer', {
        location: 'Cairo',
        jobType: ['Full-time', 'Part-time'],
        experienceLevel: ['Mid', 'Senior'],
        salaryMin: 3000,
        salaryMax: 10000,
        skills: ['JavaScript', 'React'],
        skillsLogic: 'OR',
        companySize: ['Medium', 'Large'],
        datePosted: 'month'
      }, {
        page: 1,
        limit: 10,
        sort: 'relevance'
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Complex filtered search completed in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Large Dataset Performance', () => {
    test('should handle large result sets in less than 500ms', async () => {
      const startTime = performance.now();
      
      const result = await searchService.textSearch('developer', {
        page: 1,
        limit: 50 // نتائج أكثر
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Large result set search completed in ${duration.toFixed(2)}ms`);
    });

    test('should handle deep pagination in less than 500ms', async () => {
      const startTime = performance.now();
      
      const result = await searchService.textSearch('developer', {
        page: 5, // صفحة بعيدة
        limit: 10
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Deep pagination search completed in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Edge Cases Performance', () => {
    test('should handle empty query gracefully in less than 500ms', async () => {
      const startTime = performance.now();
      
      const result = await searchService.textSearch('', {
        page: 1,
        limit: 10
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.data.results.length).toBe(0);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ Empty query handled in ${duration.toFixed(2)}ms`);
    });

    test('should handle no results query in less than 500ms', async () => {
      const startTime = performance.now();
      
      const result = await searchService.textSearch('xyzabc123nonexistent', {
        page: 1,
        limit: 10
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.data.results.length).toBe(0);
      expect(duration).toBeLessThan(500);
      
      console.log(`✓ No results query handled in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Performance Summary', () => {
    test('should provide performance summary', async () => {
      const iterations = 10;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await searchService.textSearch('developer', { page: 1, limit: 10 });
        const endTime = performance.now();
        durations.push(endTime - startTime);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / iterations;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      console.log('\n📊 Performance Summary:');
      console.log(`   Average: ${avgDuration.toFixed(2)}ms`);
      console.log(`   Min: ${minDuration.toFixed(2)}ms`);
      console.log(`   Max: ${maxDuration.toFixed(2)}ms`);
      console.log(`   Target: < 500ms`);
      console.log(`   Status: ${maxDuration < 500 ? '✅ PASSED' : '❌ FAILED'}\n`);

      expect(avgDuration).toBeLessThan(500);
      expect(maxDuration).toBeLessThan(500);
    });
  });
});
