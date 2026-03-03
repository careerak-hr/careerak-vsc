/**
 * اختبارات الأداء لنظام البحث والفلترة المتقدم
 * 
 * المؤشرات المطلوبة (من requirements.md):
 * 1. سرعة البحث: < 500ms
 * 2. معدل استخدام الفلاتر: > 60%
 * 3. معدل حفظ عمليات البحث: > 30%
 * 4. معدل تفعيل التنبيهات: > 20%
 * 5. معدل استخدام Map View: > 15%
 */

const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const SearchService = require('../src/services/searchService');
const FilterService = require('../src/services/filterService');

describe('Search Performance Tests', () => {
  let searchService;
  let filterService;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
    }

    searchService = new SearchService();
    filterService = new FilterService();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('KPI 1: سرعة البحث < 500ms', () => {
    it('should return search results within 500ms', async () => {
      const start = Date.now();
      
      const results = await searchService.search({
        query: 'developer',
        limit: 20
      });
      
      const duration = Date.now() - start;
      
      console.log(`⏱️  Search duration: ${duration}ms`);
      expect(duration).toBeLessThan(500);
    });

    it('should handle text search efficiently', async () => {
      const start = Date.now();
      
      const results = await JobPosting.find({
        $text: { $search: 'javascript react' }
      }).limit(20).lean();
      
      const duration = Date.now() - start;
      
      console.log(`⏱️  Text search duration: ${duration}ms`);
      expect(duration).toBeLessThan(500);
    });

    it('should handle filtered search within 500ms', async () => {
      const start = Date.now();
      
      const results = await searchService.search({
        query: 'developer',
        filters: {
          location: 'Cairo',
          salaryMin: 5000,
          workType: ['full-time', 'remote']
        },
        limit: 20
      });
      
      const duration = Date.now() - start;
      
      console.log(`⏱️  Filtered search duration: ${duration}ms`);
      expect(duration).toBeLessThan(500);
    });

    it('should handle concurrent searches efficiently', async () => {
      const queries = [
        'developer',
        'designer',
        'manager',
        'engineer',
        'analyst'
      ];

      const start = Date.now();
      
      const searches = queries.map(q => 
        searchService.search({ query: q, limit: 10 })
      );
      
      await Promise.all(searches);
      
      const duration = Date.now() - start;
      const avgDuration = duration / queries.length;
      
      console.log(`⏱️  Concurrent searches avg duration: ${avgDuration}ms`);
      expect(avgDuration).toBeLessThan(500);
    });

    it('should handle autocomplete within 300ms', async () => {
      const start = Date.now();
      
      const suggestions = await searchService.getAutocomplete('dev', 10);
      
      const duration = Date.now() - start;
      
      console.log(`⏱️  Autocomplete duration: ${duration}ms`);
      expect(duration).toBeLessThan(300);
    });
  });

  describe('KPI 2-5: Usage Metrics (Baseline Tests)', () => {
    it('should track filter usage', async () => {
      // هذا اختبار baseline - في الإنتاج سيتم قياسه من Analytics
      const searchWithFilters = await searchService.search({
        query: 'developer',
        filters: {
          location: 'Cairo',
          salaryMin: 5000
        }
      });

      const searchWithoutFilters = await searchService.search({
        query: 'developer'
      });

      // التحقق من أن الفلاتر تعمل
      expect(searchWithFilters.results).toBeDefined();
      expect(searchWithoutFilters.results).toBeDefined();
      
      console.log('✅ Filter tracking baseline established');
    });

    it('should support saved searches', async () => {
      // هذا اختبار baseline - في الإنتاج سيتم قياسه من قاعدة البيانات
      const SavedSearch = require('../src/models/SavedSearch');
      
      const savedSearch = new SavedSearch({
        userId: new mongoose.Types.ObjectId(),
        name: 'Test Search',
        searchType: 'jobs',
        searchParams: {
          query: 'developer',
          location: 'Cairo'
        }
      });

      await savedSearch.save();
      
      expect(savedSearch._id).toBeDefined();
      
      await SavedSearch.deleteOne({ _id: savedSearch._id });
      
      console.log('✅ Saved search functionality verified');
    });

    it('should support search alerts', async () => {
      // هذا اختبار baseline - في الإنتاج سيتم قياسه من قاعدة البيانات
      const SearchAlert = require('../src/models/SearchAlert');
      
      const alert = new SearchAlert({
        userId: new mongoose.Types.ObjectId(),
        savedSearchId: new mongoose.Types.ObjectId(),
        frequency: 'instant',
        notificationMethod: 'push',
        isActive: true
      });

      await alert.save();
      
      expect(alert._id).toBeDefined();
      
      await SearchAlert.deleteOne({ _id: alert._id });
      
      console.log('✅ Alert functionality verified');
    });
  });

  describe('Database Query Performance', () => {
    it('should use indexes efficiently', async () => {
      const start = Date.now();
      
      // استعلام يستخدم text index
      const results = await JobPosting.find({
        $text: { $search: 'developer' }
      }).explain('executionStats');
      
      const duration = Date.now() - start;
      
      console.log(`⏱️  Indexed query duration: ${duration}ms`);
      console.log(`📊 Documents examined: ${results.executionStats.totalDocsExamined}`);
      console.log(`📊 Documents returned: ${results.executionStats.nReturned}`);
      
      // التحقق من أن الاستعلام يستخدم index
      expect(results.executionStats.executionSuccess).toBe(true);
      expect(duration).toBeLessThan(500);
    });

    it('should use lean() for better performance', async () => {
      const startWithLean = Date.now();
      const resultsWithLean = await JobPosting.find({}).limit(100).lean();
      const durationWithLean = Date.now() - startWithLean;

      const startWithoutLean = Date.now();
      const resultsWithoutLean = await JobPosting.find({}).limit(100);
      const durationWithoutLean = Date.now() - startWithoutLean;

      console.log(`⏱️  With lean(): ${durationWithLean}ms`);
      console.log(`⏱️  Without lean(): ${durationWithoutLean}ms`);
      console.log(`📈 Performance improvement: ${((durationWithoutLean - durationWithLean) / durationWithoutLean * 100).toFixed(1)}%`);

      // lean() يجب أن يكون أسرع
      expect(durationWithLean).toBeLessThan(durationWithoutLean);
    });

    it('should use select() to limit fields', async () => {
      const startWithSelect = Date.now();
      const resultsWithSelect = await JobPosting
        .find({})
        .select('title company.name location')
        .limit(100)
        .lean();
      const durationWithSelect = Date.now() - startWithSelect;

      const startWithoutSelect = Date.now();
      const resultsWithoutSelect = await JobPosting
        .find({})
        .limit(100)
        .lean();
      const durationWithoutSelect = Date.now() - startWithoutSelect;

      console.log(`⏱️  With select(): ${durationWithSelect}ms`);
      console.log(`⏱️  Without select(): ${durationWithoutSelect}ms`);

      // select() يجب أن يكون أسرع
      expect(durationWithSelect).toBeLessThanOrEqual(durationWithoutSelect);
    });
  });

  describe('Pagination Performance', () => {
    it('should paginate efficiently', async () => {
      const start = Date.now();
      
      const results = await JobPosting
        .find({})
        .sort({ createdAt: -1 })
        .skip(0)
        .limit(20)
        .lean();
      
      const duration = Date.now() - start;
      
      console.log(`⏱️  Pagination duration: ${duration}ms`);
      expect(duration).toBeLessThan(500);
    });

    it('should handle deep pagination', async () => {
      const start = Date.now();
      
      // صفحة 10 (skip 200)
      const results = await JobPosting
        .find({})
        .sort({ createdAt: -1 })
        .skip(200)
        .limit(20)
        .lean();
      
      const duration = Date.now() - start;
      
      console.log(`⏱️  Deep pagination duration: ${duration}ms`);
      expect(duration).toBeLessThan(1000); // نسمح بوقت أطول للصفحات العميقة
    });
  });

  describe('Filter Performance', () => {
    it('should filter by salary range efficiently', async () => {
      const start = Date.now();
      
      const results = await filterService.filterBySalary(
        await JobPosting.find({}).lean(),
        5000,
        10000
      );
      
      const duration = Date.now() - start;
      
      console.log(`⏱️  Salary filter duration: ${duration}ms`);
      expect(duration).toBeLessThan(100);
    });

    it('should filter by skills efficiently', async () => {
      const start = Date.now();
      
      const results = await filterService.filterBySkills(
        await JobPosting.find({}).lean(),
        ['JavaScript', 'React'],
        'AND'
      );
      
      const duration = Date.now() - start;
      
      console.log(`⏱️  Skills filter duration: ${duration}ms`);
      expect(duration).toBeLessThan(100);
    });

    it('should apply multiple filters efficiently', async () => {
      const start = Date.now();
      
      let results = await JobPosting.find({}).lean();
      results = filterService.filterBySalary(results, 5000, 10000);
      results = filterService.filterByLocation(results, 'Cairo');
      results = filterService.filterByWorkType(results, ['full-time']);
      
      const duration = Date.now() - start;
      
      console.log(`⏱️  Multiple filters duration: ${duration}ms`);
      expect(duration).toBeLessThan(500);
    });
  });
});
